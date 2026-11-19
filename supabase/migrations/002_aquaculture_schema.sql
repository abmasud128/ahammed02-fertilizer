-- ============================================================================
-- AHAMMED FERTILIZER: AQUACULTURE FARMER INTELLIGENCE PLATFORM SCHEMA
-- Stage 1 Foundation & Full-System Schema
-- District: Dakshin Dinajpur, West Bengal 733124
-- ============================================================================

-- 1. ENUMS (Dedicated aqua_ prefix to avoid clash with POS enums)
DO $$ BEGIN
    CREATE TYPE aqua_user_role AS ENUM ('super_admin', 'business_admin', 'shop_operator', 'technical_staff', 'farmer');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE aqua_verification_status AS ENUM ('pending', 'verified', 'rejected', 'corrected');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE aqua_data_quality AS ENUM ('verified_count', 'estimated', 'unknown');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE aqua_water_source AS ENUM ('rainfed', 'borewell', 'canal', 'river', 'mixed');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE aqua_soil_type AS ENUM ('clay', 'loam', 'sandy_clay', 'alluvial', 'other');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE aqua_pond_status AS ENUM ('active', 'drying', 'prepared', 'fallow', 'under_treatment');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE aqua_cycle_status AS ENUM ('planned', 'active', 'completed', 'terminated');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE aqua_seed_stage AS ENUM ('spawn', 'fry', 'fingerling', 'yearling');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE aqua_problem_category AS ENUM ('disease', 'water_quality', 'mortality', 'feed_refusal', 'predator', 'flooding', 'other');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE aqua_severity AS ENUM ('mild', 'moderate', 'severe', 'critical');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE aqua_followup_interval AS ENUM ('24h', '48h', '7_day');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE aqua_condition_status AS ENUM ('improved', 'no_change', 'worsened', 'resolved');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE aqua_harvest_type AS ENUM ('partial', 'final');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE aqua_expense_category AS ENUM ('feed', 'seed', 'labor', 'medicine_chemical', 'electricity_fuel', 'pond_prep', 'netting', 'equipment', 'other');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE aqua_buyer_type AS ENUM ('local_wholesaler', 'retail_market', 'trader', 'direct_consumer');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 2. GEO MASTER (Dakshin Dinajpur & West Bengal)
