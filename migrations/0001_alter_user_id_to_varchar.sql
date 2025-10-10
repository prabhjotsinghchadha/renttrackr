-- Migration to change user ID from UUID to VARCHAR for Clerk compatibility
-- This migration alters existing tables to support Clerk user IDs

-- Step 1: Drop foreign key constraints that reference users.id
ALTER TABLE "properties" DROP CONSTRAINT IF EXISTS "properties_user_id_users_id_fk";

-- Step 2: Alter the user_id column in properties table
ALTER TABLE "properties" ALTER COLUMN "user_id" TYPE varchar(255);

-- Step 3: Alter the id column in users table
ALTER TABLE "users" ALTER COLUMN "id" TYPE varchar(255);

-- Step 4: Re-add the foreign key constraint
ALTER TABLE "properties" ADD CONSTRAINT "properties_user_id_users_id_fk" 
  FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;

