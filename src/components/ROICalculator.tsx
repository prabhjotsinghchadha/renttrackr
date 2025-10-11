'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';

type ROICalculatorProps = {
  locale: string;
};

export function ROICalculator({ locale: _locale }: ROICalculatorProps) {
  const t = useTranslations('Financials');
  const [propertyValue, setPropertyValue] = useState('');
  const [annualIncome, setAnnualIncome] = useState('');
  const [annualExpenses, setAnnualExpenses] = useState('');
  const [calculatedROI, setCalculatedROI] = useState<number | null>(null);

  const calculateROI = () => {
    const value = Number.parseFloat(propertyValue);
    const income = Number.parseFloat(annualIncome);
    const expenses = Number.parseFloat(annualExpenses);

    if (value > 0 && income >= 0 && expenses >= 0) {
      const netIncome = income - expenses;
      const roi = (netIncome / value) * 100;
      setCalculatedROI(roi);
    } else {
      setCalculatedROI(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    calculateROI();
  };

  const resetCalculator = () => {
    setPropertyValue('');
    setAnnualIncome('');
    setAnnualExpenses('');
    setCalculatedROI(null);
  };

  return (
    <div className="mb-10 rounded-xl bg-gray-50 p-8">
      <h2 className="mb-6 text-2xl font-semibold text-gray-800">{t('roi_calculator')}</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label
              htmlFor="property-value"
              className="mb-2 block text-lg font-semibold text-gray-700"
            >
              {t('property_value')}
            </label>
            <input
              type="number"
              id="property-value"
              value={propertyValue}
              onChange={(e) => setPropertyValue(e.target.value)}
              className="w-full rounded-xl border-2 border-gray-200 bg-white px-6 py-4 text-lg transition-all focus:border-blue-600 focus:ring-4 focus:ring-blue-300 focus:outline-none"
              placeholder="0"
              min="0"
              step="1000"
            />
          </div>
          <div>
            <label
              htmlFor="annual-income"
              className="mb-2 block text-lg font-semibold text-gray-700"
            >
              {t('annual_income')}
            </label>
            <input
              type="number"
              id="annual-income"
              value={annualIncome}
              onChange={(e) => setAnnualIncome(e.target.value)}
              className="w-full rounded-xl border-2 border-gray-200 bg-white px-6 py-4 text-lg transition-all focus:border-blue-600 focus:ring-4 focus:ring-blue-300 focus:outline-none"
              placeholder="0"
              min="0"
              step="100"
            />
          </div>
          <div>
            <label
              htmlFor="annual-expenses"
              className="mb-2 block text-lg font-semibold text-gray-700"
            >
              {t('annual_expenses')}
            </label>
            <input
              type="number"
              id="annual-expenses"
              value={annualExpenses}
              onChange={(e) => setAnnualExpenses(e.target.value)}
              className="w-full rounded-xl border-2 border-gray-200 bg-white px-6 py-4 text-lg transition-all focus:border-blue-600 focus:ring-4 focus:ring-blue-300 focus:outline-none"
              placeholder="0"
              min="0"
              step="100"
            />
          </div>
          <div className="flex items-end gap-4">
            <button
              type="submit"
              className="flex-1 rounded-xl bg-blue-600 px-8 py-4 text-xl font-semibold text-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:bg-blue-700 hover:shadow-xl focus:ring-4 focus:ring-blue-300 focus:outline-none"
            >
              {t('calculate')}
            </button>
            <button
              type="button"
              onClick={resetCalculator}
              className="rounded-xl border-2 border-gray-300 bg-white px-6 py-4 text-lg font-semibold text-gray-700 transition-all duration-300 hover:border-gray-400 hover:bg-gray-50 focus:ring-4 focus:ring-gray-300 focus:outline-none"
            >
              {t('reset')}
            </button>
          </div>
        </div>
      </form>

      {calculatedROI !== null && (
        <div className="mt-8 rounded-xl bg-blue-50 p-6">
          <h3 className="mb-4 text-xl font-semibold text-gray-800">{t('roi_result')}</h3>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{calculatedROI.toFixed(2)}%</div>
              <div className="text-sm text-gray-600">{t('roi_percentage')}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                ${(Number.parseFloat(annualIncome) - Number.parseFloat(annualExpenses)).toFixed(2)}
              </div>
              <div className="text-sm text-gray-600">{t('net_annual_income')}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-800">
                ${Number.parseFloat(propertyValue).toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">{t('property_value')}</div>
            </div>
          </div>
          <div className="mt-4 text-center">
            <div className="text-sm text-gray-600">
              {calculatedROI > 0 ? (
                <span className="text-green-600">{t('positive_roi_message')}</span>
              ) : (
                <span className="text-red-600">{t('negative_roi_message')}</span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
