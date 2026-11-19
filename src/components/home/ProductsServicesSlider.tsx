'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/i18n/provider';
import { siteConfig } from '@/config/site';
import { formatWhatsAppUrl } from '@/lib/utils';
import {
  Sparkles,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';

interface ProductServiceItem {
  id: string;
  category: 'fertilizer' | 'protection' | 'service';
  title: string;
  titleBn: string;
  badge: string;
  badgeBn: string;
  badgeColor: string;
  image: string;
  specs: string[];
  specsBn: string[];
  pricing: string;
  pricingBn: string;
  href: string;
  whatsappMessage: string;
  whatsappMessageBn: string;
}

const ITEMS: ProductServiceItem[] = [
  {
    id: 'granular-fertilizers',
    category: 'fertilizer',
    title: 'Govt. Licensed Urea, DAP & Potash',
    titleBn: 'সরকারি সিলগালা ইউরিয়া, ডিএপি ও পটাশ',
    badge: '100% Genuine Brands',
    badgeBn: '১০০% খাঁটি ও সিলগালা',
    badgeColor: 'bg-emerald-500/25 text-emerald-300 border-emerald-400/40',
    image: '/images/shop/warehouse-stock.png',
    specs: [
      'Urea (46% N), DAP (18:46:0), MOP (60% K)',
      'IFFCO, KRIBHCO & IPL verified brand sacks',
      'Sold in 50 kg sealed bags or exact loose kg weighing',
    ],
    specsBn: [
      'ইউরিয়া (৪৬% N), ডিএপি (১৮:৪৬:০) ও মিউরেট অব পটাশ',
      'আইএফএফসিও, কৃভকো ও আইপিএল অনুমোদিত ব্র্যান্ড',
      '৫০ কেজি সিলগালা বস্তা বা প্রয়োজনমতো খুচরা কেজি ওজন',
    ],
    pricing: 'Govt. Subsidized Controlled Rates',
    pricingBn: 'সরকারি ভর্তুকিযুক্ত ন্যায্য মূল্য',
    href: '/products?category=fertilizers',
    whatsappMessage: 'Hello Ahammed Fertilizer, I would like to check current fertilizer sack rates (Urea/DAP/MOP).',
    whatsappMessageBn: 'নমস্কার, আমি ইউরিয়া, ডিএপি ও পটাশ সারের বর্তমান বস্তা দর ও প্রাপ্যতা জানতে চাই।',
  },
  {
    id: 'bio-organic-granules',
    category: 'fertilizer',
    title: 'Bio-Organic & Slow-Release Nutrients',
    titleBn: 'উন্নত দানাদার জৈব সার ও হিউমিক অ্যাসিড',
    badge: 'Soil Enhancer',
    badgeBn: 'মাটির উর্বরতা বৃদ্ধি',
    badgeColor: 'bg-lime-500/25 text-lime-300 border-lime-400/40',
    image: '/images/shop/organic-fertilizer-granules.png',
    specs: [
      'Concentrated organic carbon & mycorrhiza fungi',
      'Promotes deep root branching & drought resilience',
      'Safe for paddy, potato, mustard & seasonal vegetables',
    ],
    specsBn: [
      'ঘন জৈব কার্বন ও উপকারি মাইকোরাইজা ছত্রাক সমৃদ্ধ',
      'গভীর শিকড় বিস্তার এবং খরায় আর্দ্রতা ধরে রাখতে সক্ষম',
      'ধান, আলু, সরিষা ও সকল শাকসবজির জন্য সম্পূর্ণ নিরাপদ',
    ],
    pricing: 'From ₹45 / kg loose or 25kg bags',
    pricingBn: 'প্রতি কেজি ₹৪৫ থেকে বা ২৫ কেজি ব্যাগ',
    href: '/products?category=fertilizers',
    whatsappMessage: 'Hello, please guide me on organic fertilizer granules dosage per bigha.',
    whatsappMessageBn: 'নমস্কার, বিঘা প্রতি জৈব দানাদার সার প্রয়োগের সঠিক মাত্রা জানতে চাই।',
  },
  {
    id: 'crop-insecticides',
    category: 'protection',
    title: 'Certified Insecticides & Pest Shields',
    titleBn: 'অনুমোদিত কীটনাশক ও পোকা দমন ওষুধ',
    badge: 'High Efficacy Shields',
    badgeBn: 'তীব্র কার্যকরী বালাইনাশক',
    badgeColor: 'bg-amber-500/25 text-amber-300 border-amber-400/40',
    image: '/images/shop/pesticides-and-products.png',
    specs: [
      'Systemic control for stem borer, leafhopper & thrips',
      'Cartap, Chlorpyrifos, Emamectin & Fipronil',
      'Genuine manufacturer seals with batch verification',
    ],
    specsBn: [
      'মাজরা, বাদামী ঘাসফড়িং ও পাতা মোড়ানো পোকা দমন',
      'কার্টাপ, ক্লোরপাইরিফস, ইম্যামেকটিন ও ফিপ্রোনিল ফর্মুলেশন',
      'উৎপাদক কোম্পানির আসল হলোগ্রাম ও ব্যাচ নম্বর যাচাইকৃত',
    ],
    pricing: 'Certified MRP with Farmer Discounts',
    pricingBn: 'ন্যায্য এমআরপি ও বিশেষ কৃষক ছাড়',
    href: '/products?category=pesticides',
    whatsappMessage: 'Hello, I need effective pesticide recommendation for insect attack in my crops.',
    whatsappMessageBn: 'নমস্কার, আমার ফসলে পোকার আক্রমণের জন্য কার্যকরী কীটনাশক পরামর্শ চাই।',
  },
  {
    id: 'crop-fungicides',
    category: 'protection',
    title: 'Curative & Protective Fungicides',
    titleBn: 'ছত্রাকনাশক ও পাতা পচা রোগের প্রতিষেধক',
    badge: 'Crop Doctor',
    badgeBn: 'ফসল রোগ নিরাময়',
    badgeColor: 'bg-rose-500/25 text-rose-300 border-rose-400/40',
    image: '/images/hero/farmer-crop-advisory.jpg',
    specs: [
      'Controls sheath blight, blast, tikka & root rot',
      'Tricyclazole, Azoxystrobin, Mancozeb & Carbendazim',
      'Rapid foliar absorption within 2 hours of spraying',
    ],
    specsBn: [
      'শীষ ব্লাস্ট, খোল পচা, ডাউনি মিলডিউ ও শিকড় পচা প্রতিরোধ',
      'ট্রাইসাইক্লাজোল, অ্যাজোক্সিস্ট্রোবিন ও ম্যানকোজেব ফর্মুলা',
      'স্প্রে করার মাত্র ২ ঘণ্টার মধ্যে উদ্ভিদের কোষে সক্রিয়',
    ],
    pricing: 'Packs from 100g to 1 Litre',
    pricingBn: '১০০ গ্রাম থেকে ১ লিটার প্যাক',
    href: '/products?category=pesticides',
    whatsappMessage: 'Hello, I have fungus and leaf spot issues in my paddy/potato. Please advise medicine.',
    whatsappMessageBn: 'নমস্কার, ধান বা আলুতে পাতা ঝলসানো ও ছত্রাকের লক্ষণ দেখা যাচ্ছে। ওষুধ প্রেসক্রিপশন চাই।',
  },
  {
    id: 'micronutrients-zinc-boron',
    category: 'fertilizer',
    title: 'Chelated Micronutrients & Zinc/Boron',
    titleBn: 'চিলেটেড অণুখাদ্য, বোরণ ২০% ও জিংক',
    badge: 'Vital Nutrition',
    badgeBn: 'অত্যাবশ্যক অণুখাদ্য',
    badgeColor: 'bg-cyan-500/25 text-cyan-300 border-cyan-400/40',
    image: '/images/shop/fertilizer-sacks.png',
    specs: [
      'Chelated Zinc EDTA 12%, Soluble Boron 20%',
      'Prevents grain sterility and hollow stems in paddy',
      'Enhances chlorophyll photosynthesis and tuber size',
    ],
    specsBn: [
      'চিলেটেড জিংক ইডিটিএ ১২% ও দ্রবণীয় বোরণ ২০%',
      'ধানে চিটা হওয়া বন্ধ করে এবং আলুর ত্বক সুন্দর রাখে',
      'পাতায় সবুজ ক্লোরোফিল তৈরি বাড়িয়ে বাম্পার ফলন আনে',
    ],
    pricing: 'Foliar Spray & Soil Application',
    pricingBn: 'স্প্রে ও জমি তৈরির জন্য সুলভ দর',
    href: '/products?category=micronutrients',
    whatsappMessage: 'Hello, please share prices and application guide for Chelated Zinc and Boron 20%.',
    whatsappMessageBn: 'নমস্কার, চিলেটেড জিংক এবং সলিউবল বোরণ ২০% এর মূল্য ও প্রয়োগবিধি জানতে চাই।',
  },
  {
    id: 'soil-water-lab-service',
    category: 'service',
    title: 'Soil & Water Diagnostic Lab Testing',
    titleBn: 'মাটি ও জলের অন-সাইট বৈজ্ঞানিক ল্যাব পরীক্ষা',
    badge: '24-48h Fast Lab Report',
    badgeBn: '২৪-৪৮ ঘণ্টায় ল্যাব রিপোর্ট',
    badgeColor: 'bg-harvest/30 text-harvest border-harvest/50',
    image: '/images/hero/panoramic-bengal-farms.jpg',
    specs: [
      'Tests pH, EC, Organic Carbon, N, P, K & Micro-elements',
      'Pond water testing for Dissolved Oxygen, Ammonia & Hardness',
      'Personalized agronomic prescription from experienced experts',
    ],
    specsBn: [
      'মাটির পিএইচ, লবণাক্ততা, জৈব কার্বন ও পুষ্টির মাত্রা নির্ধারণ',
      'পুকুরের জলের অক্সিজেন, অ্যামোনিয়া ও ক্ষারত্ব বিশ্লেষণ',
      'পরীক্ষার রিপোর্টের ভিত্তিতে সঠিক সার ও ওষুধের প্রেসক্রিপশন',
    ],
    pricing: 'From ₹250 / Test Slot',
    pricingBn: 'মাত্র ₹২৫০ থেকে টেস্ট স্লট',
    href: '/book-test',
    whatsappMessage: 'Hello Ahammed Fertilizer, I would like to book a soil / water health test slot.',
    whatsappMessageBn: 'নমস্কার, আমি আমার জমি/পুকুরের জন্য একটি মৃত্তিকা/জল পরীক্ষা স্লট বুক করতে চাই।',
  },
];

export default function ProductsServicesSlider() {
  const { locale } = useLanguage();
  const isBn = locale === 'bn';
  const [filter, setFilter] = useState<'all' | 'fertilizer' | 'protection' | 'service'>('all');

  const filteredItems = filter === 'all' ? ITEMS : ITEMS.filter((item) => item.category === filter);
  const filterOptions = [
    { id: 'all', label: isBn ? 'সকল পণ্য ও সেবা' : 'All Products & Services' },
    { id: 'fertilizer', label: isBn ? 'সার ও পুষ্টি' : 'Fertilizers & Nutrients' },
    { id: 'protection', label: isBn ? 'বালাইনাশক ও ওষুধ' : 'Crop Protection' },
    { id: 'service', label: isBn ? 'ল্যাব ও পরামর্শ' : 'Lab & Diagnostic Services' },
  ] as const;

  return (
    <section
      className="relative py-12 md:py-20 px-4 sm:px-6 lg:px-8 bg-cover bg-center lg:bg-fixed overflow-hidden"
      style={{ backgroundImage: `url('/images/backgrounds/bg-services.jpg')` }}
    >
      {/* Subtle edge vignette strictly for contrast without washing out photography */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/35 to-black/60 pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-harvest/20 border border-harvest/40 text-harvest text-xs sm:text-sm font-bold uppercase tracking-wider mb-3.5 backdrop-blur-md">
            <Sparkles className="w-4 h-4 text-harvest" />
            {isBn ? 'খাঁটি কৃষি উপকরণ ও বৈজ্ঞানিক সেবা' : 'Certified Agri Inputs & Expert Services'}
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-black text-white tracking-tight leading-tight">
            {isBn ? (
              <>
                সার, বালাইনাশক ও <span className="text-harvest">কৃষি সেবা সমাহার</span>
              </>
            ) : (
              <>
                Fertilizers, Crop Protection & <span className="text-harvest">Advisory Services</span>
              </>
            )}
          </h2>
          <p className="mt-3 text-sm sm:text-base md:text-lg text-cream/85 font-medium leading-relaxed">
            {isBn
              ? 'দক্ষিণ দিনাজপুরের কৃষকদের জন্য অনুমোদিত ব্রান্ডের খাঁটি সার, কীটনাশক ও বিজ্ঞানসম্মত ল্যাব টেস্ট সেবা।'
              : 'Direct access to government-licensed fertilizers, verified crop protection and scientific soil testing in Dakshin Dinajpur.'}
          </p>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 mt-8">
            {filterOptions.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setFilter(cat.id)}
                className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer backdrop-blur-md ${
                  filter === cat.id
                    ? 'bg-harvest text-forest font-black shadow-lg shadow-amber-950/40 border border-harvest scale-105'
                    : 'bg-white/10 hover:bg-white/18 text-cream border border-white/15'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Seamless, Gapless, Perfectly Spaced Grid of Cards ── */}
        <motion.div
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7 items-stretch"
        >
          <AnimatePresence>
            {filteredItems.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.4 }}
                className="relative rounded-3xl overflow-hidden border border-white/20 shadow-2xl group flex flex-col justify-between p-6 sm:p-7 min-h-[460px] hover:border-harvest/70 transition-all duration-300 hover:-translate-y-1"
              >
                {/* ── High-Quality Real-Life Background Image filling EACH Card ── */}
                <Image
                  src={item.image}
                  alt={isBn ? item.titleBn : item.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out pointer-events-none"
                />

                {/* Deep Tone Gradient Overlay for 100% text contrast and readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/75 to-black/35 pointer-events-none" />

                {/* Top Badge & Pricing Pill */}
                <div className="relative z-10 flex items-center justify-between gap-2">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border backdrop-blur-md ${item.badgeColor}`}>
                    {isBn ? item.badgeBn : item.badge}
                  </span>
                  <span className="text-xs font-black text-harvest bg-black/70 border border-white/20 backdrop-blur-md px-3 py-1 rounded-xl">
                    {isBn ? item.pricingBn : item.pricing}
                  </span>
                </div>

                {/* Bottom Content: Title, Specs & Action Buttons */}
                <div className="relative z-10 pt-16 space-y-3.5">
                  <h3 className="text-lg sm:text-xl font-black text-white group-hover:text-harvest transition-colors line-clamp-2 leading-snug">
                    {isBn ? item.titleBn : item.title}
                  </h3>

                  {/* Specs List */}
                  <ul className="space-y-2 text-xs sm:text-[13px] text-cream/90 font-medium">
                    {(isBn ? item.specsBn : item.specs).map((spec, sIdx) => (
                      <li key={sIdx} className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span className="leading-tight">{spec}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Action Buttons */}
                  <div className="pt-3 border-t border-white/15 flex items-center gap-2.5">
                    <a
                      href={formatWhatsAppUrl(
                        siteConfig.whatsapp,
                        isBn ? item.whatsappMessageBn : item.whatsappMessage
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:brightness-110 text-white font-extrabold text-xs sm:text-sm text-center shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2"
                    >
                      <span>💬</span>
                      <span>{isBn ? 'হোয়াটসঅ্যাপ অর্ডার' : 'WhatsApp Order'}</span>
                    </a>
                    <Link
                      href={item.href}
                      className="p-3 rounded-xl bg-white/15 hover:bg-white/25 text-white border border-white/20 transition-colors shrink-0 flex items-center justify-center"
                      title={isBn ? 'বিস্তারিত দেখুন' : 'View Details'}
                    >
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Bottom Storefront Verification Strip */}
        <div className="mt-12 p-5 sm:p-6 rounded-3xl bg-forest/80 border border-white/20 backdrop-blur-2xl flex flex-col sm:flex-row items-center justify-between gap-5 text-center sm:text-left shadow-2xl">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-harvest/20 border border-harvest/40 flex items-center justify-center text-harvest text-2xl shrink-0">
              🏬
            </div>
            <div>
              <p className="text-sm sm:text-base font-extrabold text-white">
                {isBn ? 'সরাসরি চাপমাটালি দোকানে এসে যাচাই করে সার নিন' : 'Visit Our Store at Chapmatali, Dakshin Dinajpur'}
              </p>
              <p className="text-xs sm:text-sm text-cream/75 mt-0.5 font-medium">
                {isBn ? '৫০ কেজি বস্তা অথবা প্রয়োজনমতো খাঁটি খুচরা ওজন সুবিধা' : 'Govt. Subsidized Rates • Retail & Wholesale Godown • Spot Weight Verification'}
              </p>
            </div>
          </div>
          <Link
            href="/products"
            className="px-6 py-3 rounded-xl bg-harvest hover:bg-amber-400 text-forest font-black text-xs sm:text-sm shadow-xl transition-all whitespace-nowrap"
          >
            {isBn ? 'সম্পূর্ণ পণ্যের তালিকা দেখুন' : 'View Full Catalogue'} →
          </Link>
        </div>

      </div>
    </section>
  );
}
