import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getUserUnits } from '@/actions/PropertyActions';
import { getTenantById } from '@/actions/TenantActions';
import { LeaseForm } from '@/components/Form/LeaseForm';

export async function generateMetadata(props: {
  params: Promise<{ locale: string; id: string }>;
}): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({
    locale,
    namespace: 'Leases',
  });

  return {
    title: t('create_lease'),
    description: t('create_lease_description'),
  };
}

export default async function NewLeasePage(props: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await props.params;
  setRequestLocale(locale);
  const t = await getTranslations({
    locale,
    namespace: 'Leases',
  });

  // Fetch tenant from database
  const tenantResult = await getTenantById(id);

  if (!tenantResult.success || !tenantResult.tenant) {
    notFound();
  }

  const tenant = tenantResult.tenant;

  // Get unit info to get the default rent amount
  const unitsResult = await getUserUnits();
  const unit = unitsResult.units?.find((u: any) => u.id === tenant.unitId);

  return (
    <div className="py-8 md:py-12">
      <div className="mb-8">
        <Link
          href={`/dashboard/tenants/${id}`}
          className="inline-flex items-center text-lg text-blue-600 transition-colors hover:text-blue-700"
        >
          ← {t('back_to_tenant')}
        </Link>
      </div>

      <div className="mb-10">
        <h1 className="text-4xl font-bold text-gray-800 md:text-5xl">{t('create_lease')}</h1>
        <p className="mt-4 text-xl leading-relaxed text-gray-600">
          {t('create_lease_description')}
        </p>
      </div>

      <div className="rounded-xl bg-gray-50 p-8 md:p-12">
        <LeaseForm
          locale={locale}
          tenantId={id}
          tenantName={tenant.name}
          defaultRent={unit?.rentAmount}
        />
      </div>
    </div>
  );
}
