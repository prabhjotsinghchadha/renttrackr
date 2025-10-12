'use server';

import { Buffer } from 'node:buffer';
import { eq, inArray, sql } from 'drizzle-orm';
import * as XLSX from 'xlsx';
import { requireAuth } from '@/helpers/AuthHelper';
import { db } from '@/libs/DB';
import {
  expenseSchema,
  leaseSchema,
  paymentSchema,
  propertySchema,
  tenantSchema,
  unitSchema,
} from '@/models/Schema';

/**
 * Get comprehensive financial metrics for the current user
 */
export async function getFinancialMetrics() {
  try {
    const user = await requireAuth();

    // Get all user's properties
    const properties = await db
      .select()
      .from(propertySchema)
      .where(eq(propertySchema.userId, user.id));

    if (properties.length === 0) {
      return {
        totalRevenue: 0,
        totalExpenses: 0,
        netIncome: 0,
        roi: 0,
        monthlyRevenue: 0,
        monthlyExpenses: 0,
        annualRevenue: 0,
        annualExpenses: 0,
      };
    }

    const propertyIds = properties.map((p) => p.id);

    // Get all units for these properties
    const units = await db
      .select()
      .from(unitSchema)
      .where(inArray(unitSchema.propertyId, propertyIds));

    // Get all tenants for these units
    const tenants = await db
      .select()
      .from(tenantSchema)
      .where(
        inArray(
          tenantSchema.unitId,
          units.map((u) => u.id),
        ),
      );

    // Get all leases for these tenants
    const leases = await db
      .select()
      .from(leaseSchema)
      .where(
        inArray(
          leaseSchema.tenantId,
          tenants.map((t) => t.id),
        ),
      );

    // Get all payments for these leases
    const payments = await db
      .select()
      .from(paymentSchema)
      .where(
        inArray(
          paymentSchema.leaseId,
          leases.map((l) => l.id),
        ),
      );

    // Get all expenses for these properties
    const expenses = await db
      .select()
      .from(expenseSchema)
      .where(inArray(expenseSchema.propertyId, propertyIds));

    // Calculate metrics
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    // Revenue calculations
    const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);
    const annualRevenue = payments
      .filter((p) => new Date(p.date).getFullYear() === currentYear)
      .reduce((sum, p) => sum + p.amount, 0);
    const monthlyRevenue = payments
      .filter(
        (p) =>
          new Date(p.date).getFullYear() === currentYear &&
          new Date(p.date).getMonth() === currentMonth,
      )
      .reduce((sum, p) => sum + p.amount, 0);

    // Expense calculations
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const annualExpenses = expenses
      .filter((e) => new Date(e.date).getFullYear() === currentYear)
      .reduce((sum, e) => sum + e.amount, 0);
    const monthlyExpenses = expenses
      .filter(
        (e) =>
          new Date(e.date).getFullYear() === currentYear &&
          new Date(e.date).getMonth() === currentMonth,
      )
      .reduce((sum, e) => sum + e.amount, 0);

    // Net income and ROI
    const netIncome = annualRevenue - annualExpenses;
    const totalPropertyValue = properties.length * 300000; // Placeholder - could be enhanced with actual property values
    const roi = totalPropertyValue > 0 ? (netIncome / totalPropertyValue) * 100 : 0;

    return {
      totalRevenue,
      totalExpenses,
      netIncome,
      roi,
      monthlyRevenue,
      monthlyExpenses,
      annualRevenue,
      annualExpenses,
    };
  } catch (error) {
    console.error('Error calculating financial metrics:', error);
    return {
      totalRevenue: 0,
      totalExpenses: 0,
      netIncome: 0,
      roi: 0,
      monthlyRevenue: 0,
      monthlyExpenses: 0,
      annualRevenue: 0,
      annualExpenses: 0,
    };
  }
}

/**
 * Get detailed financial data for reports
 */
