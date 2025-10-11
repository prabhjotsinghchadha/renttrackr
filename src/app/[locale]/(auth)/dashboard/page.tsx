import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import Link from 'next/link';
import { getDashboardActivity } from '@/actions/DashboardActions';
import { getPaymentMetrics } from '@/actions/PaymentActions';
import { getPropertyCount } from '@/actions/PropertyActions';
import { getTenantCount } from '@/actions/TenantActions';
import { getCurrentUser } from '@/helpers/AuthHelper';

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({
    locale,
    namespace: 'Dashboard',
  });

  return {
    title: t('meta_title'),
    description: t('meta_description'),
  };
}

export default async function Dashboard(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  const t = await getTranslations({
    locale,
    namespace: 'Dashboard',
  });

  // Get the current user from the database
  const user = await getCurrentUser();

  // Fetch dashboard data from database
  const propertyCount = await getPropertyCount();
  const tenantCount = await getTenantCount();
  const paymentMetrics = await getPaymentMetrics();
  const dashboardActivity = await getDashboardActivity();

  return (
    <div className="py-8 md:py-12">
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-gray-800 md:text-5xl">{t('page_title')}</h1>
        <p className="mt-4 text-xl leading-relaxed text-gray-600">
          {user?.name ? `${t('welcome_back')}, ${user.name}!` : t('welcome_message')}
        </p>
      </div>

      {/* Key Metrics */}
      <div className="mb-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="group rounded-xl bg-gray-50 p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
          <div className="flex items-center justify-between">
            <div className="text-lg font-semibold text-gray-600">{t('total_properties')}</div>
            <div className="text-5xl">🏠</div>
          </div>
          <div className="mt-4 text-4xl font-bold text-gray-800">{propertyCount}</div>
          <Link
            href="/dashboard/properties"
            className="mt-4 inline-block text-lg text-blue-600 transition-colors hover:text-blue-700"
          >
            {t('view_all')} →
          </Link>
        </div>

        <div className="group rounded-xl bg-gray-50 p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
          <div className="flex items-center justify-between">
            <div className="text-lg font-semibold text-gray-600">{t('active_tenants')}</div>
            <div className="text-5xl">👥</div>
          </div>
          <div className="mt-4 text-4xl font-bold text-gray-800">{tenantCount}</div>
          <Link
            href="/dashboard/tenants"
            className="mt-4 inline-block text-lg text-blue-600 transition-colors hover:text-blue-700"
          >
            {t('view_all')} →
          </Link>
        </div>

        <div className="group rounded-xl bg-gray-50 p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
          <div className="flex items-center justify-between">
            <div className="text-lg font-semibold text-gray-600">{t('monthly_revenue')}</div>
            <div className="text-5xl">💰</div>
          </div>
          <div className="mt-4 text-4xl font-bold text-green-600">
            ${paymentMetrics.totalCollected.toFixed(2)}
          </div>
          <Link
            href="/dashboard/rents"
            className="mt-4 inline-block text-lg text-blue-600 transition-colors hover:text-blue-700"
          >
            {t('view_details')} →
          </Link>
        </div>

        <div className="group rounded-xl bg-gray-50 p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
          <div className="flex items-center justify-between">
            <div className="text-lg font-semibold text-gray-600">{t('overdue_payments')}</div>
            <div className="text-5xl">⚠️</div>
          </div>
          <div className="mt-4 text-4xl font-bold text-red-600">{paymentMetrics.overdue}</div>
          <Link
            href="/dashboard/rents"
            className="mt-4 inline-block text-lg text-blue-600 transition-colors hover:text-blue-700"
          >
            {t('view_details')} →
          </Link>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-10 rounded-xl bg-gray-50 p-8">
        <h2 className="mb-6 text-2xl font-semibold text-gray-800">{t('quick_actions')}</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Link
            href="/dashboard/properties"
            className="group flex items-center rounded-xl border-2 border-gray-200 bg-white p-5 transition-all duration-300 hover:-translate-y-1 hover:border-blue-600 hover:shadow-lg"
          >
            <span className="mr-4 text-3xl">🏠</span>
            <span className="text-lg font-semibold text-gray-800 group-hover:text-blue-600">
              {t('add_property')}
            </span>
          </Link>
          <Link
            href="/dashboard/tenants"
            className="group flex items-center rounded-xl border-2 border-gray-200 bg-white p-5 transition-all duration-300 hover:-translate-y-1 hover:border-blue-600 hover:shadow-lg"
          >
            <span className="mr-4 text-3xl">👥</span>
            <span className="text-lg font-semibold text-gray-800 group-hover:text-blue-600">
              {t('add_tenant')}
            </span>
          </Link>
          <Link
            href="/dashboard/rents"
            className="group flex items-center rounded-xl border-2 border-gray-200 bg-white p-5 transition-all duration-300 hover:-translate-y-1 hover:border-blue-600 hover:shadow-lg"
          >
            <span className="mr-4 text-3xl">💰</span>
            <span className="text-lg font-semibold text-gray-800 group-hover:text-blue-600">
              {t('record_payment')}
            </span>
          </Link>
          <Link
            href="/dashboard/expenses"
            className="group flex items-center rounded-xl border-2 border-gray-200 bg-white p-5 transition-all duration-300 hover:-translate-y-1 hover:border-blue-600 hover:shadow-lg"
          >
            <span className="mr-4 text-3xl">📄</span>
            <span className="text-lg font-semibold text-gray-800 group-hover:text-blue-600">
              {t('add_expense')}
            </span>
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl bg-gray-50 p-8">
          <h2 className="mb-6 text-2xl font-semibold text-gray-800">{t('recent_payments')}</h2>
          {dashboardActivity.recentPayments.length > 0 ? (
            <div className="space-y-4">
              {dashboardActivity.recentPayments.map((payment: any) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between rounded-lg bg-white p-4 shadow-sm"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">💰</div>
                      <div>
                        <p className="font-semibold text-gray-800">${payment.amount.toFixed(2)}</p>
                        <p className="text-sm text-gray-600">
                          {payment.tenantName} - {payment.propertyAddress}
                          {payment.unitNumber && ` - Unit ${payment.unitNumber}`}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-800">
                      {new Date(payment.date).toLocaleDateString(locale, {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                    {payment.lateFee && payment.lateFee > 0 && (
                      <p className="text-xs text-red-600">
                        +${payment.lateFee.toFixed(2)} late fee
                      </p>
                    )}
                  </div>
                </div>
              ))}
              <div className="pt-4 text-center">
                <Link
                  href="/dashboard/rents"
                  className="text-blue-600 transition-colors hover:text-blue-700"
                >
                  {t('view_all_payments')} →
                </Link>
              </div>
            </div>
          ) : (
            <div className="py-12 text-center">
              <div className="mb-4 text-6xl">📊</div>
              <p className="text-lg text-gray-600">{t('no_recent_payments')}</p>
            </div>
          )}
        </div>

        <div className="rounded-xl bg-gray-50 p-8">
          <h2 className="mb-6 text-2xl font-semibold text-gray-800">{t('upcoming_tasks')}</h2>
          {dashboardActivity.upcomingTasks.length > 0 ? (
            <div className="space-y-4">
              {dashboardActivity.upcomingTasks.map((task: any) => {
                const isOverdue = task.dueDate && new Date(task.dueDate) < new Date();
                const isDueSoon =
                  task.dueDate &&
                  new Date(task.dueDate) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

                return (
                  <div
                    key={task.id}
                    className={`flex items-center justify-between rounded-lg bg-white p-4 shadow-sm ${
                      isOverdue
                        ? 'border-l-4 border-red-500'
                        : isDueSoon
                          ? 'border-l-4 border-yellow-500'
                          : 'border-l-4 border-blue-500'
                    }`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">{task.type === 'renovation' ? '🔨' : '📋'}</div>
                        <div>
                          <p className="font-semibold text-gray-800">{task.title}</p>
                          <p className="text-sm text-gray-600">{task.description}</p>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      {task.dueDate && (
                        <p
                          className={`text-sm font-medium ${
                            isOverdue
                              ? 'text-red-600'
                              : isDueSoon
                                ? 'text-yellow-600'
                                : 'text-gray-600'
                          }`}
                        >
                          {new Date(task.dueDate).toLocaleDateString(locale, {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </p>
                      )}
                      <span
                        className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${
                          task.priority === 'high'
                            ? 'bg-red-100 text-red-800'
                            : task.priority === 'medium'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {task.priority}
                      </span>
                    </div>
                  </div>
                );
              })}
              <div className="pt-4 text-center">
                <Link
                  href="/dashboard/renovations"
                  className="text-blue-600 transition-colors hover:text-blue-700"
                >
                  {t('view_all_tasks')} →
                </Link>
              </div>
            </div>
          ) : (
            <div className="py-12 text-center">
              <div className="mb-4 text-6xl">📋</div>
              <p className="text-lg text-gray-600">{t('no_upcoming_tasks')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
