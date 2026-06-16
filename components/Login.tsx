
import React, { useState } from 'react';
import { useAuth } from '../auth.context.tsx';
import { supabase } from '../src/integrations/supabase/client';
import { Link, useNavigate } from 'react-router-dom';
import { AuthLayout } from './AuthLayout.tsx';

type AuthMode = 'login' | 'forgot' | 'reset';

export const Login: React.FC = () => {
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
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
        const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/login`,
        });
        if (err) throw err;
        setSuccess('Check your email for the reset link.');
      } else if (mode === 'reset') {
        if (password !== confirmPassword) {
          throw new Error('Passwords do not match');
        }
        if (password.length < 8) {
          throw new Error('Password must be at least 8 characters');
        }
        const { error: err } = await supabase.auth.updateUser({ password });
        if (err) throw err;
        setSuccess('Password reset successfully! You can now sign in.');
        setMode('login');
        setPassword('');
        setConfirmPassword('');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError(null);
    setLoading(true);
    try {
      await loginWithGoogle();
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Google sign-in failed');
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

      {mode === 'login' && (
        <>
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
        </>
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
            onClick={() => { setMode('login'); setError(null); setSuccess(null); }}
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