CREATE TABLE IF NOT EXISTS aqua_districts (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    name_bn TEXT NOT NULL,
    state TEXT DEFAULT 'West Bengal' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS aqua_blocks (
    id TEXT PRIMARY KEY,
    district_id TEXT REFERENCES aqua_districts(id) ON DELETE RESTRICT NOT NULL,
    name TEXT NOT NULL,
    name_bn TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS aqua_villages (
    id TEXT PRIMARY KEY,
    block_id TEXT REFERENCES aqua_blocks(id) ON DELETE RESTRICT NOT NULL,
    name TEXT NOT NULL,
    name_bn TEXT NOT NULL,
    pin_code TEXT DEFAULT '733124',
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 3. SPECIES MASTER (Extensible beyond carp)
CREATE TABLE IF NOT EXISTS aqua_species (
    id TEXT PRIMARY KEY,
    scientific_name TEXT NOT NULL,
    name_en TEXT NOT NULL,
    name_bn TEXT NOT NULL,
    common_name TEXT NOT NULL,
    category TEXT DEFAULT 'carp' NOT NULL,
    ideal_ph_min NUMERIC(4,2) DEFAULT 6.5,
    ideal_ph_max NUMERIC(4,2) DEFAULT 8.5,
    ideal_temp_min_c NUMERIC(4,2) DEFAULT 24.0,
    ideal_temp_max_c NUMERIC(4,2) DEFAULT 32.0,
    ideal_do_min_ppm NUMERIC(4,2) DEFAULT 4.0,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 4. FARMERS MASTER
CREATE TABLE IF NOT EXISTS aqua_farmers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    registration_number TEXT UNIQUE NOT NULL, -- e.g. FARMER-2026-0001
    full_name TEXT NOT NULL,
    mobile_number TEXT UNIQUE NOT NULL,
    pin TEXT, -- Bcrypt hashed PIN for shop-operator assisted login
    district_id TEXT REFERENCES aqua_districts(id) ON DELETE RESTRICT NOT NULL,
    block_id TEXT REFERENCES aqua_blocks(id) ON DELETE RESTRICT NOT NULL,
    village_id TEXT REFERENCES aqua_villages(id) ON DELETE RESTRICT NOT NULL,
    village_name TEXT DEFAULT '',
    address TEXT DEFAULT '',
    pin_code TEXT DEFAULT '733124' NOT NULL,
    experience_years INT DEFAULT 1 NOT NULL,
    pond_count INT DEFAULT 1 NOT NULL,
    total_water_area_decimal NUMERIC(10,2) DEFAULT 0.00 NOT NULL, -- 100 decimal = 1 acre
    -- Consent
    consent_data_collection BOOLEAN DEFAULT TRUE NOT NULL,
    consent_data_sharing BOOLEAN DEFAULT FALSE NOT NULL,
    consent_photo_use BOOLEAN DEFAULT FALSE NOT NULL,
    consent_timestamp TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    -- Verification & Status
    status TEXT DEFAULT 'active' NOT NULL,
    verification_status aqua_verification_status DEFAULT 'pending' NOT NULL,
    rejection_reason TEXT DEFAULT '',
    has_duplicate_warning BOOLEAN DEFAULT FALSE NOT NULL,
    created_by_role aqua_user_role DEFAULT 'farmer' NOT NULL,
    created_by UUID,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    deleted_at TIMESTAMPTZ
);

-- 5. DUPLICATE DETECTION AUDIT TABLE
CREATE TABLE IF NOT EXISTS aqua_farmer_duplicates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farmer_id UUID REFERENCES aqua_farmers(id) ON DELETE CASCADE NOT NULL,
    potential_match_id UUID REFERENCES aqua_farmers(id) ON DELETE CASCADE NOT NULL,
    match_score INT NOT NULL, -- 0 to 100
    match_reasons JSONB DEFAULT '[]'::jsonb NOT NULL,
    status TEXT DEFAULT 'pending_review' NOT NULL,
    reviewed_by UUID,
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 6. POND MASTER
CREATE TABLE IF NOT EXISTS aqua_ponds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pond_code TEXT NOT NULL, -- e.g. POND-001
    farmer_id UUID REFERENCES aqua_farmers(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    area_decimal NUMERIC(10,2) NOT NULL, -- 100 decimal = 1 acre
    water_depth_ft NUMERIC(5,2) DEFAULT 5.00 NOT NULL,
    water_source aqua_water_source DEFAULT 'rainfed' NOT NULL,
    soil_type aqua_soil_type DEFAULT 'alluvial' NOT NULL,
    has_drainage BOOLEAN DEFAULT FALSE NOT NULL,
    has_aeration BOOLEAN DEFAULT FALSE NOT NULL,
    preparation_date DATE,
    status aqua_pond_status DEFAULT 'active' NOT NULL,
    photo_urls JSONB DEFAULT '[]'::jsonb NOT NULL,
    notes TEXT DEFAULT '',
    verification_status aqua_verification_status DEFAULT 'pending' NOT NULL,
    rejection_reason TEXT DEFAULT '',
    created_by UUID,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    deleted_at TIMESTAMPTZ,
    UNIQUE(farmer_id, pond_code)
);

-- 7. PRODUCTION CYCLES (With overlap prevention)
CREATE TABLE IF NOT EXISTS aqua_production_cycles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cycle_code TEXT NOT NULL, -- e.g. CYCLE-2026-001
    farmer_id UUID REFERENCES aqua_farmers(id) ON DELETE CASCADE NOT NULL,
    pond_id UUID REFERENCES aqua_ponds(id) ON DELETE CASCADE NOT NULL,
    cycle_name TEXT NOT NULL,
    start_date DATE NOT NULL,
    target_harvest_date DATE,
    actual_harvest_date DATE,
    status aqua_cycle_status DEFAULT 'active' NOT NULL,
    is_authorized_overlap BOOLEAN DEFAULT FALSE NOT NULL,
    notes TEXT DEFAULT '',
    verification_status aqua_verification_status DEFAULT 'pending' NOT NULL,
    rejection_reason TEXT DEFAULT '',
    created_by UUID,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    deleted_at TIMESTAMPTZ,
    UNIQUE(pond_id, cycle_code)
);

-- Overlap Prevention Trigger Function
CREATE OR REPLACE FUNCTION check_aqua_cycle_overlap()
RETURNS TRIGGER AS $$
BEGIN
    IF (NEW.status = 'active' AND NEW.is_authorized_overlap = FALSE) THEN
        IF EXISTS (
            SELECT 1 FROM aqua_production_cycles
            WHERE pond_id = NEW.pond_id
              AND id <> COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
              AND status = 'active'
              AND deleted_at IS NULL
        ) THEN
            RAISE EXCEPTION 'Active production cycle already exists for this pond. Authorized overlap flag required to run parallel cycles.';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_aqua_cycle_overlap ON aqua_production_cycles;
CREATE TRIGGER trg_aqua_cycle_overlap
BEFORE INSERT OR UPDATE ON aqua_production_cycles
FOR EACH ROW EXECUTE FUNCTION check_aqua_cycle_overlap();

-- 8. CYCLE STOCKING (Multiple species, multiple stocking events)
CREATE TABLE IF NOT EXISTS aqua_cycle_stocking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    production_cycle_id UUID REFERENCES aqua_production_cycles(id) ON DELETE CASCADE NOT NULL,
    pond_id UUID REFERENCES aqua_ponds(id) ON DELETE CASCADE NOT NULL,
    farmer_id UUID REFERENCES aqua_farmers(id) ON DELETE CASCADE NOT NULL,
    species_id TEXT REFERENCES aqua_species(id) ON DELETE RESTRICT NOT NULL,
    stocking_date DATE NOT NULL,
    fry_count INT NOT NULL CHECK (fry_count > 0),
    avg_weight_grams NUMERIC(10,2) NOT NULL CHECK (avg_weight_grams >= 0),
    seed_stage aqua_seed_stage DEFAULT 'fingerling' NOT NULL,
    supplier_name TEXT DEFAULT '',
    total_cost NUMERIC(10,2) DEFAULT 0.00 NOT NULL,
    is_estimated BOOLEAN DEFAULT FALSE NOT NULL,
    data_quality aqua_data_quality DEFAULT 'verified_count' NOT NULL,
    verification_status aqua_verification_status DEFAULT 'pending' NOT NULL,
    rejection_reason TEXT DEFAULT '',
    notes TEXT DEFAULT '',
    created_by UUID,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    deleted_at TIMESTAMPTZ
);

-- 9. AUDIT REVISIONS (Never silently overwrite operational records)
CREATE TABLE IF NOT EXISTS aqua_record_revisions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name TEXT NOT NULL,
    record_id UUID NOT NULL,
    revision_number INT NOT NULL,
    previous_data JSONB NOT NULL,
    new_data JSONB NOT NULL,
    changed_by UUID,
    change_reason TEXT DEFAULT '',
    ip_address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 10. FEED BRANDS (Master)
CREATE TABLE IF NOT EXISTS aqua_feed_brands (
    id TEXT PRIMARY KEY,
    brand_name TEXT NOT NULL,
    manufacturer TEXT NOT NULL,
    protein_percentage NUMERIC(5,2) NOT NULL,
    fat_percentage NUMERIC(5,2) DEFAULT 3.00 NOT NULL,
    feed_type TEXT DEFAULT 'floating_pellet' NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 11. FEED EVENTS
CREATE TABLE IF NOT EXISTS aqua_feed_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    production_cycle_id UUID REFERENCES aqua_production_cycles(id) ON DELETE CASCADE NOT NULL,
    pond_id UUID REFERENCES aqua_ponds(id) ON DELETE CASCADE NOT NULL,
    farmer_id UUID REFERENCES aqua_farmers(id) ON DELETE CASCADE NOT NULL,
    feed_brand_id TEXT REFERENCES aqua_feed_brands(id) ON DELETE SET NULL,
    feed_date DATE NOT NULL,
    feeding_time TIME,
    quantity_kg NUMERIC(10,2) NOT NULL CHECK (quantity_kg > 0),
    feeding_method TEXT DEFAULT 'broadcasting' NOT NULL,
    weather_condition TEXT DEFAULT 'sunny',
    is_estimated BOOLEAN DEFAULT FALSE NOT NULL,
    verification_status aqua_verification_status DEFAULT 'pending' NOT NULL,
    rejection_reason TEXT DEFAULT '',
    created_by UUID,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    deleted_at TIMESTAMPTZ
);

-- 12. WATER QUALITY READINGS
CREATE TABLE IF NOT EXISTS aqua_water_quality_readings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    production_cycle_id UUID REFERENCES aqua_production_cycles(id) ON DELETE CASCADE NOT NULL,
    pond_id UUID REFERENCES aqua_ponds(id) ON DELETE CASCADE NOT NULL,
    farmer_id UUID REFERENCES aqua_farmers(id) ON DELETE CASCADE NOT NULL,
    reading_date DATE NOT NULL,
    reading_time TIME,
    dissolved_oxygen_ppm NUMERIC(4,2),
    water_temp_c NUMERIC(4,2),
    ph_level NUMERIC(4,2),
    water_transparency_cm NUMERIC(5,2),
    ammonia_ppm NUMERIC(5,3),
    nitrite_ppm NUMERIC(5,3),
    alkalinity_ppm NUMERIC(6,2),
    observation_notes TEXT DEFAULT '',
    is_estimated BOOLEAN DEFAULT FALSE NOT NULL,
    verification_status aqua_verification_status DEFAULT 'pending' NOT NULL,
    rejection_reason TEXT DEFAULT '',
    created_by UUID,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    deleted_at TIMESTAMPTZ
);

