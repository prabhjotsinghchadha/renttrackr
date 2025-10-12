ALTER TABLE "leases" ADD COLUMN "security_deposit" real;--> statement-breakpoint
ALTER TABLE "leases" ADD COLUMN "pet_deposit" real;--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "acquired_on" timestamp;--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "principal_amount" real;--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "rate_of_interest" real;