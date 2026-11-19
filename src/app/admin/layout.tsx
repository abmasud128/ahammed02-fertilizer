'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Layers,
  Truck,
  Users,
  BarChart3,
  Receipt,
  Settings,
  History,
  LogOut,
  Menu,
  X,
  Search,
  Bell,
  Sun,
  Moon,
  Shield,
  ExternalLink,
  PlusCircle,
  ChevronLeft,
  ChevronRight,
  Fish,
  HeartHandshake,
  UserCheck,
  UserPlus,
  FlaskConical,
} from 'lucide-react';
import { siteConfig } from '@/config/site';

interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'owner' | 'cashier';
}

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [lang, setLang] = useState<'en' | 'bn'>('en');
  const [lowStockAlertCount, setLowStockAlertCount] = useState<number>(0);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    try {
      const savedLang = localStorage.getItem('ahammed_language') || localStorage.getItem('ahammed_lang');
      if (savedLang === 'bn' || savedLang === 'en') {
        setLang(savedLang as 'en' | 'bn');
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const updateCollapse = () => {
      const w = window.innerWidth;
      if (w >= 1024 && w < 1280) {
        setIsCollapsed(true);
      } else if (w >= 1280) {
        const saved = localStorage.getItem('admin_sidebar_collapsed');
        if (saved !== null) {
          setIsCollapsed(saved === 'true');
        } else {
          setIsCollapsed(false);
        }
      }
    };
    updateCollapse();
    window.addEventListener('resize', updateCollapse);
    return () => window.removeEventListener('resize', updateCollapse);
  }, []);

  const toggleSidebarCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('admin_sidebar_collapsed', String(next));
      } catch {}
      return next;
    });
  };

  // If on /admin/login, render without sidebar shell
  const isLoginPage = pathname === '/admin/login';

  useEffect(() => {
    if (isLoginPage) return;

    // Check session
    fetch('/api/admin/auth/me')
      .then((res) => {
        if (!res.ok) {
          router.push('/admin/login');
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data && data.authenticated) {
          setUser(data.user);
        }
      })
      .catch(() => {
        router.push('/admin/login');
      });

    // Check low stock count for badge
    fetch('/api/admin/stock/alerts')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && typeof data.lowStockCount === 'number') {
          setLowStockAlertCount(data.lowStockCount);
        }
      })
      .catch(() => {});
  }, [isLoginPage, router]);

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/auth/logout', { method: 'POST' });
    } catch {
      // Ignore
    }
    router.push('/admin/login');
    router.refresh();
  };

  const toggleDarkMode = () => {
    const root = document.documentElement;
    if (root.classList.contains('dark')) {
      root.classList.remove('dark');
      setIsDarkMode(false);
    } else {
      root.classList.add('dark');
      setIsDarkMode(true);
    }
  };

  if (isLoginPage) {
    return <>{children}</>;
  }

  const navItems = [
    {
      href: '/admin',
      label: lang === 'bn' ? 'ড্যাশবোর্ড' : 'Dashboard',
      icon: LayoutDashboard,
      roles: ['owner', 'cashier'],
    },
    {
      href: '/admin/farmers',
      label: lang === 'bn' ? 'কৃষক যোগ করুন' : 'Add Farmer',
      icon: UserPlus,
      roles: ['owner', 'cashier'],
    },
    {
      href: '/admin/soil-testing',
      label: lang === 'bn' ? 'মাটি পরীক্ষা ও সার সুপারিশ' : 'Soil Testing & Advisory',
      icon: FlaskConical,
      badge: '9-Step',
      roles: ['owner', 'cashier'],
    },
    {
      href: '/admin/pos',
      label: lang === 'bn' ? 'পিওএস বিলিং' : 'POS Billing',
      icon: ShoppingCart,
      badge: 'Fast',
      roles: ['owner', 'cashier'],
    },
    {
      href: '/admin/products',
      label: lang === 'bn' ? 'পণ্য তালিকা' : 'Products Master',
      icon: Package,
      roles: ['owner', 'cashier'],
    },
    {
      href: '/admin/stock',
      label: lang === 'bn' ? 'স্টক ও ব্যাচ' : 'Stock & Batches',
      icon: Layers,
      alertCount: lowStockAlertCount,
      roles: ['owner', 'cashier'],
    },
    {
      href: '/admin/suppliers',
      label: lang === 'bn' ? 'সাপ্লায়ার ও ক্রয়' : 'Suppliers & Purchases',
      icon: Truck,
      roles: ['owner'],
    },
    {
      href: '/admin/customers',
      label: lang === 'bn' ? 'গ্রাহক ও বাকি খাতা' : 'Customers & Credit',
      icon: Users,
      roles: ['owner', 'cashier'],
    },
    {
      href: '/admin/aqua',
      label: lang === 'bn' ? 'মৎস্য চাষ প্ল্যাটফর্ম' : 'Aquaculture Hub',
      icon: Fish,
      badge: 'Aqua',
      roles: ['owner', 'cashier'],
    },
    {
      href: '/admin/crm',
      label: lang === 'bn' ? 'সিআরএম ও কৃষক পরামর্শ' : 'Farm Intelligence CRM',
      icon: HeartHandshake,
      badge: 'CRM',
      roles: ['owner', 'cashier'],
    },
    {
      href: '/admin/reports',
      label: lang === 'bn' ? 'রিপোর্ট ও লাভ' : 'Reports & Analytics',
      icon: BarChart3,
      roles: ['owner'],
    },
    {
      href: '/admin/expenses',
      label: lang === 'bn' ? 'দোকানের খরচ' : 'Shop Expenses',
      icon: Receipt,
      roles: ['owner'],
    },
    {
      href: '/admin/settings',
      label: lang === 'bn' ? 'সেটিংস ও জিএসটি' : 'Settings & Licences',
      icon: Settings,
      roles: ['owner'],
    },
    {
      href: '/admin/audit',
      label: lang === 'bn' ? 'অডিট লগ' : 'Security Audit',
      icon: History,
      roles: ['owner'],
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#071a13] text-gray-900 dark:text-gray-100 flex flex-col lg:flex-row antialiased w-full overflow-x-clip">
      {/* ── Mobile Sidebar Overlay ── */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-xs"
          aria-hidden="true"
        />
      )}

      {/* ── Sidebar ── */}
      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen bg-forest dark:bg-[#082218] text-white flex flex-col justify-between z-50 lg:z-40 transition-all duration-300 border-r border-white/10 shrink-0 ${
          sidebarOpen ? 'translate-x-0 w-68 shadow-2xl' : '-translate-x-full lg:translate-x-0'
        } ${isCollapsed ? 'lg:w-[72px]' : 'lg:w-[260px]'}`}
      >
        {/* Top Header in Sidebar */}
        <div className="flex flex-col">
          <div className="h-14 sm:h-16 flex items-center justify-between px-3.5 border-b border-white/10 shrink-0">
            <Link
              href="/admin"
              className={`flex items-center gap-2.5 overflow-hidden ${isCollapsed ? 'lg:justify-center lg:w-full' : ''}`}
              title="Ahammed Fertilizer"
            >
              <span className="text-2xl shrink-0">🌾</span>
              <div className={`${isCollapsed ? 'lg:hidden' : 'block'} min-w-0`}>
                <span className="font-extrabold text-sm tracking-tight text-white block leading-tight truncate">
                  Ahammed Fertilizer
                </span>
                <span className="text-[10px] text-harvest font-semibold uppercase tracking-wider block mt-0.5 truncate">
                  POS & Store Admin
                </span>
              </div>
            </Link>

            {/* Mobile Close Button */}
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1.5 rounded-lg text-white/80 hover:bg-white/10"
              aria-label="Close navigation sidebar"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Desktop Collapse Toggle */}
            <button
              type="button"
              onClick={toggleSidebarCollapse}
              className={`hidden lg:flex p-1.5 rounded-lg text-white/70 hover:bg-white/10 hover:text-white transition-colors shrink-0 ${
                isCollapsed ? 'hidden' : ''
              }`}
              title="Collapse sidebar to icon rail"
              aria-label="Collapse sidebar"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>

          {/* Desktop Expand Button when collapsed */}
          {isCollapsed && (
            <div className="hidden lg:flex justify-center py-2 border-b border-white/10">
              <button
                type="button"
                onClick={toggleSidebarCollapse}
                className="p-1 rounded-lg text-white/70 hover:bg-white/10 hover:text-white transition-colors"
                title="Expand sidebar"
                aria-label="Expand sidebar"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* User Role Card */}
          <div
            className={`mx-2.5 my-2.5 rounded-xl bg-white/10 border border-white/10 flex items-center transition-all ${
              isCollapsed ? 'lg:p-2 lg:justify-center' : 'p-3 justify-between'
            }`}
          >
            <div
              className="flex items-center gap-2.5 min-w-0"
              title={`${user?.name || 'Ahammed Masud'} (${user?.role === 'owner' ? 'Store Owner' : 'Counter Cashier'})`}
            >
              <div className="w-8 h-8 rounded-full bg-harvest text-forest flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                {user?.name ? user.name.charAt(0) : 'A'}
              </div>
              <div className={`truncate max-w-[110px] ${isCollapsed ? 'lg:hidden' : 'block'}`}>
                <p className="text-xs font-bold text-white truncate">{user?.name || 'Ahammed Masud'}</p>
                <p className="text-[10px] text-white/70 capitalize flex items-center gap-1">
                  <Shield className="w-3 h-3 text-leaf shrink-0" />
                  <span className="truncate">{user?.role === 'owner' ? 'Store Owner' : 'Counter Cashier'}</span>
                </p>
              </div>
            </div>
            <span
              className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-full shrink-0 ${
                isCollapsed ? 'lg:hidden' : 'inline-block'
              } ${user?.role === 'owner' ? 'bg-amber-400 text-forest' : 'bg-leaf text-white'}`}
            >
              {user?.role || 'Owner'}
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="px-2 space-y-1 overflow-y-auto max-h-[calc(100vh-250px)] pt-1">
            {navItems.map((item) => {
              if (user && !item.roles.includes(user.role)) {
                return null;
              }

              const isActive =
                item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href);

              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  title={isCollapsed ? item.label : undefined}
                  className={`flex items-center rounded-xl text-xs font-semibold transition-all relative ${
                    isCollapsed ? 'lg:justify-center lg:py-2.5 lg:px-0' : 'justify-between px-3 py-2'
                  } ${
                    isActive
                      ? 'bg-leaf text-white shadow-md shadow-green-950/20 font-bold'
                      : 'text-white/80 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className={`truncate ${isCollapsed ? 'lg:hidden' : 'inline'}`}>{item.label}</span>
                  </div>

                  <div className={`flex items-center gap-1.5 ${isCollapsed ? 'lg:hidden' : 'flex'}`}>
                    {item.badge && (
                      <span className="text-[9px] font-bold bg-harvest text-forest px-1.5 py-0.5 rounded-full shrink-0">
                        {item.badge}
                      </span>
                    )}
                    {item.alertCount ? (
                      <span className="text-[10px] font-bold bg-red-500 text-white px-1.5 py-0.5 rounded-full animate-pulse shrink-0">
                        {item.alertCount}
                      </span>
                    ) : null}
                  </div>

                  {/* Collapsed Alert badge dot on desktop rail */}
                  {isCollapsed && item.alertCount ? (
                    <span className="hidden lg:block absolute top-1 right-2 w-2 h-2 rounded-full bg-red-400 animate-pulse" />
                  ) : null}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Sidebar: Logout & Shop Link */}
        <div className={`p-2.5 border-t border-white/10 space-y-1 shrink-0 ${isCollapsed ? 'lg:px-1' : ''}`}>
          <Link
            href="/"
            target="_blank"
            title="Public Website"
            className={`flex items-center rounded-lg text-xs font-medium text-white/70 hover:bg-white/10 hover:text-white transition-colors ${
              isCollapsed ? 'lg:justify-center lg:p-2.5' : 'justify-between px-3 py-2'
            }`}
          >
            <span className="flex items-center gap-2">
              <ExternalLink className="w-3.5 h-3.5 shrink-0" />
              <span className={isCollapsed ? 'lg:hidden' : 'inline'}>Public Website</span>
            </span>
            <span className={`text-[10px] text-harvest ${isCollapsed ? 'lg:hidden' : 'inline'}`}>Live</span>
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            title="Sign Out"
            className={`w-full flex items-center rounded-lg text-xs font-bold text-red-300 hover:bg-red-500/20 hover:text-red-200 transition-colors ${
              isCollapsed ? 'lg:justify-center lg:p-2.5' : 'gap-2 px-3 py-2'
            }`}
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span className={isCollapsed ? 'lg:hidden' : 'inline'}>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ── Main Content Area ── */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Top Navbar */}
        <header className="h-14 sm:h-16 bg-white dark:bg-[#0c241b] border-b border-gray-200 dark:border-white/10 px-3 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs shrink-0">
          {/* Left: Mobile Toggle & Title */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 shrink-0"
              aria-label="Open navigation sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="hidden sm:flex items-center text-xs text-gray-500 dark:text-gray-400 font-medium truncate">
              <span className="truncate">{siteConfig.name}</span>
              <span className="mx-2 shrink-0">•</span>
              <span className="text-forest dark:text-cream font-bold truncate">Chapmatali, Dakshin Dinajpur</span>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            {/* Quick Bill Button */}
            <Link
              href="/admin/pos"
              className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-full bg-forest hover:bg-forest/90 dark:bg-leaf dark:hover:bg-leaf/90 text-white text-xs font-bold shadow-xs active:scale-95 transition-all"
            >
              <PlusCircle className="w-3.5 h-3.5 text-harvest shrink-0" />
              <span className="hidden xs:inline">New Bill</span>
              <span className="hidden md:inline">(F2)</span>
            </Link>

            {/* Language Toggle */}
            <button
              type="button"
              onClick={() => {
                const next = lang === 'en' ? 'bn' : 'en';
                setLang(next);
                try {
                  localStorage.setItem('ahammed_language', next);
                  localStorage.setItem('ahammed_lang', next);
                } catch {}
              }}
              className="px-2 py-1.5 rounded-lg border border-gray-200 dark:border-white/15 bg-gray-50 dark:bg-white/5 text-xs font-bold text-forest dark:text-cream hover:border-leaf transition-colors cursor-pointer"
              title="Toggle Bengali / English"
            >
              {lang === 'en' ? 'বাংলা' : 'EN'}
            </button>

            {/* Theme Toggle */}
            <button
              type="button"
              onClick={toggleDarkMode}
              className="p-1.5 sm:p-2 rounded-lg border border-gray-200 dark:border-white/15 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
              title="Toggle Dark Mode"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-harvest" /> : <Moon className="w-4 h-4 text-forest" />}
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main
          className={`flex-1 w-full min-w-0 ${
            pathname === '/admin/pos'
              ? 'p-0 overflow-hidden flex flex-col h-[calc(100dvh-3.5rem)] sm:h-[calc(100dvh-4rem)]'
              : 'p-3 sm:p-4 md:p-6 lg:p-8 max-w-7xl mx-auto overflow-x-hidden'
          }`}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