-- 13. PROBLEM REPORTS
CREATE TABLE IF NOT EXISTS aqua_problem_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    production_cycle_id UUID REFERENCES aqua_production_cycles(id) ON DELETE CASCADE NOT NULL,
    pond_id UUID REFERENCES aqua_ponds(id) ON DELETE CASCADE NOT NULL,
    farmer_id UUID REFERENCES aqua_farmers(id) ON DELETE CASCADE NOT NULL,
    report_date DATE NOT NULL,
    problem_category aqua_problem_category NOT NULL,
    symptom_description TEXT NOT NULL,
    affected_species_id TEXT REFERENCES aqua_species(id) ON DELETE SET NULL,
    severity aqua_severity DEFAULT 'moderate' NOT NULL,
    photo_urls JSONB DEFAULT '[]'::jsonb NOT NULL,
    verification_status aqua_verification_status DEFAULT 'pending' NOT NULL,
    rejection_reason TEXT DEFAULT '',
    created_by UUID,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    deleted_at TIMESTAMPTZ
);

-- 14. INTERVENTIONS & FOLLOW-UPS
CREATE TABLE IF NOT EXISTS aqua_interventions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    problem_report_id UUID REFERENCES aqua_problem_reports(id) ON DELETE SET NULL,
    production_cycle_id UUID REFERENCES aqua_production_cycles(id) ON DELETE CASCADE NOT NULL,
    pond_id UUID REFERENCES aqua_ponds(id) ON DELETE CASCADE NOT NULL,
    farmer_id UUID REFERENCES aqua_farmers(id) ON DELETE CASCADE NOT NULL,
    prescribed_by UUID,
    treatment_date DATE NOT NULL,
    medicine_or_chemical_name TEXT NOT NULL,
    dosage TEXT NOT NULL,
    application_method TEXT NOT NULL,
    target_condition TEXT NOT NULL,
    notes TEXT DEFAULT '',
    verification_status aqua_verification_status DEFAULT 'pending' NOT NULL,
    created_by UUID,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS aqua_intervention_followups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    intervention_id UUID REFERENCES aqua_interventions(id) ON DELETE CASCADE NOT NULL,
    followup_type aqua_followup_interval NOT NULL,
    scheduled_date DATE NOT NULL,
    actual_date DATE,
    condition_status aqua_condition_status DEFAULT 'improved' NOT NULL,
    mortality_observed INT DEFAULT 0,
    farmer_feedback TEXT DEFAULT '',
    technician_assessment TEXT DEFAULT '',
    created_by UUID,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 15. GROWTH SAMPLES
