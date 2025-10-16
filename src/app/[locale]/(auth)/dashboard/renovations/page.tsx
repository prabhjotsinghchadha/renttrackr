import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import Link from 'next/link';
import {
  deleteRenovation,
  getRenovationMetrics,
  getRenovationsWithDetails,
  updateRenovation,
} from '@/actions/RenovationActions';
// import { CurrencyDisplay } from '@/components/CurrencyDisplay';
import { DeleteRenovationDialog } from '@/components/DeleteRenovationDialog';
import { EditRenovationForm } from '@/components/Form/EditRenovationForm';
import { ViewRenovationDetails } from '@/components/ViewRenovationDetails';

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic';

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({
    locale,
    namespace: 'Renovations',
  });

  return {
    title: t('meta_title'),
    description: t('meta_description'),
  };
}

export default async function RenovationsPage(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  const t = await getTranslations({
    locale,
    namespace: 'Renovations',
  });

  // Fetch renovations and metrics from database
  const renovationsResult = await getRenovationsWithDetails();
  const renovations = renovationsResult.success ? renovationsResult.renovations : [];

  const metrics = await getRenovationMetrics();

  return (
    <div className="py-8 md:py-12">
      <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h1 className="text-4xl font-bold text-gray-800 md:text-5xl">{t('page_title')}</h1>
        <Link
          href={`/${locale}/dashboard/renovations/new`}
          className="inline-block rounded-xl bg-blue-600 px-8 py-4 text-center text-xl font-semibold text-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:bg-blue-700 hover:shadow-xl focus:ring-4 focus:ring-blue-300 focus:outline-none"
        >
          {t('add_task')}
        </Link>
      </div>

      {/* Status Overview */}
      <div className="mb-10 grid gap-6 sm:grid-cols-3">
        <div className="group rounded-xl bg-gray-50 p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
          <div className="mb-4 text-4xl">⏳</div>
          <div className="mb-2 text-lg font-semibold text-gray-600">{t('pending_tasks')}</div>
          <div className="text-4xl font-bold text-yellow-600">{metrics.pending}</div>
        </div>
        <div className="group rounded-xl bg-gray-50 p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
          <div className="mb-4 text-4xl">🔨</div>
          <div className="mb-2 text-lg font-semibold text-gray-600">{t('in_progress')}</div>
          <div className="text-4xl font-bold text-blue-600">{metrics.inProgress}</div>
        </div>
        <div className="group rounded-xl bg-gray-50 p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
          <div className="mb-4 text-4xl">✅</div>
          <div className="mb-2 text-lg font-semibold text-gray-600">{t('completed')}</div>
          <div className="text-4xl font-bold text-green-600">{metrics.completed}</div>
        </div>
      </div>

      {/* Renovation List */}
      <div className="overflow-hidden rounded-xl bg-gray-50">
        <div className="p-8">
          {renovations.length === 0 ? (
            <div className="py-12 text-center">
              <div className="mb-6 text-8xl">🛠️</div>
              <h3 className="mb-4 text-2xl font-semibold text-gray-800">{t('no_tasks')}</h3>
              <p className="mb-8 text-xl leading-relaxed text-gray-600">
                {t('no_tasks_description')}
              </p>
              <Link
                href={`/${locale}/dashboard/renovations/new`}
                className="inline-block rounded-xl bg-blue-600 px-8 py-4 text-xl font-semibold text-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:bg-blue-700 hover:shadow-xl focus:ring-4 focus:ring-blue-300 focus:outline-none"
              >
                {t('add_first_task')}
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {renovations.map((renovation: any) => {
                const now = new Date();
                const startDate = renovation.startDate ? new Date(renovation.startDate) : null;
                const endDate = renovation.endDate ? new Date(renovation.endDate) : null;

                let status: 'pending' | 'in_progress' | 'completed' = 'pending';
                let statusColor = 'bg-yellow-100 text-yellow-800';
                let statusIcon = '⏳';

                if (startDate && (!endDate || endDate >= now)) {
                  status = 'in_progress';
                  statusColor = 'bg-blue-100 text-blue-800';
                  statusIcon = '🔨';
                } else if (endDate && endDate < now) {
                  status = 'completed';
                  statusColor = 'bg-green-100 text-green-800';
                  statusIcon = '✅';
                }

                return (
                  <div
                    key={renovation.id}
                    className="rounded-xl bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-md"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="mb-2 flex items-center gap-3">
                          <h3 className="text-xl font-semibold text-gray-800">
                            {renovation.title}
                          </h3>
                          <span
                            className={`rounded-full px-3 py-1 text-sm font-medium ${statusColor}`}
                          >
                            {statusIcon} {t(status)}
                          </span>
                        </div>
                        <p className="mb-2 text-gray-600">
                          <span className="font-medium">{t('property')}:</span>{' '}
                          {renovation.propertyAddress}
                          {renovation.unitNumber && (
                            <span className="ml-2">
                              - {t('unit_number')} {renovation.unitNumber}
                            </span>
                          )}
                        </p>
                        {renovation.startDate && (
                          <p className="mb-1 text-sm text-gray-500">
                            <span className="font-medium">{t('start_date')}:</span>{' '}
                            {new Date(renovation.startDate).toLocaleDateString(locale, {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </p>
                        )}
                        {renovation.endDate && (
                          <p className="mb-1 text-sm text-gray-500">
                            <span className="font-medium">{t('end_date')}:</span>{' '}
                            {new Date(renovation.endDate).toLocaleDateString(locale, {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </p>
                        )}
                        {renovation.totalCost > 0 && (
                          <p className="mb-1 text-sm text-gray-500">
                            <span className="font-medium">{t('total_cost')}:</span>{' '}
                            <span className="font-semibold text-green-600">
                              {`$${renovation.totalCost.toLocaleString()}`}
                            </span>
                          </p>
                        )}
                        {renovation.notes && (
                          <p className="mt-2 text-sm text-gray-600">{renovation.notes}</p>
                        )}
                      </div>
                      <div className="ml-4 flex gap-2">
                        <ViewRenovationDetails renovation={renovation} locale={locale} />
                        <EditRenovationForm
                          renovation={renovation}
                          locale={locale}
                          onUpdate={async (updatedRenovation: {
                            title: string;
                            startDate?: Date;
                            endDate?: Date;
                            totalCost?: number;
                            notes?: string;
                          }) => {
                            'use server';
                            const result = await updateRenovation(renovation.id, updatedRenovation);
                            if (result.success) {
                              // Refresh the page to show updated data
                              window.location.reload();
                            }
                            return result;
                          }}
                        />
                        <DeleteRenovationDialog
                          renovation={renovation}
                          locale={locale}
                          onDelete={async () => {
                            'use server';
                            const result = await deleteRenovation(renovation.id);
                            if (result.success) {
                              // Refresh the page to show updated data
                              window.location.reload();
                            }
                            return result;
                          }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
