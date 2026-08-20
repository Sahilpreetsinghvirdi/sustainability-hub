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
