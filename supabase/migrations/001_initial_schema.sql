-- ============================================================================
-- AHAMMED FERTILIZER: POSTGRESQL / SUPABASE DATABASE SCHEMA
-- Shop: Nandair, Puliyapara, Chapmatali, Dakshin Dinajpur, West Bengal 733124
-- ============================================================================

-- 1. EXTENSIONS & ENUMS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('owner', 'cashier');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE unit_type AS ENUM ('kg', 'g', 'litre', 'ml', 'packet', 'bag', 'bottle', 'piece');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE movement_type AS ENUM ('purchase', 'sale', 'adjustment_add', 'adjustment_sub', 'damage', 'expired', 'return');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE payment_status AS ENUM ('paid', 'partial', 'due');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE payment_mode AS ENUM ('cash', 'upi', 'card', 'credit', 'split');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE bill_status AS ENUM ('completed', 'cancelled', 'refunded', 'on_hold');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE ledger_type AS ENUM ('bill_credit', 'payment_received', 'adjustment');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE expense_category AS ENUM ('rent', 'electricity', 'transport', 'salary', 'packaging', 'tea_refreshment', 'licence_fees', 'maintenance', 'other');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 2. USER PROFILES
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT DEFAULT '',
    role user_role DEFAULT 'cashier' NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 3. STORE SETTINGS
CREATE TABLE IF NOT EXISTS shop_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shop_name TEXT DEFAULT 'Ahammed Fertilizer' NOT NULL,
    shop_name_bn TEXT DEFAULT 'আহাম্মেদ ফার্টিলাইজার' NOT NULL,
    tagline TEXT DEFAULT 'Your Trusted Partner in Agriculture',
    tagline_bn TEXT DEFAULT 'কৃষিতে আপনার বিশ্বস্ত সঙ্গী',
    phone TEXT DEFAULT '9091017035' NOT NULL,
    email TEXT DEFAULT 'abmasud128@gmail.com',
    address_line1 TEXT DEFAULT 'Nandair, Puliyapara',
    address_line2 TEXT DEFAULT 'Chapmatali, Dakshin Dinajpur',
    state TEXT DEFAULT 'West Bengal',
    pin_code TEXT DEFAULT '733124',
    gstin TEXT DEFAULT '',
    fertilizer_licence TEXT DEFAULT '',
    pesticide_licence TEXT DEFAULT '',
    seeds_licence TEXT DEFAULT '',
    upi_id TEXT DEFAULT '9091017035@upi',
    invoice_prefix TEXT DEFAULT 'AF-2026-',
    next_invoice_number INT DEFAULT 1001 NOT NULL,
    low_stock_default INT DEFAULT 10 NOT NULL,
    thermal_printer_size TEXT DEFAULT '80mm',
    terms_conditions TEXT DEFAULT 'Goods once sold will not be taken back without original bill. Store pesticides safely away from children.',
    terms_conditions_bn TEXT DEFAULT 'রসিদ ছাড়া পণ্য ফেরত নেওয়া হবে না। কীটনাশক শিশুদের নাগালের বাইরে রাখুন।',
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 4. CATEGORIES
CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    name_bn TEXT NOT NULL,
    icon TEXT DEFAULT '🌱',
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE NOT NULL
);

-- 5. PRODUCTS MASTER
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    name_bn TEXT DEFAULT '',
    brand TEXT NOT NULL,
    category_id TEXT REFERENCES categories(id) ON DELETE RESTRICT NOT NULL,
    unit unit_type DEFAULT 'packet' NOT NULL,
    pack_size TEXT DEFAULT '1 kg' NOT NULL,
    hsn_code TEXT DEFAULT '',
    gst_rate NUMERIC(5, 2) DEFAULT 0.00 NOT NULL,
    purchase_price NUMERIC(10, 2) DEFAULT 0.00 NOT NULL,
    selling_price NUMERIC(10, 2) DEFAULT 0.00 NOT NULL,
    mrp NUMERIC(10, 2) DEFAULT 0.00 NOT NULL,
    barcode TEXT UNIQUE,
    low_stock_threshold INT DEFAULT 10 NOT NULL,
    is_pesticide BOOLEAN DEFAULT FALSE NOT NULL,
    safety_notes TEXT DEFAULT '',
    safety_notes_bn TEXT DEFAULT '',
    image_url TEXT DEFAULT '',
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 6. PRODUCT BATCHES & EXPIRY
CREATE TABLE IF NOT EXISTS product_batches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
    batch_number TEXT NOT NULL,
    manufacturing_date DATE,
    expiry_date DATE NOT NULL,
    purchase_price NUMERIC(10, 2) NOT NULL,
    selling_price NUMERIC(10, 2) NOT NULL,
    mrp NUMERIC(10, 2) NOT NULL,
    quantity_available NUMERIC(10, 2) DEFAULT 0.00 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(product_id, batch_number)
);

-- 7. STOCK MOVEMENTS
CREATE TABLE IF NOT EXISTS stock_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id) ON DELETE RESTRICT NOT NULL,
    batch_id UUID REFERENCES product_batches(id) ON DELETE SET NULL,
    type movement_type NOT NULL,
    quantity NUMERIC(10, 2) NOT NULL,
    balance_after NUMERIC(10, 2) NOT NULL,
    reference_id UUID,
    reason TEXT DEFAULT '',
    performed_by UUID,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 8. SUPPLIERS & PURCHASES
