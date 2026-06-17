// @ts-nocheck — Deno edge function; runs in Supabase Edge runtime, not the app's TS project.
// Drafts an Indian-law-aware demand notice / legal cover letter for an overdue invoice.
// Uses Lovable AI Gateway (no user key needed).

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface Body {
  invoice: {
    number: string;
    total: number;
    amountDue: number;
    issuedDate: string;
    dueDate?: string;
    clientName: string;
    items?: Array<{ description?: string; quantity?: number; rate?: number }>;
  };
  lawyerId?: string;
  lawyer?: { full_name?: string; bar_council_no?: string; firm?: string; email?: string };
  org?: { name?: string; legal_name?: string; gstin?: string; state?: string; address_line1?: string; city?: string };
  daysOverdue?: number;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405, headers: corsHeaders });

  try {
    const key = Deno.env.get("LOVABLE_API_KEY");
    if (!key) return new Response(JSON.stringify({ error: "LOVABLE_API_KEY not configured" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const body = (await req.json()) as Body;
    const { invoice, org, daysOverdue } = body;

    // Resolve lawyer server-side using service role when an id is provided.
    // The client no longer has access to email/phone via RLS, so we look them up here.
    let lawyer = body.lawyer;
    if (body.lawyerId) {
      const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
      const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
      if (SUPABASE_URL && SERVICE_KEY) {
        const r = await fetch(`${SUPABASE_URL}/rest/v1/lawyers?id=eq.${body.lawyerId}&select=full_name,bar_council_no,email,phone`, {
          headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` },
        });
        if (r.ok) {
          const rows = await r.json();
          if (Array.isArray(rows) && rows[0]) lawyer = rows[0];
        }
      }
    }

    const fmt = (n: number) => `Rs. ${Math.round(n).toLocaleString("en-IN")}`;
    const itemsText = (invoice.items || [])
      .filter((i) => i?.description)
      .map((i) => `- ${i.description} (Qty ${i.quantity ?? 1} x ${fmt(Number(i.rate ?? 0))})`)
      .join("\n") || "- Professional services as per invoice.";

    const userPrompt = `Draft a formal "Demand Notice for Recovery of Outstanding Invoice" in Indian English, addressed from the lawyer to the client. Use plain markdown (no HTML). Include:

1. A short subject line.
2. Sender block: lawyer name, bar council number, firm (if any), email; acting on behalf of the company.
3. Recipient: client name.
4. Reference: invoice number, issue date, due date, total amount, amount outstanding.
5. A factual paragraph reciting the invoice, the agreed terms, and that payment has not been received ${daysOverdue ? `for ${daysOverdue} days past the due date` : "by the due date"}.
6. A legal paragraph citing relevant Indian provisions where applicable: Indian Contract Act, 1872 (s.73 damages, s.74 liquidated damages), Sale of Goods Act / Specific Relief Act as appropriate for services, MSME Development Act 2006 ss.15-18 for delayed payments (interest @ 3x bank rate compounded monthly) IF the sender qualifies as MSME, and Negotiable Instruments Act s.138 ONLY if there is a dishonoured cheque (do not assume).
7. A clear demand: payment of the outstanding amount within 15 days from receipt of this notice, failing which the sender will initiate proceedings (civil suit for recovery, summary suit under Order XXXVII CPC, and/or arbitration if there is an arbitration clause).
8. A reservation-of-rights clause and a signature block with placeholders for date and place.

Tone: firm, professional, non-threatening. Do not invent facts beyond those provided. Output only the notice, no preface.

--- DATA ---
Sender company: ${org?.legal_name || org?.name || "[Company Name]"} (${org?.gstin ? `GSTIN ${org.gstin}` : "GSTIN: ___"})
Sender address: ${[org?.address_line1, org?.city, org?.state].filter(Boolean).join(", ") || "[Address]"}
Lawyer: ${lawyer?.full_name || "[Lawyer Name]"}${lawyer?.bar_council_no ? ` (Bar Council No. ${lawyer.bar_council_no})` : ""}${lawyer?.firm ? `, ${lawyer.firm}` : ""}${lawyer?.email ? `, ${lawyer.email}` : ""}
Client: ${invoice.clientName}
Invoice number: ${invoice.number}
Issued: ${invoice.issuedDate}
Due: ${invoice.dueDate || "[Due date]"}
Invoice total: ${fmt(invoice.total)}
Outstanding: ${fmt(invoice.amountDue)}
Days overdue: ${daysOverdue ?? "[unknown]"}

Line items:
${itemsText}
`;

    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Lovable-API-Key": key },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: "You are an experienced Indian commercial lawyer drafting demand notices that are factual, citation-accurate, and proportionate. You write in clear Indian legal English." },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (resp.status === 429) return new Response(JSON.stringify({ error: "AI rate limit exceeded. Try again in a moment." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    if (resp.status === 402) return new Response(JSON.stringify({ error: "Lovable AI credits exhausted. Add credits in Settings → Workspace → Usage." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    if (!resp.ok) {
      const t = await resp.text();
      return new Response(JSON.stringify({ error: `AI gateway error: ${t}` }), { status: resp.status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const data = await resp.json();
    const draft = data?.choices?.[0]?.message?.content ?? "";
    const subject = `Demand notice — Invoice ${invoice.number}`;
    return new Response(JSON.stringify({ draft, subject }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});