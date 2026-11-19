import type { Metadata, Viewport } from "next";
import "./globals.css";
import { siteConfig } from "@/config/site";
import { LanguageProvider } from "@/i18n/provider";
import SmoothScroll from "@/components/motion/SmoothScroll";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import WhatsAppFloat from "@/components/shared/WhatsAppFloat";
import MobileBottomBar from "@/components/layout/MobileBottomBar";

/* ── Viewport Specification (Mobile-First) ──────────────── */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#0B3D2E" },
    { media: "(prefers-color-scheme: dark)", color: "#0A1A14" },
  ],
};

/* ── Font Variables (With Web Font Link Fallback) ────────── */
const inter = { variable: "font-inter" };
const hindSiliguri = { variable: "font-hind-siliguri" };

/* ── SEO Metadata ─────────────────────────────────────────── */
export const metadata: Metadata = {
  title: {
    default: `${siteConfig.name} | Fertilizers & Pesticides in Dakshin Dinajpur`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: [...siteConfig.seoKeywords],
  authors: [{ name: siteConfig.name }],
  creator: siteConfig.name,
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "/",
    title: `${siteConfig.name} - ${siteConfig.tagline}`,
    description: siteConfig.description,
    siteName: siteConfig.name,
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name} - ${siteConfig.tagline}`,
    description: siteConfig.description,
  },
  robots: {
    index: true,
    follow: true,
  },
  other: {
    "google-site-verification": "",
  },
};

/* ── JSON-LD Structured Data ──────────────────────────────── */
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: siteConfig.name,
  description: siteConfig.description,
  telephone: `+91${siteConfig.phone}`,
  email: siteConfig.email,
  address: {
    "@type": "PostalAddress",
    streetAddress: `${siteConfig.address.line1}, ${siteConfig.address.line2}`,
    addressLocality: "Chapmatali",
    addressRegion: siteConfig.address.state,
    postalCode: siteConfig.address.pin,
    addressCountry: "IN",
  },
  openingHours: "Mo-Su 07:00-21:00",
  priceRange: "₹₹",
  image: "/images/shop-front.jpg",
  url: "/",
};

/* ── Root Layout ──────────────────────────────────────────── */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${hindSiliguri.variable} h-full scroll-smooth`}
      suppressHydrationWarning
    >
      <head>
        {/* JSON-LD Structured Data for Local Business SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {/* Preconnect to Google Fonts for faster loading */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col bg-cream dark:bg-dark-bg text-gray-900 dark:text-gray-100 font-sans antialiased transition-colors duration-300">
        <LanguageProvider>
          <SmoothScroll>
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
            <WhatsAppFloat />
            <MobileBottomBar />
          </SmoothScroll>
        </LanguageProvider>
      </body>
    </html>
  );
}
