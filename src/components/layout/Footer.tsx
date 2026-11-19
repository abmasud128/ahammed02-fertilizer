'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { siteConfig } from '@/config/site';
import { useLanguage } from '@/i18n/provider';
import { formatPhoneUrl, formatWhatsAppUrl } from '@/lib/utils';

export function Footer() {
  const pathname = usePathname();
  if (pathname.startsWith('/admin') || pathname.startsWith('/farmer')) return null;

  const { locale, t } = useLanguage();

  const currentYear = new Date().getFullYear();
  const phoneUrl = formatPhoneUrl(siteConfig.phone);
  const whatsappMsg = locale === 'bn' ? siteConfig.whatsappMessagebn : siteConfig.whatsappMessage;
  const whatsappUrl = formatWhatsAppUrl(siteConfig.whatsapp, whatsappMsg);

  const navLinks = [
    { href: '/', label: t('nav.home', 'Home') },
    { href: '/products', label: t('nav.products', 'Products') },
    { href: '/crop-guide', label: t('nav.cropGuide', 'Crop Guide') },
    { href: '/aquaculture', label: locale === 'bn' ? 'মাছ চাষ পরামর্শ' : 'Aquaculture' },
    { href: '/book-test', label: locale === 'bn' ? 'মাটি ও জল পরীক্ষা' : 'Book a Test' },
    { href: '/about', label: t('nav.about', 'About Us') },
    { href: '/offers', label: t('nav.offers', 'Offers & Schemes') },
    { href: '/gallery', label: t('nav.gallery', 'Shop Gallery') },
    { href: '/contact', label: t('nav.contact', 'Contact Us') },
  ];

  return (
    <footer
      className="relative bg-cover bg-center lg:bg-fixed text-cream/95 pt-16 pb-28 md:pb-12 border-t border-white/15 overflow-hidden"
      style={{ backgroundImage: `url('/images/backgrounds/bg-footer.jpg')` }}
    >
      {/* High-contrast dark backdrop overlay for crystal clear text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-black/85 to-black/95 backdrop-blur-xs pointer-events-none" />
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main 4-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8 pb-12 border-b border-cream/15">
          {/* Column 1: Brand & About */}
          <div className="space-y-4">
            <Link href="/" className="inline-flex items-center gap-2 group">
              <span className="text-3xl transform transition-transform group-hover:scale-110">
                🌾
              </span>
              <div className="flex flex-col">
                <span className="font-extrabold text-lg text-white tracking-tight">
                  {locale === 'bn' ? siteConfig.namebn : siteConfig.name}
                </span>
                <span className="text-xs text-harvest font-bold">
                  {locale === 'bn' ? siteConfig.taglinebn : siteConfig.tagline}
                </span>
              </div>
            </Link>

            <p className="text-sm text-cream/90 font-medium leading-relaxed">
              {locale === 'bn' ? siteConfig.descriptionbn : siteConfig.description}
            </p>

            {/* Social Links */}
            <div className="pt-2">
              <span className="block text-xs font-semibold uppercase tracking-wider text-harvest mb-2">
                {t('footer.followUs', 'Connect With Us')}
              </span>
              <div className="flex items-center space-x-3">
                {/* Facebook */}
                <a
                  href={siteConfig.social.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="w-9 h-9 rounded-lg bg-white/10 hover:bg-leaf text-white flex items-center justify-center transition-colors"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M9 8H6v4h3v12h5V12h3.642L18 8h-4V6.333C14 5.374 14.5 5 15.6 5H18V0h-3.808C10.592 0 9 1.582 9 4.615V8z" />
                  </svg>
                </a>

                {/* Instagram */}
                <a
                  href={siteConfig.social.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="w-9 h-9 rounded-lg bg-white/10 hover:bg-leaf text-white flex items-center justify-center transition-colors"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </a>

                {/* WhatsApp Direct */}
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="WhatsApp"
                  className="w-9 h-9 rounded-lg bg-white/10 hover:bg-[#25D366] text-white flex items-center justify-center transition-colors"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="space-y-4">
            <h3 className="text-sm font-black uppercase tracking-wider text-harvest">
              {t('footer.quickLinks', 'Quick Links')}
            </h3>
            <nav className="flex flex-col space-y-2.5">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm font-semibold text-white/90 hover:text-harvest hover:translate-x-1 transition-all duration-200 inline-flex items-center gap-1.5"
                >
                  <span className="text-leaf text-xs">▸</span>
                  <span>{link.label}</span>
                </Link>
              ))}
            </nav>
          </div>

          {/* Column 3: Contact Info */}
          <div className="space-y-4">
            <h3 className="text-sm font-black uppercase tracking-wider text-harvest">
              {t('footer.contact', 'Contact Information')}
            </h3>
            <address className="not-italic space-y-3.5 text-sm text-white/95 font-medium">
              {/* Address */}
              <div className="flex items-start gap-2.5">
                <svg
                  className="w-4 h-4 text-leaf shrink-0 mt-0.5"
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
                <a
                  href={siteConfig.directionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white hover:text-harvest font-semibold transition-colors"
                >
                  {locale === 'bn' ? siteConfig.addressbn.full : siteConfig.address.full}
                </a>
              </div>

              {/* Phone */}
              <div className="flex items-center gap-2.5">
                <svg
                  className="w-4 h-4 text-leaf shrink-0"
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
                <a href={phoneUrl} className="text-white hover:text-harvest font-bold tracking-wide transition-colors">
                  {siteConfig.phoneFormatted}
                </a>
              </div>

              {/* Email */}
              <div className="flex items-center gap-2.5">
                <svg
                  className="w-4 h-4 text-leaf shrink-0"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                <a href={`mailto:${siteConfig.email}`} className="text-white hover:text-harvest font-semibold transition-colors">
                  {siteConfig.email}
                </a>
              </div>

              {/* Operating Hours */}
              <div className="flex items-start gap-2.5 pt-1">
                <svg
                  className="w-4 h-4 text-leaf shrink-0 mt-0.5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                <span className="text-white/90 font-medium">
                  {locale === 'bn' ? siteConfig.hoursbn : siteConfig.hours}
                </span>
              </div>
            </address>
          </div>

          {/* Column 4: Safety Notice Card */}
          <div className="space-y-4">
            <h3 className="text-sm font-black uppercase tracking-wider text-harvest">
              {locale === 'bn' ? 'সতর্কতা নির্দেশিকা' : 'Safety Notice'}
            </h3>
            <div className="p-4 rounded-xl bg-black/65 border border-harvest/40 space-y-2.5 backdrop-blur-md">
              <div className="flex items-center gap-2 text-harvest">
                <svg
                  className="w-5 h-5 shrink-0"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
                <span className="font-bold text-xs uppercase tracking-wider">
                  {locale === 'bn' ? 'কীটনাশক সুরক্ষা' : 'Pesticide Safe Handling'}
                </span>
              </div>
              <p className="text-xs text-cream/95 leading-relaxed font-medium">
                {locale === 'bn' ? siteConfig.safetyNoticebn : siteConfig.safetyNotice}
              </p>
              <div className="pt-2 border-t border-white/15">
                <span className="text-[11px] text-cream/80 font-medium">
                  {t('footer.licences', 'Approved by Directorate of Agriculture, Government of West Bengal.')}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-cream/80 text-center md:text-left">
          {/* Licences & Registration */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-4 gap-y-1">
            {siteConfig.licences.map((licence, idx) => (
              <span key={idx} className="bg-white/10 px-2.5 py-1 rounded text-[11px] font-mono text-white/90">
                {licence}
              </span>
            ))}
          </div>

          {/* Copyright & Credit (Theme toggle cleanly removed) */}
          <div className="flex flex-col sm:flex-row items-center gap-3 text-cream/90 font-medium">
            <span>
              © {currentYear} {locale === 'bn' ? siteConfig.namebn : siteConfig.name}. {t('footer.copyright', 'All Rights Reserved.')}
            </span>
            <span className="hidden sm:inline">•</span>
            <span className="text-harvest font-bold">
              Made with ❤️ for farmers
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
