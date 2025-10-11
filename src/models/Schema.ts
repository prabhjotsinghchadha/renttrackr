import { integer, pgTable, real, serial, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';

// This file defines the structure of your database tables using the Drizzle ORM.

// To modify the database schema:
// 1. Update this file with your desired changes.
// 2. Generate a new migration by running: `npm run db:generate`

// The generated migration file will reflect your schema changes.
// The migration is automatically applied during the Next.js initialization process through `instrumentation.ts`.
// Simply restart your Next.js server to apply the database changes.
// Alternatively, if your database is running, you can run `npm run db:migrate` and there is no need to restart the server.

// Need a database for production? Check out https://www.prisma.io/?via=nextjsboilerplate
// Tested and compatible with Next.js Boilerplate

export const counterSchema = pgTable('counter', {
  id: serial('id').primaryKey(),
  count: integer('count').default(0),
  updatedAt: timestamp('updated_at', { mode: 'date' })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
});

// User model
export const userSchema = pgTable('users', {
  id: varchar('id', { length: 255 }).primaryKey(), // Clerk user ID (e.g., user_xxx)
  email: varchar('email', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 255 }),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date' })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
  // Add stripeCustomerId field when implementing payments
  // stripeCustomerId: varchar('stripe_customer_id', { length: 255 }),
});

// Property model
export const propertySchema = pgTable('properties', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: varchar('user_id', { length: 255 })
    .notNull()
    .references(() => userSchema.id, { onDelete: 'cascade' }),
  address: varchar('address', { length: 500 }).notNull(),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date' })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

// Unit model
export const unitSchema = pgTable('units', {
  id: uuid('id').defaultRandom().primaryKey(),
  propertyId: uuid('property_id')
    .notNull()
    .references(() => propertySchema.id, { onDelete: 'cascade' }),
  unitNumber: varchar('unit_number', { length: 50 }).notNull(),
  rentAmount: real('rent_amount').notNull(),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date' })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

// Tenant model
export const tenantSchema = pgTable('tenants', {
  id: uuid('id').defaultRandom().primaryKey(),
  unitId: uuid('unit_id')
    .notNull()
    .references(() => unitSchema.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 50 }),
  email: varchar('email', { length: 255 }),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date' })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

// Lease model
export const leaseSchema = pgTable('leases', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id')
    .notNull()
    .references(() => tenantSchema.id, { onDelete: 'cascade' }),
  startDate: timestamp('start_date', { mode: 'date' }).notNull(),
  endDate: timestamp('end_date', { mode: 'date' }).notNull(),
  deposit: real('deposit').notNull(),
  rent: real('rent').notNull(),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date' })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

// Payment model
export const paymentSchema = pgTable('payments', {
  id: uuid('id').defaultRandom().primaryKey(),
  leaseId: uuid('lease_id')
    .notNull()
    .references(() => leaseSchema.id, { onDelete: 'cascade' }),
  amount: real('amount').notNull(),
  date: timestamp('date', { mode: 'date' }).notNull(),
  lateFee: real('late_fee'),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date' })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

// Expense model
export const expenseSchema = pgTable('expenses', {
  id: uuid('id').defaultRandom().primaryKey(),
  propertyId: uuid('property_id')
    .notNull()
    .references(() => propertySchema.id, { onDelete: 'cascade' }),
  type: varchar('type', { length: 100 }).notNull(), // e.g., "Association", "Repair"
  amount: real('amount').notNull(),
  date: timestamp('date', { mode: 'date' }).notNull(),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date' })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

// Appliance model
export const applianceSchema = pgTable('appliances', {
  id: uuid('id').defaultRandom().primaryKey(),
  unitId: uuid('unit_id')
    .notNull()
    .references(() => unitSchema.id, { onDelete: 'cascade' }),
  type: varchar('type', { length: 100 }).notNull(), // e.g., "Refrigerator"
  purchaseDate: timestamp('purchase_date', { mode: 'date' }),
  warrantyExp: timestamp('warranty_exp', { mode: 'date' }),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date' })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

// Renovation model
export const renovationSchema = pgTable('renovations', {
  id: uuid('id').defaultRandom().primaryKey(),
  propertyId: uuid('property_id')
    .notNull()
    .references(() => propertySchema.id, { onDelete: 'cascade' }),
  unitId: uuid('unit_id').references(() => unitSchema.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 255 }).notNull(), // e.g. "Kitchen Upgrade - 2025"
  startDate: timestamp('start_date', { mode: 'date' }),
  endDate: timestamp('end_date', { mode: 'date' }),
  totalCost: real('total_cost').default(0),
  notes: varchar('notes', { length: 1000 }),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date' })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

// Renovation item model
export const renovationItemSchema = pgTable('renovation_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  renovationId: uuid('renovation_id')
    .notNull()
    .references(() => renovationSchema.id, { onDelete: 'cascade' }),
  category: varchar('category', { length: 255 }).notNull(), // e.g., "Mould Remover"
  description: varchar('description', { length: 1000 }), // e.g., "Metal Threshold / Sweep - Entrance"
  vendor: varchar('vendor', { length: 255 }), // e.g., "Home Depot", "Sherman Williams"
  quantity: integer('quantity').default(1),
  unitCost: real('unit_cost'),
  totalCost: real('total_cost'),
  purchaseDate: timestamp('purchase_date', { mode: 'date' }),
  notes: varchar('notes', { length: 1000 }),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date' })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

// TODO: Add models for ParkingPermit, etc.
