import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { InvoicesPage } from './components/InvoicesPage';
import ProductsPage from './components/ProductsPage';
import ClientsPage from './components/ClientsPage';
import { AccountsPage } from './components/AccountsPage';
import { CreateInvoicePage } from './components/CreateInvoicePage';
import { InvoiceDetailsPage } from './components/InvoiceDetailsPage';
import { SettingsPage } from './components/SettingsPage';
import { QuotesPage } from './components/QuotesPage';
import { CreateQuotePage } from './components/CreateQuotePage';
import { QuoteDetailsPage } from './components/QuoteDetailsPage';
import { ProposalsPage } from './components/ProposalsPage';
import { CreateProposalPage } from './components/CreateProposalPage';
import { ProposalDetailsPage } from './components/ProposalDetailsPage';
import { PaymentGateway } from './components/PaymentGateway';
import { Login } from './components/Login';
import { Signup } from './components/Signup';
import DashboardPage from './components/Dashboard';
import SalesOverviewPage from './components/SalesOverviewPage';
import FinanceReportsPage from './components/FinanceReportsPage';
import LegalCasesPage from './components/LegalCasesPage';
import LawyersPage from './components/LawyersPage';
import OnboardingPage from './components/OnboardingPage';
import LandingPage from './components/LandingPage';
import LawyerPortalPage from './components/LawyerPortalPage';
import AdminConsolePage from './components/AdminConsolePage';
import { Page, Invoice, Quote, Proposal } from './types';
import { useAuth } from './auth.context';
import { OrgProvider, useOrg } from './org.context';
import { useQuotes, useProposals, useInvoices } from './dataStore';
import { toast } from './components/Toast';

// Protected Route Component
function RequireAuth({ children }: { children: JSX.Element }) {
    const { isAuthenticated, loading } = useAuth();
    const location = useLocation();

    if (loading) return <div className="flex items-center justify-center min-h-screen text-gray-500">Loading…</div>;
    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
}

// Redirect signed-in users away from public pages (landing/login/signup).
function RedirectIfAuthed({ children }: { children: JSX.Element }) {
    const { isAuthenticated, loading } = useAuth();
    if (loading) return <div className="flex items-center justify-center min-h-screen text-gray-500">Loading…</div>;
    if (isAuthenticated) return <Navigate to="/dashboard" replace />;
    return children;
}

// ====== ROUTE WRAPPERS — look up entity by :id ======
function InvoiceDetailsRoute() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { items, loading, remove } = useInvoices();
    const invoice = items.find(i => i.id === id) || null;
    if (loading) return <div className="p-8 text-gray-500">Loading…</div>;
    if (!invoice) return (
        <div className="p-8 text-center">
            <h2 className="text-xl font-bold mb-2">Invoice not found</h2>
            <button onClick={() => navigate('/invoices')} className="text-sm text-gray-500 underline">Back to invoices</button>
        </div>
    );
    return (
        <InvoiceDetailsPage
            invoice={invoice}
            onBack={() => navigate('/invoices')}
            onEdit={() => navigate('/invoices')}
            onDelete={async (iid) => { await remove(iid); toast.success('Invoice deleted'); navigate('/invoices'); }}
        />
    );
}

function QuoteDetailsRoute() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { items, remove } = useQuotes();
    const quote = items.find(q => q.id === id);

    if (!quote) return (
        <div className="p-8 text-center">
            <h2 className="text-xl font-bold mb-2">Quote not found</h2>
            <button onClick={() => navigate('/quotes')} className="text-sm text-gray-500 underline">Back to quotes</button>
        </div>
    );
    return (
        <QuoteDetailsPage
            quote={quote}
            onBack={() => navigate('/quotes')}
            onEdit={() => navigate('/quotes')}
            onDelete={(qid) => { remove(qid); toast.success('Quote deleted'); navigate('/quotes'); }}
            onConvertToInvoice={() => {
                toast.success('Converting to invoice…');
                navigate('/invoices/new', {
                    state: {
                        prefill: {
                            clientName: quote.clientName,
                            items: quote.items,
                            notes: `Converted from quote ${quote.number}`,
                        },
                    },
                });
            }}
        />
    );
}

function ProposalDetailsRoute() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { items, remove } = useProposals();
    const proposal = items.find(p => p.id === id);

    if (!proposal) return (
        <div className="p-8 text-center">
            <h2 className="text-xl font-bold mb-2">Proposal not found</h2>
            <button onClick={() => navigate('/proposals')} className="text-sm text-gray-500 underline">Back to proposals</button>
        </div>
    );
    return (
        <ProposalDetailsPage
            proposal={proposal}
            onBack={() => navigate('/proposals')}
            onEdit={() => navigate('/proposals')}
            onDelete={(pid) => { remove(pid); toast.success('Proposal deleted'); navigate('/proposals'); }}
        />
    );
}

