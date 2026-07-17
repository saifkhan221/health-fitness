CREATE TYPE "public"."activity_level" AS ENUM('sedentary', 'light', 'moderate', 'active', 'very_active');--> statement-breakpoint
CREATE TYPE "public"."canonical_unit" AS ENUM('g', 'ml', 'piece');--> statement-breakpoint
CREATE TYPE "public"."goal_type" AS ENUM('kcal', 'protein_g', 'carbs_g', 'fat_g', 'budget_daily', 'budget_weekly', 'budget_monthly', 'weight_kg');--> statement-breakpoint
CREATE TYPE "public"."ingredient_source" AS ENUM('seed', 'user', 'verified');--> statement-breakpoint
CREATE TYPE "public"."log_status" AS ENUM('planned', 'logged');--> statement-breakpoint
CREATE TYPE "public"."meal_type" AS ENUM('breakfast', 'morning_snack', 'lunch', 'evening_snack', 'dinner');--> statement-breakpoint
CREATE TYPE "public"."sex" AS ENUM('male', 'female', 'other');--> statement-breakpoint
CREATE TYPE "public"."inventory_tx_type" AS ENUM('purchase', 'consumption', 'adjustment', 'waste');--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "fitness_records" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"metric_id" uuid NOT NULL,
	"value" numeric(10, 2) NOT NULL,
	"recorded_at" timestamp with time zone DEFAULT now() NOT NULL,
	"note" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "goals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"goal_type" "goal_type" NOT NULL,
	"target_value" numeric(14, 2) NOT NULL,
	"effective_from" date NOT NULL,
	"effective_to" date,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ingredient_units" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ingredient_id" uuid NOT NULL,
	"unit_name" text NOT NULL,
	"qty_canonical" numeric(10, 3) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ingredients" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"name" text NOT NULL,
	"category" text,
	"canonical_unit" "canonical_unit" NOT NULL,
	"piece_weight_g" numeric(8, 2),
	"density_g_per_ml" numeric(6, 3),
	"kcal" numeric(8, 2) NOT NULL,
	"protein_g" numeric(8, 2) DEFAULT '0' NOT NULL,
	"carbs_g" numeric(8, 2) DEFAULT '0' NOT NULL,
	"fat_g" numeric(8, 2) DEFAULT '0' NOT NULL,
	"fiber_g" numeric(8, 2) DEFAULT '0' NOT NULL,
	"micros" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"source" "ingredient_source" DEFAULT 'user' NOT NULL,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "inventory_transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"ingredient_id" uuid NOT NULL,
	"type" "inventory_tx_type" NOT NULL,
	"qty_delta" numeric(12, 3) NOT NULL,
	"cost_paise" bigint DEFAULT 0 NOT NULL,
	"purchase_id" uuid,
	"meal_log_item_id" uuid,
	"occurred_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "meal_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"meal_id" uuid NOT NULL,
	"ingredient_id" uuid NOT NULL,
	"qty_canonical" numeric(12, 3) NOT NULL,
	"display_qty" numeric(10, 3) NOT NULL,
	"display_unit" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "meal_log_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"entry_date" date NOT NULL,
	"meal_type" "meal_type" NOT NULL,
	"status" "log_status" DEFAULT 'logged' NOT NULL,
	"meal_id" uuid,
	"logged_at" timestamp with time zone,
	"kcal" numeric(10, 2) DEFAULT '0' NOT NULL,
	"protein_g" numeric(10, 2) DEFAULT '0' NOT NULL,
	"carbs_g" numeric(10, 2) DEFAULT '0' NOT NULL,
	"fat_g" numeric(10, 2) DEFAULT '0' NOT NULL,
	"cost_paise" bigint DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "meal_log_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"entry_id" uuid NOT NULL,
	"ingredient_id" uuid NOT NULL,
	"qty_canonical" numeric(12, 3) NOT NULL,
	"display_qty" numeric(10, 3) NOT NULL,
	"display_unit" text NOT NULL,
	"kcal" numeric(10, 2) NOT NULL,
	"protein_g" numeric(10, 2) NOT NULL,
	"carbs_g" numeric(10, 2) NOT NULL,
	"fat_g" numeric(10, 2) NOT NULL,
	"micros" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"cost_paise" bigint,
	"estimated_cost" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "meals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" text NOT NULL,
	"meal_type_hint" "meal_type",
	"recipe_id" uuid,
	"kcal" numeric(10, 2) DEFAULT '0' NOT NULL,
	"protein_g" numeric(10, 2) DEFAULT '0' NOT NULL,
	"carbs_g" numeric(10, 2) DEFAULT '0' NOT NULL,
	"fat_g" numeric(10, 2) DEFAULT '0' NOT NULL,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "metric_definitions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"key" text NOT NULL,
	"label" text NOT NULL,
	"unit" text NOT NULL,
	"min_value" numeric(10, 2),
	"max_value" numeric(10, 2),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "notification_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"channel" text DEFAULT 'whatsapp' NOT NULL,
	"direction" text DEFAULT 'outbound' NOT NULL,
	"template_name" text,
	"provider_message_id" text,
	"status" text DEFAULT 'queued' NOT NULL,
	"payload" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"sent_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "notification_preferences" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"whatsapp_opted_in" boolean DEFAULT false NOT NULL,
	"phone_verified" boolean DEFAULT false NOT NULL,
	"daily_summary_enabled" boolean DEFAULT false NOT NULL,
	"daily_summary_time" time DEFAULT '21:00' NOT NULL,
	"meal_reminders" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"low_stock_alerts" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "purchases" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"ingredient_id" uuid NOT NULL,
	"purchased_at" date NOT NULL,
	"qty_canonical" numeric(12, 3) NOT NULL,
	"qty_remaining" numeric(12, 3) NOT NULL,
	"price_paise" bigint NOT NULL,
	"display_qty" numeric(10, 3) NOT NULL,
	"display_unit" text NOT NULL,
	"vendor" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "recipe_ingredients" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"recipe_id" uuid NOT NULL,
	"ingredient_id" uuid NOT NULL,
	"qty_canonical" numeric(12, 3) NOT NULL,
	"display_qty" numeric(10, 3) NOT NULL,
	"display_unit" text NOT NULL,
	"note" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "recipe_photos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"recipe_id" uuid NOT NULL,
	"storage_key" text NOT NULL,
	"position" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "recipe_steps" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"recipe_id" uuid NOT NULL,
	"position" integer NOT NULL,
	"instruction" text NOT NULL,
	"photo_key" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "recipes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"servings" integer DEFAULT 1 NOT NULL,
	"prep_min" integer,
	"cook_min" integer,
	"tags" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"is_public" boolean DEFAULT false NOT NULL,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_profiles" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"display_name" text,
	"phone_e164" text,
	"timezone" text DEFAULT 'Asia/Kolkata' NOT NULL,
	"height_cm" numeric(5, 1),
	"date_of_birth" date,
	"sex" "sex",
	"activity_level" "activity_level" DEFAULT 'sedentary' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "fitness_records" ADD CONSTRAINT "fitness_records_metric_id_metric_definitions_id_fk" FOREIGN KEY ("metric_id") REFERENCES "public"."metric_definitions"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ingredient_units" ADD CONSTRAINT "ingredient_units_ingredient_id_ingredients_id_fk" FOREIGN KEY ("ingredient_id") REFERENCES "public"."ingredients"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "inventory_transactions" ADD CONSTRAINT "inventory_transactions_ingredient_id_ingredients_id_fk" FOREIGN KEY ("ingredient_id") REFERENCES "public"."ingredients"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "inventory_transactions" ADD CONSTRAINT "inventory_transactions_purchase_id_purchases_id_fk" FOREIGN KEY ("purchase_id") REFERENCES "public"."purchases"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "meal_items" ADD CONSTRAINT "meal_items_meal_id_meals_id_fk" FOREIGN KEY ("meal_id") REFERENCES "public"."meals"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "meal_items" ADD CONSTRAINT "meal_items_ingredient_id_ingredients_id_fk" FOREIGN KEY ("ingredient_id") REFERENCES "public"."ingredients"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "meal_log_entries" ADD CONSTRAINT "meal_log_entries_meal_id_meals_id_fk" FOREIGN KEY ("meal_id") REFERENCES "public"."meals"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "meal_log_items" ADD CONSTRAINT "meal_log_items_entry_id_meal_log_entries_id_fk" FOREIGN KEY ("entry_id") REFERENCES "public"."meal_log_entries"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "meal_log_items" ADD CONSTRAINT "meal_log_items_ingredient_id_ingredients_id_fk" FOREIGN KEY ("ingredient_id") REFERENCES "public"."ingredients"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "purchases" ADD CONSTRAINT "purchases_ingredient_id_ingredients_id_fk" FOREIGN KEY ("ingredient_id") REFERENCES "public"."ingredients"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "recipe_ingredients" ADD CONSTRAINT "recipe_ingredients_recipe_id_recipes_id_fk" FOREIGN KEY ("recipe_id") REFERENCES "public"."recipes"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "recipe_ingredients" ADD CONSTRAINT "recipe_ingredients_ingredient_id_ingredients_id_fk" FOREIGN KEY ("ingredient_id") REFERENCES "public"."ingredients"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "recipe_photos" ADD CONSTRAINT "recipe_photos_recipe_id_recipes_id_fk" FOREIGN KEY ("recipe_id") REFERENCES "public"."recipes"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "recipe_steps" ADD CONSTRAINT "recipe_steps_recipe_id_recipes_id_fk" FOREIGN KEY ("recipe_id") REFERENCES "public"."recipes"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "fitness_trend_idx" ON "fitness_records" USING btree ("user_id","metric_id","recorded_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "goals_user_idx" ON "goals" USING btree ("user_id","goal_type");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "ingredient_units_uniq" ON "ingredient_units" USING btree ("ingredient_id","unit_name");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "ingredients_user_idx" ON "ingredients" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "ingredients_name_idx" ON "ingredients" USING btree ("name");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "inventory_tx_ing_idx" ON "inventory_transactions" USING btree ("user_id","ingredient_id","occurred_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "meal_items_meal_idx" ON "meal_items" USING btree ("meal_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "log_entries_calendar_idx" ON "meal_log_entries" USING btree ("user_id","entry_date");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "log_items_entry_idx" ON "meal_log_items" USING btree ("entry_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "meals_user_idx" ON "meals" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "metric_defs_uniq" ON "metric_definitions" USING btree ("user_id","key");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "notification_log_user_idx" ON "notification_log" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "purchases_user_idx" ON "purchases" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "purchases_fifo_idx" ON "purchases" USING btree ("ingredient_id","purchased_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "recipe_ingredients_recipe_idx" ON "recipe_ingredients" USING btree ("recipe_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "recipe_steps_recipe_idx" ON "recipe_steps" USING btree ("recipe_id","position");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "recipes_user_idx" ON "recipes" USING btree ("user_id");