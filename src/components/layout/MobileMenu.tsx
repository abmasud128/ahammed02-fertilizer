'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { siteConfig } from '@/config/site';
import { useLanguage } from '@/i18n/provider';
import { formatPhoneUrl, formatWhatsAppUrl } from '@/lib/utils';
import { LanguageToggle } from '@/components/shared/LanguageToggle';
import { DarkModeToggle } from '@/components/shared/DarkModeToggle';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const pathname = usePathname();
  const { locale, t } = useLanguage();

  // Lock body scroll while menu is open & listen for ESC key
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleKeyDown);
      };
    } else {
      document.body.style.overflow = '';
    }
  }, [isOpen, onClose]);

  const navLinks = [
    { href: '/', label: t('nav.home', 'Home') },
    { href: '/products', label: t('nav.products', 'Products') },
    { href: '/crop-guide', label: t('nav.cropGuide', 'Crop Guide') },
    { href: '/aquaculture', label: locale === 'bn' ? 'মাছ চাষ (Aquaculture)' : 'Aquaculture' },
    { href: '/book-test', label: locale === 'bn' ? '🧪 মাটি ও জল পরীক্ষা (Book a Test)' : '🧪 Book a Test' },
    { href: '/farmer/login', label: locale === 'bn' ? '🐟 চাষী পোর্টাল (Farmer Login)' : '🐟 Farmer Portal' },
    { href: '/about', label: t('nav.about', 'About') },
    { href: '/offers', label: t('nav.offers', 'Offers') },
    { href: '/gallery', label: t('nav.gallery', 'Gallery') },
    { href: '/contact', label: t('nav.contact', 'Contact') },
    { href: '/admin', label: t('nav.admin', 'Dealer Portal'), isMuted: true },
  ];

  const phoneUrl = formatPhoneUrl(siteConfig.phone);
  const whatsappMsg = locale === 'bn' ? siteConfig.whatsappMessagebn : siteConfig.whatsappMessage;
  const whatsappUrl = formatWhatsAppUrl(siteConfig.whatsapp, whatsappMsg);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 xl:hidden flex justify-end">
          {/* Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            aria-hidden="true"
          />

          {/* Slide-in menu panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="relative w-full max-w-[320px] sm:max-w-sm h-full bg-cream dark:bg-dark-bg border-l border-forest/10 dark:border-forest/30 flex flex-col justify-between p-6 shadow-2xl overflow-y-auto overflow-x-hidden z-10"
          >
            {/* Top Bar: Brand & Close */}
            <div>
              <div className="flex items-center justify-between pb-6 border-b border-forest/10 dark:border-forest/20">
                <Link
                  href="/"
                  onClick={onClose}
                  className="flex items-center gap-2 font-bold text-forest dark:text-cream text-lg"
                >
                  <span className="text-2xl" role="img" aria-label="Sprout">🌾</span>
                  <span className="tracking-tight">
                    {locale === 'bn' ? siteConfig.namebn : siteConfig.name}
                  </span>
                </Link>

                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close menu"
                  className="min-w-[44px] min-h-[44px] flex items-center justify-center p-2 rounded-xl text-forest/70 dark:text-cream/70 hover:text-forest dark:hover:text-cream hover:bg-forest/10 dark:hover:bg-forest/30 transition-colors"
                >
                  <svg
                    className="w-6 h-6"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>

              {/* Navigation Links with staggered animation */}
              <nav className="mt-6 flex flex-col space-y-2">
                {navLinks.map((link, idx) => {
                  const isActive =
                    link.href === '/' ? pathname === '/' : pathname.startsWith(link.href);

                  return (
                    <motion.div
                      key={link.href}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.04 * idx, duration: 0.2 }}
                    >
                      <Link
                        href={link.href}
                        onClick={onClose}
                        className={`flex items-center justify-between px-4 py-3 rounded-xl text-base font-semibold transition-all ${
                          isActive
                            ? 'bg-leaf/15 text-leaf dark:bg-leaf/20 dark:text-leaf font-bold shadow-xs'
                            : 'text-forest dark:text-cream/90 hover:bg-forest/5 dark:hover:bg-forest/20 hover:text-leaf'
                        }`}
                      >
                        <span>{link.label}</span>
                        {isActive && (
                          <span className="w-2 h-2 rounded-full bg-leaf animate-pulse" />
                        )}
                      </Link>
                    </motion.div>
                  );
                })}
              </nav>
            </div>

            {/* Bottom Actions */}
            <div className="pt-6 mt-6 border-t border-forest/10 dark:border-forest/20 space-y-4">
              {/* Controls: Language and Theme */}
              <div className="flex items-center justify-between px-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {locale === 'bn' ? 'সেটিংস' : 'Preferences'}
                </span>
                <div className="flex items-center gap-2">
                  <LanguageToggle />
                  <DarkModeToggle />
                </div>
              </div>

              {/* Quick Contact Buttons (Accessible >= 44px tap target) */}
              <div className="grid grid-cols-2 gap-2">
                <a
                  href={phoneUrl}
                  className="min-h-[44px] flex items-center justify-center gap-2 px-3 py-3 rounded-xl bg-forest hover:bg-forest/90 text-white text-xs font-semibold shadow-xs"
                >
                  <svg
                    className="w-4 h-4 shrink-0"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                  <span>{siteConfig.phoneFormatted}</span>
                </a>

                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="min-h-[44px] flex items-center justify-center gap-2 px-3 py-3 rounded-xl bg-leaf hover:bg-leaf/90 text-white text-xs font-semibold shadow-xs"
                >
                  <svg
                    className="w-4 h-4 shrink-0 fill-current"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                  </svg>
                  <span>WhatsApp</span>
                </a>
              </div>

              <a
                href={siteConfig.directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full min-h-[44px] flex items-center justify-center gap-2 px-3 py-3 rounded-xl bg-harvest hover:bg-[#e0aa04] text-forest text-xs font-bold shadow-xs"
              >
                <svg
                  className="w-4 h-4 text-forest"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                <span>{locale === 'bn' ? 'দিকনির্দেশনা পান' : 'Directions'}</span>
              </a>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default MobileMenu;
