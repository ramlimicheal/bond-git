import React, { useState } from 'react';
import { supabase } from '../src/integrations/supabase/client';
import { useOrg } from '../org.context';
import { useAuth } from '../auth.context';
import { toast } from './Toast';
import { Icons } from './Icon';

// One-click demo data loader. Inserts a realistic Indian design-studio dataset
// into the current org so the dashboard isn't empty on first login.
export const DemoSeedButton: React.FC = () => {
  const { orgId, refresh } = useOrg();
  const { user } = useAuth();
  const db = supabase as any;
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);

  const seed = async () => {
    if (!orgId || !user) { toast.error('No workspace ready'); return; }
    const { data: existing } = await supabase.from('clients').select('id').eq('org_id', orgId).limit(1);
    if (existing && existing.length > 0) {
      toast.info('Demo data already loaded');
      setDone(true);
      return;
    }
    setRunning(true);
    try {
      // 1) Clients (3)
      const clientsPayload = [
        { org_id: orgId, name: 'Aarav Mehta', company_name: 'Lumen & Co.', email: 'aarav@lumen.in', phone: '+91 98200 11122', state: 'Maharashtra', country: 'India', gstin: '27AAAPL1234C1ZV', created_by: user.id },
        { org_id: orgId, name: 'Priya Nair', company_name: 'Banyan Hospitality', email: 'priya@banyan.co.in', phone: '+91 98444 33221', state: 'Karnataka', country: 'India', gstin: '29AABCB9999D1Z7', created_by: user.id },
        { org_id: orgId, name: 'Rohan Sethi', company_name: 'Northwind Labs', email: 'rohan@northwind.io', phone: '+91 99999 88877', state: 'Delhi', country: 'India', created_by: user.id },
      ];
      const { data: clients, error: cerr } = await db.from('clients').insert(clientsPayload).select('id, name');
      if (cerr) throw cerr;

      // 2) Lawyer (single platform-marketplace row, owned by current user so RLS lets us see it)
      const { data: existingLawyer } = await db.from('lawyers').select('id').eq('user_id', user.id).maybeSingle();
      let lawyerId = existingLawyer?.id as string | undefined;
      if (!lawyerId) {
        const { data: lw, error: lerr } = await db.from('lawyers').insert({
          user_id: user.id,
          full_name: 'Adv. Nisha Kapoor',
          email: 'nisha@kapoorlegal.in',
          bar_council_no: 'D/1234/2018',
          states: ['Delhi', 'Maharashtra'],
          specialties: ['Commercial recovery', 'Contract drafting'],
          rate_per_hour: 3500,
          active: true,
          verified: true,
        }).select('id').single();
        if (lerr) throw lerr;
        lawyerId = lw.id;
      }

      // 3) Invoices (paid + overdue + draft)
      const today = new Date();
      const iso = (d: Date) => d.toISOString().slice(0, 10);
      const dPast = (days: number) => { const d = new Date(today); d.setDate(d.getDate() - days); return d; };
      const invoicesPayload = [
        { org_id: orgId, client_id: clients[0].id, number: `INV-${Date.now().toString().slice(-6)}-1`, status: 'Paid', issued_date: iso(dPast(60)), due_date: iso(dPast(45)), subtotal: 120000, tax: 21600, total: 141600, amount_paid: 141600, currency: 'INR', sac_code: '9983', tax_rate: 18, created_by: user.id },
        { org_id: orgId, client_id: clients[1].id, number: `INV-${Date.now().toString().slice(-6)}-2`, status: 'Pending', issued_date: iso(dPast(50)), due_date: iso(dPast(35)), subtotal: 250000, tax: 45000, total: 295000, amount_paid: 0, currency: 'INR', sac_code: '9983', tax_rate: 18, attached_lawyer_id: lawyerId, created_by: user.id },
        { org_id: orgId, client_id: clients[2].id, number: `INV-${Date.now().toString().slice(-6)}-3`, status: 'Draft', issued_date: iso(today), due_date: iso(new Date(today.getTime() + 15 * 86400000)), subtotal: 75000, tax: 13500, total: 88500, amount_paid: 0, currency: 'INR', sac_code: '9983', tax_rate: 18, created_by: user.id },
      ];
      const { data: invs, error: ierr } = await db.from('invoices').insert(invoicesPayload).select('id, number');
      if (ierr) throw ierr;

      // 4) Invoice items
      const itemsPayload = [
        { invoice_id: invs[0].id, description: 'Brand identity system — Lumen & Co.', quantity: 1, rate: 120000, amount: 120000 },
        { invoice_id: invs[1].id, description: 'Website redesign — Banyan Hospitality (12 pages)', quantity: 1, rate: 200000, amount: 200000 },
        { invoice_id: invs[1].id, description: 'Photography art direction (1 shoot day)', quantity: 1, rate: 50000, amount: 50000 },
        { invoice_id: invs[2].id, description: 'Logo exploration — Northwind Labs', quantity: 1, rate: 75000, amount: 75000 },
      ];
      const { error: iiErr } = await db.from('invoice_items').insert(itemsPayload);
      if (iiErr) throw iiErr;

      // 5) A draft legal notice on the overdue one
      await db.from('legal_notices').insert({
        org_id: orgId,
        invoice_id: invs[1].id,
        lawyer_id: lawyerId,
        subject: `Demand notice — Invoice ${invs[1].number}`,
        ai_draft: `**Subject:** Demand notice for recovery of outstanding payment under Invoice ${invs[1].number}\n\nDear Banyan Hospitality team,\n\nUnder instructions from my client and per the invoice referenced above (amount outstanding: ₹2,95,000), this is a formal demand to remit payment within 15 days from receipt of this notice. Failing payment, my client reserves the right to initiate proceedings under the Indian Contract Act, 1872 and Order XXXVII of the Code of Civil Procedure.\n\n— Adv. Nisha Kapoor (D/1234/2018)`,
        status: 'draft',
      });

      // 6) A signed proposal + a sent quote
      await db.from('proposals').insert({
        org_id: orgId, client_id: clients[2].id, number: `PROP-${Date.now().toString().slice(-6)}`, title: 'Northwind Labs — Identity sprint', status: 'Signed', total_value: 350000, currency: 'INR', valid_days: 30, project_type: 'Brand Identity', created_by: user.id,
      });
      await db.from('quotes').insert({
        org_id: orgId, client_id: clients[0].id, number: `QT-${Date.now().toString().slice(-6)}`, title: 'Lumen — Packaging system Q2', status: 'Sent', subtotal: 180000, tax: 32400, total: 212400, currency: 'INR', valid_until: iso(new Date(today.getTime() + 30 * 86400000)), created_by: user.id,
      });

      await refresh();
      toast.success('Demo data loaded');
      setDone(true);
    } catch (e) {
      toast.error(`Could not load demo data: ${(e as Error).message}`);
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Icons.Plus size={16} /> Load demo data
          </h3>
          <p className="text-xs text-gray-500 mt-1 max-w-md">Drops in 3 sample clients, 1 lawyer, 3 invoices (paid / overdue with notice / draft), a signed proposal, and a sent quote — all in ₹ with 18% GST. Great for previewing dashboards.</p>
        </div>
        <button
          onClick={seed}
          disabled={running || done}
          className="text-xs font-medium px-3 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 dark:bg-white dark:text-gray-900 disabled:opacity-50 whitespace-nowrap"
        >
          {done ? 'Loaded ✓' : running ? 'Loading…' : 'Load demo'}
        </button>
      </div>
    </div>
  );
};

export default DemoSeedButton;