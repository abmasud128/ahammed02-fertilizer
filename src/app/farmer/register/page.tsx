'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AQUA_DICTIONARY, AquaLocale } from '@/lib/i18n/aqua-dictionary';
import { AquaDistrict, AquaBlock, AquaVillage } from '@/types/aqua';
import { Fish, ArrowLeft, CheckCircle2, AlertCircle, ShieldAlert, Clock } from 'lucide-react';

export default function FarmerRegisterPage() {
  const router = useRouter();
  const [locale, setLocale] = useState<AquaLocale>('en');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('ahammed_language') || localStorage.getItem('ahammed_lang');
      if (saved === 'bn' || saved === 'en') {
        setLocale(saved as AquaLocale);
      }
    } catch {}
  }, []);

  const d = AQUA_DICTIONARY[locale];

  const [districts, setDistricts] = useState<AquaDistrict[]>([]);
  const [blocks, setBlocks] = useState<AquaBlock[]>([]);
  const [villages, setVillages] = useState<AquaVillage[]>([]);

  const [formData, setFormData] = useState({
    fullName: '',
    mobileNumber: '',
    pin: '',
    districtId: 'dist-dd',
    blockId: 'blk-balurghat',
    villageId: 'vil-nandair',
    address: '',
    pinCode: '733124',
    experienceYears: '3',
    pondCount: '1',
    totalWaterAreaDecimal: '50',
    consentDataCollection: true,
    consentDataSharing: true,
    consentPhotoUse: false,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [duplicateWarning, setDuplicateWarning] = useState(false);
  const [submittedFarmer, setSubmittedFarmer] = useState<any | null>(null);

  useEffect(() => {
    fetch('/api/farmer/geo')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.success) {
          setDistricts(data.districts || []);
          setBlocks(data.blocks || []);
          setVillages(data.villages || []);
        }
      })
      .catch(() => {});
  }, []);

  const handleBlockChange = (blkId: string) => {
    setFormData((prev) => ({ ...prev, blockId: blkId }));
    fetch(`/api/farmer/geo?blockId=${blkId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data && data.success && data.villages.length > 0) {
          setVillages(data.villages);
          setFormData((prev) => ({ ...prev, villageId: data.villages[0].id }));
        }
      });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setDuplicateWarning(false);

    if (!formData.consentDataCollection) {
      setError(locale === 'bn' ? 'তথ্য সংগ্রহের সম্মতি আবশ্যক' : 'Consent for data collection is required');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/farmer/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Registration failed');
      }

      if (data.duplicateWarning) {
        setDuplicateWarning(true);
      }

      setSubmittedFarmer(data.farmer);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#071912] text-slate-800 dark:text-slate-100 p-4 sm:p-6 antialiased">
      <div className="max-w-xl mx-auto">
        {/* Top Header */}
        <div className="flex items-center justify-between py-3 mb-4">
          <Link
            href="/farmer/login"
            className="flex items-center gap-2 text-xs font-bold text-emerald-800 dark:text-emerald-400 hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{locale === 'bn' ? 'লগইনে ফিরে যান' : 'Back to Login'}</span>
          </Link>
          <button
            onClick={() => {
              const next = locale === 'bn' ? 'en' : 'bn';
              setLocale(next);
              try {
                localStorage.setItem('ahammed_language', next);
                localStorage.setItem('ahammed_lang', next);
              } catch {}
            }}
            type="button"
            className="px-3 py-1 rounded-full text-xs font-bold border border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 cursor-pointer"
          >
            {locale === 'bn' ? 'English' : 'বাংলা'}
          </button>
        </div>

        {/* Card */}
        {submittedFarmer ? (
          <div className="bg-white dark:bg-[#0c241b] border border-emerald-900/10 dark:border-white/10 rounded-3xl shadow-xl p-6 sm:p-8 space-y-6 text-center animate-in fade-in zoom-in-95">
            <div className="w-16 h-16 rounded-3xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 mx-auto flex items-center justify-center shadow-md">
              <Clock className="w-8 h-8 animate-pulse" />
            </div>

            <div className="space-y-2">
              <span className="inline-block px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 text-xs font-black uppercase tracking-wider">
                {locale === 'bn' ? 'যাচাই প্রক্রিয়াধীন (Pending Verification)' : 'Submitted for Verification'}
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">
                {locale === 'bn' ? 'আবেদন সফলভাবে জমা হয়েছে!' : 'Registration Submitted!'}
              </h2>
              <p className="text-xs text-gray-600 dark:text-gray-300 max-w-md mx-auto leading-relaxed">
                {locale === 'bn'
                  ? 'আপনার মৎস্য চাষী নিবন্ধনের সমস্ত তথ্য আহাম্মেদ ফার্টিলাইজার অ্যাকুয়াকালচার হাবে পাঠানো হয়েছে। অ্যাডমিন পর্যালোচনা করে অনুমোদন (Approve) করার পর আপনি সিস্টেমে লগইন করতে পারবেন।'
                  : 'Your registration details have been submitted to Ahammed Fertilizer Aquaculture Hub. You can log in after admin review and approval.'}
              </p>
            </div>

            {/* Profile summary card */}
            <div className="bg-gray-50 dark:bg-white/5 border border-gray-200/80 dark:border-white/10 rounded-2xl p-4 text-left text-xs space-y-2.5">
              <div className="flex justify-between items-center pb-2 border-b border-gray-200/50 dark:border-white/10">
                <span className="text-gray-500">{locale === 'bn' ? 'নিবন্ধন নম্বর:' : 'Registration ID:'}</span>
                <span className="font-mono font-black text-emerald-700 dark:text-emerald-400 text-sm">
                  {submittedFarmer.registrationNumber}
                </span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-gray-200/50 dark:border-white/10">
                <span className="text-gray-500">{locale === 'bn' ? 'চাষীর নাম:' : 'Farmer Name:'}</span>
                <span className="font-bold text-gray-900 dark:text-white">
                  {submittedFarmer.fullName}
                </span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-gray-200/50 dark:border-white/10">
                <span className="text-gray-500">{locale === 'bn' ? 'মোবাইল নম্বর:' : 'Mobile Number:'}</span>
                <span className="font-mono font-bold text-gray-900 dark:text-white">
                  +91 {submittedFarmer.mobileNumber}
                </span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-gray-200/50 dark:border-white/10">
                <span className="text-gray-500">{locale === 'bn' ? 'পুকুর ও মোট আয়তন:' : 'Ponds & Water Area:'}</span>
                <span className="font-bold text-gray-900 dark:text-white">
                  {submittedFarmer.pondCount} টি পুকুর ({submittedFarmer.totalWaterAreaDecimal} শতক)
                </span>
              </div>
              <div className="flex justify-between items-center pt-1 bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/20">
                <span className="text-amber-900 dark:text-amber-200 font-semibold">{locale === 'bn' ? 'লগইন পাসওয়ার্ড:' : 'Login Password:'}</span>
                <span className="font-mono font-extrabold text-amber-800 dark:text-amber-300">
                  {locale === 'bn' ? 'মোবাইলের প্রথম ৬টি সংখ্যা' : "First 6 digits of mobile"} ({submittedFarmer.mobileNumber.slice(0, 6)})
                </span>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <Link
                href="/farmer/login"
                className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md transition-all text-center"
              >
                {locale === 'bn' ? 'লগইন পেজে যান' : 'Go to Login'}
              </Link>
              <Link
                href="/"
                className="py-3 px-4 rounded-xl border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 font-bold text-xs hover:bg-gray-100 dark:hover:bg-white/5 transition-all text-center"
              >
                {locale === 'bn' ? 'হোমপেজে ফিরে যান' : 'Back to Home'}
              </Link>
            </div>
          </div>
        ) : (
        <div className="bg-white dark:bg-[#0c241b] border border-emerald-900/10 dark:border-white/10 rounded-3xl shadow-xl p-5 sm:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md">
              <Fish className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-black text-emerald-950 dark:text-emerald-50 leading-tight">
                {d.reg.title}
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {d.reg.subtitle}
              </p>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {duplicateWarning && (
            <div className="mb-4 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 text-xs flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{d.reg.duplicateWarning}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name & Mobile */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  {d.reg.fullName} *
                </label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder={d.reg.fullNamePlaceholder}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-sm font-semibold focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  {d.reg.mobile} *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">
                    +91
                  </span>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={formData.mobileNumber}
                    onChange={(e) =>
                      setFormData({ ...formData, mobileNumber: e.target.value.replace(/\D/g, '').slice(0, 10) })
                    }
                    placeholder="9876543210"
                    className="w-full pl-11 pr-3 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-sm font-bold tracking-wider focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>

            {/* Geo: District & Block */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  {d.reg.district} *
                </label>
                <select
                  value={formData.districtId}
                  onChange={(e) => setFormData({ ...formData, districtId: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-xs font-bold"
                >
                  {districts.map((d) => (
                    <option key={d.id} value={d.id} className="text-black">
                      {locale === 'bn' ? d.nameBn : d.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  {d.reg.block} *
                </label>
                <select
                  value={formData.blockId}
                  onChange={(e) => handleBlockChange(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-xs font-bold"
                >
                  {blocks.map((b) => (
                    <option key={b.id} value={b.id} className="text-black">
                      {locale === 'bn' ? b.nameBn : b.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Village & Address */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  {d.reg.village} *
                </label>
                <select
                  value={formData.villageId}
                  onChange={(e) => setFormData({ ...formData, villageId: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-xs font-bold"
                >
                  {villages.map((v) => (
                    <option key={v.id} value={v.id} className="text-black">
                      {locale === 'bn' ? v.nameBn : v.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  {d.reg.address}
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="পাড়া / ডাকঘর"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-xs font-semibold"
                />
              </div>
            </div>

            {/* Ponds, Water Area, Experience */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1 truncate">
                  {d.reg.pondCount}
                </label>
                <input
                  type="number"
                  min={1}
                  value={formData.pondCount}
                  onChange={(e) => setFormData({ ...formData, pondCount: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-sm font-bold text-center"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1 truncate">
                  {d.reg.waterArea}
                </label>
                <input
                  type="number"
                  min={1}
                  value={formData.totalWaterAreaDecimal}
                  onChange={(e) => setFormData({ ...formData, totalWaterAreaDecimal: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-sm font-bold text-center"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1 truncate">
                  {d.reg.experience}
                </label>
                <input
                  type="number"
                  min={0}
                  value={formData.experienceYears}
                  onChange={(e) => setFormData({ ...formData, experienceYears: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-sm font-bold text-center"
                />
              </div>
            </div>

            <p className="text-[11px] text-gray-500 italic">
              * {d.reg.waterAreaNote}
            </p>

            {/* PIN Setup */}
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                {d.reg.pinSetup} *
              </label>
              <input
                type="password"
                required
                maxLength={4}
                value={formData.pin}
                onChange={(e) => setFormData({ ...formData, pin: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                placeholder="1234"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-sm font-bold tracking-widest text-center"
              />
            </div>

            {/* Consent Block */}
            <div className="pt-2 border-t border-gray-100 dark:border-white/10 space-y-2">
              <span className="text-xs font-extrabold text-emerald-950 dark:text-emerald-100 block">
                {d.reg.consentTitle}
              </span>

              <label className="flex items-start gap-2.5 cursor-pointer text-xs text-gray-600 dark:text-gray-300">
                <input
                  type="checkbox"
                  required
                  checked={formData.consentDataCollection}
                  onChange={(e) => setFormData({ ...formData, consentDataCollection: e.target.checked })}
                  className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                />
                <span>{d.reg.consentCollection} *</span>
              </label>

              <label className="flex items-start gap-2.5 cursor-pointer text-xs text-gray-600 dark:text-gray-300">
                <input
                  type="checkbox"
                  checked={formData.consentDataSharing}
                  onChange={(e) => setFormData({ ...formData, consentDataSharing: e.target.checked })}
                  className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                />
                <span>{d.reg.consentSharing}</span>
              </label>

              <label className="flex items-start gap-2.5 cursor-pointer text-xs text-gray-600 dark:text-gray-300">
                <input
                  type="checkbox"
                  checked={formData.consentPhotoUse}
                  onChange={(e) => setFormData({ ...formData, consentPhotoUse: e.target.checked })}
                  className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                />
                <span>{d.reg.consentPhoto}</span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm shadow-lg shadow-emerald-700/25 active:scale-98 transition-all flex items-center justify-center gap-2 mt-4"
            >
              <span>{loading ? d.common.loading : d.reg.submitBtn}</span>
              <CheckCircle2 className="w-5 h-5" />
            </button>
          </form>
        </div>
        )}
      </div>
    </div>
  );
}
