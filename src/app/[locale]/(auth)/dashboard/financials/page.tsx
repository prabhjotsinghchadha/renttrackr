import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';

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

  // TODO: Calculate financial metrics from database

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
          <div className="text-4xl font-bold text-green-600">$0</div>
          <div className="mt-2 text-lg text-gray-600">{t('this_year')}</div>
        </div>
        <div className="group rounded-xl bg-gray-50 p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
          <div className="mb-4 text-4xl">📊</div>
          <div className="mb-2 text-lg font-semibold text-gray-600">{t('total_expenses')}</div>
          <div className="text-4xl font-bold text-red-600">$0</div>
          <div className="mt-2 text-lg text-gray-600">{t('this_year')}</div>
        </div>
        <div className="group rounded-xl bg-gray-50 p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
          <div className="mb-4 text-4xl">💰</div>
          <div className="mb-2 text-lg font-semibold text-gray-600">{t('net_income')}</div>
          <div className="text-4xl font-bold text-gray-800">$0</div>
          <div className="mt-2 text-lg text-gray-600">{t('this_year')}</div>
        </div>
        <div className="group rounded-xl bg-gray-50 p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
          <div className="mb-4 text-4xl">📈</div>
          <div className="mb-2 text-lg font-semibold text-gray-600">{t('roi')}</div>
          <div className="text-4xl font-bold text-blue-600">0%</div>
          <div className="mt-2 text-lg text-gray-600">{t('average')}</div>
        </div>
      </div>

      {/* ROI Calculator */}
      <div className="mb-10 rounded-xl bg-gray-50 p-8">
        <h2 className="mb-6 text-2xl font-semibold text-gray-800">{t('roi_calculator')}</h2>
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
              className="w-full rounded-xl border-2 border-gray-200 bg-white px-6 py-4 text-lg transition-all focus:border-blue-600 focus:ring-4 focus:ring-blue-300 focus:outline-none"
              placeholder="0"
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
              className="w-full rounded-xl border-2 border-gray-200 bg-white px-6 py-4 text-lg transition-all focus:border-blue-600 focus:ring-4 focus:ring-blue-300 focus:outline-none"
              placeholder="0"
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
              className="w-full rounded-xl border-2 border-gray-200 bg-white px-6 py-4 text-lg transition-all focus:border-blue-600 focus:ring-4 focus:ring-blue-300 focus:outline-none"
              placeholder="0"
            />
          </div>
          <div className="flex items-end">
            <button
              type="button"
              className="w-full rounded-xl bg-blue-600 px-8 py-4 text-xl font-semibold text-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:bg-blue-700 hover:shadow-xl focus:ring-4 focus:ring-blue-300 focus:outline-none"
            >
              {t('calculate')}
            </button>
          </div>
        </div>
      </div>

      {/* Reports */}
      <div className="rounded-xl bg-gray-50 p-8">
        <h2 className="mb-6 text-2xl font-semibold text-gray-800">{t('reports')}</h2>
        <div className="space-y-4">
          <button
            type="button"
            className="group flex w-full items-center justify-between rounded-xl border-2 border-gray-200 bg-white p-6 text-left transition-all duration-300 hover:-translate-y-1 hover:border-blue-600 hover:shadow-lg"
          >
            <div>
              <div className="mb-2 flex items-center gap-3">
                <span className="text-3xl">📋</span>
                <div className="text-xl font-semibold text-gray-800 group-hover:text-blue-600">
                  {t('income_statement')}
                </div>
              </div>
              <div className="text-lg text-gray-600">{t('income_statement_description')}</div>
            </div>
            <span className="text-3xl text-gray-400 transition-colors group-hover:text-blue-600">
              →
            </span>
          </button>
          <button
            type="button"
            className="group flex w-full items-center justify-between rounded-xl border-2 border-gray-200 bg-white p-6 text-left transition-all duration-300 hover:-translate-y-1 hover:border-blue-600 hover:shadow-lg"
          >
            <div>
              <div className="mb-2 flex items-center gap-3">
                <span className="text-3xl">💸</span>
                <div className="text-xl font-semibold text-gray-800 group-hover:text-blue-600">
                  {t('cash_flow')}
                </div>
              </div>
              <div className="text-lg text-gray-600">{t('cash_flow_description')}</div>
            </div>
            <span className="text-3xl text-gray-400 transition-colors group-hover:text-blue-600">
              →
            </span>
          </button>
          <button
            type="button"
            className="group flex w-full items-center justify-between rounded-xl border-2 border-gray-200 bg-white p-6 text-left transition-all duration-300 hover:-translate-y-1 hover:border-blue-600 hover:shadow-lg"
          >
            <div>
              <div className="mb-2 flex items-center gap-3">
                <span className="text-3xl">🧾</span>
                <div className="text-xl font-semibold text-gray-800 group-hover:text-blue-600">
                  {t('tax_summary')}
                </div>
              </div>
              <div className="text-lg text-gray-600">{t('tax_summary_description')}</div>
            </div>
            <span className="text-3xl text-gray-400 transition-colors group-hover:text-blue-600">
              →
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
