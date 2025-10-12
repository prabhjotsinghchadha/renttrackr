import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { getFinancialMetrics } from '@/actions/FinancialActions';
import { FinancialReports } from '@/components/FinancialReports';
import { ROICalculator } from '@/components/ROICalculator';

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic';

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({
    locale,
    namespace: 'Financials',
  });

  return {
    title: t('meta_title'),
    description: t('meta_description'),
  };
}

export default async function FinancialsPage(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  const t = await getTranslations({
    locale,
    namespace: 'Financials',
  });

  // Fetch financial metrics from database
  const metrics = await getFinancialMetrics();

  return (
    <div className="py-8 md:py-12">
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-gray-800 md:text-5xl">{t('page_title')}</h1>
        <p className="mt-4 text-xl leading-relaxed text-gray-600">{t('page_description')}</p>
      </div>

      {/* Key Metrics */}
      <div className="mb-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="group rounded-xl bg-gray-50 p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
          <div className="mb-4 text-4xl">💵</div>
          <div className="mb-2 text-lg font-semibold text-gray-600">{t('total_revenue')}</div>
          <div className="text-4xl font-bold text-green-600">
            ${metrics.annualRevenue.toFixed(2)}
          </div>
          <div className="mt-2 text-lg text-gray-600">{t('this_year')}</div>
        </div>
        <div className="group rounded-xl bg-gray-50 p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
          <div className="mb-4 text-4xl">📊</div>
          <div className="mb-2 text-lg font-semibold text-gray-600">{t('total_expenses')}</div>
          <div className="text-4xl font-bold text-red-600">
            ${metrics.annualExpenses.toFixed(2)}
          </div>
          <div className="mt-2 text-lg text-gray-600">{t('this_year')}</div>
        </div>
        <div className="group rounded-xl bg-gray-50 p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
          <div className="mb-4 text-4xl">💰</div>
          <div className="mb-2 text-lg font-semibold text-gray-600">{t('net_income')}</div>
          <div className="text-4xl font-bold text-gray-800">${metrics.netIncome.toFixed(2)}</div>
          <div className="mt-2 text-lg text-gray-600">{t('this_year')}</div>
        </div>
        <div className="group rounded-xl bg-gray-50 p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
          <div className="mb-4 text-4xl">📈</div>
          <div className="mb-2 text-lg font-semibold text-gray-600">{t('roi')}</div>
          <div className="text-4xl font-bold text-blue-600">{metrics.roi.toFixed(1)}%</div>
          <div className="mt-2 text-lg text-gray-600">{t('average')}</div>
        </div>
      </div>

      {/* ROI Calculator */}
      <ROICalculator locale={locale} />

      {/* Reports */}
      <div className="rounded-xl bg-gray-50 p-8">
        <h2 className="mb-6 text-2xl font-semibold text-gray-800">{t('reports')}</h2>
        <FinancialReports locale={locale} />
      </div>
    </div>
  );
}