CREATE TABLE IF NOT EXISTS aqua_growth_samples (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    production_cycle_id UUID REFERENCES aqua_production_cycles(id) ON DELETE CASCADE NOT NULL,
    pond_id UUID REFERENCES aqua_ponds(id) ON DELETE CASCADE NOT NULL,
    farmer_id UUID REFERENCES aqua_farmers(id) ON DELETE CASCADE NOT NULL,
    species_id TEXT REFERENCES aqua_species(id) ON DELETE RESTRICT NOT NULL,
    sample_date DATE NOT NULL,
    sample_count INT NOT NULL CHECK (sample_count > 0),
    avg_weight_grams NUMERIC(10,2) NOT NULL CHECK (avg_weight_grams > 0),
    avg_length_cm NUMERIC(6,2),
    calculated_adg_grams NUMERIC(8,3), -- Average Daily Gain
    is_estimated BOOLEAN DEFAULT FALSE NOT NULL,
    verification_status aqua_verification_status DEFAULT 'pending' NOT NULL,
    rejection_reason TEXT DEFAULT '',
    created_by UUID,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    deleted_at TIMESTAMPTZ
);

-- 16. MORTALITY EVENTS
CREATE TABLE IF NOT EXISTS aqua_mortality_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    production_cycle_id UUID REFERENCES aqua_production_cycles(id) ON DELETE CASCADE NOT NULL,
    pond_id UUID REFERENCES aqua_ponds(id) ON DELETE CASCADE NOT NULL,
    farmer_id UUID REFERENCES aqua_farmers(id) ON DELETE CASCADE NOT NULL,
    species_id TEXT REFERENCES aqua_species(id) ON DELETE SET NULL,
    event_date DATE NOT NULL,
    dead_count INT NOT NULL CHECK (dead_count > 0),
    suspected_cause TEXT DEFAULT '',
    is_estimated BOOLEAN DEFAULT FALSE NOT NULL,
    verification_status aqua_verification_status DEFAULT 'pending' NOT NULL,
    rejection_reason TEXT DEFAULT '',
    created_by UUID,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    deleted_at TIMESTAMPTZ
);

