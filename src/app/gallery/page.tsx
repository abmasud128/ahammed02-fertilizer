'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/i18n/provider';
import { Card } from '@/components/ui/Card';
import SectionHeading from '@/components/ui/SectionHeading';
import { Modal } from '@/components/ui/Modal';
import ScrollReveal from '@/components/motion/ScrollReveal';

type GalleryCategory = 'all' | 'shop' | 'products' | 'farmers';

interface GalleryItem {
  id: string;
  category: 'shop' | 'products' | 'farmers';
  title: string;
  titlebn: string;
  desc: string;
  descbn: string;
  heightClass: string;
  gradient: string;
  icon: string;
  image?: string;
  badge?: string;
  badgebn?: string;
}

const galleryItems: GalleryItem[] = [
  {
    id: 'g-1',
    category: 'shop',
    title: 'Main Shop Front & Entrance',
    titlebn: 'দোকানের সম্মুখভাগ ও প্রবেশপথ',
    desc: 'Our retail store at Chapmatali, Dakshin Dinajpur, featuring double rolling shutters and verified crop advisory banners.',
    descbn: 'চাপমাটালি, দক্ষিণ দিনাজপুরে আমাদের খুচরা দোকান—কৃষক ভাইদের খাঁটি সার ও পরামর্শ সেবা প্রদানে সদা প্রস্তুত।',
    heightClass: 'h-72 sm:h-80',
    gradient: 'from-emerald-800 via-forest to-leaf',
    icon: '🏪',
    image: '/images/shop/storefront-exterior.png',
    badge: 'Storefront',
    badgebn: 'দোকান',
  },
  {
    id: 'g-2',
    category: 'shop',
    title: 'Retail Counter & Stock Access',
    titlebn: 'খুচরা বিক্রয় কাউন্টার ও মজুত সার',
    desc: 'Twin-shutter entrance featuring active fertilizer sack stacks on the left and full plant protection & bio-nutrient desk on the right.',
    descbn: 'একপাশে প্রস্তুত সারের মজুত এবং অন্যপাশে বালাইনাশক ও অনুখাদ্য পরামর্শ কাউন্টার নিয়ে আমাদের দৈনন্দিন সেবা।',
    heightClass: 'h-80 sm:h-96',
    gradient: 'from-teal-800 via-forest to-emerald-800',
    icon: '🛒',
    image: '/images/shop/shop-counter-entrance.png',
    badge: 'Sales Counter',
    badgebn: 'কাউন্টার',
  },
  {
    id: 'g-3',
    category: 'products',
    title: 'Crop Protection & Bio-Pesticides',
    titlebn: 'বালাইনাশক, কীটনাশক ও অনুখাদ্য সমাহার',
    desc: 'Authorized stock of insecticides, fungicides, plant growth regulators, and foliar spray boosters ready for dispensing.',
    descbn: 'কীটনাশক, ছত্রাকনাশক ও অনুখাদ্যের অনুমোদিত ও খাঁটি প্রস্তুতকারক বোতল ও প্যাকেটের সুসজ্জিত সমাহার।',
    heightClass: 'h-64 sm:h-72',
    gradient: 'from-cyan-900 via-forest to-emerald-900',
    icon: '🛡️',
    image: '/images/shop/pesticides-and-products.png',
    badge: 'Crop Protection',
    badgebn: 'বালাইনাশক',
  },
  {
    id: 'g-4',
    category: 'shop',
    title: 'Fertilizer Godown & Bulk Storage',
    titlebn: 'সারের প্রধান গুদামঘর ও স্তূপ',
    desc: 'Safe, elevated, moisture-protected storage stacked high with verified 50 kg bags of Urea, DAP, MOP, and NPK complex.',
    descbn: 'আর্দ্রতামুক্ত শুষ্ক গুদামে সুরক্ষিতভাবে স্তূপীকৃত ইউরিয়া, ডিএপি ও পটাশ সারের সুপরিসর ভাণ্ডার।',
    heightClass: 'h-96 sm:h-[420px]',
    gradient: 'from-green-800 via-forest to-dark-surface',
    icon: '🏗️',
    image: '/images/shop/warehouse-stock.png',
    badge: 'Godown Stock',
    badgebn: 'গুদামঘর',
  },
  {
    id: 'g-5',
    category: 'products',
    title: 'Open Sacks for Retail Weighing',
    titlebn: 'খাঁটি সারবস্তা ও খুচরা ওজন বিক্রয়',
    desc: 'Fresh open fertilizer sacks allowing farmers to inspect granule purity, dryness, and purchase exact kg quantities as needed.',
    descbn: 'সারের দানার মান ও বিশুদ্ধতা সরাসরি যাচাই করে প্রয়োজনমতো ১ কেজি বা যেকোনো পরিমাপে কেনার সুবিধা।',
    heightClass: 'h-64 sm:h-72',
    gradient: 'from-amber-600 via-harvest to-yellow-600',
    icon: '⚖️',
    image: '/images/shop/fertilizer-sacks.png',
    badge: 'Loose & Bag Units',
    badgebn: 'খুচরা ও বস্তা সার',
  },
  {
    id: 'g-6',
    category: 'products',
    title: 'Bio-Organic & Micronutrient Granules',
    titlebn: 'উন্নত মানের জৈব ও অনুখাদ্য দানা',
    desc: 'Rich, high-density organic fertilizer granules ensuring sustained slow nutrient release and improved soil microbiology.',
    descbn: 'উন্নত মানের কালো দানাদার জৈব সার—যা মাটির গঠন উন্নত করে এবং ফসলে দীর্ঘস্থায়ী পুষ্টি যোগায়।',
    heightClass: 'h-80 sm:h-96',
    gradient: 'from-yellow-700 via-amber-700 to-amber-900',
    icon: '🌱',
    image: '/images/shop/organic-fertilizer-granules.png',
    badge: 'Organic Granules',
    badgebn: 'জৈব দানা',
  },
  {
    id: 'g-7',
    category: 'farmers',
    title: 'Farmer Advisory Session',
    titlebn: 'চাষীদের সাথে মতবিনিময় ও পরামর্শ',
    desc: 'Guiding potato growers on late blight management and prophylactic fungicide timing.',
    descbn: 'আলু চাষে নাভিধসা রোগ নিয়ন্ত্রণ ও সঠিক ছত্রাকনাশক স্প্রে নিয়ে পরামর্শ অধিবেশন।',
    heightClass: 'h-64 sm:h-72',
    gradient: 'from-teal-800 via-forest to-emerald-800',
    icon: '👨‍🌾',
    badge: 'Field Advisory',
    badgebn: 'মাঠ পরামর্শ',
  },
  {
    id: 'g-8',
    category: 'farmers',
    title: 'Bumper Paddy Harvest in Dakshin Dinajpur',
    titlebn: 'বাম্পার ধান ফলনে কৃষকের আনন্দ',
    desc: 'Local growers sharing their successful crop outcomes following balanced nutrition recommendations.',
    descbn: 'সুষম সার ও পরিচর্যায় স্বর্ণা ধানের ভরপুর ফলন পেয়ে কৃষকের তৃপ্তির হাসি।',
    heightClass: 'h-64 sm:h-72',
    gradient: 'from-emerald-800 via-leaf to-green-700',
    icon: '🌾',
    badge: 'Harvest Success',
    badgebn: 'সফল ফসল',
  },
  {
    id: 'g-9',
    category: 'farmers',
    title: 'Vegetable Field Inspection',
    titlebn: 'সবজি ক্ষেত পরিদর্শন ও পরামর্শ',
    desc: 'Identifying sucking pests like thrips and whiteflies directly on brinjal and chilli crops.',
    descbn: 'লঙ্কা ও বেগুনে জাবপোকা এবং সাদা মাছি সনাক্তকরণে মাঠে সরাসরি পরিদর্শন।',
    heightClass: 'h-64 sm:h-72',
    gradient: 'from-lime-800 via-leaf to-forest',
    icon: '🧑‍🌾',
    badge: 'Pest Diagnosis',
    badgebn: 'রোগ নির্ণয়',
  },
];

