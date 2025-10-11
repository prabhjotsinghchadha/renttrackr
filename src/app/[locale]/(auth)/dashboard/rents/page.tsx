import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import Link from 'next/link';
import { getPaymentMetrics, getPaymentsWithDetails } from '@/actions/PaymentActions';

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({
    locale,
    namespace: 'Rents',
  });

  return {
    title: t('meta_title'),
    description: t('meta_description'),
  };
}

export default async function RentsPage(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  const t = await getTranslations({
    locale,
    namespace: 'Rents',
  });

  // Fetch rent payments and metrics from database
  const paymentsResult = await getPaymentsWithDetails();
  const payments = paymentsResult.success ? paymentsResult.payments : [];

  const metrics = await getPaymentMetrics();

  return (
    <div className="py-8 md:py-12">
      <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h1 className="text-4xl font-bold text-gray-800 md:text-5xl">{t('page_title')}</h1>
        <Link
          href={`/${locale}/dashboard/rents/new`}
          className="inline-block rounded-xl bg-blue-600 px-8 py-4 text-xl font-semibold text-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:bg-blue-700 hover:shadow-xl focus:ring-4 focus:ring-blue-300 focus:outline-none"
        >
          {t('record_payment')}
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="mb-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="group rounded-xl bg-gray-50 p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
          <div className="mb-4 text-4xl">💰</div>
          <div className="mb-2 text-lg font-semibold text-gray-600">{t('total_collected')}</div>
          <div className="text-4xl font-bold text-green-600">
            ${metrics.totalCollected.toFixed(2)}
          </div>
        </div>
        <div className="group rounded-xl bg-gray-50 p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
          <div className="mb-4 text-4xl">⏳</div>
          <div className="mb-2 text-lg font-semibold text-gray-600">{t('pending_this_month')}</div>
          <div className="text-4xl font-bold text-yellow-600">${metrics.pending.toFixed(2)}</div>
        </div>
        <div className="group rounded-xl bg-gray-50 p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
          <div className="mb-4 text-4xl">⚠️</div>
          <div className="mb-2 text-lg font-semibold text-gray-600">{t('overdue')}</div>
          <div className="text-4xl font-bold text-red-600">${metrics.overdue.toFixed(2)}</div>
        </div>
        <div className="group rounded-xl bg-gray-50 p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
          <div className="mb-4 text-4xl">📋</div>
          <div className="mb-2 text-lg font-semibold text-gray-600">{t('late_fees')}</div>
          <div className="text-4xl font-bold text-gray-800">${metrics.lateFees.toFixed(2)}</div>
        </div>
      </div>

      {/* Payment List */}
      <div className="overflow-hidden rounded-xl bg-gray-50">
        <div className="p-8">
          {payments.length === 0 ? (
            <div className="py-12 text-center">
              <div className="mb-6 text-8xl">💵</div>
              <h3 className="mb-4 text-2xl font-semibold text-gray-800">{t('no_payments')}</h3>
              <p className="text-xl leading-relaxed text-gray-600">
                {t('no_payments_description')}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="px-4 py-4 text-left text-lg font-semibold text-gray-700">
                      {t('tenant_name')}
                    </th>
                    <th className="px-4 py-4 text-left text-lg font-semibold text-gray-700">
                      {t('unit')}
                    </th>
                    <th className="px-4 py-4 text-left text-lg font-semibold text-gray-700">
                      {t('amount')}
                    </th>
                    <th className="px-4 py-4 text-left text-lg font-semibold text-gray-700">
                      {t('late_fee')}
                    </th>
                    <th className="px-4 py-4 text-left text-lg font-semibold text-gray-700">
                      {t('date')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment: any) => (
                    <tr
                      key={payment.id}
                      className="border-b border-gray-200 transition-colors hover:bg-gray-100"
                    >
                      <td className="px-4 py-4 text-lg text-gray-800">{payment.tenantName}</td>
                      <td className="px-4 py-4 text-lg text-gray-600">
                        {t('unit_number')} {payment.unitNumber}
                      </td>
                      <td className="px-4 py-4 text-lg font-semibold text-green-600">
                        ${payment.amount.toFixed(2)}
                      </td>
                      <td className="px-4 py-4 text-lg text-gray-600">
                        {payment.lateFee ? `$${payment.lateFee.toFixed(2)}` : '-'}
                      </td>
                      <td className="px-4 py-4 text-lg text-gray-600">
                        {new Date(payment.date).toLocaleDateString(locale, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
