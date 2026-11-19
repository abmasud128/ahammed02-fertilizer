'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/i18n/provider';
import { siteConfig } from '@/config/site';
import { products, categories } from '@/data/products';
import { crops } from '@/data/crops';
import { testimonials } from '@/data/testimonials';
import { offers } from '@/data/offers';
import Button from '@/components/ui/Button';
import ProductCard from '@/components/ui/ProductCard';
import SectionHeading from '@/components/ui/SectionHeading';
import AnimatedCounter from '@/components/motion/AnimatedCounter';
import ScrollReveal from '@/components/motion/ScrollReveal';
import ContactSection from '@/components/home/ContactSection';
import Link from 'next/link';

import HeroSection from '@/components/home/HeroSection';
import PlantBiologySection from '@/components/home/PlantBiologySection';
import ProductsServicesSlider from '@/components/home/ProductsServicesSlider';
import FullWidthFarmBanner from '@/components/home/FullWidthFarmBanner';
import CropFertilizerCalculator from '@/components/home/CropFertilizerCalculator';
import { FlaskConical, CheckCircle2, ArrowRight, Sparkles } from 'lucide-react';

/* ═══════════════════════════════════════════════════════════
   HOME PAGE (100% REAL-LIFE PHOTOGRAPHIC BACKDROPS, ZERO SOLID BLOCKS)
   ═══════════════════════════════════════════════════════════ */
