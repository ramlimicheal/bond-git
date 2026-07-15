import { PDFDocument, StandardFonts, rgb, PDFPage, PDFFont, PDFImage } from 'pdf-lib';
import QRCode from 'qrcode';
import type { Invoice, Proposal, Quote } from '../types';

// ===== Editorial design tokens =====
// Monochrome ink on warm paper. One micro-accent used sparingly.
const DEFAULT_COLORS = {
  ink: rgb(0.07, 0.07, 0.08),          // near-black body
  inkSoft: rgb(0.20, 0.20, 0.22),      // secondary
  muted: rgb(0.48, 0.48, 0.52),        // labels
  faint: rgb(0.72, 0.72, 0.74),        // meta
  hair: rgb(0.86, 0.86, 0.88),         // hairline rules
  hairStrong: rgb(0.20, 0.20, 0.22),   // heavy rules
  paper: rgb(0.987, 0.983, 0.973),     // off-white bg
  accent: rgb(0.75, 0.55, 0.15),       // ochre/brass
  paid: rgb(0.13, 0.45, 0.25),
  danger: rgb(0.72, 0.12, 0.12),
  white: rgb(1, 1, 1),
};

// Mutable palette used by the generator. Each PDF build resets it based on the
// caller's OrgBranding so brand accent color flows through every draw call.
let COLORS = { ...DEFAULT_COLORS };

function hexToRgb(hex?: string | null) {
  if (!hex) return null;
  const h = hex.trim().replace('#', '');
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  if (!/^[0-9a-fA-F]{6}$/.test(full)) return null;
  const r = parseInt(full.slice(0, 2), 16) / 255;
  const g = parseInt(full.slice(2, 4), 16) / 255;
  const b = parseInt(full.slice(4, 6), 16) / 255;
  return rgb(r, g, b);
}

function applyBrand(org: OrgBranding) {
  COLORS = { ...DEFAULT_COLORS };
  const accent = hexToRgb(org.brand_accent);
  if (accent) COLORS.accent = accent;
}

const MARGIN = 56;
const PAGE_W = 595.28; // A4
const PAGE_H = 841.89;
const CONTENT_W = PAGE_W - MARGIN * 2;

// pdf-lib's StandardFonts use WinAnsi encoding, which cannot encode characters
// like ₹ (U+20B9), curly quotes, em-dashes, etc. Embedding a Unicode TTF would
// bloat the bundle; instead we normalise text to WinAnsi-safe equivalents at
// draw time. This fixes "WinAnsi cannot encode" crashes during PDF generation.
function sanitize(input: unknown): string {
  if (input === null || input === undefined) return '';
  let s = String(input);
  s = s
    .replace(/\u20B9/g, 'Rs. ')           // ₹ Indian Rupee Sign
    .replace(/[\u2018\u2019\u201A\u201B]/g, "'") // curly singles
    .replace(/[\u201C\u201D\u201E\u201F]/g, '"') // curly doubles
    .replace(/[\u2013\u2014\u2015]/g, '-') // en/em dashes
    .replace(/\u2026/g, '...')              // ellipsis
    .replace(/\u00A0/g, ' ')                // nbsp
    .replace(/[\u2022\u25E6]/g, '*')        // bullets
    .replace(/[\u00B7]/g, '-')              // middle dot
    .replace(/\u20AC/g, 'EUR ')             // €
    .replace(/\u00A3/g, 'GBP ')             // £
    .replace(/\u00A5/g, 'JPY ');            // ¥
  // Drop any remaining non-WinAnsi chars to avoid hard crashes.
  // WinAnsi roughly covers 0x20-0x7E and 0xA0-0xFF.
  // eslint-disable-next-line no-control-regex
  s = s.replace(/[^\x09\x0A\x0D\x20-\x7E\xA0-\xFF]/g, '?');
  return s;
}

interface OrgBranding {
  name?: string;
  legal_name?: string | null;
  gstin?: string | null;
  email?: string | null;
  phone?: string | null;
  upi_vpa?: string | null;
  logo_url?: string | null;      // Fetchable URL (signed URL or data URL) for the logo image.
  brand_accent?: string | null;  // Hex color, e.g. "#c98a26".
}

// Try to load and embed the org logo. Returns null if not available/decodable.
async function embedLogo(pdf: PDFDocument, url?: string | null): Promise<PDFImage | null> {
  if (!url) return null;
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const buf = new Uint8Array(await res.arrayBuffer());
    // Sniff format from magic bytes so we call the right embedder.
    const isPng = buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47;
    const isJpg = buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff;
    if (isPng) return await pdf.embedPng(buf);
    if (isJpg) return await pdf.embedJpg(buf);
    // Last-ditch: try PNG.
    try { return await pdf.embedPng(buf); } catch { return null; }
  } catch {
    return null;
  }
}

