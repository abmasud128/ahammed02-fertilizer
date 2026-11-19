'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/i18n/provider';
import { crops, Crop } from '@/data/crops';
import SectionHeading from '@/components/ui/SectionHeading';
import { Card } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import ScrollReveal from '@/components/motion/ScrollReveal';

const cropEmojis: Record<string, string> = {
  paddy: '🌾',
  mustard: '🌼',
  potato: '🥔',
  jute: '🌿',
  maize: '🌽',
  vegetables: '🥬',
};

export default function CropGuideOverviewPage() {
  const { locale } = useLanguage();

  return (
    <div className="min-h-screen bg-cream dark:bg-dark-bg pt-28 pb-16 md:pt-36 md:pb-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Header */}
        <ScrollReveal direction="down">
          <SectionHeading
            title="Crop-Wise Nutrition & Protection Guides"
            titlebn="ফসলভিত্তিক সুষম পুষ্টি ও বালাই ব্যবস্থাপনা"
            subtitle="Stage-wise advisory, scientific fertilizer application schedules, and pest control guidelines tailored for Dakshin Dinajpur cultivators."
            subtitlebn="উত্তরবঙ্গ ও দক্ষিণ দিনাজপুরের কৃষকদের জন্য জমি তৈরি থেকে ফসল তোলা পর্যন্ত পর্যায়ক্রমিক সার প্রয়োগ ও রোগ দমনের নির্ভরযোগ্য সহায়িকা।"
            centered
          />
        </ScrollReveal>

        {/* Advisory Banner */}
        <ScrollReveal direction="up">
          <div className="rounded-2xl bg-gradient-to-r from-forest to-forest/90 text-white p-6 sm:p-8 shadow-md flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center md:text-left">
              <span className="inline-block px-3 py-1 rounded-full bg-harvest/20 text-harvest font-semibold text-xs uppercase tracking-wider">
                {locale === 'bn' ? 'সরাসরি বিশেষজ্ঞ পরামর্শ' : 'Scientific Field Advisory'}
              </span>
              <h3 className="text-xl sm:text-2xl font-bold">
                {locale === 'bn'
                  ? 'আপনার জমিতে কি কোনো রোগ বা পোকার আক্রমণ হয়েছে?'
                  : 'Facing crop pests or nutrient deficiency in your field?'}
              </h3>
              <p className="text-sm text-cream/80 max-w-2xl">
                {locale === 'bn'
                  ? 'গাছের পাতা বা ডালের ছবি তুলে আমাদের হোয়াটসঅ্যাপে পাঠান। আমাদের অভিজ্ঞ দল সঠিক ঔষধ ও মাত্রার সমাধান দেবে।'
                  : 'Share leaf or crop symptoms on our WhatsApp helpline. Get instant advice on exact pesticide dosage per bigha.'}
              </p>
            </div>
            <Button
              variant="secondary"
              size="lg"
              href="https://wa.me/919091017035?text=Crop%20Advisory%20Query"
              className="shrink-0 bg-harvest hover:bg-harvest/90 text-soil font-bold"
            >
              💬 {locale === 'bn' ? 'হোয়াটসঅ্যাপে পরামর্শ নিন' : 'Consult on WhatsApp'}
            </Button>
          </div>
        </ScrollReveal>

        {/* Crops Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {crops.map((crop: Crop, index: number) => {
            const emoji = cropEmojis[crop.slug] || '🌱';
            const stagesCount = crop.growthStages?.length || 0;

            return (
              <ScrollReveal key={crop.id} delay={index * 0.1}>
                <Card hover tilt className="h-full flex flex-col justify-between overflow-hidden group">
                  <div className="p-6 space-y-4 flex-1">
                    {/* Top Row: Emoji & Season Badge */}
                    <div className="flex items-center justify-between">
                      <div className="w-14 h-14 rounded-2xl bg-forest/5 dark:bg-leaf/10 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                        {emoji}
                      </div>
                      <Badge variant="outline" size="sm">
                        {locale === 'bn' ? crop.seasonbn : crop.season}
                      </Badge>
                    </div>

                    {/* Crop Name */}
                    <div>
                      <h3 className="text-xl font-bold text-forest dark:text-cream group-hover:text-leaf transition-colors">
                        {locale === 'bn' ? crop.namebn : crop.name}
                      </h3>
                      {locale === 'bn' && (
                        <p className="text-xs text-soil/60 dark:text-cream/60">
                          {crop.name}
                        </p>
                      )}
                    </div>

                    {/* Short Description */}
                    <p className="text-sm text-soil/80 dark:text-cream/80 line-clamp-3 leading-relaxed">
                      {locale === 'bn' ? crop.descriptionbn : crop.description}
                    </p>

                    {/* Stages Counter */}
                    <div className="pt-2 flex items-center gap-2 text-xs text-soil/70 dark:text-cream/70">
                      <span>🌱</span>
                      <span>
                        {locale === 'bn'
                          ? `${stagesCount} টি বৃদ্ধির পর্যায় ও নির্দেশিকা`
                          : `${stagesCount} Growth Stages & Input Schedules`}
                      </span>
                    </div>
                  </div>

                  {/* Footer CTA */}
                  <div className="p-6 pt-0 border-t border-soil/10 dark:border-leaf/10 mt-2">
                    <div className="pt-4">
                      <Button
                        variant="primary"
                        size="md"
                        href={`/crop-guide/${crop.slug}`}
                        className="w-full text-center"
                      >
                        {locale === 'bn' ? 'সম্পূর্ণ গাইড দেখুন →' : 'View Full Schedule →'}
                      </Button>
                    </div>
                  </div>
                </Card>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </div>
  );
}
