
import React, { useState } from 'react';
import { useAuth } from '../auth.context.tsx';
import { useNavigate, Link } from 'react-router-dom';
import { AuthLayout } from './AuthLayout.tsx';

export const Signup: React.FC = () => {
    const { register } = useAuth();
    const navigate = useNavigate();
    const [name, setName] = useState('jdmobbin');
    const [email, setEmail] = useState('jdoe.mobbin@gmail.com');
    const [password, setPassword] = useState('Password123!');
    const [confirmPassword, setConfirmPassword] = useState('Password123!');
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
            await register(name, email, password);
            navigate('/dashboard');
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout title="Create Account">
            {error && (
                <div className="mb-6 p-3 bg-red-50 border-l-2 border-red-500 text-sm text-red-600">
                    {error}
                </div>
            )}
            <form className="space-y-8" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="group input-underline">
                        <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1 group-focus-within:text-mint transition-colors">Username</label>
                        <input
                            className="w-full py-2 bg-transparent border-b border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:border-mint/0 transition-all text-sm font-medium"
                            placeholder="jdmobbin"
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
