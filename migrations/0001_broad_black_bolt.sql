CREATE TABLE "parking_activity" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"parking_permit_id" uuid NOT NULL,
	"note" varchar(1000) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "parking_permits" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"property_id" uuid NOT NULL,
	"tenant_id" uuid,
	"building" varchar(100),
	"permit_number" varchar(50) NOT NULL,
	"status" varchar(50) DEFAULT 'Active',
	"vehicle_make" varchar(100),
	"vehicle_model" varchar(100),
	"vehicle_year" varchar(10),
	"vehicle_color" varchar(100),
	"license_plate" varchar(50),
	"comments" varchar(2000),
	"issued_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "renovation_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"renovation_id" uuid NOT NULL,
	"category" varchar(255) NOT NULL,
	"description" varchar(1000),
	"vendor" varchar(255),
	"quantity" integer DEFAULT 1,
	"unit_cost" real,
	"total_cost" real,
	"purchase_date" timestamp,
	"notes" varchar(1000),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "renovations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"property_id" uuid NOT NULL,
	"unit_id" uuid,
	"title" varchar(255) NOT NULL,
	"start_date" timestamp,
	"end_date" timestamp,
	"total_cost" real DEFAULT 0,
	"notes" varchar(1000),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "parking_activity" ADD CONSTRAINT "parking_activity_parking_permit_id_parking_permits_id_fk" FOREIGN KEY ("parking_permit_id") REFERENCES "public"."parking_permits"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "parking_permits" ADD CONSTRAINT "parking_permits_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "parking_permits" ADD CONSTRAINT "parking_permits_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "renovation_items" ADD CONSTRAINT "renovation_items_renovation_id_renovations_id_fk" FOREIGN KEY ("renovation_id") REFERENCES "public"."renovations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "renovations" ADD CONSTRAINT "renovations_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "renovations" ADD CONSTRAINT "renovations_unit_id_units_id_fk" FOREIGN KEY ("unit_id") REFERENCES "public"."units"("id") ON DELETE cascade ON UPDATE no action;