-- 17. HARVESTS
CREATE TABLE IF NOT EXISTS aqua_harvests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    production_cycle_id UUID REFERENCES aqua_production_cycles(id) ON DELETE CASCADE NOT NULL,
    pond_id UUID REFERENCES aqua_ponds(id) ON DELETE CASCADE NOT NULL,
    farmer_id UUID REFERENCES aqua_farmers(id) ON DELETE CASCADE NOT NULL,
    species_id TEXT REFERENCES aqua_species(id) ON DELETE RESTRICT NOT NULL,
    harvest_date DATE NOT NULL,
    harvest_type aqua_harvest_type DEFAULT 'final' NOT NULL,
    total_weight_kg NUMERIC(10,2) NOT NULL CHECK (total_weight_kg > 0),
    piece_count INT,
    avg_weight_grams NUMERIC(10,2),
    buyer_name TEXT DEFAULT '',
    price_per_kg NUMERIC(10,2),
    total_revenue NUMERIC(12,2),
    is_estimated BOOLEAN DEFAULT FALSE NOT NULL,
    verification_status aqua_verification_status DEFAULT 'pending' NOT NULL,
    rejection_reason TEXT DEFAULT '',
    created_by UUID,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    deleted_at TIMESTAMPTZ
);

-- 18. EXPENSES & SALES
CREATE TABLE IF NOT EXISTS aqua_expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    production_cycle_id UUID REFERENCES aqua_production_cycles(id) ON DELETE CASCADE NOT NULL,
    pond_id UUID REFERENCES aqua_ponds(id) ON DELETE CASCADE NOT NULL,
    farmer_id UUID REFERENCES aqua_farmers(id) ON DELETE CASCADE NOT NULL,
    expense_date DATE NOT NULL,
    category aqua_expense_category NOT NULL,
    amount NUMERIC(10,2) NOT NULL CHECK (amount > 0),
    payment_mode TEXT DEFAULT 'cash' NOT NULL,
    vendor_or_recipient TEXT DEFAULT '',
    notes TEXT DEFAULT '',
    receipt_url TEXT DEFAULT '',
    verification_status aqua_verification_status DEFAULT 'pending' NOT NULL,
    created_by UUID,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS aqua_sales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    production_cycle_id UUID REFERENCES aqua_production_cycles(id) ON DELETE CASCADE NOT NULL,
    pond_id UUID REFERENCES aqua_ponds(id) ON DELETE CASCADE NOT NULL,
    farmer_id UUID REFERENCES aqua_farmers(id) ON DELETE CASCADE NOT NULL,
    harvest_id UUID REFERENCES aqua_harvests(id) ON DELETE SET NULL,
    sale_date DATE NOT NULL,
    buyer_type aqua_buyer_type DEFAULT 'local_wholesaler' NOT NULL,
    total_kg NUMERIC(10,2) NOT NULL CHECK (total_kg > 0),
    rate_per_kg NUMERIC(10,2) NOT NULL CHECK (rate_per_kg > 0),
    gross_amount NUMERIC(12,2) NOT NULL,
    deductions NUMERIC(10,2) DEFAULT 0.00 NOT NULL,
    net_amount NUMERIC(12,2) NOT NULL,
    payment_status TEXT DEFAULT 'paid' NOT NULL,
    notes TEXT DEFAULT '',
    verification_status aqua_verification_status DEFAULT 'pending' NOT NULL,
    created_by UUID,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    deleted_at TIMESTAMPTZ
);