async function loadFonts(pdf: PDFDocument) {
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const italic = await pdf.embedFont(StandardFonts.HelveticaOblique);
  return { regular, bold, italic };
}

function drawText(page: PDFPage, text: string, x: number, y: number, opts: { font: PDFFont; size?: number; color?: ReturnType<typeof rgb>; maxWidth?: number } = {} as any) {
  const size = opts.size ?? 10;
  const color = opts.color ?? COLORS.ink;
  page.drawText(sanitize(text), { x, y, size, font: opts.font, color });
}

function drawLine(page: PDFPage, x1: number, y1: number, x2: number, y2: number, color = COLORS.hair, thickness = 0.5) {
  page.drawLine({ start: { x: x1, y: y1 }, end: { x: x2, y: y2 }, color, thickness });
}

// Draw text right-aligned to `xRight`. Essential for tabular numerics.
function drawRight(page: PDFPage, text: string, xRight: number, y: number, opts: { font: PDFFont; size?: number; color?: ReturnType<typeof rgb> }) {
  const size = opts.size ?? 10;
  const s = sanitize(text);
  const w = opts.font.widthOfTextAtSize(s, size);
  page.drawText(s, { x: xRight - w, y, size, font: opts.font, color: opts.color ?? COLORS.ink });
}

// Letter-spaced tiny caps label (e.g. "BILL TO"). pdf-lib has no tracking API,
// so we splice zero-width joiners via inter-character kerning by drawing char-by-char.
function drawLabel(page: PDFPage, text: string, x: number, y: number, font: PDFFont, size = 7.5, color = COLORS.muted, tracking = 1.6) {
  const s = sanitize(text).toUpperCase();
  let cx = x;
  for (const ch of s) {
    page.drawText(ch, { x: cx, y, size, font, color });
    cx += font.widthOfTextAtSize(ch, size) + tracking;
  }
}

// Paint a full-page paper background.
function paintPaper(page: PDFPage) {
  page.drawRectangle({ x: 0, y: 0, width: PAGE_W, height: PAGE_H, color: COLORS.paper });
}

