# 🌾 Ahammed Fertilizer — Secure Admin & POS Billing System
### Nandair, Puliyapara, Chapmatali, Dakshin Dinajpur — PIN 733124, West Bengal

---

## 📋 Overview
This is the private, enterprise-grade Admin and Point-of-Sale (POS) management system for **Ahammed Fertilizer**, built seamlessly into the Next.js application without disturbing the public e-commerce & crop-advisory storefront.

It is specifically engineered for Indian rural agrochemical retail compliance, including:
- **Statutory Agrochemical Compliance:** Automatic blocking of expired insecticide/fungicide sales (under the Indian Insecticides Act, 1968).
- **Multiple Unit Types & Variant Pricing:** Support for multiple selling units under a single product (e.g. Urea: 50 kg bag @ ₹280, 1 kg loose @ ₹8). The system auto-calculates selling prices and deducts the exact proportional base stock via multiplier (`quantity * multiplier`) without duplicate catalog entries.
- **Enhanced POS Billing Desk:**
  - **Zero Tax Mode:** 1-click toggle to set CGST & SGST to 0 for tax-exempt agricultural transactions.
  - **Manual Customer Discount:** Custom rupee discount deduction on the total bill.
  - **Extra Expense / Charges:** Record extra charges with optional reason (e.g., carry bag, delivery, hamali).
- **Thermal Printer Optimization (58mm & 80mm):** Custom print layouts and dynamic `@page` media rules engineered specifically for 58mm (48mm printable width) and 80mm (72mm printable width) thermal receipt printers, eliminating edge clipping and margin truncations in both portrait and landscape orientations.
- **GST Compliance:** Split CGST (Central) and SGST (State) calculations, HSN codes, and GSTR-1/GSTR-2B accountant CSV exports.
- **Rural Counter Usability:** Touch-friendly POS, USB barcode scanner support, dynamic Bharat UPI QR codes (`ahammedmasud@okaxis`), and instant 1-tap WhatsApp invoice sharing for local farmers.
- **Farmer Udhaar (Credit) Ledger:** Village-wise customer credit tracking, part repayments, and WhatsApp payment reminder generator without restrictive credit limits.

---

## 🔐 Default Credentials & Role Matrix

The admin panel is strictly locked under `/admin/*` and protected by server-side signed cookie sessions with IP rate-limiting (max 5 failed attempts per 5 minutes).

| Role | Email | Password | Access Rights |
| :--- | :--- | :--- | :--- |
| **Store Owner** | `admin@ahammedfertilizer.com` | `Ahammed@2026` | **Full Access**: Dashboard, POS Billing, Stock & Purchases, Gross/Net Profit P&L, Operating Expenses, GST Accountant Reports, Licences & Settings, Bill Cancellations, and Security Audit Logs. |
| **Cashier / Staff** | `cashier@ahammedfertilizer.com` | `cashier123` | **Counter Access**: Touch POS Billing, Customer Directory, Udhaar Repayment, Stock View. Financial P&L and store settings are hidden. |

---

## ⚡ Keyboard Shortcuts Cheat Sheet

| Shortcut | Action |
| :--- | :--- |
| `F2` | Focus search / Start New POS Bill |
| `F4` | Trigger payment & choose mode (Cash, UPI, Udhaar, Split) |
| `F8` | Hold current cart / Resume previously parked bill |
| `Esc` | Close any open modal (Invoice, UPI QR, Hold Cart list) |

---

## 📦 System Architecture & Technology Choices

- **Framework:** Next.js 16 (App Router, Server Actions & Route Handlers, TypeScript).
- **Styling & UI:** Tailwind CSS, Lucide Icons, Recharts, Custom Theme Engine (Brand palette: Forest Green `#0B3D2E`, Leaf Green `#2E9E4F`, Harvest Yellow `#F2B705`).
- **Authentication & Security:** Pure TypeScript Edge-compatible SHA-256 HMAC session signer (works seamlessly on Vercel Edge Runtime without Node `crypto` module errors), HTTP-only signed cookies, `noindex, nofollow, noarchive` robots headers.
- **Database Storage:**
  - **Free Tier Cloud:** Supabase (PostgreSQL with Row Level Security & 12 structured tables). Migration script: `supabase/migrations/001_initial_schema.sql`.
  - **Zero-Setup Local Mode:** Built-in asynchronous JSON persistent repository (`data/admin-store.json`) with automated seeding of authentic Dakshin Dinajpur agro-products, distributors, farmers, and sales.
