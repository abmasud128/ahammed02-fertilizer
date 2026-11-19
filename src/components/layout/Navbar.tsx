'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Phone, Menu } from 'lucide-react';
import { siteConfig } from '@/config/site';
import { useLanguage } from '@/i18n/provider';
import { formatPhoneUrl } from '@/lib/utils';
import { LanguageToggle } from '@/components/shared/LanguageToggle';
import { MobileMenu } from '@/components/layout/MobileMenu';

export function Navbar() {
  const pathname = usePathname();
  if (pathname.startsWith('/admin') || pathname.startsWith('/farmer')) return null;

  const { locale, t } = useLanguage();
  const isBn = locale === 'bn';
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<'products' | 'services' | 'about' | null>(null);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown on click outside or escape key
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setActiveDropdown(null);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActiveDropdown(null);
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Close dropdown on route change
  useEffect(() => {
    setActiveDropdown(null);
  }, [pathname]);

  const phoneUrl = formatPhoneUrl(siteConfig.phone);
  const isTransparent = pathname === '/' && !isScrolled;

  const productDropdownItems = [
    { href: '/products', label: isBn ? 'সকল পণ্য' : 'All Products', icon: '🌐' },
    { href: '/products?category=fertilizers', label: isBn ? 'সার সম্ভার' : 'Fertilizers', icon: '🌱' },
    { href: '/products?category=micronutrients', label: isBn ? 'অণুখাদ্য ও ভিটামিন' : 'Micronutrients', icon: '🧪' },
    { href: '/products?category=pesticides', label: isBn ? 'কীটনাশক ও ওষুধ' : 'Pesticides & Crop Protection', icon: '🛡️' },
    { href: '/products?category=seeds', label: isBn ? 'বীজ ও কৃষি সরঞ্জাম' : 'Seeds & Farm Tools', icon: '🌾' },
    { href: '/products?category=aquaculture', label: isBn ? 'মাছের খাদ্য ও পুকুরের ওষুধ' : 'Aquaculture & Fish Feed', icon: '🐟' },
  ];

  const serviceDropdownItems = [
    { href: '/crop-guide', label: isBn ? 'ফসলভিত্তিক সমাধান গাইড' : 'Crop Solutions & Guide', icon: '🌾' },
    { href: '/book-test?type=soil', label: isBn ? 'মাটি স্বাস্থ্য পরীক্ষা (₹250)' : 'Soil Health Analysis (₹250)', icon: '🌱' },
    { href: '/book-test?type=pond', label: isBn ? 'পুকুরের জল পরীক্ষা (₹300)' : 'Pond Water Diagnostics (₹300)', icon: '🐟' },
    { href: '/book-test?type=water', label: isBn ? 'সেচ ও গুণমান টেস্ট' : 'Water Quality Test', icon: '💧' },
    { href: '/book-test', label: isBn ? 'ল্যাব টেস্ট স্লট বুকিং' : 'Book a Lab Test', icon: '🧪' },
  ];

  const aboutDropdownItems = [
    { href: '/about', label: isBn ? 'আমাদের সম্পর্কে' : 'About Us', icon: '🏪' },
    { href: '/offers', label: isBn ? 'বর্তমান অফার ও স্কিম' : 'Offers & Schemes', icon: '🎁' },
    { href: '/gallery', label: isBn ? 'দোকান ও স্টকের ছবি' : 'Shop & Stock Gallery', icon: '📸' },
  ];

  const isProductsActive = pathname.startsWith('/products');
  const isServicesActive = pathname.startsWith('/crop-guide') || pathname.startsWith('/book-test');
  const isAquacultureActive = pathname.startsWith('/aquaculture');
  const isAboutActive = pathname.startsWith('/about') || pathname.startsWith('/offers') || pathname.startsWith('/gallery');
  const isContactActive = pathname === '/contact';

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-white/95 dark:bg-[#071d15]/95 backdrop-blur-xl shadow-md border-b border-forest/10 dark:border-white/10'
            : isTransparent
            ? 'bg-forest/50 dark:bg-forest/60 backdrop-blur-xl border-b border-white/15 shadow-xl shadow-forest/20'
            : 'bg-white/90 dark:bg-[#071d15]/90 backdrop-blur-xl border-b border-forest/10 dark:border-white/10 shadow-sm'
        }`}
      >
        <div className="w-full max-w-[1720px] mx-auto px-3 sm:px-5 lg:px-6 2xl:px-8">
          <div
            className={`flex items-center justify-between gap-2 lg:gap-4 transition-all duration-300 ${
              isScrolled ? 'h-16 md:h-18' : 'h-20 sm:h-22 lg:h-24'
            }`}
          >
            {/* ── Left: Brand / Logo Block (Shifted Left with Proper Spacing) ── */}
            <Link
              href="/"
              className="flex items-center gap-2.5 sm:gap-3 group shrink-0 mr-2 xl:mr-4 2xl:mr-6"
              aria-label="Ahammed Fertilizer Homepage"
            >
              {/* Prominent Dual Sprout Emblem (Static, Professional, Fixed) */}
              <div className="relative flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-leaf via-emerald-700 to-forest shadow-md border-2 border-white/30 shrink-0">
                <svg
                  className="w-6 h-6 text-harvest"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M12 2C8 2 4 6 4 11c0 3.5 2 6.5 5 8v3h2v-3c5-.5 9-4.5 9-9.5 0-4-3-7.5-8-7.5zm-1 15c-3-1-4-4-4-7 0-3 2.5-5 5-5-1 4-1 9-1 12zm2-2c0-3.5 1-7.5 3-10 2.5 1 3.5 3 3.5 5.5 0 3.5-3 5.5-6.5 4.5z" />
                </svg>
              </div>

              {/* Company Name & Tagline */}
              <div className="flex flex-col text-left">
                <span
                  className={`font-black text-base sm:text-lg lg:text-xl tracking-tight leading-none transition-colors whitespace-nowrap ${
                    isTransparent
                      ? 'text-white group-hover:text-harvest'
                      : 'text-forest dark:text-cream group-hover:text-leaf'
                  }`}
                >
                  <span className="inline sm:hidden font-black">AF</span>
                  <span className="hidden sm:inline">
                    {isBn ? siteConfig.namebn : siteConfig.name}
                  </span>
                </span>
                <span
                  className={`hidden sm:inline text-[10px] sm:text-[11px] font-bold uppercase tracking-wider leading-tight mt-1 transition-colors whitespace-nowrap ${
                    isTransparent
                      ? 'text-harvest/95'
                      : 'text-leaf dark:text-harvest/90'
                  }`}
                >
                  {isBn ? 'দক্ষিণ দিনাজপুর • সরকার অনুমোদিত' : 'Dakshin Dinajpur • Govt. Authorized'}
                </span>
              </div>
            </Link>

            {/* ── Center: Top-level Navigation with Dropdowns ── */}
            <nav
              ref={navRef}
              className="hidden xl:flex items-center space-x-1 2xl:space-x-2"
              aria-label="Primary Navigation"
            >
              {/* 1. Home */}
              <Link
                href="/"
                className={`h-10 flex items-center px-2.5 2xl:px-3.5 rounded-xl text-xs xl:text-sm 2xl:text-base font-bold transition-colors whitespace-nowrap ${
                  pathname === '/'
                    ? isTransparent
                      ? 'text-harvest font-black bg-white/15'
                      : 'text-leaf font-black bg-leaf/10 dark:bg-leaf/20'
                    : isTransparent
                    ? 'text-white/90 hover:text-white hover:bg-white/10'
                    : 'text-forest/85 dark:text-cream/85 hover:text-leaf dark:hover:text-leaf hover:bg-forest/5 dark:hover:bg-white/5'
                }`}
              >
                {t('nav.home', 'Home')}
              </Link>

              {/* 2. Products Dropdown */}
              <div
                className="relative"
                onMouseEnter={() => setActiveDropdown('products')}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <button
                  type="button"
                  onClick={() => setActiveDropdown(activeDropdown === 'products' ? null : 'products')}
                  aria-expanded={activeDropdown === 'products'}
                  className={`h-10 flex items-center gap-1 px-2.5 2xl:px-3.5 rounded-xl text-xs xl:text-sm 2xl:text-base font-bold transition-colors whitespace-nowrap ${
                    isProductsActive
                      ? isTransparent
                        ? 'text-harvest font-black bg-white/15'
                        : 'text-leaf font-black bg-leaf/10 dark:bg-leaf/20'
                      : isTransparent
                      ? 'text-white/90 hover:text-white hover:bg-white/10'
                      : 'text-forest/85 dark:text-cream/85 hover:text-leaf dark:hover:text-leaf hover:bg-forest/5 dark:hover:bg-white/5'
                  }`}
                >
                  <span className="whitespace-nowrap">{t('nav.products', 'Products')}</span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 shrink-0 transition-transform duration-200 ${
                      activeDropdown === 'products' ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                <AnimatePresence>
                  {activeDropdown === 'products' && (
                    <motion.div
                      initial={{ opacity: 0, y: 6, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 4, scale: 0.98 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-full left-0 mt-2 w-64 p-2 rounded-2xl bg-white dark:bg-[#071d15] border border-forest/15 dark:border-white/15 shadow-2xl z-50 overflow-hidden"
                    >
                      <div className="space-y-1">
                        {productDropdownItems.map((item) => (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setActiveDropdown(null)}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-charcoal dark:text-cream hover:bg-forest/5 dark:hover:bg-white/10 hover:text-leaf transition-colors whitespace-nowrap"
                          >
                            <span className="text-base shrink-0">{item.icon}</span>
                            <span className="truncate whitespace-nowrap">{item.label}</span>
                          </Link>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* 3. Services Dropdown */}
              <div
                className="relative"
                onMouseEnter={() => setActiveDropdown('services')}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <button
                  type="button"
                  onClick={() => setActiveDropdown(activeDropdown === 'services' ? null : 'services')}
                  aria-expanded={activeDropdown === 'services'}
                  className={`h-10 flex items-center gap-1 px-2.5 2xl:px-3.5 rounded-xl text-xs xl:text-sm 2xl:text-base font-bold transition-colors whitespace-nowrap ${
                    isServicesActive
                      ? isTransparent
                        ? 'text-harvest font-black bg-white/15'
                        : 'text-leaf font-black bg-leaf/10 dark:bg-leaf/20'
                      : isTransparent
                      ? 'text-white/90 hover:text-white hover:bg-white/10'
                      : 'text-forest/85 dark:text-cream/85 hover:text-leaf dark:hover:text-leaf hover:bg-forest/5 dark:hover:bg-white/5'
                  }`}
                >
                  <span className="whitespace-nowrap">{isBn ? 'সেবাসমূহ' : 'Services'}</span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 shrink-0 transition-transform duration-200 ${
                      activeDropdown === 'services' ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                <AnimatePresence>
                  {activeDropdown === 'services' && (
                    <motion.div
                      initial={{ opacity: 0, y: 6, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 4, scale: 0.98 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-full left-0 mt-2 w-64 p-2 rounded-2xl bg-white dark:bg-[#071d15] border border-forest/15 dark:border-white/15 shadow-2xl z-50 overflow-hidden"
                    >
                      <div className="space-y-1">
                        {serviceDropdownItems.map((item) => (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setActiveDropdown(null)}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-charcoal dark:text-cream hover:bg-forest/5 dark:hover:bg-white/10 hover:text-leaf transition-colors whitespace-nowrap"
                          >
                            <span className="text-base shrink-0">{item.icon}</span>
                            <span className="truncate whitespace-nowrap">{item.label}</span>
                          </Link>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* 4. Aquaculture Direct Link */}
              <Link
                href="/aquaculture"
                className={`h-10 flex items-center px-2.5 2xl:px-3.5 rounded-xl text-xs xl:text-sm 2xl:text-base font-bold transition-colors whitespace-nowrap ${
                  isAquacultureActive
                    ? isTransparent
                      ? 'text-harvest font-black bg-white/15'
                      : 'text-leaf font-black bg-leaf/10 dark:bg-leaf/20'
                    : isTransparent
                    ? 'text-white/90 hover:text-white hover:bg-white/10'
                    : 'text-forest/85 dark:text-cream/85 hover:text-leaf dark:hover:text-leaf hover:bg-forest/5 dark:hover:bg-white/5'
                }`}
              >
                {isBn ? 'মাছ চাষ' : 'Aquaculture'}
              </Link>

              {/* 5. About Dropdown */}
              <div
                className="relative"
                onMouseEnter={() => setActiveDropdown('about')}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <button
                  type="button"
                  onClick={() => setActiveDropdown(activeDropdown === 'about' ? null : 'about')}
                  aria-expanded={activeDropdown === 'about'}
                  className={`h-10 flex items-center gap-1 px-2.5 2xl:px-3.5 rounded-xl text-xs xl:text-sm 2xl:text-base font-bold transition-colors whitespace-nowrap ${
                    isAboutActive
                      ? isTransparent
                        ? 'text-harvest font-black bg-white/15'
                        : 'text-leaf font-black bg-leaf/10 dark:bg-leaf/20'
                      : isTransparent
                      ? 'text-white/90 hover:text-white hover:bg-white/10'
                      : 'text-forest/85 dark:text-cream/85 hover:text-leaf dark:hover:text-leaf hover:bg-forest/5 dark:hover:bg-white/5'
                  }`}
                >
                  <span className="whitespace-nowrap">{t('nav.about', 'About')}</span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 shrink-0 transition-transform duration-200 ${
                      activeDropdown === 'about' ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                <AnimatePresence>
                  {activeDropdown === 'about' && (
                    <motion.div
                      initial={{ opacity: 0, y: 6, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 4, scale: 0.98 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-full left-0 mt-2 w-60 p-2 rounded-2xl bg-white dark:bg-[#071d15] border border-forest/15 dark:border-white/15 shadow-2xl z-50 overflow-hidden"
                    >
                      <div className="space-y-1">
                        {aboutDropdownItems.map((item) => (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setActiveDropdown(null)}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-charcoal dark:text-cream hover:bg-forest/5 dark:hover:bg-white/10 hover:text-leaf transition-colors whitespace-nowrap"
                          >
                            <span className="text-base shrink-0">{item.icon}</span>
                            <span className="truncate whitespace-nowrap">{item.label}</span>
                          </Link>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* 6. Contact Direct Link */}
              <Link
                href="/contact"
                className={`h-10 flex items-center px-2.5 2xl:px-3.5 rounded-xl text-xs xl:text-sm 2xl:text-base font-bold transition-colors whitespace-nowrap ${
                  isContactActive
                    ? isTransparent
                      ? 'text-harvest font-black bg-white/15'
                      : 'text-leaf font-black bg-leaf/10 dark:bg-leaf/20'
                    : isTransparent
                    ? 'text-white/90 hover:text-white hover:bg-white/10'
                    : 'text-forest/85 dark:text-cream/85 hover:text-leaf dark:hover:text-leaf hover:bg-forest/5 dark:hover:bg-white/5'
                }`}
              >
                {t('nav.contact', 'Contact')}
              </Link>
            </nav>

            {/* ── Right Controls: Language Translator & Dedicated Call Section ── */}
            <div className="flex items-center space-x-2 shrink-0">
              {/* Language Switcher (Fully contained segmented selector) */}
              <LanguageToggle className="h-10" isTransparent={isTransparent} />

              {/* Dedicated Highly Visible Modern Call Section (Standardised to match LanguageToggle height & proportions) */}
              <a
                href={phoneUrl}
                aria-label={`Call us on ${siteConfig.phoneFormatted}`}
                title={`Call us on: ${siteConfig.phoneFormatted}`}
                className={`hidden sm:inline-flex h-10 items-center gap-2 px-3 sm:px-3.5 rounded-2xl transition-all duration-300 group shrink-0 ${
                  isTransparent
                    ? 'bg-white/12 hover:bg-white/20 border border-white/25 hover:border-harvest/70 backdrop-blur-md shadow-xs text-white'
                    : 'bg-forest/5 hover:bg-forest/10 dark:bg-white/5 dark:hover:bg-white/10 border border-forest/15 dark:border-white/15 hover:border-harvest/60 shadow-xs'
                }`}
              >
                {/* Compact Phone Icon in harvest badge */}
                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                    isTransparent
                      ? 'bg-harvest/30 text-harvest'
                      : 'bg-harvest/20 dark:bg-harvest/30 text-harvest'
                  }`}
                >
                  <Phone className="w-3.5 h-3.5 fill-none stroke-current" />
                </div>

                {/* Text Block: "Call us on" + bold phone number */}
                <div className="flex flex-col text-left justify-center leading-none">
                  <span
                    className={`text-[9px] font-extrabold uppercase tracking-wider ${
                      isTransparent ? 'text-cream/80' : 'text-forest/70 dark:text-cream/70'
                    }`}
                  >
                    {isBn ? 'ফোন করুন' : 'Call us on'}
                  </span>
                  <span className="text-[11px] sm:text-xs font-black tracking-wide text-harvest group-hover:text-amber-300 mt-0.5 whitespace-nowrap">
                    {siteConfig.phoneFormatted}
                  </span>
                </div>
              </a>

              {/* Mobile Phone Call Button (Icon-Only below sm to prevent overflow) */}
              <a
                href={phoneUrl}
                aria-label={`Call us on ${siteConfig.phoneFormatted}`}
                className={`sm:hidden h-10 w-10 flex items-center justify-center rounded-xl transition-all active:scale-95 shrink-0 ${
                  isTransparent
                    ? 'bg-harvest/25 border border-harvest/50 text-harvest'
                    : 'bg-forest text-white'
                }`}
              >
                <Phone className="w-4 h-4 fill-none stroke-current" />
              </a>

              {/* Mobile Hamburger Button (Activates below xl breakpoint) */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                aria-label="Open mobile navigation drawer"
                className={`xl:hidden h-10 w-10 flex items-center justify-center rounded-xl transition-colors ${
                  isTransparent
                    ? 'text-white hover:bg-white/15'
                    : 'text-forest dark:text-cream hover:bg-forest/10 dark:hover:bg-white/10'
                }`}
              >
                <Menu className="w-5 h-5 shrink-0" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Full-Screen Mobile Drawer */}
      <MobileMenu
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />
    </>
  );
}

export default Navbar;