-- 19. ATTACHMENTS & CONSENT & AUDIT
CREATE TABLE IF NOT EXISTS aqua_attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type TEXT NOT NULL, -- 'pond', 'problem_report', 'harvest', 'expense'
    entity_id UUID NOT NULL,
    file_path TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size_bytes BIGINT NOT NULL,
    storage_provider TEXT DEFAULT 'supabase_storage' NOT NULL,
    uploaded_by UUID,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS aqua_consent_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farmer_id UUID REFERENCES aqua_farmers(id) ON DELETE CASCADE NOT NULL,
    consent_type TEXT NOT NULL, -- 'data_collection', 'data_sharing', 'photo_use'
    is_granted BOOLEAN NOT NULL,
    consent_text TEXT NOT NULL,
    ip_address TEXT,
    user_agent TEXT,
    recorded_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS aqua_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    user_role aqua_user_role NOT NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT,
    details JSONB DEFAULT '{}'::jsonb NOT NULL,
    ip_address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================================================
-- INDEXES FOR MAXIMUM QUERY PERFORMANCE & FILTERING
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_aqua_farmers_mobile ON aqua_farmers(mobile_number);
CREATE INDEX IF NOT EXISTS idx_aqua_farmers_district_block ON aqua_farmers(district_id, block_id, village_id);
CREATE INDEX IF NOT EXISTS idx_aqua_farmers_reg_no ON aqua_farmers(registration_number);
CREATE INDEX IF NOT EXISTS idx_aqua_ponds_farmer ON aqua_ponds(farmer_id);
CREATE INDEX IF NOT EXISTS idx_aqua_cycles_pond ON aqua_production_cycles(pond_id);
CREATE INDEX IF NOT EXISTS idx_aqua_cycles_farmer ON aqua_production_cycles(farmer_id);
CREATE INDEX IF NOT EXISTS idx_aqua_stocking_cycle ON aqua_cycle_stocking(production_cycle_id);
CREATE INDEX IF NOT EXISTS idx_aqua_stocking_species ON aqua_cycle_stocking(species_id);
CREATE INDEX IF NOT EXISTS idx_aqua_water_cycle ON aqua_water_quality_readings(production_cycle_id, reading_date);
CREATE INDEX IF NOT EXISTS idx_aqua_feed_cycle ON aqua_feed_events(production_cycle_id, feed_date);
CREATE INDEX IF NOT EXISTS idx_aqua_problems_cycle ON aqua_problem_reports(production_cycle_id);
CREATE INDEX IF NOT EXISTS idx_aqua_revisions_record ON aqua_record_revisions(table_name, record_id);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
ALTER TABLE aqua_farmers ENABLE ROW LEVEL SECURITY;
ALTER TABLE aqua_ponds ENABLE ROW LEVEL SECURITY;
ALTER TABLE aqua_production_cycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE aqua_cycle_stocking ENABLE ROW LEVEL SECURITY;
ALTER TABLE aqua_feed_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE aqua_water_quality_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE aqua_problem_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE aqua_interventions ENABLE ROW LEVEL SECURITY;
ALTER TABLE aqua_intervention_followups ENABLE ROW LEVEL SECURITY;
ALTER TABLE aqua_growth_samples ENABLE ROW LEVEL SECURITY;
ALTER TABLE aqua_mortality_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE aqua_harvests ENABLE ROW LEVEL SECURITY;
ALTER TABLE aqua_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE aqua_sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE aqua_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE aqua_consent_logs ENABLE ROW LEVEL SECURITY;

-- Farmer Policies: Can read and write only their own records
CREATE POLICY aqua_farmer_self_select ON aqua_farmers
    FOR SELECT USING (auth.uid() = id OR auth.jwt()->>'role' IN ('super_admin', 'business_admin', 'shop_operator', 'technical_staff'));

