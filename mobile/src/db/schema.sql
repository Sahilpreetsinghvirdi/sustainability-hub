-- Mobile SQLite Schema (expo-sqlite)
-- Run via expo-sqlite migrations

-- ============ USERS & HOUSEHOLDS ============

CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  household_id TEXT,
  preferences_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  last_sync_at TEXT,
  FOREIGN KEY (household_id) REFERENCES households(id)
);

CREATE TABLE households (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  location_json TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE household_members (
  household_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'member', -- 'admin', 'member', 'viewer'
  joined_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (household_id, user_id),
  FOREIGN KEY (household_id) REFERENCES households(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============ CARBON / RECEIPTS ============

CREATE TABLE receipt_scans (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  household_id TEXT NOT NULL,
  image_uri TEXT NOT NULL,
  ocr_text TEXT,
  total_carbon_kg REAL NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD',
  total_amount REAL NOT NULL DEFAULT 0,
  store_name TEXT,
  scanned_at TEXT NOT NULL DEFAULT (datetime('now')),
  processed_at TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  error_message TEXT,
  synced_at TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (household_id) REFERENCES households(id) ON DELETE CASCADE
);

CREATE INDEX idx_receipt_scans_user_date ON receipt_scans(user_id, scanned_at DESC);
CREATE INDEX idx_receipt_scans_household_date ON receipt_scans(household_id, scanned_at DESC);
CREATE INDEX idx_receipt_scans_sync ON receipt_scans(synced_at) WHERE synced_at IS NULL;

CREATE TABLE receipt_items (
  id TEXT PRIMARY KEY,
  scan_id TEXT NOT NULL,
  name TEXT NOT NULL,
  quantity REAL NOT NULL DEFAULT 1,
  unit TEXT NOT NULL DEFAULT 'item',
  price REAL NOT NULL DEFAULT 0,
  category TEXT NOT NULL,
  carbon_kg REAL NOT NULL DEFAULT 0,
  carbon_source TEXT NOT NULL DEFAULT 'estimated' CHECK (carbon_source IN ('openlca', 'ecoinvent', 'openfoodfacts', 'estimated', 'manual')),
  confidence REAL NOT NULL DEFAULT 0.5,
  barcode TEXT,
  matched_product_id TEXT,
  position INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY (scan_id) REFERENCES receipt_scans(id) ON DELETE CASCADE
);

CREATE INDEX idx_receipt_items_scan ON receipt_items(scan_id);

-- Carbon factor cache (synced from backend)
CREATE TABLE carbon_factors (
  product_category TEXT PRIMARY KEY,
  kg_co2e_per_unit REAL NOT NULL,
  unit TEXT NOT NULL,
  source TEXT NOT NULL,
  region TEXT NOT NULL DEFAULT 'US',
  year INTEGER NOT NULL,
  confidence TEXT NOT NULL DEFAULT 'medium' CHECK (confidence IN ('high', 'medium', 'low')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ============ ENERGY ============

CREATE TABLE energy_bills (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  household_id TEXT NOT NULL,
  billing_period_start TEXT NOT NULL,
  billing_period_end TEXT NOT NULL,
  electricity_kwh REAL NOT NULL DEFAULT 0,
  gas_therms REAL DEFAULT 0,
  water_gallons REAL DEFAULT 0,
  total_cost REAL NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD',
  utility_provider TEXT,
  bill_image_uri TEXT,
  parsed_data_json TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  synced_at TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (household_id) REFERENCES households(id) ON DELETE CASCADE
);

CREATE INDEX idx_energy_bills_household_period ON energy_bills(household_id, billing_period_start DESC);
CREATE INDEX idx_energy_bills_sync ON energy_bills(synced_at) WHERE synced_at IS NULL;

CREATE TABLE appliances (
  id TEXT PRIMARY KEY,
  household_id TEXT NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  brand TEXT,
  model TEXT,
  age_years INTEGER NOT NULL DEFAULT 0,
  power_watts INTEGER NOT NULL DEFAULT 0,
  usage_hours_per_day REAL NOT NULL DEFAULT 0,
  usage_days_per_week INTEGER NOT NULL DEFAULT 7,
  efficiency_rating TEXT,
  location TEXT,
  is_smart INTEGER NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (household_id) REFERENCES households(id) ON DELETE CASCADE
);

CREATE INDEX idx_appliances_household ON appliances(household_id);

CREATE TABLE energy_audits (
  id TEXT PRIMARY KEY,
  household_id TEXT NOT NULL,
  total_annual_kwh REAL NOT NULL DEFAULT 0,
  baseline_kwh REAL NOT NULL DEFAULT 0,
  savings_potential_kwh REAL NOT NULL DEFAULT 0,
  savings_potential_usd REAL NOT NULL DEFAULT 0,
  recommendations_json TEXT NOT NULL DEFAULT '[]',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (household_id) REFERENCES households(id) ON DELETE CASCADE
);

-- ============ FOOD WASTE ============

CREATE TABLE food_waste_logs (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  household_id TEXT NOT NULL,
  meal_type TEXT NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
  meal_image_uri TEXT NOT NULL,
  waste_image_uri TEXT NOT NULL,
  plate_analysis_json TEXT NOT NULL,
  waste_analysis_json TEXT NOT NULL,
  avoidable_waste_kg REAL NOT NULL DEFAULT 0,
  unavoidable_waste_kg REAL NOT NULL DEFAULT 0,
  cost_usd REAL NOT NULL DEFAULT 0,
  carbon_kg REAL NOT NULL DEFAULT 0,
  logged_at TEXT NOT NULL DEFAULT (datetime('now')),
  synced_at TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (household_id) REFERENCES households(id) ON DELETE CASCADE
);

CREATE INDEX idx_food_waste_user_date ON food_waste_logs(user_id, logged_at DESC);
CREATE INDEX idx_food_waste_household_date ON food_waste_logs(household_id, logged_at DESC);
CREATE INDEX idx_food_waste_sync ON food_waste_logs(synced_at) WHERE synced_at IS NULL;

CREATE TABLE food_waste_streaks (
  user_id TEXT PRIMARY KEY,
  current_streak_days INTEGER NOT NULL DEFAULT 0,
  longest_streak_days INTEGER NOT NULL DEFAULT 0,
  last_log_date TEXT,
  total_waste_avoided_kg REAL NOT NULL DEFAULT 0,
  total_money_saved_usd REAL NOT NULL DEFAULT 0,
  total_carbon_saved_kg REAL NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============ SYNC & METADATA ============

CREATE TABLE sync_queue (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  table_name TEXT NOT NULL,
  record_id TEXT NOT NULL,
  operation TEXT NOT NULL CHECK (operation IN ('insert', 'update', 'delete')),
  payload_json TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  retries INTEGER NOT NULL DEFAULT 0,
  last_error TEXT
);

CREATE INDEX idx_sync_queue_pending ON sync_queue(created_at) WHERE retries < 5;

-- App metadata
CREATE TABLE app_metadata (
  key TEXT PRIMARY KEY,
  value_json TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Initial carbon factors (subset for offline)
INSERT OR IGNORE INTO carbon_factors (product_category, kg_co2e_per_unit, unit, source, region, year, confidence) VALUES
('meat_beef', 27.0, 'kg', 'openlca', 'US', 2023, 'high'),
('meat_pork', 12.1, 'kg', 'openlca', 'US', 2023, 'high'),
('meat_poultry', 6.9, 'kg', 'openlca', 'US', 2023, 'high'),
('meat_lamb', 39.2, 'kg', 'openlca', 'US', 2023, 'high'),
('seafood', 5.4, 'kg', 'openlca', 'US', 2023, 'medium'),
('dairy_milk', 1.9, 'liter', 'openlca', 'US', 2023, 'high'),
('dairy_cheese', 13.5, 'kg', 'openlca', 'US', 2023, 'high'),
('eggs', 4.8, 'kg', 'openlca', 'US', 2023, 'high'),
('produce_fruit', 0.4, 'kg', 'openlca', 'US', 2023, 'medium'),
('produce_vegetable', 0.3, 'kg', 'openlca', 'US', 2023, 'medium'),
('grains_bread', 1.1, 'kg', 'openlca', 'US', 2023, 'medium'),
('grains_pasta', 1.4, 'kg', 'openlca', 'US', 2023, 'medium'),
('grains_rice', 2.7, 'kg', 'openlca', 'US', 2023, 'medium'),
('beverages_alcoholic', 2.3, 'liter', 'openlca', 'US', 2023, 'medium'),
('beverages_nonalcoholic', 0.8, 'liter', 'openlca', 'US', 2023, 'medium'),
('transport_fuel', 2.31, 'liter', 'epa', 'US', 2023, 'high');