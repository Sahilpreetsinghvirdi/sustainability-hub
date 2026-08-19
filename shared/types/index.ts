// Shared types between mobile and backend
// Generated from OpenAPI spec - single source of truth

export interface User {
  id: string;
  email: string;
  name: string;
  household_id: string;
  created_at: string;
  preferences: UserPreferences;
}

export interface UserPreferences {
  carbon_budget_monthly_kg: number;
  energy_target_kwh_monthly: number;
  food_waste_target_kg_monthly: number;
  notifications_enabled: boolean;
  units: 'metric' | 'imperial';
  theme: 'light' | 'dark' | 'system';
}

export interface Household {
  id: string;
  name: string;
  members: string[]; // user IDs
  created_at: string;
  location?: GeoLocation;
}

export interface GeoLocation {
  lat: number;
  lng: number;
  country_code: string;
  region?: string;
}

// ============ CARBON ============

export interface ReceiptScan {
  id: string;
  user_id: string;
  household_id: string;
  image_uri: string;
  ocr_text: string;
  items: ReceiptItem[];
  total_carbon_kg: number;
  currency: string;
  total_amount: number;
  store_name?: string;
  scanned_at: string;
  processed_at: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
}

export interface ReceiptItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  price: number;
  category: ProductCategory;
  carbon_kg: number;
  carbon_source: 'openlca' | 'ecoinvent' | 'openfoodfacts' | 'estimated' | 'manual';
  confidence: number; // 0-1
  barcode?: string;
  matched_product_id?: string;
}

export type ProductCategory = 
  | 'meat_beef'
  | 'meat_pork'
  | 'meat_poultry'
  | 'meat_lamb'
  | 'seafood'
  | 'dairy_milk'
  | 'dairy_cheese'
  | 'dairy_other'
  | 'eggs'
  | 'produce_fruit'
  | 'produce_vegetable'
  | 'grains_bread'
  | 'grains_pasta'
  | 'grains_rice'
  | 'processed_food'
  | 'beverages_alcoholic'
  | 'beverages_nonalcoholic'
  | 'packaging'
  | 'household'
  | 'personal_care'
  | 'electronics'
  | 'clothing'
  | 'transport_fuel'
  | 'other';

export interface CarbonFactor {
  product_category: ProductCategory;
  kg_co2e_per_unit: number;
  unit: 'kg' | 'liter' | 'item' | 'kwh' | 'km';
  source: string;
  region: string;
  year: number;
  confidence: 'high' | 'medium' | 'low';
}

// ============ ENERGY ============

export interface EnergyBill {
  id: string;
  user_id: string;
  household_id: string;
  billing_period_start: string;
  billing_period_end: string;
  electricity_kwh: number;
  gas_therms?: number;
  water_gallons?: number;
  total_cost: number;
  currency: string;
  utility_provider?: string;
  bill_image_uri?: string;
  parsed_data: ParsedBillData;
  created_at: string;
}

export interface ParsedBillData {
  electricity_tier_usage?: TierUsage[];
  gas_tier_usage?: TierUsage[];
  demand_charges?: number;
  taxes_fees?: number;
  raw_text: string;
  confidence: number;
}

export interface TierUsage {
  tier: string;
  kwh: number;
  rate: number;
}

export interface Appliance {
  id: string;
  household_id: string;
  name: string;
  category: ApplianceCategory;
  brand?: string;
  model?: string;
  age_years: number;
  power_watts: number;
  usage_hours_per_day: number;
  usage_days_per_week: number;
  efficiency_rating?: string; // Energy Star, EU label, etc.
  location?: string; // kitchen, garage, etc.
  is_smart: boolean;
  notes?: string;
}

export type ApplianceCategory = 
  | 'refrigerator'
  | 'freezer'
  | 'oven'
  | 'stove'
  | 'dishwasher'
  | 'washer'
  | 'dryer'
  | 'hvac_central'
  | 'hvac_window'
  | 'hvac_heat_pump'
  | 'water_heater'
  | 'lighting'
  | 'electronics'
  | 'pool_pump'
  | 'ev_charger'
  | 'other';

export interface EnergyAudit {
  id: string;
  household_id: string;
  total_annual_kwh: number;
  baseline_kwh: number;
  savings_potential_kwh: number;
  savings_potential_usd: number;
  recommendations: EnergyRecommendation[];
  created_at: string;
}

