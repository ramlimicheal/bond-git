
import React, { useState } from 'react';
import { useAuth } from '../auth.context.tsx';
import { forgotPassword, resetPassword } from '../api.client.ts';
import { Link, useNavigate } from 'react-router-dom';
import { AuthLayout } from './AuthLayout.tsx';

type AuthMode = 'login' | 'forgot' | 'reset';

export const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        await login(email, password);
        navigate('/dashboard');
      } else if (mode === 'forgot') {
        const result = await forgotPassword(email);
        setSuccess('If an account exists, reset instructions have been sent.');
        if (result._devToken) {
          setResetToken(result._devToken);
          setMode('reset');
        }
      } else if (mode === 'reset') {
        if (password !== confirmPassword) {
          throw new Error('Passwords do not match');
        }
        if (password.length < 8) {
          throw new Error('Password must be at least 8 characters');
        }
        await resetPassword(resetToken, password);
        setSuccess('Password reset successfully! You can now sign in.');
        setMode('login');
        setPassword('');
        setConfirmPassword('');
        setResetToken('');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getTitle = () => {
    switch (mode) {
      case 'login': return 'Welcome back.';
      case 'forgot': return 'Reset Password';
      case 'reset': return 'New Password';
    }
  };

  const getButtonText = () => {
    if (loading) return 'Please wait…';
    switch (mode) {
      case 'login': return 'Sign In';
      case 'forgot': return 'Send Link';
      case 'reset': return 'Update Password';
    }
  };

  return (
    <AuthLayout title={getTitle()}>
      {success && (
        <div className="mb-6 p-3 bg-green-500/10 border-l-2 border-green-500 text-sm text-green-500">
          {success}
        </div>
      )}
      {error && (
        <div className="mb-6 p-3 bg-red-500/10 border-l-2 border-red-500 text-sm text-red-500">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {(mode === 'login' || mode === 'forgot') && (
          <div className="group input-underline">
            <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1 group-focus-within:text-mint transition-colors">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full py-2 bg-transparent border-b border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:border-mint/0 transition-all text-sm font-medium"
              placeholder="email@example.com"
            />
          </div>
        )}

        {mode === 'reset' && (
          <div className="group input-underline">
            <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1 group-focus-within:text-mint transition-colors">Reset Token</label>
            <input
              type="text"
              required
              value={resetToken}
              onChange={(e) => setResetToken(e.target.value)}
              className="w-full py-2 bg-transparent border-b border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:border-mint/0 transition-all text-sm font-medium font-mono"
            />
          </div>
        )}

        {(mode === 'login' || mode === 'reset') && (
          <div className="group input-underline">
            <div className="flex items-center justify-between mb-1">
              <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest group-focus-within:text-mint transition-colors">
                {mode === 'reset' ? 'New Password' : 'Password'}
              </label>
              {mode === 'login' && (
                <button
                  type="button"
                  onClick={() => { setMode('forgot'); setError(null); setSuccess(null); }}
                  className="text-[10px] font-bold text-gray-400 hover:text-gray-900 dark:text-gray-500 dark:hover:text-white transition-colors uppercase tracking-wider"
                >
                  Forgot?
                </button>
              )}
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full py-2 bg-transparent border-b border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:border-mint/0 transition-all text-sm font-medium tracking-widest pr-8"
              />
              <button
                className="absolute right-0 bottom-2 text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
                type="button"
                onClick={() => setShowPassword(!showPassword)}
              >
                <span className="material-icons-outlined text-xs">{showPassword ? 'visibility' : 'visibility_off'}</span>
              </button>
            </div>
          </div>
        )}

        {mode === 'reset' && (
          <div className="group input-underline">
            <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1 group-focus-within:text-mint transition-colors">Confirm Password</label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full py-2 bg-transparent border-b border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:border-mint/0 transition-all text-sm font-medium tracking-widest"
            />
          </div>
        )}

        <div className="pt-4">
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-mint hover:bg-mint/90 text-black font-bold uppercase tracking-wider text-sm rounded-full shadow-lg shadow-mint/20 hover:shadow-mint/30 hover:-translate-y-0.5 transition-all duration-300"
          >
            {getButtonText()}
          </button>
        </div>
      </form>

      <div className="text-center text-xs font-medium pt-4">
        {mode === 'login' && (
          <div>
            <span className="text-gray-500">Not a member? </span>
            <Link to="/signup" className="text-mint hover:text-gray-900 dark:hover:text-white transition-colors ml-1 uppercase tracking-wide font-bold">Sign Up Now</Link>
          </div>
        )}

        {(mode === 'forgot' || mode === 'reset') && (
          <button
            type="button"
            onClick={() => { setMode('login'); setError(null); setSuccess(null); setResetToken(''); }}
            className="text-gray-400 hover:text-gray-900 dark:text-gray-500 dark:hover:text-white transition-colors flex items-center justify-center gap-1 mx-auto uppercase tracking-wider text-[10px] font-bold"
          >
            <span className="material-icons-outlined text-xs">arrow_back</span>
            Back to login
          </button>
        )}
      </div>
    </AuthLayout >
  );
};
