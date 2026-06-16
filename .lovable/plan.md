
# Finish navigation, missing pages, and proper PDFs

## 1. Confirm — yes, this is Lovable Cloud

The database, auth, and storage are all on Lovable Cloud (Supabase under the hood, managed by Lovable). All recent tables — `organizations`, `clients`, `products`, `invoices`, `quotes`, `proposals`, `legal_cases`, `lawyers`, `payments`, etc. — live there with RLS. Nothing about that changes.

## 2. Page audit — what exists vs what's missing

**Working pages today (in sidebar):**
- Dashboard
- Sales → Invoices, Quotes, Proposals
- Accounts & Users
- Clients
- Products
- Settings

**Missing (tables exist in DB, no UI yet):**
- Sales Overview (a parent landing page for the Sales section — currently the "Sales" header is just a label, not a clickable page)
- Finance Reports (revenue, GST, outstanding, paid vs overdue)
- Legal Cases (auto-generated demand notices, Section 138 NI Act memos)
- Lawyers Marketplace (browse/engage verified lawyers)
- Recurring Invoices
- Client Portal preview

## 3. What I'll build

### A. Sidebar restructure
New left-nav order matching your spec:
```text
Dashboard
Sales
  ├─ Sales Overview     ← NEW
  ├─ Invoices
  ├─ Quotes
  └─ Proposals
Legal                   ← NEW SECTION
  ├─ Legal Cases
  └─ Lawyers
Clients
Products
Finance Reports         ← NEW
Accounts & Users
Settings
```

### B. New pages

| Page | Route | Reads from | Purpose |
|---|---|---|---|
| Sales Overview | `/sales` | invoices+quotes+proposals | Combined KPIs, recent activity, "what needs attention" |
| Finance Reports | `/reports` | invoices+payments | Revenue chart (last 6mo), Outstanding ageing, GST summary, top clients, export CSV |
| Legal Cases | `/legal/cases` | legal_cases+invoices | List overdue invoices → "Generate Demand Notice" / "File Section 138" buttons → creates legal_case row + downloadable PDF notice |
| Lawyers | `/legal/lawyers` | lawyers | Browse panel of verified lawyers (state, specialty, bar council #), "Engage" button creates `lawyer_engagement` |
| Recurring Invoices | inside Invoices page tab | recurring_invoices | Toggle "Repeating" tab on invoices page (the tab enum already exists) |

### C. Proper PDF generation
The current PDF uses `html2canvas` + `jsPDF` which produces blurry, low-quality screenshots — that's what looks "pathetic". I'll replace it with **`pdf-lib`** which draws real vector PDFs:

- Crisp typography, selectable text, small file size
- Branded header with org logo + name + GSTIN
- Proper line-item table with totals
- Tax breakdown (CGST/SGST/IGST)
- Bank details + UPI QR code at the bottom
- Footer with "Powered by BILLENTY"
- One template module reused for Invoice / Quote / Proposal / Legal Notice

A `Download PDF` button on each detail page generates and downloads instantly (no server round-trip needed — pdf-lib runs in the browser).

### D. Seed demo lawyers
A migration seeds ~6 demo verified lawyers across Mumbai, Delhi, Bangalore, Chennai with specialties (Contract Disputes, NI Act §138, MSME Recovery, IBC §8) so the marketplace doesn't show empty on first load.

## 4. Out of scope for this turn
- Live lawyer chat (E2 — needs websocket/realtime setup)
- Email + WhatsApp dispatch (C2 — needs Resend API key from you)
- Razorpay payments (D1 — needs your Razorpay keys)

I'll flag at the end which of those you want next.

## 5. Verification
After build:
- Walk through every sidebar item, confirm each page loads with real DB data
- Generate a sample PDF for an invoice + a demand notice, show you both
- Show screenshots of Legal Cases and Lawyers pages

Approve and I'll build.