function rupees(n: number) {
  return `INR  ${Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function amountOnly(n: number) {
  return Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtDate(s: string | null | undefined) {
  if (!s) return '-';
  const d = new Date(s);
  if (isNaN(d.getTime())) return s;
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase();
}

// ============ Editorial masthead ============
// Kind: "INVOICE" / "QUOTE" / "PROPOSAL" — set as tiny caps eyebrow.
// The document NUMBER is the typographic hero.
function drawMasthead(page: PDFPage, fonts: any, org: OrgBranding, kind: string, number: string, logo: PDFImage | null = null) {
  const top = PAGE_H - MARGIN;

  // Left: logo (if uploaded) or monogram, plus wordmark
  const monoSize = 26;
  if (logo) {
    // Scale to fit within monoSize box while preserving aspect ratio.
    const scale = Math.min(monoSize / logo.width, monoSize / logo.height);
    const w = logo.width * scale;
    const h = logo.height * scale;
    page.drawImage(logo, { x: MARGIN, y: top - monoSize + (monoSize - h) / 2, width: w, height: h });
  } else {
    const m = 22;
    page.drawRectangle({ x: MARGIN, y: top - m, width: m, height: m, color: COLORS.ink });
    drawText(page, (org.name || 'B').charAt(0).toUpperCase(), MARGIN + 6.5, top - m + 5.5, { font: fonts.bold, size: 14, color: COLORS.paper });
  }
  const wordX = MARGIN + monoSize + 10;
  drawText(page, (org.name || 'Your Company').toUpperCase(), wordX, top - 12, { font: fonts.bold, size: 10 });
  drawText(page, org.legal_name || 'Independent Studio', wordX, top - 22, { font: fonts.regular, size: 8, color: COLORS.muted });

  // Right: eyebrow + number hero
  drawLabel(page, kind, PAGE_W - MARGIN - 90, top - 4, fonts.bold, 7.5, COLORS.accent, 2.2);
  drawText(page, `No. ${number}`, PAGE_W - MARGIN - 90, top - 22, { font: fonts.regular, size: 10, color: COLORS.ink });

  // Full-width hairline under masthead
  drawLine(page, MARGIN, top - 36, PAGE_W - MARGIN, top - 36, COLORS.hairStrong, 0.8);
  // Accent rule directly beneath the strong rule — the branded touch.
  drawLine(page, MARGIN, top - 38, MARGIN + 60, top - 38, COLORS.accent, 1.5);
}

function drawFooter(page: PDFPage, fonts: any, pageNum = 1, total = 1) {
  drawLine(page, MARGIN, MARGIN - 12, PAGE_W - MARGIN, MARGIN - 12, COLORS.hair, 0.4);
  drawLabel(page, 'BILLENTY  ·  BILLING & LEGAL FOR INDIAN STUDIOS', MARGIN, MARGIN - 26, fonts.regular, 6.5, COLORS.faint, 1.4);
  drawRight(page, `${pageNum} / ${total}`, PAGE_W - MARGIN, MARGIN - 26, { font: fonts.regular, size: 7.5, color: COLORS.faint });
}

// Diagonal status watermark (PAID / OVERDUE / DRAFT) — extremely subtle
function drawWatermark(page: PDFPage, fonts: any, label: string, color = COLORS.faint) {
  const size = 96;
  const s = sanitize(label).toUpperCase();
  const w = fonts.bold.widthOfTextAtSize(s, size);
  page.drawText(s, {
    x: (PAGE_W - w) / 2,
    y: PAGE_H / 2 - size / 2,
    size,
    font: fonts.bold,
    color,
    opacity: 0.06,
    rotate: { type: 'degrees', angle: -18 } as any,
  });
}

async function embedQR(pdf: PDFDocument, text: string) {
  const dataUrl = await QRCode.toDataURL(text, { margin: 0, width: 240, errorCorrectionLevel: 'M' });
  const bytes = Uint8Array.from(atob(dataUrl.split(',')[1]), (c) => c.charCodeAt(0));
  return pdf.embedPng(bytes);
}

// ============ INVOICE / QUOTE TEMPLATE ============
async function buildInvoiceLikePDF(
  doc: { kind: 'INVOICE' | 'QUOTE'; number: string; status: string; dateLabel: string; dateValue: string; dueLabel: string; dueValue: string; clientName: string; clientType: string; items: { description: string; quantity: number; price: number }[]; subtotal: number; tax: number; total: number; amountPaid?: number; },
  org: OrgBranding,
): Promise<Blob> {
  applyBrand(org);
  const pdf = await PDFDocument.create();
  const fonts = await loadFonts(pdf);
  const logo = await embedLogo(pdf, org.logo_url);
  const page = pdf.addPage([PAGE_W, PAGE_H]);
  paintPaper(page);
  drawMasthead(page, fonts, org, doc.kind, doc.number, logo);

  // Subtle status watermark
  const st = (doc.status || 'draft').toUpperCase();
  if (['PAID', 'OVERDUE', 'DRAFT', 'CANCELLED'].includes(st)) {
    drawWatermark(page, fonts, st, st === 'PAID' ? COLORS.paid : st === 'OVERDUE' ? COLORS.danger : COLORS.faint);
  }

  // ===== Document title zone =====
  // Kind headline in generous display size (typographic hero of the page)
  let y = PAGE_H - MARGIN - 70;
  drawText(page, doc.kind === 'INVOICE' ? 'Invoice.' : 'Quotation.', MARGIN, y, { font: fonts.bold, size: 40, color: COLORS.ink });
  // Accent underline for the display title
  drawLine(page, MARGIN, y - 6, MARGIN + 40, y - 6, COLORS.accent, 2);

  // Right-side metadata grid (Issued / Due / Amount)
  const metaX = PAGE_W - MARGIN - 220;
  const col1 = metaX;
  const col2 = metaX + 110;
  drawLabel(page, doc.dateLabel, col1, y + 24, fonts.bold, 7, COLORS.muted, 1.8);
  drawText(page, fmtDate(doc.dateValue), col1, y + 10, { font: fonts.regular, size: 9.5 });
  drawLabel(page, doc.dueLabel, col2, y + 24, fonts.bold, 7, COLORS.muted, 1.8);
  drawText(page, fmtDate(doc.dueValue), col2, y + 10, { font: fonts.regular, size: 9.5 });

  // Amount due callout (top-right)
  drawLabel(page, doc.kind === 'INVOICE' ? 'AMOUNT DUE' : 'QUOTE TOTAL', col1, y - 8, fonts.bold, 7, COLORS.muted, 1.8);
  drawText(page, `Rs. ${amountOnly((doc.amountPaid !== undefined ? doc.total - doc.amountPaid : doc.total))}`, col1, y - 26, { font: fonts.bold, size: 18, color: COLORS.ink });

  y -= 60;
  drawLine(page, MARGIN, y, PAGE_W - MARGIN, y, COLORS.hair, 0.4);
  y -= 24;

  // ===== From / To block =====
  const colW = CONTENT_W / 2 - 12;
  drawLabel(page, 'FROM', MARGIN, y, fonts.bold, 7, COLORS.muted, 1.8);
  drawText(page, (org.name || 'Your Company'), MARGIN, y - 16, { font: fonts.bold, size: 11 });
  if (org.gstin) drawText(page, `GSTIN  ${org.gstin}`, MARGIN, y - 30, { font: fonts.regular, size: 9, color: COLORS.inkSoft });
  if (org.email) drawText(page, org.email, MARGIN, y - 42, { font: fonts.regular, size: 9, color: COLORS.muted });
  if (org.phone) drawText(page, org.phone, MARGIN, y - 54, { font: fonts.regular, size: 9, color: COLORS.muted });

  const toX = MARGIN + colW + 24;
  drawLabel(page, 'BILLED TO', toX, y, fonts.bold, 7, COLORS.muted, 1.8);
  drawText(page, doc.clientName || '-', toX, y - 16, { font: fonts.bold, size: 11 });
  drawText(page, doc.clientType || '', toX, y - 30, { font: fonts.regular, size: 9, color: COLORS.inkSoft });

  y -= 84;

  // ===== Line items table =====
  // Column geometry: description | qty | rate | amount
  const cQty = PAGE_W - MARGIN - 250;
  const cRate = PAGE_W - MARGIN - 160;
  const cAmt = PAGE_W - MARGIN; // right edge for right-alignment

  drawLabel(page, 'DESCRIPTION', MARGIN, y, fonts.bold, 7, COLORS.muted, 1.8);
  drawRight(page, 'QTY', cQty + 30, y, { font: fonts.bold, size: 7, color: COLORS.muted });
  drawRight(page, 'RATE', cRate + 50, y, { font: fonts.bold, size: 7, color: COLORS.muted });
  drawRight(page, 'AMOUNT', cAmt, y, { font: fonts.bold, size: 7, color: COLORS.muted });
  y -= 8;
  drawLine(page, MARGIN, y, PAGE_W - MARGIN, y, COLORS.hairStrong, 0.8);
  y -= 18;

  for (const it of doc.items) {
    const descLines = wrapText(it.description || '-', fonts.regular, 10, cQty - MARGIN - 20);
    const rowH = Math.max(22, descLines.length * 13 + 8);
    // description (wrap)
    let ly = y;
    for (const ln of descLines) {
      drawText(page, ln, MARGIN, ly, { font: fonts.regular, size: 10 });
      ly -= 13;
    }
    drawRight(page, String(it.quantity), cQty + 30, y, { font: fonts.regular, size: 10, color: COLORS.inkSoft });
    drawRight(page, amountOnly(it.price), cRate + 50, y, { font: fonts.regular, size: 10, color: COLORS.inkSoft });
    drawRight(page, amountOnly(it.quantity * it.price), cAmt, y, { font: fonts.bold, size: 10 });
    y -= rowH;
    drawLine(page, MARGIN, y + 8, PAGE_W - MARGIN, y + 8, COLORS.hair, 0.3);
  }

  // ===== Totals ledger (right-aligned) =====
  y -= 12;
  const tLabelX = PAGE_W - MARGIN - 200;
  const drawTotalRow = (label: string, value: string, opts: { bold?: boolean; color?: any; size?: number } = {}) => {
    const size = opts.size ?? 10;
    drawText(page, label, tLabelX, y, { font: opts.bold ? fonts.bold : fonts.regular, size, color: opts.color ?? COLORS.muted });
    drawRight(page, value, cAmt, y, { font: opts.bold ? fonts.bold : fonts.regular, size, color: opts.color ?? COLORS.ink });
    y -= size + 6;
  };

  drawTotalRow('Subtotal', amountOnly(doc.subtotal));
  drawTotalRow('GST @ 18%', amountOnly(doc.tax));
  y -= 4;
  drawLine(page, tLabelX, y + 10, PAGE_W - MARGIN, y + 10, COLORS.hairStrong, 0.6);
  y -= 4;
  // Grand total row — larger, ink-heavy
  drawText(page, 'TOTAL', tLabelX, y, { font: fonts.bold, size: 11, color: COLORS.ink });
  drawRight(page, `Rs. ${amountOnly(doc.total)}`, cAmt, y, { font: fonts.bold, size: 14, color: COLORS.ink });
  y -= 22;

  if (doc.amountPaid !== undefined && doc.amountPaid > 0) {
    drawTotalRow('Amount paid', amountOnly(doc.amountPaid), { color: COLORS.paid });
    drawTotalRow('Balance due', amountOnly(doc.total - doc.amountPaid), { bold: true, color: COLORS.danger, size: 11 });
  }

  // ===== Payment strip (UPI + QR) =====
  if (doc.kind === 'INVOICE') {
    const py = MARGIN + 20;
    // Card block with hairline border
    page.drawRectangle({ x: MARGIN, y: py, width: CONTENT_W, height: 100, borderColor: COLORS.hairStrong, borderWidth: 0.6, color: COLORS.paper });
    drawLabel(page, 'PAYMENT', MARGIN + 16, py + 82, fonts.bold, 7, COLORS.muted, 1.8);
    drawText(page, org.upi_vpa ? 'Pay instantly via UPI' : 'Bank transfer details on request', MARGIN + 16, py + 62, { font: fonts.bold, size: 12 });
    if (org.upi_vpa) {
      drawText(page, `UPI ID    ${org.upi_vpa}`, MARGIN + 16, py + 44, { font: fonts.regular, size: 9.5, color: COLORS.inkSoft });
      drawText(page, 'Scan the code with GPay · PhonePe · Paytm · any UPI app.', MARGIN + 16, py + 28, { font: fonts.italic, size: 8.5, color: COLORS.muted });
      try {
        const upiUri = `upi://pay?pa=${encodeURIComponent(org.upi_vpa)}&pn=${encodeURIComponent(org.name || '')}&am=${doc.total - (doc.amountPaid || 0)}&tn=${encodeURIComponent(doc.number)}&cu=INR`;
        const qrImg = await embedQR(pdf, upiUri);
        page.drawImage(qrImg, { x: PAGE_W - MARGIN - 88, y: py + 8, width: 84, height: 84 });
      } catch { /* ignore */ }
    } else {
      drawText(page, 'Contact the sender to receive account/UPI details.', MARGIN + 16, py + 44, { font: fonts.regular, size: 9.5, color: COLORS.muted });
    }
  }

  drawFooter(page, fonts, 1, 1);
  const bytes = await pdf.save();
  return new Blob([new Uint8Array(bytes)], { type: 'application/pdf' });
}

