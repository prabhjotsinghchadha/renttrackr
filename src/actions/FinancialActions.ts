'use server';

import { Buffer } from 'node:buffer';
import { eq, inArray, sql } from 'drizzle-orm';
import * as XLSX from 'xlsx';
import { requireAuth } from '@/helpers/AuthHelper';
import { db } from '@/libs/DB';
import {
  expenseSchema,
  leaseSchema,
  parkingPermitSchema,
  paymentSchema,
  propertySchema,
  renovationSchema,
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

    if (properties.length === 0) {
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

    // Filter data for current year
    const yearPayments = payments.filter((p) => new Date(p.date).getFullYear() === currentYear);
    const yearExpenses = expenses.filter((e) => new Date(e.date).getFullYear() === currentYear);

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
      ...(data.monthlyRevenue && data.monthlyRevenue.length > 0
        ? data.monthlyRevenue.map((month) => [
            month.month,
            `$${month.revenue.toFixed(2)}`,
            month.count,
          ])
        : [['No data available', '$0.00', 0]]),
    ];

    const monthlySheet = XLSX.utils.aoa_to_sheet(monthlyData);
    XLSX.utils.book_append_sheet(workbook, monthlySheet, 'Monthly Revenue');

    // Expenses by category sheet
    const expenseData = [
      ['Category', 'Amount', 'Count'],
      ...(data.expensesByCategory && data.expensesByCategory.length > 0
        ? data.expensesByCategory.map((category) => [
            category.category,
            `$${category.amount.toFixed(2)}`,
            category.count,
          ])
        : [['No data available', '$0.00', 0]]),
    ];

    const expenseSheet = XLSX.utils.aoa_to_sheet(expenseData);
    XLSX.utils.book_append_sheet(workbook, expenseSheet, 'Expenses by Category');

    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    const base64 = Buffer.from(buffer).toString('base64');
    return { success: true, buffer: base64, filename: `income-statement-${data.year}.xlsx` };
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
    const base64 = Buffer.from(buffer).toString('base64');
    return { success: true, buffer: base64, filename: `cash-flow-analysis-${data.year}.xlsx` };
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
    const base64 = Buffer.from(buffer).toString('base64');
    return { success: true, buffer: base64, filename: `tax-summary-${data.year}.xlsx` };
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
      ...(data.monthlyRevenue && data.monthlyRevenue.length > 0
        ? data.monthlyRevenue.map((month) => [
            month.month,
            `$${month.revenue.toFixed(2)}`,
            month.count,
          ])
        : [['No data available', '$0.00', 0]]),
      [''],
      // Expenses by category section
      ['Expenses by Category'],
      ['Category', 'Amount', 'Count'],
      ...(data.expensesByCategory && data.expensesByCategory.length > 0
        ? data.expensesByCategory.map((category) => [
            category.category,
            `$${category.amount.toFixed(2)}`,
            category.count,
          ])
        : [['No data available', '$0.00', 0]]),
    ];

    // Convert to CSV string
    const csvString = csvData.map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n');

    const buffer = Buffer.from(csvString, 'utf-8');
    const base64 = buffer.toString('base64');
    return { success: true, buffer: base64, filename: `income-statement-${data.year}.csv` };
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
    const base64 = buffer.toString('base64');
    return { success: true, buffer: base64, filename: `cash-flow-analysis-${data.year}.csv` };
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
    const base64 = buffer.toString('base64');
    return { success: true, buffer: base64, filename: `tax-summary-${data.year}.csv` };
  } catch (error) {
    console.error('Error exporting tax summary to CSV:', error);
    return { success: false, error: 'Failed to export tax summary to CSV' };
  }
}

/**
 * Generate property and unit details report
 */