export default function HomePage() {
  const { t, locale } = useLanguage();
  const [showOfferPopup, setShowOfferPopup] = useState(false);
  const featuredProducts = products.filter((p) => p.featured);

  // Show seasonal offer popup once per session
  useEffect(() => {
    const dismissed = sessionStorage.getItem('offer-popup-dismissed');
    if (!dismissed && offers.length > 0) {
      const timer = setTimeout(() => setShowOfferPopup(true), 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  const dismissPopup = () => {
    setShowOfferPopup(false);
    sessionStorage.setItem('offer-popup-dismissed', 'true');
  };

  return (
    <>
      {/* ─── 1. HERO SECTION ─────────────────────────────────── */}
      <HeroSection />

      {/* ─── 2. EDUCATIONAL PLANT BIOLOGY & NUTRITION SECTION ─── */}
      <PlantBiologySection />

      {/* ─── 3. PRODUCTS & SERVICES SLIDER (FERTILIZERS & PESTICIDES) ── */}
      <ProductsServicesSlider />

      {/* ─── 4. FULL-WIDTH REAL-LIFE AGRICULTURAL PHOTOGRAPH BANNER ── */}
      <FullWidthFarmBanner />

      {/* ─── 5. ABOUT SUMMARY WITH REAL-LIFE FARMING BACKGROUND ─── */}
      <section
        className="relative py-12 md:py-20 px-4 sm:px-6 lg:px-8 overflow-hidden bg-cover bg-center lg:bg-fixed text-white"
        style={{ backgroundImage: `url('/images/backgrounds/bg-about.jpg')` }}
      >
        {/* Subtle localized edge vignette strictly for contrast */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/35 to-black/60 pointer-events-none" />
        <div className="relative z-10 max-w-6xl mx-auto">
          <ScrollReveal>
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <SectionHeading
                  title="About Ahammed Fertilizer"
                  titlebn="আহাম্মেদ ফার্টিলাইজার সম্পর্কে"
                  subtitle={t('home.about.description')}
                  subtitlebn={t('home.about.descriptionbn') || ''}
                  light
                  centered={false}
                />
                <div className="mt-6 flex flex-wrap items-center gap-4">
                  <Button variant="primary" href="/about">
                    {t('common.readMore')} →
                  </Button>
                  <Button variant="outline" href="/gallery" className="text-white border-white/30 hover:bg-white/10">
                    📸 {locale === 'bn' ? 'দোকানের ছবি দেখুন' : 'View Shop Gallery'}
                  </Button>
                </div>
              </div>
              <div className="relative group">
                <div className="aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl border-2 border-white/20 relative bg-forest/20 backdrop-blur-md">
                  <img
                    src="/images/shop/storefront-exterior.png"
                    alt={locale === 'bn' ? 'আহাম্মেদ ফার্টিলাইজার দোকান, চাপমাটালি' : 'Ahammed Fertilizer Shop, Chapmatali'}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-forest/80 backdrop-blur-xs text-xs font-semibold text-cream mb-1 border border-white/20">
                      📍 {locale === 'bn' ? 'চাপমাটালি, দক্ষিণ দিনাজপুর' : 'Chapmatali, Dakshin Dinajpur'}
                    </span>
                    <p className="text-sm font-bold text-white drop-shadow-sm">
                      {locale === 'bn' ? 'আহাম্মেদ ফার্টিলাইজারের প্রধান বিক্রয়কেন্দ্র' : 'Ahammed Fertilizer Retail Storefront'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ─── 6. FEATURED PRODUCTS WITH REAL-LIFE FIELD BACKGROUND ─── */}
      <section
        className="relative py-12 md:py-20 px-4 sm:px-6 lg:px-8 overflow-hidden bg-cover bg-center lg:bg-fixed text-white"
        style={{ backgroundImage: `url('/images/backgrounds/bg-featured-products.jpg')` }}
      >
        {/* Subtle localized edge vignette strictly for contrast */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/35 to-black/60 pointer-events-none" />
        <div className="relative z-10 max-w-6xl mx-auto">
          <SectionHeading
            title="Featured Products"
            titlebn="বৈশিষ্ট্যযুক্ত পণ্য"
            subtitle="Our most popular fertilizers, pesticides and farm inputs"
            subtitlebn="আমাদের সবচেয়ে জনপ্রিয় সার, কীটনাশক ও কৃষি উপকরণ"
            centered
            light
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
            {featuredProducts.slice(0, 6).map((product, i) => (
              <ScrollReveal key={product.id} delay={i * 0.08}>
                <ProductCard product={product} featured={product.featured} />
              </ScrollReveal>
            ))}
          </div>
          <div className="text-center mt-10">
            <Button variant="primary" href="/products" size="lg">
              {t('common.viewAll')} →
            </Button>
          </div>
        </div>
      </section>

      {/* ─── 7. PRODUCT CATEGORIES WITH SUNLIT FIELD BACKGROUND ─── */}
      <section
        className="relative py-12 md:py-20 px-4 sm:px-6 lg:px-8 bg-cover bg-center lg:bg-fixed overflow-hidden text-white"
        style={{ backgroundImage: `url('/images/backgrounds/bg-product-categories.jpg')` }}
      >
        {/* Subtle localized edge vignette strictly for contrast */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/35 to-black/60 pointer-events-none" />
        <div className="relative z-10 max-w-6xl mx-auto">
          <SectionHeading
            title="Product Categories"
            titlebn="পণ্যের বিভাগ"
            subtitle="Browse our complete range of agricultural inputs"
            subtitlebn="আমাদের সম্পূর্ণ কৃষি উপকরণের পরিসর দেখুন"
            centered
            light
          />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12">
            {categories.map((cat, i) => (
              <ScrollReveal key={cat.id} delay={i * 0.05}>
                <Link href={`/products?category=${cat.id}`}>
                  <div className="rounded-2xl bg-forest/85 dark:bg-[#071d15]/90 border border-white/20 backdrop-blur-2xl p-6 text-center text-white hover:border-harvest/70 transition-all duration-300 hover:-translate-y-1 shadow-xl cursor-pointer group">
                    <span className="text-4xl mb-3 block group-hover:scale-115 transition-transform duration-300">
                      {cat.icon}
                    </span>
                    <h3 className="font-extrabold text-white text-sm md:text-base group-hover:text-harvest transition-colors">
                      {locale === 'en' ? cat.name : cat.namebn}
                    </h3>
                  </div>
                </Link>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 8. CROP-WISE SOLUTIONS WITH GOLDEN GRAIN BACKGROUND ─── */}
      <section
        className="relative py-12 md:py-20 px-4 sm:px-6 lg:px-8 bg-cover bg-center lg:bg-fixed overflow-hidden text-white"
        style={{ backgroundImage: `url('/images/backgrounds/bg-crop-solutions.jpg')` }}
      >
        {/* Subtle localized edge vignette strictly for contrast */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/35 to-black/60 pointer-events-none" />
        <div className="relative z-10 max-w-6xl mx-auto">
          <SectionHeading
            title="Crop-Wise Solutions"
            titlebn="ফসলভিত্তিক সমাধান"
            subtitle="Find the right products for your crop at every growth stage"
            subtitlebn="প্রতিটি বৃদ্ধির পর্যায়ে আপনার ফসলের জন্য সঠিক পণ্য খুঁজুন"
            centered
            light
          />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mt-12">
            {crops.slice(0, 10).map((crop, i) => (
              <ScrollReveal key={crop.id} delay={i * 0.05}>
                <Link href={`/crop-guide/${crop.slug}`}>
                  <div className="rounded-2xl bg-forest/85 dark:bg-[#071d15]/90 border border-white/20 backdrop-blur-2xl p-5 text-center transition-all duration-300 cursor-pointer group hover:border-harvest/70 hover:-translate-y-1.5 shadow-xl h-full flex flex-col justify-between">
                    <div>
                      <div className="text-4xl mb-3 transform transition-transform duration-300 group-hover:scale-115">
                        {crop.slug === 'paddy' ? '🌾' :
                         crop.slug === 'jute' ? '🧵' :
                         crop.slug === 'potato' ? '🥔' :
                         crop.slug === 'mustard' ? '🌼' :
                         crop.slug === 'wheat' ? '🌿' :
                         crop.slug === 'maize' ? '🌽' :
                         crop.slug === 'vegetables' ? '🥬' :
                         crop.slug === 'mango' ? '🥭' :
                         crop.slug === 'banana' ? '🍌' : '🌱'}
                      </div>
                      <h3 className="font-extrabold text-sm md:text-base text-white group-hover:text-harvest transition-colors">
                        {locale === 'en' ? crop.name : crop.namebn}
                      </h3>
                    </div>
                    <span className="mt-2 text-[11px] text-harvest font-bold block bg-white/10 rounded-full py-0.5 px-2">
                      {locale === 'en' ? crop.season : crop.seasonbn}
                    </span>
                  </div>
                </Link>
              </ScrollReveal>
            ))}
          </div>
          <div className="text-center mt-10">
            <Button variant="secondary" href="/crop-guide" size="lg">
              {t('crops.viewGuide')} →
            </Button>
          </div>
        </div>
      </section>

      {/* ─── 9. INTERACTIVE CROP FERTILIZER DOSAGE CALCULATOR ─────── */}
      <section
        className="relative py-12 md:py-20 px-4 sm:px-6 lg:px-8 bg-cover bg-center lg:bg-fixed overflow-hidden text-white"
        style={{ backgroundImage: `url('/images/backgrounds/bg-crop-calculator.jpg')` }}
      >
        {/* Subtle localized edge vignette strictly for contrast */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/35 to-black/60 pointer-events-none" />
        <div className="relative z-10 max-w-6xl mx-auto">
          <SectionHeading
            title="Interactive Crop Fertilizer Calculator"
            titlebn="ফসলের সুষম সার ক্যালকুলেটর"
            subtitle="Calculate exact Urea, DAP, MOP and micronutrient dosages tailored per bigha for your land"
            subtitlebn="আপনার জমির পরিমাণ অনুযায়ী বিঘা বা শতক প্রতি ইউরিয়া, ডিএপি, পটাশ ও জিঙ্কের সুষম হিসাব"
            centered
            light
          />
          <div className="mt-10 max-w-4xl mx-auto">
            <CropFertilizerCalculator />
          </div>
        </div>
      </section>

      {/* ─── 10. DIGITAL SOIL & WATER TESTING LAB BANNER ─────────── */}
      <section
        className="relative py-12 md:py-20 px-4 sm:px-6 lg:px-8 bg-cover bg-center lg:bg-fixed overflow-hidden text-white"
        style={{ backgroundImage: `url('/images/backgrounds/bg-soil-testing.jpg')` }}
      >
        {/* Subtle localized edge vignette strictly for contrast */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/35 to-black/60 pointer-events-none" />

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Column: Details */}
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-harvest/20 border border-harvest/40 text-harvest text-xs font-bold tracking-wide uppercase mb-4 backdrop-blur-md">
                <Sparkles className="w-3.5 h-3.5" />
                {locale === 'bn' ? 'অন-সাইট বৈজ্ঞানিক ল্যাবরেটরি' : 'On-Site Diagnostic Testing Lab'}
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-5xl font-black text-white tracking-tight leading-tight">
                {locale === 'bn' ? (
                  <>
                    অন-সাইট ডিজিটাল মাটি পরীক্ষা <br className="hidden sm:inline" />
                    <span className="text-harvest">সঠিক রিপোর্ট, নিশ্চিত বাড়তি ফলন!</span>
                  </>
                ) : (
                  <>
                    Scientific On-Site Soil Health Testing <br className="hidden sm:inline" />
                    <span className="text-harvest">Pinpoint Nutrients, Maximize Yield</span>
                  </>
                )}
              </h2>
              <p className="mt-4 text-sm sm:text-base text-cream/90 leading-relaxed drop-shadow">
                {locale === 'bn'
                  ? 'অনুমানের ওপর ভিত্তি করে অতিরিক্ত সার বা ভুল কীটনাশক প্রয়োগ করবেন না। আমাদের চাপমাটালি ডিজিটাল ল্যাবে মাটির এনপিকে, পিএইচ ও অণুখাদ্য পরীক্ষা করিয়ে ২৪ ঘণ্টার মধ্যে নিশ্চিত কম্পিউটারাইজড প্রেসক্রিপশন নিন।'
                  : 'Stop guessing fertilizer applications or wasting money on unneeded chemicals. Get precise digital soil health reports with tailored crop prescriptions within 24–48 hours at Ahammed Fertilizer.'}
              </p>

              {/* Feature pills */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
                {[
                  {
                    icon: '🌱',
                    title: locale === 'bn' ? 'মাটি পরীক্ষা (Soil Health)' : 'Soil Health Analysis',
                    desc: locale === 'bn' ? 'NPK মাত্রা, pH ব্যালেন্স, জৈব কার্বন ও জিঙ্ক' : 'NPK levels, pH balance, Organic Carbon & Zinc',
                    price: '₹250',
                  },
                  {
                    icon: '🔬',
                    title: locale === 'bn' ? 'ফসল পুষ্টি প্রেসক্রিপশন' : 'Crop Nutrition Prescription',
                    desc: locale === 'bn' ? 'বিঘাভিত্তিক সারের কিস্তি ও বালাইনাশক তালিকা' : 'Bigha-specific basal & top-dressing dosage chart',
                    price: '₹150',
                  },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3.5 rounded-2xl bg-forest/85 border border-white/20 backdrop-blur-md shadow-lg hover:border-harvest/50 transition-colors">
                    <span className="text-2xl p-2 rounded-xl bg-white/10">{item.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <h4 className="font-extrabold text-sm text-white truncate">{item.title}</h4>
                        <span className="text-xs font-bold text-harvest bg-harvest/20 px-2 py-0.5 rounded-full border border-harvest/30">{item.price}</span>
                      </div>
                      <p className="text-xs text-cream/80 mt-1 line-clamp-2">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Action buttons */}
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link
                  href="/book-test"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-harvest hover:bg-harvest/90 text-forest font-black text-sm sm:text-base shadow-xl transition-transform hover:-translate-y-0.5 active:translate-y-0"
                >
                  <FlaskConical className="w-5 h-5" />
                  {locale === 'bn' ? 'টেস্ট স্লট বুক করুন' : 'Book a Test Slot'}
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <a
                  href={`tel:${siteConfig.phone}`}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white/15 hover:bg-white/25 text-white font-bold text-sm sm:text-base border border-white/25 transition-colors backdrop-blur-md"
                >
                  📞 {locale === 'bn' ? 'সরাসরি কথা বলুন' : 'Call Staff'}
                </a>
              </div>
            </div>

            {/* Right Column: Mini Trust & Turnaround Card */}
            <div className="lg:col-span-5">
              <div className="bg-forest/85 dark:bg-[#071d15]/90 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 border border-white/20 shadow-2xl relative text-white">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/15">
                  <div className="w-12 h-12 rounded-2xl bg-harvest/20 border border-harvest/40 flex items-center justify-center text-harvest text-2xl">
                    🔬
                  </div>
                  <div>
                    <h3 className="font-extrabold text-lg text-white">
                      {locale === 'bn' ? 'দক্ষিণ দিনাজপুর ফার্মা কেয়ার' : 'Dakshin Dinajpur Farm Care'}
                    </h3>
                    <p className="text-xs text-harvest font-semibold">
                      {locale === 'bn' ? 'চাপমাটালি প্রধান শাখা • লাইসেন্সপ্রাপ্ত' : 'Chapmatali Main Branch • Certified'}
                    </p>
                  </div>
                </div>

                <div className="space-y-4 text-sm text-cream/90 font-medium">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-harvest shrink-0 mt-0.5" />
                    <span>
                      {locale === 'bn'
                        ? '২৪ থেকে ৪৮ ঘণ্টার মধ্যে নির্ভুল কম্পিউটারাইজড রিপোর্ট ও প্রেসক্রিপশন'
                        : 'Accurate computerized report with customized prescription within 24-48 hrs'}
                    </span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-harvest shrink-0 mt-0.5" />
                    <span>
                      {locale === 'bn'
                        ? 'অপ্রয়োজনীয় সার ও ওষুধের খরচ বাঁচিয়ে চাষির ৩০% পর্যন্ত মূলধন সাশ্রয়'
                        : 'Eliminates unnecessary chemical inputs, saving farmers up to 30% on costs'}
                    </span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-harvest shrink-0 mt-0.5" />
                    <span>
                      {locale === 'bn'
                        ? 'দোকানে সরাসরি স্যাম্পল জমা দিন বা ফোনে কালেকশন পরামর্শ নিন'
                        : 'Drop sample directly at the shop counter or get collection advice via phone'}
                    </span>
                  </div>
                </div>

                <div className="mt-6 pt-5 border-t border-white/15 flex items-center justify-between text-xs text-cream/75">
                  <span>⏱ {locale === 'bn' ? 'প্রতিদিন সকাল ৮:০০ - রাত ৮:০০' : 'Daily 8:00 AM - 8:00 PM'}</span>
                  <span className="text-harvest font-semibold">📍 Chapmatali, D. Dinajpur</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 11. WHY CHOOSE US WITH GREEN HILLS BACKGROUND ─── */}
      <section
        className="relative py-12 md:py-20 px-4 sm:px-6 lg:px-8 bg-cover bg-center lg:bg-fixed overflow-hidden text-white"
        style={{ backgroundImage: `url('/images/backgrounds/bg-why-choose-us.jpg')` }}
      >
        {/* Subtle edge vignette strictly for contrast */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/35 to-black/60 pointer-events-none" />
        <div className="relative z-10 max-w-6xl mx-auto">
          <SectionHeading
            title="Why Choose Us?"
            titlebn="কেন আমাদের বেছে নেবেন?"
            subtitle="We're committed to helping farmers grow more and grow better"
            subtitlebn="আমরা কৃষকদের আরও ভালো ফসল ফলাতে প্রতিশ্রুতিবদ্ধ"
            centered
            light
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
            {[
              { icon: '✅', title: 'Licensed & Genuine Products', titlebn: 'লাইসেন্সপ্রাপ্ত ও আসল পণ্য', desc: 'All products are sourced from authorized dealers with proper certifications.', descbn: 'সমস্ত পণ্য যথাযথ সার্টিফিকেশন সহ অনুমোদিত ডিলারদের থেকে নেওয়া।' },
              { icon: '🧑‍🌾', title: 'Expert Guidance', titlebn: 'বিশেষজ্ঞ পরামর্শ', desc: 'Get personalized advice on product selection, dosage and application methods.', descbn: 'পণ্য নির্বাচন, মাত্রা ও প্রয়োগ পদ্ধতিতে ব্যক্তিগত পরামর্শ পান।' },
              { icon: '📦', title: 'Wide Product Range', titlebn: 'বিস্তৃত পণ্যের পরিসর', desc: 'From fertilizers to seeds, we stock everything a farmer needs under one roof.', descbn: 'সার থেকে বীজ, একটি ছাতার নিচে কৃষকের যা কিছু দরকার সবই পাওয়া যায়।' },
              { icon: '💰', title: 'Farmer-Friendly Prices', titlebn: 'কৃষক-বান্ধব মূল্য', desc: 'Competitive pricing with seasonal discounts and combo offers.', descbn: 'মৌসুমী ছাড় ও কম্বো অফারসহ প্রতিযোগিতামূলক মূল্য।' },
              { icon: '📍', title: 'Convenient Location', titlebn: 'সুবিধাজনক অবস্থান', desc: 'Easily accessible shop at Chapmatali with ample parking space.', descbn: 'চাপমাটালিতে সহজে প্রবেশযোগ্য দোকান, পর্যাপ্ত পার্কিং সুবিধা।' },
              { icon: '🤝', title: 'After-Sale Support', titlebn: 'বিক্রয়োত্তর সহায়তা', desc: 'We help you even after purchase with guidance on usage and troubleshooting.', descbn: 'ক্রয়ের পরেও ব্যবহার ও সমস্যা সমাধানে আমরা সহায়তা করি।' },
            ].map((item, i) => (
              <ScrollReveal key={i} delay={i * 0.1}>
                <div className="rounded-3xl bg-forest/85 dark:bg-[#071d15]/90 border border-white/20 backdrop-blur-2xl p-7 text-center text-white hover:border-harvest/70 transition-all duration-300 hover:-translate-y-1 shadow-2xl h-full flex flex-col justify-between">
                  <div>
                    <span className="text-4xl mb-4 block">{item.icon}</span>
                    <h3 className="text-lg font-black text-white mb-2">
                      {locale === 'en' ? item.title : item.titlebn}
                    </h3>
                    <p className="text-sm text-cream/85 font-medium leading-relaxed">
                      {locale === 'en' ? item.desc : item.descbn}
                    </p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 12. ANIMATED COUNTERS WITH GOLDEN HARVEST BACKGROUND ─── */}
      <section
        className="relative py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-cover bg-center lg:bg-fixed overflow-hidden text-white"
        style={{ backgroundImage: `url('/images/backgrounds/bg-stats-counters.jpg')` }}
      >
        {/* Subtle edge vignette strictly for contrast */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/35 to-black/60 pointer-events-none" />
        <div className="relative z-10 max-w-4xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            <AnimatedCounter
              target={siteConfig.stats.yearsOfService}
              label="Years of Service"
              labelbn="বছরের সেবা"
              icon="🏪"
            />
            <AnimatedCounter
              target={siteConfig.stats.happyFarmers}
              label="Happy Farmers"
              labelbn="সুখী কৃষক"
              icon="🧑‍🌾"
            />
            <AnimatedCounter
              target={siteConfig.stats.productsAvailable}
              label="Products Available"
              labelbn="পণ্য পাওয়া যায়"
              icon="📦"
            />
          </div>
        </div>
      </section>

      {/* ─── 13. FARMER TESTIMONIALS WITH VERDANT FIELD BACKGROUND ─── */}
      <section
        className="relative py-12 md:py-20 px-4 sm:px-6 lg:px-8 bg-cover bg-center lg:bg-fixed overflow-hidden text-white"
        style={{ backgroundImage: `url('/images/backgrounds/bg-testimonials.jpg')` }}
      >
        {/* Subtle edge vignette strictly for contrast */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/35 to-black/60 pointer-events-none" />
        <div className="relative z-10 max-w-6xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="inline-block py-1.5 px-4 rounded-full bg-harvest/20 border border-harvest/40 text-harvest text-xs font-bold uppercase tracking-wider mb-3 backdrop-blur-md">
              {locale === 'bn' ? 'কৃষকদের মতামত' : 'Farmer Testimonials'}
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-black text-white tracking-tight">
              {locale === 'bn' ? 'কৃষকরা কী বলেন' : 'What Farmers Say'}
            </h2>
            <p className="mt-3 text-sm sm:text-base text-cream/90">
              {locale === 'bn'
                ? 'যে কৃষকরা তাদের ফসলের জন্য আমাদের বিশ্বাস করেন তাদের কথা শুনুন'
                : 'Hear from the farmers who trust us for their crop and pond nutrition.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((testimonial, i) => (
              <ScrollReveal key={testimonial.id} delay={i * 0.1}>
                <div className="rounded-3xl bg-forest/85 dark:bg-[#071d15]/90 border border-white/20 backdrop-blur-2xl p-6 sm:p-7 shadow-2xl h-full flex flex-col justify-between text-white hover:border-harvest/70 transition-all duration-300 hover:-translate-y-1">
                  <div>
                    <div className="flex gap-1 mb-3.5">
                      {Array.from({ length: testimonial.rating }).map((_, j) => (
                        <span key={j} className="text-harvest text-base">★</span>
                      ))}
                    </div>
                    <p className="text-cream/90 text-sm sm:text-[15px] italic leading-relaxed mb-6 font-normal">
                      &ldquo;{locale === 'en' ? testimonial.message : testimonial.messagebn}&rdquo;
                    </p>
                  </div>
                  <div className="border-t border-white/15 pt-4 flex items-center justify-between">
                    <div>
                      <p className="font-black text-white text-sm sm:text-base">
                        {locale === 'en' ? testimonial.name : testimonial.namebn}
                      </p>
                      <p className="text-xs text-harvest font-semibold mt-0.5">
                        {locale === 'en' ? testimonial.village : testimonial.villagebn} •{' '}
                        {locale === 'en' ? testimonial.crop : testimonial.cropbn}
                      </p>
                    </div>
                    <span className="text-2xl opacity-75">🧑‍🌾</span>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 14. FAQ SECTION WITH RURAL EXPANSE BACKGROUND ─── */}
      <section
        className="relative py-12 md:py-20 px-4 sm:px-6 lg:px-8 bg-cover bg-center lg:bg-fixed overflow-hidden text-white"
        style={{ backgroundImage: `url('/images/backgrounds/bg-faqs.jpg')` }}
      >
        {/* Subtle edge vignette strictly for contrast */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/35 to-black/60 pointer-events-none" />
        <div className="relative z-10 max-w-3xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="inline-block py-1.5 px-4 rounded-full bg-harvest/20 border border-harvest/40 text-harvest text-xs font-bold uppercase tracking-wider mb-3 backdrop-blur-md">
              FAQ
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-black text-white tracking-tight">
              {locale === 'bn' ? 'প্রায়শই জিজ্ঞাসিত প্রশ্নাবলী' : 'Frequently Asked Questions'}
            </h2>
            <p className="mt-3 text-sm sm:text-base text-cream/90">
              {locale === 'bn'
                ? 'সার, কীটনাশক ও ল্যাব টেস্ট সম্পর্কিত সাধারণ প্রশ্নের উত্তর'
                : 'Clear answers on government rates, pesticide license, delivery and usage.'}
            </p>
          </div>

          <div className="space-y-4">
            {[
              { q: 'What products do you sell?', qbn: 'আপনারা কী কী পণ্য বিক্রি করেন?', a: 'We sell government-licensed fertilizers (Urea, DAP, MOP, 10:26:26), approved insecticides, fungicides, micronutrients, certified seeds, and complete aquaculture feeds & pond medicines.', abn: 'আমরা সরকারি সিলগালা সার (ইউরিয়া, ডিএপি, পটাশ), কীটনাশক, ছত্রাকনাশক, অণুখাদ্য, বীজ এবং মাছের ভাসমান ফিড ও পুকুরের ওষুধ বিক্রি করি।' },
              { q: 'Do you offer loose weighing or 50kg sacks?', qbn: '৫০ কেজি বস্তা ছাড়াও কি খুচরা ওজন নেওয়া যায়?', a: 'Yes! We supply full factory-sealed 50kg bags as well as exact digital loose kg weighing to meet every farmer’s budget and plot size.', abn: 'হ্যাঁ! ৫০ কেজির আসল সিলগালা বস্তার পাশাপাশি কৃষকের জমির প্রয়োজন অনুযায়ী সঠিক ডিজিটাল ওজনে খুচরা সার দেওয়া হয়।' },
              { q: 'Can I test my soil and pond water at your shop?', qbn: 'দোকানে কি মাটি ও পুকুরের জল পরীক্ষা করা যায়?', a: 'Yes! We run an on-site diagnostic testing lab. You can bring your soil or pond water sample, or book an appointment online, and receive a complete scientific report within 24-48 hours.', abn: 'হ্যাঁ! আমাদের দোকানে মাটি ও পুকুরের জল পরীক্ষা করা হয়। মাত্র ২৪-৪৮ ঘণ্টার মধ্যে পুষ্টির মাত্রা ও সঠিক সারের প্রেসক্রিপশন রিপোর্ট দেওয়া হয়।' },
              { q: 'What are your shop opening hours?', qbn: 'আপনাদের দোকান খোলার সময় কী?', a: siteConfig.hours, abn: siteConfig.hoursbn },
              { q: 'Do you provide guidance on pesticide dosage?', qbn: 'কীটনাশক প্রয়োগের সঠিক মাত্রা কি আপনারা বুঝিয়ে দেন?', a: 'Absolutely! Our licensed agronomists provide completely free guidance on pest identification, mixing proportions per tank, and spray timing.', abn: 'অবশ্যই! আমাদের অভিজ্ঞ কর্মীরা রোগ চিনে সঠিক ওষুধ এবং প্রতি ব্যারেলে স্প্রে করার সঠিক মাপ বুঝিয়ে দেন।' },
            ].map((faq, i) => (
              <FAQItem key={i} question={locale === 'en' ? faq.q : faq.qbn} answer={locale === 'en' ? faq.a : faq.abn} />
            ))}
          </div>
        </div>
      </section>

      {/* ─── 15. FULL INTERACTIVE 3-COLUMN CONTACT SECTION WITH DISTINCT BACKGROUND ─── */}
      <ContactSection />

      {/* ─── SEASONAL OFFER POPUP ─────────────────────────── */}
      <AnimatePresence>
        {showOfferPopup && offers.length > 0 && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={dismissPopup}
          >
            <motion.div
              className="bg-white dark:bg-dark-surface rounded-2xl p-6 md:p-8 max-w-md w-full shadow-2xl relative"
              initial={{ scale: 0.8, y: 40 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 40 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={dismissPopup}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                aria-label="Close"
              >
                ✕
              </button>
              <div className="text-center">
                <span className="text-4xl mb-4 block">🎉</span>
                <h3 className="text-xl font-bold text-forest dark:text-white mb-2">
                  {locale === 'en' ? offers[0].title : offers[0].titlebn}
                </h3>
                <div className="inline-block bg-harvest text-forest text-lg font-bold px-4 py-2 rounded-full mb-4">
                  {locale === 'en' ? offers[0].discount : offers[0].discountbn}
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-6">
                  {locale === 'en' ? offers[0].description : offers[0].descriptionbn}
                </p>
                <Button variant="primary" href="/offers" onClick={dismissPopup}>
                  {t('common.viewAll')} →
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/* ── FAQ Accordion Item (Glassmorphic) ────────────────────── */
function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="rounded-2xl border border-white/20 bg-forest/85 dark:bg-[#071d15]/90 backdrop-blur-2xl overflow-hidden shadow-lg">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-6 py-4 text-left font-bold text-white hover:bg-white/10 transition-colors cursor-pointer"
      >
        <span className="text-sm sm:text-base">{question}</span>
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-harvest text-xl shrink-0 ml-2"
        >
          ▾
        </motion.span>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="px-6 pb-4 pt-1 text-cream/90 text-sm leading-relaxed border-t border-white/10 font-normal">
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