CREATE POLICY aqua_pond_farmer_access ON aqua_ponds
    FOR ALL USING (auth.uid() = farmer_id OR auth.jwt()->>'role' IN ('super_admin', 'business_admin', 'shop_operator', 'technical_staff'));

CREATE POLICY aqua_cycle_farmer_access ON aqua_production_cycles
    FOR ALL USING (auth.uid() = farmer_id OR auth.jwt()->>'role' IN ('super_admin', 'business_admin', 'shop_operator', 'technical_staff'));

CREATE POLICY aqua_stocking_farmer_access ON aqua_cycle_stocking
    FOR ALL USING (auth.uid() = farmer_id OR auth.jwt()->>'role' IN ('super_admin', 'business_admin', 'shop_operator', 'technical_staff'));

CREATE POLICY aqua_water_farmer_access ON aqua_water_quality_readings
    FOR ALL USING (auth.uid() = farmer_id OR auth.jwt()->>'role' IN ('super_admin', 'business_admin', 'shop_operator', 'technical_staff'));

CREATE POLICY aqua_feed_farmer_access ON aqua_feed_events
    FOR ALL USING (auth.uid() = farmer_id OR auth.jwt()->>'role' IN ('super_admin', 'business_admin', 'shop_operator', 'technical_staff'));

CREATE POLICY aqua_problems_farmer_access ON aqua_problem_reports
    FOR ALL USING (auth.uid() = farmer_id OR auth.jwt()->>'role' IN ('super_admin', 'business_admin', 'shop_operator', 'technical_staff'));

CREATE POLICY aqua_harvests_farmer_access ON aqua_harvests
    FOR ALL USING (auth.uid() = farmer_id OR auth.jwt()->>'role' IN ('super_admin', 'business_admin', 'shop_operator', 'technical_staff'));

CREATE POLICY aqua_expenses_farmer_access ON aqua_expenses
    FOR ALL USING (auth.uid() = farmer_id OR auth.jwt()->>'role' IN ('super_admin', 'business_admin', 'shop_operator', 'technical_staff'));

CREATE POLICY aqua_sales_farmer_access ON aqua_sales
    FOR ALL USING (auth.uid() = farmer_id OR auth.jwt()->>'role' IN ('super_admin', 'business_admin', 'shop_operator', 'technical_staff'));

-- ============================================================================
-- SEED DATA: DAKSHIN DINAJPUR & CARP / FISH SPECIES MASTER
-- ============================================================================
INSERT INTO aqua_districts (id, name, name_bn, state) VALUES
    ('dist-dd', 'Dakshin Dinajpur', 'দক্ষিণ দিনাজপুর', 'West Bengal'),
    ('dist-ud', 'Uttar Dinajpur', 'উত্তর দিনাজপুর', 'West Bengal'),
    ('dist-mld', 'Malda', 'মালদা', 'West Bengal'),
    ('dist-msd', 'Murshidabad', 'মুর্শিদাবাদ', 'West Bengal')
ON CONFLICT (id) DO NOTHING;

INSERT INTO aqua_blocks (id, district_id, name, name_bn) VALUES
    ('blk-balurghat', 'dist-dd', 'Balurghat', 'বালুরঘাট'),
    ('blk-hili', 'dist-dd', 'Hili', 'হিলি'),
    ('blk-kumarganj', 'dist-dd', 'Kumarganj', 'কুমারগঞ্জ'),
    ('blk-gangarampur', 'dist-dd', 'Gangarampur', 'গঙ্গারামপুর'),
    ('blk-banshihari', 'dist-dd', 'Banshihari', 'বংশীহারী'),
    ('blk-harirampur', 'dist-dd', 'Harirampur', 'হরিরামপুর'),
    ('blk-kushmandi', 'dist-dd', 'Kushmandi', 'কুশমন্ডি'),
    ('blk-tapan', 'dist-dd', 'Tapan', 'তপন')
ON CONFLICT (id) DO NOTHING;

