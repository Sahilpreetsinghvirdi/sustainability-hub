// mobile/src/services/schema.ts
import { 
  sqliteTable, 
  text, 
  integer, 
  real, 
  primaryKey,
  index 
} from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';

// ============ USERS & HOUSEHOLDS ============

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  email: text('email').unique().notNull(),
  name: text('name').notNull(),
  passwordHash: text('password_hash').notNull(),
  householdId: text('household_id').references(() => households.id),
  preferencesJson: text('preferences_json').notNull().default('{}'),
  createdAt: text('created_at').notNull().default('datetime(\'now\')'),
  updatedAt: text('updated_at').notNull().default('datetime(\'now\')'),
  lastSyncAt: text('last_sync_at'),
}, (table) => ({
  householdIdx: index('idx_users_household').on(table.householdId),
}));

export const households = sqliteTable('households', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  locationJson: text('location_json'),
  createdAt: text('created_at').notNull().default('datetime(\'now\')'),
  updatedAt: text('updated_at').notNull().default('datetime(\'now\')'),
});

export const householdMembers = sqliteTable('household_members', {
  householdId: text('household_id').notNull().references(() => households.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  role: text('role').notNull().default('member'),
  joinedAt: text('joined_at').notNull().default('datetime(\'now\')'),
}, (table) => ({
  pk: primaryKey({ columns: [table.householdId, table.userId] }),
}));

// ============ CARBON / RECEIPTS ============

export const receiptScans = sqliteTable('receipt_scans', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  householdId: text('household_id').notNull().references(() => households.id, { onDelete: 'cascade' }),
  imageUri: text('image_uri').notNull(),
  ocrText: text('ocr_text'),
  totalCarbonKg: real('total_carbon_kg').notNull().default(0),
  currency: text('currency').notNull().default('USD'),
  totalAmount: real('total_amount').notNull().default(0),
  storeName: text('store_name'),
  scannedAt: text('scanned_at').notNull().default('datetime(\'now\')'),
  processedAt: text('processed_at'),
  status: text('status', { enum: ['pending', 'processing', 'completed', 'failed'] }).notNull().default('pending'),
  errorMessage: text('error_message'),
  syncedAt: text('synced_at'),
}, (table) => ({
  userDateIdx: index('idx_receipt_scans_user_date').on(table.userId, table.scannedAt),
  householdDateIdx: index('idx_receipt_scans_household_date').on(table.householdId, table.scannedAt),
  syncIdx: index('idx_receipt_scans_sync').on(table.syncedAt),
}));

export const receiptItems = sqliteTable('receipt_items', {
  id: text('id').primaryKey(),
  scanId: text('scan_id').notNull().references(() => receiptScans.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  quantity: real('quantity').notNull().default(1),
  unit: text('unit').notNull().default('item'),
  price: real('price').notNull().default(0),
  category: text('category').notNull(),
  carbonKg: real('carbon_kg').notNull().default(0),
  carbonSource: text('carbon_source', { 
    enum: ['openlca', 'ecoinvent', 'openfoodfacts', 'estimated', 'manual'] 
  }).notNull().default('estimated'),
  confidence: real('confidence').notNull().default(0.5),
  barcode: text('barcode'),
  matchedProductId: text('matched_product_id'),
  position: integer('position').notNull().default(0),
}, (table) => ({
  scanIdx: index('idx_receipt_items_scan').on(table.scanId),
}));

export const carbonFactors = sqliteTable('carbon_factors', {
  productCategory: text('product_category').primaryKey(),
  kgCo2ePerUnit: real('kg_co2e_per_unit').notNull(),
  unit: text('unit').notNull(),
  source: text('source').notNull(),
  region: text('region').notNull().default('US'),
  year: integer('year').notNull(),
  confidence: text('confidence', { enum: ['high', 'medium', 'low'] }).notNull().default('medium'),
  updatedAt: text('updated_at').notNull().default('datetime(\'now\')'),
});

// ============ ENERGY ============

export const energyBills = sqliteTable('energy_bills', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  householdId: text('household_id').notNull().references(() => households.id, { onDelete: 'cascade' }),
  billingPeriodStart: text('billing_period_start').notNull(),
  billingPeriodEnd: text('billing_period_end').notNull(),
  electricityKwh: real('electricity_kwh').notNull().default(0),
  gasTherms: real('gas_therms').default(0),
  waterGallons: real('water_gallons').default(0),
  totalCost: real('total_cost').notNull().default(0),
  currency: text('currency').notNull().default('USD'),
  utilityProvider: text('utility_provider'),
  billImageUri: text('bill_image_uri'),
  parsedDataJson: text('parsed_data_json'),
  createdAt: text('created_at').notNull().default('datetime(\'now\')'),
  syncedAt: text('synced_at'),
}, (table) => ({
  householdPeriodIdx: index('idx_energy_bills_household_period').on(table.householdId, table.billingPeriodStart),
  syncIdx: index('idx_energy_bills_sync').on(table.syncedAt),
}));

