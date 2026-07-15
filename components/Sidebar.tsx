import React, { useState } from 'react';
import { useTheme } from '../theme.context';
import { useAuth } from '../auth.context';
import { Icons } from './Icon';
import { Page } from '../types';
import GithubSyncBadge from './GithubSyncBadge';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, currentPage, onNavigate }) => {
  const [salesOpen, setSalesOpen] = useState(true);
  const [legalOpen, setLegalOpen] = useState(true);
  const { theme, toggleTheme } = useTheme();
  const { logout, user } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      window.location.href = '/';
    } catch (e) {
      console.error('Logout failed', e);
    }
  };

  const handleNav = (page: Page) => {
    onNavigate(page);
    onClose(); // Close mobile menu on navigation
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`
          fixed md:static inset-y-0 left-0 z-50
          w-64 bg-white dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800 
          flex flex-col flex-shrink-0 h-full transition-all duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        <div className="h-16 flex items-center justify-between px-6 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gray-900 dark:bg-white text-white dark:text-black rounded flex items-center justify-center font-bold text-lg">B</div>
            <span className="font-bold text-lg tracking-tight text-gray-900 dark:text-white">BILLENTY</span>
          </div>
          <button onClick={onClose} className="md:hidden text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
            <Icons.X size={20} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
          <button
            onClick={() => handleNav(Page.DASHBOARD)}
            className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${currentPage === Page.DASHBOARD
              ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
              : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
              }`}
          >
            <Icons.Dashboard size={20} />
            Dashboard
          </button>

          <div className="pt-2">
            <button
              onClick={() => setSalesOpen(!salesOpen)}
              className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Icons.Sales size={20} />
                Sales
              </div>
              <Icons.ChevronDown size={16} className={`transform transition-transform ${salesOpen ? 'rotate-180' : ''}`} />
            </button>

            {salesOpen && (
              <div className="pl-10 space-y-1 mt-1">
                <button
                  type="button"
                  onClick={() => handleNav(Page.SALES_OVERVIEW)}
                  className="block w-full text-left px-3 py-2 text-sm font-medium rounded-md text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors"
                >
                  Sales Overview
                </button>
                <button
                  type="button"
                  onClick={() => handleNav(Page.INVOICES)}
                  className={`block w-full text-left px-3 py-2 text-sm font-medium rounded-md transition-colors cursor-pointer ${currentPage === Page.INVOICES || currentPage === Page.INVOICE_DETAILS || currentPage === Page.CREATE_INVOICE
                    ? 'text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-800'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800/50'
                    }`}
                >
                  Invoices
                </button>
                <button
                  type="button"
                  onClick={() => handleNav(Page.QUOTES)}
                  className={`block w-full text-left px-3 py-2 text-sm font-medium rounded-md transition-colors cursor-pointer ${currentPage === Page.QUOTES || currentPage === Page.CREATE_QUOTE || currentPage === Page.QUOTE_DETAILS
                    ? 'text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-800'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800/50'
                    }`}
                >
                  Quotes
                </button>
                <button
                  type="button"
                  onClick={() => handleNav(Page.PROPOSALS)}
                  className={`block w-full text-left px-3 py-2 text-sm font-medium rounded-md transition-colors cursor-pointer ${currentPage === Page.PROPOSALS || currentPage === Page.CREATE_PROPOSAL || currentPage === Page.PROPOSAL_DETAILS
                    ? 'text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-800'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800/50'
                    }`}
                >
                  Proposals
                </button>
              </div>
            )}
          </div>

          {/* Legal section */}
          <div className="pt-2">
            <button
              onClick={() => setLegalOpen(!legalOpen)}
              className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Icons.Scale size={20} />
                Legal
              </div>
              <Icons.ChevronDown size={16} className={`transform transition-transform ${legalOpen ? 'rotate-180' : ''}`} />
            </button>
            {legalOpen && (
              <div className="pl-10 space-y-1 mt-1">
                <button
                  type="button"
                  onClick={() => handleNav(Page.LEGAL_CASES)}
                  className={`block w-full text-left px-3 py-2 text-sm font-medium rounded-md transition-colors cursor-pointer ${currentPage === Page.LEGAL_CASES ? 'text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-800' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800/50'}`}
                >
                  Legal Cases
                </button>
                <button
                  type="button"
                  onClick={() => handleNav(Page.LAWYERS)}
                  className={`block w-full text-left px-3 py-2 text-sm font-medium rounded-md transition-colors cursor-pointer ${currentPage === Page.LAWYERS ? 'text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-800' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800/50'}`}
                >
                  Lawyers
                </button>
                <button
                  type="button"
                  onClick={() => handleNav(Page.LAWYER_PORTAL)}
                  className={`block w-full text-left px-3 py-2 text-sm font-medium rounded-md transition-colors cursor-pointer ${currentPage === Page.LAWYER_PORTAL ? 'text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-800' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800/50'}`}
                >
                  Lawyer Portal
                </button>
              </div>
            )}
          </div>

          <button
            onClick={() => handleNav(Page.ACCOUNTS)}
            className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${currentPage === Page.ACCOUNTS
              ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
              : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
              }`}
          >
            <Icons.Users size={20} />
            Accounts & Users
          </button>

          <button
            onClick={() => handleNav(Page.CLIENTS)}
            className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${currentPage === Page.CLIENTS
              ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
              : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
              }`}
          >
            <Icons.User size={20} />
            Clients
          </button>

          <button
            onClick={() => handleNav(Page.PRODUCTS)}
            className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${currentPage === Page.PRODUCTS
              ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
              : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
              }`}
          >
            <Icons.Sales size={20} />
            Products
          </button>

          <button
            onClick={() => handleNav(Page.REPORTS)}
            className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${currentPage === Page.REPORTS
              ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
              : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
              }`}
          >
            <Icons.Reports size={20} />
            Finance Reports
          </button>

          <button
            onClick={() => handleNav(Page.SETTINGS)}
            className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${currentPage === Page.SETTINGS
              ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
              : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
              }`}
          >
            <Icons.Settings size={20} />
            Settings
          </button>
        </nav>

        <div className="p-4 border-t border-gray-200 dark:border-gray-800">
          <GithubSyncBadge />
          {user && (
            <div className="mb-3 px-1">
              <p className="text-[11px] text-gray-500 dark:text-gray-500 truncate" title={user.email ?? ''}>
                {user.email}
              </p>
            </div>
          )}
          <button
            onClick={toggleTheme}
            className="w-full flex items-center justify-center gap-2 py-2 px-4 border border-gray-200 dark:border-gray-700 rounded-md text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            {theme === 'dark' ? <Icons.Sun size={16} /> : <Icons.Moon size={16} />}
            {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </button>
          <button
            onClick={handleLogout}
            className="mt-2 w-full flex items-center justify-center gap-2 py-2 px-4 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 rounded-md text-xs font-medium hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
          >
            <Icons.X size={16} />
            Log out
          </button>
        </div>
      </aside>
    </>
  );
};