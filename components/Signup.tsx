
import React, { useState } from 'react';
import { useAuth } from '../auth.context.tsx';
import { useNavigate, Link } from 'react-router-dom';
import { AuthLayout } from './AuthLayout.tsx';

export const Signup: React.FC = () => {
    const { register, loginWithGoogle } = useAuth();
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [companyName, setCompanyName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [terms, setTerms] = useState(true);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            if (password !== confirmPassword) {
                throw new Error("Passwords don't match");
            }
            if (password.length < 8) {
                throw new Error('Password must be at least 8 characters');
            }
            await register(name, email, password, companyName);
            navigate('/dashboard');
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogle = async () => {
        setError(null);
        setLoading(true);
        try { await loginWithGoogle(); navigate('/dashboard'); }
        catch (err: any) { setError(err.message || 'Google sign-in failed'); }
        finally { setLoading(false); }
    };

    return (
        <AuthLayout title="Create Account">
            {error && (
                <div className="mb-6 p-3 bg-red-50 border-l-2 border-red-500 text-sm text-red-600">
                    {error}
                </div>
            )}
            <button
              type="button"
              onClick={handleGoogle}
              disabled={loading}
              className="w-full mb-6 py-3 border border-gray-300 dark:border-gray-700 rounded-full text-sm font-bold uppercase tracking-wider hover:bg-gray-50 dark:hover:bg-gray-900 transition-all flex items-center justify-center gap-3"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              Continue with Google
            </button>
            <div className="relative flex items-center mb-6">
              <div className="flex-grow border-t border-gray-200 dark:border-gray-800"></div>
              <span className="mx-4 text-[10px] text-gray-400 uppercase tracking-widest">Or</span>
              <div className="flex-grow border-t border-gray-200 dark:border-gray-800"></div>
            </div>
            <form className="space-y-8" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="group input-underline">
                        <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1 group-focus-within:text-mint transition-colors">Your Name</label>
                        <input
                            className="w-full py-2 bg-transparent border-b border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:border-mint/0 transition-all text-sm font-medium"
                            placeholder="Jane Doe"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>
                    <div className="group input-underline">
                        <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1 group-focus-within:text-mint transition-colors">Email Address</label>
                        <input
                            className="w-full py-2 bg-transparent border-b border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:border-mint/0 transition-all text-sm font-medium"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                </div>

                <div className="group input-underline">
                    <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1 group-focus-within:text-mint transition-colors">Company / Business Name</label>
                    <input
                        className="w-full py-2 bg-transparent border-b border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:border-mint/0 transition-all text-sm font-medium"
                        placeholder="Acme Studio"
                        type="text"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        required
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="group input-underline relative">
                        <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1 group-focus-within:text-mint transition-colors">Password</label>
                        <input
                            className="w-full py-2 bg-transparent border-b border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:border-mint/0 transition-all text-sm font-medium tracking-widest"
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <button
                            className="absolute right-0 bottom-2 text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            <span className="material-icons-outlined text-xs">{showPassword ? 'visibility' : 'visibility_off'}</span>
                        </button>
                    </div>
                    <div className="group input-underline relative">
                        <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1 group-focus-within:text-mint transition-colors">Confirm Password</label>
                        <input
                            className="w-full py-2 bg-transparent border-b border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:border-mint/0 transition-all text-sm font-medium tracking-widest"
                            type={showConfirmPassword ? "text" : "password"}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative flex items-center">
                        <input
                            checked={terms}
                            onChange={(e) => setTerms(e.target.checked)}
                            className="peer h-4 w-4 cursor-pointer appearance-none rounded-sm border border-gray-400 dark:border-gray-600 bg-transparent transition-all checked:border-mint checked:bg-mint"
                            id="terms"
                            type="checkbox"
                            required
                        />
                        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-black opacity-0 peer-checked:opacity-100 pointer-events-none">
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                        </span>
                    </div>
                    <label className="text-xs text-gray-500 cursor-pointer select-none" htmlFor="terms">I agree to the <a className="text-gray-900 dark:text-white hover:text-mint transition-colors underline decoration-gray-300 dark:decoration-gray-700 underline-offset-2" href="#">Terms</a> and <a className="text-gray-900 dark:text-white hover:text-mint transition-colors underline decoration-gray-300 dark:decoration-gray-700 underline-offset-2" href="#">Privacy Policy</a></label>
                </div>

                <div className="pt-4">
                    <button
                        className="w-full py-3.5 bg-mint hover:bg-mint/90 text-black font-bold uppercase tracking-wider text-sm rounded-full shadow-lg shadow-mint/20 hover:shadow-mint/30 hover:-translate-y-0.5 transition-all duration-300"
                        type="submit"
                        disabled={loading}
                    >
                        {loading ? 'Creating Account...' : 'Create Account'}
                    </button>
                </div>

                <div className="text-center text-xs font-medium">
                    <span className="text-gray-500">Already a member? </span>
                    <Link to="/login" className="text-mint hover:text-gray-900 dark:hover:text-white transition-colors ml-1 uppercase tracking-wide font-bold">Sign In</Link>
                </div>
            </form>
        </AuthLayout>
    );
};
