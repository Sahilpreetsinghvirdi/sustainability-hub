export interface CarbonScan {
  id: string;
  date: string;
  store_name: string;
  items: CarbonItem[];
  total_carbon_kg: number;
  total_price: number;
  image_url?: string;
  status: 'draft' | 'confirmed' | 'estimated';
}

export interface CarbonItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit_price: number;
  carbon_kg: number;
  confidence: number;
}

export interface EnergyBill {
  id: string;
  provider: string;
  billing_period_start: string;
  billing_period_end: string;
  electricity_kwh: number;
  gas_therms: number;
  water_gallons: number;
  total_cost: number;
  carbon_kg: number;
}

export interface EnergyAppliance {
  id: string;
  name: string;
  type: string;
  wattage: number;
  hours_per_day: number;
  energy_star: boolean;
  estimated_annual_kwh: number;
  efficiency_score: number;
}

export interface FoodWasteLog {
  id: string;
  date: string;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  description: string;
  wasted_amount_grams: number;
  reason: string;
  category: string;
  photo_url?: string;
  ai_analysis?: {
    waste_category: string;
    estimated_weight_grams: number;
    suggestions: string[];
    carbon_impact_kg: number;
  };
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
  household_size: number;
  location: string;
  dietary_preference: string;
}

export interface DashboardSummary {
  total_carbon_month: number;
  total_energy_month: number;
  total_waste_week: number;
  streak_days: number;
  carbon_trend: number[];
  energy_trend: number[];
  waste_trend: number[];
}

// ============ AI WASTE ANALYZER ============

export type HazardLevel = 'low' | 'medium' | 'high' | 'critical';

export interface HazardInfo {
  level: HazardLevel;
  score: number; // 0-100
  toxins: string[];
  health_risks: string[];
  environmental_risks?: string[];
}

export interface DisposalInfo {
  method: string;
  destination: string;
  recyclable: boolean;
}

export interface MaterialAnalysis {
  name: string;
  category: string;
  percentage: number;
  confidence: number;
  description: string;
  hazard: HazardInfo;
  common_uses: string[];
  reuse_ideas: string[];
  eco_alternatives: string[];
  disposal: DisposalInfo;
}

export interface WasteAnalysisResponse {
  summary: string;
  overall_hazard: HazardInfo;
  materials: MaterialAnalysis[];
  recommendations: string[];
  environmental_impact: string;
  estimated_decomposition?: string | null;
  analyzer_model: string;
  processing_time_ms: number;
}

// ============ AGRISENSE — FERTILIZER ADVISOR ============

export type Suitability =
  | 'beneficial'
  | 'conditionally_beneficial'
  | 'neutral'
  | 'harmful';

export interface ProductIdentification {
  name: string;
  type: string;
  confidence: number;
  description: string;
}

export interface NutrientProfile {
  npk: string;
  organic_matter?: string | null;
  micronutrients: string[];
  ph_effect: string;
}

export interface SuitabilityVerdict {
  suitability: Suitability;
  score: number; // 0-100
  reasoning: string;
}

export interface CropFit {
  suitable_for_current_crop: boolean;
  explanation: string;
}

export interface ApplicationStep {
  title: string;
  detail: string;
}

export interface AgriAnalysisResponse {
  summary: string;
  product_identification: ProductIdentification;
  nutrient_profile: NutrientProfile;
  verdict: SuitabilityVerdict;
  crop_fit: CropFit;
  benefits: string[];
  risks_cautions: string[];
  application_guidance: ApplicationStep[];
  dosage: string;
  best_timing: string;
  alternatives: string[];
  environmental_notes: string;
  recommendations: string[];
  analyzer_model: string;
  processing_time_ms: number;
}