export async function getFinancialReportData() {
  try {
    const user = await requireAuth();

    // Get all user's properties
    const properties = await db
      .select()
      .from(propertySchema)
      .where(eq(propertySchema.userId, user.id));

    console.warn('User properties:', properties.length);

    if (properties.length === 0) {
      console.warn('No properties found for user');
      return { success: true, data: { properties: [], payments: [], expenses: [] } };
    }

    const propertyIds = properties.map((p) => p.id);

    // Get all units for these properties
    const units = await db
      .select()
      .from(unitSchema)
      .where(inArray(unitSchema.propertyId, propertyIds));

    // Get all tenants for these units
    const tenants = await db
      .select()
      .from(tenantSchema)
      .where(
        inArray(
          tenantSchema.unitId,
          units.map((u) => u.id),
        ),
      );

    // Get all leases for these tenants
    const leases = await db
      .select()
      .from(leaseSchema)
      .where(
        inArray(
          leaseSchema.tenantId,
          tenants.map((t) => t.id),
        ),
      );

    // Get all payments for these leases
    const payments = await db
      .select()
      .from(paymentSchema)
      .where(
        inArray(
          paymentSchema.leaseId,
          leases.map((l) => l.id),
        ),
      )
      .orderBy(sql`${paymentSchema.date} DESC`);

    // Get all expenses for these properties
    const expenses = await db
      .select()
      .from(expenseSchema)
      .where(inArray(expenseSchema.propertyId, propertyIds))
      .orderBy(sql`${expenseSchema.date} DESC`);

    console.warn('Data retrieved:', {
      properties: properties.length,
      units: units.length,
      tenants: tenants.length,
      leases: leases.length,
      payments: payments.length,
      expenses: expenses.length,
    });

    // Combine data with property and tenant information
    const paymentsWithDetails = payments.map((payment) => {
      const lease = leases.find((l) => l.id === payment.leaseId);
      const tenant = tenants.find((t) => t.id === lease?.tenantId);
      const unit = units.find((u) => u.id === tenant?.unitId);
      const property = properties.find((p) => p.id === unit?.propertyId);

      return {
        ...payment,
        tenantName: tenant?.name || 'Unknown',
        unitNumber: unit?.unitNumber || 'Unknown',
        propertyAddress: property?.address || 'Unknown',
      };
    });

    const expensesWithDetails = expenses.map((expense) => {
      const property = properties.find((p) => p.id === expense.propertyId);

      return {
        ...expense,
        propertyAddress: property?.address || 'Unknown',
      };
    });

    return {
      success: true,
      data: {
        properties,
        payments: paymentsWithDetails,
        expenses: expensesWithDetails,
      },
    };
  } catch (error) {
    console.error('Error fetching financial report data:', error);
    return { success: false, data: null, error: 'Failed to fetch financial data' };
  }
}

/**
 * Generate income statement data
 */
export async function generateIncomeStatement() {
  try {
    const result = await getFinancialReportData();

    if (!result.success || !result.data) {
      return { success: false, data: null, error: 'Failed to fetch data' };
    }

    const { payments, expenses } = result.data;
    const now = new Date();
    const currentYear = now.getFullYear();

    console.warn('Financial data debug:', {
      totalPayments: payments.length,
      totalExpenses: expenses.length,
      currentYear,
      paymentYears: payments.map((p) => new Date(p.date).getFullYear()),
      expenseYears: expenses.map((e) => new Date(e.date).getFullYear()),
    });

    // Filter data for current year
    const yearPayments = payments.filter((p) => new Date(p.date).getFullYear() === currentYear);
    const yearExpenses = expenses.filter((e) => new Date(e.date).getFullYear() === currentYear);

    console.warn('Filtered data:', {
      yearPayments: yearPayments.length,
      yearExpenses: yearExpenses.length,
    });

    // Group payments by month
    const monthlyRevenue = Array.from({ length: 12 }, (_, i) => {
      const monthPayments = yearPayments.filter((p) => new Date(p.date).getMonth() === i);
      return {
        month: new Date(2024, i).toLocaleDateString('en-US', { month: 'long' }),
        revenue: monthPayments.reduce((sum, p) => sum + p.amount, 0),
        count: monthPayments.length,
      };
    });

    // Group expenses by category
    const expensesByCategory = yearExpenses.reduce(
      (acc, expense) => {
        const category = expense.type;
        if (!acc[category]) {
          acc[category] = { amount: 0, count: 0 };
        }
        acc[category].amount += expense.amount;
        acc[category].count += 1;
        return acc;
      },
      {} as Record<string, { amount: number; count: number }>,
    );

    const totalRevenue = yearPayments.reduce((sum, p) => sum + p.amount, 0);
    const totalExpenses = yearExpenses.reduce((sum, e) => sum + e.amount, 0);
    const netIncome = totalRevenue - totalExpenses;

    return {
      success: true,
      data: {
        year: currentYear,
        totalRevenue,
        totalExpenses,
        netIncome,
        monthlyRevenue,
        expensesByCategory: Object.entries(expensesByCategory).map(([category, data]) => ({
          category,
          amount: data.amount,
          count: data.count,
        })),
        paymentCount: yearPayments.length,
        expenseCount: yearExpenses.length,
      },
    };
  } catch (error) {
    console.error('Error generating income statement:', error);
    return { success: false, data: null, error: 'Failed to generate income statement' };
  }
}

