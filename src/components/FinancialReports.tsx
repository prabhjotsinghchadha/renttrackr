'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import {
  exportCashFlowToExcel,
  exportIncomeStatementToExcel,
  exportTaxSummaryToExcel,
} from '@/actions/FinancialActions';

type FinancialReportsProps = {
  locale: string;
};

export function FinancialReports({ locale: _locale }: FinancialReportsProps) {
  const t = useTranslations('Financials');
  const [isExporting, setIsExporting] = useState<string | null>(null);

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
        // Create blob and download
        const blob = new Blob([result.buffer], {
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
            onClick={() => handleExport('income')}
            disabled={isExporting === 'income'}
            className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white transition-all duration-300 hover:bg-green-700 focus:ring-4 focus:ring-green-300 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isExporting === 'income' ? t('exporting') : t('export_excel')}
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
            onClick={() => handleExport('cashflow')}
            disabled={isExporting === 'cashflow'}
            className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white transition-all duration-300 hover:bg-green-700 focus:ring-4 focus:ring-green-300 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isExporting === 'cashflow' ? t('exporting') : t('export_excel')}
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
            onClick={() => handleExport('tax')}
            disabled={isExporting === 'tax'}
            className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white transition-all duration-300 hover:bg-green-700 focus:ring-4 focus:ring-green-300 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isExporting === 'tax' ? t('exporting') : t('export_excel')}
          </button>
          <span className="text-3xl text-gray-400 transition-colors group-hover:text-blue-600">
            →
          </span>
        </div>
      </div>
    </div>
  );
}
