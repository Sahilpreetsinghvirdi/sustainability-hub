-- Backend PostgreSQL Schema (SQLAlchemy models will map to this)
-- Run via Alembic migrations

-- ============ EXTENSIONS ============

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============ USERS & HOUSEHOLDS ============

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    household_id UUID,
    preferences JSONB NOT NULL DEFAULT '{}',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_login_at TIMESTAMPTZ
);

CREATE TABLE households (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    location JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE household_members (
    household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL DEFAULT 'member',
    joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (household_id, user_id)
);

-- Add FK after tables created
ALTER TABLE users ADD CONSTRAINT fk_users_household 
    FOREIGN KEY (household_id) REFERENCES households(id) ON DELETE SET NULL;

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_household ON users(household_id);
CREATE INDEX idx_household_members_user ON household_members(user_id);

-- ============ CARBON / RECEIPTS ============

CREATE TABLE receipt_scans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
    image_url VARCHAR(500) NOT NULL,
    image_thumbnail_url VARCHAR(500),
    ocr_text TEXT,
    total_carbon_kg DECIMAL(10,3) NOT NULL DEFAULT 0,
    currency CHAR(3) NOT NULL DEFAULT 'USD',
    total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    store_name VARCHAR(255),
    scanned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    processed_at TIMESTAMPTZ,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_receipt_scans_user_date ON receipt_scans(user_id, scanned_at DESC);
CREATE INDEX idx_receipt_scans_household_date ON receipt_scans(household_id, scanned_at DESC);
CREATE INDEX idx_receipt_scans_status ON receipt_scans(status) WHERE status IN ('pending', 'processing');

CREATE TABLE receipt_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    scan_id UUID NOT NULL REFERENCES receipt_scans(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    quantity DECIMAL(10,3) NOT NULL DEFAULT 1,
    unit VARCHAR(50) NOT NULL DEFAULT 'item',
    price DECIMAL(10,2) NOT NULL DEFAULT 0,
    category VARCHAR(50) NOT NULL,
    carbon_kg DECIMAL(10,3) NOT NULL DEFAULT 0,
    carbon_source VARCHAR(20) NOT NULL DEFAULT 'estimated' CHECK (carbon_source IN ('openlca', 'ecoinvent', 'openfoodfacts', 'estimated', 'manual')),
    confidence DECIMAL(3,2) NOT NULL DEFAULT 0.5,
    barcode VARCHAR(100),
    matched_product_id VARCHAR(100),
    position INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_receipt_items_scan ON receipt_items(scan_id);
CREATE INDEX idx_receipt_items_barcode ON receipt_items(barcode) WHERE barcode IS NOT NULL;

-- Carbon factors (authoritative source)
CREATE TABLE carbon_factors (
    product_category VARCHAR(50) PRIMARY KEY,
    kg_co2e_per_unit DECIMAL(10,4) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    source VARCHAR(50) NOT NULL,
    region VARCHAR(10) NOT NULL DEFAULT 'US',
    year INTEGER NOT NULL,
    confidence VARCHAR(10) NOT NULL DEFAULT 'medium' CHECK (confidence IN ('high', 'medium', 'low')),
    metadata JSONB,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Product catalog for barcode matching
CREATE TABLE products (
    id VARCHAR(100) PRIMARY KEY, -- barcode or OpenFoodFacts ID
    name VARCHAR(255) NOT NULL,
    brand VARCHAR(255),
    category VARCHAR(50) NOT NULL,
    carbon_kg_per_unit DECIMAL(10,4),
    unit VARCHAR(20),
    source VARCHAR(50),
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_name_trgm ON products USING GIN (name gin_trgm_ops);

-- ============ ENERGY ============

CREATE TABLE energy_bills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
    billing_period_start DATE NOT NULL,
    billing_period_end DATE NOT NULL,
    electricity_kwh DECIMAL(10,2) NOT NULL DEFAULT 0,
    gas_therms DECIMAL(10,2) DEFAULT 0,
    water_gallons DECIMAL(10,2) DEFAULT 0,
    total_cost DECIMAL(10,2) NOT NULL DEFAULT 0,
    currency CHAR(3) NOT NULL DEFAULT 'USD',
    utility_provider VARCHAR(255),
    bill_image_url VARCHAR(500),
    parsed_data JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_energy_bills_household_period ON energy_bills(household_id, billing_period_start DESC);
CREATE UNIQUE INDEX idx_energy_bills_unique ON energy_bills(household_id, billing_period_start, billing_period_end);

CREATE TABLE appliances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL,
    brand VARCHAR(255),
    model VARCHAR(255),
    age_years INTEGER NOT NULL DEFAULT 0,
    power_watts INTEGER NOT NULL DEFAULT 0,
    usage_hours_per_day DECIMAL(4,2) NOT NULL DEFAULT 0,
    usage_days_per_week INTEGER NOT NULL DEFAULT 7,
    efficiency_rating VARCHAR(50),
    location VARCHAR(100),
    is_smart BOOLEAN NOT NULL DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_appliances_household ON appliances(household_id);

CREATE TABLE energy_audits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
    total_annual_kwh DECIMAL(12,2) NOT NULL DEFAULT 0,
    baseline_kwh DECIMAL(12,2) NOT NULL DEFAULT 0,
    savings_potential_kwh DECIMAL(12,2) NOT NULL DEFAULT 0,
    savings_potential_usd DECIMAL(10,2) NOT NULL DEFAULT 0,
    recommendations JSONB NOT NULL DEFAULT '[]',
    model_version VARCHAR(20) NOT NULL DEFAULT 'v1.0',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_energy_audits_household ON energy_audits(household_id, created_at DESC);

-- ============ FOOD WASTE ============

CREATE TABLE food_waste_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
    meal_type VARCHAR(20) NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
    meal_image_url VARCHAR(500) NOT NULL,
    waste_image_url VARCHAR(500) NOT NULL,
    plate_analysis JSONB NOT NULL,
    waste_analysis JSONB NOT NULL,
    avoidable_waste_kg DECIMAL(8,3) NOT NULL DEFAULT 0,
    unavoidable_waste_kg DECIMAL(8,3) NOT NULL DEFAULT 0,
    cost_usd DECIMAL(8,2) NOT NULL DEFAULT 0,
    carbon_kg DECIMAL(8,3) NOT NULL DEFAULT 0,
    logged_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_food_waste_user_date ON food_waste_logs(user_id, logged_at DESC);
CREATE INDEX idx_food_waste_household_date ON food_waste_logs(household_id, logged_at DESC);

CREATE TABLE food_waste_streaks (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    current_streak_days INTEGER NOT NULL DEFAULT 0,
    longest_streak_days INTEGER NOT NULL DEFAULT 0,
    last_log_date DATE,
    total_waste_avoided_kg DECIMAL(10,3) NOT NULL DEFAULT 0,
    total_money_saved_usd DECIMAL(10,2) NOT NULL DEFAULT 0,
    total_carbon_saved_kg DECIMAL(10,3) NOT NULL DEFAULT 0,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ML model predictions cache
CREATE TABLE food_waste_predictions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    log_id UUID NOT NULL REFERENCES food_waste_logs(id) ON DELETE CASCADE,
    model_version VARCHAR(20) NOT NULL,
    plate_detections JSONB NOT NULL,
    waste_detections JSONB NOT NULL,
    inference_time_ms INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============ AGGREGATIONS (Materialized Views for Dashboard) ============

CREATE MATERIALIZED VIEW mv_dashboard_carbon_monthly AS
SELECT 
    household_id,
    date_trunc('month', scanned_at)::date AS period_start,
    SUM(total_carbon_kg) AS total_kg,
    jsonb_object_agg(category, category_kg) AS by_category
FROM (
    SELECT 
        rs.household_id,
        rs.scanned_at,
        ri.category,
        SUM(ri.carbon_kg) AS category_kg
    FROM receipt_scans rs
    JOIN receipt_items ri ON ri.scan_id = rs.id
    WHERE rs.status = 'completed'
    GROUP BY rs.household_id, rs.scanned_at, ri.category
) sub
GROUP BY household_id, date_trunc('month', scanned_at);

CREATE UNIQUE INDEX idx_mv_carbon_monthly ON mv_dashboard_carbon_monthly(household_id, period_start);

CREATE MATERIALIZED VIEW mv_dashboard_energy_monthly AS
SELECT 
    household_id,
    date_trunc('month', billing_period_start)::date AS period_start,
    SUM(electricity_kwh) AS total_kwh,
    SUM(gas_therms) AS total_therms,
    SUM(total_cost) AS total_cost
FROM energy_bills
GROUP BY household_id, date_trunc('month', billing_period_start);

CREATE UNIQUE INDEX idx_mv_energy_monthly ON mv_dashboard_energy_monthly(household_id, period_start);

CREATE MATERIALIZED VIEW mv_dashboard_food_waste_monthly AS
SELECT 
    household_id,
    date_trunc('month', logged_at)::date AS period_start,
    SUM(avoidable_waste_kg) AS avoidable_kg,
    SUM(unavoidable_waste_kg) AS unavoidable_kg,
    SUM(cost_usd) AS total_cost,
    SUM(carbon_kg) AS total_carbon_kg,
    COUNT(*) AS meals_logged
FROM food_waste_logs
GROUP BY household_id, date_trunc('month', logged_at);

CREATE UNIQUE INDEX idx_mv_food_waste_monthly ON mv_dashboard_food_waste_monthly(household_id, period_start);

-- Refresh function
CREATE OR REPLACE FUNCTION refresh_dashboard_views()
RETURNS VOID LANGUAGE plpgsql AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_dashboard_carbon_monthly;
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_dashboard_energy_monthly;
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_dashboard_food_waste_monthly;
END;
$$;

-- ============ AUDIT & SYNC ============

CREATE TABLE sync_log (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    device_id VARCHAR(100),
    endpoint VARCHAR(100),
    status VARCHAR(20) CHECK (status IN ('success', 'partial', 'failed')),
    records_synced INTEGER DEFAULT 0,
    error_message TEXT,
    duration_ms INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_sync_log_user_date ON sync_log(user_id, created_at DESC);

-- ============ ROW LEVEL SECURITY ============

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE households ENABLE ROW LEVEL SECURITY;
ALTER TABLE household_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE receipt_scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE receipt_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE energy_bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE appliances ENABLE ROW LEVEL SECURITY;
ALTER TABLE energy_audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_waste_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_waste_streaks ENABLE ROW LEVEL SECURITY;

-- Policies: users can only access their household's data
CREATE POLICY users_household_access ON users
    USING (id = auth.uid() OR household_id IN (
        SELECT household_id FROM household_members WHERE user_id = auth.uid()
    ));

CREATE POLICY household_members_access ON household_members
    USING (user_id = auth.uid() OR household_id IN (
        SELECT household_id FROM household_members WHERE user_id = auth.uid()
    ));

CREATE POLICY receipt_scans_household ON receipt_scans
    USING (household_id IN (
        SELECT household_id FROM household_members WHERE user_id = auth.uid()
    ));

CREATE POLICY energy_bills_household ON energy_bills
    USING (household_id IN (
        SELECT household_id FROM household_members WHERE user_id = auth.uid()
    ));

CREATE POLICY appliances_household ON appliances
    USING (household_id IN (
        SELECT household_id FROM household_members WHERE user_id = auth.uid()
    ));

CREATE POLICY food_waste_logs_household ON food_waste_logs
    USING (household_id IN (
        SELECT household_id FROM household_members WHERE user_id = auth.uid()
    ));

CREATE POLICY food_waste_streaks_user ON food_waste_streaks
    USING (user_id = auth.uid());