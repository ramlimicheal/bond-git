# Billenty v1 — Shipped

All 7 planned items are now in code and deployed.

## Done
- **A1** Sales Overview wired to live `invoices`/`quotes`/`proposals` with tooltips, clickable rows, empty state.
- **A2** PDF generator sanitises ₹/curly quotes/em-dashes.
- **A3** Dark mode lifted to WCAG AA.
- **A4** Lawyers page + engagements + `legal_notices` table.
- **A5** Settings: notifications group, auto-notice toggle + N-days, "Run scan now" button, demo data loader in Integrations tab.
- **B1** Public landing at `/` (editorial dark, mint accent) + `/onboarding` (freelancer vs agency, state, GSTIN) + `/lawyer` portal.
- **B2** Indian GST defaults baked into invoice form: SAC 9983, 18%, intra-state CGST+SGST split vs inter-state IGST. Helper in `utils/gst.ts`.
- **B3** Legal layer end-to-end: per-invoice `LegalNoticesPanel` (manual draft) + scheduled scanner edge function `auto-notice-cron` that drafts notices for any overdue invoice with `auto_notice_enabled=true`. Lawyer portal at `/lawyer` shows attached invoices + draft + Mark sent.
- **B4** AI assist via shared `ai-assist` edge function (Gemini 3 Flash): `invoice-line` polish on each line item, `quote-scope` brief→scope on quote form, `proposal-agreement` JSON-structured 6-section draft on proposal form.
- **B5** Demo data: one-click "Load demo" button in Settings → Integrations inserts 3 clients, 1 lawyer, 3 invoices (paid / overdue+notice / draft), a quote, a signed proposal — all ₹ + 18% GST.

## How the scheduler is wired
`auto-notice-cron` is deployed but **not yet on pg_cron**. Users can hit it manually from Settings → Notifications → "Run scan". To run daily, add this SQL (replace ANON_KEY):
```sql
select cron.schedule(
  'billenty-auto-notice-daily', '0 9 * * *',
  $$ select net.http_post(
    url := 'https://<project-ref>.supabase.co/functions/v1/auto-notice-cron',
    headers := '{"Content-Type":"application/json","apikey":"<ANON_KEY>"}'::jsonb,
    body := '{}'::jsonb) $$);
```

## What's deliberately deferred
- Razorpay / Stripe / WhatsApp send → "Coming Soon" in Integrations.
- E-invoice IRP filing.

# Billenty v2 — "the operating system for Indian design studios"

v1: invoice + legal layer built and shipped.
v2: turns Billenty into the full operating system a studio runs on — from quote to cash to compliance.

## Theme 1 — Get Paid
- **Razorpay + UPI on every invoice** — one-click pay button, QR code on PDF, auto-reconcile.
- **Stripe for international clients** — USD/EUR/GBP with auto-INR conversion record.
- **Partial payments + payment plans** — 50/50 splits with auto-generated paylinks.
- **TDS-aware payments** — auto-track 194J TDS deductions, generate Form 16A reminders.
- **Bank import + auto-match** — CSV upload, AI match deposits to outstanding invoices by amount + UTR + client name.

## Theme 2 — Chase (AR agent)
- **AI Collections Agent** — friendly → firm → final WhatsApp/email reminders, user-picks aggression level.
- **WhatsApp Business API** — approved templates for invoice sent, reminder, payment received, overdue.
- **Smart escalation ladder** — Day 0 → 7 → 15 → 30 → 45 (auto-attach lawyer + draft notice) → 60 (court filing pack).
- **Client risk score** — ML from payment history, surface before quoting.
- **Lawyer marketplace, monetised** — verified panel, ₹999 flat per demand notice, revenue share.
- **Court filing pack** — PDF bundle: invoice + notice + delivery proof + ledger, ready for Order XXXVII summary suit.

## Theme 3 — Comply (CA-friendly)
- **GSTR-1 export** — one-click JSON in GST portal schema, monthly + quarterly QRMP.
- **GSTR-3B summary view** — outward taxable supplies, IGST/CGST/SGST split.
- **e-Invoice IRP filing** — auto-generate IRN + QR code, post to NIC portal, embed in PDF.
- **Tally / Zoho Books export** — XML for Tally, CSV for Zoho.
- **TDS reports** — section-wise TDS receivable + Form 26AS reconciliation.
- **MSME compliance** — auto-flag Udyam status, cite MSME Act §15-18 in reminders.

## Theme 4 — Scale (studio OS)
- **Client portal** — branded URL (`acme.billenty.app`), view/pay/approve/e-sign, magic-link login.
- **E-signature on proposals + NDAs** — Aadhaar-based eSign (IT Act §3A) or typed-name with audit trail.
- **Recurring invoices + retainers** — auto-bill, auto-chase.
- **Time tracking → invoice** — per-project timer, drag entries into draft invoice.
- **Expenses + reimbursables** — receipt snap, OCR, attach to project, bill with markup.
- **Multi-seat agency mode** — invite team, assign clients, role-based permissions, activity log.
- **Sub-contractor payouts** — pay freelancers, generate Form 16A.

## Theme 5 — Delight
- **AI proposal-from-brief** — paste brief → 6-section proposal + price recommendation.
- **Beautiful invoice themes** — 6 themes designed for design studios.
- **Embedded payment widget** — `<script>` tag clients drop on their site.
- **Mobile PWA** — send invoice from phone in 30 seconds, lock-screen widget.
- **AI insights dashboard** — DSO benchmarking, revenue forecasting, client concentration risk, seasonal patterns.
- **Public studio profile** — `billenty.app/studio/acme` → portfolio, reviews, lawyer panel, SEO lead-gen.

## Suggested build order (8–10 weeks)
```
Week 1-2  Razorpay + UPI + payment links             [Theme 1]
Week 3    WhatsApp Business API + reminders          [Theme 2]
Week 4    Client portal v1 (view + pay + approve)    [Theme 4]
Week 5    Recurring invoices + retainer UI           [Theme 4]
Week 6    AI Collections Agent (escalation ladder)   [Theme 2]
Week 7    GSTR-1 + Tally export                      [Theme 3]
Week 8    TDS handling + Form 16A                    [Theme 1+3]
Week 9    E-signature on proposals                   [Theme 4]
Week 10   Invoice themes + AI insights dashboard     [Theme 5]
```

## v2 entry criteria
- v1 has at least 5 paying users
- CA feedback on v1 GST formatting is collected
- Razorpay onboarding is approved

## Deferred beyond v2
- E-way bill integration
- Multi-currency live exchange rates (Stripe covers this)
- Shopify integration
- Accounting software full two-way sync (Tally connector)

