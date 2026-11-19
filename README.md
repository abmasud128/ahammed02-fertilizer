# 🌾 Ahammed Fertilizer (আহাম্মেদ ফার্টিলাইজার)
### Production-Ready Agritech Web Platform

A complete, modern, bilingual (English & Bengali) web portal built for **Ahammed Fertilizer**, a trusted fertilizer and pesticide retail store based in **Nandair, Puliyapara, Chapmatali, Dakshin Dinajpur, West Bengal (PIN: 733124)**.

Designed with a high-performance, mobile-first architecture for local farmers on standard 3G/4G connections, featuring lightweight 3D graphics (React Three Fiber), Framer Motion interactions, bilingual localization, statutory pesticide compliance, and instant one-tap WhatsApp / Call consultation.

---

## 🌟 Key Features

1. **Interactive 3D Agritech Hero Scene**:
   - Built with Three.js, React Three Fiber & Drei.
   - Low-poly fertilizer bags, pesticide bottles, soil sprout mound, and drifting pollen/water particles.
   - Mouse & device gyroscope parallax with automated fallbacks for low-end mobile devices (`navigator.hardwareConcurrency < 4` or slow connections).
2. **Complete Bilingual Experience (English & বাংলা)**:
   - Instant language switcher in the navbar with persistent preference.
   - Proper West Bengal Bengali agricultural terminology (`Hind Siliguri` & `Inter` Google fonts).
3. **Product Catalogue (Enquiry-Based)**:
   - Filterable & searchable across 8 categories: Fertilizers, Micronutrients, Insecticides, Fungicides, Herbicides, Seeds, Crop Protection, and Equipment.
   - Compliant with Indian Agrochemical Retail laws: **No direct online checkout**; instead, integrated with **"Enquire on WhatsApp"** pre-filled consultation links and phone orders.
   - Detailed product view with composition, dosage guidelines, application schedule, precautions, and suitable crops.
4. **Crop-Wise Nutrition & Protection Guides**:
   - Dedicated growth-stage advisory for local crops: **Paddy (ধান), Jute (পাট), Potato (আলু), Mustard (সর্ষে), Wheat (গম), Maize (ভুট্টা), Vegetables (সবজি), Mango (আম), Banana (কলা)**.
   - Stage-by-stage product recommendations linked directly to inventory.
5. **Farmer-Centric Quick Actions**:
   - One-tap sticky actions: **Call Now (`+91 9091017035`)**, **WhatsApp**, **Google Maps Directions**.
   - Floating pulse WhatsApp button with pre-filled enquiry template.
6. **Statutory Safety & Compliance Notices**:
   - Mandatory statutory advisory: *"Read the label carefully before use. Use protective gear. Keep out of reach of children."* displayed on chemical products, catalogue headers, contact page, and site footer.
   - Display of authorized retail pesticide and fertilizer licence numbers on the About page and footer.
7. **Admin Portal (`/admin`)**:
   - Protected by store master password.
   - Customer enquiry lead tracker and inventory status overview.
8. **SEO & Accessibility**:
   - Automated LocalBusiness JSON-LD schema for Google Maps and local search.
   - Optimized metadata targeting Dakshin Dinajpur agro-retail keywords.

---

## 🚀 Quick Start Guide (Run Locally)

### Prerequisites
- **Node.js**: v18.18.0 or newer (v24 LTS recommended)
- **npm** or **pnpm**

### Step-by-Step Installation

1. Open PowerShell or Terminal in the project directory:
   ```bash
   cd "ahammed-fertilizer"
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

### Production Build & Launch
To test the optimized production build:
```bash
npm run build
npm run start
```

---

## 🛠️ How to Update Content (Store Owner Guide)

### 1. Changing Store Details (Phone, Address, Hours, Licences)
Edit `src/config/site.ts`. This is the **single source of truth**:
```typescript
export const siteConfig = {
  name: 'Ahammed Fertilizer',
  phone: '9091017035',             // Phone number for direct calls
  whatsapp: '919091017035',        // WhatsApp number with country code (91)
  email: 'abmasud128@gmail.com',   // Store email
  hours: 'Every Day: 7:00 AM – 9:00 PM',
  licences: [
    'Licence No: XXXXXXXXXXXXXX',
    'Registration No: XXXXXXXXXXXXXXX',
  ],
  ...
};
```
Configure `/admin` credentials with `ADMIN_LOGIN_EMAIL` and `ADMIN_LOGIN_PASSWORD`; do not store passwords in this file.

### 2. Adding or Modifying Products
Edit `src/data/products.ts`. You can add, edit, or adjust pricing, pack sizes, and dosages for any item:
```typescript
{
  id: 'npk-19-19-19',
  slug: 'npk-19-19-19-water-soluble',
  name: 'NPK 19:19:19 Water Soluble',
  namebn: 'এনপিকে ১৯:১৯:১৯ জলে দ্রবণীয় সার',
  brand: 'Standard Grade Agro',
  category: 'fertilizers',
  price: '₹140 - ₹1,350',
  packSizes: ['1 kg', '5 kg', '25 kg'],
  featured: true,
  isPesticide: false,
  ...
}
```

### 3. Updating Seasonal Offers & Schemes
Edit `src/data/offers.ts`. Seasonal discounts displayed on the home page banner and the Offers page can be updated here:
```typescript
{
  id: 'kharif-fertilizer-scheme',
  title: 'Kharif Sowing Fertilizer Bundle',
  discount: 'Up to 10% Off on Bulk Bookings',
  validUntil: 'October 31',
  ...
}
```

### 4. Updating Crop Advisory Schedules
Edit `src/data/crops.ts` to adjust recommended products, stage dosages, or add new crops.

---

## 🔐 Admin Panel Access

1. Open your browser to: `http://localhost:3000/admin`
2. Sign in with the owner credentials configured by `ADMIN_LOGIN_EMAIL` and `ADMIN_LOGIN_PASSWORD`.
3. Optionally configure a cashier account with `CASHIER_LOGIN_EMAIL` and `CASHIER_LOGIN_PASSWORD`.
4. View received farmer enquiry messages, customer phone numbers, village areas, and crop issues submitted via the contact form.

