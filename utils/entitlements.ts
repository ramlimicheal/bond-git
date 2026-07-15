// Server-truth entitlement + usage-meter helpers.
// Backed by SQL functions public.check_entitlement / public.increment_usage_meter
// created in the Chunk 1 migration. Enforcement lives in dataStore.ts and the
// notice/AI/case flows; this module is the single source of RPC calls.
import { supabase } from '../src/integrations/supabase/client';

export type Meter =
  | 'invoices'
  | 'quotes'
  | 'proposals'
  | 'notices_sent'
  | 'ai_tokens'
  | 'lawyer_cases'
  | 'seats';

export interface EntitlementResult {
  allowed: boolean;
  reason?: string;
  used?: number;
  limit?: number;
  remaining?: number;
  unlimited?: boolean;
  plan?: string;
}

export async function checkEntitlement(orgId: string, feature: Meter): Promise<EntitlementResult> {
  const { data, error } = await (supabase as any).rpc('check_entitlement', {
    _org_id: orgId,
    _feature: feature,
  });
  if (error) return { allowed: false, reason: 'rpc_error' };
  return (data ?? { allowed: false, reason: 'no_data' }) as EntitlementResult;
}

export async function incrementUsage(orgId: string, meter: Meter, delta = 1): Promise<number | null> {
  const { data, error } = await (supabase as any).rpc('increment_usage_meter', {
    _org_id: orgId,
    _meter: meter,
    _delta: delta,
  });
  if (error) {
    console.error('[usage] increment failed', meter, error);
    return null;
  }
  return Number(data ?? 0);
}