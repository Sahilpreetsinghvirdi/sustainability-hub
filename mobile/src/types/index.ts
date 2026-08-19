// mobile/src/types/index.ts
// Re-exports from shared types + mobile-specific types

export {
  User,
  UserPreferences,
  Household,
  GeoLocation,
  ReceiptScan,
  ReceiptItem,
  ProductCategory,
  CarbonFactor,
  EnergyBill,
  ParsedBillData,
  TierUsage,
  Appliance,
  ApplianceCategory,
  EnergyAudit,
  EnergyRecommendation,
  FoodWasteLog,
  PlateAnalysis,
  WasteAnalysis,
  DetectedFoodItem,
  DetectedWasteItem,
  BoundingBox,
  FoodWasteStreak,
  DashboardSummary,
  CarbonSummary,
  EnergySummary,
  FoodWasteSummary,
  ApiResponse,
  ApiError,
  PaginatedResponse,
  ScanReceiptRequest,
  ScanReceiptResponse,
  SubmitEnergyBillRequest,
  SubmitEnergyBillResponse,
  LogFoodWasteRequest,
  LogFoodWasteResponse,
  GetDashboardRequest,
  GetDashboardResponse,
} from '../../../shared/types';

// Mobile-specific types
export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export type SyncStatus = {
  last_sync_at: string | null;
  pending_changes: number;
  is_online: boolean;
  conflicts: number;
};

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';