export const appliances = sqliteTable('appliances', {
  id: text('id').primaryKey(),
  householdId: text('household_id').notNull().references(() => households.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  category: text('category').notNull(),
  brand: text('brand'),
  model: text('model'),
  ageYears: integer('age_years').notNull().default(0),
  powerWatts: integer('power_watts').notNull().default(0),
  usageHoursPerDay: real('usage_hours_per_day').notNull().default(0),
  usageDaysPerWeek: integer('usage_days_per_week').notNull().default(7),
  efficiencyRating: text('efficiency_rating'),
  location: text('location'),
  isSmart: integer('is_smart', { mode: 'boolean' }).notNull().default(false),
  notes: text('notes'),
  createdAt: text('created_at').notNull().default('datetime(\'now\')'),
  updatedAt: text('updated_at').notNull().default('datetime(\'now\')'),
}, (table) => ({
  householdIdx: index('idx_appliances_household').on(table.householdId),
}));

export const energyAudits = sqliteTable('energy_audits', {
  id: text('id').primaryKey(),
  householdId: text('household_id').notNull().references(() => households.id, { onDelete: 'cascade' }),
  totalAnnualKwh: real('total_annual_kwh').notNull().default(0),
  baselineKwh: real('baseline_kwh').notNull().default(0),
  savingsPotentialKwh: real('savings_potential_kwh').notNull().default(0),
  savingsPotentialUsd: real('savings_potential_usd').notNull().default(0),
  recommendationsJson: text('recommendations_json').notNull().default('[]'),
  createdAt: text('created_at').notNull().default('datetime(\'now\')'),
});

// ============ FOOD WASTE ============

export const foodWasteLogs = sqliteTable('food_waste_logs', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  householdId: text('household_id').notNull().references(() => households.id, { onDelete: 'cascade' }),
  mealType: text('meal_type', { enum: ['breakfast', 'lunch', 'dinner', 'snack'] }).notNull(),
  mealImageUri: text('meal_image_uri').notNull(),
  wasteImageUri: text('waste_image_uri').notNull(),
  plateAnalysisJson: text('plate_analysis_json').notNull(),
  wasteAnalysisJson: text('waste_analysis_json').notNull(),
  avoidableWasteKg: real('avoidable_waste_kg').notNull().default(0),
  unavoidableWasteKg: real('unavoidable_waste_kg').notNull().default(0),
  costUsd: real('cost_usd').notNull().default(0),
  carbonKg: real('carbon_kg').notNull().default(0),
  loggedAt: text('logged_at').notNull().default('datetime(\'now\')'),
  syncedAt: text('synced_at'),
}, (table) => ({
  userDateIdx: index('idx_food_waste_user_date').on(table.userId, table.loggedAt),
  householdDateIdx: index('idx_food_waste_household_date').on(table.householdId, table.loggedAt),
  syncIdx: index('idx_food_waste_sync').on(table.syncedAt),
}));

