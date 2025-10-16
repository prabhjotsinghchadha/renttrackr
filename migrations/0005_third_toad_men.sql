-- Step 1: Add property_id column as nullable
ALTER TABLE "tenants" ADD COLUMN "property_id" uuid;--> statement-breakpoint

-- Step 2: Populate property_id from existing unit_id relationships
UPDATE "tenants" 
SET "property_id" = (
  SELECT "units"."property_id" 
  FROM "units" 
  WHERE "units"."id" = "tenants"."unit_id"
)
WHERE "unit_id" IS NOT NULL;--> statement-breakpoint

-- Step 3: Make property_id NOT NULL
ALTER TABLE "tenants" ALTER COLUMN "property_id" SET NOT NULL;--> statement-breakpoint

-- Step 4: Add foreign key constraint
ALTER TABLE "tenants" ADD CONSTRAINT "tenants_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;