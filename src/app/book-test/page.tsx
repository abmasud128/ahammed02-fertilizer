'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  FlaskConical,
  Droplets,
  Sprout,
  CheckCircle2,
  AlertCircle,
  Phone,
  MapPin,
  Calendar,
  ShieldCheck,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export default function BookTestPage() {
  const [formData, setFormData] = useState({
    customerName: '',
    customerMobile: '',
    customerVillage: '',
    testType: 'soil',
    plotDetails: '',
    preferredDate: '',
    address: '',
    notes: '',
    consentAgreed: false,
    website_url: '', // Honeypot field for anti-spam bots
  });

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successResult, setSuccessResult] = useState<{
    referenceNumber: string;
    testType: string;
    estimatedFee: number;
    message: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!formData.customerName.trim() || !formData.customerMobile.trim() || !formData.customerVillage.trim()) {
      setErrorMessage('অনুগ্রহ করে নাম, মোবাইল নম্বর এবং গ্রাম সঠিকভাবে পূরণ করুন।');
      return;
    }

    if (formData.customerMobile.replace(/\D/g, '').length < 10) {
      setErrorMessage('দয়া করে সঠিক ১০ সংখ্যার মোবাইল নম্বর দিন।');
      return;
    }

    if (!formData.consentAgreed) {
      setErrorMessage('অনুগ্রহ করে সেবা গ্রহণের জন্য সম্মতি বাক্সে টিক দিন।');
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch('/api/public/book-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'বুকিং জমা দেওয়া সম্ভব হয়নি।');
      }

      setSuccessResult({
        referenceNumber: data.referenceNumber,
        testType: data.testType,
        estimatedFee: data.estimatedFee,
        message: data.message,
      });
    } catch (err: any) {
      setErrorMessage(err.message || 'একটি ত্রুটি ঘটেছে। অনুগ্রহ করে আবার চেষ্টা করুন।');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-sand dark:bg-[#06140e] text-charcoal dark:text-gray-100 pt-24 pb-16">
      {/* ── Top Header ── */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mb-10 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-forest/10 dark:bg-leaf/10 text-forest dark:text-leaf text-xs font-semibold uppercase tracking-wider mb-3">
          <FlaskConical className="w-4 h-4" />
          বৈজ্ঞানিক পরীক্ষা সেবা (Scientific Lab Testing)
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-forest dark:text-white tracking-tight">
          মাটি ও জল পরীক্ষা বুকিং
        </h1>
        <p className="mt-3 text-base sm:text-lg text-charcoal/70 dark:text-gray-300 max-w-2xl mx-auto">
          কম খরচে বৈজ্ঞানিক রিপোর্টে সঠিক সারের হিসাব এবং মাছ চাষের জন্য উন্নত জলের প্যারামিটার জানুন।
        </p>
      </section>

      {/* ── Service Options Grid ── */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Soil Test */}
          <div
            onClick={() => setFormData({ ...formData, testType: 'soil' })}
            className={`cursor-pointer rounded-2xl p-6 transition-all border-2 relative ${
              formData.testType === 'soil'
                ? 'border-forest bg-forest/5 dark:bg-forest/20 shadow-md ring-2 ring-forest/20'
                : 'border-forest/10 dark:border-white/10 bg-white dark:bg-card-dark hover:border-forest/30'
            }`}
          >
            {formData.testType === 'soil' && (
              <span className="absolute top-4 right-4 bg-forest text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                নির্বাচিত
              </span>
            )}
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-400 flex items-center justify-center mb-4">
              <Sprout className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-forest dark:text-white">মাটি পরীক্ষা (Soil Test)</h3>
            <p className="text-xs text-charcoal/70 dark:text-gray-300 mt-1">
              pH, জৈব কার্বন (OC), নাইট্রোজেন, ফসফরাস, পটাশ ও জিঙ্কের মাত্রা বিশ্লেষণ।
            </p>
            <div className="mt-4 pt-3 border-t border-forest/10 dark:border-white/10 flex items-center justify-between">
              <span className="text-xs text-charcoal/60 dark:text-gray-400">সরকারি মানদণ্ড অনুযায়ী</span>
              <span className="text-lg font-extrabold text-forest dark:text-leaf">₹২৫০</span>
            </div>
          </div>

          {/* Card 2: Pond Test */}
          <div
            onClick={() => setFormData({ ...formData, testType: 'pond' })}
            className={`cursor-pointer rounded-2xl p-6 transition-all border-2 relative ${
              formData.testType === 'pond'
                ? 'border-forest bg-forest/5 dark:bg-forest/20 shadow-md ring-2 ring-forest/20'
                : 'border-forest/10 dark:border-white/10 bg-white dark:bg-card-dark hover:border-forest/30'
            }`}
          >
            {formData.testType === 'pond' && (
              <span className="absolute top-4 right-4 bg-forest text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                নির্বাচিত
              </span>
            )}
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 flex items-center justify-center mb-4">
              <Droplets className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-forest dark:text-white">পুকুরের জল পরীক্ষা (Pond Water)</h3>
            <p className="text-xs text-charcoal/70 dark:text-gray-300 mt-1">
              অ্যামোনিয়া (NH3), দ্রবীভূত অক্সিজেন (DO), ক্ষারত্ব ও প্ল্যাঙ্কটন পর্যবেক্ষণ।
            </p>
            <div className="mt-4 pt-3 border-t border-forest/10 dark:border-white/10 flex items-center justify-between">
              <span className="text-xs text-charcoal/60 dark:text-gray-400">মাছ চাষীদের জন্য বিশেষ</span>
              <span className="text-lg font-extrabold text-forest dark:text-leaf">₹৩০০</span>
            </div>
          </div>

          {/* Card 3: Tube Well / Water */}
          <div
            onClick={() => setFormData({ ...formData, testType: 'water' })}
            className={`cursor-pointer rounded-2xl p-6 transition-all border-2 relative ${
              formData.testType === 'water'
                ? 'border-forest bg-forest/5 dark:bg-forest/20 shadow-md ring-2 ring-forest/20'
                : 'border-forest/10 dark:border-white/10 bg-white dark:bg-card-dark hover:border-forest/30'
            }`}
          >
            {formData.testType === 'water' && (
              <span className="absolute top-4 right-4 bg-forest text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                নির্বাচিত
              </span>
            )}
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-700 dark:text-blue-400 flex items-center justify-center mb-4">
              <FlaskConical className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-forest dark:text-white">নলকূপের জল পরীক্ষা (General Water)</h3>
            <p className="text-xs text-charcoal/70 dark:text-gray-300 mt-1">
              লবণাক্ততা (EC), আয়রন ও ক্ষারত্ব পরীক্ষা। সেচ বা বাড়ির ব্যবহারের জন্য।
            </p>
            <div className="mt-4 pt-3 border-t border-forest/10 dark:border-white/10 flex items-center justify-between">
              <span className="text-xs text-charcoal/60 dark:text-gray-400">দ্রুত ডিজিটাল টেস্ট</span>
              <span className="text-lg font-extrabold text-forest dark:text-leaf">₹২০০</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Main Booking Form or Success View ── */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {successResult ? (
          <div className="bg-white dark:bg-card-dark rounded-3xl p-8 sm:p-10 shadow-xl border border-forest/10 text-center animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-5">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-bold text-forest dark:text-white">
              আপনার টেস্ট রিকোয়েস্ট সফলভাবে জমা হয়েছে!
            </h2>
            <p className="text-sm text-charcoal/70 dark:text-gray-300 mt-2">
              আমাদের ল্যাব প্রতিনিধি খুব শীঘ্রই আপনার দেওয়া মোবাইল নম্বরে যোগাযোগ করবেন।
            </p>

            <div className="my-6 p-6 rounded-2xl bg-forest/5 dark:bg-forest/20 border border-forest/15 text-left inline-block w-full max-w-md">
              <div className="flex justify-between items-center py-2 border-b border-forest/10">
                <span className="text-xs text-charcoal/60 dark:text-gray-400 font-medium">রেফারেন্স নম্বর:</span>
                <span className="text-sm font-mono font-bold text-forest dark:text-leaf">
                  {successResult.referenceNumber}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-forest/10">
                <span className="text-xs text-charcoal/60 dark:text-gray-400 font-medium">পরীক্ষার ধরন:</span>
                <span className="text-sm font-semibold capitalize">
                  {successResult.testType === 'soil' ? 'মাটি পরীক্ষা' : successResult.testType === 'pond' ? 'পুকুরের জল' : 'নলকূপের জল'}
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-xs text-charcoal/60 dark:text-gray-400 font-medium">আনুমানিক ফি:</span>
                <span className="text-base font-bold text-emerald-700 dark:text-emerald-400">
                  ₹{successResult.estimatedFee} (নমুনা দেওয়ার সময় প্রদেয়)
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-4">
              <button
                onClick={() => {
                  setSuccessResult(null);
                  setFormData({
                    customerName: '',
                    customerMobile: '',
                    customerVillage: '',
                    testType: 'soil',
                    plotDetails: '',
                    preferredDate: '',
                    address: '',
                    notes: '',
                    consentAgreed: false,
                    website_url: '',
                  });
                }}
                className="px-6 py-3 rounded-xl bg-forest text-white font-semibold text-sm hover:bg-forest/90 transition-all shadow-md"
              >
                আরেকটি টেস্ট বুক করুন
              </button>
              <Link
                href="/products"
                className="px-6 py-3 rounded-xl border border-forest/20 text-forest dark:text-leaf font-semibold text-sm hover:bg-forest/5 transition-all inline-flex items-center justify-center gap-2"
              >
                দোকানের পণ্য দেখুন <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-card-dark rounded-3xl p-6 sm:p-10 shadow-xl border border-forest/10">
            <div className="flex items-center gap-3 pb-6 border-b border-forest/10 dark:border-white/10 mb-6">
              <div className="w-10 h-10 rounded-xl bg-forest text-white flex items-center justify-center font-bold">
                ১
              </div>
              <div>
                <h2 className="text-lg font-bold text-forest dark:text-white">কৃষক ও জমির তথ্য প্রদান করুন</h2>
                <p className="text-xs text-charcoal/60 dark:text-gray-400">
                  নিচের ফর্মটি পূরণ করুন, আমাদের টিম আপনার বাড়ি বা মাঠ থেকে নমুনা সংগ্রহ করতে পারে।
                </p>
              </div>
            </div>

            {errorMessage && (
              <div className="mb-6 p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-3">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Anti-Spam Honeypot Field (invisible to humans) */}
              <div className="hidden" aria-hidden="true">
                <label>Do not fill this</label>
                <input
                  type="text"
                  tabIndex={-1}
                  value={formData.website_url}
                  onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                  autoComplete="off"
                />
              </div>

              {/* Row 1: Name and Mobile */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-charcoal/80 dark:text-gray-300 mb-1">
                    কৃষকের নাম (Full Name) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.customerName}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                    placeholder="যেমন: সুব্রত ঘোষ"
                    className="w-full px-4 py-2.5 rounded-xl border border-forest/20 dark:border-white/15 bg-sand/30 dark:bg-black/20 text-sm focus:outline-none focus:ring-2 focus:ring-forest"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-charcoal/80 dark:text-gray-300 mb-1">
                    মোবাইল নম্বর (10-Digit Mobile) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={formData.customerMobile}
                    onChange={(e) => setFormData({ ...formData, customerMobile: e.target.value })}
                    placeholder="যেমন: 9876543210"
                    className="w-full px-4 py-2.5 rounded-xl border border-forest/20 dark:border-white/15 bg-sand/30 dark:bg-black/20 text-sm focus:outline-none focus:ring-2 focus:ring-forest"
                  />
                </div>
              </div>

              {/* Row 2: Village and Preferred Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-charcoal/80 dark:text-gray-300 mb-1">
                    গ্রাম / পাড়া (Village / Gram) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.customerVillage}
                    onChange={(e) => setFormData({ ...formData, customerVillage: e.target.value })}
                    placeholder="যেমন: নান্দাইর, চকমাটালি, পতিরাম"
                    className="w-full px-4 py-2.5 rounded-xl border border-forest/20 dark:border-white/15 bg-sand/30 dark:bg-black/20 text-sm focus:outline-none focus:ring-2 focus:ring-forest"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-charcoal/80 dark:text-gray-300 mb-1">
                    পছন্দের নমুনা সংগ্রহের তারিখ (Preferred Date)
                  </label>
                  <input
                    type="date"
                    value={formData.preferredDate}
                    onChange={(e) => setFormData({ ...formData, preferredDate: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-forest/20 dark:border-white/15 bg-sand/30 dark:bg-black/20 text-sm focus:outline-none focus:ring-2 focus:ring-forest"
                  />
                </div>
              </div>

              {/* Field: Land / Pond Details */}
              <div>
                <label className="block text-xs font-bold text-charcoal/80 dark:text-gray-300 mb-1">
                  জমির পরিমাণ বা চাষের বিবরণ (Plot Size & Crop/Fish)
                </label>
                <input
                  type="text"
                  value={formData.plotDetails}
                  onChange={(e) => setFormData({ ...formData, plotDetails: e.target.value })}
                  placeholder="যেমন: ৩ বিঘা আমন ধানের জমি বা ৪৫ শতক রুই-কাতলার পুকুর"
                  className="w-full px-4 py-2.5 rounded-xl border border-forest/20 dark:border-white/15 bg-sand/30 dark:bg-black/20 text-sm focus:outline-none focus:ring-2 focus:ring-forest"
                />
              </div>

              {/* Field: Landmark / Address */}
              <div>
                <label className="block text-xs font-bold text-charcoal/80 dark:text-gray-300 mb-1">
                  নির্দিষ্ট ঠিকানা / চেনার চিহ্ন (Landmark / Location)
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="যেমন: নর্থ স্কুলের পেছনে, ক্যানেল মোড়"
                  className="w-full px-4 py-2.5 rounded-xl border border-forest/20 dark:border-white/15 bg-sand/30 dark:bg-black/20 text-sm focus:outline-none focus:ring-2 focus:ring-forest"
                />
              </div>

              {/* Field: Problem description / Notes */}
              <div>
                <label className="block text-xs font-bold text-charcoal/80 dark:text-gray-300 mb-1">
                  কোনো নির্দিষ্ট সমস্যা থাকলে লিখুন (Observed Issues / Notes)
                </label>
                <textarea
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="যেমন: মাটিতে সার দিলেও গাছ বাড়ছে না, বা সকালে পুকুরে মাছ ভেসে উঠছে..."
                  className="w-full px-4 py-2.5 rounded-xl border border-forest/20 dark:border-white/15 bg-sand/30 dark:bg-black/20 text-sm focus:outline-none focus:ring-2 focus:ring-forest"
                />
              </div>

              {/* Privacy Consent Checkbox */}
              <div className="pt-2">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.consentAgreed}
                    onChange={(e) => setFormData({ ...formData, consentAgreed: e.target.checked })}
                    className="mt-0.5 w-4 h-4 rounded border-forest text-forest focus:ring-forest shrink-0"
                  />
                  <span className="text-xs text-charcoal/80 dark:text-gray-300 leading-relaxed">
                    আমি আহমেদ ফার্টিলাইজার অ্যান্ড ফার্ম কেয়ার-কে আমার প্রদত্ত ফোন নম্বরে যোগাযোগ করার এবং আমার
                    জমি/পুকুরের নমুনা পরীক্ষার জন্য তথ্য সংরক্ষণ করার সম্মতি প্রদান করছি।
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 px-6 rounded-2xl bg-forest hover:bg-forest/90 text-white font-bold text-base shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {submitting ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                      বুকিং জমা হচ্ছে...
                    </span>
                  ) : (
                    <>
                      <FlaskConical className="w-5 h-5" />
                      টেস্ট রিকোয়েস্ট নিশ্চিত করুন (Submit Booking)
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </section>

      {/* ── Help / Store Contact Banner ── */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <div className="rounded-2xl p-6 bg-forest/5 dark:bg-white/5 border border-forest/10 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-forest text-white flex items-center justify-center shrink-0">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-charcoal/60 dark:text-gray-400">সরাসরি ফোন করে বুক করতে চান?</p>
              <p className="text-sm font-bold text-forest dark:text-leaf">+91 97354 28657 / +91 94343 00000</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-charcoal/70 dark:text-gray-300">
            <MapPin className="w-4 h-4 text-forest dark:text-leaf shrink-0" />
            <span>পুলিয়াপাড়া মোড়, বালুরঘাট, দক্ষিণ দিনাজপুর</span>
          </div>
        </div>
      </section>
    </div>
  );
}
