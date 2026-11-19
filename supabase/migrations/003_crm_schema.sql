-- ============================================================================
-- AHAMMED FERTILIZER: CRM & FARM INTELLIGENCE PLATFORM SCHEMA
-- Migration: 003_crm_schema.sql
-- Modules: Land & Ponds, Cultivations, Diagnostic Cases, Prescriptions, Follow-ups, Lab Tests
-- ============================================================================

-- 1. ENUMS (Dedicated crm_ prefix)
DO $$ BEGIN
    CREATE TYPE crm_plot_type AS ENUM ('crop_field', 'pond');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE crm_area_unit AS ENUM ('bigha', 'acre', 'decimal');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE crm_cultivation_kind AS ENUM ('crop', 'fish');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE crm_cultivation_status AS ENUM ('active', 'completed', 'abandoned');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE crm_case_category AS ENUM (
        'crop_disease',
        'pest',
        'nutrient_deficiency',
        'soil',
        'pond_water_toxicity',
        'fish_disease',
        'fish_growth',
        'other'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE crm_case_severity AS ENUM ('mild', 'moderate', 'severe', 'critical');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE crm_case_status AS ENUM (
        'open',
        'treated',
        'follow_up_due',
        'resolved',
        'failed',
        'closed'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE crm_followup_status AS ENUM ('pending', 'done', 'no_answer', 'rescheduled');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE crm_followup_outcome AS ENUM (
        'resolved',
        'improved',
        'no_change',
        'worse',
        'product_not_used'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE crm_test_type AS ENUM ('soil', 'pond', 'water');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE crm_test_status AS ENUM (
        'new',
        'scheduled',
        'sample_collected',
        'result_ready',
        'delivered',
        'cancelled'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 2. CRM SETTINGS (Configurable Bigha ratio & Followup intervals)
CREATE TABLE IF NOT EXISTS crm_settings (
    id TEXT PRIMARY KEY DEFAULT 'default',
    bigha_to_decimal NUMERIC(6,2) DEFAULT 33.00 NOT NULL,
    default_followup_days INT DEFAULT 7 NOT NULL,
    category_followup_days JSONB DEFAULT '{
        "crop_disease": 5,
        "pest": 3,
        "nutrient_deficiency": 10,
        "soil": 14,
        "pond_water_toxicity": 2,
        "fish_disease": 4,
        "fish_growth": 15,
        "other": 7
    }'::jsonb NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 3. LAND & POND PLOTS (Linked to existing POS customers table)
CREATE TABLE IF NOT EXISTS crm_land_plots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    type crm_plot_type DEFAULT 'crop_field' NOT NULL,
    location_text TEXT DEFAULT '',
    village TEXT DEFAULT '',
    block TEXT DEFAULT 'Balurghat',
    district TEXT DEFAULT 'Dakshin Dinajpur',
    gps_coordinates TEXT,
    area_value NUMERIC(10,2) NOT NULL CHECK (area_value > 0),
    area_unit crm_area_unit DEFAULT 'decimal' NOT NULL,
    area_in_decimal NUMERIC(10,2) NOT NULL CHECK (area_in_decimal > 0), -- Canonical computed
    water_source TEXT DEFAULT '',
    notes TEXT DEFAULT '',
    created_by UUID,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    deleted_at TIMESTAMPTZ
);

-- 4. CULTIVATIONS (Crop or Fish species per plot)
CREATE TABLE IF NOT EXISTS crm_cultivations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plot_id UUID REFERENCES crm_land_plots(id) ON DELETE CASCADE NOT NULL,
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE NOT NULL,
    kind crm_cultivation_kind NOT NULL,
    crop_or_species_name TEXT NOT NULL,
    variety TEXT DEFAULT '',
    start_date DATE NOT NULL,
    expected_end_date DATE,
    actual_end_date DATE,
    status crm_cultivation_status DEFAULT 'active' NOT NULL,
    season TEXT DEFAULT 'Aman' NOT NULL,
    notes TEXT DEFAULT '',
    created_by UUID,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    deleted_at TIMESTAMPTZ
);

-- 5. FARM CASES (Diagnostic Notes)
CREATE TABLE IF NOT EXISTS crm_cases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_number TEXT UNIQUE NOT NULL, -- e.g. CASE-2026-0001
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE NOT NULL,
    plot_id UUID REFERENCES crm_land_plots(id) ON DELETE RESTRICT NOT NULL,
    cultivation_id UUID REFERENCES crm_cultivations(id) ON DELETE SET NULL,
    category crm_case_category NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    observed_on DATE NOT NULL,
    severity crm_case_severity DEFAULT 'moderate' NOT NULL,
    status crm_case_status DEFAULT 'open' NOT NULL,
    created_by UUID,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    deleted_at TIMESTAMPTZ
);

-- 6. CASE MEDIA (Photos/Videos metadata)
CREATE TABLE IF NOT EXISTS crm_case_media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID REFERENCES crm_cases(id) ON DELETE CASCADE NOT NULL,
    storage_path TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_type TEXT NOT NULL,
    size_bytes BIGINT NOT NULL,
    caption TEXT DEFAULT '',
    uploaded_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 7. PRESCRIPTIONS & ITEMS (Linked to existing POS products)
CREATE TABLE IF NOT EXISTS crm_prescriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID REFERENCES crm_cases(id) ON DELETE CASCADE NOT NULL,
    prescribed_on DATE NOT NULL,
    prescribed_by UUID,
    notes TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS crm_prescription_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    prescription_id UUID REFERENCES crm_prescriptions(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL, -- FK to existing products
    product_name TEXT NOT NULL,
    is_custom_item BOOLEAN DEFAULT FALSE NOT NULL,
    quantity NUMERIC(10,2) NOT NULL CHECK (quantity > 0),
    unit TEXT NOT NULL,
    dose_instructions TEXT NOT NULL,
    application_method TEXT DEFAULT 'Foliar Spray' NOT NULL,
    interval_days INT DEFAULT 7,
    number_of_applications INT DEFAULT 1
);

-- 8. FOLLOW-UPS (Automated call reminders)
CREATE TABLE IF NOT EXISTS crm_followups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID REFERENCES crm_cases(id) ON DELETE CASCADE NOT NULL,
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE NOT NULL,
    due_date DATE NOT NULL,
    status crm_followup_status DEFAULT 'pending' NOT NULL,
    called_by UUID,
    called_on TIMESTAMPTZ,
    outcome crm_followup_outcome,
    customer_feedback TEXT,
    satisfaction_rating INT CHECK (satisfaction_rating >= 1 AND satisfaction_rating <= 5),
    next_action TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    deleted_at TIMESTAMPTZ
);

