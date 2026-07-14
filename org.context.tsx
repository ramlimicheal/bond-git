import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from './src/integrations/supabase/client';
import { useAuth } from './auth.context';

export interface Organization {
  id: string;
  name: string;
  legal_name: string | null;
  gstin: string | null;
  pan: string | null;
  email: string | null;
  phone: string | null;
  website?: string | null;
  logo_url: string | null;
  signature_url: string | null;
  upi_vpa: string | null;
  bank_name?: string | null;
  bank_account_number?: string | null;
  bank_ifsc?: string | null;
  invoice_prefix: string | null;
  quote_prefix: string | null;
  proposal_prefix: string | null;
  default_terms?: string | null;
  default_notes?: string | null;
  plan: string;
  trial_ends_at: string;
  created_at: string;
  type?: 'freelancer' | 'agency';
  seat_limit?: number;
  state?: string | null;
  address_line1?: string | null;
  city?: string | null;
  pincode?: string | null;
  country?: string | null;
  default_state_code?: string | null;
  default_sac?: string | null;
  default_tax_rate?: number | null;
  auto_notice_enabled?: boolean;
  auto_notice_days?: number;
  notifications?: { email?: Record<string, boolean>; whatsapp?: Record<string, boolean> } | null;
  onboarded?: boolean;
}

interface OrgContextValue {
  org: Organization | null;
  orgId: string | null;
  role: 'owner' | 'admin' | 'accountant' | 'viewer' | null;
  loading: boolean;
  refresh: () => Promise<void>;
}

const OrgContext = createContext<OrgContextValue | undefined>(undefined);

export const OrgProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading: authLoading } = useAuth();
  const [org, setOrg] = useState<Organization | null>(null);
  const [role, setRole] = useState<OrgContextValue['role']>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) {
      setOrg(null);
      setRole(null);
      setLoading(false);
      return;
    }
    setLoading(true);

    // Find membership
    const { data: membership } = await supabase
      .from('organization_members')
      .select('org_id, role')
      .eq('user_id', user.id)
      .order('joined_at', { ascending: true })
      .limit(1)
      .maybeSingle();

    let orgId = membership?.org_id ?? null;
    let memberRole = (membership?.role as OrgContextValue['role']) ?? null;

    // Auto-create org if user has none yet (covers Google sign-ins)
    if (!orgId) {
      const meta = (user.user_metadata || {}) as Record<string, string>;
      const name = meta.company_name || meta.full_name || meta.name || (user.email?.split('@')[0] ?? 'My Company');
      const { data: newOrg, error } = await supabase
        .from('organizations')
        .insert({ name, email: user.email, created_by: user.id })
        .select('id')
        .single();
      if (!error && newOrg) {
        orgId = newOrg.id;
        memberRole = 'owner';
      }
    }

    if (orgId) {
      const { data: o } = await supabase.from('organizations').select('*').eq('id', orgId).single();
      setOrg((o as Organization) ?? null);
      setRole(memberRole);
    } else {
      setOrg(null);
      setRole(null);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => { if (!authLoading) load(); }, [authLoading, load]);

  return (
    <OrgContext.Provider value={{ org, orgId: org?.id ?? null, role, loading, refresh: load }}>
      {children}
    </OrgContext.Provider>
  );
};

export function useOrg() {
  const ctx = useContext(OrgContext);
  if (!ctx) throw new Error('useOrg must be used within OrgProvider');
  return ctx;
}