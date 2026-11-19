'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { AquaLanguageProvider, useAquaLanguage } from '@/lib/i18n/aqua-context';
import {
  Fish,
  Waves,
  Layers,
  Utensils,
  Droplet,
  AlertTriangle,
  Stethoscope,
  TrendingUp,
  Skull,
  Anchor,
  CircleDollarSign,
  LogOut,
  Home,
  Menu,
  X,
  ShieldCheck,
  Clock,
  Languages,
  ChevronRight,
  ExternalLink,
  Phone,
  Sparkles,
  HelpCircle,
} from 'lucide-react';

function FarmerLayoutInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const { locale, toggleLocale, d, isBn } = useAquaLanguage();

  const [farmer, setFarmer] = useState<any>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // If on login, register, or dedicated fertilizer records portal, do not render aquaculture dashboard shell
  const isExcludedRoute =
    pathname === '/farmer/login' ||
    pathname === '/farmer/register' ||
    pathname.startsWith('/farmer/fertilizer') ||
    pathname.startsWith('/farmer/records');

  useEffect(() => {
    if (isExcludedRoute) return;

    fetch('/api/farmer/auth/me')
      .then((res) => {
        if (!res.ok) {
          router.push('/farmer/login');
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data && data.authenticated) {
          setFarmer(data.farmer);
        }
      })
      .catch(() => {
        router.push('/farmer/login');
      });
  }, [isExcludedRoute, router]);

  const handleLogout = async () => {
    try {
      await fetch('/api/farmer/auth/me', { method: 'POST' });
    } catch {}
    router.push('/farmer/login');
    router.refresh();
  };

  if (isExcludedRoute) {
    return <>{children}</>;
  }

  // Navigation Items Grouped cleanly for maximum user-friendliness
  const farmOperationItems = [
    { href: '/farmer/dashboard', label: d.nav.dashboard, icon: Home },
    { href: '/farmer/ponds', label: d.nav.myPonds, icon: Waves },
    { href: '/farmer/stocking', label: d.nav.stocking, icon: Layers },
    { href: '/farmer/feed', label: d.nav.feed, icon: Utensils },
    { href: '/farmer/growth', label: d.nav.growth, icon: TrendingUp },
    { href: '/farmer/mortality', label: d.nav.mortality, icon: Skull },
    { href: '/farmer/harvest', label: d.nav.harvest, icon: Anchor },
    { href: '/farmer/accounts', label: d.nav.accounts, icon: CircleDollarSign },
  ];

  const advisoryItems = [
    { href: '/farmer/water-quality', label: d.nav.waterQuality, icon: Droplet },
    { href: '/farmer/problems', label: d.nav.problems, icon: AlertTriangle },
    { href: '/farmer/treatment', label: d.nav.treatment, icon: Stethoscope },
  ];

  const currentNav =
    [...farmOperationItems, ...advisoryItems].find((item) => item.href === pathname) || {
      label: d.nav.dashboard,
      icon: Home,
    };
  const CurrentIcon = currentNav.icon;

  const NavContent = () => (
    <div className="flex flex-col h-full justify-between select-none">
      {/* Brand & Platform Header */}
      <div className="flex flex-col">
        <div className="h-14 sm:h-16 flex items-center justify-between px-4 border-b border-emerald-800/40 shrink-0">
          <Link
            href="/farmer/dashboard"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2.5 overflow-hidden group"
          >
            <div className="w-9 h-9 rounded-xl bg-linear-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-lg shadow-md group-hover:scale-105 transition-transform shrink-0">
              🐟
            </div>
            <div className="min-w-0">
              <span className="font-black text-sm tracking-tight text-white block leading-tight truncate">
                Ahammed Aqua
              </span>
              <span className="text-[10px] text-emerald-300 font-bold uppercase tracking-wider block truncate">
                {isBn ? 'চাষী সহায়তা পোর্টাল' : 'Farmer Intelligence'}
              </span>
            </div>
          </Link>

          {/* Mobile Close Button */}
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="md:hidden p-1.5 rounded-lg text-white/80 hover:bg-white/10"
            aria-label="Close navigation sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Farmer Profile Badge Card */}
        {farmer && (
          <div className="p-3 border-b border-emerald-800/30">
            <div className="p-2.5 rounded-2xl bg-emerald-950/70 border border-emerald-700/30 space-y-1.5 shadow-2xs">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-emerald-700 text-white font-black text-xs flex items-center justify-center shrink-0 border border-emerald-400/40">
                  {farmer.fullName?.charAt(0)?.toUpperCase() || 'P'}
                </div>
                <div className="min-w-0 flex-1">
                  <span className="font-extrabold text-xs text-white block truncate leading-tight">
                    {farmer.fullName}
                  </span>
                  <span className="text-[10px] font-mono text-emerald-300/80 block truncate">
                    {farmer.registrationNumber || farmer.id}
                  </span>
                </div>
              </div>

              <div className="pt-1 border-t border-emerald-800/40 flex items-center justify-between text-[10px]">
                {farmer.verificationStatus === 'verified' ? (
                  <span className="inline-flex items-center gap-1 text-emerald-300 font-bold">
                    <ShieldCheck className="w-3 h-3 text-emerald-400" />
                    <span>{isBn ? 'যাচাইকৃত চাষী' : 'Verified Farmer'}</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-amber-300 font-bold">
                    <Clock className="w-3 h-3 text-amber-400" />
                    <span>{isBn ? 'যাচাই প্রক্রিয়াধীন' : 'Pending'}</span>
                  </span>
                )}

                <span className="text-emerald-400/70 text-[10px] truncate max-w-[90px]">
                  {farmer.villageName || 'Dakshin Dinajpur'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Menus (Scrollable Rail) */}
        <nav className="p-3 space-y-4 overflow-y-auto max-h-[calc(100vh-210px)]">
          {/* Group 1: Operations */}
          <div>
            <span className="px-2 text-[10px] font-black uppercase tracking-wider text-emerald-300/60 block mb-1">
              {isBn ? 'খামার পরিচালনা (Operations)' : 'Farm Operations'}
            </span>
            <div className="space-y-1">
              {farmOperationItems.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                      active
                        ? 'bg-emerald-600 text-white font-black shadow-md shadow-emerald-950/40 translate-x-1'
                        : 'text-emerald-200/80 hover:text-white hover:bg-emerald-800/40'
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-white' : 'text-emerald-400/80'}`} />
                    <span className="truncate">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Group 2: Advisory & Health (Admin Managed) */}
          <div>
            <div className="px-2 flex items-center justify-between mb-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-300/60 block">
                {isBn ? 'পরামর্শ ও স্বাস্থ্যসেবা' : 'Advisory & Health'}
              </span>
              <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-800/80 text-emerald-200 border border-emerald-700/50">
                {isBn ? 'অ্যাডমিন গাইড' : 'Admin'}
              </span>
            </div>
            <div className="space-y-1">
              {advisoryItems.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                      active
                        ? 'bg-emerald-600 text-white font-black shadow-md shadow-emerald-950/40 translate-x-1'
                        : 'text-emerald-200/80 hover:text-white hover:bg-emerald-800/40'
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-white' : 'text-emerald-400/80'}`} />
                    <span className="truncate">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </nav>
      </div>

      {/* Bottom Sidebar: Language & Sign Out */}
      <div className="p-3 border-t border-emerald-800/40 space-y-1.5 shrink-0 bg-[#061e14]">
        {/* Language Switcher */}
        <button
          onClick={toggleLocale}
          type="button"
          className="w-full py-1.5 px-2.5 rounded-xl text-xs font-bold border border-emerald-600/40 bg-emerald-950/60 hover:bg-emerald-800/60 text-emerald-100 flex items-center justify-between transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-1.5">
            <Languages className="w-3.5 h-3.5 text-emerald-400" />
            <span>{isBn ? 'ভাষা (Language)' : 'Language (ভাষা)'}</span>
          </div>
          <span className="px-2 py-0.5 rounded-lg bg-emerald-700 text-white font-mono text-[10px]">
            {isBn ? 'বাংলা' : 'English'}
          </span>
        </button>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          type="button"
          className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs font-bold text-red-300 hover:bg-red-950/40 hover:text-red-200 transition-colors cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>{d.nav.signOut}</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#061711] text-slate-900 dark:text-slate-100 flex flex-col md:flex-row antialiased w-full overflow-x-clip">
      {/* ── MOBILE BACKDROP OVERLAY ── */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-xs"
          aria-hidden="true"
        />
      )}

      {/* ── PERMANENT LEFT SIDEBAR ON TABLET & DESKTOP (>= 768px) ── */}
      <aside
        className={`fixed md:sticky top-0 left-0 h-screen bg-[#072418] text-white flex flex-col justify-between z-50 md:z-40 transition-transform duration-300 border-r border-emerald-800/40 shrink-0 select-none shadow-xl ${
          mobileMenuOpen ? 'translate-x-0 w-64 shadow-2xl' : '-translate-x-full md:translate-x-0'
        } md:w-64 lg:w-72 overflow-hidden`}
      >
        <NavContent />
      </aside>

      {/* ── RIGHT MAIN WORKSPACE ── */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Top Header Bar */}
        <header className="h-14 sm:h-16 bg-white dark:bg-[#0c241b] border-b border-gray-200 dark:border-white/10 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs shrink-0">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            {/* Mobile Hamburger Button (Only on mobile < 768px) */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              type="button"
              className="md:hidden p-2 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 shrink-0 cursor-pointer"
              aria-label="Open navigation sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Active Page Indicator */}
            <div className="flex items-center gap-2 truncate">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 hidden sm:flex items-center justify-center shrink-0">
                <CurrentIcon className="w-4 h-4" />
              </div>
              <div className="truncate">
                <h1 className="text-sm sm:text-base font-black text-gray-900 dark:text-white leading-tight truncate">
                  {currentNav.label}
                </h1>
                <span className="text-[10px] text-gray-400 font-semibold hidden sm:block truncate">
                  Ahammed Aquaculture • {isBn ? 'কৃষক সহায়তা পোর্টাল' : 'Farmer Intelligence Platform'}
                </span>
              </div>
            </div>
          </div>

          {/* Right Header Quick Actions */}
          <div className="flex items-center gap-2">
            {/* Language Switcher Pill */}
            <button
              onClick={toggleLocale}
              type="button"
              className="px-3 py-1.5 rounded-xl text-xs font-black border border-gray-300 dark:border-white/15 bg-white dark:bg-black/30 hover:border-emerald-600 text-gray-800 dark:text-gray-200 transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
              title={isBn ? 'Switch to English' : 'বাংলা ভাষায় অনুবাদ করুন'}
            >
              <Languages className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>{isBn ? 'English' : 'বাংলা'}</span>
            </button>

            {/* Farmer Quick Status Badge */}
            {farmer && (
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-[11px] font-bold text-emerald-800 dark:text-emerald-300">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span className="truncate">{farmer.fullName}</span>
              </div>
            )}

            {/* Logout Shortcut */}
            <button
              onClick={handleLogout}
              type="button"
              title={d.nav.signOut}
              className="p-2 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Main Content Area: Spacious & Completely Clean */}
        <main className="flex-1 w-full max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
          {children}
        </main>

        {/* Clean Footer */}
        <footer className="w-full max-w-6xl mx-auto px-4 py-3 border-t border-gray-200/80 dark:border-white/10 text-center text-xs text-gray-400">
          <p>Ahammed Fertilizer &amp; Aquaculture Hub • Dakshin Dinajpur • Govt. Authorized Shop • Helpline: +91 9091017035</p>
        </footer>
      </div>

      {/* 
        NOTE: The lower sticky bottom navigation bar (Dashboard, My Ponds, Fish Stocking, More)
        has been completely removed as requested to make the interface clean, user-friendly,
        and unencumbered.
      */}
    </div>
  );
}

export default function FarmerLayout({ children }: { children: React.ReactNode }) {
  return (
    <AquaLanguageProvider>
      <FarmerLayoutInner>{children}</FarmerLayoutInner>
    </AquaLanguageProvider>
  );
}
