import { supabase } from '../src/integrations/supabase/client';

// Take an org row and return a shallow copy where `logo_url` is a fetchable URL
// suitable for pdfGenerator. Storage paths (e.g. "<orgId>/logo.png") are
// resolved into short-lived signed URLs; http(s) and data: URLs pass through.
export async function resolveOrgBranding<T extends Record<string, any>>(org: T | null | undefined): Promise<T | null | undefined> {
  if (!org) return org;
  const raw = (org as any).logo_url as string | null | undefined;
  if (!raw) return org;
  if (/^(https?:|data:)/i.test(raw)) return org;
  try {
    const { data, error } = await supabase.storage.from('brand-assets').createSignedUrl(raw, 300);
    if (error || !data?.signedUrl) return { ...org, logo_url: null };
    return { ...org, logo_url: data.signedUrl };
  } catch {
    return { ...org, logo_url: null };
  }
}