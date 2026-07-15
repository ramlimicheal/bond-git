// @ts-nocheck — Deno edge function. Fair Price Engine.
// Uses Firecrawl (via Lovable connector gateway) to search real-world pricing
// signals from Behance / Upwork / Reddit / Indian agency rate cards, then
// synthesizes a defensible low / median / high range with cited sources
// through the Lovable AI Gateway (Gemini 3 Flash).
//
// Request body:
//   { projectType: string, scope?: string, timelineWeeks?: number,
//     clientRegion?: string ("india"|"us"|"eu"|...), clientType?: string
//     ("startup"|"smb"|"enterprise"|"agency"), currency?: "INR"|"USD" }
//
// Response:
//   { range: { low: number, median: number, high: number, currency: "INR" },
//     rationale: string, sources: Array<{ title, url, snippet, price? }>,
//     markdown: string  // ready-to-insert Market Rate Analysis block }

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const GATEWAY = "https://connector-gateway.lovable.dev/firecrawl/v2";
const AI_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  const FIRECRAWL_API_KEY = Deno.env.get("FIRECRAWL_API_KEY");
  if (!LOVABLE_API_KEY) return json({ error: "LOVABLE_API_KEY missing" }, 500);
  if (!FIRECRAWL_API_KEY) return json({ error: "FIRECRAWL_API_KEY missing (connect Firecrawl)" }, 500);

  let body: any;
  try { body = await req.json(); } catch { return json({ error: "Invalid JSON" }, 400); }

  const projectType = String(body?.projectType || "").trim();
  if (!projectType) return json({ error: "projectType required" }, 400);
  const scope = String(body?.scope || "").trim();
  const timelineWeeks = Number(body?.timelineWeeks) || undefined;
  const clientRegion = String(body?.clientRegion || "india").toLowerCase();
  const clientType = String(body?.clientType || "smb").toLowerCase();
  const currency = (body?.currency === "USD" ? "USD" : "INR");

  // 1) Firecrawl search — pull 3 tight queries targeting real pricing data.
  const queries = [
    `${projectType} freelance price ${currency === "INR" ? "india rupees" : "usd"} 2025`,
    `${projectType} project cost range ${scope ? scope + " " : ""}${clientType}`,
    `how much to charge for ${projectType} ${currency === "INR" ? "india" : ""}`,
  ];

  const searchOnce = async (q: string) => {
    const r = await fetch(`${GATEWAY}/search`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "X-Connection-Api-Key": FIRECRAWL_API_KEY,
      },
      body: JSON.stringify({ query: q, limit: 4 }),
    });
    if (!r.ok) {
      const t = await r.text();
      console.error("[fair-price] firecrawl search failed", r.status, t);
      return [];
    }
    const d = await r.json();
    const arr = d?.data ?? d?.web ?? d?.results ?? [];
    return Array.isArray(arr) ? arr : [];
  };

  const raw = (await Promise.all(queries.map(searchOnce))).flat();

  // Dedupe by URL, keep top ~10 unique sources.
  const seen = new Set<string>();
  const sources = raw.filter((s: any) => {
    const u = s?.url || s?.link;
    if (!u || seen.has(u)) return false;
    seen.add(u);
    return true;
  }).slice(0, 10).map((s: any) => ({
    title: s.title || s.name || "",
    url: s.url || s.link || "",
    snippet: (s.description || s.snippet || s.markdown || "").slice(0, 400),
  }));

  // 2) Ask the LLM to synthesize a defensible range with cited sources.
  const symbol = currency === "INR" ? "₹" : "$";
  const sys = `You are a pricing analyst for Indian design freelancers and small studios. You read messy web snippets about real project rates and produce a defensible, conservative price range. Never invent numbers that aren't reasonably supported by the snippets. Round to sensible increments (nearest ₹1,000 or $100). Output STRICT JSON only, no markdown fences.`;

  const user = `PROJECT: ${projectType}
SCOPE: ${scope || "(not specified)"}
TIMELINE: ${timelineWeeks ? timelineWeeks + " weeks" : "(not specified)"}
CLIENT REGION: ${clientRegion}
CLIENT TYPE: ${clientType}
CURRENCY: ${currency}

SOURCES (JSON):
${JSON.stringify(sources, null, 2)}

Return this exact JSON shape:
{
  "low": <number>,
  "median": <number>,
  "high": <number>,
  "rationale": "<2-4 sentences explaining how the range was derived, referencing patterns you saw>",
  "citations": [
    { "url": "<one of the source URLs>", "note": "<why this source supports the range>" }
  ]
}

Rules:
- Values in ${currency}. Use plain numbers, no strings, no symbols.
- If sources are sparse or contradictory, widen the range and say so in rationale.
- Cite 3-5 of the strongest sources.
- Median must sit between low and high.`;

  const aiResp = await fetch(AI_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Lovable-API-Key": LOVABLE_API_KEY },
    body: JSON.stringify({
      model: "google/gemini-3-flash-preview",
      messages: [
        { role: "system", content: sys },
        { role: "user", content: user },
      ],
    }),
  });

  if (aiResp.status === 429) return json({ error: "AI rate limit. Try again shortly." }, 429);
  if (aiResp.status === 402) return json({ error: "AI credits exhausted." }, 402);
  if (!aiResp.ok) {
    const t = await aiResp.text();
    return json({ error: `AI gateway error: ${t}` }, aiResp.status);
  }

  const aiData = await aiResp.json();
  const text = (aiData?.choices?.[0]?.message?.content ?? "").trim();
  const cleaned = text.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "").trim();

  let parsed: any;
  try { parsed = JSON.parse(cleaned); }
  catch { return json({ error: "AI returned malformed JSON", raw: text }, 502); }

  const low = Math.max(0, Math.round(Number(parsed.low) || 0));
  const median = Math.max(low, Math.round(Number(parsed.median) || 0));
  const high = Math.max(median, Math.round(Number(parsed.high) || 0));
  const rationale = String(parsed.rationale || "");
  const citations = Array.isArray(parsed.citations) ? parsed.citations.slice(0, 6) : [];

  const fmt = (n: number) => currency === "INR"
    ? `₹${n.toLocaleString("en-IN")}`
    : `$${n.toLocaleString("en-US")}`;

  // 3) Ready-to-insert Market Rate Analysis block.
  const md = [
    `### Market Rate Analysis`,
    ``,
    `Based on comparable ${projectType.toLowerCase()} projects across freelance platforms and studio rate cards:`,
    ``,
    `- **Low:** ${fmt(low)}`,
    `- **Median:** ${fmt(median)}`,
    `- **High:** ${fmt(high)}`,
    ``,
    rationale,
    ``,
    `**Sources:**`,
    ...citations.map((c: any, i: number) => `${i + 1}. ${c.url}${c.note ? ` — ${c.note}` : ""}`),
    ``,
    `_Data sourced live via Billenty Fair Price Engine._`,
  ].join("\n");

  return json({
    range: { low, median, high, currency, symbol },
    rationale,
    sources: sources.slice(0, 8),
    citations,
    markdown: md,
  });
});