/**
 * Generate cash flow analysis
 */
export async function generateCashFlowAnalysis() {
  try {
    const result = await getFinancialReportData();

    if (!result.success || !result.data) {
      return { success: false, data: null, error: 'Failed to fetch data' };
    }

    const { payments, expenses } = result.data;
    const now = new Date();
    const currentYear = now.getFullYear();

    // Filter data for current year
    const yearPayments = payments.filter((p) => new Date(p.date).getFullYear() === currentYear);
    const yearExpenses = expenses.filter((e) => new Date(e.date).getFullYear() === currentYear);

    // Group by month
    const monthlyData = Array.from({ length: 12 }, (_, i) => {
      const monthPayments = yearPayments.filter((p) => new Date(p.date).getMonth() === i);
      const monthExpenses = yearExpenses.filter((e) => new Date(e.date).getMonth() === i);

      const revenue = monthPayments.reduce((sum, p) => sum + p.amount, 0);
      const expenses = monthExpenses.reduce((sum, e) => sum + e.amount, 0);
      const netCashFlow = revenue - expenses;

      return {
        month: new Date(2024, i).toLocaleDateString('en-US', { month: 'long' }),
        revenue,
        expenses,
        netCashFlow,
        paymentCount: monthPayments.length,
        expenseCount: monthExpenses.length,
      };
    });

    const totalRevenue = yearPayments.reduce((sum, p) => sum + p.amount, 0);
    const totalExpenses = yearExpenses.reduce((sum, e) => sum + e.amount, 0);
    const totalNetCashFlow = totalRevenue - totalExpenses;

    return {
      success: true,
      data: {
        year: currentYear,
        totalRevenue,
        totalExpenses,
        totalNetCashFlow,
        monthlyData,
        averageMonthlyRevenue: totalRevenue / 12,
        averageMonthlyExpenses: totalExpenses / 12,
        averageMonthlyNetFlow: totalNetCashFlow / 12,
      },
    };
  } catch (error) {
    console.error('Error generating cash flow analysis:', error);
    return { success: false, data: null, error: 'Failed to generate cash flow analysis' };
  }
}

/**
 * Generate tax summary
 */
