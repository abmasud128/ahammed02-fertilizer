'use client';

import React from 'react';
import { useLanguage } from '@/i18n/provider';
import { siteConfig } from '@/config/site';
import { offers, Offer } from '@/data/offers';
import { Card } from '@/components/ui/Card';
import SectionHeading from '@/components/ui/SectionHeading';
import Button from '@/components/ui/Button';
import ScrollReveal from '@/components/motion/ScrollReveal';
import { formatWhatsAppUrl, formatPhoneUrl } from '@/lib/utils';

export default function OffersPage() {
  const { locale, t } = useLanguage();
  const isBn = locale === 'bn';

  const categoryLabels: Record<string, { en: string; bn: string }> = {
    fertilizers: { en: 'Fertilizers', bn: 'সার' },
    pesticides: { en: 'Crop Protection', bn: 'বালাইনাশক' },
    tools: { en: 'Sprayers & Tools', bn: 'যন্ত্রপাতি' },
    seeds: { en: 'Seeds', bn: 'উন্নত বীজ' },
  };

  return (
    <div className="min-h-screen pt-20 pb-16">
      {/* Header Banner */}
      <section className="bg-gradient-to-b from-harvest/20 via-cream to-transparent dark:from-harvest/10 dark:via-dark-bg py-14 md:py-20 border-b border-harvest/20 dark:border-white/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <ScrollReveal direction="down">
            <span className="inline-flex items-center gap-1.5 py-1 px-4 rounded-full bg-harvest/30 dark:bg-harvest/20 text-forest dark:text-harvest font-bold text-xs md:text-sm tracking-wide uppercase mb-3">
              <span>🏷️</span> {isBn ? 'মরসুমের সেরা সাশ্রয়' : 'Seasonal Discounts & Packages'}
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-forest dark:text-cream tracking-tight mb-4">
              {isBn ? 'বিশেষ অফার ও প্যাকেজ ডিল' : 'Special Offers & Seasonal Deals'}
            </h1>
            <p className="max-w-2xl mx-auto text-base sm:text-lg text-gray-700 dark:text-gray-300 font-medium">
              {isBn
                ? 'কৃষকদের উৎপাদন খরচ কমাতে আমাদের বিশেষ মরসুমি প্যাকেজ ও ছাড়ের সুবিধা নিন। সরাসরি দোকানে এসে বা হোয়াটসঅ্যাপে যোগাযোগ করে উপভোগ করুন।'
                : 'Exclusive fertilizer combos, pesticide packages, and equipment offers designed to maximize farmer savings and crop yield.'}
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Offers Grid */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        {offers && offers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {offers.map((offer: Offer, index: number) => {
              const cat = categoryLabels[offer.category] || {
                en: offer.category,
                bn: offer.category,
              };

              const offerMessage = isBn
                ? `নমস্কার! আমি আহাম্মেদ ফার্টিলাইজারের "${offer.titlebn}" অফারটি সম্পর্কে জানতে আগ্রহী।`
                : `Hello! I would like to avail the "${offer.title}" offer at Ahammed Fertilizer.`;

              const whatsappUrl = formatWhatsAppUrl(siteConfig.whatsapp, offerMessage);

              return (
                <ScrollReveal key={offer.id} delay={index * 0.1}>
                  <Card
                    hover
                    className="h-full flex flex-col justify-between overflow-hidden border-forest/15 dark:border-leaf/20 shadow-md p-6 sm:p-8"
                  >
                    <div>
                      {/* Top tags row */}
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                        <span className="inline-block px-3 py-1 rounded-full bg-forest text-white text-xs font-extrabold uppercase tracking-wider shadow-xs">
                          {isBn ? offer.discountbn : offer.discount}
                        </span>
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-leaf/10 dark:bg-leaf/20 text-forest dark:text-leaf">
                          {isBn ? cat.bn : cat.en}
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="text-xl sm:text-2xl font-bold text-forest dark:text-cream mb-3 leading-snug">
                        {isBn ? offer.titlebn : offer.title}
                      </h3>

                      {/* Description */}
                      <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base leading-relaxed mb-6">
                        {isBn ? offer.descriptionbn : offer.description}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-gray-100 dark:border-white/10 mt-auto">
                      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-5">
                        <span className="flex items-center gap-1.5 font-medium">
                          <span>📅</span>
                          <span>{isBn ? 'মেয়াদ:' : 'Valid until:'}</span>
                          <strong className="text-gray-700 dark:text-gray-200">
                            {offer.validUntil}
                          </strong>
                        </span>
                        {offer.featured && (
                          <span className="text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1">
                            <span>⭐</span> {isBn ? 'জনপ্রিয় অফার' : 'Featured'}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-col sm:flex-row gap-3">
                        <Button
                          href={whatsappUrl}
                          variant="whatsapp"
                          size="md"
                          className="w-full sm:w-auto flex-1 text-center"
                          target="_blank"
                        >
                          {isBn ? 'হোয়াটসঅ্যাপে বুকিং' : 'Claim on WhatsApp'}
                        </Button>
                        <Button
                          href={formatPhoneUrl(siteConfig.phone)}
                          variant="outline"
                          size="md"
                          className="w-full sm:w-auto"
                        >
                          {isBn ? 'কল করুন' : 'Call Shop'}
                        </Button>
                      </div>
                    </div>
                  </Card>
                </ScrollReveal>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20">
            <span className="text-6xl mb-4 block">🌾</span>
            <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">
              {isBn ? 'বর্তমানে কোনো সক্রিয় অফার নেই' : 'No Active Offers Right Now'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
              {isBn
                ? 'আসন্ন চাষের মরসুমে নতুন প্যাকেজ ও ছাড়ের জন্য শীঘ্রই আবার ভিজিট করুন অথবা সরাসরি আমাদের ফোন করুন।'
                : 'Please check back soon before the upcoming season or contact our counter directly for current store promotions.'}
            </p>
          </div>
        )}

        {/* Call to Action Banner */}
        <div className="mt-16">
          <ScrollReveal>
            <Card
              hover={false}
              className="bg-gradient-to-r from-forest to-leaf text-white p-8 sm:p-12 text-center rounded-3xl shadow-xl"
            >
              <span className="text-4xl mb-3 block">📞</span>
              <h3 className="text-2xl sm:text-3xl font-extrabold mb-3">
                {isBn
                  ? 'এই অফারগুলো পেতে সরাসরি কল বা হোয়াটসঅ্যাপ করুন'
                  : 'Call or WhatsApp to Avail These Offers'}
              </h3>
              <p className="max-w-2xl mx-auto text-white/90 text-sm sm:text-base mb-8 leading-relaxed">
                {isBn
                  ? 'আমাদের প্রতিনিধি আপনাকে বর্তমান স্টক, ডেলিভারি এবং আপনার জমির জন্য সঠিক প্যাকেজ বেছে নিতে সাহায্য করবেন।'
                  : 'Our staff will confirm current stock availability and assist you with customized doses tailored specifically to your acreage.'}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <Button
                  href={formatWhatsAppUrl(siteConfig.whatsapp, siteConfig.whatsappMessage)}
                  variant="secondary"
                  size="lg"
                  target="_blank"
                >
                  💬 {isBn ? 'হোয়াটসঅ্যাপ মেসেজ' : 'WhatsApp Us Now'}
                </Button>
                <Button
                  href={formatPhoneUrl(siteConfig.phone)}
                  variant="outline"
                  size="lg"
                  className="bg-white/10 hover:bg-white/20 text-white border-white"
                >
                  📞 {isBn ? siteConfig.phoneFormatted : `Call: ${siteConfig.phoneFormatted}`}
                </Button>
              </div>
            </Card>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}