export async function generateInvoicePDF(invoice: Invoice, org: OrgBranding = {}): Promise<Blob> {
  const subtotal = invoice.items.reduce((s, it) => s + it.quantity * it.price, 0);
  const tax = subtotal * 0.18;
  const total = invoice.amountPaid + invoice.amountDue;
  return buildInvoiceLikePDF({
    kind: 'INVOICE',
    number: invoice.number,
    status: invoice.status,
    dateLabel: 'Issued',
    dateValue: invoice.issuedDate,
    dueLabel: 'Due',
    dueValue: invoice.dueDate,
    clientName: invoice.clientName,
    clientType: invoice.clientType,
    items: invoice.items,
    subtotal,
    tax,
    total: total || subtotal + tax,
    amountPaid: invoice.amountPaid,
  }, org);
}

export async function generateQuotePDF(quote: Quote, org: OrgBranding = {}): Promise<Blob> {
  const subtotal = quote.items.reduce((s, it) => s + it.quantity * it.price, 0);
  return buildInvoiceLikePDF({
    kind: 'QUOTE',
    number: quote.number,
    status: quote.status,
    dateLabel: 'Created',
    dateValue: quote.createdDate,
    dueLabel: 'Valid Until',
    dueValue: quote.validUntil,
    clientName: quote.clientName,
    clientType: quote.clientType,
    items: quote.items,
    subtotal,
    tax: subtotal * 0.18,
    total: quote.total || subtotal * 1.18,
  }, org);
}

