'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, Mail, ShieldCheck, Eye, EyeOff, Store, ArrowRight, AlertCircle } from 'lucide-react';
import Link from 'next/link';

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get('returnUrl') || '/admin';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Please provide both email and password.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || 'Authentication failed. Please verify credentials.');
        setIsLoading(false);
        return;
      }

      // Successful login
      router.push(returnUrl);
      router.refresh();
    } catch {
      setError('Network error. Could not connect to server.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-[#07241B] via-[#0B3D2E] to-[#123829] text-gray-100">
      <div className="w-full max-w-md">
        {/* Card Container */}
        <div className="bg-white/95 dark:bg-[#0c221a]/95 backdrop-blur-xl rounded-2xl p-6 sm:p-8 shadow-2xl border border-white/20 text-gray-900 dark:text-gray-100 transition-all">
          {/* Logo & Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-forest to-leaf text-white shadow-lg shadow-green-950/30 mb-3">
              <Store className="w-7 h-7 text-harvest" />
            </div>
            <h1 className="text-2xl font-black text-forest dark:text-cream tracking-tight">
              Ahammed Fertilizer
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-medium">
              Private Admin Portal & POS System • Nandair, Chapmatali
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs flex items-start gap-2.5 shadow-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-forest dark:text-cream mb-1.5">
                Staff Email / Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="owner@example.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-forest/20 dark:border-leaf/20 bg-white dark:bg-dark-surface text-sm text-forest dark:text-cream placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-leaf transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-forest dark:text-cream">
                  Password
                </label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-forest/20 dark:border-leaf/20 bg-white dark:bg-dark-surface text-sm text-forest dark:text-cream placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-leaf transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-forest hover:bg-forest/90 dark:bg-leaf dark:hover:bg-leaf/90 text-white dark:text-forest text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-70 disabled:pointer-events-none"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Sign-In Credentials Box */}
          <div className="mt-5 pt-4 border-t border-gray-100 dark:border-white/10 space-y-2">
            <div className="text-[11px] font-black text-gray-500 uppercase tracking-wider text-center flex items-center justify-center gap-1.5">
              <span>⚡ Quick Sign-In Credentials</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => {
                  setEmail('owner@ahammed.com');
                  setPassword('admin123');
                }}
                className="p-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-white/5 dark:hover:bg-white/10 border border-emerald-200 dark:border-white/10 text-left transition-all group"
              >
                <div className="font-black text-emerald-900 dark:text-emerald-300 text-[11px] group-hover:underline">
                  👤 Owner (Click to Fill)
                </div>
                <div className="text-[10px] text-gray-600 dark:text-gray-400 font-mono truncate">owner@ahammed.com</div>
                <div className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold">Pass: admin123</div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setEmail('cashier@ahammed.com');
                  setPassword('admin123');
                }}
                className="p-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-white/5 dark:hover:bg-white/10 border border-emerald-200 dark:border-white/10 text-left transition-all group"
              >
                <div className="font-black text-emerald-900 dark:text-emerald-300 text-[11px] group-hover:underline">
                  👤 Cashier (Click to Fill)
                </div>
                <div className="text-[10px] text-gray-600 dark:text-gray-400 font-mono truncate">cashier@ahammed.com</div>
                <div className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold">Pass: admin123</div>
              </button>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-leaf" />
              <span>TLS 256-bit Encrypted</span>
            </span>
            <Link href="/" className="hover:text-forest dark:hover:text-cream underline">
              Back to Public Shop
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#07241B] text-white">
          <div className="w-8 h-8 border-4 border-leaf border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <LoginFormContent />
    </Suspense>
  );
}
