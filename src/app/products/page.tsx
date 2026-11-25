'use client';

import React, { useState, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useLanguage } from '@/i18n/provider';
import { siteConfig } from '@/config/site';
import { products, categories, ProductCategory, Product } from '@/data/products';
import SectionHeading from '@/components/ui/SectionHeading';
import { Card } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import ScrollReveal from '@/components/motion/ScrollReveal';
import { formatWhatsAppUrl, getWhatsAppProductMessage } from '@/lib/utils';

// Category emoji icon helper
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

function ProductsCatalogContent() {
  const { locale, t } = useLanguage();
  const searchParams = useSearchParams();
  const initialCategoryParam = searchParams.get('category') as ProductCategory | null;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>(
    initialCategoryParam && categories.some((c) => c.id === initialCategoryParam)
      ? initialCategoryParam
      : 'all'
  );

  const filteredProducts = useMemo(() => {
    return products.filter((prod) => {
      // Category match
      const matchesCategory =
        selectedCategory === 'all' || prod.category === selectedCategory;

      // Search match in English and Bengali
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        prod.name.toLowerCase().includes(q) ||
        prod.namebn.includes(q) ||
        prod.brand.toLowerCase().includes(q) ||
        prod.description.toLowerCase().includes(q) ||
        prod.descriptionbn.includes(q);

      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  const hasPesticideSelection =
    selectedCategory === 'pesticides' ||
    selectedCategory === 'insecticides' ||
    selectedCategory === 'fungicides' ||
    selectedCategory === 'herbicides';

  return (
    <div className="min-h-screen bg-cream dark:bg-dark-bg pt-28 pb-16 md:pt-36 md:pb-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Page Header */}
        <ScrollReveal direction="down">
          <SectionHeading
            title="Agricultural Input Catalogue"
            titlebn="কৃষি উপকরণ ক্যাটালগ"
            subtitle="Explore our government-licensed range of fertilizers, crop protection medicines, seeds, and micronutrients."
            subtitlebn="আমাদের সরকারি অনুমোদিত সার, বালাইনাশক, বীজ ও অনুখাদ্যের বিশ্বস্ত সম্ভার ঘুরে দেখুন।"
            centered
          />
        </ScrollReveal>

        {/* Safety Notice Banner if pesticide related */}
        {(hasPesticideSelection || selectedCategory === 'all') && (
          <ScrollReveal direction="up">
            <div className="rounded-xl border border-amber-300 bg-amber-50 dark:bg-amber-950/40 dark:border-amber-700/60 p-4 text-sm text-amber-900 dark:text-amber-200 flex items-start gap-3 shadow-sm">
              <span className="text-xl">⚠️</span>
              <div>
                <p className="font-semibold">
                  {locale === 'bn' ? 'কীটনাশক ও রাসায়নিক নিরাপত্তা সতর্কতা' : 'Pesticide & Agrochemical Safety Notice'}
                </p>
                <p className="mt-0.5 text-xs sm:text-sm text-amber-800 dark:text-amber-300">
                  {locale === 'bn'
                    ? 'কীটনাশক ও বালাইনাশক ব্যবহারের সময় সর্বদা নিরাপত্তা গ্লাভস ও মাস্ক ব্যবহার করুন। রাসায়নিক পণ্য শিশুদের নাগালের বাইরে রাখুন ও নির্দেশিত মাত্রায় স্প্রে করুন।'
                    : 'Always wear protective gear, mask, and rubber gloves when preparing and spraying chemical pesticides. Adhere strictly to the recommended water dilution and dosage.'}
                </p>
              </div>
            </div>
          </ScrollReveal>
        )}

        {/* Search Bar & Category Filters */}
        <div className="space-y-4">
          <div className="max-w-xl mx-auto">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  locale === 'bn'
                    ? 'পণ্যের নাম, ব্র্যান্ড বা উপাদান দিয়ে খুঁজুন...'
                    : 'Search by product name, brand, or active ingredient...'
                }
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-soil/20 dark:border-leaf/20 bg-white dark:bg-dark-surface text-forest dark:text-cream shadow-sm focus:outline-none focus:ring-2 focus:ring-leaf transition-all placeholder:text-gray-400"
              />
              <span className="absolute left-3.5 top-3.5 text-gray-400 text-lg">🔍</span>
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-3.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-sm"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Category Filter Buttons */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none sm:flex-wrap sm:justify-center">
            <button
              type="button"
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors shrink-0 ${
                selectedCategory === 'all'
                  ? 'bg-forest text-white dark:bg-leaf dark:text-forest shadow-md'
                  : 'bg-white dark:bg-dark-surface text-soil dark:text-cream border border-soil/15 dark:border-leaf/20 hover:border-leaf'
              }`}
            >
              🌐 {locale === 'bn' ? 'সকল পণ্য' : 'All Products'}
            </button>
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              const icon = cat.icon || categoryIcons[cat.id] || '🌱';
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors shrink-0 flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-forest text-white dark:bg-leaf dark:text-forest shadow-md'
                      : 'bg-white dark:bg-dark-surface text-soil dark:text-cream border border-soil/15 dark:border-leaf/20 hover:border-leaf'
                  }`}
                >
                  <span>{icon}</span>
                  <span>{locale === 'bn' ? cat.namebn : cat.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Product Count Display */}
        <div className="flex justify-between items-center text-xs sm:text-sm text-soil/70 dark:text-cream/70 border-b border-soil/10 dark:border-leaf/10 pb-3">
          <span>
            {locale === 'bn' ? 'মোট প্রদর্শিত পণ্য:' : 'Showing products:'}{' '}
            <strong className="text-forest dark:text-leaf">{filteredProducts.length}</strong>
          </span>
          {(searchQuery || selectedCategory !== 'all') && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="text-leaf hover:underline cursor-pointer"
            >
              {locale === 'bn' ? 'ফিল্টার রিসেট করুন' : 'Reset filters'}
            </button>
          )}
        </div>

        {/* Product Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((prod: Product, idx: number) => {
              const icon = categoryIcons[prod.category] || '🌱';
              const message = getWhatsAppProductMessage(prod.name, locale);
              const waUrl = formatWhatsAppUrl(siteConfig.whatsapp, message);

              return (
                <Card key={prod.id} hover tilt className="h-full flex flex-col justify-between overflow-hidden group">
                    <div className="p-5 space-y-4 flex-1">
                      {/* Card Header: Icon & Category Badge */}
                      <div className="flex items-center justify-between">
                        <div className="w-12 h-12 rounded-xl bg-forest/5 dark:bg-leaf/10 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                          {icon}
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <Badge variant="default" size="sm">
                            {locale === 'bn' ? prod.categorybn : prod.category}
                          </Badge>
                          {prod.isPesticide && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 font-medium">
                              {locale === 'bn' ? 'বালাইনাশক' : 'Caution'}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Product Name & Brand */}
                      <div>
                        <span className="text-xs font-semibold text-leaf uppercase tracking-wider">
                          {prod.brand}
                        </span>
                        <h3 className="text-lg font-bold text-forest dark:text-cream mt-0.5 group-hover:text-leaf transition-colors line-clamp-1">
                          {locale === 'bn' ? prod.namebn : prod.name}
                        </h3>
                        {locale === 'bn' && (
                          <p className="text-xs text-soil/60 dark:text-cream/50 line-clamp-1">
                            {prod.name}
                          </p>
                        )}
                      </div>

                      {/* Truncated Description */}
                      <p className="text-xs sm:text-sm text-soil/80 dark:text-cream/80 line-clamp-2">
                        {locale === 'bn' ? prod.descriptionbn : prod.description}
                      </p>

                      {/* Pack Sizes */}
                      {prod.packSizes && prod.packSizes.length > 0 && (
                        <div className="pt-1">
                          <span className="text-[11px] text-soil/60 dark:text-cream/60 block mb-1">
                            {locale === 'bn' ? 'প্যাকিং সাইজ:' : 'Packs:'}
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {prod.packSizes.slice(0, 3).map((pack, pIdx) => (
                              <span
                                key={pIdx}
                                className="text-[11px] px-2 py-0.5 rounded bg-soil/5 dark:bg-leaf/10 text-soil dark:text-cream/90"
                              >
                                {pack}
                              </span>
                            ))}
                            {prod.packSizes.length > 3 && (
                              <span className="text-[11px] px-1.5 py-0.5 rounded bg-soil/5 dark:bg-leaf/10 text-soil/60 dark:text-cream/60">
                                +{prod.packSizes.length - 3}
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Card Footer: Price & CTA buttons */}
                    <div className="p-5 pt-0 space-y-3 border-t border-soil/10 dark:border-leaf/10 mt-2">
                      <div className="flex items-baseline justify-between pt-3">
                        <span className="text-xs text-soil/60 dark:text-cream/60">
                          {locale === 'bn' ? 'দাম / এমআরপি' : 'Price / MRP'}
                        </span>
                        <span className="text-base font-bold text-forest dark:text-harvest">
                          {prod.price}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          href={`/products/${prod.slug}`}
                          className="w-full text-center text-xs"
                        >
                          {locale === 'bn' ? 'বিস্তারিত' : 'Details'}
                        </Button>
                        <Button
                          variant="primary"
                          size="sm"
                          href={waUrl}
                          className="w-full text-center text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                          💬 {locale === 'bn' ? 'হোয়াটসঅ্যাপ' : 'Enquire'}
                        </Button>
                      </div>
                    </div>
                  </Card>
              );
            })}
          </div>
        ) : (
          /* Empty State */
          <div className="text-center py-16 px-4 rounded-2xl bg-white dark:bg-dark-surface border border-soil/10 dark:border-leaf/15 max-w-lg mx-auto space-y-4">
            <span className="text-5xl">🌾</span>
            <h3 className="text-xl font-bold text-forest dark:text-cream">
              {locale === 'bn' ? 'কোনো পণ্য পাওয়া যায়নি' : 'No Agricultural Inputs Found'}
            </h3>
            <p className="text-sm text-soil/70 dark:text-cream/70">
              {locale === 'bn'
                ? 'আপনার সার্চ ফিল্টারে কোনো ফলাফল নেই। অন্য নাম লিখে চেষ্টা করুন অথবা আমাদের সরাসরি ফোন করুন।'
                : 'No products matched your search or category selection. Try a different keyword or contact our shop directly.'}
            </p>
            <div className="pt-2 flex justify-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                }}
              >
                {locale === 'bn' ? 'সব পণ্য দেখুন' : 'View All Products'}
              </Button>
              <Button
                variant="primary"
                size="sm"
                href={`tel:${siteConfig.phone}`}
              >
                📞 {locale === 'bn' ? 'দোকানে কল করুন' : 'Call Shop'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-cream dark:bg-dark-bg">
          <div className="text-center space-y-2">
            <div className="w-10 h-10 border-4 border-leaf border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm text-forest dark:text-cream">Loading products...</p>
          </div>
        </div>
      }
    >
      <ProductsCatalogContent />
    </Suspense>
  );
}
