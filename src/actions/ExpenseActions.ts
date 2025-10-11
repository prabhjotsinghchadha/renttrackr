'use server';

import { and, eq, inArray, sql } from 'drizzle-orm';
import { requireAuth } from '@/helpers/AuthHelper';
import { db } from '@/libs/DB';
import { expenseSchema, propertySchema } from '@/models/Schema';

/**
 * Get all expenses for the current user's properties
 */
export async function getUserExpenses() {
  try {
    const user = await requireAuth();

    // Get all user's property IDs
    const properties = await db
      .select({ id: propertySchema.id })
      .from(propertySchema)
      .where(eq(propertySchema.userId, user.id));

    if (properties.length === 0) {
      return { success: true, expenses: [] };
    }

    const propertyIds = properties.map((p) => p.id);

    // Get all expenses for these properties
    const expenses = await db
      .select()
      .from(expenseSchema)
      .where(inArray(expenseSchema.propertyId, propertyIds))
      .orderBy(sql`${expenseSchema.date} DESC`);

    return { success: true, expenses };
  } catch (error) {
    console.error('Error fetching expenses:', error);
    return { success: false, expenses: [], error: 'Failed to fetch expenses' };
  }
}

/**
 * Create a new expense
 */
export async function createExpense(data: {
  propertyId: string;
  type: string;
  amount: number;
  date: Date;
}) {
  try {
    const user = await requireAuth();

    // Verify the property belongs to the user
    const [property] = await db
      .select()
      .from(propertySchema)
      .where(and(eq(propertySchema.id, data.propertyId), eq(propertySchema.userId, user.id)))
      .limit(1);

    if (!property) {
      return { success: false, expense: null, error: 'Property not found or unauthorized' };
    }

    const [expense] = await db
      .insert(expenseSchema)
      .values({
        propertyId: data.propertyId,
        type: data.type,
        amount: data.amount,
        date: data.date,
      })
      .returning();

    return { success: true, expense };
  } catch (error) {
    console.error('Error creating expense:', error);
    return { success: false, expense: null, error: 'Failed to create expense' };
  }
}

/**
 * Update an expense
 */
export async function updateExpense(
  expenseId: string,
  data: {
    type?: string;
    amount?: number;
    date?: Date;
  },
) {
  try {
    const user = await requireAuth();

    // Get the expense
    const [existingExpense] = await db
      .select()
      .from(expenseSchema)
      .where(eq(expenseSchema.id, expenseId))
      .limit(1);

    if (!existingExpense) {
      return { success: false, expense: null, error: 'Expense not found' };
    }

    // Verify ownership
    const [property] = await db
      .select()
      .from(propertySchema)
      .where(
        and(eq(propertySchema.id, existingExpense.propertyId), eq(propertySchema.userId, user.id)),
      )
      .limit(1);

    if (!property) {
      return { success: false, expense: null, error: 'Unauthorized' };
    }

    const [expense] = await db
      .update(expenseSchema)
      .set({
        type: data.type,
        amount: data.amount,
        date: data.date,
        updatedAt: new Date(),
      })
      .where(eq(expenseSchema.id, expenseId))
      .returning();

    return { success: true, expense };
  } catch (error) {
    console.error('Error updating expense:', error);
    return { success: false, expense: null, error: 'Failed to update expense' };
  }
}

/**
 * Delete an expense
 */
export async function deleteExpense(expenseId: string) {
  try {
    const user = await requireAuth();

    // Get the expense
    const [existingExpense] = await db
      .select()
      .from(expenseSchema)
      .where(eq(expenseSchema.id, expenseId))
      .limit(1);

    if (!existingExpense) {
      return { success: false, error: 'Expense not found' };
    }

    // Verify ownership
    const [property] = await db
      .select()
      .from(propertySchema)
      .where(
        and(eq(propertySchema.id, existingExpense.propertyId), eq(propertySchema.userId, user.id)),
      )
      .limit(1);

    if (!property) {
      return { success: false, error: 'Unauthorized' };
    }

    await db.delete(expenseSchema).where(eq(expenseSchema.id, expenseId));

    return { success: true };
  } catch (error) {
    console.error('Error deleting expense:', error);
    return { success: false, error: 'Failed to delete expense' };
  }
}

/**
 * Get all expenses with property information
 */
export async function getExpensesWithPropertyInfo() {
  try {
    const user = await requireAuth();

    // Get all user's properties
    const properties = await db
      .select()
      .from(propertySchema)
      .where(eq(propertySchema.userId, user.id));

    if (properties.length === 0) {
      return { success: true, expenses: [] };
    }

    const propertyIds = properties.map((p) => p.id);

    // Get all expenses for these properties
    const expenses = await db
      .select()
      .from(expenseSchema)
      .where(inArray(expenseSchema.propertyId, propertyIds))
      .orderBy(sql`${expenseSchema.date} DESC`);

    // Combine expense and property information
    const expensesWithInfo = expenses.map((expense) => {
      const property = properties.find((p) => p.id === expense.propertyId);

      return {
        ...expense,
        propertyAddress: property?.address || 'Unknown',
      };
    });

    return { success: true, expenses: expensesWithInfo };
  } catch (error) {
    console.error('Error fetching expenses with property info:', error);
    return { success: false, expenses: [], error: 'Failed to fetch expenses' };
  }
}

/**
 * Get expense metrics for the current user
 */
export async function getExpenseMetrics() {
  try {
    const result = await getUserExpenses();

    if (!result.success || !result.expenses) {
      return {
        totalThisMonth: 0,
        totalThisYear: 0,
        maintenance: 0,
        association: 0,
      };
    }

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const totalThisMonth = result.expenses
      .filter((e) => {
        const expenseDate = new Date(e.date);
        return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
      })
      .reduce((sum, e) => sum + e.amount, 0);

    const totalThisYear = result.expenses
      .filter((e) => {
        const expenseDate = new Date(e.date);
        return expenseDate.getFullYear() === currentYear;
      })
      .reduce((sum, e) => sum + e.amount, 0);

    const maintenance = result.expenses
      .filter((e) => {
        const expenseDate = new Date(e.date);
        return (
          (e.type.toLowerCase().includes('maintenance') ||
            e.type.toLowerCase().includes('repair')) &&
          expenseDate.getFullYear() === currentYear
        );
      })
      .reduce((sum, e) => sum + e.amount, 0);

    const association = result.expenses
      .filter((e) => {
        const expenseDate = new Date(e.date);
        return (
          e.type.toLowerCase().includes('association') && expenseDate.getFullYear() === currentYear
        );
      })
      .reduce((sum, e) => sum + e.amount, 0);

    return {
      totalThisMonth,
      totalThisYear,
      maintenance,
      association,
    };
  } catch (error) {
    console.error('Error calculating expense metrics:', error);
    return {
      totalThisMonth: 0,
      totalThisYear: 0,
      maintenance: 0,
      association: 0,
    };
  }
}