// ============ PROPOSAL TEMPLATE ============
export async function generateProposalPDF(p: Proposal, org: OrgBranding = {}): Promise<Blob> {
  const pdf = await PDFDocument.create();
  const fonts = await loadFonts(pdf);

  // ===== COVER PAGE =====
  let page = pdf.addPage([PAGE_W, PAGE_H]);
  paintPaper(page);
  drawMasthead(page, fonts, org, 'PROPOSAL', p.number);

  // Large date/year set as editorial detail
  drawLabel(page, `PREPARED  ${fmtDate(new Date().toISOString())}`, MARGIN, PAGE_H - MARGIN - 60, fonts.bold, 7, COLORS.muted, 1.8);

  // Massive proposal title — the hero moment
  const titleY = PAGE_H / 2 + 40;
  const title = p.title || 'Untitled Proposal';
  const titleLines = wrapText(title, fonts.bold, 44, CONTENT_W);
  let ty = titleY;
  for (const ln of titleLines.slice(0, 3)) {
    drawText(page, ln, MARGIN, ty, { font: fonts.bold, size: 44, color: COLORS.ink });
    ty -= 48;
  }

  // Single ochre rule under title — the only touch of color on the cover
  drawLine(page, MARGIN, ty + 12, MARGIN + 90, ty + 12, COLORS.accent, 2);

  // Prepared-for / value block near footer
  const blockY = MARGIN + 140;
  drawLine(page, MARGIN, blockY + 90, PAGE_W - MARGIN, blockY + 90, COLORS.hairStrong, 0.6);
  drawLabel(page, 'PREPARED FOR', MARGIN, blockY + 70, fonts.bold, 7, COLORS.muted, 1.8);
  drawText(page, p.clientName || '-', MARGIN, blockY + 50, { font: fonts.bold, size: 14 });
  if (p.clientEmail) drawText(page, p.clientEmail, MARGIN, blockY + 34, { font: fonts.regular, size: 9.5, color: COLORS.muted });

  const valueX = PAGE_W - MARGIN - 200;
  drawLabel(page, 'PROJECT VALUE', valueX, blockY + 70, fonts.bold, 7, COLORS.muted, 1.8);
  drawText(page, `Rs. ${amountOnly(p.totalValue)}`, valueX, blockY + 48, { font: fonts.bold, size: 22, color: COLORS.ink });
  drawText(page, 'exclusive of taxes', valueX, blockY + 34, { font: fonts.italic, size: 8.5, color: COLORS.muted });

  drawFooter(page, fonts, 1, 1 + (p.sections?.length ? 1 : 0));

  // ===== SECTION PAGES =====
  if (p.sections && p.sections.length > 0) {
    page = pdf.addPage([PAGE_W, PAGE_H]);
    paintPaper(page);
    drawMasthead(page, fonts, org, 'PROPOSAL', p.number);
    let y = PAGE_H - MARGIN - 70;

    let sectionNum = 0;
    for (const s of p.sections) {
      sectionNum++;
      if (y < 180) {
        drawFooter(page, fonts, 0, 0);
        page = pdf.addPage([PAGE_W, PAGE_H]);
        paintPaper(page);
        drawMasthead(page, fonts, org, 'PROPOSAL', p.number);
        y = PAGE_H - MARGIN - 70;
      }
      // Section number in muted large numeral, title beside it
      drawText(page, String(sectionNum).padStart(2, '0'), MARGIN, y, { font: fonts.bold, size: 30, color: COLORS.faint });
      drawLabel(page, 'SECTION', MARGIN + 60, y + 20, fonts.bold, 7, COLORS.muted, 1.8);
      drawText(page, s.title || '', MARGIN + 60, y + 4, { font: fonts.bold, size: 18 });
      y -= 22;
      drawLine(page, MARGIN, y, PAGE_W - MARGIN, y, COLORS.hair, 0.4);
      y -= 20;

      const paras = (s.content || '').split(/\n\n+/);
      for (const para of paras) {
        const lines = wrapText(para, fonts.regular, 10.5, CONTENT_W - 20);
        for (const ln of lines) {
          if (y < 80) {
            drawFooter(page, fonts, 0, 0);
            page = pdf.addPage([PAGE_W, PAGE_H]);
            paintPaper(page);
            drawMasthead(page, fonts, org, 'PROPOSAL', p.number);
            y = PAGE_H - MARGIN - 70;
          }
          drawText(page, ln, MARGIN + 20, y, { font: fonts.regular, size: 10.5, color: COLORS.inkSoft });
          y -= 15;
        }
        y -= 8;
      }
      y -= 24;
    }

    // Signature block
    if (p.clientSignature || p.senderSignature) {
      if (y < 140) {
        drawFooter(page, fonts, 0, 0);
        page = pdf.addPage([PAGE_W, PAGE_H]);
        paintPaper(page);
        drawMasthead(page, fonts, org, 'PROPOSAL', p.number);
        y = PAGE_H - MARGIN - 70;
      }
      drawLine(page, MARGIN, y, PAGE_W - MARGIN, y, COLORS.hairStrong, 0.6);
      y -= 20;
      const half = CONTENT_W / 2;
      drawLabel(page, 'CLIENT SIGNATURE', MARGIN, y, fonts.bold, 7, COLORS.muted, 1.8);
      drawText(page, p.clientSignature || '—', MARGIN, y - 22, { font: fonts.italic, size: 14 });
      drawLabel(page, 'AUTHORISED SIGNATORY', MARGIN + half, y, fonts.bold, 7, COLORS.muted, 1.8);
      drawText(page, p.senderSignature || org.name || '—', MARGIN + half, y - 22, { font: fonts.italic, size: 14 });
    }

    drawFooter(page, fonts, 0, 0);
  }

  const bytes = await pdf.save();
  return new Blob([new Uint8Array(bytes)], { type: 'application/pdf' });
}

