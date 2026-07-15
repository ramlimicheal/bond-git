import React from 'react';
import { useAuth } from '../auth.context';
import { useOrg } from '../org.context';
import { Icons } from './Icon';
import { Page } from '../types';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

type NavItem = { label: string; icon: keyof typeof Icons; page: Page; match: Page[] };
type NavSection = { title: string; items: NavItem[] };

const SECTIONS: NavSection[] = [
  {
    title: 'Main Menu',
    items: [
      { label: 'Dashboard', icon: 'Dashboard', page: Page.DASHBOARD, match: [Page.DASHBOARD] },
      { label: 'Sales Overview', icon: 'BarChart', page: Page.SALES_OVERVIEW, match: [Page.SALES_OVERVIEW] },
      { label: 'Invoices', icon: 'FileText', page: Page.INVOICES, match: [Page.INVOICES, Page.INVOICE_DETAILS, Page.CREATE_INVOICE] },
      { label: 'Quotes', icon: 'Sales', page: Page.QUOTES, match: [Page.QUOTES, Page.CREATE_QUOTE, Page.QUOTE_DETAILS] },
      { label: 'Proposals', icon: 'Briefcase', page: Page.PROPOSALS, match: [Page.PROPOSALS, Page.CREATE_PROPOSAL, Page.PROPOSAL_DETAILS] },
      { label: 'Finance Reports', icon: 'Reports', page: Page.REPORTS, match: [Page.REPORTS] },
    ],
  },
  {
    title: 'Customers',
    items: [
      { label: 'Clients', icon: 'User', page: Page.CLIENTS, match: [Page.CLIENTS] },
      { label: 'Products & Services', icon: 'Grid', page: Page.PRODUCTS, match: [Page.PRODUCTS] },
      { label: 'Accounts & Users', icon: 'Users', page: Page.ACCOUNTS, match: [Page.ACCOUNTS] },
    ],
  },
  {
    title: 'Legal',
    items: [
      { label: 'Legal Cases', icon: 'Scale', page: Page.LEGAL_CASES, match: [Page.LEGAL_CASES] },
      { label: 'Lawyers', icon: 'Gavel', page: Page.LAWYERS, match: [Page.LAWYERS] },
      { label: 'Lawyer Portal', icon: 'Shield', page: Page.LAWYER_PORTAL, match: [Page.LAWYER_PORTAL] },
    ],
  },
  {
    title: 'Settings',
    items: [
      { label: 'System Settings', icon: 'Settings', page: Page.SETTINGS, match: [Page.SETTINGS] },
    ],
  },
];

const ChevronsUpDown = ({ className = '' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m7 15 5 5 5-5" /><path d="m7 9 5-5 5 5" />
  </svg>
);

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, currentPage, onNavigate }) => {
  const { logout, user } = useAuth();
  const { org } = useOrg();

  const handleLogout = async () => {
    try { await logout(); window.location.href = '/'; } catch (e) { console.error('Logout failed', e); }
  };
  const handleNav = (page: Page) => { onNavigate(page); onClose(); };

  const orgName = org?.name || 'Your Studio';
  const orgInitial = orgName.charAt(0).toUpperCase();
  const orgType = (org as any)?.org_type === 'agency' ? 'Agency' : 'Freelancer';
  const userEmail = user?.email ?? '';
  const userInitial = (userEmail[0] || 'U').toUpperCase();

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/40 z-40 md:hidden backdrop-blur-sm" onClick={onClose} />
      )}

      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-[248px] shrink-0 h-full
          flex flex-col justify-between py-4 px-3
          bg-[#F1EFE8] border-r border-[#E8E4D8]
          transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
      >
        <div className="flex-1 min-h-0 overflow-y-auto pr-1">
          {/* Org selector */}
          <div className="flex items-center justify-between bg-white border border-[#E5E5E5] rounded-lg p-2 mb-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 bg-[#1A1A1A] rounded-md flex items-center justify-center text-white font-bold text-sm shrink-0">
                {orgInitial}
              </div>
              <div className="min-w-0">
                <div className="text-[10px] text-[#808080] uppercase tracking-wider font-semibold">{orgType}</div>
                <div className="font-semibold text-sm text-[#1A1A1A] truncate">{orgName}</div>
              </div>
            </div>
            <ChevronsUpDown className="w-4 h-4 text-[#808080] shrink-0" />
          </div>

          {SECTIONS.map((section) => (
            <div key={section.title} className="mb-5">
              <div className="text-[11px] text-[#808080] font-semibold mb-2 px-2 uppercase tracking-wider">{section.title}</div>
              <nav className="space-y-0.5">
                {section.items.map((item) => {
                  const Ico = (Icons as any)[item.icon];
                  const active = item.match.includes(currentPage);
                  return (
                    <button
                      key={item.label}
                      onClick={() => handleNav(item.page)}
                      className={`w-full flex items-center gap-3 px-2 py-2 rounded-md text-[13px] font-medium transition-colors
                        ${active
                          ? 'bg-white text-[#0F172A] shadow-[0_1px_2px_rgba(0,0,0,0.05)] border border-gray-100'
                          : 'text-[#808080] hover:bg-gray-100/70 hover:text-[#1A1A1A]'}`}
                    >
                      {Ico ? <Ico size={16} /> : null}
                      {item.label}
                    </button>
                  );
                })}
              </nav>
            </div>
          ))}
        </div>

        {/* User profile card */}
        <div className="pt-3 border-t border-[#E5E5E5]">
          <div className="flex items-center justify-between bg-white border border-[#E5E5E5] rounded-lg p-2 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
            <div className="flex items-center gap-2 min-w-0">
              <div className="relative shrink-0">
                <div className="w-8 h-8 rounded-full bg-[#1A1A1A] text-white flex items-center justify-center font-semibold text-sm">
                  {userInitial}
                </div>
                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full" />
              </div>
              <div className="min-w-0">
                <div className="font-semibold text-[13px] leading-tight text-[#0F172A] truncate">{userEmail || 'Signed in'}</div>
                <div className="text-[11px] text-[#808080]">Owner</div>
              </div>
            </div>
            <button onClick={handleLogout} title="Log out" className="text-[#808080] hover:text-red-600 p-1">
              <Icons.ChevronDown size={16} />
            </button>
          </div>
        </div>

        <button onClick={onClose} className="md:hidden absolute top-3 right-3 text-[#808080]">
          <Icons.Clear size={18} />
        </button>
      </aside>
    </>
  );
};