export async function generateTaxSummary() {
  try {
    const result = await getFinancialReportData();

    if (!result.success || !result.data) {
      return { success: false, data: null, error: 'Failed to fetch data' };
    }

    const { payments, expenses } = result.data;
    const now = new Date();
    const currentYear = now.getFullYear();

    // Filter data for current year
    const yearPayments = payments.filter((p) => new Date(p.date).getFullYear() === currentYear);
    const yearExpenses = expenses.filter((e) => new Date(e.date).getFullYear() === currentYear);

    // Categorize expenses for tax purposes
    const taxCategories = {
      'Maintenance & Repairs': ['Maintenance', 'Repair'],
      'Property Management': ['Association Fee', 'Insurance', 'Property Tax'],
      Utilities: ['Utilities'],
      'Professional Services': ['Legal', 'Accounting'],
      Other: [],
    };

    const categorizedExpenses = yearExpenses.reduce(
      (acc, expense) => {
        let category = 'Other';
        for (const [cat, keywords] of Object.entries(taxCategories)) {
          if (
            keywords.some((keyword) => expense.type.toLowerCase().includes(keyword.toLowerCase()))
          ) {
            category = cat;
            break;
          }
        }

        if (!acc[category]) {
          acc[category] = { amount: 0, count: 0, items: [] };
        }

        const categoryData = acc[category];
        if (categoryData) {
          categoryData.amount += expense.amount;
          categoryData.count += 1;
          categoryData.items.push({
            date: expense.date,
            type: expense.type,
            amount: expense.amount,
            property: expense.propertyAddress,
          });
        }

        return acc;
      },
      {} as Record<string, { amount: number; count: number; items: any[] }>,
    );

    const totalRevenue = yearPayments.reduce((sum, p) => sum + p.amount, 0);
    const totalExpenses = yearExpenses.reduce((sum, e) => sum + e.amount, 0);
    const taxableIncome = totalRevenue - totalExpenses;

    return {
      success: true,
      data: {
        year: currentYear,
        totalRevenue,
        totalExpenses,
        taxableIncome,
        categorizedExpenses: Object.entries(categorizedExpenses).map(([category, data]) => ({
          category,
          amount: data.amount,
          count: data.count,
          items: data.items,
        })),
        paymentCount: yearPayments.length,
        expenseCount: yearExpenses.length,
      },
    };
  } catch (error) {
    console.error('Error generating tax summary:', error);
    return { success: false, data: null, error: 'Failed to generate tax summary' };
  }
}

/**
 * Generate income statement with all data (not just current year)
 */
export async function generateIncomeStatementAllData() {
  try {
    const result = await getFinancialReportData();

    if (!result.success || !result.data) {
      return { success: false, data: null, error: 'Failed to fetch data' };
    }

    const { payments, expenses } = result.data;

    // Use all data instead of filtering by year
    const allPayments = payments;
    const allExpenses = expenses;

    // Get the year range from the data
    const paymentYears = payments.map((p) => new Date(p.date).getFullYear());
    const expenseYears = expenses.map((e) => new Date(e.date).getFullYear());
    const allYears = [...new Set([...paymentYears, ...expenseYears])];
    const maxYear = Math.max(...allYears);

    // Group payments by month across all years
    const monthlyRevenue = Array.from({ length: 12 }, (_, i) => {
      const monthPayments = allPayments.filter((p) => new Date(p.date).getMonth() === i);
      return {
        month: new Date(2024, i).toLocaleDateString('en-US', { month: 'long' }),
        revenue: monthPayments.reduce((sum, p) => sum + p.amount, 0),
        count: monthPayments.length,
      };
    });

    // Group expenses by category
    const expensesByCategory = allExpenses.reduce(
      (acc, expense) => {
        const category = expense.type;
        if (!acc[category]) {
          acc[category] = { amount: 0, count: 0 };
        }
        acc[category].amount += expense.amount;
        acc[category].count += 1;
        return acc;
      },
      {} as Record<string, { amount: number; count: number }>,
    );

    const totalRevenue = allPayments.reduce((sum, p) => sum + p.amount, 0);
    const totalExpenses = allExpenses.reduce((sum, e) => sum + e.amount, 0);
    const netIncome = totalRevenue - totalExpenses;

    return {
      success: true,
      data: {
        year: maxYear, // Use the most recent year as the primary year
        totalRevenue,
        totalExpenses,
        netIncome,
        monthlyRevenue,
        expensesByCategory: Object.entries(expensesByCategory).map(([category, data]) => ({
          category,
          amount: data.amount,
          count: data.count,
        })),
        paymentCount: allPayments.length,
        expenseCount: allExpenses.length,
      },
    };
  } catch (error) {
    console.error('Error generating income statement (all data):', error);
    return { success: false, data: null, error: 'Failed to generate income statement' };
  }
}