export const foodWasteStreaks = sqliteTable('food_waste_streaks', {
  userId: text('user_id').primaryKey().references(() => users.id, { onDelete: 'cascade' }),
  currentStreakDays: integer('current_streak_days').notNull().default(0),
  longestStreakDays: integer('longest_streak_days').notNull().default(0),
  lastLogDate: text('last_log_date'),
  totalWasteAvoidedKg: real('total_waste_avoided_kg').notNull().default(0),
  totalMoneySavedUsd: real('total_money_saved_usd').notNull().default(0),
  totalCarbonSavedKg: real('total_carbon_saved_kg').notNull().default(0),
  updatedAt: text('updated_at').notNull().default('datetime(\'now\')'),
});

// ============ SYNC & METADATA ============

export const syncQueue = sqliteTable('sync_queue', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  tableName: text('table_name').notNull(),
  recordId: text('record_id').notNull(),
  operation: text('operation', { enum: ['insert', 'update', 'delete'] }).notNull(),
  payloadJson: text('payload_json'),
  createdAt: text('created_at').notNull().default('datetime(\'now\')'),
  retries: integer('retries').notNull().default(0),
  lastError: text('last_error'),
}, (table) => ({
  pendingIdx: index('idx_sync_queue_pending').on(table.createdAt),
}));

export const appMetadata = sqliteTable('app_metadata', {
  key: text('key').primaryKey(),
  valueJson: text('value_json').notNull(),
  updatedAt: text('updated_at').notNull().default('datetime(\'now\')'),
});

// ============ RELATIONS ============

export const usersRelations = relations(users, ({ one, many }) => ({
  household: one(households, { fields: [users.householdId], references: [households.id] }),
  receiptScans: many(receiptScans),
  energyBills: many(energyBills),
  foodWasteLogs: many(foodWasteLogs),
  foodWasteStreak: one(foodWasteStreaks, { fields: [users.id], references: [foodWasteStreaks.userId] }),
}));

export const householdsRelations = relations(households, ({ many }) => ({
  members: many(householdMembers),
  receiptScans: many(receiptScans),
  energyBills: many(energyBills),
  appliances: many(appliances),
  energyAudits: many(energyAudits),
  foodWasteLogs: many(foodWasteLogs),
}));

export const receiptScansRelations = relations(receiptScans, ({ one, many }) => ({
  user: one(users, { fields: [receiptScans.userId], references: [users.id] }),
  household: one(households, { fields: [receiptScans.householdId], references: [households.id] }),
  items: many(receiptItems),
}));

export const receiptItemsRelations = relations(receiptItems, ({ one }) => ({
  scan: one(receiptScans, { fields: [receiptItems.scanId], references: [receiptScans.id] }),
}));

export const energyBillsRelations = relations(energyBills, ({ one }) => ({
  user: one(users, { fields: [energyBills.userId], references: [users.id] }),
  household: one(households, { fields: [energyBills.householdId], references: [households.id] }),
}));

export const appliancesRelations = relations(appliances, ({ one }) => ({
  household: one(households, { fields: [appliances.householdId], references: [households.id] }),
}));

export const foodWasteLogsRelations = relations(foodWasteLogs, ({ one }) => ({
  user: one(users, { fields: [foodWasteLogs.userId], references: [users.id] }),
  household: one(households, { fields: [foodWasteLogs.householdId], references: [households.id] }),
}));

export const foodWasteStreaksRelations = relations(foodWasteStreaks, ({ one }) => ({
  user: one(users, { fields: [foodWasteStreaks.userId], references: [users.id] }),
}));

// Types
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Household = typeof households.$inferSelect;
export type ReceiptScan = typeof receiptScans.$inferSelect;
export type NewReceiptScan = typeof receiptScans.$inferInsert;
export type ReceiptItem = typeof receiptItems.$inferSelect;
export type EnergyBill = typeof energyBills.$inferSelect;
export type Appliance = typeof appliances.$inferSelect;
export type FoodWasteLog = typeof foodWasteLogs.$inferSelect;
export type FoodWasteStreak = typeof foodWasteStreaks.$inferSelect;
export type SyncQueueItem = typeof syncQueue.$inferSelect;
