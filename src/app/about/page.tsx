'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/i18n/provider';
import { siteConfig } from '@/config/site';
import { Card } from '@/components/ui/Card';
import SectionHeading from '@/components/ui/SectionHeading';
import Button from '@/components/ui/Button';
import ScrollReveal from '@/components/motion/ScrollReveal';

export default function AboutPage() {
  const { locale, t } = useLanguage();
  const isBn = locale === 'bn';

  const values = [
    {
      icon: '🛡️',
      title: 'Purity & Quality',
      titlebn: 'বিশুদ্ধতা ও উচ্চ গুণমান',
      desc: 'We strictly stock 100% genuine, authorized fertilizers and chemicals from recognized agricultural manufacturers.',
      descbn: 'আমরা কেবলমাত্র অনুমোদিত প্রস্তুতকারকদের খাঁটি এবং গুণমান যাচাই করা সার ও কীটনাশক সরবরাহ করি।',
    },
    {
      icon: '🤝',
      title: 'Trust & Transparency',
      titlebn: 'বিশ্বাস ও সততা',
      desc: 'Honest pricing conforming strictly to government guidelines and fair business ethics with zero compromises.',
      descbn: 'ন্যায্য ও সরকার নির্ধারিত মূল্যে বিক্রয় এবং চাষীদের সাথে শতভাগ স্বচ্ছ ও বিশ্বস্ত ব্যবসায়িক সম্পর্ক।',
    },
    {
      icon: '🌱',
      title: 'Farmer-First Service',
      titlebn: 'চাষীদের পাশে সার্বক্ষণিক সেবা',
      desc: 'Prompt availability of inputs during peak sowing and pest outbreaks, ensuring no harvest season is lost.',
      descbn: 'বপন মরসুমে বা রোগের প্রাদুর্ভাবে সঠিক সময়ে দ্রুত কৃষি উপকরণ পৌঁছে দিয়ে ফলন নিশ্চিত করা।',
    },
    {
      icon: '📚',
      title: 'Scientific Guidance',
      titlebn: 'সঠিক বিজ্ঞানসম্মত পরামর্শ',
      desc: 'Expert advice on correct dosage, pest identification, and soil balance rather than pushing excess chemicals.',
      descbn: 'অতিরিক্ত ওষুধ নয়, বরং রোগের লক্ষণ চিনে সঠিক মাত্রা ও ব্যবহারের বিজ্ঞানসম্মত সঠিক দিকনির্দেশনা।',
    },
  ];

  const milestones = [
    {
      year: '2015',
      title: 'Inception in Chapmatali',
      titlebn: 'চাপমাটালিতে প্রতিষ্ঠা',
      desc: 'Started as a modest retail counter in Dakshin Dinajpur dedicated to providing verified seeds and basic fertilizers to nearby villages.',
      descbn: 'দক্ষিণ দিনাজপুরের স্থানীয় গ্রামে নির্ভরযোগ্য বীজ ও সার সহজলভ্য করার লক্ষ্যে একটি সাধারণ বিক্রয়কেন্দ্র হিসেবে যাত্রা শুরু।',
    },
    {
      year: '2019',
      title: 'Expanded Agro-Input Range',
      titlebn: 'বিস্তৃত কৃষি সুরক্ষা পণ্য',
      desc: 'Introduced water-soluble fertilizers, modern micronutrients, and crop protection chemicals to combat emerging fungal and borer diseases.',
      descbn: 'আধুনিক অণুখাদ্য, জলে দ্রবণীয় সার এবং ফসলের মাজরা ও ছত্রাক দমনে উন্নত বালাইনাশক সামগ্রী সংযোজন।',
    },
    {
      year: 'Today',
      title: 'Trusted by 5,000+ Farmers',
      titlebn: '৫,০০০+ কৃষকের নির্ভরযোগ্য ঠিকানা',
      desc: 'Serving thousands of dedicated growers across paddy, potato, mustard, jute, and horticulture crops with unwavering integrity.',
      descbn: 'ধান, আলু, সর্ষে, পাট ও সবজি চাষে হাজার হাজার চাষীর আস্থার প্রতীক হয়ে নিরলস সেবা প্রদান।',
    },
  ];

  return (
    <div className="min-h-screen pt-20 pb-16">
      {/* Hero Section with Clean, Light Real-Life Background */}
      <section
        className="relative overflow-hidden bg-cover bg-center lg:bg-fixed py-20 md:py-28 border-b border-forest/10 dark:border-leaf/10"
        style={{ backgroundImage: `url('/images/hero/panoramic-bengal-farms.jpg')` }}
      >
        <div className="absolute inset-0 bg-white/92 dark:bg-[#061811]/92 backdrop-blur-xs pointer-events-none" />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <ScrollReveal direction="down">
            <span className="inline-block py-1 px-3.5 rounded-full bg-forest/10 dark:bg-leaf/20 text-forest dark:text-leaf text-xs md:text-sm font-bold tracking-wide uppercase mb-4">
              {isBn ? 'আমাদের ইতিহাস ও বিশ্বাস' : 'Our Story & Heritage'}
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-forest dark:text-cream tracking-tight mb-6">
              {isBn ? 'আহাম্মেদ ফার্টিলাইজার সম্পর্কে' : 'About Ahammed Fertilizer'}
            </h1>
            <p className="max-w-3xl mx-auto text-base sm:text-lg md:text-xl text-gray-700 dark:text-gray-300 leading-relaxed font-medium">
              {isBn
                ? '২০১৫ সাল থেকে দক্ষিণ দিনাজপুরের কৃষকদের সঙ্গে কাঁধে কাঁধ মিলিয়ে—বিশ্বস্ত কৃষি উপকরণ, খাঁটি সার ও সঠিক রোগবালাই ব্যবস্থাপনার নির্ভরযোগ্য প্রতীক।'
                : 'Serving the hardworking farming communities of Dakshin Dinajpur since 2015 with genuine fertilizers, scientific crop nutrition, and trusted advisory.'}
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-16 md:py-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <SectionHeading
            title="Our Journey & Purpose"
            titlebn="আমাদের পথচলা ও উদ্দেশ্য"
            subtitle="Deeply rooted in the agricultural soil of Bengal, growing alongside our farmers."
            subtitlebn="বাংলার উর্বর মাটির সাথে নিবিড় সম্পর্ক এবং কৃষকদের স্বপ্নপূরণের বিশ্বস্ত সঙ্গী।"
          />
        </ScrollReveal>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center mt-8">
          <div className="lg:col-span-7 space-y-5 text-gray-700 dark:text-gray-300 leading-relaxed">
            <ScrollReveal delay={0.1}>
              <p className="text-base sm:text-lg">
                {isBn
                  ? '২০১৫ সালে দক্ষিণ দিনাজপুরের চাপমাটালিতে একটি মহৎ উদ্দেশ্য নিয়ে আহাম্মেদ ফার্টিলাইজারের সূচনা হয়—স্থানীয় চাষীদের যেন নিম্নমানের বা ভেজাল সারের কারণে কোনো ক্ষতি না হয়। সাধারণ একটি খুচরা দোকান হিসেবে শুরু হলেও আমাদের মূল চালিকাশক্তি ছিল প্রতিটি কৃষকের প্রতি নিরঙ্কুশ সততা।'
                  : 'Established in 2015 in Chapmatali, Dakshin Dinajpur, Ahammed Fertilizer was founded with a singular, resolute mission: to ensure that local growers never suffer from adulterated or spurious farm inputs. From humble beginnings as a small agri-retail store, our business was founded upon honesty and unwavering accountability to our growers.'}
              </p>
            </ScrollReveal>
            <ScrollReveal delay={0.2}>
              <p className="text-base sm:text-lg">
                {isBn
                  ? 'বিগত বছরগুলোতে আমরা শুধু রাসায়নিক সার ও কীটনাশক বিক্রিতেই সীমাবদ্ধ থাকিনি; কৃষকের মাটির উর্বরতা রক্ষা, সময়োপযোগী অনুখাদ্যের প্রয়োগ এবং আধুনিক বালাইনাশকের সচেতন ব্যবহারে নিয়মিত পথ দেখিয়েছি। ধানের আমন ও বোরো মরসুম থেকে শুরু করে আলু ও সর্ষের শীতকালীন প্রতিটি পর্যায়ে আমরা কৃষকদের পাশে থেকেছি।'
                  : 'Over the last decade, our role has evolved far beyond being just a point of sale for fertilizers. We have championed soil nutrient balancing, micro-nutrient application, and prudent pest management across Kharif paddy, winter potatoes, mustard, maize, and vibrant vegetable belts throughout the district.'}
              </p>
            </ScrollReveal>
            <ScrollReveal delay={0.3}>
              <p className="text-base sm:text-lg">
                {isBn
                  ? 'আজ আহাম্মেদ ফার্টিলাইজার ৫,০০০-এরও বেশি সন্তুষ্ট কৃষকের পারিবারিক আস্থার নাম। সঠিক পুষ্টি ও সৎ মূল্যের মাধ্যমে সোনার বাংলা গড়ে তোলাই আমাদের নিরন্তর সংকল্প।'
                  : 'Today, Ahammed Fertilizer stands as a pillar of dependability for over 5,000 farming households. Our pledge remains unchanged: delivering guaranteed purity, government-compliant pricing, and farmer-first dedication to every family who visits our counter.'}
              </p>
            </ScrollReveal>
          </div>

          <div className="lg:col-span-5 space-y-6">
            <ScrollReveal direction="left" delay={0.15}>
              <div className="relative rounded-2xl overflow-hidden shadow-xl border-2 border-forest/20 dark:border-leaf/30 aspect-[16/10] bg-forest/10 group">
                <img
                  src="/images/shop/storefront-exterior.png"
                  alt={isBn ? 'আহাম্মেদ ফার্টিলাইজারের প্রধান দোকান' : 'Ahammed Fertilizer Main Storefront'}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent pointer-events-none" />
                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-forest/80 backdrop-blur-xs text-xs font-semibold text-cream mb-1 border border-white/20">
                    📍 Chapmatali, Dakshin Dinajpur
                  </span>
                  <p className="text-xs font-bold text-white drop-shadow">
                    {isBn ? '২০১৫ সাল থেকে স্থানীয় কৃষকদের বিশ্বস্ত সঙ্গী' : 'Proudly serving Bengal farmers since 2015'}
                  </p>
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal direction="left" delay={0.25}>
              <div className="relative rounded-2xl bg-gradient-to-br from-forest to-leaf p-1 text-white shadow-xl">
                <div className="rounded-xl bg-forest/90 dark:bg-dark-surface/95 p-6 md:p-8 space-y-6">
                  <h3 className="text-xl font-bold text-harvest flex items-center gap-2">
                    <span>🌾</span> {isBn ? 'আমাদের কিছু পরিসংখ্যান' : 'Key Milestones'}
                  </h3>
                  <div className="space-y-4">
                    {milestones.map((item, idx) => (
                      <div key={idx} className="border-l-2 border-leaf/60 pl-4 py-1">
                        <span className="text-xs font-bold uppercase tracking-wider text-leaf">
                          {item.year}
                        </span>
                        <h4 className="text-sm font-bold text-white mt-0.5">
                          {isBn ? item.titlebn : item.title}
                        </h4>
                        <p className="text-xs text-gray-300 mt-1">
                          {isBn ? item.descbn : item.desc}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Owner's Message Section */}
      <section className="py-16 bg-white/60 dark:bg-dark-surface/60 border-y border-forest/10 dark:border-leaf/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <Card hover={false} className="border-leaf/30 shadow-lg p-8 sm:p-10 relative overflow-hidden">
              <div className="absolute top-0 right-0 -mt-4 -mr-4 text-8xl text-forest/5 dark:text-leaf/10 select-none pointer-events-none font-serif">
                &ldquo;
              </div>

              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-tr from-forest to-leaf flex items-center justify-center text-4xl shadow-md shrink-0 border-4 border-white dark:border-dark-bg">
                  👨‍🌾
                </div>
                <div className="flex-1 text-center sm:text-left space-y-3">
                  <span className="text-xs font-bold text-leaf uppercase tracking-widest">
                    {isBn ? 'দোকান মালিকের বার্তা' : "Founder & Owner's Message"}
                  </span>
                  <h3 className="text-2xl font-bold text-forest dark:text-cream">
                    {isBn ? 'কৃষক ভাইদের প্রতি আন্তরিক অঙ্গীকার' : 'A Personal Commitment to Every Farmer'}
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 italic leading-relaxed text-base sm:text-lg">
                    {isBn
                      ? '“কৃষি কোনো সাধারণ পেশা নয়—এটি জাতির মেরুদণ্ড। একটি ফসলের পেছনে কৃষকের গোটা পরিবারের স্বপ্ন ও ঘাম জড়িয়ে থাকে। তাই আমাদের কাউন্টারে কোনো ভুল পরামর্শ বা নিম্নমানের পণ্যের স্থান নেই। আমরা শুধু সার বিক্রি করি না, প্রতিটি দানা যাতে আপনার মাটিতে সোনার ফলন এনে দেয়, সেই নিষ্ঠা ও বিশ্বস্ততা নিশ্চিত করি।”'
                      : '"Farming is not merely a business; it is the lifeblood of our nation. Behind every acre of green crop lies the sweat, hope, and livelihood of an entire family. At Ahammed Fertilizer, we never push unnecessary chemicals or overpriced bottles. If a field needs only a pinch of zinc, we will never advise five sprays of pesticide. Your trust is our greatest asset."'}
                  </p>
                  <div className="pt-2">
                    <p className="font-bold text-forest dark:text-leaf">
                      {isBn ? 'প্রোপাইটার, আহাম্মেদ ফার্টিলাইজার' : 'Proprietor, Ahammed Fertilizer'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {siteConfig.address.line2}, West Bengal
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </ScrollReveal>
        </div>
      </section>

      {/* Our Values Section */}
      <section className="py-16 md:py-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <SectionHeading
            title="Core Values We Live By"
            titlebn="আমাদের মূল আদর্শ ও মূল্যবোধ"
            subtitle="The 4 pillars that guide our operations every single day."
            subtitlebn="যে চারটি মূল ভিত্তির ওপর আমাদের প্রতিদিনের কাজ ও গ্রাহকসেবা পরিচালিত হয়।"
          />
        </ScrollReveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
          {values.map((v, i) => (
            <ScrollReveal key={i} delay={i * 0.1}>
              <Card className="h-full flex flex-col items-center text-center p-6 border-white/20 dark:border-white/10">
                <span className="text-4xl mb-4">{v.icon}</span>
                <h4 className="text-lg font-bold text-forest dark:text-cream mb-2">
                  {isBn ? v.titlebn : v.title}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  {isBn ? v.descbn : v.desc}
                </p>
              </Card>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* Licences & Certifications Section */}
      <section className="py-12 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <Card hover={false} className="bg-forest/5 dark:bg-forest/20 border-leaf/40 p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <span className="text-4xl">📜</span>
                <div>
                  <h4 className="text-lg sm:text-xl font-bold text-forest dark:text-leaf">
                    {isBn ? 'বৈধ সরকারি লাইসেন্স ও নিবন্ধন' : 'Authorized Licences & Registration'}
                  </h4>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                    {isBn
                      ? 'পশ্চিমবঙ্গ সরকার কৃষি বিভাগ কর্তৃক নিবন্ধিত ও অনুমোদিত খুচরা দোকান'
                      : 'Fully certified and compliant with Department of Agriculture, Government of West Bengal'}
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-2 shrink-0 text-right sm:text-left">
                {siteConfig.licences.map((lic, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white dark:bg-dark-bg font-mono text-xs font-semibold text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700 shadow-2xs"
                  >
                    <span className="w-2 h-2 rounded-full bg-leaf"></span>
                    {lic}
                  </span>
                ))}
              </div>
            </div>
          </Card>
        </ScrollReveal>
      </section>

      {/* Shop Photos Placeholder Section */}
      <section className="py-16 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <SectionHeading
            title="Our Premises & Facility"
            titlebn="আমাদের দোকান ও গুদামঘর"
            subtitle="Visit us at Chapmatali for authentic fertilizers, seeds, and guidance."
            subtitlebn="চাপমাটালিতে আমাদের দোকানে এসে নিজের চোখে দেখে নিন মানসম্মত পণ্যের সমাহার।"
          />
        </ScrollReveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
          {[
            {
              label: 'Shop Front & Entrance',
              labelbn: 'দোকানের সম্মুখভাগ ও প্রবেশপথ',
              image: '/images/shop/storefront-exterior.png',
              tag: 'Chapmatali, WB',
              tagbn: 'চাপমাটালি, পঃবঃ',
            },
            {
              label: 'Counter & Consultation Desk',
              labelbn: 'বিক্রয় কাউন্টার ও কৃষক পরামর্শ',
              image: '/images/shop/shop-counter-entrance.png',
              tag: 'Active Counter',
              tagbn: 'সক্রিয় কাউন্টার',
            },
            {
              label: 'Fertilizer Godown & Storage',
              labelbn: 'সার ও পুষ্টি উপাদান গুদাম',
              image: '/images/shop/warehouse-stock.png',
              tag: 'Bulk Storage',
              tagbn: 'গুদামঘর',
            },
            {
              label: 'Crop Protection & Tonics',
              labelbn: 'বালাইনাশক ও অনুখাদ্য বিভাগ',
              image: '/images/shop/pesticides-and-products.png',
              tag: 'Genuine Inputs',
              tagbn: 'খাঁটি ওষুধ',
            },
          ].map((item, idx) => (
            <ScrollReveal key={idx} delay={idx * 0.1}>
              <Card className="p-0 overflow-hidden group shadow-md border-forest/15 dark:border-white/10 flex flex-col h-full">
                <div className="relative h-56 overflow-hidden bg-forest/10">
                  <img
                    src={item.image}
                    alt={isBn ? item.labelbn : item.label}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent pointer-events-none" />
                  <span className="absolute top-3 right-3 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-xs text-white border border-white/20">
                    {isBn ? item.tagbn : item.tag}
                  </span>
                </div>
                <div className="p-4 bg-white dark:bg-dark-surface flex-1 flex items-center justify-between">
                  <p className="font-bold text-sm text-forest dark:text-cream">
                    {isBn ? item.labelbn : item.label}
                  </p>
                  <Link
                    href="/gallery"
                    className="text-xs text-leaf hover:underline shrink-0 ml-2"
                  >
                    {isBn ? 'গ্যালারি →' : 'Gallery →'}
                  </Link>
                </div>
              </Card>
            </ScrollReveal>
          ))}
        </div>

        {/* CTA to Contact */}
        <div className="mt-14 text-center">
          <ScrollReveal>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {isBn
                ? 'আপনার মাঠের ফসলের যে কোনো সমস্যায় আজই আমাদের সঙ্গে যোগাযোগ করুন।'
                : 'Need guidance on pest control or balanced fertilizer dosage for your field?'}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Button href="/contact" variant="primary" size="lg">
                {isBn ? 'যোগাযোগ করুন' : 'Contact Us Today'}
              </Button>
              <Button href="/crop-guide" variant="outline" size="lg">
                {isBn ? 'ফসল সহায়িকা দেখুন' : 'View Crop Guide'}
              </Button>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}
