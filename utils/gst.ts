// India GST helpers — SAC 9983 (Other professional, technical and business services) at 18% default.
// Intra-state → CGST 9 + SGST 9; Inter-state → IGST 18.

export const DEFAULT_SAC = '9983';
export const DEFAULT_GST_RATE = 18;

export type GstSplit = {
  rate: number;
  intraState: boolean;
  cgst: number;
  sgst: number;
  igst: number;
  total: number;
};

export function computeGst(taxableAmount: number, rate: number, intraState: boolean): GstSplit {
  const amt = Math.max(0, taxableAmount);
  const r = Math.max(0, rate);
  const total = +(amt * r / 100).toFixed(2);
  if (intraState) {
    const half = +(total / 2).toFixed(2);
    return { rate: r, intraState, cgst: half, sgst: total - half, igst: 0, total };
  }
  return { rate: r, intraState, cgst: 0, sgst: 0, igst: total, total };
}

export function inr(amount: number): string {
  return `₹${Math.round(amount).toLocaleString('en-IN')}`;
}

export function isIntraState(orgState?: string | null, clientState?: string | null): boolean {
  if (!orgState || !clientState) return true; // safe default; user can flip
  return orgState.trim().toLowerCase() === clientState.trim().toLowerCase();
}