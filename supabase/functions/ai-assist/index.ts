// @ts-nocheck — Deno edge function. Multi-mode AI assist for invoices, quotes, proposals.
// Modes:
//  - "invoice-line": polish a single invoice line item description (clarity, professional, India-friendly).
//  - "quote-scope":  generate a scope of work + deliverables + timeline from a brief.
//  - "proposal-agreement": generate full agreement sections from project type + value.
// Uses Lovable AI Gateway (Gemini 3 Flash).

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const key = Deno.env.get("LOVABLE_API_KEY");
  if (!key) return json({ error: "LOVABLE_API_KEY not configured" }, 500);

  let body: any;
  try { body = await req.json(); } catch { return json({ error: "Invalid JSON" }, 400); }

  const mode = body?.mode as string;
  let system = "You are a senior creative-services contracts assistant for Indian design studios and freelancers. You write in clear Indian English, default to INR (₹) and 18% GST under SAC 9983, and never fabricate facts.";
  let user = "";

  if (mode === "invoice-line") {
    const { description, projectType } = body;
    if (!description) return json({ error: "description required" }, 400);
    user = `Polish this invoice line item so a client clearly understands what they're paying for. Return ONE crisp line under 16 words — no bullet points, no quotes, no leading dash, no preface.

Project context: ${projectType || "design services"}
Original line: ${description}`;
  } else if (mode === "quote-scope") {
    const { brief, projectName, validityDays } = body;
    if (!brief) return json({ error: "brief required" }, 400);
    user = `Given the brief below, draft a quote body with three short markdown sections — **Scope of Work**, **Deliverables**, **Timeline** — using bullet points. Keep it tight (≤ 160 words total). Mention validity (${validityDays || 30} days). Do not invent prices.

Project: ${projectName || "(unnamed)"}
Brief: ${brief}`;
  } else if (mode === "proposal-agreement") {
    const { projectType, totalValue, clientName, brandVoice } = body;
    if (!projectType) return json({ error: "projectType required" }, 400);
    const voice = brandVoice === "agency" ? "Write in the voice of a studio (we / our team)." : "Write in the voice of an independent designer (I / my).";
    user = `Generate the six standard sections of an Indian design-services agreement for the project below. ${voice}
Return STRICT JSON with this exact shape (no markdown fences, no extra keys):
{
  "overview": "...",
  "scope": "...",
  "deliverables": "...",
  "timeline": "...",
  "investment": "...",
  "terms": "..."
}

Each value is plain text (newlines and bullet "•" allowed). The "investment" section must use ₹${Number(totalValue || 0).toLocaleString("en-IN")} as the total, mention 50/50 payment split, mention 18% GST (SAC 9983), and bank transfer / UPI as accepted methods. The "terms" section must reference: IP transfer on full payment, confidentiality, 3 included revisions, 7-day cancellation, liability capped at project value, dispute resolution under Indian Arbitration & Conciliation Act 1996, jurisdiction India.

Project type: ${projectType}
Client: ${clientName || "(client)"}
Total value: ₹${Number(totalValue || 0).toLocaleString("en-IN")}`;
  } else {
    return json({ error: `Unknown mode: ${mode}` }, 400);
  }

  const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Lovable-API-Key": key },
    body: JSON.stringify({
      model: "google/gemini-3-flash-preview",
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    }),
  });

  if (resp.status === 429) return json({ error: "AI rate limit. Try again shortly." }, 429);
  if (resp.status === 402) return json({ error: "AI credits exhausted. Add credits in Settings → Workspace → Usage." }, 402);
  if (!resp.ok) {
    const t = await resp.text();
    return json({ error: `AI gateway error: ${t}` }, resp.status);
  }
  const data = await resp.json();
  const text = (data?.choices?.[0]?.message?.content ?? "").trim();

  if (mode === "proposal-agreement") {
    // Strip code fences if present, then parse.
    const cleaned = text.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "").trim();
    try {
      const parsed = JSON.parse(cleaned);
      return json({ sections: parsed });
    } catch {
      return json({ error: "AI returned malformed JSON", raw: text }, 502);
    }
  }

  return json({ text });
});