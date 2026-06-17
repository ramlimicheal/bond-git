# Where Billenty stands right now

Short answer: **no, not everything is done.** Only the first two items of the plan (A2 PDF fix + A3 dark mode) have been shipped and Playwright-verified. The rest of the v1 plan you approved is still pending.

---

## Done (last turn)
- **A2 — PDF generation** no longer crashes on `₹` / curly quotes / em-dashes. `utils/pdfGenerator.ts` sanitizes input before WinAnsi encoding, so Download works for invoices, quotes and proposals.
- **A3 — Dark mode contrast** lifted to WCAG AA via global overrides in `index.html` (muted greys, surfaces, borders).
- Smoke-tested both with Playwright against the live preview.

## Not done yet (in execution order)
1. **A1 — Sales Overview on live data** (server fn over `invoices`/`quotes`/`proposals`, KPI tooltips, clickable activity, empty states).
2. **A4 — Lawyers CRUD + Engagements + invite-by-email** read-only login.
3. **B2 — Indian GST built in**: HSN/SAC (default 9983), 18% default, intra-state CGST/SGST 9+9 vs inter-state IGST 18, org-level GSTIN + state.
4. **B1 — Public landing `/` + `/onboarding`** Freelancer vs Agency split (seat limit 5 for agencies, Team menu hidden for freelancers), app moves under `/app/*`.
5. **B3 — Auto-attached lawyer + AI legal notice on invoice creation** (Gemini via Lovable AI Gateway), lawyer login sees only their attached invoices + timeline + "Mark notice sent"; settings toggle for auto-send after N days overdue (default 30).
6. **B4 — AI assist**: Generate agreement (proposals), Polish description (invoice line items), Generate scope (quotes) — all via `createServerFn`.
7. **A5 — Settings polish** (notifications toggles + auto-notice N-days) + **B5 — Demo seed data** (3 clients, 2 lawyers, paid invoice, overdue invoice with attached lawyer + draft, quote, signed proposal — all with ₹ + 18% GST split).

Each step still ends with a Playwright smoke test before moving on — no "marked fixed without testing".

## What I need from you to proceed
Pick one — I'll keep going from there:
- **Continue the plan as-is** → I start on A1 (Sales Overview live data) next, then A4.
- **Re-prioritise** → tell me which of the 7 items above you want first (e.g. "do B3 lawyer+AI notice first, it's the differentiator").
- **Pause and verify** → I open the preview, walk through Sales Overview / a PDF download / dark mode with you before writing more code.

## Technical notes
- Server logic stays on `createServerFn` + `requireSupabaseAuth` (no edge functions).
- New tables/columns from B2/B3 land in one migration with GRANTs + RLS scoped to org membership; lawyer role = read-only on their engagements.
- AI uses Lovable AI Gateway (`google/gemini-3-flash-preview`) — no user key.
- Out of scope this pass: Razorpay, WhatsApp send, court filings.