/**
 * Export income statement to Excel
 */
export async function exportIncomeStatementToExcel() {
  try {
    // Try current year first, fallback to all data if no current year data
    let result = await generateIncomeStatement();

    // If no data for current year, use all data
    if (
      result.success &&
      result.data &&
      result.data.paymentCount === 0 &&
      result.data.expenseCount === 0
    ) {
      console.warn('No current year data found, using all available data');
      result = await generateIncomeStatementAllData();
    }

    if (!result.success || !result.data) {
      return { success: false, error: 'Failed to generate income statement' };
    }

    const { data } = result;
    const workbook = XLSX.utils.book_new();

    // Summary sheet
    const summaryData = [
      ['Income Statement', `Year: ${data.year}`],
      [''],
      ['Total Revenue', `$${data.totalRevenue.toFixed(2)}`],
      ['Total Expenses', `$${data.totalExpenses.toFixed(2)}`],
      ['Net Income', `$${data.netIncome.toFixed(2)}`],
      [''],
      ['Payment Count', data.paymentCount],
      ['Expense Count', data.expenseCount],
    ];

    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

    // Monthly revenue sheet
    const monthlyData = [
      ['Month', 'Revenue', 'Payment Count'],
      ...data.monthlyRevenue.map((month) => [
        month.month,
        `$${month.revenue.toFixed(2)}`,
        month.count,
      ]),
    ];

    const monthlySheet = XLSX.utils.aoa_to_sheet(monthlyData);
    XLSX.utils.book_append_sheet(workbook, monthlySheet, 'Monthly Revenue');

    // Expenses by category sheet
    const expenseData = [
      ['Category', 'Amount', 'Count'],
      ...data.expensesByCategory.map((category) => [
        category.category,
        `$${category.amount.toFixed(2)}`,
        category.count,
      ]),
    ];

    const expenseSheet = XLSX.utils.aoa_to_sheet(expenseData);
    XLSX.utils.book_append_sheet(workbook, expenseSheet, 'Expenses by Category');

    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    return { success: true, buffer, filename: `income-statement-${data.year}.xlsx` };
  } catch (error) {
    console.error('Error exporting income statement:', error);
    return { success: false, error: 'Failed to export income statement' };
  }
}

/**
 * Export cash flow analysis to Excel
 */
export async function exportCashFlowToExcel() {
  try {
    const result = await generateCashFlowAnalysis();

    if (!result.success || !result.data) {
      return { success: false, error: 'Failed to generate cash flow analysis' };
    }

    const { data } = result;
    const workbook = XLSX.utils.book_new();

    // Summary sheet
    const summaryData = [
      ['Cash Flow Analysis', `Year: ${data.year}`],
      [''],
      ['Total Revenue', `$${data.totalRevenue.toFixed(2)}`],
      ['Total Expenses', `$${data.totalExpenses.toFixed(2)}`],
      ['Total Net Cash Flow', `$${data.totalNetCashFlow.toFixed(2)}`],
      [''],
      ['Average Monthly Revenue', `$${data.averageMonthlyRevenue.toFixed(2)}`],
      ['Average Monthly Expenses', `$${data.averageMonthlyExpenses.toFixed(2)}`],
      ['Average Monthly Net Flow', `$${data.averageMonthlyNetFlow.toFixed(2)}`],
    ];

    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

    // Monthly cash flow sheet
    const monthlyData = [
      ['Month', 'Revenue', 'Expenses', 'Net Cash Flow', 'Payment Count', 'Expense Count'],
      ...data.monthlyData.map((month) => [
        month.month,
        `$${month.revenue.toFixed(2)}`,
        `$${month.expenses.toFixed(2)}`,
        `$${month.netCashFlow.toFixed(2)}`,
        month.paymentCount,
        month.expenseCount,
      ]),
    ];

    const monthlySheet = XLSX.utils.aoa_to_sheet(monthlyData);
    XLSX.utils.book_append_sheet(workbook, monthlySheet, 'Monthly Cash Flow');

    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    return { success: true, buffer, filename: `cash-flow-analysis-${data.year}.xlsx` };
  } catch (error) {
    console.error('Error exporting cash flow analysis:', error);
    return { success: false, error: 'Failed to export cash flow analysis' };
  }
}