-- 9. CASE REVISION AUDIT (Never silently overwrite case outcome)
CREATE TABLE IF NOT EXISTS crm_case_revisions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID REFERENCES crm_cases(id) ON DELETE CASCADE NOT NULL,
    revision_number INT NOT NULL,
    previous_status crm_case_status NOT NULL,
    new_status crm_case_status NOT NULL,
    changed_by UUID,
    reason TEXT,
    snapshot JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 10. LAB TEST REQUESTS & RESULTS
CREATE TABLE IF NOT EXISTS crm_test_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_number TEXT UNIQUE NOT NULL, -- e.g. TEST-2026-0001
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    customer_name TEXT NOT NULL,
    customer_mobile TEXT NOT NULL,
    customer_village TEXT NOT NULL,
    test_type crm_test_type NOT NULL,
    plot_details TEXT,
    preferred_date DATE,
    address TEXT,
    notes TEXT,
    photo_url TEXT,
    status crm_test_status DEFAULT 'new' NOT NULL,
    assigned_to UUID,
    price NUMERIC(10,2) DEFAULT 0.00 NOT NULL,
    payment_status TEXT DEFAULT 'pending' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS crm_test_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID REFERENCES crm_test_requests(id) ON DELETE CASCADE NOT NULL,
    tested_on DATE NOT NULL,
    tested_by UUID,
    method_or_instrument TEXT NOT NULL,
    parameters JSONB NOT NULL, -- Key-value parameter list
    recommendation_text TEXT NOT NULL,
    attachment_path TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 11. CRM AUDIT LOG
CREATE TABLE IF NOT EXISTS crm_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    user_email TEXT NOT NULL,
    user_role TEXT NOT NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT,
    details JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_crm_plots_customer ON crm_land_plots(customer_id);
CREATE INDEX IF NOT EXISTS idx_crm_cultivations_plot ON crm_cultivations(plot_id);
CREATE INDEX IF NOT EXISTS idx_crm_cultivations_customer ON crm_cultivations(customer_id);
CREATE INDEX IF NOT EXISTS idx_crm_cases_customer ON crm_cases(customer_id);
CREATE INDEX IF NOT EXISTS idx_crm_cases_plot ON crm_cases(plot_id);
CREATE INDEX IF NOT EXISTS idx_crm_cases_status ON crm_cases(status);
CREATE INDEX IF NOT EXISTS idx_crm_cases_category ON crm_cases(category);
CREATE INDEX IF NOT EXISTS idx_crm_followups_due ON crm_followups(due_date);
CREATE INDEX IF NOT EXISTS idx_crm_followups_case ON crm_followups(case_id);
CREATE INDEX IF NOT EXISTS idx_crm_followups_status ON crm_followups(status);
CREATE INDEX IF NOT EXISTS idx_crm_presc_items_prod ON crm_prescription_items(product_id);
CREATE INDEX IF NOT EXISTS idx_crm_test_req_status ON crm_test_requests(status);
CREATE INDEX IF NOT EXISTS idx_crm_test_req_mobile ON crm_test_requests(customer_mobile);
