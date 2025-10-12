'use client';

import Link from 'next/link';
import { useState } from 'react';
import { MessageModal } from './MessageModal';
import { TenantActions } from './TenantActions';

type TenantDetailClientProps = {
  tenant: {
    name: string;
    email?: string | null;
    phone?: string | null;
    createdAt: string | Date;
  };
  tenantId: string;
  leases: any[];
  activeLease?: any;
  hasActiveLease: boolean;
  locale: string;
  translations: {
    back_to_tenants: string;
    tenant_info: string;
    name: string;
    email: string;
    phone: string;
    tenant_since: string;
    lease_info: string;
    create_lease: string;
    active_lease: string;
    lease_start: string;
    lease_end: string;
    monthly_rent: string;
    security_deposit: string;
    no_active_lease: string;
    quick_actions: string;
    record_payment: string;
    send_message: string;
    payment_history: string;
    no_payments: string;
    phone_number: string;
    message: string;
    send: string;
    cancel: string;
    message_sent: string;
    message_failed: string;
    invalid_phone: string;
    phone_placeholder: string;
    message_placeholder: string;
    sending: string;
  };
};

export function TenantDetailClient({
  tenant,
  tenantId,
  activeLease,
  hasActiveLease,
  locale,
  translations,
}: TenantDetailClientProps) {
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);

  return (
    <>
      <div className="py-8 md:py-12">
        <div className="mb-8">
          <Link
            href="/dashboard/tenants"
            className="inline-flex items-center text-lg text-blue-600 transition-colors hover:text-blue-700"
          >
            ← {translations.back_to_tenants}
          </Link>
        </div>

        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <h1 className="text-4xl font-bold text-gray-800 md:text-5xl">{tenant.name}</h1>
          <TenantActions
            tenantId={tenantId}
            tenantName={tenant.name}
            tenantPhone={tenant.phone || undefined}
            tenantEmail={tenant.email || undefined}
            locale={locale}
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Tenant details */}
          <div className="lg:col-span-2">
            <div className="mb-6 rounded-xl bg-gray-50 p-8">
              <h2 className="mb-6 text-2xl font-semibold text-gray-800">
                {translations.tenant_info}
              </h2>
              <div className="space-y-4">
                <div>
                  <span className="text-lg font-semibold text-gray-700">{translations.name}:</span>
                  <span className="ml-2 text-lg text-gray-600">{tenant.name}</span>
                </div>
                {tenant.email && (
                  <div>
                    <span className="text-lg font-semibold text-gray-700">
                      {translations.email}:
                    </span>
                    <span className="ml-2 text-lg text-gray-600">{tenant.email}</span>
                  </div>
                )}
                {tenant.phone && (
                  <div>
                    <span className="text-lg font-semibold text-gray-700">
                      {translations.phone}:
                    </span>
                    <span className="ml-2 text-lg text-gray-600">{tenant.phone}</span>
                  </div>
                )}
                <div>
                  <span className="text-lg font-semibold text-gray-700">
                    {translations.tenant_since}:
                  </span>
                  <span className="ml-2 text-lg text-gray-600">
                    {new Date(tenant.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Lease section */}
            <div className="rounded-xl bg-gray-50 p-8">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-2xl font-semibold text-gray-800">{translations.lease_info}</h2>
                {!hasActiveLease && (
                  <Link
                    href={`/${locale}/dashboard/tenants/${tenantId}/lease/new`}
                    className="rounded-xl bg-blue-600 px-6 py-3 text-lg font-semibold text-white transition-all duration-300 hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 focus:outline-none"
                  >
                    {translations.create_lease}
                  </Link>
                )}
              </div>
              {hasActiveLease ? (
                <div className="space-y-4">
                  <div className="rounded-lg bg-green-50 p-4">
                    <span className="text-lg font-semibold text-green-700">
                      {translations.active_lease}
                    </span>
                  </div>
                  <div>
                    <span className="text-lg font-semibold text-gray-700">
                      {translations.lease_start}:
                    </span>
                    <span className="ml-2 text-lg text-gray-600">
                      {new Date(activeLease.startDate).toLocaleDateString(locale, {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                  <div>
                    <span className="text-lg font-semibold text-gray-700">
                      {translations.lease_end}:
                    </span>
                    <span className="ml-2 text-lg text-gray-600">
                      {new Date(activeLease.endDate).toLocaleDateString(locale, {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                  <div>
                    <span className="text-lg font-semibold text-gray-700">
                      {translations.monthly_rent}:
                    </span>
                    <span className="ml-2 text-lg font-semibold text-green-600">
                      ${activeLease.rent.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-lg font-semibold text-gray-700">
                      {translations.security_deposit}:
                    </span>
                    <span className="ml-2 text-lg text-gray-600">
                      ${activeLease.deposit.toFixed(2)}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <div className="mb-4 text-6xl">📄</div>
                  <p className="text-lg text-gray-600">{translations.no_active_lease}</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="rounded-xl bg-gray-50 p-8">
              <h3 className="mb-6 text-xl font-semibold text-gray-800">
                {translations.quick_actions}
              </h3>
              <div className="space-y-3">
                {hasActiveLease ? (
                  <Link
                    href={`/${locale}/dashboard/rents/new`}
                    className="block w-full rounded-xl border-2 border-blue-600 bg-white px-6 py-3 text-center text-lg font-semibold text-blue-600 transition-all duration-300 hover:bg-blue-600 hover:text-white focus:ring-4 focus:ring-blue-300 focus:outline-none"
                  >
                    {translations.record_payment}
                  </Link>
                ) : (
                  <Link
                    href={`/${locale}/dashboard/tenants/${tenantId}/lease/new`}
                    className="block w-full rounded-xl border-2 border-blue-600 bg-white px-6 py-3 text-center text-lg font-semibold text-blue-600 transition-all duration-300 hover:bg-blue-600 hover:text-white focus:ring-4 focus:ring-blue-300 focus:outline-none"
                  >
                    {translations.create_lease}
                  </Link>
                )}
                <button
                  type="button"
                  onClick={() => setIsMessageModalOpen(true)}
                  className="w-full rounded-xl border-2 border-gray-300 bg-white px-6 py-3 text-lg font-semibold text-gray-700 transition-all duration-300 hover:border-gray-400 hover:bg-gray-50 focus:ring-4 focus:ring-gray-300 focus:outline-none"
                >
                  {translations.send_message}
                </button>
              </div>
            </div>

            <div className="rounded-xl bg-gray-50 p-8">
              <h3 className="mb-6 text-xl font-semibold text-gray-800">
                {translations.payment_history}
              </h3>
              <p className="text-lg text-gray-600">{translations.no_payments}</p>
            </div>
          </div>
        </div>
      </div>

      <MessageModal
        tenantName={tenant.name}
        tenantPhone={tenant.phone || undefined}
        locale={locale}
        translations={{
          send_message: translations.send_message,
          phone_number: translations.phone_number,
          message: translations.message,
          send: translations.send,
          cancel: translations.cancel,
          message_sent: translations.message_sent,
          message_failed: translations.message_failed,
          invalid_phone: translations.invalid_phone,
          phone_placeholder: translations.phone_placeholder,
          message_placeholder: translations.message_placeholder,
          sending: translations.sending,
        }}
        isOpen={isMessageModalOpen}
        onClose={() => setIsMessageModalOpen(false)}
      />
    </>
  );
}
