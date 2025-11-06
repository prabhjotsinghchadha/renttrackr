'use server';

import { and, eq, ilike, inArray, or, sql } from 'drizzle-orm';
import { requireAuth } from '@/helpers/AuthHelper';
import { db } from '@/libs/DB';
import {
  expenseSchema,
  ownerSchema,
  propertyOwnerSchema,
  propertySchema,
  renovationSchema,
  tenantSchema,
  unitSchema,
  userOwnerSchema,
} from '@/models/Schema';

export type SearchResult = {
  type: 'property' | 'tenant' | 'owner' | 'expense' | 'unit' | 'renovation' | 'action' | 'page';
  id: string;
  title: string;
  subtitle?: string;
  href: string;
};

/**
 * Unified search across all entities using PostgreSQL ILIKE
 * Optimized with parallel queries and early action/page matching
 * Searches: Properties, Tenants, Owners, Expenses, Units, Renovations, Actions, Pages
 */
export async function globalSearch(query: string): Promise<{
  success: boolean;
  results: SearchResult[];
  error?: string;
}> {
  try {
    const user = await requireAuth();

    if (!query || query.trim().length < 2) {
      return { success: true, results: [] };
    }

    const queryTrimmed = query.trim();
    const searchTerm = `%${queryTrimmed}%`;
    const queryLower = queryTrimmed.toLowerCase();
    const results: SearchResult[] = [];

    // First, check actions and pages (fast, no DB queries)
    // This gives instant results for common searches
    const actionsAndPages: Array<{
      type: 'action' | 'page';
      keywords: string[];
      title: string;
      subtitle: string;
      href: string;
    }> = [
      // Actions
      {
        type: 'action',
        keywords: ['add rent', 'record payment', 'record rent', 'payment', 'rent payment', 'add payment'],
        title: 'Record Payment',
        subtitle: 'Add a new rent payment',
        href: '/dashboard/rents/new',
      },
      {
        type: 'action',
        keywords: ['add property', 'new property', 'create property'],
        title: 'Add Property',
        subtitle: 'Create a new property',
        href: '/dashboard/properties/new',
      },
      {
        type: 'action',
        keywords: ['add tenant', 'new tenant', 'create tenant'],
        title: 'Add Tenant',
        subtitle: 'Create a new tenant',
        href: '/dashboard/tenants/new',
      },
      {
        type: 'action',
        keywords: ['add owner', 'new owner', 'create owner'],
        title: 'Add Owner',
        subtitle: 'Create a new owner',
        href: '/dashboard/owners',
      },
      {
        type: 'action',
        keywords: [
          'add expense',
          'new expense',
          'create expense',
          'record expense',
          'log expense',
          'add cost',
          'new cost',
          'record cost',
        ],
        title: 'Add Expense',
        subtitle: 'Record a new expense',
        href: '/dashboard/expenses/new',
      },
      {
        type: 'action',
        keywords: ['add renovation', 'new renovation', 'create renovation'],
        title: 'Add Renovation',
        subtitle: 'Create a new renovation project',
        href: '/dashboard/renovations/new',
      },
      {
        type: 'action',
        keywords: [
          'add parking',
          'new parking',
          'create parking',
          'add permit',
          'new permit',
          'create permit',
          'add parking permit',
          'new parking permit',
        ],
        title: 'Add Parking Permit',
        subtitle: 'Create a new parking permit',
        href: '/dashboard/parking/new',
      },
      {
        type: 'action',
        keywords: ['add lease', 'new lease', 'create lease'],
        title: 'Add Lease',
        subtitle: 'Create a new lease',
        href: '/dashboard/tenants',
      },
      // Pages
      {
        type: 'page',
        keywords: [
          'financials',
          'financial',
          'reports',
          'report',
          'financial report',
          'analytics',
          'income statement',
          'cash flow',
          'tax summary',
          'roi',
          'return on investment',
          'financial metrics',
          'revenue',
          'profit',
          'loss',
        ],
        title: 'Financials',
        subtitle: 'View financial reports and analytics',
        href: '/dashboard/financials',
      },
      {
        type: 'page',
        keywords: ['dashboard', 'home', 'main'],
        title: 'Dashboard',
        subtitle: 'Go to main dashboard',
        href: '/dashboard',
      },
      {
        type: 'page',
        keywords: ['properties', 'property'],
        title: 'Properties',
        subtitle: 'View all properties',
        href: '/dashboard/properties',
      },
      {
        type: 'page',
        keywords: ['tenants', 'tenant'],
        title: 'Tenants',
        subtitle: 'View all tenants',
        href: '/dashboard/tenants',
      },
      {
        type: 'page',
        keywords: ['owners', 'owner'],
        title: 'Owners',
        subtitle: 'View all owners',
        href: '/dashboard/owners',
      },
      {
        type: 'page',
        keywords: ['rents', 'rent', 'rent tracker', 'rent tracking'],
        title: 'Rent Tracker',
        subtitle: 'View rent payments and tracking',
        href: '/dashboard/rents',
      },
      {
        type: 'page',
        keywords: [
          'expenses',
          'expense',
          'costs',
          'cost',
          'spending',
          'expenditure',
          'expenditures',
          'bills',
          'payments made',
        ],
        title: 'Expenses',
        subtitle: 'View all expenses',
        href: '/dashboard/expenses',
      },
      {
        type: 'page',
        keywords: ['renovations', 'renovation'],
        title: 'Renovations',
        subtitle: 'View renovation projects',
        href: '/dashboard/renovations',
      },
      {
        type: 'page',
        keywords: [
          'parking',
          'parking permits',
          'parking permit',
          'permit',
          'permits',
          'vehicle',
          'vehicles',
          'car',
          'cars',
          'license plate',
          'parking management',
        ],
        title: 'Parking',
        subtitle: 'Manage parking permits',
        href: '/dashboard/parking',
      },
      {
        type: 'page',
        keywords: ['profile', 'user profile', 'account', 'settings'],
        title: 'User Profile',
        subtitle: 'View your profile and settings',
        href: '/dashboard/user-profile',
      },
    ];

    // Check actions and pages first (instant, no DB)
    for (const item of actionsAndPages) {
      const matches = item.keywords.some((keyword) => queryLower.includes(keyword) || keyword.includes(queryLower));
      if (matches) {
        results.push({
          type: item.type,
          id: item.href,
          title: item.title,
          subtitle: item.subtitle,
          href: item.href,
        });
      }
    }

    // If we already have good results from actions/pages, return early (faster)
    if (results.length >= 8) {
      return { success: true, results: results.slice(0, 12) };
    }

    // Now do database searches in parallel for better performance
    const [userOwnersResult, legacyPropertiesResult] = await Promise.all([
      db.select().from(userOwnerSchema).where(eq(userOwnerSchema.userId, user.id)),
      db.select({ id: propertySchema.id }).from(propertySchema).where(eq(propertySchema.userId, user.id)),
    ]);

    const userOwners = userOwnersResult;
    let propertyIds: string[] = [];

    if (userOwners.length > 0) {
      const ownerIds = userOwners.map((uo) => uo.ownerId);
      const propertyOwners = await db
        .select()
        .from(propertyOwnerSchema)
        .where(inArray(propertyOwnerSchema.ownerId, ownerIds));
      propertyIds = propertyOwners.map((po) => po.propertyId);
    }

    const legacyPropertyIds = legacyPropertiesResult.map((p) => p.id);
    const allUserPropertyIds = [...new Set([...propertyIds, ...legacyPropertyIds])];

    // Run all database searches in parallel for maximum performance
    const dbQueries: Promise<any>[] = [];

    // Search Properties
    if (allUserPropertyIds.length > 0) {
      dbQueries.push(
        db
          .select({
            id: propertySchema.id,
            address: propertySchema.address,
            propertyType: propertySchema.propertyType,
          })
          .from(propertySchema)
          .where(
            and(
              inArray(propertySchema.id, allUserPropertyIds),
              or(
                ilike(propertySchema.address, searchTerm),
                ilike(propertySchema.propertyType || sql`''`, searchTerm),
              ),
            ),
          )
          .limit(3), // Reduced limit for faster queries
      );
    } else {
      dbQueries.push(Promise.resolve([]));
    }

    // Search Tenants
    if (allUserPropertyIds.length > 0) {
      dbQueries.push(
        db
          .select({
            id: tenantSchema.id,
            name: tenantSchema.name,
            email: tenantSchema.email,
            phone: tenantSchema.phone,
          })
          .from(tenantSchema)
          .where(
            and(
              inArray(tenantSchema.propertyId, allUserPropertyIds),
              or(
                ilike(tenantSchema.name, searchTerm),
                ilike(tenantSchema.email || sql`''`, searchTerm),
                ilike(tenantSchema.phone || sql`''`, searchTerm),
              ),
            ),
          )
          .limit(3),
      );
    } else {
      dbQueries.push(Promise.resolve([]));
    }

    // Search Owners
    if (userOwners.length > 0) {
      const ownerIds = userOwners.map((uo) => uo.ownerId);
      dbQueries.push(
        db
          .select({
            id: ownerSchema.id,
            name: ownerSchema.name,
            email: ownerSchema.email,
            phone: ownerSchema.phone,
            type: ownerSchema.type,
          })
          .from(ownerSchema)
          .where(
            and(
              inArray(ownerSchema.id, ownerIds),
              or(
                ilike(ownerSchema.name, searchTerm),
                ilike(ownerSchema.email || sql`''`, searchTerm),
                ilike(ownerSchema.phone || sql`''`, searchTerm),
              ),
            ),
          )
          .limit(3),
      );
    } else {
      dbQueries.push(Promise.resolve([]));
    }

    // Search Expenses
    if (allUserPropertyIds.length > 0) {
      dbQueries.push(
        db
          .select({
            id: expenseSchema.id,
            type: expenseSchema.type,
            amount: expenseSchema.amount,
            propertyId: expenseSchema.propertyId,
          })
          .from(expenseSchema)
          .where(
            and(inArray(expenseSchema.propertyId, allUserPropertyIds), ilike(expenseSchema.type, searchTerm)),
          )
          .limit(3),
      );
    } else {
      dbQueries.push(Promise.resolve([]));
    }

    // Search Units
    if (allUserPropertyIds.length > 0) {
      dbQueries.push(
        db
          .select({
            id: unitSchema.id,
            unitNumber: unitSchema.unitNumber,
            propertyId: unitSchema.propertyId,
          })
          .from(unitSchema)
          .where(
            and(inArray(unitSchema.propertyId, allUserPropertyIds), ilike(unitSchema.unitNumber, searchTerm)),
          )
          .limit(3),
      );
    } else {
      dbQueries.push(Promise.resolve([]));
    }

    // Search Renovations
    if (allUserPropertyIds.length > 0) {
      dbQueries.push(
        db
          .select({
            id: renovationSchema.id,
            title: renovationSchema.title,
            notes: renovationSchema.notes,
            propertyId: renovationSchema.propertyId,
          })
          .from(renovationSchema)
          .where(
            and(
              inArray(renovationSchema.propertyId, allUserPropertyIds),
              or(
                ilike(renovationSchema.title, searchTerm),
                ilike(renovationSchema.notes || sql`''`, searchTerm),
              ),
            ),
          )
          .limit(3),
      );
    } else {
      dbQueries.push(Promise.resolve([]));
    }

    // Execute all queries in parallel
    const [properties, tenants, owners, expenses, units, renovations] = await Promise.all(dbQueries);

    // Process results
    for (const property of properties as Array<{
      id: string;
      address: string;
      propertyType: string | null;
    }>) {
      results.push({
        type: 'property',
        id: property.id,
        title: property.address,
        subtitle: property.propertyType || undefined,
        href: `/dashboard/properties/${property.id}`,
      });
    }

    for (const tenant of tenants as Array<{
      id: string;
      name: string;
      email: string | null;
      phone: string | null;
    }>) {
      results.push({
        type: 'tenant',
        id: tenant.id,
        title: tenant.name,
        subtitle: tenant.email || tenant.phone || undefined,
        href: `/dashboard/tenants/${tenant.id}`,
      });
    }

    for (const owner of owners as Array<{
      id: string;
      name: string;
      email: string | null;
      phone: string | null;
      type: string;
    }>) {
      results.push({
        type: 'owner',
        id: owner.id,
        title: owner.name,
        subtitle: `${owner.type === 'llc' ? 'LLC' : 'Individual'}${owner.email ? ` • ${owner.email}` : ''}`,
        href: `/dashboard/owners`,
      });
    }

    for (const expense of expenses as Array<{
      id: string;
      type: string;
      amount: number;
      propertyId: string;
    }>) {
      results.push({
        type: 'expense',
        id: expense.id,
        title: expense.type,
        subtitle: `$${expense.amount.toFixed(2)}`,
        href: `/dashboard/expenses`,
      });
    }

    for (const unit of units as Array<{
      id: string;
      unitNumber: string;
      propertyId: string;
    }>) {
      results.push({
        type: 'unit',
        id: unit.id,
        title: `Unit ${unit.unitNumber}`,
        subtitle: undefined,
        href: `/dashboard/properties/${unit.propertyId}`,
      });
    }

    for (const renovation of renovations as Array<{
      id: string;
      title: string;
      notes: string | null;
      propertyId: string;
    }>) {
      results.push({
        type: 'renovation',
        id: renovation.id,
        title: renovation.title,
        subtitle: renovation.notes ? renovation.notes.substring(0, 50) : undefined,
        href: `/dashboard/renovations`,
      });
    }

    // Sort results by type priority and relevance
    const typePriority: Record<SearchResult['type'], number> = {
      action: 0, // Actions first (highest priority)
      page: 1, // Pages second
      property: 2,
      tenant: 3,
      owner: 4,
      expense: 5,
      unit: 6,
      renovation: 7,
    };

    results.sort((a, b) => {
      const priorityDiff = typePriority[a.type] - typePriority[b.type];
      if (priorityDiff !== 0) return priorityDiff;
      return a.title.localeCompare(b.title);
    });

    return { success: true, results: results.slice(0, 12) }; // Limit to 12 total results (increased for actions/pages)
  } catch (error) {
    console.error('Error performing global search:', error);
    return { success: false, results: [], error: 'Failed to perform search' };
  }
}