/**
 * Export tax summary to Excel
 */
export async function exportTaxSummaryToExcel() {
  try {
    const result = await generateTaxSummary();

    if (!result.success || !result.data) {
      return { success: false, error: 'Failed to generate tax summary' };
    }

    const { data } = result;
    const workbook = XLSX.utils.book_new();

    // Summary sheet
    const summaryData = [
      ['Tax Summary', `Year: ${data.year}`],
      [''],
      ['Total Revenue', `$${data.totalRevenue.toFixed(2)}`],
      ['Total Expenses', `$${data.totalExpenses.toFixed(2)}`],
      ['Taxable Income', `$${data.taxableIncome.toFixed(2)}`],
      [''],
      ['Payment Count', data.paymentCount],
      ['Expense Count', data.expenseCount],
    ];

    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

    // Expenses by category sheet
    const categoryData = [
      ['Category', 'Amount', 'Count'],
      ...data.categorizedExpenses.map((category) => [
        category.category,
        `$${category.amount.toFixed(2)}`,
        category.count,
      ]),
    ];

    const categorySheet = XLSX.utils.aoa_to_sheet(categoryData);
    XLSX.utils.book_append_sheet(workbook, categorySheet, 'Expenses by Category');

    // Detailed expenses sheet
    const detailedData = [
      ['Date', 'Category', 'Type', 'Amount', 'Property'],
      ...data.categorizedExpenses.flatMap((category) =>
        category.items.map((item) => [
          new Date(item.date).toLocaleDateString(),
          category.category,
          item.type,
          `$${item.amount.toFixed(2)}`,
          item.property,
        ]),
      ),
    ];

    const detailedSheet = XLSX.utils.aoa_to_sheet(detailedData);
    XLSX.utils.book_append_sheet(workbook, detailedSheet, 'Detailed Expenses');

    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    return { success: true, buffer, filename: `tax-summary-${data.year}.xlsx` };
  } catch (error) {
    console.error('Error exporting tax summary:', error);
    return { success: false, error: 'Failed to export tax summary' };
  }
}

/**
 * Export income statement to CSV
 */
export async function exportIncomeStatementToCSV() {
  try {
    // Try current year first, fallback to all data if no current year data
    let result = await generateIncomeStatement();

    // If no data for current year, use all data
    if (
      result.success &&
      result.data &&
      result.data.paymentCount === 0 &&
      result.data.expenseCount === 0
    ) {
      console.warn('No current year data found, using all available data');
      result = await generateIncomeStatementAllData();
    }

    if (!result.success || !result.data) {
      return { success: false, error: 'Failed to generate income statement' };
    }

    const { data } = result;

    // Create CSV data
    const csvData = [
      // Summary section
      ['Income Statement', `Year: ${data.year}`],
      [''],
      ['Total Revenue', `$${data.totalRevenue.toFixed(2)}`],
      ['Total Expenses', `$${data.totalExpenses.toFixed(2)}`],
      ['Net Income', `$${data.netIncome.toFixed(2)}`],
      [''],
      ['Payment Count', data.paymentCount],
      ['Expense Count', data.expenseCount],
      [''],
      // Monthly revenue section
      ['Monthly Revenue'],
      ['Month', 'Revenue', 'Payment Count'],
      ...data.monthlyRevenue.map((month) => [
        month.month,
        `$${month.revenue.toFixed(2)}`,
        month.count,
      ]),
      [''],
      // Expenses by category section
      ['Expenses by Category'],
      ['Category', 'Amount', 'Count'],
      ...data.expensesByCategory.map((category) => [
        category.category,
        `$${category.amount.toFixed(2)}`,
        category.count,
      ]),
    ];

    // Convert to CSV string
    const csvString = csvData.map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n');

    const buffer = Buffer.from(csvString, 'utf-8');
    return { success: true, buffer, filename: `income-statement-${data.year}.csv` };
  } catch (error) {
    console.error('Error exporting income statement to CSV:', error);
    return { success: false, error: 'Failed to export income statement to CSV' };
  }
}

