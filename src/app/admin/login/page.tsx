'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail, ShieldCheck, Store, ArrowRight, AlertCircle, KeyRound, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get('returnUrl') || '/admin';

  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [infoMessage, setInfoMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setInfoMessage('');

    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid admin email address.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/auth/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || 'Could not send OTP.');
        setIsLoading(false);
        return;
      }
      setOtpSent(true);
      setInfoMessage(data.message || '6-digit OTP sent to your email.');
    } catch {
      setError('Network error. Could not connect to server.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!/^\d{6}$/.test(otp.trim())) {
      setError('Please enter the 6-digit OTP sent to your email.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/auth/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: otp.trim() }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || 'Invalid or expired OTP.');
        setIsLoading(false);
        return;
      }
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
              Admin OTP Login • Nandair, Chapmatali
            </p>
          </div>

          {/* Info Message */}
          {infoMessage && (
            <div className="mb-5 p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-start gap-2.5 shadow-xs">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{infoMessage}</span>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs flex items-start gap-2.5 shadow-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Email + OTP Form */}
          <form onSubmit={otpSent ? handleVerifyOtp : handleSendOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-forest dark:text-cream mb-1.5">
                Authorized Admin Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  disabled={otpSent}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="abmasud128@gmail.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-forest/20 dark:border-leaf/20 bg-white dark:bg-dark-surface text-sm text-forest dark:text-cream placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-leaf transition-all disabled:opacity-60"
                />
              </div>
            </div>

            {otpSent && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-forest dark:text-cream">
                    6-Digit Email OTP
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setOtpSent(false);
                      setOtp('');
                      setInfoMessage('');
                      setError('');
                    }}
                    className="text-[11px] font-bold text-leaf hover:underline"
                  >
                    Change Email
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    required
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="123456"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-forest/20 dark:border-leaf/20 bg-white dark:bg-dark-surface text-sm tracking-[0.35em] font-mono font-bold text-forest dark:text-cream placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-leaf transition-all"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-forest hover:bg-forest/90 dark:bg-leaf dark:hover:bg-leaf/90 text-white dark:text-forest text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-70 disabled:pointer-events-none"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  <span>{otpSent ? 'Verifying OTP...' : 'Sending OTP...'}</span>
                </>
              ) : (
                <>
                  <span>{otpSent ? 'Verify & Sign In' : 'Send 6-Digit OTP'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {otpSent && (
              <button
                type="button"
                disabled={isLoading}
                onClick={handleSendOtp}
                className="w-full py-2 text-xs font-bold text-forest dark:text-emerald-300 hover:underline disabled:opacity-50"
              >
                Didn&apos;t receive the code? Resend OTP
              </button>
            )}
          </form>

          <div className="mt-6 flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-leaf" />
              <span>OTP Protected Admin Access</span>
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