function AppContent() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();
    const location = useLocation();
    const { org, loading: orgLoading } = useOrg();
    const { create: createQuote } = useQuotes();
    const { create: createProposal } = useProposals();
    const { create: createInvoice } = useInvoices();

    // First-run onboarding redirect
    useEffect(() => {
        if (orgLoading) return;
        if (!org) return;
        if (org.onboarded === false && location.pathname !== '/onboarding') {
            navigate('/onboarding', { replace: true });
        }
    }, [org, orgLoading, location.pathname, navigate]);

    if (location.pathname === '/onboarding') return <OnboardingPage />;

    // Derive current page from path for Sidebar highlighting
    const getCurrentPage = (): Page => {
        const path = location.pathname;
        if (path === '/dashboard') return Page.DASHBOARD;
        if (path === '/sales') return Page.SALES_OVERVIEW;
        if (path === '/invoices') return Page.INVOICES;
        if (path.startsWith('/invoices/new')) return Page.CREATE_INVOICE;
        if (path.startsWith('/invoices/')) return Page.INVOICE_DETAILS;
        if (path === '/quotes') return Page.QUOTES;
        if (path === '/quotes/new') return Page.CREATE_QUOTE;
        if (path.startsWith('/quotes/')) return Page.QUOTE_DETAILS;
        if (path === '/proposals') return Page.PROPOSALS;
        if (path === '/proposals/new') return Page.CREATE_PROPOSAL;
        if (path.startsWith('/proposals/')) return Page.PROPOSAL_DETAILS;
        if (path === '/clients') return Page.CLIENTS;
        if (path === '/products') return Page.PRODUCTS;
        if (path === '/settings') return Page.SETTINGS;
        if (path === '/accounts') return Page.ACCOUNTS;
        if (path === '/reports') return Page.REPORTS;
        if (path === '/legal/cases') return Page.LEGAL_CASES;
        if (path === '/legal/lawyers') return Page.LAWYERS;
        return Page.DASHBOARD;
    };

    const handleNavigate = (page: Page, id?: string) => {
        switch (page) {
            case Page.DASHBOARD: navigate('/dashboard'); break;
            case Page.SALES_OVERVIEW: navigate('/sales'); break;
            case Page.INVOICES: navigate('/invoices'); break;
            case Page.INVOICE_DETAILS: navigate(id ? `/invoices/${id}` : '/invoices'); break;
            case Page.CREATE_INVOICE: navigate('/invoices/new'); break;
            case Page.QUOTES: navigate('/quotes'); break;
            case Page.CREATE_QUOTE: navigate('/quotes/new'); break;
            case Page.QUOTE_DETAILS: navigate(id ? `/quotes/${id}` : '/quotes'); break;
            case Page.PROPOSALS: navigate('/proposals'); break;
            case Page.CREATE_PROPOSAL: navigate('/proposals/new'); break;
            case Page.PROPOSAL_DETAILS: navigate(id ? `/proposals/${id}` : '/proposals'); break;
            case Page.CLIENTS: navigate('/clients'); break;
            case Page.PRODUCTS: navigate('/products'); break;
            case Page.SETTINGS: navigate('/settings'); break;
            case Page.ACCOUNTS: navigate('/accounts'); break;
            case Page.REPORTS: navigate('/reports'); break;
            case Page.LEGAL_CASES: navigate('/legal/cases'); break;
            case Page.LAWYERS: navigate('/legal/lawyers'); break;
            case Page.LAWYER_PORTAL: navigate('/lawyer'); break;
            default: navigate('/dashboard');
        }
    };

    // Breadcrumb from path
    const crumbs = (() => {
        const p = location.pathname.split('/').filter(Boolean);
        if (p.length === 0) return ['Dashboard', 'Overview'];
        const first = p[0].charAt(0).toUpperCase() + p[0].slice(1);
        const second = p[1] ? (isNaN(Number(p[1])) ? p[1].charAt(0).toUpperCase() + p[1].slice(1) : 'Details') : 'Overview';
        return [first, second];
    })();

    return (
        <div className="flex h-screen bg-white overflow-hidden">
            <Sidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                currentPage={getCurrentPage()}
                onNavigate={handleNavigate}
            />

            <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-white">
                <header className="h-[60px] bg-white/90 backdrop-blur border-b border-neutral-200 flex items-center justify-between px-6 flex-shrink-0 sticky top-0 z-10">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="md:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
                        </button>
                        <div className="flex items-center text-sm text-[#808080]">
                            <span>{crumbs[0]}</span>
                            <svg className="w-3 h-3 mx-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
                            <span className="font-semibold text-[#0F172A] capitalize">{crumbs[1]}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="relative hidden md:block">
                            <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
                            <input
                                className="pl-9 pr-14 py-1.5 text-sm bg-gray-50 border border-gray-200 rounded-md w-[260px] focus:outline-none focus:ring-1 focus:ring-gray-300 placeholder-gray-400 text-[#0F172A]"
                                placeholder="Search invoices, clients…"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1 pointer-events-none">
                                <kbd className="px-1.5 py-0.5 text-[10px] bg-white border border-gray-200 rounded text-gray-500">⌘</kbd>
                                <kbd className="px-1.5 py-0.5 text-[10px] bg-white border border-gray-200 rounded text-gray-500">K</kbd>
                            </div>
                        </div>
                        <button className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 relative" title="Notifications">
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" /></svg>
                            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full border border-white" />
                        </button>
                        <button className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500" title="Inbox">
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12" /><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" /></svg>
                        </button>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-6">
                    <Routes>
                        <Route path="/dashboard" element={<DashboardPage />} />
                        <Route path="/sales" element={<SalesOverviewPage />} />
                        <Route path="/reports" element={<FinanceReportsPage />} />
                        <Route path="/legal/cases" element={<LegalCasesPage />} />
                        <Route path="/legal/lawyers" element={<LawyersPage />} />
                        <Route path="/lawyer" element={<LawyerPortalPage />} />
                        <Route path="/accounts" element={<AccountsPage searchQuery={searchQuery} />} />
                        <Route path="/products" element={<ProductsPage />} />
                        <Route path="/clients" element={<ClientsPage />} />
                        <Route path="/invoices" element={<InvoicesPage searchQuery={searchQuery} onNavigate={handleNavigate} />} />
                        <Route path="/invoices/new" element={<CreateInvoicePage onBack={() => handleNavigate(Page.INVOICES)} onSubmit={async (data) => {
                            const created = await createInvoice(data as any);
                            if (created) { toast.success('Invoice saved'); navigate(`/invoices/${created.id}`); }
                            else toast.error('Could not save invoice');
                        }} />} />
                        <Route path="/invoices/:id" element={<InvoiceDetailsRoute />} />
                        <Route path="/quotes" element={<QuotesPage searchQuery={searchQuery} onNavigate={handleNavigate} />} />
                        <Route path="/quotes/new" element={<CreateQuotePage onBack={() => handleNavigate(Page.QUOTES)} onSubmit={(data: any) => { createQuote({ ...data, createdDate: new Date().toLocaleDateString('en-GB'), number: data?.number || `QT-${Date.now()}`, status: 'Draft' }); toast.success('Quote created'); handleNavigate(Page.QUOTES); }} />} />
                        <Route path="/quotes/:id" element={<QuoteDetailsRoute />} />
                        <Route path="/proposals" element={<ProposalsPage searchQuery={searchQuery} onNavigate={handleNavigate} />} />
                        <Route path="/proposals/new" element={<CreateProposalPage onBack={() => handleNavigate(Page.PROPOSALS)} onSubmit={(data: any) => { createProposal({ ...data, createdDate: new Date().toLocaleDateString('en-GB'), number: data?.number || `PROP-${Date.now()}`, status: 'Draft' }); toast.success('Proposal created'); handleNavigate(Page.PROPOSALS); }} />} />
                        <Route path="/proposals/:id" element={<ProposalDetailsRoute />} />
                        <Route path="/settings" element={<SettingsPage onBack={() => handleNavigate(Page.DASHBOARD)} />} />
                        <Route path="/payment-test" element={
                            <div className="p-8">
                                <h2 className="text-xl mb-4">Payment Gateway Test</h2>
                                <PaymentGateway amount={99.99} onSuccess={(id) => alert(`Paid: ${id}`)} />
                            </div>
                        } />
                        <Route path="*" element={<div className="p-8 text-center"><h2 className="text-xl font-bold mb-2">Page not found</h2><button onClick={() => navigate('/dashboard')} className="text-sm text-gray-500 underline">Go to Dashboard</button></div>} />
                    </Routes>
                </main>
            </div>
        </div>
    );
}

function App() {
    return (
        <OrgProvider>
            <Router>
                <Routes>
                    <Route path="/" element={<RedirectIfAuthed><LandingPage /></RedirectIfAuthed>} />
                    <Route path="/login" element={<RedirectIfAuthed><Login /></RedirectIfAuthed>} />
                    <Route path="/signup" element={<RedirectIfAuthed><Signup /></RedirectIfAuthed>} />
                    <Route path="/admin" element={<RequireAuth><AdminConsolePage /></RequireAuth>} />
                    <Route path="/*" element={
                        <RequireAuth>
                            <AppContent />
                        </RequireAuth>
                    } />
                </Routes>
            </Router>
        </OrgProvider>
    );
}

export default App;
