'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { DeleteTenantModal } from './DeleteTenantModal';
import { EditTenantForm } from './Form/EditTenantForm';

type TenantActionsProps = {
  tenantId: string;
  tenantName: string;
  tenantPhone?: string;
  tenantEmail?: string;
  locale: string;
};

export function TenantActions({
  tenantId,
  tenantName,
  tenantPhone,
  tenantEmail,
  locale,
}: TenantActionsProps) {
  const t = useTranslations('TenantDetail');
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleEditSuccess = () => {
    setShowEditForm(false);
    // Refresh the page to show updated data
    window.location.reload();
  };

  return (
    <>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => setShowEditForm(true)}
          className="rounded-xl border-2 border-blue-600 bg-white px-6 py-3 text-lg font-semibold text-blue-600 transition-all duration-300 hover:bg-blue-600 hover:text-white focus:ring-4 focus:ring-blue-300 focus:outline-none"
        >
          {t('edit_tenant')}
        </button>
        <button
          type="button"
          onClick={() => setShowDeleteModal(true)}
          className="rounded-xl border-2 border-red-600 bg-white px-6 py-3 text-lg font-semibold text-red-600 transition-all duration-300 hover:bg-red-600 hover:text-white focus:ring-4 focus:ring-red-300 focus:outline-none"
        >
          {t('delete_tenant')}
        </button>
      </div>

      {showEditForm && (
        <EditTenantForm
          tenantId={tenantId}
          currentName={tenantName}
          currentPhone={tenantPhone}
          currentEmail={tenantEmail}
          locale={locale}
          onSuccess={handleEditSuccess}
          onCancel={() => setShowEditForm(false)}
        />
      )}

      {showDeleteModal && (
        <DeleteTenantModal
          tenantId={tenantId}
          tenantName={tenantName}
          locale={locale}
          onCancel={() => setShowDeleteModal(false)}
        />
      )}
    </>
  );
}
