import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import Link from 'next/link';
import {
  deleteParkingPermit,
  getParkingMetrics,
  getParkingPermitsWithDetails,
  updateParkingPermit,
} from '@/actions/ParkingActions';
import { DeleteParkingDialog } from '@/components/DeleteParkingDialog';
import { EditParkingForm } from '@/components/Form/EditParkingForm';

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({
    locale,
    namespace: 'Parking',
  });

  return {
    title: t('meta_title'),
    description: t('meta_description'),
  };
}

export default async function ParkingPage(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  const t = await getTranslations({
    locale,
    namespace: 'Parking',
  });

  // Fetch parking permits and metrics from database
  const permitsResult = await getParkingPermitsWithDetails();
  const permits = permitsResult.success ? permitsResult.permits : [];

  const metrics = await getParkingMetrics();

  return (
    <div className="py-8 md:py-12">
      <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h1 className="text-4xl font-bold text-gray-800 md:text-5xl">{t('page_title')}</h1>
        <Link
          href={`/${locale}/dashboard/parking/new`}
          className="inline-block rounded-xl bg-blue-600 px-8 py-4 text-center text-xl font-semibold text-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:bg-blue-700 hover:shadow-xl focus:ring-4 focus:ring-blue-300 focus:outline-none"
        >
          {t('add_permit')}
        </Link>
      </div>

      {/* Summary */}
      <div className="mb-10 grid gap-6 sm:grid-cols-3">
        <div className="group rounded-xl bg-gray-50 p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
          <div className="mb-4 text-4xl">🚗</div>
          <div className="mb-2 text-lg font-semibold text-gray-600">{t('total_permits')}</div>
          <div className="text-4xl font-bold text-gray-800">{metrics.totalPermits}</div>
        </div>
        <div className="group rounded-xl bg-gray-50 p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
          <div className="mb-4 text-4xl">✅</div>
          <div className="mb-2 text-lg font-semibold text-gray-600">{t('active_permits')}</div>
          <div className="text-4xl font-bold text-green-600">{metrics.activePermits}</div>
        </div>
        <div className="group rounded-xl bg-gray-50 p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
          <div className="mb-4 text-4xl">⚠️</div>
          <div className="mb-2 text-lg font-semibold text-gray-600">{t('expiring_soon')}</div>
          <div className="text-4xl font-bold text-yellow-600">{metrics.expiringSoon}</div>
        </div>
      </div>

      {/* Permit List */}
      <div className="overflow-hidden rounded-xl bg-gray-50">
        <div className="p-8">
          {permits.length === 0 ? (
            <div className="py-12 text-center">
              <div className="mb-6 text-8xl">🅿️</div>
              <h3 className="mb-4 text-2xl font-semibold text-gray-800">{t('no_permits')}</h3>
              <p className="mb-8 text-xl leading-relaxed text-gray-600">
                {t('no_permits_description')}
              </p>
              <Link
                href={`/${locale}/dashboard/parking/new`}
                className="inline-block rounded-xl bg-blue-600 px-8 py-4 text-xl font-semibold text-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:bg-blue-700 hover:shadow-xl focus:ring-4 focus:ring-blue-300 focus:outline-none"
              >
                {t('add_first_permit')}
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="px-4 py-4 text-left text-lg font-semibold text-gray-700">
                      {t('permit_number')}
                    </th>
                    <th className="px-4 py-4 text-left text-lg font-semibold text-gray-700">
                      {t('property')}
                    </th>
                    <th className="px-4 py-4 text-left text-lg font-semibold text-gray-700">
                      {t('tenant')}
                    </th>
                    <th className="px-4 py-4 text-left text-lg font-semibold text-gray-700">
                      {t('vehicle')}
                    </th>
                    <th className="px-4 py-4 text-left text-lg font-semibold text-gray-700">
                      {t('status')}
                    </th>
                    <th className="px-4 py-4 text-left text-lg font-semibold text-gray-700">
                      {t('issued_date')}
                    </th>
                    <th className="px-4 py-4 text-left text-lg font-semibold text-gray-700">
                      {t('actions')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {permits.map((permit: any) => {
                    let statusColor = 'bg-green-100 text-green-800';
                    if (permit.status === 'Cancelled') {
                      statusColor = 'bg-red-100 text-red-800';
                    } else if (permit.status === 'Suspended') {
                      statusColor = 'bg-yellow-100 text-yellow-800';
                    } else if (permit.status === 'Expired') {
                      statusColor = 'bg-gray-100 text-gray-800';
                    }

                    return (
                      <tr
                        key={permit.id}
                        className="border-b border-gray-200 transition-colors hover:bg-gray-100"
                      >
                        <td className="px-4 py-4 text-lg font-semibold text-gray-800">
                          {permit.permitNumber}
                        </td>
                        <td className="px-4 py-4 text-lg text-gray-600">
                          {permit.propertyAddress}
                          {permit.unitNumber && (
                            <span className="ml-2 text-sm text-gray-500">
                              - {t('unit_number')} {permit.unitNumber}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-4 text-lg text-gray-600">
                          {permit.tenantName || '-'}
                        </td>
                        <td className="px-4 py-4 text-lg text-gray-600">
                          {permit.vehicleMake && permit.vehicleModel ? (
                            <span>
                              {permit.vehicleYear} {permit.vehicleMake} {permit.vehicleModel}
                              {permit.licensePlate && (
                                <span className="ml-2 text-sm text-gray-500">
                                  ({permit.licensePlate})
                                </span>
                              )}
                            </span>
                          ) : (
                            permit.licensePlate || '-'
                          )}
                        </td>
                        <td className="px-4 py-4 text-lg">
                          <span
                            className={`rounded-full px-3 py-1 text-sm font-medium ${statusColor}`}
                          >
                            {permit.status}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-lg text-gray-600">
                          {new Date(permit.issuedAt).toLocaleDateString(locale, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex gap-2">
                            <EditParkingForm
                              permit={permit}
                              locale={locale}
                              onUpdate={async (updatedPermit: {
                                tenantId?: string;
                                building?: string;
                                permitNumber: string;
                                status: string;
                                vehicleMake?: string;
                                vehicleModel?: string;
                                vehicleYear?: string;
                                vehicleColor?: string;
                                licensePlate?: string;
                                comments?: string;
                              }) => {
                                'use server';
                                const result = await updateParkingPermit(permit.id, updatedPermit);
                                if (result.success) {
                                  // Refresh the page to show updated data
                                  window.location.reload();
                                }
                                return result;
                              }}
                            />
                            <DeleteParkingDialog
                              permit={permit}
                              locale={locale}
                              onDelete={async () => {
                                'use server';
                                const result = await deleteParkingPermit(permit.id);
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
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