INSERT INTO aqua_villages (id, block_id, name, name_bn, pin_code) VALUES
    ('vil-nandair', 'blk-balurghat', 'Nandair', 'নন্দাইর', '733124'),
    ('vil-puliyapara', 'blk-balurghat', 'Puliyapara', 'পুলিয়াপাড়া', '733124'),
    ('vil-chapmatali', 'blk-balurghat', 'Chapmatali', 'চাপমাতলী', '733124'),
    ('vil-patiram', 'blk-balurghat', 'Patiram', 'পতিরাম', '733133'),
    ('vil-chakvrigu', 'blk-balurghat', 'Chakvrigu', 'চকভৃগু', '733102'),
    ('vil-trimohini', 'blk-hili', 'Trimohini', 'ত্রিমোহিনী', '733158'),
    ('vil-samjia', 'blk-kumarganj', 'Samjia', 'সমজিয়া', '733141'),
    ('vil-belbari', 'blk-gangarampur', 'Belbari', 'বেলবাড়ি', '733124'),
    ('vil-buniadpur', 'blk-banshihari', 'Buniadpur', 'বুনিয়াদপুর', '733121')
ON CONFLICT (id) DO NOTHING;

INSERT INTO aqua_species (id, scientific_name, name_en, name_bn, common_name, category, ideal_ph_min, ideal_ph_max, ideal_temp_min_c, ideal_temp_max_c, ideal_do_min_ppm) VALUES
    ('spec-rohu', 'Labeo rohita', 'Rohu', 'রুই', 'Rui', 'carp', 6.5, 8.5, 24.0, 32.0, 4.0),
    ('spec-catla', 'Gibelion catla', 'Catla', 'কাতলা', 'Katla', 'carp', 6.8, 8.5, 25.0, 33.0, 4.5),
    ('spec-mrigal', 'Cirrhinus mrigala', 'Mrigal', 'মৃগেল', 'Mrigel', 'carp', 6.5, 8.5, 24.0, 32.0, 3.8),
    ('spec-silver-carp', 'Hypophthalmichthys molitrix', 'Silver Carp', 'সিলভার কার্প', 'Silver Carp', 'carp', 6.8, 8.5, 22.0, 30.0, 4.0),
    ('spec-grass-carp', 'Ctenopharyngodon idella', 'Grass Carp', 'গ্রাস কার্প', 'Grass Carp', 'carp', 7.0, 8.5, 20.0, 30.0, 4.0),
    ('spec-common-carp', 'Cyprinus carpio', 'Common Carp', 'কমন কার্প', 'Common Carp', 'carp', 6.5, 9.0, 18.0, 30.0, 3.0),
    ('spec-magur', 'Clarias batrachus', 'Walking Catfish (Magur)', 'মাগুর', 'Magur', 'catfish', 6.0, 8.5, 22.0, 32.0, 2.0),
    ('spec-singhi', 'Heteropneustes fossilis', 'Stinging Catfish (Singhi)', 'শিঙি', 'Singhi', 'catfish', 6.0, 8.5, 22.0, 32.0, 2.0),
    ('spec-pabda', 'Ompok pabda', 'Pabda Catfish', 'পাবদা', 'Pabda', 'catfish', 7.0, 8.2, 24.0, 31.0, 4.5),
    ('spec-tilapia', 'Oreochromis niloticus', 'Nile Tilapia', 'তেলাপিয়া', 'Tilapia', 'perch', 6.5, 9.0, 20.0, 35.0, 2.5),
    ('spec-pangas', 'Pangasianodon hypophthalmus', 'Pangasius', 'পাঙ্গাস', 'Pangas', 'catfish', 6.5, 8.5, 24.0, 32.0, 3.0)
ON CONFLICT (id) DO NOTHING;

INSERT INTO aqua_feed_brands (id, brand_name, manufacturer, protein_percentage, fat_percentage, feed_type, is_active) VALUES
    ('feed-cp-grower', 'CP Aqua Classic 28/3', 'CP Aquaculture India', 28.00, 3.00, 'floating_pellet', TRUE),
    ('feed-cp-finisher', 'CP Aqua Premium 32/4', 'CP Aquaculture India', 32.00, 4.00, 'floating_pellet', TRUE),
    ('feed-godrej-aqua', 'Godrej Aquafeed Carpo 26', 'Godrej Agrovet', 26.00, 3.00, 'floating_pellet', TRUE),
    ('feed-growel-carp', 'Growel Super Carp 30/3', 'Growel Feeds', 30.00, 3.50, 'floating_pellet', TRUE),
    ('feed-local-mash', 'Rice Bran + Mustard Oil Cake (1:1)', 'Local Mill / Farm Made', 18.00, 5.00, 'mash', TRUE)
ON CONFLICT (id) DO NOTHING;
