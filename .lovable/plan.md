
# Billenty v1 — Fix + Reshape Plan

Goal: Stop the "everything looks built but nothing works" state. Make core flows real, then layer the actual product vision — legal-backed invoicing for Indian design agencies & freelancers — on top.

---

## Part A — Make what exists actually work

### A1. Sales Overview shows real data
Currently shows whatever's in `dataStore`, with no clarity on what each number means. Will:
- Pull live data from Supabase (`invoices`, `quotes`, `proposals`) scoped to current org via server function.
- Each KPI card gets a tooltip explaining the math (e.g. "Paid Revenue = sum of invoices with status=Paid").
- Recent Activity becomes clickable rows → opens the actual record.
- Empty states with a "Create your first invoice" CTA instead of blank zeros.

### A2. PDF generation actually works
Current bug: `pdf-lib` WinAnsi font can't encode `₹` (U+20B9) → crash on download.
- Switch PDF generator to embed a Unicode TTF (Noto Sans / DejaVu) via `fontkit` so `₹`, accents, em-dashes etc. all render.
- Single shared `pdfGenerator` for invoices, quotes, proposals + new "Legal Notice" PDF (see Part B3).
- Verify with Playwright: click Download → file downloads, ₹ renders.

### A3. Dark mode contrast
Current dark theme has unreadable grey-on-grey. Will:
- Define proper semantic tokens in `index.css` / Tailwind (`--bg`, `--surface`, `--text`, `--text-muted`, `--border`) for both themes.
- Sweep components to replace hard-coded `text-gray-500 dark:text-gray-400` etc. with semantic classes.
- WCAG AA contrast pass on body text & buttons.

### A4. Lawyers page — full CRUD + engagements
- Add / edit / delete lawyer (name, firm, bar council ID, specialization, email, phone, jurisdiction, hourly rate).
- "Engagements" tab: list of invoices/cases the lawyer is attached to.
- Working confirm dialog (already partially fixed) for delete.
- Invite-by-email flow → lawyer gets read-only login for the engagements assigned to them.

### A5. Settings — Notifications & Integrations
- Notifications: email/WhatsApp toggles for invoice sent / viewed / paid / overdue, plus "auto-trigger legal notice after N days overdue" setting (used by Part B3).
- Integrations: keep "Coming Soon" cards honest — remove ones we won't ship; mark Razorpay as the one actually planned for Phase 2.

---

## Part B — Reshape around the real Billenty vision

### B1. Public landing page + onboarding split
- New public route `/` = marketing landing: what Billenty is (legal-backed invoicing for Indian design agencies & freelancers), pricing tease, "Get started" CTA.
- New `/onboarding` after sign-up: pick **Freelancer** or **Agency**.
  - Both: same features for now (per your answer).
  - Agency: seat limit = 5, "Team" appears in sidebar, AI tone = company voice.
  - Freelancer: single-user, "Team" hidden, AI tone = personal voice.
- Store on `organizations.type` (`freelancer` | `agency`) + `organizations.seat_limit`.
- Existing app moves under `/app/*` (protected `_authenticated` layout).

### B2. Indian GST built into invoices/quotes/proposals
- Invoice line items get: HSN/SAC code (default `9983` for design services), tax rate (default 18%).
- Buyer state vs seller state determines split:
  - Intra-state → CGST 9% + SGST 9%.
  - Inter-state → IGST 18%.
- PDF + on-screen breakdown shows the split.
- Org settings: GSTIN, state, default SAC.

### B3. Auto-attached lawyer + AI legal notice on invoices
This is the Billenty differentiator.

Flow:
1. User creates an **invoice** → modal asks "Attach lawyer?" with default = primary lawyer from Lawyers page (auto-suggested; can be changed/removed).
2. Quotes & proposals do **not** trigger this (per your answer).
3. On invoice creation, Billenty AI (Lovable AI Gateway, `google/gemini-3-flash-preview`) drafts a "Demand notice / legal cover letter" tailored to:
   - Invoice details (amount, due date, services, GSTIN).
   - Indian law context (Contract Act 1872, IT Act, MSME Act for late payments if applicable).
   - Lawyer's name & bar council ID in the signature block.
4. Draft is saved against the invoice; lawyer can view/edit it from their login.
5. Lawyer login (read-only on financial data) sees:
   - All invoices they're attached to.
   - Timeline per invoice: sent / viewed / reminder sent / overdue / notice draft / notice sent.
   - "Mark notice sent" action.
6. Settings toggle: "Auto-send notice draft to lawyer when invoice is N days overdue" (N defaults to 30).

### B4. AI assist across documents
- **Proposals**: "Generate agreement" (already exists in mock) → wire to Lovable AI for real; India-law-aware T&C generation.
- **Invoices**: "Polish description" button per line item → AI rewrites the user's terse description into professional invoice copy.
- **Quotes**: "Generate scope" from a short brief.
- All AI calls go through `createServerFn` using Lovable AI Gateway (no user key needed).

### B5. Demo seed data
One migration that seeds, for a freshly signed-up org:
- 3 demo clients (Indian companies + addresses + GSTINs).
- 2 demo lawyers.
- 1 invoice (paid), 1 invoice (overdue with attached lawyer + draft notice), 1 quote, 1 proposal (signed).
- All with realistic ₹ amounts and 18% GST split.
- Seeded only on first org creation; user can wipe from Settings.

---

## Part C — Order of execution

1. **A2 PDF fix + A3 dark mode** (smallest, unblocks daily use).
2. **A1 Sales overview real data** + **A4 Lawyers CRUD**.
3. **B2 GST built-in** (touches invoice/quote/proposal forms + PDFs).
4. **B1 Landing + Freelancer/Agency onboarding**.
5. **B3 Lawyer auto-attach + AI legal notice + lawyer login**.
6. **B4 AI assist across documents**.
7. **A5 Settings polish** + **B5 demo seed**.

Each step ends with a Playwright smoke test of the affected flow before moving on — no more "marked as fixed without testing".

---

## Technical notes (for your reference)

- All server logic via `createServerFn` (TanStack Start) + `requireSupabaseAuth` middleware. No new edge functions.
- AI via Lovable AI Gateway — no user-supplied key needed.
- PDF: `pdf-lib` + `@pdf-lib/fontkit` + bundled Noto Sans TTF (fixes `₹`).
- New tables/columns (migration):
  - `organizations`: add `type`, `seat_limit`, `state_code`, `default_sac`.
  - `invoice_items` / `quote_items` / `proposal_sections`: add `hsn_sac`, `tax_rate`, `cgst_rate`, `sgst_rate`, `igst_rate`.
  - `legal_notices`: new table (invoice_id, lawyer_id, ai_draft, status, sent_at).
  - `lawyer_engagements`: extend to link lawyer ↔ invoice (currently exists, will adjust).
  - All with GRANTs + RLS scoped to org membership; lawyer role = read-only on their engagements.

---

## Out of scope for this pass
- Real payment gateway (Razorpay) — Phase 2.
- WhatsApp send (just toggle wiring, not actual API) — Phase 2.
- Court filing integrations — Phase 3.
