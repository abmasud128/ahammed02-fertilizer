'use client';

import React from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/i18n/provider';

interface MegaCategory {
  id: string;
  name: string;
  namebn: string;
  icon: string;
  desc: string;
  descbn: string;
  color: string;
}

export const MEGA_CATEGORIES: MegaCategory[] = [
  {
    id: 'fertilizers',
    name: 'Fertilizers',
    namebn: 'সার ও পুষ্টি',
    icon: '🌱',
    desc: 'Urea, DAP, MOP, 10:26:26 & organic fertilizers for soil health.',
    descbn: 'ইউরিয়া, ডিএপি, পটাশ, ১০:২৬:২৬ ও সুষম জৈব সার।',
    color: 'from-emerald-500/20 to-leaf/20 border-emerald-400/30',
  },
  {
    id: 'pesticides',
    name: 'Pesticides',
    namebn: 'বালাইনাশক',
    icon: '🛡️',
    desc: 'Government-certified crop protection medicines & health shields.',
    descbn: 'ফসলের সামগ্রিক সুস্থতা ও ক্ষতিকর আক্রমণ প্রতিরোধের ওষুধ।',
    color: 'from-blue-500/20 to-cyan-500/20 border-blue-400/30',
  },
  {
    id: 'insecticides',
    name: 'Insecticides',
    namebn: 'কীটনাশক',
    icon: '🐛',
    desc: 'Targeted control for stem borers, sucking pests & aphids.',
    descbn: 'মাজরা পোকা, শোষক পোকা ও লেদা পোকা দমনের বিশ্বস্ত ওষুধ।',
    color: 'from-amber-500/20 to-orange-500/20 border-amber-400/30',
  },
  {
    id: 'fungicides',
    name: 'Fungicides',
    namebn: 'ছত্রাকনাশক',
    icon: '🍄',
    desc: 'Curative solutions for blast, blight, sheath rot & mildew.',
    descbn: 'ব্লাস্ট, ব্লাইট, গোড়া পচা ও শিষ শুকানো রোগের প্রতিকার।',
    color: 'from-purple-500/20 to-pink-500/20 border-purple-400/30',
  },
  {
    id: 'herbicides',
    name: 'Herbicides',
    namebn: 'আগাছানাশক',
    icon: '🌿',
    desc: 'Pre- & post-emergence solutions to keep fields weed-free.',
    descbn: 'ধান ও পাট ক্ষেত ঘাস ও আগাছামুক্ত রাখার সেরা দাওয়াই।',
    color: 'from-teal-500/20 to-green-500/20 border-teal-400/30',
  },
  {
    id: 'micronutrients',
    name: 'Micronutrients',
    namebn: 'অণুখাদ্য ও জিংক',
    icon: '🧪',
    desc: 'Chelated Zinc, Boron, Magnesium & plant growth stimulants.',
    descbn: 'চিলেটেড জিংক, বোরন, সালফার ও উদ্ভিদের হরমোন টনিক।',
    color: 'from-yellow-500/20 to-amber-500/20 border-yellow-400/30',
  },
  {
    id: 'seeds',
    name: 'Certified Seeds',
    namebn: 'উন্নত বীজ',
    icon: '🌾',
    desc: 'High-germination hybrid seeds for paddy, jute & vegetables.',
    descbn: 'উচ্চ ফলনশীল সার্টিফাইড ধান, পাট, সরিষা ও সবজি বীজ।',
    color: 'from-lime-500/20 to-emerald-500/20 border-lime-400/30',
  },
];

interface ProductsMegaMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export function ProductsMegaMenu({
  isOpen,
  onClose,
  onMouseEnter,
  onMouseLeave,
}: ProductsMegaMenuProps) {
  const { locale, t } = useLanguage();

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 14, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.98 }}
          transition={{ type: 'spring', damping: 22, stiffness: 280 }}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
          className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-[min(94vw,980px)] z-50 pointer-events-auto"
        >
          <div className="relative rounded-3xl bg-forest/95 dark:bg-[#07241b]/98 backdrop-blur-2xl border border-white/20 dark:border-white/10 shadow-2xl p-6 sm:p-7 text-cream overflow-hidden">
            {/* Ambient Background Gradient Rings */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-leaf/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-harvest/10 rounded-full blur-3xl pointer-events-none" />

            {/* Header Strip inside dropdown */}
            <div className="relative z-10 flex items-center justify-between pb-4 mb-4 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <span className="flex h-2.5 w-2.5 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-leaf opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-leaf" />
                </span>
                <span className="text-sm font-bold text-white tracking-wide uppercase">
                  {t('nav.categories', 'Product Categories')}
                </span>
                <span className="text-xs text-cream/70 hidden sm:inline">
                  • {locale === 'bn' ? 'সরকারি সার্টিফাইড ও খাঁটি পণ্য' : 'Government Authorized Retail'}
                </span>
              </div>

              <Link
                href="/products"
                onClick={onClose}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-harvest hover:text-amber-300 transition-colors group"
              >
                <span>{t('nav.viewAllProducts', 'View All Products')}</span>
                <svg
                  className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
            </div>

            {/* Category Cards Grid */}
            <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-3.5">
              {MEGA_CATEGORIES.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/products?category=${cat.id}`}
                  onClick={onClose}
                  className="group relative flex items-start gap-3 p-3.5 rounded-2xl bg-white/5 hover:bg-white/12 border border-white/10 hover:border-leaf/50 transition-all duration-200 hover:-translate-y-0.5 shadow-sm"
                >
                  <div
                    className={`w-10 h-10 rounded-xl bg-gradient-to-br ${cat.color} flex items-center justify-center text-xl shrink-0 group-hover:scale-110 transition-transform duration-200 border`}
                  >
                    {cat.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-white group-hover:text-harvest transition-colors truncate">
                      {locale === 'bn' ? cat.namebn : cat.name}
                    </h3>
                    <p className="text-[11px] text-cream/75 leading-tight line-clamp-2 mt-1">
                      {locale === 'bn' ? cat.descbn : cat.desc}
                    </p>
                  </div>
                </Link>
              ))}

              {/* Special Promotion/Advisory Card */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-br from-harvest/20 to-leaf/20 border border-harvest/40 flex flex-col justify-between">
                <div>
                  <div className="text-xs font-black text-harvest uppercase tracking-wider">
                    {locale === 'bn' ? 'কৃষি পরামর্শ' : 'Expert Advice'}
                  </div>
                  <p className="text-[11px] text-cream/90 leading-tight mt-1">
                    {locale === 'bn'
                      ? 'ফসলের রোগ বা পোকা শনাক্তকরণে আমাদের হোয়াটসঅ্যাপে ছবি পাঠান।'
                      : 'Send plant disease photos directly on WhatsApp for dosage guidance.'}
                  </p>
                </div>
                <Link
                  href="/contact"
                  onClick={onClose}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-white hover:text-harvest mt-2"
                >
                  <span>{locale === 'bn' ? 'পরামর্শ চান' : 'Get Advice'}</span>
                  <span>→</span>
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default ProductsMegaMenu;
