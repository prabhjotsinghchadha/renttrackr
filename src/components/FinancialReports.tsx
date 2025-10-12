'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import {
  exportCashFlowToCSV,
  exportCashFlowToExcel,
  exportIncomeStatementToCSV,
  exportIncomeStatementToExcel,
  exportTaxSummaryToCSV,
  exportTaxSummaryToExcel,
  generateCashFlowAnalysis,
  generateIncomeStatement,
  generateIncomeStatementAllData,
  generateTaxSummary,
} from '@/actions/FinancialActions';

type FinancialReportsProps = {
  locale: string;
};

export function FinancialReports({ locale: _locale }: FinancialReportsProps) {
  const t = useTranslations('Financials');
  const [isExporting, setIsExporting] = useState<string | null>(null);
  const [isExportingCSV, setIsExportingCSV] = useState<string | null>(null);
  const [isViewing, setIsViewing] = useState<string | null>(null);
  const [viewData, setViewData] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);

  const handleView = async (type: 'income' | 'cashflow' | 'tax') => {
    setIsViewing(type);
    try {
      let result;
      switch (type) {
        case 'income':
          // Try current year first, fallback to all data if no current year data
          result = await generateIncomeStatement();
          if (
            result.success &&
            result.data &&
            result.data.paymentCount === 0 &&
            result.data.expenseCount === 0
          ) {
            result = await generateIncomeStatementAllData();
          }
          break;
        case 'cashflow':
          result = await generateCashFlowAnalysis();
          break;
        case 'tax':
          result = await generateTaxSummary();
          break;
        default:
          return;
      }

      if (result.success && result.data) {
        setViewData({ type, data: result.data });
        setShowModal(true);
      } else {
        console.error('View failed:', result.error);
        // TODO: Replace with proper toast notification
        console.error(t('export_error'));
      }
    } catch (error) {
      console.error('View error:', error);
      // TODO: Replace with proper toast notification
      console.error(t('export_error'));
    } finally {
      setIsViewing(null);
    }
  };

  const handleExport = async (type: 'income' | 'cashflow' | 'tax') => {
    setIsExporting(type);
    try {
      let result;
      switch (type) {
        case 'income':
          result = await exportIncomeStatementToExcel();
          break;
        case 'cashflow':
          result = await exportCashFlowToExcel();
          break;
        case 'tax':
          result = await exportTaxSummaryToExcel();
          break;
        default:
          return;
      }

      if (result.success && result.buffer) {
        // Convert base64 to blob and download
        const byteCharacters = atob(result.buffer);
        const byteNumbers: number[] = Array.from({ length: byteCharacters.length }, (_, i) =>
          byteCharacters.charCodeAt(i),
        );
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = result.filename || `report-${type}.xlsx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } else {
        console.error('Export failed:', result.error);
        // TODO: Replace with proper toast notification
        console.error(t('export_error'));
      }
    } catch (error) {
      console.error('Export error:', error);
      // TODO: Replace with proper toast notification
      console.error(t('export_error'));
    } finally {
      setIsExporting(null);
    }
  };

  const handleExportCSV = async (type: 'income' | 'cashflow' | 'tax') => {
    setIsExportingCSV(type);
    try {
      let result;
      switch (type) {
        case 'income':
          result = await exportIncomeStatementToCSV();
          break;
        case 'cashflow':
          result = await exportCashFlowToCSV();
          break;
        case 'tax':
          result = await exportTaxSummaryToCSV();
          break;
        default:
          return;
      }

      if (result.success && result.buffer) {
        // Convert base64 to blob and download
        const csvContent = atob(result.buffer);
        const blob = new Blob([csvContent], {
          type: 'text/csv;charset=utf-8;',
        });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = result.filename || `report-${type}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } else {
        console.error('CSV Export failed:', result.error);
        // TODO: Replace with proper toast notification
        console.error(t('export_error'));
      }
    } catch (error) {
      console.error('CSV Export error:', error);
      // TODO: Replace with proper toast notification
      console.error(t('export_error'));
    } finally {
      setIsExportingCSV(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="group flex w-full items-center justify-between rounded-xl border-2 border-gray-200 bg-white p-6 text-left transition-all duration-300 hover:-translate-y-1 hover:border-blue-600 hover:shadow-lg">
        <div>
          <div className="mb-2 flex items-center gap-3">
            <span className="text-3xl">📋</span>
            <div className="text-xl font-semibold text-gray-800 group-hover:text-blue-600">
              {t('income_statement')}
            </div>
          </div>
          <div className="text-lg text-gray-600">{t('income_statement_description')}</div>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => handleView('income')}
            disabled={isViewing === 'income'}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-all duration-300 hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isViewing === 'income' ? t('loading') : t('view_report')}
          </button>
          <button
            type="button"
            onClick={() => handleExport('income')}
            disabled={isExporting === 'income'}
            className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white transition-all duration-300 hover:bg-green-700 focus:ring-4 focus:ring-green-300 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isExporting === 'income' ? t('exporting') : t('export_excel')}
          </button>
          <button
            type="button"
            onClick={() => handleExportCSV('income')}
            disabled={isExportingCSV === 'income'}
            className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white transition-all duration-300 hover:bg-orange-700 focus:ring-4 focus:ring-orange-300 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isExportingCSV === 'income' ? t('exporting') : t('export_csv')}
          </button>
          <span className="text-3xl text-gray-400 transition-colors group-hover:text-blue-600">
            →
          </span>
        </div>
      </div>

      <div className="group flex w-full items-center justify-between rounded-xl border-2 border-gray-200 bg-white p-6 text-left transition-all duration-300 hover:-translate-y-1 hover:border-blue-600 hover:shadow-lg">
        <div>
          <div className="mb-2 flex items-center gap-3">
            <span className="text-3xl">💸</span>
            <div className="text-xl font-semibold text-gray-800 group-hover:text-blue-600">
              {t('cash_flow')}
            </div>
          </div>
          <div className="text-lg text-gray-600">{t('cash_flow_description')}</div>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => handleView('cashflow')}
            disabled={isViewing === 'cashflow'}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-all duration-300 hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isViewing === 'cashflow' ? t('loading') : t('view_report')}
          </button>
          <button
            type="button"
            onClick={() => handleExport('cashflow')}
            disabled={isExporting === 'cashflow'}
            className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white transition-all duration-300 hover:bg-green-700 focus:ring-4 focus:ring-green-300 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isExporting === 'cashflow' ? t('exporting') : t('export_excel')}
          </button>
          <button
            type="button"
            onClick={() => handleExportCSV('cashflow')}
            disabled={isExportingCSV === 'cashflow'}
            className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white transition-all duration-300 hover:bg-orange-700 focus:ring-4 focus:ring-orange-300 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isExportingCSV === 'cashflow' ? t('exporting') : t('export_csv')}
          </button>
          <span className="text-3xl text-gray-400 transition-colors group-hover:text-blue-600">
            →
          </span>
        </div>
      </div>

      <div className="group flex w-full items-center justify-between rounded-xl border-2 border-gray-200 bg-white p-6 text-left transition-all duration-300 hover:-translate-y-1 hover:border-blue-600 hover:shadow-lg">
        <div>
          <div className="mb-2 flex items-center gap-3">
            <span className="text-3xl">🧾</span>
            <div className="text-xl font-semibold text-gray-800 group-hover:text-blue-600">
              {t('tax_summary')}
            </div>
          </div>
          <div className="text-lg text-gray-600">{t('tax_summary_description')}</div>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => handleView('tax')}
            disabled={isViewing === 'tax'}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-all duration-300 hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isViewing === 'tax' ? t('loading') : t('view_report')}
          </button>
          <button
            type="button"
            onClick={() => handleExport('tax')}
            disabled={isExporting === 'tax'}
            className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white transition-all duration-300 hover:bg-green-700 focus:ring-4 focus:ring-green-300 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isExporting === 'tax' ? t('exporting') : t('export_excel')}
          </button>
          <button
            type="button"
            onClick={() => handleExportCSV('tax')}
            disabled={isExportingCSV === 'tax'}
            className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white transition-all duration-300 hover:bg-orange-700 focus:ring-4 focus:ring-orange-300 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isExportingCSV === 'tax' ? t('exporting') : t('export_csv')}
          </button>
          <span className="text-3xl text-gray-400 transition-colors group-hover:text-blue-600">
            →
          </span>
        </div>
      </div>

      {/* Report View Modal */}
      {showModal && viewData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-lg bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800">
                {viewData.type === 'income' && t('income_statement')}
                {viewData.type === 'cashflow' && t('cash_flow')}
                {viewData.type === 'tax' && t('tax_summary')}
              </h2>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="rounded-lg bg-gray-200 p-2 text-gray-600 hover:bg-gray-300"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6">
              {/* Summary Section */}
              <div className="rounded-lg bg-gray-50 p-4">
                <h3 className="mb-3 text-lg font-semibold text-gray-800">{t('summary')}</h3>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      ${viewData.data.totalRevenue?.toFixed(2) || '0.00'}
                    </div>
                    <div className="text-sm text-gray-600">{t('total_revenue')}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">
                      ${viewData.data.totalExpenses?.toFixed(2) || '0.00'}
                    </div>
                    <div className="text-sm text-gray-600">{t('total_expenses')}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      $
                      {(
                        viewData.data.netIncome ||
                        viewData.data.totalNetCashFlow ||
                        viewData.data.taxableIncome
                      )?.toFixed(2) || '0.00'}
                    </div>
                    <div className="text-sm text-gray-600">
                      {viewData.type === 'income' && t('net_income')}
                      {viewData.type === 'cashflow' && t('net_cash_flow')}
                      {viewData.type === 'tax' && t('taxable_income')}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{viewData.data.year}</div>
                    <div className="text-sm text-gray-600">{t('year')}</div>
                  </div>
                </div>
              </div>

              {/* Monthly Data for Income Statement and Cash Flow */}
              {(viewData.type === 'income' || viewData.type === 'cashflow') &&
                viewData.data.monthlyRevenue && (
                  <div className="rounded-lg bg-white p-4 shadow-sm">
                    <h3 className="mb-3 text-lg font-semibold text-gray-800">
                      {t('monthly_breakdown')}
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left">Month</th>
                            <th className="text-right">Revenue</th>
                            {viewData.type === 'cashflow' && (
                              <>
                                <th className="text-right">Expenses</th>
                                <th className="text-right">Net Flow</th>
                              </>
                            )}
                            <th className="text-right">Count</th>
                          </tr>
                        </thead>
                        <tbody>
                          {viewData.data.monthlyRevenue.map((month: any) => (
                            <tr key={`month-${month.month}-${month.revenue}`} className="border-b">
                              <td className="py-2">{month.month}</td>
                              <td className="text-right font-semibold text-green-600">
                                ${month.revenue?.toFixed(2) || '0.00'}
                              </td>
                              {viewData.type === 'cashflow' && viewData.data.monthlyData && (
                                <>
                                  <td className="text-right font-semibold text-red-600">
                                    $
                                    {viewData.data.monthlyData
                                      .find((m: any) => m.month === month.month)
                                      ?.expenses?.toFixed(2) || '0.00'}
                                  </td>
                                  <td className="text-right font-semibold text-blue-600">
                                    $
                                    {viewData.data.monthlyData
                                      .find((m: any) => m.month === month.month)
                                      ?.netCashFlow?.toFixed(2) || '0.00'}
                                  </td>
                                </>
                              )}
                              <td className="text-right text-gray-600">{month.count || 0}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

              {/* Cash Flow Monthly Data */}
              {viewData.type === 'cashflow' && viewData.data.monthlyData && (
                <div className="rounded-lg bg-white p-4 shadow-sm">
                  <h3 className="mb-3 text-lg font-semibold text-gray-800">Monthly Cash Flow</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left">Month</th>
                          <th className="text-right">Revenue</th>
                          <th className="text-right">Expenses</th>
                          <th className="text-right">Net Cash Flow</th>
                        </tr>
                      </thead>
                      <tbody>
                        {viewData.data.monthlyData.map((month: any) => (
                          <tr
                            key={`cashflow-month-${month.month}-${month.revenue}`}
                            className="border-b"
                          >
                            <td className="py-2">{month.month}</td>
                            <td className="text-right font-semibold text-green-600">
                              ${month.revenue?.toFixed(2) || '0.00'}
                            </td>
                            <td className="text-right font-semibold text-red-600">
                              ${month.expenses?.toFixed(2) || '0.00'}
                            </td>
                            <td className="text-right font-semibold text-blue-600">
                              ${month.netCashFlow?.toFixed(2) || '0.00'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Expenses by Category */}
              {viewData.data.expensesByCategory && (
                <div className="rounded-lg bg-white p-4 shadow-sm">
                  <h3 className="mb-3 text-lg font-semibold text-gray-800">Expenses by Category</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left">Category</th>
                          <th className="text-right">Amount</th>
                          <th className="text-right">Count</th>
                        </tr>
                      </thead>
                      <tbody>
                        {viewData.data.expensesByCategory.map((category: any) => (
                          <tr
                            key={`expense-category-${category.category}-${category.amount}`}
                            className="border-b"
                          >
                            <td className="py-2">{category.category}</td>
                            <td className="text-right font-semibold text-red-600">
                              ${category.amount?.toFixed(2) || '0.00'}
                            </td>
                            <td className="text-right text-gray-600">{category.count || 0}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Tax Summary Categorized Expenses */}
              {viewData.type === 'tax' && viewData.data.categorizedExpenses && (
                <div className="rounded-lg bg-white p-4 shadow-sm">
                  <h3 className="mb-3 text-lg font-semibold text-gray-800">
                    Tax-Deductible Expenses
                  </h3>
                  <div className="space-y-4">
                    {viewData.data.categorizedExpenses.map((category: any) => (
                      <div
                        key={`tax-category-${category.category}-${category.amount}`}
                        className="border-l-4 border-blue-500 pl-4"
                      >
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-gray-800">{category.category}</h4>
                          <span className="text-lg font-bold text-red-600">
                            ${category.amount?.toFixed(2) || '0.00'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{category.count} items</p>
                        {category.items && category.items.length > 0 && (
                          <div className="mt-2 max-h-32 overflow-y-auto">
                            {category.items.slice(0, 5).map((item: any) => (
                              <div
                                key={`tax-item-${item.date}-${item.type}-${item.amount}`}
                                className="flex justify-between text-sm"
                              >
                                <span>
                                  {new Date(item.date).toLocaleDateString()} - {item.type}
                                </span>
                                <span>${item.amount?.toFixed(2) || '0.00'}</span>
                              </div>
                            ))}
                            {category.items.length > 5 && (
                              <div className="text-sm text-gray-500">
                                ... and {category.items.length - 5} more items
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
