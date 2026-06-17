// @ts-nocheck — Deno edge function (service-role). Scheduled scanner.
// Finds invoices that are: status != 'Paid', past due_date by org.auto_notice_days,
// belong to an org with auto_notice_enabled = true, and have NO legal_notice yet.
// For each match, drafts an AI demand notice via ai-legal-notice and inserts it as 'draft'.
// Designed to run daily via pg_cron OR manually from Settings → "Run overdue scan now".

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const LOVABLE_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!SUPABASE_URL || !SERVICE_KEY) return json({ error: "Supabase env missing" }, 500);
  if (!LOVABLE_KEY) return json({ error: "LOVABLE_API_KEY missing" }, 500);

  const admin = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });

  // Allow per-org scoping for manual runs from settings.
  let scopeOrgId: string | null = null;
  try { const b = await req.json(); if (b?.orgId) scopeOrgId = String(b.orgId); } catch { /* GET / no body */ }

  // 1. Load eligible orgs.
  let orgQ = admin.from("organizations").select("id, name, legal_name, gstin, state, address_line1, city, auto_notice_enabled, auto_notice_days").eq("auto_notice_enabled", true);
  if (scopeOrgId) orgQ = orgQ.eq("id", scopeOrgId);
  const { data: orgs, error: orgErr } = await orgQ;
  if (orgErr) return json({ error: orgErr.message }, 500);
  if (!orgs?.length) return json({ scanned: 0, drafted: 0, message: "No orgs with auto-notice enabled" });

  let drafted = 0, scanned = 0, skipped = 0;
  const errors: string[] = [];

  for (const org of orgs) {
    const days = org.auto_notice_days ?? 30;
    const cutoff = new Date(Date.now() - days * 86400000).toISOString().slice(0, 10);

    const { data: invoices, error: invErr } = await admin
      .from("invoices")
      .select("id, number, client_id, status, due_date, issued_date, total, amount_paid, attached_lawyer_id")
      .eq("org_id", org.id)
      .neq("status", "Paid")
      .lte("due_date", cutoff);
    if (invErr) { errors.push(`${org.id}: ${invErr.message}`); continue; }
    if (!invoices?.length) continue;
    scanned += invoices.length;

    // Pre-fetch any existing notices for these invoices.
    const ids = invoices.map((i: any) => i.id);
    const { data: existing } = await admin.from("legal_notices").select("invoice_id").in("invoice_id", ids);
    const hasNotice = new Set((existing ?? []).map((n: any) => n.invoice_id));

    // Pick a default lawyer (first active one visible to service role).
    const { data: lawyers } = await admin.from("lawyers").select("id, full_name, bar_council_no, email").eq("active", true).limit(1);
    const defaultLawyer = lawyers?.[0];

    for (const inv of invoices) {
      if (hasNotice.has(inv.id)) { skipped++; continue; }
      const lawyerId = inv.attached_lawyer_id || defaultLawyer?.id;
      if (!lawyerId) { skipped++; continue; }
      const lawyer = inv.attached_lawyer_id
        ? (await admin.from("lawyers").select("id, full_name, bar_council_no, email").eq("id", inv.attached_lawyer_id).maybeSingle()).data
        : defaultLawyer;

      const { data: client } = await admin.from("clients").select("name, company_name").eq("id", inv.client_id).maybeSingle();
      const { data: items } = await admin.from("invoice_items").select("description, quantity, rate").eq("invoice_id", inv.id);
      const total = Number(inv.total ?? 0);
      const amountDue = total - Number(inv.amount_paid ?? 0);
      const daysOverdue = Math.max(0, Math.floor((Date.now() - new Date(inv.due_date).getTime()) / 86400000));

      const draftResp = await fetch(`${SUPABASE_URL}/functions/v1/ai-legal-notice`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${SERVICE_KEY}` },
        body: JSON.stringify({
          invoice: {
            number: inv.number,
            total,
            amountDue,
            issuedDate: inv.issued_date,
            dueDate: inv.due_date,
            clientName: client?.company_name || client?.name || "Client",
            items: items ?? [],
          },
          lawyer: lawyer ? { full_name: lawyer.full_name, bar_council_no: lawyer.bar_council_no, email: lawyer.email } : undefined,
          org: { name: org.name, legal_name: org.legal_name, gstin: org.gstin, state: org.state, address_line1: org.address_line1, city: org.city },
          daysOverdue,
        }),
      });
      const payload = await draftResp.json().catch(() => ({}));
      if (!draftResp.ok) { errors.push(`${inv.number}: ${payload.error || draftResp.status}`); continue; }

      const { error: insErr } = await admin.from("legal_notices").insert({
        org_id: org.id,
        invoice_id: inv.id,
        lawyer_id: lawyerId,
        subject: payload.subject || `Demand notice — Invoice ${inv.number}`,
        ai_draft: payload.draft || "",
        status: "draft",
      });
      if (insErr) { errors.push(`${inv.number}: ${insErr.message}`); continue; }

      if (!inv.attached_lawyer_id) {
        await admin.from("invoices").update({ attached_lawyer_id: lawyerId }).eq("id", inv.id);
      }
      drafted++;
    }
  }

  return json({ scanned, drafted, skipped, errors });
});