export async function generatePropertyReport() {
  try {
    const user = await requireAuth();

    // Get all user's properties
    const properties = await db
      .select()
      .from(propertySchema)
      .where(eq(propertySchema.userId, user.id));

    if (properties.length === 0) {
      return { success: true, data: { properties: [], totalProperties: 0, totalUnits: 0 } };
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

    // Combine property, unit, and tenant information
    const propertiesWithDetails = properties.map((property) => {
      const propertyUnits = units.filter((u) => u.propertyId === property.id);
      const unitsWithTenants = propertyUnits.map((unit) => {
        const unitTenant = tenants.find((t) => t.unitId === unit.id);
        const unitLease = unitTenant ? leases.find((l) => l.tenantId === unitTenant.id) : null;

        return {
          ...unit,
          tenantName: unitTenant?.name || null,
          tenantEmail: unitTenant?.email || null,
          tenantPhone: unitTenant?.phone || null,
          leaseStartDate: unitLease?.startDate || null,
          leaseEndDate: unitLease?.endDate || null,
          monthlyRent: unitLease?.rent || null,
          isOccupied: !!unitTenant,
        };
      });

      return {
        ...property,
        units: unitsWithTenants,
        totalUnits: propertyUnits.length,
        occupiedUnits: unitsWithTenants.filter((u) => u.isOccupied).length,
        totalMonthlyRent: unitsWithTenants.reduce((sum, u) => sum + (u.monthlyRent || 0), 0),
      };
    });

    return {
      success: true,
      data: {
        properties: propertiesWithDetails,
        totalProperties: properties.length,
        totalUnits: units.length,
        totalOccupiedUnits: tenants.length,
        totalMonthlyRent: propertiesWithDetails.reduce((sum, p) => sum + p.totalMonthlyRent, 0),
      },
    };
  } catch (error) {
    console.error('Error generating property report:', error);
    return { success: false, data: null, error: 'Failed to generate property report' };
  }
}

/**
 * Generate tenant details report
 */
export async function generateTenantReport() {
  try {
    const user = await requireAuth();

    // Get all user's properties
    const properties = await db
      .select()
      .from(propertySchema)
      .where(eq(propertySchema.userId, user.id));

    if (properties.length === 0) {
      return { success: true, data: { tenants: [], totalTenants: 0 } };
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

    // Combine tenant information with property, unit, lease, and payment data
    const tenantsWithDetails = tenants.map((tenant) => {
      const unit = units.find((u) => u.id === tenant.unitId);
      const property = properties.find((p) => p.id === unit?.propertyId);
      const lease = leases.find((l) => l.tenantId === tenant.id);
      const tenantPayments = payments.filter((p) => p.leaseId === lease?.id);

      const totalPaid = tenantPayments.reduce((sum, p) => sum + p.amount, 0);
      const lastPayment =
        tenantPayments.length > 0
          ? tenantPayments.sort(
              (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
            )[0]
          : null;

      return {
        ...tenant,
        propertyAddress: property?.address || 'Unknown',
        unitNumber: unit?.unitNumber || 'Unknown',
        leaseStartDate: lease?.startDate || null,
        leaseEndDate: lease?.endDate || null,
        monthlyRent: lease?.rent || 0,
        totalPaid,
        paymentCount: tenantPayments.length,
        lastPaymentDate: lastPayment?.date || null,
        lastPaymentAmount: lastPayment?.amount || 0,
        isLeaseActive: lease
          ? new Date() >= new Date(lease.startDate) && new Date() <= new Date(lease.endDate)
          : false,
      };
    });

    return {
      success: true,
      data: {
        tenants: tenantsWithDetails,
        totalTenants: tenants.length,
        activeLeases: tenantsWithDetails.filter((t) => t.isLeaseActive).length,
        totalMonthlyRent: tenantsWithDetails.reduce((sum, t) => sum + t.monthlyRent, 0),
        totalCollected: tenantsWithDetails.reduce((sum, t) => sum + t.totalPaid, 0),
      },
    };
  } catch (error) {
    console.error('Error generating tenant report:', error);
    return { success: false, data: null, error: 'Failed to generate tenant report' };
  }
}

/**
 * Generate payment records report
 */
export async function generatePaymentReport() {
  try {
    const user = await requireAuth();

    // Get all user's properties
    const properties = await db
      .select()
      .from(propertySchema)
      .where(eq(propertySchema.userId, user.id));

    if (properties.length === 0) {
      return { success: true, data: { payments: [], totalPayments: 0 } };
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

    // Combine payment information with tenant, unit, and property data
    const paymentsWithDetails = payments.map((payment) => {
      const lease = leases.find((l) => l.id === payment.leaseId);
      const tenant = tenants.find((t) => t.id === lease?.tenantId);
      const unit = units.find((u) => u.id === tenant?.unitId);
      const property = properties.find((p) => p.id === unit?.propertyId);

      return {
        ...payment,
        tenantName: tenant?.name || 'Unknown',
        tenantEmail: tenant?.email || null,
        unitNumber: unit?.unitNumber || 'Unknown',
        propertyAddress: property?.address || 'Unknown',
        monthlyRent: lease?.rent || 0,
      };
    });

    // Group payments by month for summary
    const monthlyPayments = paymentsWithDetails.reduce(
      (acc, payment) => {
        const month = new Date(payment.date).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
        });
        if (!acc[month]) {
          acc[month] = { amount: 0, count: 0, lateFees: 0 };
        }
        acc[month].amount += payment.amount;
        acc[month].count += 1;
        acc[month].lateFees += payment.lateFee || 0;
        return acc;
      },
      {} as Record<string, { amount: number; count: number; lateFees: number }>,
    );

    const totalAmount = paymentsWithDetails.reduce((sum, p) => sum + p.amount, 0);
    const totalLateFees = paymentsWithDetails.reduce((sum, p) => sum + (p.lateFee || 0), 0);

    return {
      success: true,
      data: {
        payments: paymentsWithDetails,
        totalPayments: payments.length,
        totalAmount,
        totalLateFees,
        monthlyPayments: Object.entries(monthlyPayments).map(([month, data]) => ({
          month,
          ...data,
        })),
      },
    };
  } catch (error) {
    console.error('Error generating payment report:', error);
    return { success: false, data: null, error: 'Failed to generate payment report' };
  }
}

/**
 * Generate expense records report
 */
export async function generateExpenseReport() {
  try {
    const user = await requireAuth();

    // Get all user's properties
    const properties = await db
      .select()
      .from(propertySchema)
      .where(eq(propertySchema.userId, user.id));

    if (properties.length === 0) {
      return { success: true, data: { expenses: [], totalExpenses: 0 } };
    }

    const propertyIds = properties.map((p) => p.id);

    // Get all expenses for these properties
    const expenses = await db
      .select()
      .from(expenseSchema)
      .where(inArray(expenseSchema.propertyId, propertyIds))
      .orderBy(sql`${expenseSchema.date} DESC`);

    // Combine expense information with property data
    const expensesWithDetails = expenses.map((expense) => {
      const property = properties.find((p) => p.id === expense.propertyId);

      return {
        ...expense,
        propertyAddress: property?.address || 'Unknown',
      };
    });

    // Group expenses by category
    const expensesByCategory = expensesWithDetails.reduce(
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

    // Group expenses by month
    const monthlyExpenses = expensesWithDetails.reduce(
      (acc, expense) => {
        const month = new Date(expense.date).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
        });
        if (!acc[month]) {
          acc[month] = { amount: 0, count: 0 };
        }
        acc[month].amount += expense.amount;
        acc[month].count += 1;
        return acc;
      },
      {} as Record<string, { amount: number; count: number }>,
    );

    const totalAmount = expensesWithDetails.reduce((sum, e) => sum + e.amount, 0);

    return {
      success: true,
      data: {
        expenses: expensesWithDetails,
        totalExpenses: expenses.length,
        totalAmount,
        expensesByCategory: Object.entries(expensesByCategory).map(([category, data]) => ({
          category,
          ...data,
        })),
        monthlyExpenses: Object.entries(monthlyExpenses).map(([month, data]) => ({
          month,
          ...data,
        })),
      },
    };
  } catch (error) {
    console.error('Error generating expense report:', error);
    return { success: false, data: null, error: 'Failed to generate expense report' };
  }
}

/**
 * Generate renovation records report
 */
export async function generateRenovationReport() {
  try {
    const user = await requireAuth();

    // Get all user's properties
    const properties = await db
      .select()
      .from(propertySchema)
      .where(eq(propertySchema.userId, user.id));

    if (properties.length === 0) {
      return { success: true, data: { renovations: [], totalRenovations: 0 } };
    }

    const propertyIds = properties.map((p) => p.id);

    // Get all units for these properties
    const units = await db
      .select()
      .from(unitSchema)
      .where(inArray(unitSchema.propertyId, propertyIds));

    // Get all renovations for these properties
    const renovations = await db
      .select()
      .from(renovationSchema)
      .where(inArray(renovationSchema.propertyId, propertyIds))
      .orderBy(sql`${renovationSchema.startDate} DESC`);

    // Combine renovation information with property and unit data
    const renovationsWithDetails = renovations.map((renovation) => {
      const property = properties.find((p) => p.id === renovation.propertyId);
      const unit = units.find((u) => u.id === renovation.unitId);

      return {
        ...renovation,
        propertyAddress: property?.address || 'Unknown',
        unitNumber: unit?.unitNumber || null,
      };
    });

    // Group renovations by title (since there's no status field)
    const renovationsByTitle = renovationsWithDetails.reduce(
      (acc, renovation) => {
        const title = renovation.title;
        if (!acc[title]) {
          acc[title] = { count: 0, totalCost: 0 };
        }
        acc[title].count += 1;
        acc[title].totalCost += renovation.totalCost || 0;
        return acc;
      },
      {} as Record<string, { count: number; totalCost: number }>,
    );

    // Group renovations by property
    const renovationsByProperty = renovationsWithDetails.reduce(
      (acc, renovation) => {
        const property = renovation.propertyAddress;
        if (!acc[property]) {
          acc[property] = { count: 0, totalCost: 0 };
        }
        acc[property].count += 1;
        acc[property].totalCost += renovation.totalCost || 0;
        return acc;
      },
      {} as Record<string, { count: number; totalCost: number }>,
    );

    const totalCost = renovationsWithDetails.reduce((sum, r) => sum + (r.totalCost || 0), 0);

    return {
      success: true,
      data: {
        renovations: renovationsWithDetails,
        totalRenovations: renovations.length,
        totalCost,
        renovationsByTitle: Object.entries(renovationsByTitle).map(([title, data]) => ({
          title,
          ...data,
        })),
        renovationsByProperty: Object.entries(renovationsByProperty).map(([property, data]) => ({
          property,
          ...data,
        })),
      },
    };
  } catch (error) {
    console.error('Error generating renovation report:', error);
    return { success: false, data: null, error: 'Failed to generate renovation report' };
  }
}

/**
 * Generate parking records report
 */
export async function generateParkingReport() {
  try {
    const user = await requireAuth();

    // Get all user's properties
    const properties = await db
      .select()
      .from(propertySchema)
      .where(eq(propertySchema.userId, user.id));

    if (properties.length === 0) {
      return { success: true, data: { permits: [], totalPermits: 0 } };
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

    // Get all parking permits for these properties
    const permits = await db
      .select()
      .from(parkingPermitSchema)
      .where(inArray(parkingPermitSchema.propertyId, propertyIds))
      .orderBy(sql`${parkingPermitSchema.issuedAt} DESC`);

    // Combine permit information with property, unit, and tenant data
    const permitsWithDetails = permits.map((permit) => {
      const property = properties.find((p) => p.id === permit.propertyId);
      const tenant = permit.tenantId ? tenants.find((t) => t.id === permit.tenantId) : null;
      const unit = tenant ? units.find((u) => u.id === tenant.unitId) : null;

      return {
        ...permit,
        propertyAddress: property?.address || 'Unknown',
        tenantName: tenant?.name || null,
        unitNumber: unit?.unitNumber || null,
      };
    });

    // Group permits by status
    const permitsByStatus = permitsWithDetails.reduce(
      (acc, permit) => {
        const status = permit.status || 'Unknown';
        if (!acc[status]) {
          acc[status] = { count: 0 };
        }
        acc[status].count += 1;
        return acc;
      },
      {} as Record<string, { count: number }>,
    );

    // Group permits by building
    const permitsByBuilding = permitsWithDetails.reduce(
      (acc, permit) => {
        const building = permit.building || 'Unknown';
        if (!acc[building]) {
          acc[building] = { count: 0 };
        }
        acc[building].count += 1;
        return acc;
      },
      {} as Record<string, { count: number }>,
    );

    return {
      success: true,
      data: {
        permits: permitsWithDetails,
        totalPermits: permits.length,
        activePermits: permitsWithDetails.filter((p) => p.status === 'Active').length,
        permitsByStatus: Object.entries(permitsByStatus).map(([status, data]) => ({
          status,
          ...data,
        })),
        permitsByBuilding: Object.entries(permitsByBuilding).map(([building, data]) => ({
          building,
          ...data,
        })),
      },
    };
  } catch (error) {
    console.error('Error generating parking report:', error);
    return { success: false, data: null, error: 'Failed to generate parking report' };
  }
}

/**
 * Export property report to Excel
 */
export async function exportPropertyReportToExcel() {
  try {
    const result = await generatePropertyReport();
    if (!result.success || !result.data) {
      return { success: false, error: 'Failed to generate property report' };
    }

    const { properties } = result.data;
    const workbook = XLSX.utils.book_new();

    // Create summary sheet
    const summaryData = [
      ['Property Report Summary'],
      [''],
      ['Total Properties', result.data.totalProperties],
      ['Total Units', result.data.totalUnits],
      ['Occupied Units', result.data.totalOccupiedUnits],
      ['Total Monthly Rent', `$${result.data.totalMonthlyRent?.toFixed(2) || '0.00'}`],
      [''],
      ['Generated on', new Date().toLocaleDateString()],
    ];

    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

    // Create detailed properties sheet
    const propertiesData = [
      ['Property Address', 'Total Units', 'Occupied Units', 'Total Monthly Rent'],
    ];

    properties.forEach((property) => {
      propertiesData.push([
        property.address,
        property.totalUnits.toString(),
        property.occupiedUnits.toString(),
        `$${property.totalMonthlyRent?.toFixed(2) || '0.00'}`,
      ]);
    });

    const propertiesSheet = XLSX.utils.aoa_to_sheet(propertiesData);
    XLSX.utils.book_append_sheet(workbook, propertiesSheet, 'Properties');

    // Create units sheet
    const unitsData = [
      ['Property Address', 'Unit Number', 'Tenant Name', 'Monthly Rent', 'Occupied'],
    ];

    properties.forEach((property) => {
      property.units.forEach((unit) => {
        unitsData.push([
          property.address,
          unit.unitNumber,
          unit.tenantName || 'Vacant',
          `$${unit.monthlyRent?.toFixed(2) || '0.00'}`,
          unit.isOccupied ? 'Yes' : 'No',
        ]);
      });
    });

    const unitsSheet = XLSX.utils.aoa_to_sheet(unitsData);
    XLSX.utils.book_append_sheet(workbook, unitsSheet, 'Units');

    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    const base64 = buffer.toString('base64');
    return {
      success: true,
      buffer: base64,
      filename: `property-report-${new Date().toISOString().split('T')[0]}.xlsx`,
    };
  } catch (error) {
    console.error('Error exporting property report to Excel:', error);
    return { success: false, error: 'Failed to export property report to Excel' };
  }
}

/**
 * Export property report to CSV
 */
export async function exportPropertyReportToCSV() {
  try {
    const result = await generatePropertyReport();
    if (!result.success || !result.data) {
      return { success: false, error: 'Failed to generate property report' };
    }

    const { properties } = result.data;
    const csvData = [
      ['Property Address', 'Unit Number', 'Tenant Name', 'Monthly Rent', 'Occupied'],
    ];

    properties.forEach((property) => {
      property.units.forEach((unit) => {
        csvData.push([
          property.address,
          unit.unitNumber,
          unit.tenantName || 'Vacant',
          `$${unit.monthlyRent?.toFixed(2) || '0.00'}`,
          unit.isOccupied ? 'Yes' : 'No',
        ]);
      });
    });

    const csvString = csvData.map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n');
    const buffer = Buffer.from(csvString, 'utf-8');
    const base64 = buffer.toString('base64');
    return {
      success: true,
      buffer: base64,
      filename: `property-report-${new Date().toISOString().split('T')[0]}.csv`,
    };
  } catch (error) {
    console.error('Error exporting property report to CSV:', error);
    return { success: false, error: 'Failed to export property report to CSV' };
  }
}

/**
 * Export tenant report to Excel
 */
export async function exportTenantReportToExcel() {
  try {
    const result = await generateTenantReport();
    if (!result.success || !result.data) {
      return { success: false, error: 'Failed to generate tenant report' };
    }

    const { tenants } = result.data;
    const workbook = XLSX.utils.book_new();

    // Create summary sheet
    const summaryData = [
      ['Tenant Report Summary'],
      [''],
      ['Total Tenants', result.data.totalTenants],
      ['Active Leases', result.data.activeLeases],
      ['Total Monthly Rent', `$${result.data.totalMonthlyRent?.toFixed(2) || '0.00'}`],
      ['Total Collected', `$${result.data.totalCollected?.toFixed(2) || '0.00'}`],
      [''],
      ['Generated on', new Date().toLocaleDateString()],
    ];

    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

    // Create detailed tenants sheet
    const tenantsData = [
      [
        'Tenant Name',
        'Email',
        'Phone',
        'Property Address',
        'Unit Number',
        'Monthly Rent',
        'Total Paid',
        'Payment Count',
        'Last Payment Date',
        'Lease Active',
      ],
    ];

    tenants.forEach((tenant) => {
      tenantsData.push([
        tenant.name,
        tenant.email || '',
        tenant.phone || '',
        tenant.propertyAddress,
        tenant.unitNumber,
        `$${tenant.monthlyRent?.toFixed(2) || '0.00'}`,
        `$${tenant.totalPaid?.toFixed(2) || '0.00'}`,
        tenant.paymentCount.toString(),
        tenant.lastPaymentDate ? new Date(tenant.lastPaymentDate).toLocaleDateString() : '',
        tenant.isLeaseActive ? 'Yes' : 'No',
      ]);
    });

    const tenantsSheet = XLSX.utils.aoa_to_sheet(tenantsData);
    XLSX.utils.book_append_sheet(workbook, tenantsSheet, 'Tenants');

    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    const base64 = buffer.toString('base64');
    return {
      success: true,
      buffer: base64,
      filename: `tenant-report-${new Date().toISOString().split('T')[0]}.xlsx`,
    };
  } catch (error) {
    console.error('Error exporting tenant report to Excel:', error);
    return { success: false, error: 'Failed to export tenant report to Excel' };
  }
}

/**
 * Export tenant report to CSV
 */
export async function exportTenantReportToCSV() {
  try {
    const result = await generateTenantReport();
    if (!result.success || !result.data) {
      return { success: false, error: 'Failed to generate tenant report' };
    }

    const { tenants } = result.data;
    const csvData = [
      [
        'Tenant Name',
        'Email',
        'Phone',
        'Property Address',
        'Unit Number',
        'Monthly Rent',
        'Total Paid',
        'Payment Count',
        'Last Payment Date',
        'Lease Active',
      ],
    ];

    tenants.forEach((tenant) => {
      csvData.push([
        tenant.name,
        tenant.email || '',
        tenant.phone || '',
        tenant.propertyAddress,
        tenant.unitNumber,
        `$${tenant.monthlyRent?.toFixed(2) || '0.00'}`,
        `$${tenant.totalPaid?.toFixed(2) || '0.00'}`,
        tenant.paymentCount.toString(),
        tenant.lastPaymentDate ? new Date(tenant.lastPaymentDate).toLocaleDateString() : '',
        tenant.isLeaseActive ? 'Yes' : 'No',
      ]);
    });

    const csvString = csvData.map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n');
    const buffer = Buffer.from(csvString, 'utf-8');
    const base64 = buffer.toString('base64');
    return {
      success: true,
      buffer: base64,
      filename: `tenant-report-${new Date().toISOString().split('T')[0]}.csv`,
    };
  } catch (error) {
    console.error('Error exporting tenant report to CSV:', error);
    return { success: false, error: 'Failed to export tenant report to CSV' };
  }
}

/**
 * Export payment report to Excel
 */
export async function exportPaymentReportToExcel() {
  try {
    const result = await generatePaymentReport();
    if (!result.success || !result.data) {
      return { success: false, error: 'Failed to generate payment report' };
    }

    const { payments, monthlyPayments } = result.data;
    const workbook = XLSX.utils.book_new();

    // Create summary sheet
    const summaryData = [
      ['Payment Report Summary'],
      [''],
      ['Total Payments', result.data.totalPayments],
      ['Total Amount', `$${result.data.totalAmount?.toFixed(2) || '0.00'}`],
      ['Total Late Fees', `$${result.data.totalLateFees?.toFixed(2) || '0.00'}`],
      [''],
      ['Generated on', new Date().toLocaleDateString()],
    ];

    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

    // Create monthly payments sheet
    const monthlyData = [['Month', 'Amount', 'Count', 'Late Fees']];

    monthlyPayments?.forEach((month) => {
      monthlyData.push([
        month.month,
        `$${month.amount?.toFixed(2) || '0.00'}`,
        month.count.toString(),
        `$${month.lateFees?.toFixed(2) || '0.00'}`,
      ]);
    });

    const monthlySheet = XLSX.utils.aoa_to_sheet(monthlyData);
    XLSX.utils.book_append_sheet(workbook, monthlySheet, 'Monthly Summary');

    // Create detailed payments sheet
    const paymentsData = [
      ['Tenant Name', 'Property Address', 'Unit Number', 'Amount', 'Late Fee', 'Payment Date'],
    ];

    payments.forEach((payment) => {
      paymentsData.push([
        payment.tenantName,
        payment.propertyAddress,
        payment.unitNumber,
        `$${payment.amount?.toFixed(2) || '0.00'}`,
        payment.lateFee ? `$${payment.lateFee.toFixed(2)}` : '',
        new Date(payment.date).toLocaleDateString(),
      ]);
    });

    const paymentsSheet = XLSX.utils.aoa_to_sheet(paymentsData);
    XLSX.utils.book_append_sheet(workbook, paymentsSheet, 'Payment Details');

    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    const base64 = buffer.toString('base64');
    return {
      success: true,
      buffer: base64,
      filename: `payment-report-${new Date().toISOString().split('T')[0]}.xlsx`,
    };
  } catch (error) {
    console.error('Error exporting payment report to Excel:', error);
    return { success: false, error: 'Failed to export payment report to Excel' };
  }
}

/**
 * Export payment report to CSV
 */
export async function exportPaymentReportToCSV() {
  try {
    const result = await generatePaymentReport();
    if (!result.success || !result.data) {
      return { success: false, error: 'Failed to generate payment report' };
    }

    const { payments } = result.data;
    const csvData = [
      ['Tenant Name', 'Property Address', 'Unit Number', 'Amount', 'Late Fee', 'Payment Date'],
    ];

    payments.forEach((payment) => {
      csvData.push([
        payment.tenantName,
        payment.propertyAddress,
        payment.unitNumber,
        `$${payment.amount?.toFixed(2) || '0.00'}`,
        payment.lateFee ? `$${payment.lateFee.toFixed(2)}` : '',
        new Date(payment.date).toLocaleDateString(),
      ]);
    });

    const csvString = csvData.map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n');
    const buffer = Buffer.from(csvString, 'utf-8');
    const base64 = buffer.toString('base64');
    return {
      success: true,
      buffer: base64,
      filename: `payment-report-${new Date().toISOString().split('T')[0]}.csv`,
    };
  } catch (error) {
    console.error('Error exporting payment report to CSV:', error);
    return { success: false, error: 'Failed to export payment report to CSV' };
  }
}

/**
 * Export expense report to Excel
 */
export async function exportExpenseReportToExcel() {
  try {
    const result = await generateExpenseReport();
    if (!result.success || !result.data) {
      return { success: false, error: 'Failed to generate expense report' };
    }

    const { expenses, expensesByCategory, monthlyExpenses } = result.data;
    const workbook = XLSX.utils.book_new();

    // Create summary sheet
    const summaryData = [
      ['Expense Report Summary'],
      [''],
      ['Total Expenses', result.data.totalExpenses],
      ['Total Amount', `$${result.data.totalAmount?.toFixed(2) || '0.00'}`],
      [''],
      ['Generated on', new Date().toLocaleDateString()],
    ];

    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

    // Create expenses by category sheet
    const categoryData = [['Category', 'Amount', 'Count']];

    expensesByCategory?.forEach((category) => {
      categoryData.push([
        category.category,
        `$${category.amount?.toFixed(2) || '0.00'}`,
        category.count.toString(),
      ]);
    });

    const categorySheet = XLSX.utils.aoa_to_sheet(categoryData);
    XLSX.utils.book_append_sheet(workbook, categorySheet, 'By Category');

    // Create monthly expenses sheet
    const monthlyData = [['Month', 'Amount', 'Count']];

    monthlyExpenses?.forEach((month) => {
      monthlyData.push([
        month.month,
        `$${month.amount?.toFixed(2) || '0.00'}`,
        month.count.toString(),
      ]);
    });

    const monthlySheet = XLSX.utils.aoa_to_sheet(monthlyData);
    XLSX.utils.book_append_sheet(workbook, monthlySheet, 'Monthly Summary');

    // Create detailed expenses sheet
    const expensesData = [['Property Address', 'Expense Type', 'Amount', 'Date']];

    expenses.forEach((expense) => {
      expensesData.push([
        expense.propertyAddress,
        expense.type,
        `$${expense.amount?.toFixed(2) || '0.00'}`,
        new Date(expense.date).toLocaleDateString(),
      ]);
    });

    const expensesSheet = XLSX.utils.aoa_to_sheet(expensesData);
    XLSX.utils.book_append_sheet(workbook, expensesSheet, 'Expense Details');

    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    const base64 = buffer.toString('base64');
    return {
      success: true,
      buffer: base64,
      filename: `expense-report-${new Date().toISOString().split('T')[0]}.xlsx`,
    };
  } catch (error) {
    console.error('Error exporting expense report to Excel:', error);
    return { success: false, error: 'Failed to export expense report to Excel' };
  }
}

/**
 * Export expense report to CSV
 */
export async function exportExpenseReportToCSV() {
  try {
    const result = await generateExpenseReport();
    if (!result.success || !result.data) {
      return { success: false, error: 'Failed to generate expense report' };
    }

    const { expenses } = result.data;
    const csvData = [['Property Address', 'Expense Type', 'Amount', 'Date']];

    expenses.forEach((expense) => {
      csvData.push([
        expense.propertyAddress,
        expense.type,
        `$${expense.amount?.toFixed(2) || '0.00'}`,
        new Date(expense.date).toLocaleDateString(),
      ]);
    });

    const csvString = csvData.map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n');
    const buffer = Buffer.from(csvString, 'utf-8');
    const base64 = buffer.toString('base64');
    return {
      success: true,
      buffer: base64,
      filename: `expense-report-${new Date().toISOString().split('T')[0]}.csv`,
    };
  } catch (error) {
    console.error('Error exporting expense report to CSV:', error);
    return { success: false, error: 'Failed to export expense report to CSV' };
  }
}

/**
 * Export renovation report to Excel
 */
export async function exportRenovationReportToExcel() {
  try {
    const result = await generateRenovationReport();
    if (!result.success || !result.data) {
      return { success: false, error: 'Failed to generate renovation report' };
    }

    const { renovations, renovationsByTitle, renovationsByProperty } = result.data;
    const workbook = XLSX.utils.book_new();

    // Create summary sheet
    const summaryData = [
      ['Renovation Report Summary'],
      [''],
      ['Total Renovations', result.data.totalRenovations],
      ['Total Cost', `$${result.data.totalCost?.toFixed(2) || '0.00'}`],
      [''],
      ['Generated on', new Date().toLocaleDateString()],
    ];

    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

    // Create renovations by title sheet
    const titleData = [['Title', 'Count', 'Total Cost']];

    renovationsByTitle?.forEach((title) => {
      titleData.push([
        title.title,
        title.count.toString(),
        `$${title.totalCost?.toFixed(2) || '0.00'}`,
      ]);
    });

    const titleSheet = XLSX.utils.aoa_to_sheet(titleData);
    XLSX.utils.book_append_sheet(workbook, titleSheet, 'By Title');

    // Create renovations by property sheet
    const propertyData = [['Property', 'Count', 'Total Cost']];

    renovationsByProperty?.forEach((property) => {
      propertyData.push([
        property.property,
        property.count.toString(),
        `$${property.totalCost?.toFixed(2) || '0.00'}`,
      ]);
    });

    const propertySheet = XLSX.utils.aoa_to_sheet(propertyData);
    XLSX.utils.book_append_sheet(workbook, propertySheet, 'By Property');

    // Create detailed renovations sheet
    const renovationsData = [
      ['Property Address', 'Unit Number', 'Title', 'Total Cost', 'Start Date', 'End Date'],
    ];

    renovations.forEach((renovation) => {
      renovationsData.push([
        renovation.propertyAddress,
        renovation.unitNumber || '',
        renovation.title,
        `$${renovation.totalCost?.toFixed(2) || '0.00'}`,
        renovation.startDate ? new Date(renovation.startDate).toLocaleDateString() : '',
        renovation.endDate ? new Date(renovation.endDate).toLocaleDateString() : '',
      ]);
    });

    const renovationsSheet = XLSX.utils.aoa_to_sheet(renovationsData);
    XLSX.utils.book_append_sheet(workbook, renovationsSheet, 'Renovation Details');

    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    const base64 = buffer.toString('base64');
    return {
      success: true,
      buffer: base64,
      filename: `renovation-report-${new Date().toISOString().split('T')[0]}.xlsx`,
    };
  } catch (error) {
    console.error('Error exporting renovation report to Excel:', error);
    return { success: false, error: 'Failed to export renovation report to Excel' };
  }
}

/**
 * Export renovation report to CSV
 */
export async function exportRenovationReportToCSV() {
  try {
    const result = await generateRenovationReport();
    if (!result.success || !result.data) {
      return { success: false, error: 'Failed to generate renovation report' };
    }

    const { renovations } = result.data;
    const csvData = [
      ['Property Address', 'Unit Number', 'Title', 'Total Cost', 'Start Date', 'End Date'],
    ];

    renovations.forEach((renovation) => {
      csvData.push([
        renovation.propertyAddress,
        renovation.unitNumber || '',
        renovation.title,
        `$${renovation.totalCost?.toFixed(2) || '0.00'}`,
        renovation.startDate ? new Date(renovation.startDate).toLocaleDateString() : '',
        renovation.endDate ? new Date(renovation.endDate).toLocaleDateString() : '',
      ]);
    });

    const csvString = csvData.map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n');
    const buffer = Buffer.from(csvString, 'utf-8');
    const base64 = buffer.toString('base64');
    return {
      success: true,
      buffer: base64,
      filename: `renovation-report-${new Date().toISOString().split('T')[0]}.csv`,
    };
  } catch (error) {
    console.error('Error exporting renovation report to CSV:', error);
    return { success: false, error: 'Failed to export renovation report to CSV' };
  }
}

/**
 * Export parking report to Excel
 */
export async function exportParkingReportToExcel() {
  try {
    const result = await generateParkingReport();
    if (!result.success || !result.data) {
      return { success: false, error: 'Failed to generate parking report' };
    }

    const { permits, permitsByStatus, permitsByBuilding } = result.data;
    const workbook = XLSX.utils.book_new();

    // Create summary sheet
    const summaryData = [
      ['Parking Report Summary'],
      [''],
      ['Total Permits', result.data.totalPermits],
      ['Active Permits', result.data.activePermits],
      [''],
      ['Generated on', new Date().toLocaleDateString()],
    ];

    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

    // Create permits by status sheet
    const statusData = [['Status', 'Count']];

    permitsByStatus?.forEach((status) => {
      statusData.push([status.status, status.count.toString()]);
    });

    const statusSheet = XLSX.utils.aoa_to_sheet(statusData);
    XLSX.utils.book_append_sheet(workbook, statusSheet, 'By Status');

    // Create permits by building sheet
    const buildingData = [['Building', 'Count']];

    permitsByBuilding?.forEach((building) => {
      buildingData.push([building.building, building.count.toString()]);
    });

    const buildingSheet = XLSX.utils.aoa_to_sheet(buildingData);
    XLSX.utils.book_append_sheet(workbook, buildingSheet, 'By Building');

    // Create detailed permits sheet
    const permitsData = [
      [
        'Property Address',
        'Tenant Name',
        'Unit Number',
        'Building',
        'Status',
        'License Plate',
        'Vehicle Make',
        'Vehicle Model',
        'Vehicle Year',
        'Vehicle Color',
        'Issued At',
      ],
    ];

    permits.forEach((permit) => {
      permitsData.push([
        permit.propertyAddress,
        permit.tenantName || '',
        permit.unitNumber || '',
        permit.building || '',
        permit.status || '',
        permit.licensePlate || '',
        permit.vehicleMake || '',
        permit.vehicleModel || '',
        permit.vehicleYear || '',
        permit.vehicleColor || '',
        permit.issuedAt ? new Date(permit.issuedAt).toLocaleDateString() : '',
      ]);
    });

    const permitsSheet = XLSX.utils.aoa_to_sheet(permitsData);
    XLSX.utils.book_append_sheet(workbook, permitsSheet, 'Permit Details');

    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    const base64 = buffer.toString('base64');
    return {
      success: true,
      buffer: base64,
      filename: `parking-report-${new Date().toISOString().split('T')[0]}.xlsx`,
    };
  } catch (error) {
    console.error('Error exporting parking report to Excel:', error);
    return { success: false, error: 'Failed to export parking report to Excel' };
  }
}

/**
 * Export parking report to CSV
 */
export async function exportParkingReportToCSV() {
  try {
    const result = await generateParkingReport();
    if (!result.success || !result.data) {
      return { success: false, error: 'Failed to generate parking report' };
    }

    const { permits } = result.data;
    const csvData = [
      [
        'Property Address',
        'Tenant Name',
        'Unit Number',
        'Building',
        'Status',
        'License Plate',
        'Vehicle Make',
        'Vehicle Model',
        'Vehicle Year',
        'Vehicle Color',
        'Issued At',
      ],
    ];

    permits.forEach((permit) => {
      csvData.push([
        permit.propertyAddress,
        permit.tenantName || '',
        permit.unitNumber || '',
        permit.building || '',
        permit.status || '',
        permit.licensePlate || '',
        permit.vehicleMake || '',
        permit.vehicleModel || '',
        permit.vehicleYear || '',
        permit.vehicleColor || '',
        permit.issuedAt ? new Date(permit.issuedAt).toLocaleDateString() : '',
      ]);
    });

    const csvString = csvData.map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n');
    const buffer = Buffer.from(csvString, 'utf-8');
    const base64 = buffer.toString('base64');
    return {
      success: true,
      buffer: base64,
      filename: `parking-report-${new Date().toISOString().split('T')[0]}.csv`,
    };
  } catch (error) {
    console.error('Error exporting parking report to CSV:', error);
    return { success: false, error: 'Failed to export parking report to CSV' };
  }
}
