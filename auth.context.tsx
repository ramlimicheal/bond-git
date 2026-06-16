import React, { createContext, useContext, useState, useEffect } from 'react';
import type { AuthResponse } from './api.types.ts';

interface AuthContextValue {
  user: AuthResponse['user'] | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthResponse['user'] | null>(() => {
    if (typeof window === 'undefined') return null;
    const stored = localStorage.getItem('auth_user');
    if (!stored) return null;
    try { return JSON.parse(stored); }
    catch { localStorage.removeItem('auth_user'); return null; }
  });

  const login = async (email: string, password: string) => {
    if (!email || !password) throw new Error('Email and password required');
    const mockUser = { id: 1, email, name: email.split('@')[0] || 'User', role: 'admin' };
    localStorage.setItem('auth_token', 'mock-token');
    localStorage.setItem('auth_user', JSON.stringify(mockUser));
    setUser(mockUser);
  };

  const register = async (name: string, email: string, password: string) => {
    if (!name || !email || !password) throw new Error('All fields required');
    const mockUser = { id: 1, email, name, role: 'admin' };
    localStorage.setItem('auth_token', 'mock-token');
    localStorage.setItem('auth_user', JSON.stringify(mockUser));
    setUser(mockUser);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('auth_user');
    localStorage.removeItem('auth_token');
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