/**
 * Export cash flow analysis to CSV
 */
export async function exportCashFlowToCSV() {
  try {
    const result = await generateCashFlowAnalysis();

    if (!result.success || !result.data) {
      return { success: false, error: 'Failed to generate cash flow analysis' };
    }

    const { data } = result;

    // Create CSV data
    const csvData = [
      // Summary section
      ['Cash Flow Analysis', `Year: ${data.year}`],
      [''],
      ['Total Revenue', `$${data.totalRevenue.toFixed(2)}`],
      ['Total Expenses', `$${data.totalExpenses.toFixed(2)}`],
      ['Total Net Cash Flow', `$${data.totalNetCashFlow.toFixed(2)}`],
      [''],
      ['Average Monthly Revenue', `$${data.averageMonthlyRevenue.toFixed(2)}`],
      ['Average Monthly Expenses', `$${data.averageMonthlyExpenses.toFixed(2)}`],
      ['Average Monthly Net Flow', `$${data.averageMonthlyNetFlow.toFixed(2)}`],
      [''],
      // Monthly cash flow section
      ['Monthly Cash Flow'],
      ['Month', 'Revenue', 'Expenses', 'Net Cash Flow', 'Payment Count', 'Expense Count'],
      ...data.monthlyData.map((month) => [
        month.month,
        `$${month.revenue.toFixed(2)}`,
        `$${month.expenses.toFixed(2)}`,
        `$${month.netCashFlow.toFixed(2)}`,
        month.paymentCount,
        month.expenseCount,
      ]),
    ];

    // Convert to CSV string
    const csvString = csvData.map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n');

    const buffer = Buffer.from(csvString, 'utf-8');
    return { success: true, buffer, filename: `cash-flow-analysis-${data.year}.csv` };
  } catch (error) {
    console.error('Error exporting cash flow analysis to CSV:', error);
    return { success: false, error: 'Failed to export cash flow analysis to CSV' };
  }
}

/**
 * Export tax summary to CSV
 */
export async function exportTaxSummaryToCSV() {
  try {
    const result = await generateTaxSummary();

    if (!result.success || !result.data) {
      return { success: false, error: 'Failed to generate tax summary' };
    }

    const { data } = result;

    // Create CSV data
    const csvData = [
      // Summary section
      ['Tax Summary', `Year: ${data.year}`],
      [''],
      ['Total Revenue', `$${data.totalRevenue.toFixed(2)}`],
      ['Total Expenses', `$${data.totalExpenses.toFixed(2)}`],
      ['Taxable Income', `$${data.taxableIncome.toFixed(2)}`],
      [''],
      ['Payment Count', data.paymentCount],
      ['Expense Count', data.expenseCount],
      [''],
      // Expenses by category section
      ['Expenses by Category'],
      ['Category', 'Amount', 'Count'],
      ...data.categorizedExpenses.map((category) => [
        category.category,
        `$${category.amount.toFixed(2)}`,
        category.count,
      ]),
      [''],
      // Detailed expenses section
      ['Detailed Expenses'],
      ['Date', 'Category', 'Type', 'Amount', 'Property'],
      ...data.categorizedExpenses.flatMap((category) =>
        category.items.map((item) => [
          new Date(item.date).toLocaleDateString(),
          category.category,
          item.type,
          `$${item.amount.toFixed(2)}`,
          item.property,
        ]),
      ),
    ];

    // Convert to CSV string
    const csvString = csvData.map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n');

    const buffer = Buffer.from(csvString, 'utf-8');
    return { success: true, buffer, filename: `tax-summary-${data.year}.csv` };
  } catch (error) {
    console.error('Error exporting tax summary to CSV:', error);
    return { success: false, error: 'Failed to export tax summary to CSV' };
  }
}