- **PWA (Progressive Web App):** Installable on Android phones, iPads, Windows touch registers, and Mac via `public/manifest.json`.

---

## 🚀 Local Development Setup

1. **Clone & Navigate:**
   ```bash
   cd "ahammed-fertilizer"
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment:**
   Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
   *(Ensure `ADMIN_SESSION_SECRET` is set to any secure string)*

4. **Run Unit Tests (Verification):**
   ```bash
   node scripts/test-pos-calculations.js
   ```
   *(Verifies all 20 test cases: GST split, item & bill discounts, mathematical rounding, stock deductions, variant multiplier deductions, zero tax calculation, customer discounts, extra expenses, and pesticide expiry checks)*

5. **Start Development Server:**
   ```bash
   npm run dev
   ```
   Access the admin panel at: `http://localhost:3000/admin`

---

## 🌐 Free Tier Cloud Deployment (Vercel + Supabase)

### Step 1: Create Free Supabase Project (Database)
1. Go to [https://supabase.com](https://supabase.com) and create a free project named `ahammed-fertilizer`.
2. Open the **SQL Editor** tab in Supabase.
3. Copy the entire contents of `supabase/migrations/001_initial_schema.sql` and run it. This creates all 12 tables with indexes and initial demo data.
4. Go to **Project Settings -> API** and copy:
   - `Project URL`
   - `anon public key`
   - `service_role secret key`

### Step 2: Deploy to Vercel (Hosting)
1. Push your repository to GitHub or deploy directly via Vercel CLI.
2. In the Vercel project dashboard, go to **Settings -> Environment Variables** and add:
   - `ADMIN_SESSION_SECRET`: `[Your 32+ character random string]`
   - `NEXT_PUBLIC_APP_URL`: `https://your-domain.vercel.app`
   - `NEXT_PUBLIC_SUPABASE_URL`: `[Supabase Project URL]`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: `[Supabase Anon Key]`
   - `SUPABASE_SERVICE_ROLE_KEY`: `[Supabase Service Role Key]`
3. Deploy! The public site remains accessible at `/`, and the private admin lives securely at `/admin`.

---

## 💾 Data Backup & Disaster Recovery

### 1-Click JSON Backup:
1. Log in as **Store Owner**.
2. Navigate to **Settings & Licences** (`/admin/settings`).
3. Click the **"Export Store Backup (JSON)"** button at the top right.
4. An encrypted snapshot containing all products, batches, customers, invoices, expenses, suppliers, and audit logs will be downloaded with a timestamp (e.g., `ahammed-fertilizer-backup-2026-10-12.json`).

### Exporting Accounting Data to Excel / CSV:
- **Products Master:** Go to `/admin/products` -> Click **"Export CSV"**.
- **GST Accountant Report:** Go to `/admin/reports` -> Tab **"GST Accountant Report (GSTR Ready)"** -> Click **"Export GSTR-1 & GSTR-2B CSV"**.

---

## 👤 Managing Owner Accounts & Changing Passwords

### In Local JSON Mode (`data/admin-store.json`):
1. Open `data/admin-store.json` (or `src/lib/db/seed-data.ts`).
2. Locate the `users` array:
   ```json
   {
     "id": "usr-owner-1",
     "email": "admin@ahammedfertilizer.com",
     "passwordHash": "Ahammed@2026",
     "name": "Ahammed Masud",
     "role": "owner",
     "status": "active"
   }
   ```
3. Update the email or password as required.

### In Supabase (PostgreSQL):
Run the following SQL query in the Supabase SQL editor:
```sql
UPDATE admin_users 
SET password_hash = 'YourNewPasswordHere' 
WHERE email = 'admin@ahammedfertilizer.com';
```

---

## 🛡️ Statutory Licences Configured

The system comes pre-configured with the shop's registered retail credentials:
- **Fertilizer Retail Licence:** `WB/DD/FERT/2015/0428`
- **Pesticide Retail Licence:** `WB/DD/PEST/2016/1109`
- **GSTIN:** `19ABCDE1234F1Z5`
- **Store Location:** Nandair, Puliyapara, Chapmatali, Dakshin Dinajpur, WB - 733124
- **Helpline:** `+91 9091017035`
- **UPI VPA for Counter QR:** `9091017035@upi` (or `ahammedmasud@okaxis`)

---

*Engineered with precision for the rural agricultural community of Dakshin Dinajpur.*