// ============ LEGAL NOTICE TEMPLATE ============
export interface LegalNoticeData {
  noticeType: 'demand' | 'section_138' | 'section_8_ibc' | 'msme_samadhaan';
  caseNumber: string;
  org: OrgBranding;
  client: { name: string; address?: string; email?: string };
  invoiceNumber: string;
  invoiceDate: string;
  amountClaimed: number;
  interestRate: number;
  replyDays?: number;
}

const NOTICE_TITLES: Record<LegalNoticeData['noticeType'], string> = {
  demand: 'LEGAL DEMAND NOTICE',
  section_138: 'NOTICE UNDER SECTION 138 OF THE NEGOTIABLE INSTRUMENTS ACT, 1881',
  section_8_ibc: 'NOTICE UNDER SECTION 8 OF THE INSOLVENCY AND BANKRUPTCY CODE, 2016',
  msme_samadhaan: 'NOTICE UNDER MSMED ACT, 2006 (SAMADHAAN)',
};

const NOTICE_BODY: Record<LegalNoticeData['noticeType'], (d: LegalNoticeData) => string> = {
  demand: (d) => `Under instructions from and on behalf of my client ${d.org.name}, I hereby serve upon you the following notice:

1. That my client raised invoice no. ${d.invoiceNumber} dated ${fmtDate(d.invoiceDate)} upon you for an aggregate sum of ${rupees(d.amountClaimed)} for goods/services rendered, which sum remains unpaid as on the date of this notice.

2. That despite repeated reminders and follow-ups, you have wilfully and deliberately failed to discharge the said liability, which constitutes a breach of the express and implied terms of the contract between the parties.

3. That you are accordingly called upon to pay to my client the said principal sum of ${rupees(d.amountClaimed)} together with interest @ ${d.interestRate}% per annum from the date the said amount fell due, within ${d.replyDays ?? 15} (fifteen) days from the receipt of this notice.

4. Take notice that if you fail to comply with the above demand within the stipulated period, my client shall be constrained to institute appropriate civil and/or criminal proceedings against you at your sole risk, cost and consequences, including but not limited to a summary suit under Order XXXVII CPC, and you shall be liable for the same.

Please treat this as final notice.`,
  section_138: (d) => `WHEREAS my client ${d.org.name} is the holder in due course of cheque(s) bearing reference to invoice no. ${d.invoiceNumber} dated ${fmtDate(d.invoiceDate)}, drawn by you for a sum of ${rupees(d.amountClaimed)}, which was/were presented for encashment and returned unpaid by the bank with the remark "insufficient funds / payment stopped / refer to drawer / account closed".

You are hereby called upon, in terms of the proviso (c) to Section 138 of the Negotiable Instruments Act, 1881, to pay to my client the said cheque amount of ${rupees(d.amountClaimed)} together with all consequential interest, costs and incidental charges within fifteen (15) days from the receipt of this notice, failing which my client shall be constrained to initiate prosecution against you under Section 138 of the said Act, in addition to all other civil and criminal remedies available in law, at your sole risk as to costs and consequences.`,
  section_8_ibc: (d) => `In terms of Section 8 of the Insolvency and Bankruptcy Code, 2016, read with Rule 5 of the Insolvency and Bankruptcy (Application to Adjudicating Authority) Rules, 2016, my client ${d.org.name}, an operational creditor, hereby calls upon you, the corporate debtor, to make payment of the unpaid operational debt of ${rupees(d.amountClaimed)} arising out of invoice no. ${d.invoiceNumber} dated ${fmtDate(d.invoiceDate)} within ten (10) days from the receipt of this notice.

Failing payment within the said period, or failing the bringing to the notice of the operational creditor of any existence of dispute or record of pendency of any suit or arbitration proceeding within the said period, my client shall be constrained to initiate a Corporate Insolvency Resolution Process (CIRP) against you before the Hon'ble National Company Law Tribunal.`,
  msme_samadhaan: (d) => `My client ${d.org.name}, a registered Micro/Small enterprise under the Micro, Small and Medium Enterprises Development Act, 2006 ("MSMED Act"), has supplied goods/rendered services to you vide invoice no. ${d.invoiceNumber} dated ${fmtDate(d.invoiceDate)} for an aggregate sum of ${rupees(d.amountClaimed)}.

In terms of Section 15 of the MSMED Act, the buyer is liable to make payment to the supplier on or before the appointed day. In terms of Section 16, where the buyer fails to make payment, the buyer shall, notwithstanding anything contained in any agreement or in any law for the time being in force, be liable to pay compound interest with monthly rests to the supplier on the amount, at three times of the bank rate notified by the Reserve Bank of India, from the appointed day.

You are accordingly called upon to pay to my client the said sum of ${rupees(d.amountClaimed)} along with the statutory interest within fifteen (15) days, failing which my client shall be constrained to refer the matter to the Micro and Small Enterprises Facilitation Council under Section 18 of the MSMED Act.`,
};

