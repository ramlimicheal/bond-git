# Billenty - Invoice & Proposal Management

Billenty is a GST-compliant invoicing, quotes, and proposal management system designed for Indian freelancers and small businesses. Create professional invoices, track payments, send quotes, and generate legally binding proposals with e-signatures.

## Features

- **Invoices** - Create, track, and manage GST-compliant invoices with PDF export
- **Quotes** - Send professional quotes and convert them to invoices in one click
- **Proposals** - Generate AI-powered agreements with e-signature support
- **Clients** - Manage client database with GSTIN/PAN tracking
- **Products** - Catalog of reusable products and services
- **Dashboard** - Revenue overview, stats, and financial reports
- **Dark Mode** - Full dark mode support
- **UPI Payments** - UPI ID and QR code support for Indian payments

## Tech Stack

- React 18 + TypeScript
- Vite 5
- Tailwind CSS 3
- Supabase (Auth + Database)
- React Router DOM v6
- pdf-lib + html2canvas for PDF generation

## Run Locally

**Prerequisites:** Node.js 18+

1. Install dependencies:
   ```
   npm install
   ```

2. Copy `.env.example` to `.env` and fill in your Supabase credentials:
   ```
   cp .env.example .env
   ```

3. Run the development server:
   ```
   npm run dev
   ```

4. Open http://localhost:8080

## Build for Production

```
npm run build
```

Output is in the `dist/` directory.

## Deploy

The app is configured for Vercel. Connect your repo to Vercel and it will auto-deploy.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server (port 8080) |
| `npm run build` | TypeScript check + production build |
| `npm run preview` | Preview the production build |
| `npm run lint` | Run ESLint |
| `npm run test` | Run test suite |