export default function GalleryPage() {
  const { locale, t } = useLanguage();
  const isBn = locale === 'bn';

  const [activeCategory, setActiveCategory] = useState<GalleryCategory>('all');
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);

  const filterTabs = [
    { id: 'all', label: 'All Photos', labelbn: 'সকল ছবি' },
    { id: 'shop', label: 'Shop & Counter', labelbn: 'দোকান ও গুদাম' },
    { id: 'products', label: 'Products & Inputs', labelbn: 'পণ্য ও উপকরণ' },
    { id: 'farmers', label: 'Farmers & Fields', labelbn: 'চাষী ও ফসল' },
  ];

  const filteredItems =
    activeCategory === 'all'
      ? galleryItems
      : galleryItems.filter((item) => item.category === activeCategory);

  return (
    <div className="min-h-screen pt-20 pb-16">
      {/* Header Banner */}
      <section className="bg-gradient-to-b from-forest/15 via-leaf/5 to-transparent dark:from-forest/20 dark:via-dark-bg py-14 md:py-20 border-b border-forest/10 dark:border-leaf/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <ScrollReveal direction="down">
            <span className="inline-block py-1 px-3.5 rounded-full bg-forest/10 dark:bg-leaf/20 text-forest dark:text-leaf text-xs md:text-sm font-bold tracking-wide uppercase mb-3">
              📸 {isBn ? 'ফটোগ্যালারি' : 'Photo Gallery'}
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-forest dark:text-cream tracking-tight mb-4">
              {isBn ? 'দোকান ও মাঠের চিত্রশালা' : 'A Glimpse into Our Shop & Fields'}
            </h1>
            <p className="max-w-2xl mx-auto text-base sm:text-lg text-gray-700 dark:text-gray-300 font-medium">
              {isBn
                ? 'আহাম্মেদ ফার্টিলাইজারের পরিকাঠামো, সুষম পণ্যের সম্ভার এবং স্থানীয় কৃষকদের সফল চাষাবাদের কিছু মুহূর্ত।'
                : 'Explore our genuine facility in Chapmatali, genuine agricultural product range, and real farmer moments across Dakshin Dinajpur.'}
            </p>
          </ScrollReveal>

          {/* Category Filter Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-8">
            {filterTabs.map((tab) => {
              const isActive = activeCategory === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveCategory(tab.id as GalleryCategory)}
                  className={`px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-forest text-white shadow-md shadow-forest/20 scale-105'
                      : 'bg-white/80 dark:bg-dark-surface/80 text-forest dark:text-cream hover:bg-forest/10 dark:hover:bg-leaf/20 border border-gray-200 dark:border-white/10'
                  }`}
                >
                  {isBn ? tab.labelbn : tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Masonry Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="break-inside-avoid cursor-pointer group"
              onClick={() => setSelectedItem(item)}
            >
              <Card
                hover
                className={`p-0 overflow-hidden border-white/20 dark:border-white/10 shadow-md ${item.heightClass} flex flex-col justify-between relative bg-gradient-to-br ${item.gradient} text-white`}
              >
                {/* Real photo if available */}
                {item.image ? (
                  <img
                    src={item.image}
                    alt={isBn ? item.titlebn : item.title}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                ) : null}

                {/* Gradient shade over image */}
                <div
                  className={`absolute inset-0 ${
                    item.image
                      ? 'bg-gradient-to-t from-black/90 via-black/35 to-black/30'
                      : ''
                  } pointer-events-none`}
                />

                {/* Top bar: Category badge & Icon */}
                <div className="p-4 flex items-center justify-between z-10 relative">
                  <span className="text-xs font-bold uppercase tracking-wider bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-md border border-white/20 text-white">
                    {item.badge
                      ? isBn
                        ? item.badgebn || item.badge
                        : item.badge
                      : item.category === 'shop'
                      ? isBn
                        ? 'দোকান'
                        : 'Shop'
                      : item.category === 'products'
                      ? isBn
                        ? 'পণ্য'
                        : 'Products'
                      : isBn
                      ? 'চাষী'
                      : 'Farmers'}
                  </span>
                  <span className="text-2xl drop-shadow-md bg-black/40 backdrop-blur-xs p-1.5 rounded-full border border-white/15">
                    {item.icon}
                  </span>
                </div>

                {/* Center inspection badge on hover */}
                <div className="my-auto px-6 text-center z-10 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-forest/90 backdrop-blur-md text-xs font-bold text-cream border border-white/30 shadow-lg">
                    🔍 {isBn ? 'বড় করে দেখুন' : 'Click to view photo'}
                  </span>
                </div>

                {/* Bottom title bar */}
                <div className="p-4 z-10 relative">
                  <h4 className="font-bold text-base text-white leading-tight drop-shadow-md">
                    {isBn ? item.titlebn : item.title}
                  </h4>
                  <p className="text-xs text-white/90 line-clamp-2 mt-1 drop-shadow">
                    {isBn ? item.descbn : item.desc}
                  </p>
                </div>

                {/* Hover overlay sheen */}
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              </Card>
            </div>
          ))}
        </div>
      </section>

      {/* Lightbox Modal */}
      {selectedItem && (
        <Modal
          isOpen={!!selectedItem}
          onClose={() => setSelectedItem(null)}
          title={isBn ? selectedItem.titlebn : selectedItem.title}
        >
          <div className="space-y-4">
            {selectedItem.image ? (
              <div className="w-full max-h-[65vh] rounded-xl overflow-hidden bg-black/95 flex items-center justify-center relative shadow-inner border border-forest/20">
                <img
                  src={selectedItem.image}
                  alt={isBn ? selectedItem.titlebn : selectedItem.title}
                  className="w-full h-auto max-h-[65vh] object-contain rounded-lg"
                />
              </div>
            ) : (
              <div
                className={`w-full h-72 sm:h-80 rounded-xl bg-gradient-to-br ${selectedItem.gradient} flex flex-col items-center justify-center text-white relative shadow-inner overflow-hidden`}
              >
                <span className="text-7xl mb-4 drop-shadow-md">{selectedItem.icon}</span>
                <span className="text-base font-bold bg-black/40 backdrop-blur-xs px-4 py-1.5 rounded-full border border-white/20">
                  Ahammed Fertilizer
                </span>
                <p className="text-xs text-white/70 mt-2">
                  Chapmatali, Dakshin Dinajpur
                </p>
              </div>
            )}

            <div className="p-2 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-leaf bg-leaf/10 dark:bg-leaf/20 px-2 py-0.5 rounded">
                    {selectedItem.badge || selectedItem.category.toUpperCase()}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    📍 Chapmatali, Dakshin Dinajpur
                  </span>
                </div>
                <a
                  href={`https://wa.me/919735496464?text=${encodeURIComponent(
                    `Hello Ahammed Fertilizer, I saw the photo "${selectedItem.title}" on your website gallery. I would like to know more.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#25D366] text-white text-xs font-bold hover:bg-[#20ba5a] transition-colors"
                >
                  💬 {isBn ? 'হোয়াটসঅ্যাপে জানুন' : 'Ask on WhatsApp'}
                </a>
              </div>
              <p className="text-gray-700 dark:text-gray-300 text-sm sm:text-base leading-relaxed">
                {isBn ? selectedItem.descbn : selectedItem.desc}
              </p>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
