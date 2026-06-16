# BILLENTY — Complete Application Review

A full audit of the current state of the app: what works, what's stubbed, what's broken, and what's missing. No code changes yet — this is the inventory + recommended roadmap.

---

## 1. Stack & Architecture (current reality)

- **Frontend:** React 18 + Vite 5 + TailwindCSS 3, `react-router-dom` v6
- **Routing entrypoint:** `App.tsx` (BrowserRouter + Routes)
- **Auth:** `auth.context.tsx` reading `localStorage` token; routes wrapped by `RequireAuth`
- **Data layer:** `api.client.ts` — fully **mocked**, backed by `localStorage` (no real backend in use)
- **Legacy backend:** `server/` folder (Express + Prisma) exists but is NOT wired to the frontend
- **PDF:** `jspdf` + `html2canvas` installed
- **Tests:** vitest configured, two test files present (`__tests__/core.test.ts`, `__tests__/e2e.test.ts`)

---

## 2. Pages & Features — Status Matrix

### ✅ Working (UI + mock data persists in localStorage)


| Area         | Page                      | Notes                                                             |
| ------------ | ------------------------- | ----------------------------------------------------------------- |
| Auth         | Login / Signup            | Mock: any email/password logs in as admin                         |
| Invoices     | List (`/dashboard`)       | Filter, search, status                                            |
| Invoices     | Create (`/invoices/new`)  | Saves to localStorage                                             |
| Invoices     | Details (`/invoices/:id`) | ⚠ receives empty `{}` invoice prop — broken (see §3)              |
| Quotes       | List / Create / Details   | Details uses **hardcoded mockQuote**, not real data               |
| Proposals    | List / Create / Details   | Details uses **hardcoded mockProposal**; e-signature canvas works |
| Clients      | `/clients`                | **Placeholder only** ("No clients found.")                        |
| Products     | `/products`               | Built                                                             |
| Accounts     | `/accounts`               | Built (user CRUD via mock)                                        |
| Settings     | `/settings`               | Tabs: Company, Bank/UPI, Defaults, Notifications, Integrations    |
| Payment test | `/payment-test`           | Stub gateway component                                            |


### ⚠ Partial / Broken

1. **InvoiceDetailsPage** receives `invoice={{} as any}` — won't render real data
2. **QuoteDetailsPage** + **ProposalDetailsPage** receive hardcoded mock objects instead of looking up by `:id`
3. **ClientsPage** is a placeholder; data exists nowhere
4. **PDF download** — `utils/pdfGenerator.ts` exists, real wiring/quality unverified
5. **Command Palette** (Cmd+K) — component present, integration into header unclear
6. **Search bar** in header — input state set, but not actually filtering routes other than the page it's on
7. `server/` code — disconnected, has TS build errors, no longer the source of truth

### ❌ Not built (claimed in docs, missing in code)

- Real backend persistence (server is detached, frontend uses localStorage)
- Razorpay / Stripe / UPI QR code generation (only placeholder cards in Settings → Integrations)
- WhatsApp / Email sending (UI buttons only, no provider)
- Recurring invoices
- Tax / GST reports (GSTR-1)
- Multi-currency live rates
- Analytics / dashboard charts
- Expense tracking
- File uploads (logo, signature image) — currently base64 in localStorage only
- Client portal
- Real authentication (password hashing, sessions, OAuth)

---

## 3. Known Bugs to Fix First

1. `/invoices/:id` route passes `{} as any` — should resolve invoice from `:id` param
2. `/quotes/:id` and `/proposals/:id` use module-level mock instead of looking up by id
3. `/invoices` redirects to `/dashboard` (cosmetic; dashboard IS the invoice list — confusing naming)
4. `ClientsPage` is empty placeholder despite docs saying "Complete"
5. `server/` TS errors (implicit `any` on req/res) — decision needed: keep or delete
6. Stale build artifacts (`tsconfig.tsbuildinfo`, old vite timestamp files) — already cleaned, watch for recurrence
7. `__tests__ 2` (file with space) — looks like accidental duplicate from a sync; should be removed
8. No real Dashboard — the "dashboard" route actually shows the Invoices list

---

## 4. Recommended Roadmap

### Phase A — Stabilize what's there (1 session)

- Wire `:id` lookups for Invoice / Quote / Proposal details from the mock store
- Build a real Clients page (CRUD on top of localStorage, matching Products pattern)
- Build a true Dashboard (KPIs: total revenue, outstanding, overdue, recent activity)
- Delete or quarantine the broken `server/` folder & the `__tests__ 2` file
- Fix header search to filter the current list page

### Phase B — Real backend (recommended: Lovable Cloud)

Replace `api.client.ts` localStorage layer with Lovable Cloud (Postgres + Auth + Storage + server functions). Tables: `clients`, `products`, `invoices`, `invoice_items`, `quotes`, `quote_items`, `proposals`, `proposal_sections`, `company_settings`, `user_roles`. RLS keyed to `auth.uid()`.

### Phase C — PDF + Sharing

- Solidify `pdfGenerator` for Invoice, Quote, Proposal (use existing print views)
- Email sending via a server function (Resend or similar)
- WhatsApp share link (already a `wa.me` URL — confirm it works)

### Phase D — Payments (India-first)

- Razorpay integration (orders + webhook → mark invoice paid)
- UPI QR code generation from saved UPI ID (`qrcode` lib, no backend needed)
- Stripe for international (optional)

### Phase E — Polish

- Recurring invoices (cron via server function)
- GST reports export (CSV/PDF)
- Analytics dashboard (Recharts)
- Real auth with roles (Owner / Accountant / Viewer)
- File uploads to storage (logo, signatures) instead of base64

---

## 5. Question for You

Which would you like to tackle first?

- **(A) Stabilize Phase A** — fix the broken details pages, real Clients, real Dashboard, cleanup. Stays frontend-only.
- **(B) Jump to Phase B** — enable Lovable Cloud now and migrate data layer to a real database with auth.
- **(C) Specific feature** — e.g., "just get Razorpay working" or "just make PDF download work end-to-end."

Tell me which and I'll produce a focused implementation plan for that phase.