CREATE TABLE IF NOT EXISTS suppliers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT DEFAULT '',
    address TEXT DEFAULT '',
    gstin TEXT DEFAULT '',
    opening_balance NUMERIC(10, 2) DEFAULT 0.00 NOT NULL,
    current_due NUMERIC(10, 2) DEFAULT 0.00 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS purchases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    supplier_id UUID REFERENCES suppliers(id) ON DELETE RESTRICT NOT NULL,
    invoice_no TEXT NOT NULL,
    purchase_date DATE NOT NULL,
    subtotal NUMERIC(10, 2) NOT NULL,
    tax_total NUMERIC(10, 2) DEFAULT 0.00 NOT NULL,
    grand_total NUMERIC(10, 2) NOT NULL,
    payment_status payment_status DEFAULT 'paid' NOT NULL,
    amount_paid NUMERIC(10, 2) DEFAULT 0.00 NOT NULL,
    amount_due NUMERIC(10, 2) DEFAULT 0.00 NOT NULL,
    notes TEXT DEFAULT '',
    created_by UUID,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS purchase_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    purchase_id UUID REFERENCES purchases(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES products(id) ON DELETE RESTRICT NOT NULL,
    batch_number TEXT NOT NULL,
    mfg_date DATE,
    exp_date DATE NOT NULL,
    quantity NUMERIC(10, 2) NOT NULL,
    unit_cost NUMERIC(10, 2) NOT NULL,
    gst_rate NUMERIC(5, 2) DEFAULT 0.00 NOT NULL,
    gst_amount NUMERIC(10, 2) DEFAULT 0.00 NOT NULL,
    total_cost NUMERIC(10, 2) NOT NULL
);

-- 9. CUSTOMERS
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    phone TEXT NOT NULL UNIQUE,
    village TEXT DEFAULT '',
    credit_limit NUMERIC(10, 2) DEFAULT 50000.00 NOT NULL,
    current_due NUMERIC(10, 2) DEFAULT 0.00 NOT NULL,
    notes TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 10. SALES & POS BILLING
CREATE TABLE IF NOT EXISTS sales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_number TEXT UNIQUE NOT NULL,
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    customer_name TEXT NOT NULL,
    customer_phone TEXT DEFAULT '',
    customer_village TEXT DEFAULT '',
    subtotal NUMERIC(10, 2) NOT NULL,
    discount_amount NUMERIC(10, 2) DEFAULT 0.00 NOT NULL,
    cgst_amount NUMERIC(10, 2) DEFAULT 0.00 NOT NULL,
    sgst_amount NUMERIC(10, 2) DEFAULT 0.00 NOT NULL,
    total_tax NUMERIC(10, 2) DEFAULT 0.00 NOT NULL,
    round_off NUMERIC(5, 2) DEFAULT 0.00 NOT NULL,
    grand_total NUMERIC(10, 2) NOT NULL,
    total_cost NUMERIC(10, 2) DEFAULT 0.00 NOT NULL,
    gross_profit NUMERIC(10, 2) DEFAULT 0.00 NOT NULL,
    payment_mode payment_mode DEFAULT 'cash' NOT NULL,
    cash_amount NUMERIC(10, 2) DEFAULT 0.00 NOT NULL,
    upi_amount NUMERIC(10, 2) DEFAULT 0.00 NOT NULL,
    card_amount NUMERIC(10, 2) DEFAULT 0.00 NOT NULL,
    credit_amount NUMERIC(10, 2) DEFAULT 0.00 NOT NULL,
    status bill_status DEFAULT 'completed' NOT NULL,
    cancelled_reason TEXT DEFAULT '',
    cancelled_by UUID,
    cashier_id UUID,
    notes TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS sale_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sale_id UUID REFERENCES sales(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES products(id) ON DELETE RESTRICT NOT NULL,
    batch_id UUID REFERENCES product_batches(id) ON DELETE SET NULL,
    product_name TEXT NOT NULL,
    hsn_code TEXT DEFAULT '',
    quantity NUMERIC(10, 2) NOT NULL,
    unit TEXT NOT NULL,
    unit_price NUMERIC(10, 2) NOT NULL,
    discount NUMERIC(10, 2) DEFAULT 0.00 NOT NULL,
    gst_rate NUMERIC(5, 2) DEFAULT 0.00 NOT NULL,
    cgst_amount NUMERIC(10, 2) DEFAULT 0.00 NOT NULL,
    sgst_amount NUMERIC(10, 2) DEFAULT 0.00 NOT NULL,
    total_amount NUMERIC(10, 2) NOT NULL,
    unit_cost NUMERIC(10, 2) NOT NULL
);

-- 11. CUSTOMER CREDIT TRANSACTIONS
CREATE TABLE IF NOT EXISTS customer_ledger (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE NOT NULL,
    sale_id UUID REFERENCES sales(id) ON DELETE SET NULL,
    type ledger_type NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    balance_after NUMERIC(10, 2) NOT NULL,
    payment_mode TEXT DEFAULT 'cash',
    notes TEXT DEFAULT '',
    recorded_by UUID,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 12. EXPENSES
CREATE TABLE IF NOT EXISTS expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category expense_category NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    payment_mode TEXT DEFAULT 'cash' NOT NULL,
    description TEXT NOT NULL,
    expense_date DATE NOT NULL,
    recorded_by UUID,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 13. AUDIT LOGS
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    user_email TEXT NOT NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT,
    details JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_products_barcode ON products(barcode);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_batches_expiry ON product_batches(expiry_date);
CREATE INDEX IF NOT EXISTS idx_sales_created_at ON sales(created_at);
CREATE INDEX IF NOT EXISTS idx_sales_customer ON sales(customer_id);
CREATE INDEX IF NOT EXISTS idx_sales_invoice ON sales(invoice_number);
CREATE INDEX IF NOT EXISTS idx_stock_movements_prod ON stock_movements(product_id);
