import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { getLeasesByTenantId } from '@/actions/LeaseActions';
import { getTenantById } from '@/actions/TenantActions';
import { TenantDetailClient } from '@/components/TenantDetailClient';

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic';

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
    <TenantDetailClient
      tenant={tenant}
      tenantId={id}
      leases={leases}
      activeLease={activeLease}
      hasActiveLease={hasActiveLease}
      locale={locale}
      translations={{
        back_to_tenants: t('back_to_tenants'),
        tenant_info: t('tenant_info'),
        name: t('name'),
        email: t('email'),
        phone: t('phone'),
        tenant_since: t('tenant_since'),
        lease_info: t('lease_info'),
        create_lease: t('create_lease'),
        active_lease: t('active_lease'),
        lease_start: t('lease_start'),
        lease_end: t('lease_end'),
        monthly_rent: t('monthly_rent'),
        security_deposit: t('security_deposit'),
        no_active_lease: t('no_active_lease'),
        quick_actions: t('quick_actions'),
        record_payment: t('record_payment'),
        send_message: t('send_message'),
        payment_history: t('payment_history'),
        no_payments: t('no_payments'),
        phone_number: t('phone_number'),
        message: t('message'),
        send: t('send'),
        cancel: t('message_cancel'),
        message_sent: t('message_sent'),
        message_failed: t('message_failed'),
        invalid_phone: t('invalid_phone'),
        phone_placeholder: t('message_phone_placeholder'),
        message_placeholder: t('message_placeholder'),
        sending: t('sending'),
      }}
    />
  );
}
