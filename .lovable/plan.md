# BILLENTY — Full Build Plan

## My opinion on the product

Strong concept. The legal angle is the moat — Zoho/QuickBooks/FreshBooks won't touch it because they're global and India's legal recovery system (Section 138 NI Act, Section 8 IBC demand notices, MSME Samadhaan) is jurisdiction-specific. Real risks to plan for:

1. **Lawyer supply** is the bottleneck, not software. You need 20-50 empanelled advocates across major Indian HCs before launch, or the "live lawyer" promise breaks on day one. Start with a waitlist for live-lawyer tier.
2. **Paid-only with no free tier is correct for B2B** but you must offer a 14-day full-feature trial — Indian SMBs won't put a card down blind.
3. **Client portal login is a killer feature** — clients paying via a branded portal is what makes the sender look professional and gets invoices paid 2-3x faster (Stripe/GoCardless data).
4. **Positioning**: don't call it "invoicing with legal" — call it **"Get paid. Guaranteed."** Lead with outcome, not features.
5. **Pricing suggestion** (you can override): Starter ₹499/mo (1 user, unlimited invoices, auto notices), Pro ₹1,499/mo (5 users, lawyer escalation credits), Business ₹3,999/mo (unlimited users, dedicated lawyer SLA). Flat per-company, not per-user — per-user pricing kills SMB adoption in India.

Now the build plan.

---

## Phase B — Lovable Cloud Backend (multi-tenant SaaS foundation)

Enable Lovable Cloud. Migrate from localStorage to Postgres with full RLS.

**Schema (org-scoped multi-tenant):**

```text
organizations         (id, name, gstin, pan, logo_url, signature_url, plan, trial_ends_at)
organization_members  (org_id, user_id, role: owner|admin|accountant|viewer)
profiles              (id=auth.users.id, full_name, phone, avatar_url)
user_roles            (user_id, role: super_admin|lawyer|client_portal_user)  -- platform-level
clients               (id, org_id, name, email, phone, gstin, billing_address, portal_user_id)
products              (id, org_id, name, sku, price, tax_rate, category)
invoices              (id, org_id, client_id, number, status, issue_date, due_date, subtotal, tax, total, paid_amount, currency, notes, terms)
invoice_items         (id, invoice_id, product_id, description, qty, rate, tax_rate, amount)
quotes                (id, org_id, client_id, ...)  -- same shape as invoices
proposals             (id, org_id, client_id, title, content_md, status, sent_at, accepted_at)
payments              (id, invoice_id, amount, method, razorpay_payment_id, paid_at)
recurring_invoices    (id, org_id, template_invoice_id, frequency, next_run_at, active)
legal_cases           (id, invoice_id, stage: notice_sent|reply_awaited|escalated|filed, lawyer_id, opened_at)
legal_documents       (id, case_id, type: demand_letter|sec138|sec8_ibc|reply, pdf_url, generated_at)
lawyers               (id, user_id, bar_council_no, states[], specialties[], rate_per_hour, verified)
lawyer_engagements    (id, case_id, lawyer_id, status, fee, scope)
client_portal_access  (id, client_id, magic_token, last_login_at)
audit_log             (id, org_id, user_id, action, entity, entity_id, meta, created_at)
```

**RLS:** every org-scoped table filtered by `org_id IN (SELECT org_id FROM organization_members WHERE user_id = auth.uid())`. Roles via separate `user_roles` table + `has_role()` SECURITY DEFINER function. Client portal users see only their own client_id's invoices via magic-token-issued session.

**Migration:** one-shot SQL migration with all tables + GRANTs + RLS + policies. Then rewrite `dataStore.ts` → `useInvoices()`, `useClients()`, etc. as TanStack Query hooks calling server functions.

**Auth:** email/password + Google sign-in. Signup flow creates org + makes user the owner. Separate `/portal/login` for client-portal users (magic link).

---

## Phase C — PDF, Email, WhatsApp

