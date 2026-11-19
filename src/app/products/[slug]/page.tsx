'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useLanguage } from '@/i18n/provider';
import { siteConfig } from '@/config/site';
import { products, Product } from '@/data/products';
import { Card } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import ScrollReveal from '@/components/motion/ScrollReveal';
import { formatWhatsAppUrl, getWhatsAppProductMessage } from '@/lib/utils';

const categoryIcons: Record<string, string> = {
  fertilizers: '🌱',
  micronutrients: '🧪',
  insecticides: '🐛',
  fungicides: '🍄',
  herbicides: '🌿',
  pesticides: '🛡️',
  seeds: '🌾',
  tools: '⚙️',
  aquaculture: '🐟',
};

export default function ProductDetailPage() {
  const { locale, t } = useLanguage();
  const params = useParams();
  const rawSlug = params?.slug;
  const slug = Array.isArray(rawSlug) ? rawSlug[0] : rawSlug;

  const product = products.find((p) => p.slug === slug);

  if (!product) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-cream dark:bg-dark-bg px-4">
        <div className="text-center max-w-md space-y-4">
          <span className="text-6xl">🔍</span>
          <h1 className="text-2xl font-bold text-forest dark:text-cream">
            {locale === 'bn' ? 'পণ্যটি খুঁজে পাওয়া যায়নি' : 'Product Not Found'}
          </h1>
          <p className="text-sm text-soil/70 dark:text-cream/70">
            {locale === 'bn'
              ? 'অনুগ্রহ করে ক্যাটালগে ফিরে যান বা অন্যান্য পণ্য অনুসন্ধান করুন।'
              : 'The requested agricultural input might have been renamed or moved.'}
          </p>
          <div className="pt-2">
            <Button variant="primary" href="/products">
              ← {locale === 'bn' ? 'ক্যাটালগে ফিরে যান' : 'Back to Catalogue'}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Related products from same category (exclude current)
  const relatedProducts = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 3);

  const icon = categoryIcons[product.category] || '🌱';
  const whatsappMsg = getWhatsAppProductMessage(product.name, locale);
  const waUrl = formatWhatsAppUrl(siteConfig.whatsapp, whatsappMsg);

  return (
    <div className="min-h-screen bg-cream dark:bg-dark-bg py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Breadcrumb & Back Navigation */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-soil/10 dark:border-leaf/15 pb-4">
          <nav aria-label="Breadcrumb" className="flex items-center space-x-2 text-xs sm:text-sm text-soil/70 dark:text-cream/70">
            <Link href="/" className="hover:text-leaf transition-colors">
              {locale === 'bn' ? 'হোম' : 'Home'}
            </Link>
            <span>/</span>
            <Link href="/products" className="hover:text-leaf transition-colors">
              {locale === 'bn' ? 'পণ্যসমূহ' : 'Products'}
            </Link>
            <span>/</span>
            <span className="text-forest dark:text-harvest font-medium truncate max-w-[200px] sm:max-w-xs">
              {locale === 'bn' ? product.namebn : product.name}
            </span>
          </nav>

          <Link
            href="/products"
            className="text-xs sm:text-sm text-leaf hover:underline flex items-center gap-1"
          >
            ← {locale === 'bn' ? 'সকল পণ্য' : 'Back to all products'}
          </Link>
        </div>

        {/* Product Layout: 2-Column Desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Product Visual Showcase & 3D button */}
          <div className="lg:col-span-5 space-y-4">
            <ScrollReveal direction="left">
              <div className="aspect-square rounded-3xl bg-gradient-to-br from-forest/10 via-leaf/15 to-harvest/15 dark:from-forest/40 dark:via-dark-surface dark:to-leaf/20 border border-soil/10 dark:border-leaf/20 flex flex-col items-center justify-center p-8 relative overflow-hidden shadow-lg">
                <span className="text-8xl sm:text-9xl animate-float drop-shadow-md">
                  {icon}
                </span>
                <div className="absolute top-4 left-4">
                  <Badge variant="default" size="md">
                    {locale === 'bn' ? product.categorybn : product.category}
                  </Badge>
                </div>
                {product.isPesticide && (
                  <div className="absolute top-4 right-4">
                    <span className="text-xs px-2.5 py-1 rounded-full bg-rose-500/90 text-white font-semibold flex items-center gap-1 shadow-sm">
                      ⚠️ {locale === 'bn' ? 'কীটনাশক' : 'Agrochemical'}
                    </span>
                  </div>
                )}
                <div className="absolute bottom-4 text-center">
                  <span className="text-xs font-semibold uppercase tracking-wider text-soil/60 dark:text-cream/60">
                    {product.brand}
                  </span>
                </div>
              </div>

              {/* 3D Viewer action placeholder */}
              <div className="pt-2">
                <a
                  href="#viewer3d"
                  className="w-full py-2.5 px-4 rounded-xl border border-leaf/40 bg-white/70 dark:bg-dark-surface/70 hover:bg-leaf/10 dark:hover:bg-leaf/20 text-forest dark:text-cream text-xs sm:text-sm font-medium flex items-center justify-center gap-2 transition-all shadow-sm"
                >
                  <span>🔄</span>
                  <span>{locale === 'bn' ? 'থ্রিডি (3D) প্যাক প্রিভিউ দেখুন' : 'Explore 3D Pack Model'}</span>
                </a>
              </div>
            </ScrollReveal>
          </div>

          {/* Right Column: Information, Pricing, Specs & CTA */}
          <div className="lg:col-span-7 space-y-6">
            <ScrollReveal direction="right">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-leaf">
                    {product.brand}
                  </span>
                  <span className="text-soil/30 dark:text-cream/30">•</span>
                  <span className="text-xs text-soil/70 dark:text-cream/70">
                    {locale === 'bn' ? '১০০% আসল ও লাইসেন্সপ্রাপ্ত' : '100% Genuine Guaranteed'}
                  </span>
                </div>

                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-forest dark:text-cream">
                  {locale === 'bn' ? product.namebn : product.name}
                </h1>
                {locale === 'bn' && (
                  <p className="text-sm text-soil/60 dark:text-cream/60">
                    {product.name}
                  </p>
                )}

                <div className="flex items-baseline gap-3 pt-2">
                  <span className="text-2xl sm:text-3xl font-extrabold text-forest dark:text-harvest">
                    {product.price}
                  </span>
                  <span className="text-xs text-soil/60 dark:text-cream/60">
                    {locale === 'bn' ? '(এমআরপি / সরকারি নিয়ন্ত্রিত দর)' : '(MRP / Subsidized Official Price)'}
                  </span>
                </div>
              </div>

              {/* Description */}
              <div className="prose dark:prose-invert max-w-none text-sm text-soil/80 dark:text-cream/90 leading-relaxed pt-2">
                <p>{locale === 'bn' ? product.descriptionbn : product.description}</p>
              </div>

              {/* Pack Sizes */}
              {product.packSizes && product.packSizes.length > 0 && (
                <div className="space-y-2 pt-2">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-soil/70 dark:text-cream/70">
                    {locale === 'bn' ? 'উপলব্ধ প্যাকিং সাইজ' : 'Available Pack Sizes'}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {product.packSizes.map((pack, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white dark:bg-dark-surface border border-soil/15 dark:border-leaf/30 text-forest dark:text-cream shadow-sm"
                      >
                        📦 {pack}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* CTA WhatsApp Enquire Button */}
              <div className="pt-4">
                <Button
                  variant="primary"
                  size="lg"
                  href={waUrl}
                  className="w-full text-center py-3.5 text-base bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg flex items-center justify-center gap-2"
                >
                  <span>💬</span>
                  <span>
                    {locale === 'bn'
                      ? 'হোয়াটসঅ্যাপে মূল্য ও স্টকের জন্য অর্ডার করুন'
                      : 'Enquire on WhatsApp for Price & Stock'}
                  </span>
                </Button>
                <p className="text-center text-xs text-soil/60 dark:text-cream/50 mt-2">
                  {locale === 'bn'
                    ? 'বা সরাসরি ফোন করুন আমাদের দোকানে: +91 90910 17035'
                    : `Or call our counter directly: ${siteConfig.phoneFormatted}`}
                </p>
              </div>
            </ScrollReveal>
          </div>
        </div>

        {/* Detailed Application, Dosage, Safety & Crops Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
          {/* Usage Section */}
          <Card hover={false} className="p-6 space-y-3 bg-white dark:bg-dark-surface">
            <div className="flex items-center gap-2.5 text-forest dark:text-leaf">
              <span className="text-2xl">📋</span>
              <h3 className="text-base font-bold">
                {locale === 'bn' ? 'প্রয়োগ পদ্ধতি ও সময়' : 'Application Instructions'}
              </h3>
            </div>
            <p className="text-sm text-soil/80 dark:text-cream/80 leading-relaxed">
              {locale === 'bn' ? product.usagebn : product.usage}
            </p>
          </Card>

          {/* Dosage Section */}
          <Card hover={false} className="p-6 space-y-3 bg-white dark:bg-dark-surface">
            <div className="flex items-center gap-2.5 text-forest dark:text-harvest">
              <span className="text-2xl">⚖️</span>
              <h3 className="text-base font-bold">
                {locale === 'bn' ? 'সঠিক মাত্রার পরিমাণ' : 'Recommended Dosage'}
              </h3>
            </div>
            <p className="text-sm text-soil/80 dark:text-cream/80 leading-relaxed font-medium">
              {locale === 'bn' ? product.dosagebn : product.dosage}
            </p>
          </Card>

          {/* Safety Notes Section */}
          <Card
            hover={false}
            className={`p-6 space-y-3 md:col-span-2 ${
              product.isPesticide
                ? 'bg-amber-50/90 dark:bg-amber-950/40 border-2 border-amber-300 dark:border-amber-600/60'
                : 'bg-white dark:bg-dark-surface'
            }`}
          >
            <div className="flex items-center gap-2.5 text-amber-700 dark:text-amber-300">
              <span className="text-2xl">🛡️</span>
              <h3 className="text-base font-bold">
                {locale === 'bn' ? 'নিরাপত্তা ও সতর্কতা' : 'Safety Notes & Precautions'}
              </h3>
            </div>
            <p className="text-sm text-soil/80 dark:text-cream/90 leading-relaxed">
              {locale === 'bn' ? product.safetyNotesbn : product.safetyNotes}
            </p>
          </Card>

          {/* Suitable Crops Section */}
          {((locale === 'bn' ? product.cropsbn : product.crops) || []).length > 0 && (
            <Card hover={false} className="p-6 space-y-3 md:col-span-2 bg-white dark:bg-dark-surface">
              <div className="flex items-center gap-2.5 text-forest dark:text-leaf">
                <span className="text-2xl">🌾</span>
                <h3 className="text-base font-bold">
                  {locale === 'bn' ? 'যেসব ফসলের জন্য উপযোগী' : 'Suitable Crops & Plantations'}
                </h3>
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                {(locale === 'bn' ? product.cropsbn : product.crops).map((cropName, cIdx) => (
                  <span
                    key={cIdx}
                    className="px-3 py-1 rounded-full text-xs font-semibold bg-forest/5 dark:bg-leaf/15 text-forest dark:text-cream border border-forest/10 dark:border-leaf/20"
                  >
                    🌿 {cropName}
                  </span>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* Related Products Section */}
        {relatedProducts.length > 0 && (
          <div className="pt-12 border-t border-soil/10 dark:border-leaf/15 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-forest dark:text-cream">
                  {locale === 'bn' ? 'সম্পর্কিত অন্যান্য পণ্য' : 'Related Products in Category'}
                </h3>
                <p className="text-xs sm:text-sm text-soil/70 dark:text-cream/70 mt-0.5">
                  {locale === 'bn'
                    ? 'আপনার ফসলের পরিপূর্ণ সুরক্ষার জন্য সহযোগী উপাদান'
                    : 'Complementary inputs for balanced field management'}
                </p>
              </div>
              <Link
                href={`/products?category=${product.category}`}
                className="text-xs sm:text-sm text-leaf hover:underline"
              >
                {locale === 'bn' ? 'সব দেখুন →' : 'View Category →'}
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedProducts.map((rel) => {
                const relIcon = categoryIcons[rel.category] || '🌱';
                const relWaMsg = getWhatsAppProductMessage(rel.name, locale);
                const relWaUrl = formatWhatsAppUrl(siteConfig.whatsapp, relWaMsg);

                return (
                  <Card key={rel.id} hover className="p-5 flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-3xl">{relIcon}</span>
                        <Badge variant="outline" size="sm">
                          {rel.brand}
                        </Badge>
                      </div>
                      <h4 className="font-bold text-forest dark:text-cream line-clamp-1">
                        {locale === 'bn' ? rel.namebn : rel.name}
                      </h4>
                      <p className="text-xs text-soil/70 dark:text-cream/70 line-clamp-2">
                        {locale === 'bn' ? rel.descriptionbn : rel.description}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-soil/10 dark:border-leaf/10 mt-3 flex items-center justify-between">
                      <span className="text-sm font-bold text-forest dark:text-harvest">
                        {rel.price}
                      </span>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" href={`/products/${rel.slug}`}>
                          {locale === 'bn' ? 'দেখুন' : 'View'}
                        </Button>
                        <Button
                          variant="primary"
                          size="sm"
                          href={relWaUrl}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                          💬
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
