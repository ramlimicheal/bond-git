import { useCallback, useEffect, useState } from 'react';
import { useOrg } from '../org.context';
import { checkEntitlement, type EntitlementResult, type Meter } from '../utils/entitlements';

// UI-side entitlement reader. Server is the source of truth; this exists so
// existing components can display remaining counts / gate buttons without
// changing look and feel. Refetches whenever the org context refreshes.
export function useEntitlement(feature: Meter) {
  const { orgId } = useOrg();
  const [state, setState] = useState<EntitlementResult>({ allowed: true });
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!orgId) return;
    setLoading(true);
    setState(await checkEntitlement(orgId, feature));
    setLoading(false);
  }, [orgId, feature]);

  useEffect(() => { refresh(); }, [refresh]);

  return { ...state, loading, refresh };
}