- **PDF generation**: server function using `pdfkit` or `@react-pdf/renderer` (server-rendered). Branded invoice/quote/proposal PDFs with org logo + signature. Stored in Lovable Cloud Storage bucket `documents/`.
- **Email**: Resend integration (user provides API key as secret). Templates: invoice sent, payment reminder (3/7/15/30 days overdue), payment received, quote, proposal.
- **WhatsApp**: "Share on WhatsApp" button → `wa.me/<phone>?text=<invoice link>`. Real WhatsApp Business API is Phase E (needs Meta approval).
- **Client portal pages**: `/portal/invoices/:token` — public view-only invoice with Pay Now button. No login needed for view; login needed to see history.

---

## Phase D — Payments (Razorpay + UPI)

- Razorpay BYOK (user enters their own keys — they receive money, not us).
- Server function creates Razorpay order from invoice. Public route `/api/public/razorpay-webhook` verifies signature and updates `payments` + `invoices.status`.
- UPI QR fallback: generate UPI intent QR from org's VPA on invoice PDF and client portal.
- Auto-reconciliation: webhook marks invoice paid → triggers thank-you email.

---

## Phase E — Legal Module + Polish

**Auto-generated legal notices:**
- Trigger: invoice >30 days overdue OR manual "Escalate to legal" button.
- Templates: Demand letter (Indian Contract Act), Section 138 NI Act notice (for bounced cheques), Section 8 IBC demand (for amounts >₹1L), MSME Samadhaan filing draft.
- Generated as PDF with org details, client details, invoice details, amount, interest at 18% p.a., 15-day reply window. Sent via email + downloadable for physical dispatch.
- Creates a `legal_cases` row, tracks stage.

**Lawyer marketplace:**
- Lawyers onboard via separate signup (`/lawyers/join`) with bar council verification.
- "Engage a lawyer" button on a case → matched by state + specialty → lawyer accepts → chat thread + document sharing.
- In-app chat (Lovable AI for first-draft replies, real lawyer reviews).
- Fee held in escrow concept (Phase E.2 — Razorpay Route, deferred).

**Other polish:**
- Recurring invoices (cron via pg_cron + public route).
- GST reports (GSTR-1 summary export).
- Dashboard analytics (Recharts: revenue trend, top clients, ageing report).
- Role-based access enforcement in UI.
- Audit log viewer for owners.
- Onboarding wizard: company details → upload logo → first client → first invoice.
- Pricing page + Razorpay subscription for the SaaS itself (Phase E.3).

---

## Technical Details

- **Stack stays TanStack Start** (already in project). Server functions for all reads/writes. `/api/public/*` for Razorpay webhook + cron.
- **Storage buckets**: `logos/` (public), `signatures/` (private), `documents/` (private, signed URLs).
- **Secrets**: `RESEND_API_KEY`, `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`.
- **PDF rendering** runs in server function (Cloudflare Worker compatible — use `pdf-lib`, not `puppeteer`/`sharp`).
- **AI** (Lovable AI Gateway, gemini-3-flash): legal notice draft refinement, proposal writing assistant, payment reminder tone tuning, lawyer chat first-draft.
- **Lawyer/client portal** = separate route trees (`/portal/*`, `/lawyer/*`) with their own auth-gated layouts.

---

## Execution Order

1. **B1**: Enable Lovable Cloud, run schema migration, wire auth (email + Google), org creation flow.
2. **B2**: Migrate clients/products/invoices/quotes/proposals from localStorage → server functions + RLS. Verify all existing pages still work.
3. **C1**: PDF generation + storage. Download button works end-to-end.
4. **C2**: Resend email integration + templates + reminder cron.
5. **C3**: Client portal (magic-link view + Pay button placeholder).
6. **D1**: Razorpay order creation + webhook + payment reconciliation.
7. **D2**: UPI QR on PDFs and portal.
8. **E1**: Legal notice templates + auto-escalation rules + `legal_cases` UI.
9. **E2**: Lawyer signup, marketplace matching, in-app chat.
10. **E3**: Recurring invoices, GST reports, analytics, role enforcement, onboarding wizard, SaaS pricing page.

I will check in after each major phase (B done, C done, D done, E done) so you can review before continuing. Approve this plan and I'll start with B1.
