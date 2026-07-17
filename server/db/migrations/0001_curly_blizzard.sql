ALTER TYPE "public"."goal_type" ADD VALUE 'fiber_g' BEFORE 'budget_daily';--> statement-breakpoint
ALTER TABLE "meal_log_entries" ADD COLUMN "fiber_g" numeric(10, 2) DEFAULT '0' NOT NULL;--> statement-breakpoint
ALTER TABLE "meal_log_items" ADD COLUMN "fiber_g" numeric(10, 2) DEFAULT '0' NOT NULL;--> statement-breakpoint
ALTER TABLE "meals" ADD COLUMN "fiber_g" numeric(10, 2) DEFAULT '0' NOT NULL;