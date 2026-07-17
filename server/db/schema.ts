import {
  pgTable,
  uuid,
  text,
  boolean,
  bigint,
  integer,
  numeric,
  date,
  time,
  timestamp,
  jsonb,
  pgEnum,
  index,
  uniqueIndex,
} from 'drizzle-orm/pg-core'
import { sql } from 'drizzle-orm'

// Conventions (see plan):
// - Money: integer paise (bigint). Never floats. ₹40.00 = 4000.
// - Quantities: numeric(12,3) in the ingredient's canonical unit (g | ml | piece).
// - Supabase Auth owns auth.users; user_id columns reference auth.users.id (uuid).
//   FK to auth schema is added in SQL migration; here it's a plain uuid.

export const canonicalUnit = pgEnum('canonical_unit', ['g', 'ml', 'piece'])
export const activityLevel = pgEnum('activity_level', [
  'sedentary',
  'light',
  'moderate',
  'active',
  'very_active',
])
export const sexEnum = pgEnum('sex', ['male', 'female', 'other'])
export const ingredientSource = pgEnum('ingredient_source', [
  'seed',
  'user',
  'verified',
])
export const mealType = pgEnum('meal_type', [
  'breakfast',
  'morning_snack',
  'lunch',
  'evening_snack',
  'dinner',
])
export const logStatus = pgEnum('log_status', ['planned', 'logged'])
export const txType = pgEnum('inventory_tx_type', [
  'purchase',
  'consumption',
  'adjustment',
  'waste',
])
export const goalType = pgEnum('goal_type', [
  'kcal',
  'protein_g',
  'carbs_g',
  'fat_g',
  'fiber_g',
  'budget_daily',
  'budget_weekly',
  'budget_monthly',
  'weight_kg',
])

const timestamps = {
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}

// ---------- Profile ----------

export const userProfiles = pgTable('user_profiles', {
  userId: uuid('user_id').primaryKey(), // = auth.users.id
  displayName: text('display_name'),
  phoneE164: text('phone_e164'),
  timezone: text('timezone').default('Asia/Kolkata').notNull(),
  heightCm: numeric('height_cm', { precision: 5, scale: 1 }),
  dateOfBirth: date('date_of_birth'),
  sex: sexEnum('sex'),
  activityLevel: activityLevel('activity_level').default('sedentary').notNull(),
  ...timestamps,
})

// ---------- Ingredients & units ----------

export const ingredients = pgTable(
  'ingredients',
  {
    id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
    userId: uuid('user_id'), // NULL = global seeded ingredient
    name: text('name').notNull(),
    category: text('category'), // 'vegetable' | 'dal' | 'dairy' | 'oil' | 'spice' | ...
    canonicalUnit: canonicalUnit('canonical_unit').notNull(),
    pieceWeightG: numeric('piece_weight_g', { precision: 8, scale: 2 }), // required when canonical_unit='piece'
    densityGPerMl: numeric('density_g_per_ml', { precision: 6, scale: 3 }),
    // Nutrition per 100 g (or 100 ml for liquids)
    kcal: numeric('kcal', { precision: 8, scale: 2 }).notNull(),
    proteinG: numeric('protein_g', { precision: 8, scale: 2 }).default('0').notNull(),
    carbsG: numeric('carbs_g', { precision: 8, scale: 2 }).default('0').notNull(),
    fatG: numeric('fat_g', { precision: 8, scale: 2 }).default('0').notNull(),
    fiberG: numeric('fiber_g', { precision: 8, scale: 2 }).default('0').notNull(),
    micros: jsonb('micros').$type<Record<string, number>>().default({}).notNull(),
    source: ingredientSource('source').default('user').notNull(),
    isDeleted: boolean('is_deleted').default(false).notNull(),
    ...timestamps,
  },
  (t) => [
    index('ingredients_user_idx').on(t.userId),
    index('ingredients_name_idx').on(t.name),
  ],
)

