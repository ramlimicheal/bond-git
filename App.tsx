import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { InvoicesPage } from './components/InvoicesPage';
import ProductsPage from './components/ProductsPage';
import ClientsPage from './components/ClientsPage';
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
import { Page } from './types';
import { AuthProvider, useAuth } from './auth.context';

// Protected Route Component
function RequireAuth({ children }: { children: JSX.Element }) {
    const { isAuthenticated } = useAuth();
    const location = useLocation();

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
}

function AppContent() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();
    const location = useLocation();

    // Derive current page from path for Sidebar highlighting
    const getCurrentPage = (): Page => {
        const path = location.pathname;
        if (path === '/dashboard' || path === '/') return Page.DASHBOARD;
        if (path === '/invoices') return Page.DASHBOARD; // Redirects/Aliases
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
        return Page.DASHBOARD;
    };

    const handleNavigate = (page: Page, id?: string) => {
        switch (page) {
            case Page.DASHBOARD: navigate('/dashboard'); break;
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
            default: navigate('/dashboard');
        }
    };

    // Mock Data for Development/Fixing Routes
    const mockQuote: any = {
        id: '1',
        number: 'QT-001',
        status: 'Draft',
        clientName: 'Test Client',
        clientType: 'Test Type',
        createdDate: new Date().toISOString(),
        validUntil: new Date().toISOString(),
        total: 1000,
        items: []
    };

    const mockProposal: any = {
        id: '1',
        number: 'PR-001',
        title: 'Test Proposal',
        status: 'Draft',
        clientName: 'Test Client',
        validUntil: new Date().toISOString(),
        total: 5000,
        content: 'Test Content',
        sections: []
    };

    return (
        <div className="flex h-screen bg-gray-100 dark:bg-gray-900 overflow-hidden">
            <Sidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                currentPage={getCurrentPage()}
                onNavigate={handleNavigate}
            />

            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <header className="h-16 bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-8 flex-shrink-0">
                    <div className="flex items-center gap-4 flex-1">
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="md:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
                        </button>
                        <div className="relative max-w-md w-full">
                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                            </span>
                            <input
                                className="block w-full pl-10 pr-3 py-2 border border-gray-200 dark:border-gray-800 rounded-lg bg-gray-50 dark:bg-gray-900 text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-900"
                                placeholder="Search anything..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-8">
                    <Routes>
                        <Route path="/" element={<Navigate to="/dashboard" replace />} />
                        <Route path="/dashboard" element={<InvoicesPage searchQuery={searchQuery} onNavigate={handleNavigate} />} />
                        <Route path="/products" element={<ProductsPage />} />
                        <Route path="/clients" element={<ClientsPage />} />
                        <Route path="/invoices" element={<Navigate to="/dashboard" replace />} />
                        <Route path="/invoices/new" element={<CreateInvoicePage onBack={() => handleNavigate(Page.DASHBOARD)} onSubmit={(data) => console.log('Invoice data:', data)} />} />
                        <Route path="/invoices/:id" element={<InvoiceDetailsPage onBack={() => handleNavigate(Page.DASHBOARD)} onEdit={() => { }} onDelete={() => { }} invoice={{} as any} />} />
                        <Route path="/quotes" element={<QuotesPage searchQuery={searchQuery} onNavigate={handleNavigate} />} />
                        <Route path="/quotes/new" element={<CreateQuotePage onBack={() => handleNavigate(Page.QUOTES)} onSubmit={() => handleNavigate(Page.QUOTES)} />} />
                        <Route path="/quotes/:id" element={<QuoteDetailsPage quote={mockQuote} onBack={() => handleNavigate(Page.QUOTES)} onEdit={() => { }} onDelete={() => { }} onConvertToInvoice={() => { }} />} />
                        <Route path="/proposals" element={<ProposalsPage searchQuery={searchQuery} onNavigate={handleNavigate} />} />
                        <Route path="/proposals/new" element={<CreateProposalPage onBack={() => handleNavigate(Page.PROPOSALS)} onSubmit={() => handleNavigate(Page.PROPOSALS)} />} />
                        <Route path="/proposals/:id" element={<ProposalDetailsPage proposal={mockProposal} onBack={() => handleNavigate(Page.PROPOSALS)} onEdit={() => { }} onDelete={() => { }} />} />
                        <Route path="/settings" element={<SettingsPage onBack={() => handleNavigate(Page.DASHBOARD)} />} />
                        <Route path="/payment-test" element={
                            <div className="p-8">
                                <h2 className="text-xl mb-4">Payment Gateway Test</h2>
                                <PaymentGateway amount={99.99} onSuccess={(id) => alert(`Paid: ${id}`)} />
                            </div>
                        } />
                    </Routes>
                </main>
            </div>
        </div>
    );
}

function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/*" element={
                        <RequireAuth>
                            <AppContent />
                        </RequireAuth>
                    } />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;
