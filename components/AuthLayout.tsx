
import React from 'react';
import { useTheme } from '../theme.context';

type AuthLayoutProps = {
    children: React.ReactNode;
    title: string;
};

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title }) => {
    const { theme, toggleTheme } = useTheme();
    return (
        <div className="min-h-screen font-body antialiased bg-background-light dark:bg-black text-gray-900 dark:text-gray-100 flex items-center justify-center p-4">

            <div className="w-full max-w-5xl bg-white dark:bg-gray-900 rounded-3xl overflow-hidden shadow-2xl flex min-h-[600px] border border-gray-200 dark:border-gray-800">
                {/* Left Side: Grid Pattern & Branding */}
                <div className="hidden lg:flex w-5/12 bg-grid-pattern relative flex-col justify-between p-12 text-white">
                    <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-black/0 to-black/80 pointer-events-none"></div>

                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-8 h-8 bg-mint rounded-lg flex items-center justify-center text-black">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <span className="text-xl font-bold font-display tracking-tight text-white">Billently</span>
                        </div>
                        <h1 className="text-3xl font-bold font-display leading-tight">
                            The new standard <br /> for modern invoicing.
                        </h1>
                    </div>

                    <div className="relative z-10 space-y-6">
                        <div className="p-6 bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl">
                            <p className="text-gray-300 italic text-sm mb-4">"Billently transformed how we handle payments. The interface is simply beautiful and the features are exactly what we needed."</p>
                            <div className="flex items-center gap-3">
                                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="User" className="w-8 h-8 rounded-full bg-gray-700" />
                                <div>
                                    <p className="text-white text-xs font-bold">Alex Chen</p>
                                    <p className="text-gray-500 text-[10px]">Founder, Studio Chen</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-2 text-gray-500 text-xs">
                            <span>© 2026 Billently Inc.</span>
                        </div>
                    </div>
                </div>

                {/* Right Side: Minimal form */}
                <div className="w-full lg:w-7/12 p-8 md:p-16 flex flex-col justify-center bg-white dark:bg-gray-900 relative">
                    {/* Theme Toggle */}
                    <button
                        onClick={toggleTheme}
                        className="absolute top-6 right-6 p-2 rounded-full text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                    >
                        <span className="material-icons-outlined">
                            {theme === 'dark' ? 'light_mode' : 'dark_mode'}
                        </span>
                    </button>
                    {/* Mobile Header Logo */}
                    <div className="lg:hidden flex items-center gap-2 mb-8">
                        <div className="w-8 h-8 bg-mint rounded-lg flex items-center justify-center text-black">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                        <span className="text-xl font-bold font-display tracking-tight text-gray-900 dark:text-white">Billently</span>
                    </div>

                    <div className="max-w-md mx-auto w-full">
                        <h2 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white font-display">{title}</h2>
                        <p className="text-gray-500 dark:text-gray-400 mb-10 text-sm">Welcome to the future of workspace.</p>
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
};