export const ingredientUnits = pgTable(
  'ingredient_units',
  {
    id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
    ingredientId: uuid('ingredient_id')
      .notNull()
      .references(() => ingredients.id, { onDelete: 'cascade' }),
    unitName: text('unit_name').notNull(), // "medium", "katori", "tbsp", "roti"
    qtyCanonical: numeric('qty_canonical', { precision: 10, scale: 3 }).notNull(), // 1 unit = N canonical
    ...timestamps,
  },
  (t) => [uniqueIndex('ingredient_units_uniq').on(t.ingredientId, t.unitName)],
)

// ---------- Purchases (inventory lots, FIFO) ----------

export const purchases = pgTable(
  'purchases',
  {
    id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
    userId: uuid('user_id').notNull(),
    ingredientId: uuid('ingredient_id')
      .notNull()
      .references(() => ingredients.id),
    purchasedAt: date('purchased_at').notNull(),
    qtyCanonical: numeric('qty_canonical', { precision: 12, scale: 3 }).notNull(),
    qtyRemaining: numeric('qty_remaining', { precision: 12, scale: 3 }).notNull(),
    pricePaise: bigint('price_paise', { mode: 'number' }).notNull(),
    displayQty: numeric('display_qty', { precision: 10, scale: 3 }).notNull(),
    displayUnit: text('display_unit').notNull(), // "kg", "L", "dozen" — what the user typed
    vendor: text('vendor'),
    ...timestamps,
  },
  (t) => [
    index('purchases_user_idx').on(t.userId),
    index('purchases_fifo_idx').on(t.ingredientId, t.purchasedAt),
  ],
)

export const inventoryTransactions = pgTable(
  'inventory_transactions',
  {
    id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
    userId: uuid('user_id').notNull(),
    ingredientId: uuid('ingredient_id')
      .notNull()
      .references(() => ingredients.id),
    type: txType('type').notNull(),
    qtyDelta: numeric('qty_delta', { precision: 12, scale: 3 }).notNull(), // + purchase, − consumption
    costPaise: bigint('cost_paise', { mode: 'number' }).default(0).notNull(),
    purchaseId: uuid('purchase_id').references(() => purchases.id),
    mealLogItemId: uuid('meal_log_item_id'), // FK added in migration (circular)
    occurredAt: timestamp('occurred_at', { withTimezone: true }).defaultNow().notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index('inventory_tx_ing_idx').on(t.userId, t.ingredientId, t.occurredAt)],
)

// ---------- Meals (quick-log library) ----------

export const meals = pgTable(
  'meals',
  {
    id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
    userId: uuid('user_id').notNull(),
    name: text('name').notNull(),
    mealTypeHint: mealType('meal_type_hint'),
    recipeId: uuid('recipe_id'), // provenance link, FK in migration
    // Cached totals, recomputed on item edit
    kcal: numeric('kcal', { precision: 10, scale: 2 }).default('0').notNull(),
    proteinG: numeric('protein_g', { precision: 10, scale: 2 }).default('0').notNull(),
    carbsG: numeric('carbs_g', { precision: 10, scale: 2 }).default('0').notNull(),
    fatG: numeric('fat_g', { precision: 10, scale: 2 }).default('0').notNull(),
    fiberG: numeric('fiber_g', { precision: 10, scale: 2 }).default('0').notNull(),
    isDeleted: boolean('is_deleted').default(false).notNull(),
    ...timestamps,
  },
  (t) => [index('meals_user_idx').on(t.userId)],
)

export const mealItems = pgTable(
  'meal_items',
  {
    id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
    mealId: uuid('meal_id')
      .notNull()
      .references(() => meals.id, { onDelete: 'cascade' }),
    ingredientId: uuid('ingredient_id')
      .notNull()
      .references(() => ingredients.id),
    qtyCanonical: numeric('qty_canonical', { precision: 12, scale: 3 }).notNull(),
    displayQty: numeric('display_qty', { precision: 10, scale: 3 }).notNull(),
    displayUnit: text('display_unit').notNull(),
  },
  (t) => [index('meal_items_meal_idx').on(t.mealId)],
)