export async function generateLegalNoticePDF(d: LegalNoticeData): Promise<Blob> {
  const pdf = await PDFDocument.create();
  const fonts = await loadFonts(pdf);
  let page = pdf.addPage([PAGE_W, PAGE_H]);
  paintPaper(page);
  drawMasthead(page, fonts, d.org, 'LEGAL NOTICE', d.caseNumber);

  let y = PAGE_H - MARGIN - 70;
  const title = NOTICE_TITLES[d.noticeType];
  const titleLines = wrapText(title, fonts.bold, 12, PAGE_W - 2 * MARGIN);
  for (const ln of titleLines) { drawText(page, ln, MARGIN, y, { font: fonts.bold, size: 12, color: COLORS.danger }); y -= 16; }

  y -= 10;
  drawText(page, `Without Prejudice  ·  Reg. Post/AD  ·  ${fmtDate(new Date().toISOString())}`, MARGIN, y, { font: fonts.italic, size: 9, color: COLORS.muted });
  y -= 24;

  drawText(page, 'To,', MARGIN, y, { font: fonts.regular, size: 10 }); y -= 14;
  drawText(page, d.client.name, MARGIN, y, { font: fonts.bold, size: 11 }); y -= 14;
  if (d.client.address) { drawText(page, d.client.address, MARGIN, y, { font: fonts.regular, size: 10, color: COLORS.muted }); y -= 14; }
  if (d.client.email) { drawText(page, d.client.email, MARGIN, y, { font: fonts.regular, size: 10, color: COLORS.muted }); y -= 14; }
  y -= 10;
  drawText(page, `Sir/Madam,`, MARGIN, y, { font: fonts.regular, size: 10 }); y -= 18;

  const body = NOTICE_BODY[d.noticeType](d);
  for (const para of body.split('\n\n')) {
    const lines = wrapText(para, fonts.regular, 10, PAGE_W - 2 * MARGIN);
    for (const ln of lines) {
      if (y < 100) { drawFooter(page, fonts, 0, 0); page = pdf.addPage([PAGE_W, PAGE_H]); paintPaper(page); drawMasthead(page, fonts, d.org, 'LEGAL NOTICE', d.caseNumber); y = PAGE_H - MARGIN - 70; }
      drawText(page, ln, MARGIN, y, { font: fonts.regular, size: 10 });
      y -= 14;
    }
    y -= 8;
  }

  y -= 20;
  if (y < 140) { drawFooter(page, fonts, 0, 0); page = pdf.addPage([PAGE_W, PAGE_H]); paintPaper(page); y = PAGE_H - MARGIN - 70; }
  drawText(page, 'Yours faithfully,', MARGIN, y, { font: fonts.regular, size: 10 }); y -= 30;
  drawText(page, `For and on behalf of ${d.org.name || ''}`, MARGIN, y, { font: fonts.bold, size: 10 });

  drawFooter(page, fonts, 0, 0);
  const bytes = await pdf.save();
  return new Blob([new Uint8Array(bytes)], { type: 'application/pdf' });
}

// ============ Helpers ============
function wrapText(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const safe = sanitize(text);
  const words = safe.split(/\s+/);
  const lines: string[] = [];
  let line = '';
  for (const w of words) {
    const candidate = line ? `${line} ${w}` : w;
    const width = font.widthOfTextAtSize(candidate, size);
    if (width > maxWidth && line) { lines.push(line); line = w; }
    else line = candidate;
  }
  if (line) lines.push(line);
  return lines;
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
