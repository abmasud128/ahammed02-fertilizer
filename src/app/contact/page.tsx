'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/i18n/provider';
import { siteConfig } from '@/config/site';
import { Card } from '@/components/ui/Card';
import SectionHeading from '@/components/ui/SectionHeading';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import ScrollReveal from '@/components/motion/ScrollReveal';
import { formatWhatsAppUrl, formatPhoneUrl } from '@/lib/utils';

export default function ContactPage() {
  const { locale, t } = useLanguage();
  const isBn = locale === 'bn';

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    village: '',
    crop: '',
    message: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) {
      newErrors.name = isBn ? 'দয়া করে আপনার নাম লিখুন' : 'Name is required';
    }
    const cleanPhone = formData.phone.replace(/\D/g, '');
    if (!formData.phone.trim()) {
      newErrors.phone = isBn ? 'ফোন নম্বর দেওয়া আবশ্যক' : 'Phone number is required';
    } else if (cleanPhone.length < 10) {
      newErrors.phone = isBn
        ? 'সঠিক ১০ সংখ্যার মোবাইল নম্বর দিন'
        : 'Please enter a valid 10-digit phone number';
    }
    if (!formData.message.trim()) {
      newErrors.message = isBn ? 'বার্তা বা সমস্যা লিখুন' : 'Message is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[name];
        return copy;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const res = await fetch('/api/enquiries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSubmitSuccess(true);
        setFormData({
          name: '',
          phone: '',
          village: '',
          crop: '',
          message: '',
        });
      } else {
        setSubmitError(
          data.error ||
            (isBn
              ? 'বার্তা পাঠানো সম্ভব হয়নি, অনুগ্রহ করে আবার চেষ্টা করুন।'
              : 'Failed to send enquiry. Please try again.')
        );
      }
    } catch (err: any) {
      setSubmitError(
        isBn
          ? 'নেটওয়ার্কের ত্রুটি হয়েছে। অনুগ্রহ করে সরাসরি ফোন করুন।'
          : 'Network error occurred. Please call us directly.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const whatsappInquiryUrl = formatWhatsAppUrl(
    siteConfig.whatsapp,
    siteConfig.whatsappMessage
  );

  return (
    <div className="min-h-screen pt-20 pb-16">
      {/* Header Banner */}
      <section className="bg-gradient-to-b from-forest/15 via-leaf/5 to-transparent dark:from-forest/20 dark:via-dark-bg py-14 md:py-20 border-b border-forest/10 dark:border-leaf/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <ScrollReveal direction="down">
            <span className="inline-block py-1 px-3.5 rounded-full bg-forest/10 dark:bg-leaf/20 text-forest dark:text-leaf text-xs md:text-sm font-bold tracking-wide uppercase mb-3">
              📍 {isBn ? 'যোগাযোগ ও তথ্য' : 'Get in Touch'}
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-forest dark:text-cream tracking-tight mb-4">
              {isBn ? 'আমাদের সাথে যোগাযোগ করুন' : 'Contact Ahammed Fertilizer'}
            </h1>
            <p className="max-w-2xl mx-auto text-base sm:text-lg text-gray-700 dark:text-gray-300 font-medium">
              {isBn
                ? 'আপনার ফসলের যেকোনো রোগবালাই, সার নির্বাচন বা পণ্যের দরদাম জানতে আমাদের বার্তা পাঠান বা সরাসরি দোকানে চলে আসুন।'
                : 'Have questions about crop nutrition, pesticide dosage, or bulk seed availability? Reach out to our agricultural desk.'}
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Main 2-Column Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left Column: Form */}
          <div className="lg:col-span-7">
            <ScrollReveal direction="left">
              <Card className="p-6 sm:p-10 border-forest/15 dark:border-leaf/20 shadow-xl">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-forest dark:text-cream">
                    {isBn ? 'কৃষি পরামর্শ ও অনুসন্ধান ফর্ম' : 'Send an Enquiry or Field Question'}
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {isBn
                      ? 'নিচের ফর্মটি পূরণ করে পাঠান, আমরা দ্রুত আপনার সাথে যোগাযোগ করব।'
                      : 'Fill in your details below and our team will respond with personalized advice.'}
                  </p>
                </div>

                {submitSuccess ? (
                  <div className="rounded-xl bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-800 p-6 text-center space-y-4">
                    <span className="text-5xl block">✅</span>
                    <h3 className="text-xl font-bold text-green-800 dark:text-green-300">
                      {isBn ? 'আপনার বার্তা সফলভাবে জমা হয়েছে!' : 'Enquiry Received Successfully!'}
                    </h3>
                    <p className="text-sm text-green-700 dark:text-green-400 max-w-md mx-auto">
                      {isBn
                        ? 'ধন্যবাদ! আহাম্মেদ ফার্টিলাইজারের প্রতিনিধি শীঘ্রই আপনার দেওয়া নম্বরে যোগাযোগ করবেন।'
                        : 'Thank you for reaching out! Our agricultural advisor will review your query and contact you promptly.'}
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => setSubmitSuccess(false)}
                      className="mt-4"
                    >
                      {isBn ? 'আরেকটি বার্তা পাঠান' : 'Send Another Enquiry'}
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                    {submitError && (
                      <div className="p-3.5 rounded-lg bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm">
                        ⚠️ {submitError}
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Input
                        label="Your Name"
                        labelbn="আপনার নাম"
                        name="name"
                        required
                        placeholder="e.g. Ramesh Mondal"
                        placeholderbn="উদাঃ রমেশ মন্ডল"
                        value={formData.name}
                        onChange={handleChange}
                        error={errors.name}
                        disabled={isSubmitting}
                      />
                      <Input
                        label="Phone Number"
                        labelbn="মোবাইল নম্বর"
                        name="phone"
                        type="tel"
                        required
                        placeholder="e.g. 9876543210"
                        placeholderbn="উদাঃ ৯৮৭৬৫৪৩২১০"
                        value={formData.phone}
                        onChange={handleChange}
                        error={errors.phone}
                        disabled={isSubmitting}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Input
                        label="Village / Area"
                        labelbn="গ্রাম বা এলাকা"
                        name="village"
                        placeholder="e.g. Chapmatali"
                        placeholderbn="উদাঃ চাপমাটালি"
                        value={formData.village}
                        onChange={handleChange}
                        disabled={isSubmitting}
                      />
                      <Input
                        label="Target Crop"
                        labelbn="ফসলের নাম"
                        name="crop"
                        placeholder="e.g. Paddy / Potato / Mustard"
                        placeholderbn="উদাঃ ধান / আলু / সর্ষে"
                        value={formData.crop}
                        onChange={handleChange}
                        disabled={isSubmitting}
                      />
                    </div>

                    <Input
                      label="Your Message / Pest Concern"
                      labelbn="আপনার সমস্যা বা বার্তা"
                      name="message"
                      textarea
                      rows={4}
                      required
                      placeholder="Describe what help you need with fertilizers, disease, or availability..."
                      placeholderbn="ফসলের রোগবালাই বা কোন সারের প্রয়োজন বিস্তারিত লিখুন..."
                      value={formData.message}
                      onChange={handleChange}
                      error={errors.message}
                      disabled={isSubmitting}
                    />

                    <div className="pt-2">
                      <Button
                        type="submit"
                        variant="primary"
                        size="lg"
                        loading={isSubmitting}
                        className="w-full sm:w-auto"
                      >
                        {isBn ? 'বার্তা পাঠান' : 'Submit Enquiry'}
                      </Button>
                    </div>
                  </form>
                )}
              </Card>
            </ScrollReveal>
          </div>

          {/* Right Column: Map & Info */}
          <div className="lg:col-span-5 space-y-6">
            <ScrollReveal direction="right">
              {/* Contact Card */}
              <Card className="p-6 sm:p-8 border-forest/15 dark:border-leaf/20 shadow-xl space-y-6">
                <h3 className="text-xl font-bold text-forest dark:text-cream border-b border-gray-100 dark:border-white/10 pb-3">
                  {isBn ? 'দোকানের ঠিকানা ও বিবরণ' : 'Store Details & Timings'}
                </h3>

                <div className="space-y-4 text-sm text-gray-700 dark:text-gray-300">
                  {/* Address */}
                  <div className="flex items-start gap-3">
                    <span className="text-xl text-leaf shrink-0 mt-0.5">📍</span>
                    <div>
                      <strong className="block text-gray-900 dark:text-white font-semibold">
                        {isBn ? 'ঠিকানা:' : 'Physical Address:'}
                      </strong>
                      <p className="leading-relaxed">
                        {isBn ? siteConfig.addressbn.full : siteConfig.address.full}
                      </p>
                    </div>
                  </div>

                  {/* Hours */}
                  <div className="flex items-start gap-3">
                    <span className="text-xl text-leaf shrink-0 mt-0.5">⏰</span>
                    <div>
                      <strong className="block text-gray-900 dark:text-white font-semibold">
                        {isBn ? 'খোলার সময়সূচি:' : 'Opening Hours:'}
                      </strong>
                      <p className="leading-relaxed">
                        {isBn ? siteConfig.hoursbn : siteConfig.hours}
                      </p>
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="flex items-start gap-3">
                    <span className="text-xl text-leaf shrink-0 mt-0.5">📞</span>
                    <div>
                      <strong className="block text-gray-900 dark:text-white font-semibold">
                        {isBn ? 'ফোন নম্বর (সরাসরি কল):' : 'Telephone / Call:'}
                      </strong>
                      <a
                        href={formatPhoneUrl(siteConfig.phone)}
                        className="text-forest dark:text-leaf font-bold hover:underline"
                      >
                        {siteConfig.phoneFormatted}
                      </a>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="flex items-start gap-3">
                    <span className="text-xl text-leaf shrink-0 mt-0.5">✉️</span>
                    <div>
                      <strong className="block text-gray-900 dark:text-white font-semibold">
                        {isBn ? 'ইমেইল:' : 'Official Email:'}
                      </strong>
                      <a
                        href={`mailto:${siteConfig.email}`}
                        className="text-forest dark:text-leaf hover:underline"
                      >
                        {siteConfig.email}
                      </a>
                    </div>
                  </div>
                </div>

                {/* Direct Action Buttons */}
                <div className="pt-3 border-t border-gray-100 dark:border-white/10 flex flex-col sm:flex-row gap-3">
                  <Button
                    href={whatsappInquiryUrl}
                    variant="whatsapp"
                    size="md"
                    className="flex-1 text-center justify-center"
                    target="_blank"
                  >
                    💬 {isBn ? 'হোয়াটসঅ্যাপ' : 'WhatsApp Us'}
                  </Button>
                  <Button
                    href={siteConfig.directionsUrl}
                    variant="secondary"
                    size="md"
                    className="flex-1 text-center justify-center"
                    target="_blank"
                  >
                    🧭 {isBn ? 'দিকনির্দেশনা' : 'Get Directions'}
                  </Button>
                </div>
              </Card>
            </ScrollReveal>

            {/* Shop Recognition Photo */}
            <ScrollReveal direction="right" delay={0.08}>
              <Card className="p-3 overflow-hidden shadow-lg border-forest/15 dark:border-leaf/20">
                <div className="relative w-full h-48 sm:h-52 rounded-xl overflow-hidden bg-forest/10 group">
                  <img
                    src="/images/shop/storefront-exterior.png"
                    alt={isBn ? 'আহাম্মেদ ফার্টিলাইজারের সম্মুখ দৃশ্য' : 'Ahammed Fertilizer Storefront'}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <span className="text-xs font-bold uppercase tracking-wider text-harvest block">
                      {isBn ? 'সহজে দোকান চেনার উপায়' : 'Recognize Our Shop'}
                    </span>
                    <p className="text-xs text-white/95 mt-0.5 font-medium">
                      {isBn
                        ? 'চাপমাটালি মোড়ে নীল রঙের রোলিং শাটার ও পোস্টার যুক্ত দোকান'
                        : 'Blue rolling shutters located right on Chapmatali village road'}
                    </p>
                  </div>
                </div>
              </Card>
            </ScrollReveal>

            {/* Google Maps Embed */}
            <ScrollReveal direction="right" delay={0.1}>
              <Card className="p-2 overflow-hidden shadow-lg border-white/20 dark:border-white/10">
                <div className="relative w-full h-64 sm:h-72 rounded-xl overflow-hidden bg-gray-200 dark:bg-gray-800">
                  <iframe
                    title="Ahammed Fertilizer Location Map"
                    src={siteConfig.mapEmbedUrl}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen={false}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="w-full h-full"
                  />
                </div>
              </Card>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Safety Notice Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <ScrollReveal>
          <div className="rounded-2xl bg-amber-500/10 dark:bg-amber-500/20 border-2 border-amber-500/40 p-6 flex flex-col md:flex-row items-center gap-4 text-center md:text-left">
            <span className="text-4xl shrink-0">⚠️</span>
            <div className="flex-1">
              <h4 className="font-bold text-amber-900 dark:text-amber-200 text-base mb-1">
                {isBn ? 'বালাইনাশক খুচরা বিক্রয় ও সুরক্ষা নির্দেশিকা' : 'Pesticide Retail & Safe Usage Advisory'}
              </h4>
              <p className="text-xs sm:text-sm text-amber-800 dark:text-amber-300 leading-relaxed">
                {isBn ? siteConfig.safetyNoticebn : siteConfig.safetyNotice}
              </p>
            </div>
            <span className="text-xs font-mono font-semibold px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-900 dark:text-amber-100 shrink-0">
              Govt. Compliant Retailer
            </span>
          </div>
        </ScrollReveal>
      </section>
    </div>
  );
}