export interface EnergyRecommendation {
  id: string;
  appliance_id?: string;
  type: 'replace' | 'behavior' | 'maintenance' | 'smart_control';
  title: string;
  description: string;
  estimated_savings_kwh_year: number;
  estimated_savings_usd_year: number;
  upfront_cost_usd: number;
  payback_years: number;
  co2e_savings_kg_year: number;
  priority: 'high' | 'medium' | 'low';
  difficulty: 'easy' | 'moderate' | 'hard';
}

// ============ FOOD WASTE ============

export interface FoodWasteLog {
  id: string;
  user_id: string;
  household_id: string;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  meal_image_uri: string;
  waste_image_uri: string;
  plate_analysis: PlateAnalysis;
  waste_analysis: WasteAnalysis;
  avoidable_waste_kg: number;
  unavoidable_waste_kg: number;
  cost_usd: number;
  carbon_kg: number;
  logged_at: string;
}

export interface PlateAnalysis {
  total_food_kg: number;
  food_items: DetectedFoodItem[];
  plate_area_cm2: number;
  confidence: number;
}

export interface WasteAnalysis {
  total_waste_kg: number;
  waste_items: DetectedWasteItem[];
  waste_area_cm2: number;
  confidence: number;
}

export interface DetectedFoodItem {
  class_name: string;
  weight_kg: number;
  carbon_kg: number;
  bbox: BoundingBox; // [x, y, width, height] normalized 0-1
  mask?: number[]; // RLE encoded mask
  confidence: number;
}

export interface DetectedWasteItem {
  class_name: string;
  weight_kg: number;
  carbon_kg: number;
  avoidable: boolean;
  bbox: BoundingBox;
  mask?: number[];
  confidence: number;
}

export type BoundingBox = [number, number, number, number];

export interface FoodWasteStreak {
  user_id: string;
  current_streak_days: number;
  longest_streak_days: number;
  last_log_date: string;
  total_waste_avoided_kg: number;
  total_money_saved_usd: number;
  total_carbon_saved_kg: number;
}

// ============ DASHBOARD / AGGREGATION ============

export interface DashboardSummary {
  period: 'day' | 'week' | 'month' | 'year';
  start_date: string;
  end_date: string;
  carbon: CarbonSummary;
  energy: EnergySummary;
  food_waste: FoodWasteSummary;
  total_co2e_kg: number;
  vs_previous_period_pct: number;
  vs_target_pct: number;
}

export interface CarbonSummary {
  total_kg: number;
  by_category: Record<ProductCategory, number>;
  by_source: Record<'receipts' | 'transport' | 'energy' | 'other', number>;
  budget_kg: number;
  budget_used_pct: number;
}

export interface EnergySummary {
  total_kwh: number;
  electricity_kwh: number;
  gas_therms: number;
  cost_usd: number;
  vs_baseline_pct: number;
}

export interface FoodWasteSummary {
  total_kg: number;
  avoidable_kg: number;
  cost_usd: number;
  carbon_kg: number;
  meals_logged: number;
  streak_days: number;
}

// ============ API CONTRACTS ============

export interface ApiResponse<T> {
  data: T;
  meta?: {
    page?: number;
    per_page?: number;
    total?: number;
  };
  error?: ApiError;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  per_page: number;
  has_more: boolean;
}

// Request/Response types for each endpoint

export interface ScanReceiptRequest {
  image_base64: string;
  metadata?: {
    store_name?: string;
    total_amount?: number;
    currency?: string;
  };
}

export interface ScanReceiptResponse {
  scan_id: string;
  status: 'processing' | 'completed';
  items?: ReceiptItem[];
  total_carbon_kg?: number;
}

export interface SubmitEnergyBillRequest {
  billing_period_start: string;
  billing_period_end: string;
  electricity_kwh: number;
  gas_therms?: number;
  total_cost: number;
  utility_provider?: string;
  bill_image_base64?: string;
}

export interface SubmitEnergyBillResponse {
  bill_id: string;
  audit?: EnergyAudit;
}

export interface LogFoodWasteRequest {
  meal_type: FoodWasteLog['meal_type'];
  meal_image_base64: string;
  waste_image_base64: string;
}

export interface LogFoodWasteResponse {
  log_id: string;
  avoidable_waste_kg: number;
  cost_usd: number;
  carbon_kg: number;
  streak_days: number;
}

export interface GetDashboardRequest {
  period: 'day' | 'week' | 'month' | 'year';
  start_date?: string;
  household_id?: string;
}

export type GetDashboardResponse = DashboardSummary;