// ---------- Recipes ----------

export const recipes = pgTable(
  'recipes',
  {
    id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
    userId: uuid('user_id').notNull(),
    title: text('title').notNull(),
    description: text('description'),
    servings: integer('servings').default(1).notNull(),
    prepMin: integer('prep_min'),
    cookMin: integer('cook_min'),
    tags: jsonb('tags').$type<string[]>().default([]).notNull(),
    isPublic: boolean('is_public').default(false).notNull(),
    isDeleted: boolean('is_deleted').default(false).notNull(),
    ...timestamps,
  },
  (t) => [index('recipes_user_idx').on(t.userId)],
)

export const recipeIngredients = pgTable(
  'recipe_ingredients',
  {
    id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
    recipeId: uuid('recipe_id')
      .notNull()
      .references(() => recipes.id, { onDelete: 'cascade' }),
    ingredientId: uuid('ingredient_id')
      .notNull()
      .references(() => ingredients.id),
    qtyCanonical: numeric('qty_canonical', { precision: 12, scale: 3 }).notNull(),
    displayQty: numeric('display_qty', { precision: 10, scale: 3 }).notNull(),
    displayUnit: text('display_unit').notNull(),
    note: text('note'),
  },
  (t) => [index('recipe_ingredients_recipe_idx').on(t.recipeId)],
)

export const recipeSteps = pgTable(
  'recipe_steps',
  {
    id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
    recipeId: uuid('recipe_id')
      .notNull()
      .references(() => recipes.id, { onDelete: 'cascade' }),
    position: integer('position').notNull(),
    instruction: text('instruction').notNull(),
    photoKey: text('photo_key'),
  },
  (t) => [index('recipe_steps_recipe_idx').on(t.recipeId, t.position)],
)

export const recipePhotos = pgTable('recipe_photos', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  recipeId: uuid('recipe_id')
    .notNull()
    .references(() => recipes.id, { onDelete: 'cascade' }),
  storageKey: text('storage_key').notNull(),
  position: integer('position').default(0).notNull(),
})

// ---------- Meal log (calendar slots: planned | logged) ----------

export const mealLogEntries = pgTable(
  'meal_log_entries',
  {
    id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
    userId: uuid('user_id').notNull(),
    entryDate: date('entry_date').notNull(),
    mealType: mealType('meal_type').notNull(),
    status: logStatus('status').default('logged').notNull(),
    mealId: uuid('meal_id').references(() => meals.id),
    loggedAt: timestamp('logged_at', { withTimezone: true }),
    // Cached rollups from items
    kcal: numeric('kcal', { precision: 10, scale: 2 }).default('0').notNull(),
    proteinG: numeric('protein_g', { precision: 10, scale: 2 }).default('0').notNull(),
    carbsG: numeric('carbs_g', { precision: 10, scale: 2 }).default('0').notNull(),
    fatG: numeric('fat_g', { precision: 10, scale: 2 }).default('0').notNull(),
    fiberG: numeric('fiber_g', { precision: 10, scale: 2 }).default('0').notNull(),
    costPaise: bigint('cost_paise', { mode: 'number' }).default(0).notNull(),
    ...timestamps,
  },
  (t) => [index('log_entries_calendar_idx').on(t.userId, t.entryDate)],
)

