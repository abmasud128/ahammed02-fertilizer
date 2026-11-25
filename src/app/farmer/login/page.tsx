'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Wheat,
  Fish,
  Phone,
  KeyRound,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Sparkles,
  ShieldCheck,
  Building2,
  Receipt,
  Waves,
  RefreshCw,
  Home,
  UserPlus,
  Clock,
  Send,
  Check,
} from 'lucide-react';

export default function FarmerLoginPage() {
  const router = useRouter();
  const [lang, setLang] = useState<'en' | 'bn'>('en');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('ahammed_language') || localStorage.getItem('ahammed_lang');
      if (saved === 'bn' || saved === 'en') {
        setLang(saved as 'en' | 'bn');
      }
    } catch {}
  }, []);

  // Selected Portal: null (selection screen first) or 'fertilizer' | 'aquaculture'
  const [selectedPortal, setSelectedPortal] = useState<'fertilizer' | 'aquaculture' | null>(null);

  // Aqua Portal Mode: 'login' | 'register'
  const [aquaMode, setAquaMode] = useState<'login' | 'register'>('login');

  // Login Form State
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [pendingErrorFarmer, setPendingErrorFarmer] = useState<any | null>(null);

  // Aqua Registration Form State
  const [regData, setRegData] = useState({
    fullName: '',
    fatherName: '',
    mobileNumber: '',
    districtId: 'dist-dd',
    blockId: 'blk-balurghat',
    villageId: 'vil-nandair',
    address: '',
    pinCode: '733124',
    pondCount: '1',
    totalWaterAreaDecimal: '50',
    experienceYears: '3',
    primarySpecies: ['রুই', 'কাতলা', 'মৃগেল'],
    consentDataCollection: true,
  });
  const [regLoading, setRegLoading] = useState(false);
  const [regSubmitted, setRegSubmitted] = useState<any | null>(null);

  const isBn = lang === 'bn';

  // Toggle Language
  const toggleLanguage = () => {
    setLang((prev) => {
      const next = prev === 'en' ? 'bn' : 'en';
      try {
        localStorage.setItem('ahammed_language', next);
        localStorage.setItem('ahammed_lang', next);
      } catch {}
      return next;
    });
  };

  // Clean Mobile & Auto-derive first 6 digits
  const cleanMobile = mobile.replace(/\D/g, '').slice(0, 10);
  const first6Digits = cleanMobile.length >= 6 ? cleanMobile.slice(0, 6) : '';

  // Quick Auto-fill Password
  const handleAutoFillDefaultPass = () => {
    if (first6Digits) {
      setPassword(first6Digits);
      setError(null);
    }
  };

  // Quick Demo Login Fill
  const handleQuickDemoFill = (portalType: 'fertilizer' | 'aquaculture', demoMobile: string) => {
    setSelectedPortal(portalType);
    setAquaMode('login');
    setMobile(demoMobile);
    setPassword(demoMobile.slice(0, 6));
    setError(null);
    setPendingErrorFarmer(null);
  };

  // Submit Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setPendingErrorFarmer(null);

    if (!selectedPortal) {
      setError(isBn ? 'দয়া করে পোর্টাল নির্বাচন করুন' : 'Please select a portal first');
      return;
    }

    if (!cleanMobile || cleanMobile.length !== 10) {
      setError(isBn ? 'সঠিক ১০ সংখ্যার মোবাইল নম্বর দিন' : 'Please enter a valid 10-digit mobile number');
      return;
    }

    if (!password.trim()) {
      setError(isBn ? 'পাসওয়ার্ড দিন (মোবাইলের প্রথম ৬টি সংখ্যা)' : 'Please enter your password (first 6 digits of mobile)');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/farmer/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          portal: selectedPortal,
          mobileNumber: cleanMobile,
          password: password.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        if (data.isPending && data.farmer) {
          setPendingErrorFarmer(data.farmer);
        }
        throw new Error(data.error || (isBn ? 'লগইন ব্যর্থ হয়েছে' : 'Login failed'));
      }

      setSuccess(
        isBn
          ? `স্বাগতম ${data.farmer?.fullName || ''}! পোর্টাল খোলা হচ্ছে...`
          : `Welcome ${data.farmer?.fullName || ''}! Opening portal...`
      );

      setTimeout(() => {
        router.push(data.redirectUrl || (selectedPortal === 'fertilizer' ? '/farmer/fertilizer' : '/farmer/dashboard'));
        router.refresh();
      }, 700);
    } catch (err: any) {
      setError(err.message || (isBn ? 'লগইন ত্রুটি' : 'Authentication error'));
    } finally {
      setLoading(false);
    }
  };

  // Submit Aqua Farmer Registration (Submit for Verification)
  const handleAquaRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanRegMobile = regData.mobileNumber.replace(/\D/g, '').slice(0, 10);
    if (!regData.fullName.trim()) {
      setError(isBn ? 'চাষীর পুরো নাম আবশ্যক' : 'Full name is required');
      return;
    }
    if (cleanRegMobile.length !== 10) {
      setError(isBn ? 'সঠিক ১০ সংখ্যার মোবাইল নম্বর দিন' : 'Valid 10-digit mobile number required');
      return;
    }
    if (!regData.consentDataCollection) {
      setError(isBn ? 'তথ্য যাচাইকরণের সম্মতি আবশ্যক' : 'Consent for verification is required');
      return;
    }

    setRegLoading(true);
    try {
      const res = await fetch('/api/farmer/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: regData.fullName.trim(),
          fatherName: regData.fatherName.trim(),
          mobileNumber: cleanRegMobile,
          pin: cleanRegMobile.slice(0, 6),
          districtId: regData.districtId,
          blockId: regData.blockId,
          villageId: regData.villageId,
          address: regData.address.trim(),
          pinCode: regData.pinCode.trim() || '733124',
          pondCount: Number(regData.pondCount) || 1,
          totalWaterAreaDecimal: Number(regData.totalWaterAreaDecimal) || 0,
          experienceYears: Number(regData.experienceYears) || 1,
          primarySpecies: regData.primarySpecies,
          consentDataCollection: true,
          consentDataSharing: true,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Registration submission failed');
      }

      setRegSubmitted(data.farmer);
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setRegLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#061711] text-slate-800 dark:text-slate-100 flex flex-col justify-between p-4 sm:p-6 antialiased">
      {/* ── Top Bar ── */}
      <header className="max-w-4xl w-full mx-auto flex items-center justify-between pb-4">
        <Link
          href="/"
          className="flex items-center gap-2 group hover:opacity-90 transition-opacity"
        >
          <span className="text-2xl">🌾</span>
          <div>
            <span className="font-black text-sm tracking-tight text-forest dark:text-emerald-400 block leading-tight">
              Ahammed Fertilizer
            </span>
            <span className="text-[10px] text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wider block">
              {isBn ? 'চাষী ডিজিটাল সেবা' : 'Farmer Digital Services'}
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="text-xs font-bold text-gray-600 dark:text-gray-300 hover:text-leaf flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/5"
          >
            <Home className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{isBn ? 'হোমপেজ' : 'Home'}</span>
          </Link>

          <button
            type="button"
            onClick={toggleLanguage}
            className="px-3 py-1.5 rounded-xl border border-gray-300 dark:border-white/15 bg-white dark:bg-black/30 font-bold text-xs hover:border-leaf hover:text-leaf transition-colors cursor-pointer"
          >
            {isBn ? 'English' : 'বাংলা'}
          </button>
        </div>
      </header>

      {/* ── Main Container ── */}
      <div className="max-w-xl w-full mx-auto my-auto py-6">
        {/* ═════════════════════════════════════════════════════════════════════ */}
        {/* ── STEP 1: PORTAL SELECTION (FERTILIZER VS AQUACULTURE) ── */}
        {/* ═════════════════════════════════════════════════════════════════════ */}
        {!selectedPortal ? (
          <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="text-center space-y-2">
              <span className="inline-block px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-extrabold uppercase tracking-wider">
                {isBn ? 'চাষী লগইন পোর্টাল' : 'Farmer Portal Access'}
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                {isBn ? 'আপনার পোর্টাল নির্বাচন করুন' : 'Select Your Farmer Portal'}
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 max-w-md mx-auto">
                {isBn
                  ? 'সার, কীটনাশক ও ফসলের হিসাবের জন্য বা মাছ চাষ ব্যবস্থাপনার জন্য লগইন করুন।'
                  : 'Choose whether you want to access your Fertilizer & Crop records or Aquaculture fish farming portal.'}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {/* Option 1: For Fertilizer */}
              <button
                type="button"
                onClick={() => {
                  setSelectedPortal('fertilizer');
                  setError(null);
                }}
                className="p-6 rounded-2xl bg-white dark:bg-[#0c2e21] border-2 border-emerald-600/30 hover:border-emerald-600 hover:shadow-xl dark:border-emerald-800/60 dark:hover:border-emerald-400 text-left transition-all group cursor-pointer flex flex-col justify-between relative overflow-hidden"
              >
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold shadow-xs group-hover:scale-105 transition-transform">
                    <Wheat className="w-6 h-6 text-leaf" />
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-300 inline-block mb-1">
                      {isBn ? 'বিকল্প ১' : 'Option 1'}
                    </span>
                    <h3 className="text-lg font-black text-gray-900 dark:text-white group-hover:text-leaf transition-colors">
                      {isBn ? '১. সার ও কৃষি চাষী' : '1. For Fertilizer'}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                      {isBn
                        ? 'আপনার দোকানের সার/কীটনাশক কেনার রসিদ, খাতার বাকি হিসাব, এবং মাটির রিপোর্ট দেখুন।'
                        : 'Access your fertilizer & pesticide purchase bills, Khata ledger, credit balance, and crop advisories.'}
                    </p>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-gray-100 dark:border-white/10 flex items-center justify-between text-xs font-bold text-leaf group-hover:text-forest dark:group-hover:text-emerald-300">
                  <span>{isBn ? 'সার পোর্টালে যান' : 'Enter Fertilizer'}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>

              {/* Option 2: For Aquaculture */}
              <div className="p-6 rounded-2xl bg-white dark:bg-[#0c2e21] border-2 border-cyan-600/30 hover:border-cyan-500 hover:shadow-xl dark:border-cyan-800/60 dark:hover:border-cyan-400 text-left transition-all group flex flex-col justify-between relative overflow-hidden">
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-cyan-100 dark:bg-cyan-900/60 text-cyan-700 dark:text-cyan-300 flex items-center justify-center font-bold shadow-xs group-hover:scale-105 transition-transform">
                    <Fish className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyan-100 dark:bg-cyan-900 text-cyan-800 dark:text-cyan-300 inline-block mb-1">
                      {isBn ? 'বিকল্প ২' : 'Option 2'}
                    </span>
                    <h3 className="text-lg font-black text-gray-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                      {isBn ? '২. মৎস্য চাষী' : '2. For Aquaculture'}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                      {isBn
                        ? 'পুকুর ব্যবস্থাপনা, মাছের ওজন বৃদ্ধি, ভাসমান ফিড হিসাব ও পানির গুণমান পরীক্ষা।'
                        : 'Manage fish ponds, feeding schedules, biomass growth curves, and water quality testing.'}
                    </p>
                  </div>
                </div>

                {/* Two Distinct Actions for Aquaculture */}
                <div className="pt-4 mt-4 border-t border-gray-100 dark:border-white/10 grid grid-cols-2 gap-2 text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedPortal('aquaculture');
                      setAquaMode('login');
                      setError(null);
                      setPendingErrorFarmer(null);
                    }}
                    className="py-2.5 px-3 rounded-xl bg-cyan-700 hover:bg-cyan-800 text-white flex items-center justify-center gap-1.5 shadow-xs transition-all active:scale-95 cursor-pointer text-xs"
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>{isBn ? 'লগইন' : 'Login'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedPortal('aquaculture');
                      setAquaMode('register');
                      setError(null);
                      setPendingErrorFarmer(null);
                    }}
                    className="py-2.5 px-3 rounded-xl border-2 border-cyan-700 hover:bg-cyan-50 dark:hover:bg-cyan-950 text-cyan-800 dark:text-cyan-300 flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer text-xs"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>{isBn ? 'নতুন নিবন্ধন' : 'Register'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Demo Test Help */}
            <div className="p-4 rounded-xl bg-gray-100/80 dark:bg-white/5 border border-gray-200/60 dark:border-white/10 text-xs text-gray-600 dark:text-gray-300 flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="font-semibold text-center sm:text-left">
                {isBn ? '💡 দ্রুত পরীক্ষার জন্য নমুনা লগইন:' : '💡 Quick test credentials:'}
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickDemoFill('fertilizer', '9832145678')}
                  className="px-2.5 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold text-[11px] hover:bg-emerald-200 cursor-pointer"
                >
                  🌾 Subrata (Fertilizer)
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDemoFill('fertilizer', '9832199847')}
                  className="px-2.5 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold text-[11px] hover:bg-emerald-200 cursor-pointer"
                >
                  🌾 Subhash (Fertilizer)
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDemoFill('aquaculture', '9876543210')}
                  className="px-2.5 py-1 rounded-lg bg-cyan-100 dark:bg-cyan-950 text-cyan-800 dark:text-cyan-300 font-bold text-[11px] hover:bg-cyan-200 cursor-pointer"
                >
                  🐟 Prabir (Aqua)
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* ═════════════════════════════════════════════════════════════════════ */
          /* ── STEP 2: LOGIN FORM (PHONE + FIRST 6 DIGITS PASSWORD) ── */
          /* ═════════════════════════════════════════════════════════════════════ */
          <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
            {/* Active Portal Header & Switcher */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white dark:bg-[#0c2e21] border border-gray-200/80 dark:border-white/10 shadow-xs">
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold ${
                    selectedPortal === 'fertilizer'
                      ? 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300'
                      : 'bg-cyan-100 dark:bg-cyan-900/60 text-cyan-700 dark:text-cyan-300'
                  }`}
                >
                  {selectedPortal === 'fertilizer' ? <Wheat className="w-5 h-5" /> : <Fish className="w-5 h-5" />}
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
                    {isBn ? 'নির্বাচিত পোর্টাল' : 'Selected Portal'}
                  </span>
                  <span className="text-sm font-black text-gray-900 dark:text-white">
                    {selectedPortal === 'fertilizer'
                      ? isBn
                        ? 'সার ও কৃষি চাষী পোর্টাল'
                        : 'Fertilizer & Crops Portal'
                      : isBn
                      ? 'মৎস্য চাষী পোর্টাল'
                      : 'Aquaculture Portal'}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setSelectedPortal(null);
                  setError(null);
                  setPendingErrorFarmer(null);
                }}
                className="text-xs font-bold text-gray-500 hover:text-gray-900 dark:hover:text-white px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/5 cursor-pointer"
              >
                {isBn ? 'পরিবর্তন করুন' : 'Change'}
              </button>
            </div>

            {/* Segmented Control for Aquaculture: 1. Login vs 2. Register */}
            {selectedPortal === 'aquaculture' && (
              <div className="grid grid-cols-2 p-1.5 rounded-2xl bg-cyan-950/10 dark:bg-white/5 border border-cyan-700/20 gap-1.5 shadow-2xs">
                <button
                  type="button"
                  onClick={() => {
                    setAquaMode('login');
                    setError(null);
                  }}
                  className={`py-2.5 px-3 rounded-xl font-extrabold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    aquaMode === 'login'
                      ? 'bg-cyan-700 text-white shadow-md'
                      : 'text-gray-600 dark:text-gray-300 hover:text-cyan-600 dark:hover:text-cyan-400'
                  }`}
                >
                  <KeyRound className="w-4 h-4" />
                  <span>{isBn ? 'লগইন (Login)' : 'Farmer Login'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setAquaMode('register');
                    setError(null);
                  }}
                  className={`py-2.5 px-3 rounded-xl font-extrabold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    aquaMode === 'register'
                      ? 'bg-cyan-700 text-white shadow-md'
                      : 'text-gray-600 dark:text-gray-300 hover:text-cyan-600 dark:hover:text-cyan-400'
                  }`}
                >
                  <UserPlus className="w-4 h-4" />
                  <span>{isBn ? 'নতুন চাষী নিবন্ধন (Register)' : 'New Registration'}</span>
                </button>
              </div>
            )}

            {/* ═══════════════════════════════════════════════════════════════════ */}
            {/* VIEW A: AQUACULTURE NEW FARMER REGISTRATION (SUBMIT FOR VERIFICATION) */}
            {/* ═══════════════════════════════════════════════════════════════════ */}
            {selectedPortal === 'aquaculture' && aquaMode === 'register' ? (
              <div className="bg-white dark:bg-[#0c2e21] rounded-2xl border border-gray-200/80 dark:border-white/10 shadow-md p-6 sm:p-8 space-y-6">
                {regSubmitted ? (
                  /* Post-Submission Verification State */
                  <div className="space-y-6 text-center animate-in fade-in zoom-in-95 py-2">
                    <div className="w-16 h-16 rounded-3xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 mx-auto flex items-center justify-center shadow-md">
                      <Clock className="w-8 h-8 animate-pulse" />
                    </div>

                    <div className="space-y-2">
                      <span className="inline-block px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 text-[11px] font-black uppercase tracking-wider">
                        {isBn ? 'যাচাই প্রক্রিয়াধীন (Pending Verification)' : 'Submitted for Verification'}
                      </span>
                      <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">
                        {isBn ? 'আবেদন সফলভাবে জমা হয়েছে!' : 'Registration Submitted!'}
                      </h2>
                      <p className="text-xs text-gray-600 dark:text-gray-300 max-w-md mx-auto leading-relaxed">
                        {isBn
                          ? 'আপনার মৎস্য চাষী নিবন্ধনের সমস্ত তথ্য আহাম্মেদ ফার্টিলাইজার অ্যাকুয়াকালচার হাবে পাঠানো হয়েছে। অ্যাডমিন পর্যালোচনা করে অনুমোদন (Approve) করার পর আপনি সিস্টেমে লগইন করতে পারবেন।'
                          : 'Your registration details have been submitted to Ahammed Fertilizer Aquaculture Hub. You can log in after admin review and approval.'}
                      </p>
                    </div>

                    {/* Summary Card */}
                    <div className="bg-gray-50 dark:bg-white/5 border border-gray-200/80 dark:border-white/10 rounded-2xl p-4 text-left text-xs space-y-2.5">
                      <div className="flex justify-between items-center pb-2 border-b border-gray-200/50 dark:border-white/10">
                        <span className="text-gray-500">{isBn ? 'নিবন্ধন নম্বর:' : 'Registration ID:'}</span>
                        <span className="font-mono font-black text-emerald-700 dark:text-emerald-400 text-sm">
                          {regSubmitted.registrationNumber}
                        </span>
                      </div>
                      <div className="flex justify-between items-center pb-2 border-b border-gray-200/50 dark:border-white/10">
                        <span className="text-gray-500">{isBn ? 'চাষীর নাম:' : 'Farmer Name:'}</span>
                        <span className="font-bold text-gray-900 dark:text-white">
                          {regSubmitted.fullName}
                        </span>
                      </div>
                      <div className="flex justify-between items-center pb-2 border-b border-gray-200/50 dark:border-white/10">
                        <span className="text-gray-500">{isBn ? 'মোবাইল নম্বর:' : 'Mobile Number:'}</span>
                        <span className="font-mono font-bold text-gray-900 dark:text-white">
                          +91 {regSubmitted.mobileNumber}
                        </span>
                      </div>
                      <div className="flex justify-between items-center pb-2 border-b border-gray-200/50 dark:border-white/10">
                        <span className="text-gray-500">{isBn ? 'পুকুর ও মোট আয়তন:' : 'Ponds & Water Area:'}</span>
                        <span className="font-bold text-gray-900 dark:text-white">
                          {regSubmitted.pondCount} টি পুকুর ({regSubmitted.totalWaterAreaDecimal} শতক)
                        </span>
                      </div>
                      <div className="flex justify-between items-center pt-1 bg-amber-500/10 p-2 rounded-xl border border-amber-500/20">
                        <span className="text-amber-900 dark:text-amber-200 font-semibold">{isBn ? 'লগইন পাসওয়ার্ড:' : 'Login Password:'}</span>
                        <span className="font-mono font-extrabold text-amber-800 dark:text-amber-300">
                          {isBn ? 'মোবাইলের প্রথম ৬টি সংখ্যা' : "First 6 digits of mobile"} ({regSubmitted.mobileNumber.slice(0, 6)})
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 flex flex-col sm:flex-row gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setAquaMode('login');
                          setMobile(regSubmitted.mobileNumber);
                          setPassword(regSubmitted.mobileNumber.slice(0, 6));
                          setRegSubmitted(null);
                        }}
                        className="flex-1 py-3 px-4 rounded-xl bg-cyan-700 hover:bg-cyan-800 text-white font-extrabold text-xs shadow-md transition-all cursor-pointer"
                      >
                        {isBn ? 'লগইন পেজে যান' : 'Go to Login'}
                      </button>
                      <Link
                        href="/"
                        className="py-3 px-4 rounded-xl border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 font-bold text-xs hover:bg-gray-100 dark:hover:bg-white/5 transition-all text-center"
                      >
                        {isBn ? 'হোমপেজে ফিরে যান' : 'Back to Home'}
                      </Link>
                    </div>
                  </div>
                ) : (
                  /* Registration Form */
                  <>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <UserPlus className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                        <h2 className="text-xl font-black text-gray-900 dark:text-white">
                          {isBn ? 'নতুন মৎস্য চাষী নিবন্ধন' : 'Aqua Farmer Registration'}
                        </h2>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                        {isBn
                          ? 'আপনার বিবরণ পূরণ করে "যাচাইয়ের জন্য জমা দিন" বাটনে চাপুন। অ্যাকুয়াকালচার হাবে অ্যাডমিন অনুমোদনের পর আপনি লগইন করতে পারবেন।'
                          : 'Fill details and click "Submit for Verification". Login will be active after admin approval at Aquaculture Hub.'}
                      </p>
                    </div>

                    {error && (
                      <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/60 border border-red-300 text-xs text-red-700 dark:text-red-300 font-bold flex items-center gap-2 animate-in fade-in">
                        <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                        <span>{error}</span>
                      </div>
                    )}

                    <form onSubmit={handleAquaRegister} className="space-y-4 text-xs">
                      {/* Name & Father's Name */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                            {isBn ? 'চাষীর পুরো নাম' : 'Full Name'} <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            placeholder={isBn ? 'যেমন: সন্তোষ পাল' : 'e.g. Santosh Paul'}
                            value={regData.fullName}
                            onChange={(e) => setRegData({ ...regData, fullName: e.target.value })}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-white/15 bg-white dark:bg-black/30 font-bold outline-none focus:ring-2 focus:ring-cyan-600 text-gray-900 dark:text-white"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                            {isBn ? 'পিতা / অভিভাবকের নাম' : "Father's / Guardian's Name"} <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            placeholder={isBn ? 'যেমন: হরিদাস পাল' : 'e.g. Haridas Paul'}
                            value={regData.fatherName}
                            onChange={(e) => setRegData({ ...regData, fatherName: e.target.value })}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-white/15 bg-white dark:bg-black/30 font-bold outline-none focus:ring-2 focus:ring-cyan-600 text-gray-900 dark:text-white"
                          />
                        </div>
                      </div>

                      {/* Mobile Number */}
                      <div>
                        <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                          {isBn ? 'মোবাইল নম্বর (১০ সংখ্যা)' : 'Mobile Number (10 digits)'} <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1 text-xs font-bold text-gray-400 border-r border-gray-200 dark:border-white/10 pr-2">
                            <span>+91</span>
                          </div>
                          <input
                            type="tel"
                            required
                            maxLength={10}
                            placeholder="৯৮৭৬৫৪৩২১০"
                            value={regData.mobileNumber}
                            onChange={(e) => setRegData({ ...regData, mobileNumber: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                            className="w-full pl-16 pr-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-white/15 bg-white dark:bg-black/30 font-bold font-mono outline-none focus:ring-2 focus:ring-cyan-600 text-gray-900 dark:text-white tracking-wider"
                          />
                        </div>
                        <p className="text-[10px] text-gray-400 mt-1">
                          {isBn ? '💡 অনুমোদনের পর এই নম্বরের প্রথম ৬ সংখ্যা হবে আপনার লগইন পাসওয়ার্ড।' : "💡 The first 6 digits of this number will become your login password upon approval."}
                        </p>
                      </div>

                      {/* Block & Village */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                            {isBn ? 'ব্লক' : 'Block'}
                          </label>
                          <select
                            value={regData.blockId}
                            onChange={(e) => setRegData({ ...regData, blockId: e.target.value })}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-white/15 bg-white dark:bg-black/30 font-bold text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-cyan-600"
                          >
                            <option value="blk-balurghat">{isBn ? 'বালুরঘাট (Balurghat)' : 'Balurghat'}</option>
                            <option value="blk-hili">{isBn ? 'হিলি (Hili)' : 'Hili'}</option>
                            <option value="blk-kumarganj">{isBn ? 'কুমারগঞ্জ (Kumarganj)' : 'Kumarganj'}</option>
                            <option value="blk-gangarampur">{isBn ? 'গঙ্গারামপুর (Gangarampur)' : 'Gangarampur'}</option>
                            <option value="blk-banshihari">{isBn ? 'বংশীহারী (Banshihari)' : 'Banshihari'}</option>
                            <option value="blk-tapan">{isBn ? 'তপন (Tapan)' : 'Tapan'}</option>
                          </select>
                        </div>

                        <div>
                          <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                            {isBn ? 'গ্রাম ও পাড়া / এলাকা' : 'Village & Address'} <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            placeholder={isBn ? 'নন্দাইর, পুলিয়াপাড়া' : 'Nandair, Puliyapara'}
                            value={regData.address}
                            onChange={(e) => setRegData({ ...regData, address: e.target.value })}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-white/15 bg-white dark:bg-black/30 font-bold outline-none focus:ring-2 focus:ring-cyan-600 text-gray-900 dark:text-white"
                          />
                        </div>
                      </div>

                      {/* Pond Count & Water Area */}
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                            {isBn ? 'পুকুরের সংখ্যা' : 'Pond Count'}
                          </label>
                          <input
                            type="number"
                            min={1}
                            value={regData.pondCount}
                            onChange={(e) => setRegData({ ...regData, pondCount: e.target.value })}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-white/15 bg-white dark:bg-black/30 font-bold text-center outline-none focus:ring-2 focus:ring-cyan-600 text-gray-900 dark:text-white"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                            {isBn ? 'মোট জলাশয় (শতক)' : 'Total Water (Decimals)'}
                          </label>
                          <input
                            type="number"
                            min={1}
                            value={regData.totalWaterAreaDecimal}
                            onChange={(e) => setRegData({ ...regData, totalWaterAreaDecimal: e.target.value })}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-white/15 bg-white dark:bg-black/30 font-bold text-center outline-none focus:ring-2 focus:ring-cyan-600 text-gray-900 dark:text-white"
                          />
                        </div>
                      </div>

                      {/* Primary Species Selection */}
                      <div>
                        <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                          {isBn ? 'প্রধান চাষের মাছ (Species)' : 'Primary Cultivated Fish'}
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {['রুই', 'কাতলা', 'মৃগেল', 'পাঙ্গাস', 'মাগুর', 'কই'].map((sp) => {
                            const isSelected = regData.primarySpecies.includes(sp);
                            return (
                              <button
                                key={sp}
                                type="button"
                                onClick={() => {
                                  if (isSelected) {
                                    setRegData({ ...regData, primarySpecies: regData.primarySpecies.filter((s) => s !== sp) });
                                  } else {
                                    setRegData({ ...regData, primarySpecies: [...regData.primarySpecies, sp] });
                                  }
                                }}
                                className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                                  isSelected
                                    ? 'bg-cyan-700 text-white shadow-xs'
                                    : 'bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
                                }`}
                              >
                                {isSelected ? '✓ ' : '+ '} {sp}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Consent Checkbox */}
                      <label className="flex items-start gap-2.5 cursor-pointer pt-2 border-t border-gray-100 dark:border-white/10 text-gray-600 dark:text-gray-300">
                        <input
                          type="checkbox"
                          required
                          checked={regData.consentDataCollection}
                          onChange={(e) => setRegData({ ...regData, consentDataCollection: e.target.checked })}
                          className="mt-0.5 rounded text-cyan-600 focus:ring-cyan-500 w-4 h-4 cursor-pointer"
                        />
                        <span className="text-[11px] leading-relaxed">
                          {isBn
                            ? 'আমি আহাম্মেদ ফার্টিলাইজার অ্যাকুয়াকালচার হাবে আমার মৎস্য চাষের তথ্য যাচাই ও সংরক্ষণের সম্মতি দিচ্ছি।'
                            : 'I consent to the verification and storage of my aquaculture details at Ahammed Fertilizer Hub.'}
                        </span>
                      </label>

                      {/* Exact Action Button: "Submit for Verification" */}
                      <button
                        type="submit"
                        disabled={regLoading}
                        className="w-full py-3.5 px-4 rounded-xl bg-cyan-700 hover:bg-cyan-800 text-white font-black text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
                      >
                        {regLoading ? (
                          <>
                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            <span>{isBn ? 'যাচাইয়ের জন্য জমা দেওয়া হচ্ছে...' : 'Submitting for Verification...'}</span>
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4" />
                            <span>
                              {isBn ? 'যাচাইয়ের জন্য জমা দিন (Submit for Verification)' : 'Submit for Verification'}
                            </span>
                          </>
                        )}
                      </button>
                    </form>

                    <div className="pt-3 border-t border-gray-100 dark:border-white/10 text-center">
                      <button
                        type="button"
                        onClick={() => {
                          setAquaMode('login');
                          setError(null);
                        }}
                        className="text-xs font-bold text-cyan-700 dark:text-cyan-400 hover:underline cursor-pointer"
                      >
                        {isBn ? 'ইতিমধ্যে নিবন্ধিত? লগইন করতে এখানে ক্লিক করুন →' : 'Already registered? Click here to Log In →'}
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              /* ═══════════════════════════════════════════════════════════════ */
              /* VIEW B: LOGIN FORM (PHONE + FIRST 6 DIGITS PASSWORD) */
              /* ═══════════════════════════════════════════════════════════════ */
              <div className="bg-white dark:bg-[#0c2e21] rounded-2xl border border-gray-200/80 dark:border-white/10 shadow-md p-6 sm:p-8 space-y-6">
                <div className="space-y-1">
                  <h2 className="text-xl font-black text-gray-900 dark:text-white">
                    {selectedPortal === 'fertilizer'
                      ? isBn
                        ? 'সার ও ফসল একাউন্টে লগইন করুন'
                        : 'Log In to Fertilizer Records'
                      : isBn
                      ? 'মৎস্য চাষী একাউন্টে লগইন করুন'
                      : 'Log In to Aquaculture'}
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {isBn
                      ? 'আপনার অনুমোদিত মোবাইল নম্বর এবং পাসওয়ার্ড লিখুন।'
                      : 'Enter your approved phone number and 6-digit password.'}
                  </p>
                </div>

                {/* Pending Verification Notice Banner */}
                {pendingErrorFarmer && (
                  <div className="p-4 rounded-2xl bg-amber-500/15 border-2 border-amber-500/40 text-amber-900 dark:text-amber-200 text-xs space-y-2 animate-in fade-in">
                    <div className="flex items-center gap-2 font-black text-sm">
                      <Clock className="w-4 h-4 text-amber-600 animate-pulse" />
                      <span>{isBn ? '⏳ আপনার একাউন্টটি যাচাই প্রক্রিয়াধীন রয়েছে' : '⏳ Verification Pending'}</span>
                    </div>
                    <p className="leading-relaxed text-[11px]">
                      {isBn
                        ? `আপনার নিবন্ধন নম্বর: ${pendingErrorFarmer.registrationNumber}। আহাম্মেদ ফার্টিলাইজার অ্যাকুয়াকালচার হাবে আপনার তথ্য পর্যালোচনার জন্য জমা রয়েছে। অ্যাডমিন অনুমোদন (Approve) করার পর আপনি আপনার প্রথম ৬ সংখ্যার পাসওয়ার্ড দিয়ে সিস্টেমে প্রবেশ করতে পারবেন।`
                        : `Your registration (${pendingErrorFarmer.registrationNumber}) is pending review at the Aquaculture Hub. You can log in once approved by the admin.`}
                    </p>
                  </div>
                )}

                {/* Success Notification */}
                {success && (
                  <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 text-xs text-emerald-800 dark:text-emerald-200 font-bold flex items-center gap-2 animate-in fade-in">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{success}</span>
                  </div>
                )}

                {/* Error Notification */}
                {error && !pendingErrorFarmer && (
                  <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/60 border border-red-300 text-xs text-red-700 dark:text-red-300 font-bold flex items-center gap-2 animate-in fade-in">
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <form onSubmit={handleLogin} className="space-y-4">
                  {/* Phone Number Field */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                      {isBn ? 'মোবাইল নম্বর' : 'Phone Number'} <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1 text-xs font-bold text-gray-400 border-r border-gray-200 dark:border-white/10 pr-2">
                        <Phone className="w-3.5 h-3.5 text-leaf" />
                        <span>+91</span>
                      </div>
                      <input
                        type="tel"
                        required
                        maxLength={10}
                        value={mobile}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                          setMobile(val);
                          setError(null);
                          setPendingErrorFarmer(null);
                        }}
                        placeholder="10-digit mobile"
                        className="w-full pl-20 pr-3.5 py-3 rounded-xl border border-gray-300 dark:border-white/15 bg-white dark:bg-black/30 text-sm font-bold tracking-wider outline-none focus:ring-2 focus:ring-leaf text-gray-900 dark:text-white font-mono"
                      />
                    </div>
                  </div>

                  {/* Password Field */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                        {isBn ? 'পাসওয়ার্ড' : 'Password'} <span className="text-red-500">*</span>
                      </label>
                      {first6Digits && password !== first6Digits && (
                        <button
                          type="button"
                          onClick={handleAutoFillDefaultPass}
                          className="text-[11px] font-bold text-leaf hover:underline cursor-pointer"
                        >
                          {isBn ? `প্রথম ৬ সংখ্যা (${first6Digits}) বসান` : `Use default (${first6Digits})`}
                        </button>
                      )}
                    </div>

                    <div className="relative">
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                        <KeyRound className="w-4 h-4 text-leaf" />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          setError(null);
                          setPendingErrorFarmer(null);
                        }}
                        placeholder={isBn ? 'মোবাইলের প্রথম ৬টি সংখ্যা' : "Mobile's first 6 digits"}
                        className="w-full pl-10 pr-10 py-3 rounded-xl border border-gray-300 dark:border-white/15 bg-white dark:bg-black/30 text-sm font-bold tracking-widest outline-none focus:ring-2 focus:ring-leaf text-gray-900 dark:text-white font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>

                    {/* Password Rule Reminder Note */}
                    <div className="mt-2 p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-900/60 text-[11px] text-amber-800 dark:text-amber-200 flex items-start gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                      <span>
                        {isBn
                          ? 'আপনার পাসওয়ার্ড হলো আপনার মোবাইল নম্বরের প্রথম ৬টি সংখ্যা (যেমন: ৯৮৩২১০...)।'
                          : "Your password is the first 6 digits of your registered phone number (e.g. for 9832101234, password is 983210)."}
                      </span>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-3.5 px-4 rounded-xl text-white font-extrabold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-4 ${
                      selectedPortal === 'fertilizer'
                        ? 'bg-leaf hover:bg-forest'
                        : 'bg-cyan-700 hover:bg-cyan-800'
                    }`}
                  >
                    {loading ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>{isBn ? 'যাচাই করা হচ্ছে...' : 'Verifying Credentials...'}</span>
                      </>
                    ) : (
                      <>
                        <span>
                          {selectedPortal === 'fertilizer'
                            ? isBn
                              ? 'সার ও ফসল একাউন্টে প্রবেশ করুন'
                              : 'Log In to Fertilizer Records'
                            : isBn
                            ? 'মৎস্য চাষ পোর্টালে প্রবেশ করুন'
                            : 'Log In to Aquaculture'}
                        </span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>

                {/* Aqua Register Prompt Link */}
                {selectedPortal === 'aquaculture' && (
                  <div className="pt-3 border-t border-gray-100 dark:border-white/10 text-center">
                    <button
                      type="button"
                      onClick={() => {
                        setAquaMode('register');
                        setError(null);
                        setPendingErrorFarmer(null);
                      }}
                      className="text-xs font-bold text-cyan-700 dark:text-cyan-400 hover:underline cursor-pointer"
                    >
                      {isBn ? 'নতুন মাছ চাষী? এখানে ক্লিক করে নতুন নিবন্ধন করুন →' : 'New fish farmer? Click here to register →'}
                    </button>
                  </div>
                )}

                {/* Bottom Switcher Link */}
                <div className="pt-3 border-t border-gray-100 dark:border-white/10 text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedPortal(selectedPortal === 'fertilizer' ? 'aquaculture' : 'fertilizer');
                      setAquaMode('login');
                      setPassword('');
                      setError(null);
                      setPendingErrorFarmer(null);
                    }}
                    className="text-xs font-bold text-gray-500 hover:text-leaf transition-colors cursor-pointer"
                  >
                    {selectedPortal === 'fertilizer'
                      ? isBn
                        ? 'মাছ চাষী? মৎস্য পোর্টালে যেতে ক্লিক করুন →'
                        : 'Fish farmer? Switch to Aquaculture Portal →'
                      : isBn
                      ? 'সার/কীটনাশক খাতা দেখতে চান? সার পোর্টালে যান →'
                      : 'Want store bills & fertilizer khata? Switch to Fertilizer Portal →'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Footer ── */}
      <footer className="max-w-4xl w-full mx-auto text-center pt-4 border-t border-gray-200/60 dark:border-white/10 text-xs text-gray-400">
        <p>
          Ahammed Fertilizer • Dakshin Dinajpur • Govt. Authorized Shop • {isBn ? 'হেল্পলাইন:' : 'Helpline:'} +91 9091017035
        </p>
      </footer>
    </div>
  );
}
