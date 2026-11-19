'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useLanguage } from '@/i18n/provider';
import { siteConfig } from '@/config/site';
import { crops, Crop, CropStage } from '@/data/crops';
import { products, Product } from '@/data/products';
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

export default function IndividualCropGuidePage() {
  const { locale } = useLanguage();
  const params = useParams();
  const rawCrop = params?.crop;
  const cropSlug = Array.isArray(rawCrop) ? rawCrop[0] : rawCrop;

  const crop = crops.find((c) => c.slug === cropSlug);

  if (!crop) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-cream dark:bg-dark-bg px-4">
        <div className="text-center max-w-md space-y-4">
          <span className="text-6xl">🌾</span>
          <h1 className="text-2xl font-bold text-forest dark:text-cream">
            {locale === 'bn' ? 'ফসলের নির্দেশিকা পাওয়া যায়নি' : 'Crop Guide Not Found'}
          </h1>
          <p className="text-sm text-soil/70 dark:text-cream/70">
            {locale === 'bn'
              ? 'আমরা খুব শীঘ্রই আরও ফসলের নির্দেশিকা যোগ করছি।'
              : 'The requested crop schedule is not available or has moved.'}
          </p>
          <div className="pt-2">
            <Button variant="primary" href="/crop-guide">
              ← {locale === 'bn' ? 'সকল ফসল গাইড দেখুন' : 'Back to Crop Guides'}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const emoji = cropEmojis[crop.slug] || '🌱';

  // Helper to resolve product ID to product object
  const getProductById = (prodId: string): Product | undefined => {
    return products.find((p) => p.id === prodId);
  };

  return (
    <div className="min-h-screen bg-cream dark:bg-dark-bg py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-10">
        {/* Breadcrumb & Navigation */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-soil/10 dark:border-leaf/15 pb-4">
          <nav aria-label="Breadcrumb" className="flex items-center space-x-2 text-xs sm:text-sm text-soil/70 dark:text-cream/70">
            <Link href="/" className="hover:text-leaf transition-colors">
              {locale === 'bn' ? 'হোম' : 'Home'}
            </Link>
            <span>/</span>
            <Link href="/crop-guide" className="hover:text-leaf transition-colors">
              {locale === 'bn' ? 'ফসলের সমাধান' : 'Crop Guides'}
            </Link>
            <span>/</span>
            <span className="text-forest dark:text-harvest font-medium">
              {locale === 'bn' ? crop.namebn : crop.name}
            </span>
          </nav>

          <Link
            href="/crop-guide"
            className="text-xs sm:text-sm text-leaf hover:underline flex items-center gap-1"
          >
            ← {locale === 'bn' ? 'সকল ফসল গাইড' : 'Back to all guides'}
          </Link>
        </div>

        {/* Crop Header Banner */}
        <ScrollReveal direction="down">
          <div className="rounded-3xl bg-gradient-to-br from-forest via-forest/95 to-leaf/80 text-white p-6 sm:p-10 shadow-xl relative overflow-hidden">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 relative z-10">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-5xl sm:text-6xl shrink-0 shadow-inner">
                {emoji}
              </div>

              <div className="space-y-3 text-center sm:text-left flex-1">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-harvest text-soil">
                    {locale === 'bn' ? crop.seasonbn : crop.season}
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-white/20 text-cream">
                    {crop.growthStages?.length || 0} {locale === 'bn' ? 'টি পর্যায়' : 'Growth Stages'}
                  </span>
                </div>

                <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                  {locale === 'bn' ? `${crop.namebn} চাষের নির্দেশিকা` : `${crop.name} Cultivation Guide`}
                </h1>

                <p className="text-sm sm:text-base text-cream/90 max-w-3xl leading-relaxed">
                  {locale === 'bn' ? crop.descriptionbn : crop.description}
                </p>
              </div>
            </div>

            {/* Decorative background circle */}
            <div className="absolute -right-12 -bottom-12 w-64 h-64 rounded-full bg-white/5 pointer-events-none" />
          </div>
        </ScrollReveal>

        {/* Growth Stages Timeline Section */}
        <div className="space-y-6">
          <div className="border-b border-soil/10 dark:border-leaf/15 pb-3">
            <h2 className="text-2xl font-bold text-forest dark:text-cream">
              {locale === 'bn' ? 'পর্যায়ক্রমিক সার ও বালাই ব্যবস্থাপনা' : 'Stage-by-Stage Input & Spray Calendar'}
            </h2>
            <p className="text-xs sm:text-sm text-soil/70 dark:text-cream/70 mt-1">
              {locale === 'bn'
                ? 'অনুকূল আবহাওয়ায় সর্বোচ্চ ফলন পেতে প্রতিটি বৃদ্ধির ধাপে নির্দেশিত পণ্য ও মাত্রা অনুসরণ করুন।'
                : 'Follow the chronological application schedule below for optimum nutrient intake and disease defense.'}
            </p>
          </div>

          {/* Vertical Timeline */}
          <div className="relative pl-6 sm:pl-10 space-y-8 before:absolute before:left-3 sm:before:left-5 before:top-4 before:bottom-4 before:w-0.5 before:bg-gradient-to-b before:from-forest before:via-leaf before:to-harvest">
            {crop.growthStages?.map((stage: CropStage, sIdx: number) => {
              return (
                <ScrollReveal key={sIdx} delay={sIdx * 0.1}>
                  <div className="relative group">
                    {/* Timeline Node Icon/Dot */}
                    <div className="absolute -left-6 sm:-left-10 top-1.5 w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-forest dark:bg-leaf text-white flex items-center justify-center font-bold text-xs sm:text-sm shadow-md ring-4 ring-cream dark:ring-dark-bg">
                      {sIdx + 1}
                    </div>

                    {/* Stage Card */}
                    <Card hover={false} className="p-5 sm:p-7 bg-white dark:bg-dark-surface space-y-4">
                      {/* Stage Name */}
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-soil/10 dark:border-leaf/10 pb-3">
                        <h3 className="text-lg sm:text-xl font-bold text-forest dark:text-cream">
                          {locale === 'bn' ? stage.stagebn : stage.stage}
                        </h3>
                        <Badge variant="outline" size="sm">
                          {locale === 'bn' ? `ধাপ ${sIdx + 1}` : `Phase ${sIdx + 1}`}
                        </Badge>
                      </div>

                      {/* Stage Description */}
                      <p className="text-sm text-soil/80 dark:text-cream/90 leading-relaxed">
                        {locale === 'bn' ? stage.descriptionbn : stage.description}
                      </p>

                      {/* Recommended Products */}
                      {stage.recommendedProducts && stage.recommendedProducts.length > 0 && (
                        <div className="pt-3 border-t border-soil/10 dark:border-leaf/10 space-y-2.5">
                          <span className="text-xs font-bold uppercase tracking-wider text-leaf block">
                            {locale === 'bn'
                              ? 'প্রস্তাবিত সার ও প্রয়োজনীয় ঔষধ:'
                              : 'Recommended Products for this Phase:'}
                          </span>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {stage.recommendedProducts.map((prodId: string) => {
                              const prod = getProductById(prodId);
                              if (!prod) return null;

                              return (
                                <Link
                                  key={prod.id}
                                  href={`/products/${prod.slug}`}
                                  className="flex items-center justify-between p-3 rounded-xl bg-forest/5 dark:bg-leaf/10 hover:bg-forest/10 dark:hover:bg-leaf/20 border border-forest/10 dark:border-leaf/20 transition-all group/item"
                                >
                                  <div className="min-w-0 pr-2">
                                    <h4 className="text-xs sm:text-sm font-semibold text-forest dark:text-cream truncate group-hover/item:text-leaf">
                                      {locale === 'bn' ? prod.namebn : prod.name}
                                    </h4>
                                    <span className="text-[11px] text-soil/60 dark:text-cream/60 block">
                                      {prod.brand} • {prod.price}
                                    </span>
                                  </div>
                                  <span className="text-xs text-leaf font-bold shrink-0">
                                    →
                                  </span>
                                </Link>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </Card>
                  </div>
                </ScrollReveal>
              );
            })}
          </div>
        </div>

        {/* Bottom Contact Help Section */}
        <div className="pt-6 border-t border-soil/10 dark:border-leaf/15 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Button variant="outline" href="/crop-guide">
            ← {locale === 'bn' ? 'সকল ফসল নির্দেশিকা' : 'Back to Crop Guides'}
          </Button>

          <Button
            variant="primary"
            href={`https://wa.me/${siteConfig.whatsapp}?text=I%20need%20custom%20advice%20for%20${encodeURIComponent(crop.name)}`}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            💬 {locale === 'bn' ? `${crop.namebn} বিষয়ে পরামর্শ নিন` : `Ask Advice for ${crop.name}`}
          </Button>
        </div>
      </div>
    </div>
  );
}