export const mealLogItems = pgTable(
  'meal_log_items',
  {
    id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
    entryId: uuid('entry_id')
      .notNull()
      .references(() => mealLogEntries.id, { onDelete: 'cascade' }),
    ingredientId: uuid('ingredient_id')
      .notNull()
      .references(() => ingredients.id),
    qtyCanonical: numeric('qty_canonical', { precision: 12, scale: 3 }).notNull(),
    displayQty: numeric('display_qty', { precision: 10, scale: 3 }).notNull(),
    displayUnit: text('display_unit').notNull(),
    // Nutrition SNAPSHOT at log time — library edits must never rewrite history
    kcal: numeric('kcal', { precision: 10, scale: 2 }).notNull(),
    proteinG: numeric('protein_g', { precision: 10, scale: 2 }).notNull(),
    carbsG: numeric('carbs_g', { precision: 10, scale: 2 }).notNull(),
    fatG: numeric('fat_g', { precision: 10, scale: 2 }).notNull(),
    fiberG: numeric('fiber_g', { precision: 10, scale: 2 }).default('0').notNull(),
    micros: jsonb('micros').$type<Record<string, number>>().default({}).notNull(),
    costPaise: bigint('cost_paise', { mode: 'number' }), // filled when status→logged
    estimatedCost: boolean('estimated_cost').default(false).notNull(),
  },
  (t) => [index('log_items_entry_idx').on(t.entryId)],
)

// ---------- Fitness ----------

export const metricDefinitions = pgTable(
  'metric_definitions',
  {
    id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
    userId: uuid('user_id'), // NULL = built-in
    key: text('key').notNull(), // 'weight_kg', 'waist_cm', ...
    label: text('label').notNull(),
    unit: text('unit').notNull(),
    minValue: numeric('min_value', { precision: 10, scale: 2 }),
    maxValue: numeric('max_value', { precision: 10, scale: 2 }),
    ...timestamps,
  },
  (t) => [uniqueIndex('metric_defs_uniq').on(t.userId, t.key)],
)

export const fitnessRecords = pgTable(
  'fitness_records',
  {
    id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
    userId: uuid('user_id').notNull(),
    metricId: uuid('metric_id')
      .notNull()
      .references(() => metricDefinitions.id),
    value: numeric('value', { precision: 10, scale: 2 }).notNull(),
    recordedAt: timestamp('recorded_at', { withTimezone: true }).defaultNow().notNull(),
    note: text('note'),
  },
  (t) => [index('fitness_trend_idx').on(t.userId, t.metricId, t.recordedAt)],
)

// ---------- Goals (versioned) ----------

export const goals = pgTable(
  'goals',
  {
    id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
    userId: uuid('user_id').notNull(),
    goalType: goalType('goal_type').notNull(),
    targetValue: numeric('target_value', { precision: 14, scale: 2 }).notNull(), // budgets in paise
    effectiveFrom: date('effective_from').notNull(),
    effectiveTo: date('effective_to'), // NULL = current
    ...timestamps,
  },
  (t) => [index('goals_user_idx').on(t.userId, t.goalType)],
)

// ---------- Notifications ----------

export const notificationPreferences = pgTable('notification_preferences', {
  userId: uuid('user_id').primaryKey(),
  whatsappOptedIn: boolean('whatsapp_opted_in').default(false).notNull(),
  phoneVerified: boolean('phone_verified').default(false).notNull(),
  dailySummaryEnabled: boolean('daily_summary_enabled').default(false).notNull(),
  dailySummaryTime: time('daily_summary_time').default('21:00').notNull(),
  mealReminders: jsonb('meal_reminders')
    .$type<Partial<Record<string, string | null>>>()
    .default({})
    .notNull(),
  lowStockAlerts: boolean('low_stock_alerts').default(false).notNull(),
  ...timestamps,
})

export const notificationLog = pgTable(
  'notification_log',
  {
    id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
    userId: uuid('user_id').notNull(),
    channel: text('channel').default('whatsapp').notNull(),
    direction: text('direction').default('outbound').notNull(), // outbound | inbound (24h window tracking)
    templateName: text('template_name'),
    providerMessageId: text('provider_message_id'),
    status: text('status').default('queued').notNull(),
    payload: jsonb('payload').default({}).notNull(),
    sentAt: timestamp('sent_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index('notification_log_user_idx').on(t.userId, t.createdAt)],
)
