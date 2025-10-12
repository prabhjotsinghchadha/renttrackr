'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import {
  exportCashFlowToCSV,
  exportCashFlowToExcel,
  exportExpenseReportToCSV,
  exportExpenseReportToExcel,
  exportIncomeStatementToCSV,
  exportIncomeStatementToExcel,
  exportParkingReportToCSV,
  exportParkingReportToExcel,
  exportPaymentReportToCSV,
  exportPaymentReportToExcel,
  exportPropertyReportToCSV,
  exportPropertyReportToExcel,
  exportRenovationReportToCSV,
  exportRenovationReportToExcel,
  exportTaxSummaryToCSV,
  exportTaxSummaryToExcel,
  exportTenantReportToCSV,
  exportTenantReportToExcel,
  generateCashFlowAnalysis,
  generateExpenseReport,
  generateIncomeStatement,
  generateIncomeStatementAllData,
  generateParkingReport,
  generatePaymentReport,
  generatePropertyReport,
  generateRenovationReport,
  generateTaxSummary,
  generateTenantReport,
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

  const handleView = async (
    type:
      | 'income'
      | 'cashflow'
      | 'tax'
      | 'property'
      | 'tenant'
      | 'payment'
      | 'expense'
      | 'renovation'
      | 'parking',
  ) => {
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
        case 'property':
          result = await generatePropertyReport();
          break;
        case 'tenant':
          result = await generateTenantReport();
          break;
        case 'payment':
          result = await generatePaymentReport();
          break;
        case 'expense':
          result = await generateExpenseReport();
          break;
        case 'renovation':
          result = await generateRenovationReport();
          break;
        case 'parking':
          result = await generateParkingReport();
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

  const handleExport = async (
    type:
      | 'income'
      | 'cashflow'
      | 'tax'
      | 'property'
      | 'tenant'
      | 'payment'
      | 'expense'
      | 'renovation'
      | 'parking',
  ) => {
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
        case 'property':
          result = await exportPropertyReportToExcel();
          break;
        case 'tenant':
          result = await exportTenantReportToExcel();
          break;
        case 'payment':
          result = await exportPaymentReportToExcel();
          break;
        case 'expense':
          result = await exportExpenseReportToExcel();
          break;
        case 'renovation':
          result = await exportRenovationReportToExcel();
          break;
        case 'parking':
          result = await exportParkingReportToExcel();
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

  const handleExportCSV = async (
    type:
      | 'income'
      | 'cashflow'
      | 'tax'
      | 'property'
      | 'tenant'
      | 'payment'
      | 'expense'
      | 'renovation'
      | 'parking',
  ) => {
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
        case 'property':
          result = await exportPropertyReportToCSV();
          break;
        case 'tenant':
          result = await exportTenantReportToCSV();
          break;
        case 'payment':
          result = await exportPaymentReportToCSV();
          break;
        case 'expense':
          result = await exportExpenseReportToCSV();
          break;
        case 'renovation':
          result = await exportRenovationReportToCSV();
          break;
        case 'parking':
          result = await exportParkingReportToCSV();
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

      {/* Property Report */}
      <div className="group flex w-full items-center justify-between rounded-xl border-2 border-gray-200 bg-white p-6 text-left transition-all duration-300 hover:-translate-y-1 hover:border-blue-600 hover:shadow-lg">
        <div>
          <div className="mb-2 flex items-center gap-3">
            <span className="text-3xl">🏠</span>
            <div className="text-xl font-semibold text-gray-800 group-hover:text-blue-600">
              {t('property_report')}
            </div>
          </div>
          <div className="text-lg text-gray-600">{t('property_report_description')}</div>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => handleView('property')}
            disabled={isViewing === 'property'}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-all duration-300 hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isViewing === 'property' ? t('loading') : t('view_report')}
          </button>
          <button
            type="button"
            onClick={() => handleExport('property')}
            disabled={isExporting === 'property'}
            className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white transition-all duration-300 hover:bg-green-700 focus:ring-4 focus:ring-green-300 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isExporting === 'property' ? t('exporting') : t('export_excel')}
          </button>
          <button
            type="button"
            onClick={() => handleExportCSV('property')}
            disabled={isExportingCSV === 'property'}
            className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white transition-all duration-300 hover:bg-orange-700 focus:ring-4 focus:ring-orange-300 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isExportingCSV === 'property' ? t('exporting') : t('export_csv')}
          </button>
          <span className="text-3xl text-gray-400 transition-colors group-hover:text-blue-600">
            →
          </span>
        </div>
      </div>

      {/* Tenant Report */}
      <div className="group flex w-full items-center justify-between rounded-xl border-2 border-gray-200 bg-white p-6 text-left transition-all duration-300 hover:-translate-y-1 hover:border-blue-600 hover:shadow-lg">
        <div>
          <div className="mb-2 flex items-center gap-3">
            <span className="text-3xl">👥</span>
            <div className="text-xl font-semibold text-gray-800 group-hover:text-blue-600">
              {t('tenant_report')}
            </div>
          </div>
          <div className="text-lg text-gray-600">{t('tenant_report_description')}</div>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => handleView('tenant')}
            disabled={isViewing === 'tenant'}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-all duration-300 hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isViewing === 'tenant' ? t('loading') : t('view_report')}
          </button>
          <button
            type="button"
            onClick={() => handleExport('tenant')}
            disabled={isExporting === 'tenant'}
            className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white transition-all duration-300 hover:bg-green-700 focus:ring-4 focus:ring-green-300 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isExporting === 'tenant' ? t('exporting') : t('export_excel')}
          </button>
          <button
            type="button"
            onClick={() => handleExportCSV('tenant')}
            disabled={isExportingCSV === 'tenant'}
            className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white transition-all duration-300 hover:bg-orange-700 focus:ring-4 focus:ring-orange-300 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isExportingCSV === 'tenant' ? t('exporting') : t('export_csv')}
          </button>
          <span className="text-3xl text-gray-400 transition-colors group-hover:text-blue-600">
            →
          </span>
        </div>
      </div>

      {/* Payment Report */}
      <div className="group flex w-full items-center justify-between rounded-xl border-2 border-gray-200 bg-white p-6 text-left transition-all duration-300 hover:-translate-y-1 hover:border-blue-600 hover:shadow-lg">
        <div>
          <div className="mb-2 flex items-center gap-3">
            <span className="text-3xl">💳</span>
            <div className="text-xl font-semibold text-gray-800 group-hover:text-blue-600">
              {t('payment_report')}
            </div>
          </div>
          <div className="text-lg text-gray-600">{t('payment_report_description')}</div>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => handleView('payment')}
            disabled={isViewing === 'payment'}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-all duration-300 hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isViewing === 'payment' ? t('loading') : t('view_report')}
          </button>
          <button
            type="button"
            onClick={() => handleExport('payment')}
            disabled={isExporting === 'payment'}
            className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white transition-all duration-300 hover:bg-green-700 focus:ring-4 focus:ring-green-300 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isExporting === 'payment' ? t('exporting') : t('export_excel')}
          </button>
          <button
            type="button"
            onClick={() => handleExportCSV('payment')}
            disabled={isExportingCSV === 'payment'}
            className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white transition-all duration-300 hover:bg-orange-700 focus:ring-4 focus:ring-orange-300 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isExportingCSV === 'payment' ? t('exporting') : t('export_csv')}
          </button>
          <span className="text-3xl text-gray-400 transition-colors group-hover:text-blue-600">
            →
          </span>
        </div>
      </div>

      {/* Expense Report */}
      <div className="group flex w-full items-center justify-between rounded-xl border-2 border-gray-200 bg-white p-6 text-left transition-all duration-300 hover:-translate-y-1 hover:border-blue-600 hover:shadow-lg">
        <div>
          <div className="mb-2 flex items-center gap-3">
            <span className="text-3xl">💰</span>
            <div className="text-xl font-semibold text-gray-800 group-hover:text-blue-600">
              {t('expense_report')}
            </div>
          </div>
          <div className="text-lg text-gray-600">{t('expense_report_description')}</div>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => handleView('expense')}
            disabled={isViewing === 'expense'}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-all duration-300 hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isViewing === 'expense' ? t('loading') : t('view_report')}
          </button>
          <button
            type="button"
            onClick={() => handleExport('expense')}
            disabled={isExporting === 'expense'}
            className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white transition-all duration-300 hover:bg-green-700 focus:ring-4 focus:ring-green-300 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isExporting === 'expense' ? t('exporting') : t('export_excel')}
          </button>
          <button
            type="button"
            onClick={() => handleExportCSV('expense')}
            disabled={isExportingCSV === 'expense'}
            className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white transition-all duration-300 hover:bg-orange-700 focus:ring-4 focus:ring-orange-300 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isExportingCSV === 'expense' ? t('exporting') : t('export_csv')}
          </button>
          <span className="text-3xl text-gray-400 transition-colors group-hover:text-blue-600">
            →
          </span>
        </div>
      </div>

      {/* Renovation Report */}
      <div className="group flex w-full items-center justify-between rounded-xl border-2 border-gray-200 bg-white p-6 text-left transition-all duration-300 hover:-translate-y-1 hover:border-blue-600 hover:shadow-lg">
        <div>
          <div className="mb-2 flex items-center gap-3">
            <span className="text-3xl">🔨</span>
            <div className="text-xl font-semibold text-gray-800 group-hover:text-blue-600">
              {t('renovation_report')}
            </div>
          </div>
          <div className="text-lg text-gray-600">{t('renovation_report_description')}</div>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => handleView('renovation')}
            disabled={isViewing === 'renovation'}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-all duration-300 hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isViewing === 'renovation' ? t('loading') : t('view_report')}
          </button>
          <button
            type="button"
            onClick={() => handleExport('renovation')}
            disabled={isExporting === 'renovation'}
            className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white transition-all duration-300 hover:bg-green-700 focus:ring-4 focus:ring-green-300 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isExporting === 'renovation' ? t('exporting') : t('export_excel')}
          </button>
          <button
            type="button"
            onClick={() => handleExportCSV('renovation')}
            disabled={isExportingCSV === 'renovation'}
            className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white transition-all duration-300 hover:bg-orange-700 focus:ring-4 focus:ring-orange-300 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isExportingCSV === 'renovation' ? t('exporting') : t('export_csv')}
          </button>
          <span className="text-3xl text-gray-400 transition-colors group-hover:text-blue-600">
            →
          </span>
        </div>
      </div>

      {/* Parking Report */}
      <div className="group flex w-full items-center justify-between rounded-xl border-2 border-gray-200 bg-white p-6 text-left transition-all duration-300 hover:-translate-y-1 hover:border-blue-600 hover:shadow-lg">
        <div>
          <div className="mb-2 flex items-center gap-3">
            <span className="text-3xl">🚗</span>
            <div className="text-xl font-semibold text-gray-800 group-hover:text-blue-600">
              {t('parking_report')}
            </div>
          </div>
          <div className="text-lg text-gray-600">{t('parking_report_description')}</div>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => handleView('parking')}
            disabled={isViewing === 'parking'}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-all duration-300 hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isViewing === 'parking' ? t('loading') : t('view_report')}
          </button>
          <button
            type="button"
            onClick={() => handleExport('parking')}
            disabled={isExporting === 'parking'}
            className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white transition-all duration-300 hover:bg-green-700 focus:ring-4 focus:ring-green-300 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isExporting === 'parking' ? t('exporting') : t('export_excel')}
          </button>
          <button
            type="button"
            onClick={() => handleExportCSV('parking')}
            disabled={isExportingCSV === 'parking'}
            className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white transition-all duration-300 hover:bg-orange-700 focus:ring-4 focus:ring-orange-300 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isExportingCSV === 'parking' ? t('exporting') : t('export_csv')}
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
                {viewData.type === 'property' && t('property_report')}
                {viewData.type === 'tenant' && t('tenant_report')}
                {viewData.type === 'payment' && t('payment_report')}
                {viewData.type === 'expense' && t('expense_report')}
                {viewData.type === 'renovation' && t('renovation_report')}
                {viewData.type === 'parking' && t('parking_report')}
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
                  {/* Financial Reports Summary */}
                  {(viewData.type === 'income' ||
                    viewData.type === 'cashflow' ||
                    viewData.type === 'tax') && (
                    <>
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
                        <div className="text-2xl font-bold text-purple-600">
                          {viewData.data.year}
                        </div>
                        <div className="text-sm text-gray-600">{t('year')}</div>
                      </div>
                    </>
                  )}

                  {/* Property Report Summary */}
                  {viewData.type === 'property' && (
                    <>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {viewData.data.totalProperties || 0}
                        </div>
                        <div className="text-sm text-gray-600">{t('total_properties')}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {viewData.data.totalUnits || 0}
                        </div>
                        <div className="text-sm text-gray-600">{t('total_units')}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600">
                          {viewData.data.totalOccupiedUnits || 0}
                        </div>
                        <div className="text-sm text-gray-600">{t('occupied_units')}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">
                          ${viewData.data.totalMonthlyRent?.toFixed(2) || '0.00'}
                        </div>
                        <div className="text-sm text-gray-600">{t('total_monthly_rent')}</div>
                      </div>
                    </>
                  )}

                  {/* Tenant Report Summary */}
                  {viewData.type === 'tenant' && (
                    <>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {viewData.data.totalTenants || 0}
                        </div>
                        <div className="text-sm text-gray-600">{t('total_tenants')}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {viewData.data.activeLeases || 0}
                        </div>
                        <div className="text-sm text-gray-600">{t('active_leases')}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600">
                          ${viewData.data.totalMonthlyRent?.toFixed(2) || '0.00'}
                        </div>
                        <div className="text-sm text-gray-600">{t('total_monthly_rent')}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">
                          ${viewData.data.totalCollected?.toFixed(2) || '0.00'}
                        </div>
                        <div className="text-sm text-gray-600">{t('total_collected')}</div>
                      </div>
                    </>
                  )}

                  {/* Payment Report Summary */}
                  {viewData.type === 'payment' && (
                    <>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {viewData.data.totalPayments || 0}
                        </div>
                        <div className="text-sm text-gray-600">{t('total_payments')}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          ${viewData.data.totalAmount?.toFixed(2) || '0.00'}
                        </div>
                        <div className="text-sm text-gray-600">{t('total_amount')}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-red-600">
                          ${viewData.data.totalLateFees?.toFixed(2) || '0.00'}
                        </div>
                        <div className="text-sm text-gray-600">{t('total_late_fees')}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">
                          {viewData.data.monthlyPayments?.length || 0}
                        </div>
                        <div className="text-sm text-gray-600">{t('monthly_payments')}</div>
                      </div>
                    </>
                  )}

                  {/* Expense Report Summary */}
                  {viewData.type === 'expense' && (
                    <>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {viewData.data.totalExpenses || 0}
                        </div>
                        <div className="text-sm text-gray-600">{t('total_expenses')}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-red-600">
                          ${viewData.data.totalAmount?.toFixed(2) || '0.00'}
                        </div>
                        <div className="text-sm text-gray-600">{t('total_amount')}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600">
                          {viewData.data.expensesByCategory?.length || 0}
                        </div>
                        <div className="text-sm text-gray-600">{t('categories')}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">
                          {viewData.data.monthlyExpenses?.length || 0}
                        </div>
                        <div className="text-sm text-gray-600">{t('monthly_expenses')}</div>
                      </div>
                    </>
                  )}

                  {/* Renovation Report Summary */}
                  {viewData.type === 'renovation' && (
                    <>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {viewData.data.totalRenovations || 0}
                        </div>
                        <div className="text-sm text-gray-600">{t('total_renovations')}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-red-600">
                          ${viewData.data.totalCost?.toFixed(2) || '0.00'}
                        </div>
                        <div className="text-sm text-gray-600">{t('total_cost')}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600">
                          {viewData.data.renovationsByTitle?.length || 0}
                        </div>
                        <div className="text-sm text-gray-600">{t('titles')}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">
                          {viewData.data.renovationsByProperty?.length || 0}
                        </div>
                        <div className="text-sm text-gray-600">{t('properties')}</div>
                      </div>
                    </>
                  )}

                  {/* Parking Report Summary */}
                  {viewData.type === 'parking' && (
                    <>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {viewData.data.totalPermits || 0}
                        </div>
                        <div className="text-sm text-gray-600">{t('total_permits')}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {viewData.data.activePermits || 0}
                        </div>
                        <div className="text-sm text-gray-600">{t('active_permits')}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600">
                          {viewData.data.permitsByStatus?.length || 0}
                        </div>
                        <div className="text-sm text-gray-600">{t('statuses')}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">
                          {viewData.data.permitsByBuilding?.length || 0}
                        </div>
                        <div className="text-sm text-gray-600">{t('buildings')}</div>
                      </div>
                    </>
                  )}
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

              {/* Property Report Details */}
              {viewData.type === 'property' && viewData.data.properties && (
                <div className="rounded-lg bg-white p-4 shadow-sm">
                  <h3 className="mb-3 text-lg font-semibold text-gray-800">Property Details</h3>
                  <div className="space-y-4">
                    {viewData.data.properties.map((property: any) => (
                      <div key={property.id} className="border-l-4 border-blue-500 pl-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-gray-800">{property.address}</h4>
                          <span className="text-sm text-gray-600">
                            {property.totalUnits} units, {property.occupiedUnits} occupied
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          Total Monthly Rent: ${property.totalMonthlyRent?.toFixed(2) || '0.00'}
                        </p>
                        {property.units && property.units.length > 0 && (
                          <div className="mt-2 max-h-32 overflow-y-auto">
                            {property.units.map((unit: any) => (
                              <div key={unit.id} className="flex justify-between text-sm">
                                <span>
                                  Unit {unit.unitNumber} -{' '}
                                  {unit.isOccupied ? unit.tenantName : 'Vacant'}
                                </span>
                                <span>${unit.monthlyRent?.toFixed(2) || '0.00'}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tenant Report Details */}
              {viewData.type === 'tenant' && viewData.data.tenants && (
                <div className="rounded-lg bg-white p-4 shadow-sm">
                  <h3 className="mb-3 text-lg font-semibold text-gray-800">Tenant Details</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left">{t('tenant_name')}</th>
                          <th className="text-left">{t('property_address')}</th>
                          <th className="text-left">{t('unit_number')}</th>
                          <th className="text-right">{t('monthly_rent')}</th>
                          <th className="text-right">{t('total_collected')}</th>
                          <th className="text-center">{t('is_occupied')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {viewData.data.tenants.map((tenant: any) => (
                          <tr key={tenant.id} className="border-b">
                            <td className="py-2">{tenant.name}</td>
                            <td className="py-2">{tenant.propertyAddress}</td>
                            <td className="py-2">{tenant.unitNumber}</td>
                            <td className="py-2 text-right font-semibold text-green-600">
                              ${tenant.monthlyRent?.toFixed(2) || '0.00'}
                            </td>
                            <td className="py-2 text-right font-semibold text-blue-600">
                              ${tenant.totalPaid?.toFixed(2) || '0.00'}
                            </td>
                            <td className="py-2 text-center">
                              <span
                                className={`rounded-full px-2 py-1 text-xs font-semibold ${
                                  tenant.isLeaseActive
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-gray-100 text-gray-800'
                                }`}
                              >
                                {tenant.isLeaseActive ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Payment Report Details */}
              {viewData.type === 'payment' && viewData.data.payments && (
                <div className="rounded-lg bg-white p-4 shadow-sm">
                  <h3 className="mb-3 text-lg font-semibold text-gray-800">Payment Records</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left">{t('tenant_name')}</th>
                          <th className="text-left">{t('property_address')}</th>
                          <th className="text-left">{t('unit_number')}</th>
                          <th className="text-right">{t('amount')}</th>
                          <th className="text-right">{t('late_fee')}</th>
                          <th className="text-left">{t('payment_date')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {viewData.data.payments.slice(0, 20).map((payment: any) => (
                          <tr key={payment.id} className="border-b">
                            <td className="py-2">{payment.tenantName}</td>
                            <td className="py-2">{payment.propertyAddress}</td>
                            <td className="py-2">{payment.unitNumber}</td>
                            <td className="py-2 text-right font-semibold text-green-600">
                              ${payment.amount?.toFixed(2) || '0.00'}
                            </td>
                            <td className="py-2 text-right text-red-600">
                              {payment.lateFee ? `$${payment.lateFee.toFixed(2)}` : '-'}
                            </td>
                            <td className="py-2">{new Date(payment.date).toLocaleDateString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {viewData.data.payments.length > 20 && (
                      <div className="mt-4 text-center text-sm text-gray-600">
                        Showing first 20 of {viewData.data.payments.length} payments
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Expense Report Details */}
              {viewData.type === 'expense' && viewData.data.expenses && (
                <div className="rounded-lg bg-white p-4 shadow-sm">
                  <h3 className="mb-3 text-lg font-semibold text-gray-800">Expense Records</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left">{t('property_address')}</th>
                          <th className="text-left">{t('expense_type')}</th>
                          <th className="text-right">{t('amount')}</th>
                          <th className="text-left">{t('expense_date')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {viewData.data.expenses.slice(0, 20).map((expense: any) => (
                          <tr key={expense.id} className="border-b">
                            <td className="py-2">{expense.propertyAddress}</td>
                            <td className="py-2">{expense.type}</td>
                            <td className="py-2 text-right font-semibold text-red-600">
                              ${expense.amount?.toFixed(2) || '0.00'}
                            </td>
                            <td className="py-2">{new Date(expense.date).toLocaleDateString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {viewData.data.expenses.length > 20 && (
                      <div className="mt-4 text-center text-sm text-gray-600">
                        Showing first 20 of {viewData.data.expenses.length} expenses
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Renovation Report Details */}
              {viewData.type === 'renovation' && viewData.data.renovations && (
                <div className="rounded-lg bg-white p-4 shadow-sm">
                  <h3 className="mb-3 text-lg font-semibold text-gray-800">Renovation Projects</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left">{t('property_address')}</th>
                          <th className="text-left">{t('unit_number')}</th>
                          <th className="text-left">{t('title')}</th>
                          <th className="text-right">{t('total_cost')}</th>
                          <th className="text-left">{t('start_date')}</th>
                          <th className="text-left">{t('end_date')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {viewData.data.renovations.map((renovation: any) => (
                          <tr key={renovation.id} className="border-b">
                            <td className="py-2">{renovation.propertyAddress}</td>
                            <td className="py-2">{renovation.unitNumber || '-'}</td>
                            <td className="py-2">{renovation.title}</td>
                            <td className="py-2 text-right font-semibold text-red-600">
                              ${renovation.totalCost?.toFixed(2) || '0.00'}
                            </td>
                            <td className="py-2">
                              {renovation.startDate
                                ? new Date(renovation.startDate).toLocaleDateString()
                                : '-'}
                            </td>
                            <td className="py-2">
                              {renovation.endDate
                                ? new Date(renovation.endDate).toLocaleDateString()
                                : '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Parking Report Details */}
              {viewData.type === 'parking' && viewData.data.permits && (
                <div className="rounded-lg bg-white p-4 shadow-sm">
                  <h3 className="mb-3 text-lg font-semibold text-gray-800">Parking Permits</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left">{t('property_address')}</th>
                          <th className="text-left">{t('tenant_name')}</th>
                          <th className="text-left">{t('unit_number')}</th>
                          <th className="text-left">{t('building')}</th>
                          <th className="text-left">{t('permit_status')}</th>
                          <th className="text-left">{t('license_plate')}</th>
                          <th className="text-left">{t('issued_at')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {viewData.data.permits.map((permit: any) => (
                          <tr key={permit.id} className="border-b">
                            <td className="py-2">{permit.propertyAddress}</td>
                            <td className="py-2">{permit.tenantName || '-'}</td>
                            <td className="py-2">{permit.unitNumber || '-'}</td>
                            <td className="py-2">{permit.building || '-'}</td>
                            <td className="py-2">
                              <span
                                className={`rounded-full px-2 py-1 text-xs font-semibold ${
                                  permit.status === 'Active'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-gray-100 text-gray-800'
                                }`}
                              >
                                {permit.status || 'Unknown'}
                              </span>
                            </td>
                            <td className="py-2">{permit.licensePlate || '-'}</td>
                            <td className="py-2">
                              {permit.issuedAt
                                ? new Date(permit.issuedAt).toLocaleDateString()
                                : '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
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
