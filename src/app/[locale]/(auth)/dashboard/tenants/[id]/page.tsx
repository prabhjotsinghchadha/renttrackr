import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getLeasesByTenantId } from '@/actions/LeaseActions';
import { getTenantById } from '@/actions/TenantActions';

export async function generateMetadata(props: {
  params: Promise<{ locale: string; id: string }>;
}): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({
    locale,
    namespace: 'TenantDetail',
  });

  return {
    title: t('meta_title'),
    description: t('meta_description'),
  };
}

export default async function TenantDetailPage(props: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await props.params;
  setRequestLocale(locale);
  const t = await getTranslations({
    locale,
    namespace: 'TenantDetail',
  });

  // Fetch tenant from database
  const result = await getTenantById(id);

  if (!result.success || !result.tenant) {
    notFound();
  }

  const tenant = result.tenant;

  // Fetch leases for this tenant
  const leasesResult = await getLeasesByTenantId(id);
  const leases = leasesResult.success ? leasesResult.leases : [];
  const activeLease = leases.find((lease: any) => new Date(lease.endDate) >= new Date());
  const hasActiveLease = !!activeLease;

  return (
    <div className="py-8 md:py-12">
      <div className="mb-8">
        <Link
          href="/dashboard/tenants"
          className="inline-flex items-center text-lg text-blue-600 transition-colors hover:text-blue-700"
        >
          ← {t('back_to_tenants')}
        </Link>
      </div>

      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h1 className="text-4xl font-bold text-gray-800 md:text-5xl">{tenant.name}</h1>
        <div className="flex gap-3">
          <button
            type="button"
            className="rounded-xl border-2 border-blue-600 bg-white px-6 py-3 text-lg font-semibold text-blue-600 transition-all duration-300 hover:bg-blue-600 hover:text-white focus:ring-4 focus:ring-blue-300 focus:outline-none"
          >
            {t('edit_tenant')}
          </button>
          <button
            type="button"
            className="rounded-xl border-2 border-red-600 bg-white px-6 py-3 text-lg font-semibold text-red-600 transition-all duration-300 hover:bg-red-600 hover:text-white focus:ring-4 focus:ring-red-300 focus:outline-none"
          >
            {t('delete_tenant')}
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Tenant details */}
        <div className="lg:col-span-2">
          <div className="mb-6 rounded-xl bg-gray-50 p-8">
            <h2 className="mb-6 text-2xl font-semibold text-gray-800">{t('tenant_info')}</h2>
            <div className="space-y-4">
              <div>
                <span className="text-lg font-semibold text-gray-700">{t('name')}:</span>
                <span className="ml-2 text-lg text-gray-600">{tenant.name}</span>
              </div>
              {tenant.email && (
                <div>
                  <span className="text-lg font-semibold text-gray-700">{t('email')}:</span>
                  <span className="ml-2 text-lg text-gray-600">{tenant.email}</span>
                </div>
              )}
              {tenant.phone && (
                <div>
                  <span className="text-lg font-semibold text-gray-700">{t('phone')}:</span>
                  <span className="ml-2 text-lg text-gray-600">{tenant.phone}</span>
                </div>
              )}
              <div>
                <span className="text-lg font-semibold text-gray-700">{t('tenant_since')}:</span>
                <span className="ml-2 text-lg text-gray-600">
                  {new Date(tenant.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* Lease section */}
          <div className="rounded-xl bg-gray-50 p-8">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-gray-800">{t('lease_info')}</h2>
              {!hasActiveLease && (
                <Link
                  href={`/${locale}/dashboard/tenants/${id}/lease/new`}
                  className="rounded-xl bg-blue-600 px-6 py-3 text-lg font-semibold text-white transition-all duration-300 hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 focus:outline-none"
                >
                  {t('create_lease')}
                </Link>
              )}
            </div>
            {hasActiveLease ? (
              <div className="space-y-4">
                <div className="rounded-lg bg-green-50 p-4">
                  <span className="text-lg font-semibold text-green-700">{t('active_lease')}</span>
                </div>
                <div>
                  <span className="text-lg font-semibold text-gray-700">{t('lease_start')}:</span>
                  <span className="ml-2 text-lg text-gray-600">
                    {new Date(activeLease.startDate).toLocaleDateString(locale, {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </div>
                <div>
                  <span className="text-lg font-semibold text-gray-700">{t('lease_end')}:</span>
                  <span className="ml-2 text-lg text-gray-600">
                    {new Date(activeLease.endDate).toLocaleDateString(locale, {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </div>
                <div>
                  <span className="text-lg font-semibold text-gray-700">{t('monthly_rent')}:</span>
                  <span className="ml-2 text-lg font-semibold text-green-600">
                    ${activeLease.rent.toFixed(2)}
                  </span>
                </div>
                <div>
                  <span className="text-lg font-semibold text-gray-700">
                    {t('security_deposit')}:
                  </span>
                  <span className="ml-2 text-lg text-gray-600">
                    ${activeLease.deposit.toFixed(2)}
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <div className="mb-4 text-6xl">📄</div>
                <p className="text-lg text-gray-600">{t('no_active_lease')}</p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="rounded-xl bg-gray-50 p-8">
            <h3 className="mb-6 text-xl font-semibold text-gray-800">{t('quick_actions')}</h3>
            <div className="space-y-3">
              {hasActiveLease ? (
                <Link
                  href={`/${locale}/dashboard/rents/new`}
                  className="block w-full rounded-xl border-2 border-blue-600 bg-white px-6 py-3 text-center text-lg font-semibold text-blue-600 transition-all duration-300 hover:bg-blue-600 hover:text-white focus:ring-4 focus:ring-blue-300 focus:outline-none"
                >
                  {t('record_payment')}
                </Link>
              ) : (
                <Link
                  href={`/${locale}/dashboard/tenants/${id}/lease/new`}
                  className="block w-full rounded-xl border-2 border-blue-600 bg-white px-6 py-3 text-center text-lg font-semibold text-blue-600 transition-all duration-300 hover:bg-blue-600 hover:text-white focus:ring-4 focus:ring-blue-300 focus:outline-none"
                >
                  {t('create_lease')}
                </Link>
              )}
              <button
                type="button"
                className="w-full rounded-xl border-2 border-gray-300 bg-white px-6 py-3 text-lg font-semibold text-gray-700 transition-all duration-300 hover:border-gray-400 hover:bg-gray-50 focus:ring-4 focus:ring-gray-300 focus:outline-none"
              >
                {t('send_message')}
              </button>
            </div>
          </div>

          <div className="rounded-xl bg-gray-50 p-8">
            <h3 className="mb-6 text-xl font-semibold text-gray-800">{t('payment_history')}</h3>
            <p className="text-lg text-gray-600">{t('no_payments')}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