---

## ☁️ Deployment & Go-Live Requirements

The public-facing site can be hosted, but the admin POS, CRM, aquaculture portal, and enquiries currently write JSON files under the project `data/` directory. They need a persistent writable disk; serverless function storage is temporary and may not be shared between instances. Do not use a static export or deploy the current data layer to Vercel/Netlify as-is for live records.

With the current storage implementation, use a Node.js host or VPS with persistent disk storage. Build with `npm run build` and start with `npm start`; mount and back up the `data/` directory. Configure `ADMIN_SESSION_SECRET` (at least 32 random characters) and unique `ADMIN_LOGIN_EMAIL` / `ADMIN_LOGIN_PASSWORD` values (at least 12 password characters) in the host's environment settings. Set the cashier variables only if cashier access is needed. Never commit `.env.local` or `data/`.

Vercel and other serverless platforms are viable after the file-backed repositories are migrated to a durable database. The Supabase variables formerly shown in `.env.example` are not currently connected to these repositories. GitHub can store the source and trigger a host's deployment, but GitHub Pages cannot run this app's server APIs.

---

## 📁 Project Architecture & Structure

```
ahammed-fertilizer/
├── public/                     # Static assets, fonts, icons
├── scripts/
│   └── take-screenshots.mjs    # Automated headless browser screenshot runner
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Root layout with fonts, JSON-LD, Navbar, Footer
│   │   ├── page.tsx            # Home page (3D hero, categories, why-us, FAQ, CTA)
│   │   ├── products/
│   │   │   ├── page.tsx        # Filterable & searchable product catalogue
│   │   │   └── [slug]/page.tsx # Detailed product specifications & dosage guide
│   │   ├── crop-guide/
│   │   │   ├── page.tsx        # Overview of crops grown in Dakshin Dinajpur
│   │   │   └── [crop]/page.tsx # Growth timeline with product recommendations
│   │   ├── about/page.tsx      # Shop heritage, owner message, licences, values
│   │   ├── offers/page.tsx     # Seasonal discounts & promotional schemes
│   │   ├── gallery/page.tsx    # Store & field photo gallery with lightbox modal
│   │   ├── contact/page.tsx    # Enquiry form, Google map, directions, phone/hours
│   │   ├── admin/page.tsx      # Password-authenticated store manager portal
│   │   └── api/
│   │       └── enquiries/      # REST API route for contact enquiries
│   ├── components/
│   │   ├── layout/             # Sticky Navbar, MobileMenu, 4-column Footer
│   │   ├── shared/             # WhatsAppFloat, QuickActions, LanguageToggle, DarkMode
│   │   ├── ui/                 # Button, Card (3D tilt), Badge, SectionHeading, Input, Modal
│   │   ├── three/              # HeroScene (React Three Fiber), ProductViewer
│   │   └── motion/             # AnimatedCounter, ScrollReveal, Marquee, Stagger
│   ├── config/
│   │   └── site.ts             # Central store profile & contact configuration
│   ├── data/                   # Realistic seed datasets (products, crops, offers, reviews)
│   ├── i18n/                   # Language provider & en.json / bn.json translations
│   └── lib/
│       └── utils.ts            # Formatting & WhatsApp URL builder utilities
├── next.config.ts              # Turbopack, image optimization & security headers
├── package.json
└── README.md
```

---

## 🌾 Designed with Care for Indian Farmers
- Fast initial page load under 500ms
- Light & dark themes
- Fully responsive across 360px mobile to 4K displays
- Clean, maintainable, production-ready code


