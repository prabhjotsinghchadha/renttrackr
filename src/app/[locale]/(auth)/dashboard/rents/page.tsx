import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import Link from 'next/link';
import {
  deletePayment,
  getPaymentMetrics,
  getPaymentsWithDetails,
  getPendingAndOverdueDetails,
  updatePayment,
} from '@/actions/PaymentActions';
import { CurrencyDisplay } from '@/components/CurrencyDisplay';
import { DeletePaymentDialog } from '@/components/DeletePaymentDialog';
import { EditPaymentForm } from '@/components/Form/EditPaymentForm';

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
  const pendingOverdueResult = await getPendingAndOverdueDetails();
  const pendingPayments = pendingOverdueResult.success ? pendingOverdueResult.pending : [];
  const overduePayments = pendingOverdueResult.success ? pendingOverdueResult.overdue : [];

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
            <CurrencyDisplay amount={metrics.totalCollected} />
          </div>
        </div>
        <div className="group rounded-xl bg-gray-50 p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
          <div className="mb-4 text-4xl">⏳</div>
          <div className="mb-2 text-lg font-semibold text-gray-600">{t('pending_this_month')}</div>
          <div className="text-4xl font-bold text-yellow-600">
            <CurrencyDisplay amount={metrics.pending} />
          </div>
        </div>
        <div className="group rounded-xl bg-gray-50 p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
          <div className="mb-4 text-4xl">⚠️</div>
          <div className="mb-2 text-lg font-semibold text-gray-600">{t('overdue')}</div>
          <div className="text-4xl font-bold text-red-600">
            <CurrencyDisplay amount={metrics.overdue} />
          </div>
        </div>
        <div className="group rounded-xl bg-gray-50 p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
          <div className="mb-4 text-4xl">📋</div>
          <div className="mb-2 text-lg font-semibold text-gray-600">{t('late_fees')}</div>
          <div className="text-4xl font-bold text-gray-800">
            <CurrencyDisplay amount={metrics.lateFees} />
          </div>
        </div>
      </div>

      {/* Pending and Overdue Payments */}
      <div className="mb-10 grid gap-6 lg:grid-cols-2">
        {/* Pending Payments */}
        <div className="rounded-xl bg-gray-50 p-8">
          <h2 className="mb-6 text-2xl font-semibold text-gray-800">
            {t('pending_payments')} ({pendingPayments.length})
          </h2>
          {pendingPayments.length > 0 ? (
            <div className="space-y-4">
              {pendingPayments.slice(0, 5).map((payment: any) => (
                <div
                  key={`pending-${payment.tenantName}-${payment.dueDate.getTime()}`}
                  className="flex items-center justify-between rounded-lg border-l-4 border-yellow-500 bg-white p-4 shadow-sm"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">⏳</div>
                      <div>
                        <p className="font-semibold text-gray-800">{payment.tenantName}</p>
                        <p className="text-sm text-gray-600">
                          {payment.propertyAddress} - Unit {payment.unitNumber}
                        </p>
                        <p className="text-xs text-gray-500">
                          Due: {new Date(payment.dueDate).toLocaleDateString(locale)}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-yellow-600">
                      <CurrencyDisplay amount={payment.amount} />
                    </p>
                    <p className="text-xs text-gray-500">
                      {payment.daysUntilDue === 0
                        ? t('due_today')
                        : payment.daysUntilDue === 1
                          ? t('due_tomorrow')
                          : `${payment.daysUntilDue} ${t('days')}`}
                    </p>
                    <Link
                      href={`/${locale}/dashboard/rents/new?tenant=${encodeURIComponent(payment.tenantName)}&amount=${payment.amount}`}
                      className="mt-2 inline-block rounded-lg bg-yellow-600 px-3 py-1 text-xs font-semibold text-white transition-colors hover:bg-yellow-700"
                    >
                      {t('record_payment')}
                    </Link>
                  </div>
                </div>
              ))}
              {pendingPayments.length > 5 && (
                <div className="pt-4 text-center">
                  <p className="text-sm text-gray-600">
                    +{pendingPayments.length - 5} more pending payments
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="py-8 text-center">
              <div className="mb-4 text-6xl">✅</div>
              <p className="text-lg text-gray-600">{t('no_pending_payments')}</p>
            </div>
          )}
        </div>

        {/* Overdue Payments */}
        <div className="rounded-xl bg-gray-50 p-8">
          <h2 className="mb-6 text-2xl font-semibold text-gray-800">
            {t('overdue_payments')} ({overduePayments.length})
          </h2>
          {overduePayments.length > 0 ? (
            <div className="space-y-4">
              {overduePayments.slice(0, 5).map((payment: any) => (
                <div
                  key={`overdue-${payment.tenantName}-${payment.dueDate.getTime()}`}
                  className="flex items-center justify-between rounded-lg border-l-4 border-red-500 bg-white p-4 shadow-sm"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">⚠️</div>
                      <div>
                        <p className="font-semibold text-gray-800">{payment.tenantName}</p>
                        <p className="text-sm text-gray-600">
                          {payment.propertyAddress} - Unit {payment.unitNumber}
                        </p>
                        <p className="text-xs text-gray-500">
                          Due: {new Date(payment.dueDate).toLocaleDateString(locale)}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-red-600">
                      <CurrencyDisplay amount={payment.amount} />
                    </p>
                    <p className="text-xs text-red-500">
                      {payment.daysOverdue === 1
                        ? `1 ${t('day_overdue')}`
                        : `${payment.daysOverdue} ${t('days_overdue')}`}
                    </p>
                    <Link
                      href={`/${locale}/dashboard/rents/new?tenant=${encodeURIComponent(payment.tenantName)}&amount=${payment.amount}`}
                      className="mt-2 inline-block rounded-lg bg-red-600 px-3 py-1 text-xs font-semibold text-white transition-colors hover:bg-red-700"
                    >
                      {t('record_payment')}
                    </Link>
                  </div>
                </div>
              ))}
              {overduePayments.length > 5 && (
                <div className="pt-4 text-center">
                  <p className="text-sm text-gray-600">
                    +{overduePayments.length - 5} more overdue payments
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="py-8 text-center">
              <div className="mb-4 text-6xl">🎉</div>
              <p className="text-lg text-gray-600">{t('no_overdue_payments')}</p>
            </div>
          )}
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
                    <th className="px-4 py-4 text-left text-lg font-semibold text-gray-700">
                      {t('actions')}
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
                        <CurrencyDisplay amount={payment.amount} />
                      </td>
                      <td className="px-4 py-4 text-lg text-gray-600">
                        {payment.lateFee ? <CurrencyDisplay amount={payment.lateFee} /> : '-'}
                      </td>
                      <td className="px-4 py-4 text-lg text-gray-600">
                        {new Date(payment.date).toLocaleDateString(locale, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex gap-2">
                          <EditPaymentForm
                            payment={payment}
                            locale={locale}
                            onUpdate={async (updatedPayment: {
                              amount: number;
                              date: Date;
                              lateFee?: number;
                            }) => {
                              'use server';
                              const result = await updatePayment(payment.id, updatedPayment);
                              if (result.success) {
                                // Refresh the page to show updated data
                                window.location.reload();
                              }
                              return result;
                            }}
                          />
                          <DeletePaymentDialog
                            payment={payment}
                            locale={locale}
                            onDelete={async () => {
                              'use server';
                              const result = await deletePayment(payment.id);
                              if (result.success) {
                                // Refresh the page to show updated data
                                window.location.reload();
                              }
                              return result;
                            }}
                          />
                        </div>
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
