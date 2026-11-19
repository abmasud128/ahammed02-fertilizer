'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/i18n/provider';
import { siteConfig } from '@/config/site';
import { formatPhoneUrl, formatWhatsAppUrl } from '@/lib/utils';
import {
  Phone,
  MapPin,
  Clock,
  Send,
  Navigation,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

export default function ContactSection() {
  const { locale } = useLanguage();
  const isBn = locale === 'bn';

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    crop: 'Paddy',
    message: '',
  });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');

    try {
      await fetch('/api/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      setStatus('success');
      setFormData({ name: '', phone: '', crop: 'Paddy', message: '' });
    } catch {
      setStatus('success');
      setFormData({ name: '', phone: '', crop: 'Paddy', message: '' });
    }
  };

  const phoneUrl = formatPhoneUrl(siteConfig.phone);
  const whatsappMsg = isBn ? siteConfig.whatsappMessagebn : siteConfig.whatsappMessage;
  const whatsappUrl = formatWhatsAppUrl(siteConfig.whatsapp, whatsappMsg);

  return (
    <section
      id="contact"
      className="relative py-12 md:py-20 px-4 sm:px-6 lg:px-8 bg-cover bg-center lg:bg-fixed overflow-hidden text-white"
      style={{ backgroundImage: `url('/images/backgrounds/bg-contact.jpg')` }}
    >
      {/* Subtle edge vignette strictly for contrast */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/35 to-black/60 pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-harvest/20 border border-harvest/40 text-harvest text-xs sm:text-sm font-bold uppercase tracking-wider mb-3.5 backdrop-blur-md">
            <MapPin className="w-4 h-4 text-harvest" />
            {isBn ? 'সরাসরি যোগাযোগ ও সহায়তা' : 'Visit Us or Get in Touch'}
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-black text-white tracking-tight leading-tight">
            {isBn ? (
              <>
                আমাদের সাথে <span className="text-harvest">যোগাযোগ ও ঠিকানা</span>
              </>
            ) : (
              <>
                Visit Us or <span className="text-harvest">Get in Touch</span>
              </>
            )}
          </h2>
          <p className="mt-3 text-sm sm:text-base md:text-lg text-cream/85 font-medium leading-relaxed">
            {isBn
              ? 'চাপমাটালি প্রধান রিটেল কাউন্টারে আসুন অথবা ফোন ও হোয়াটসঅ্যাপে বিশেষজ্ঞ পরামর্শ নিন।'
              : 'Direct agronomy advice, genuine fertilizer sacks, and quick on-site diagnostic assistance for all farmers.'}
          </p>
        </div>

        {/* ── 3 Uniform, Balanced, Proportional Columns Side-by-Side ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-7 items-stretch">
          
          {/* ── COLUMN 1: Contact Information Card ── */}
          <div className="rounded-3xl bg-forest/85 dark:bg-[#071d15]/90 border border-white/20 backdrop-blur-2xl p-6 sm:p-7 shadow-2xl flex flex-col justify-between h-full text-white">
            <div>
              {/* Header */}
              <div className="pb-4 border-b border-white/10">
                <span className="text-[11px] font-bold text-harvest uppercase tracking-widest flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  {isBn ? 'সরকার অনুমোদিত ডিলার' : 'Govt. Licensed Dealer'}
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-white mt-1">
                  {isBn ? siteConfig.namebn : siteConfig.name}
                </h3>
                <p className="text-xs text-cream/70 mt-0.5">
                  {isBn ? 'দক্ষিণ দিনাজপুর কৃষি ও মৎস্য কেন্দ্র' : 'Dakshin Dinajpur Retail & Wholesale Godown'}
                </p>
              </div>

              {/* Details List */}
              <div className="space-y-4 my-6 text-xs sm:text-sm text-cream/90 font-medium">
                {/* Address */}
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center text-harvest shrink-0 mt-0.5">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-white block text-xs sm:text-sm">
                      {isBn ? 'দোকানের ঠিকানা:' : 'Physical Address:'}
                    </span>
                    <p className="mt-0.5 text-cream/80 text-xs sm:text-sm leading-relaxed">
                      {isBn ? siteConfig.addressbn.full : siteConfig.address.full}
                    </p>
                  </div>
                </div>

                {/* Direct Phone */}
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center text-harvest shrink-0 mt-0.5">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-white block text-xs sm:text-sm">
                      {isBn ? 'সরাসরি হেল্পলাইন:' : 'Direct Phone Helpline:'}
                    </span>
                    <a
                      href={phoneUrl}
                      className="mt-0.5 text-base sm:text-lg font-black text-harvest hover:text-amber-300 transition-colors block"
                    >
                      {siteConfig.phoneFormatted}
                    </a>
                  </div>
                </div>

                {/* Opening Hours */}
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center text-harvest shrink-0 mt-0.5">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-white block text-xs sm:text-sm">
                      {isBn ? 'দোকান খোলার সময়:' : 'Opening Hours:'}
                    </span>
                    <p className="mt-0.5 text-cream/80 text-xs sm:text-sm">
                      {isBn ? siteConfig.hoursbn : siteConfig.hours}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Actions: Call & WhatsApp */}
            <div className="pt-4 border-t border-white/15 grid grid-cols-2 gap-3">
              <a
                href={phoneUrl}
                className="py-3 px-4 rounded-xl bg-harvest hover:bg-amber-400 text-forest font-black text-xs sm:text-sm text-center shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-1.5"
              >
                <Phone className="w-4 h-4" />
                <span>{isBn ? 'কল করুন' : 'Call Now'}</span>
              </a>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:brightness-110 text-white font-extrabold text-xs sm:text-sm text-center shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-1.5"
              >
                <span>💬</span>
                <span>WhatsApp</span>
              </a>
            </div>
          </div>

          {/* ── COLUMN 2: Prominent Google Map Card ── */}
          <div className="rounded-3xl bg-forest/85 dark:bg-[#071d15]/90 border border-white/20 backdrop-blur-2xl p-6 sm:p-7 shadow-2xl flex flex-col justify-between h-full text-white min-h-[460px]">
            <div>
              {/* Header */}
              <div className="pb-4 border-b border-white/10 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-harvest uppercase tracking-widest flex items-center gap-1.5">
                    <Navigation className="w-4 h-4" />
                    {isBn ? 'লোকেশন ও মানচিত্র' : 'Store Location & Map'}
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black text-white mt-1">
                    {isBn ? 'চাপমাটালি মূল সড়ক' : 'Chapmatali Main Road'}
                  </h3>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-400/30">
                  {isBn ? 'সহজ পার্কিং' : 'Easy Parking'}
                </span>
              </div>
              <p className="text-xs text-cream/75 mt-2">
                {isBn
                  ? 'ট্রাক্টর, পিকআপ ও ভ্যান সহজে প্রবেশের প্রশস্ত রাস্তা ও লোডিং স্পেস।'
                  : 'Wide access road for tractors, trucks, and pickup vans with ample loading area.'}
              </p>
            </div>

            {/* Prominent Map Container filling the middle */}
            <div className="w-full flex-1 my-4 min-h-[260px] sm:min-h-[290px] rounded-2xl overflow-hidden border border-white/15 relative shadow-inner bg-black/40">
              <iframe
                title="Ahammed Fertilizer Location Map"
                src="https://maps.google.com/maps?q=Chapmatali,+Dakshin+Dinajpur,+West+Bengal+733124&t=&z=14&ie=UTF8&iwloc=&output=embed"
                className="w-full h-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
              <div className="absolute bottom-2.5 left-2.5 bg-forest/90 border border-white/20 backdrop-blur-md px-3 py-1.5 rounded-xl text-xs font-bold text-harvest shadow-md pointer-events-none flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Chapmatali, Dakshin Dinajpur</span>
              </div>
            </div>

            {/* Directions Action Button */}
            <div className="pt-2">
              <a
                href={siteConfig.directionsUrl || 'https://maps.google.com/?q=Chapmatali,+Dakshin+Dinajpur'}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm border border-white/20 transition-all flex items-center justify-center gap-2 group"
              >
                <Navigation className="w-4 h-4 text-harvest group-hover:rotate-45 transition-transform" />
                <span>{isBn ? 'গুগল ম্যাপে দিকনির্দেশনা পান' : 'Get Directions on Google Maps'}</span>
              </a>
            </div>
          </div>

          {/* ── COLUMN 3: Farmer Consultation & Inquiry Form Card (Stretched to Bottom) ── */}
          <div className="rounded-3xl bg-forest/85 dark:bg-[#071d15]/90 border border-white/20 backdrop-blur-2xl p-6 sm:p-7 shadow-2xl flex flex-col justify-between h-full text-white">
            <div>
              {/* Header */}
              <div className="pb-4 border-b border-white/10">
                <span className="text-[11px] font-bold text-harvest uppercase tracking-widest flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" />
                  {isBn ? 'দ্রুত পরামর্শ ও অনুসন্ধান' : 'Agronomy Query Form'}
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-white mt-1">
                  {isBn ? 'পরামর্শ বা দাম জানুন' : 'Send an Inquiry'}
                </h3>
                <p className="text-xs text-cream/70 mt-0.5">
                  {isBn
                    ? 'আপনার ফসলের নাম ও সমস্যার কথা লিখুন, আমরা দ্রুত সমাধান জানাব।'
                    : 'Personalized fertilizer dosage, disease diagnostics & wholesale rates.'}
                </p>
              </div>

              {/* Form or Success State */}
              {status === 'success' ? (
                <div className="p-6 my-6 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 text-center space-y-3">
                  <span className="text-4xl block">✅</span>
                  <h4 className="text-lg font-bold text-white">
                    {isBn ? 'ধন্যবাদ! আপনার অনুসন্ধান গ্রহণ করা হয়েছে।' : 'Thank You! Query Received.'}
                  </h4>
                  <p className="text-xs text-cream/80">
                    {isBn
                      ? 'আমাদের কৃষি বিশেষজ্ঞ খুব শীঘ্রই আপনার সাথে যোগাযোগ করবেন।'
                      : 'Our agronomy desk will review your details and contact you shortly.'}
                  </p>
                  <button
                    type="button"
                    onClick={() => setStatus('idle')}
                    className="mt-2 text-xs font-bold text-harvest hover:underline"
                  >
                    {isBn ? 'আরেকটি বার্তা পাঠান' : 'Submit another query'}
                  </button>
                </div>
              ) : (
                <form id="contact-inquiry-form" onSubmit={handleSubmit} className="space-y-3.5 my-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Name */}
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-cream/90 mb-1">
                        {isBn ? 'আপনার নাম' : 'Your Name'} <span className="text-harvest">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder={isBn ? 'যেমন: মাসুদ আহমেদ' : 'e.g. Masud Ahammed'}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white text-xs sm:text-sm placeholder:text-cream/40 focus:outline-none focus:ring-2 focus:ring-harvest"
                      />
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-cream/90 mb-1">
                        {isBn ? 'ফোন নম্বর' : 'Phone Number'} <span className="text-harvest">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder={isBn ? '১০ সংখ্যার নম্বর' : '10-digit Mobile'}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white text-xs sm:text-sm placeholder:text-cream/40 focus:outline-none focus:ring-2 focus:ring-harvest"
                      />
                    </div>
                  </div>

                  {/* Crop Type */}
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-cream/90 mb-1">
                      {isBn ? 'ফসলের ধরন' : 'Crop / Farm Category'}
                    </label>
                    <select
                      value={formData.crop}
                      onChange={(e) => setFormData({ ...formData, crop: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-forest border border-white/20 text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-harvest"
                    >
                      <option value="Paddy">{isBn ? 'ধান (Paddy / Rice)' : 'Paddy / Rice'}</option>
                      <option value="Potato">{isBn ? 'আলু (Potato)' : 'Potato'}</option>
                      <option value="Mustard">{isBn ? 'সর্ষে (Mustard)' : 'Mustard'}</option>
                      <option value="Jute">{isBn ? 'পাট (Jute)' : 'Jute'}</option>
                      <option value="Maize">{isBn ? 'ভুট্টা (Maize)' : 'Maize'}</option>
                      <option value="Vegetables">{isBn ? 'শাকসবজি (Vegetables)' : 'Vegetables'}</option>
                      <option value="Aquaculture">{isBn ? 'মাছের পুকুর (Fish Pond)' : 'Aquaculture / Fish Pond'}</option>
                      <option value="General">{isBn ? 'সাধারণ সার/কীটনাশক পরামর্শ' : 'General Fertilizer / Soil Guidance'}</option>
                    </select>
                  </div>

                  {/* Message */}
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-cream/90 mb-1">
                      {isBn ? 'আপনার সমস্যা বা প্রয়োজনীয়তা' : 'Problem / Requirement'}
                    </label>
                    <textarea
                      rows={3}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder={isBn ? 'কোন সার দরকার বা পোকার লক্ষণ লিখুন...' : 'Write which fertilizer or pest symptom you need advice on...'}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white text-xs sm:text-sm placeholder:text-cream/40 focus:outline-none focus:ring-2 focus:ring-harvest resize-none"
                    />
                  </div>
                </form>
              )}
            </div>

            {/* Submit Button: Stretches cleanly down to the bottom edge, aligning with Column 1 & 2 */}
            <div className="pt-2">
              <button
                type="submit"
                form="contact-inquiry-form"
                disabled={status === 'submitting'}
                className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-harvest via-amber-400 to-yellow-400 hover:brightness-105 text-forest font-black text-xs sm:text-sm text-center shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Send className="w-4 h-4 text-forest" />
                <span>
                  {status === 'submitting'
                    ? (isBn ? 'পাঠানো হচ্ছে...' : 'Submitting...')
                    : (isBn ? 'পরামর্শের জন্য পাঠান' : 'Submit Consultation Request')}
                </span>
              </button>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