---

## 🐟 Aquaculture Farmer Intelligence Platform (মাছ চাষ প্ল্যাটফর্ম)

The website includes an integrated, mobile-first **Aquaculture Farmer Intelligence Platform** serving fish farmers across **Dakshin Dinajpur, West Bengal**.

### 1. Structure & Routes
- **Public Shop Website**:
  - `https://yourdomain.com/aquaculture`: Public aquaculture knowledge hub covering carp polyculture, water parameters (pH, DO, depth), stocking density, and feeding guidelines.
  - Navbar link: `মাছ চাষ / Aquaculture`
  - Farmer Portal Button: One-click jump to `/farmer/login`.
- **Farmer Portal (Mobile-First, Bengali Default)**:
  - `/farmer/login`: Sign in with 10-digit mobile number + OTP or 4-digit PIN.
  - `/farmer/register`: Registration with mandatory consent logging, Dakshin Dinajpur blocks/villages, and duplicate detection.
  - `/farmer/dashboard`: Personal pond count, total water area in decimals/acres, active production cycles, and quick entry cards.
  - `/farmer/ponds`: Ponds manager (area in decimals, depth, water source, soil type, drainage, aeration, draft saving).
  - `/farmer/cycles`: Production cycle tracker with strict cycle overlap prevention.
  - `/farmer/stocking`: Fingerling stocking logger (species, counts, avg weight in grams, cost, estimated flag).
- **Staff / Shop Desk (POS Integration)**:
  - Accessible via existing staff login (`owner` / `cashier`) under `/admin/aqua`.
  - Metrics overview, village/block filters, assisted farmer registration, and verification queue.

### 2. Database Migrations & Seeding
All aquaculture tables use the strict `aqua_` prefix to guarantee zero collision with POS billing tables:
- **Migration SQL**: `supabase/migrations/002_aquaculture_schema.sql`
- **Tables Created**:
  - Masters: `aqua_districts`, `aqua_blocks`, `aqua_villages`, `aqua_species`, `aqua_feed_brands`
  - Farmer & Farm: `aqua_farmers`, `aqua_farmer_duplicates`, `aqua_ponds`, `aqua_production_cycles`, `aqua_cycle_stocking`
  - Phase 1 & Full Schema: `aqua_feed_events`, `aqua_water_quality_readings`, `aqua_problem_reports`, `aqua_interventions`, `aqua_intervention_followups`, `aqua_growth_samples`, `aqua_mortality_events`, `aqua_harvests`, `aqua_expenses`, `aqua_sales`
  - Auditing & Compliance: `aqua_record_revisions` (never silently overwrite), `aqua_consent_logs`, `aqua_attachments`, `aqua_audit_logs`.
- **Seed Data**: Includes Dakshin Dinajpur blocks (Balurghat, Hili, Kumarganj, Gangarampur, Banshihari, Harirampur, Kushmandi, Tapan), local villages, and fish species (Rohu, Catla, Mrigal, Silver Carp, Grass Carp, Common Carp, Magur, Singhi, Pabda, Tilapia, Pangas).

To apply migrations to your production PostgreSQL / Supabase database:
```bash
# Using Supabase CLI:
supabase db push
# Or run 002_aquaculture_schema.sql in the Supabase SQL Editor
```

### 3. Roles and Security (Row-Level Security)
- **Roles**: `super_admin`, `business_admin`, `shop_operator`, `technical_staff`, `farmer`.
- **Data Isolation**: Farmers can only access their own records. Server-side authorization guards strictly prevent Farmer A from reading or modifying Farmer B's ponds or stocking records.
- **POS Boundary**: Farmers have isolated cookies (`ahammed_farmer_session`) and are permanently blocked from reaching `/admin/*` or `/admin/pos`.
- **Audit Revisions**: Any updates to stocking or pond records automatically log previous and updated snapshots to `aqua_record_revisions`.

### 4. How to Add a New SMS Provider (Provider-Agnostic OTP)
In `src/lib/aqua/auth.ts`, implement the `SmsOtpProvider` interface:

```typescript
import { SmsOtpProvider, SmsOtpResult, setOtpProvider } from '@/lib/aqua/auth';

export class CustomSmsProvider implements SmsOtpProvider {
  async sendOtp(mobileNumber: string, otp: string): Promise<SmsOtpResult> {
    const res = await fetch('https://api.your-sms-provider.com/send', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${process.env.SMS_API_KEY}` },
      body: JSON.stringify({ to: `+91${mobileNumber}`, text: `Your Ahammed Fertilizer OTP is ${otp}` })
    });
    return { success: res.ok };
  }
}

// Set as active provider:
setOtpProvider(new CustomSmsProvider());
```

By default in development, the system runs with `MockSmsOtpProvider` (logs OTP to terminal and allows test OTP `123456`), enabling immediate local testing without external SMS billing.
