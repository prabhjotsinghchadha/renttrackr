'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { DeletePropertyModal } from './DeletePropertyModal';
import { EditPropertyForm } from './Form/EditPropertyForm';

type PropertyActionsProps = {
  propertyId: string;
  propertyAddress: string;
  propertyAcquiredOn?: Date;
  propertyPrincipalAmount?: number;
  propertyRateOfInterest?: number;
  locale: string;
};

export function PropertyActions({
  propertyId,
  propertyAddress,
  propertyAcquiredOn,
  propertyPrincipalAmount,
  propertyRateOfInterest,
  locale,
}: PropertyActionsProps) {
  const t = useTranslations('PropertyDetail');
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
          {t('edit_property')}
        </button>
        <button
          type="button"
          onClick={() => setShowDeleteModal(true)}
          className="rounded-xl border-2 border-red-600 bg-white px-6 py-3 text-lg font-semibold text-red-600 transition-all duration-300 hover:bg-red-600 hover:text-white focus:ring-4 focus:ring-red-300 focus:outline-none"
        >
          {t('delete_property')}
        </button>
      </div>

      {showEditForm && (
        <EditPropertyForm
          propertyId={propertyId}
          currentAddress={propertyAddress}
          currentAcquiredOn={propertyAcquiredOn}
          currentPrincipalAmount={propertyPrincipalAmount}
          currentRateOfInterest={propertyRateOfInterest}
          locale={locale}
          onSuccess={handleEditSuccess}
          onCancel={() => setShowEditForm(false)}
        />
      )}

      {showDeleteModal && (
        <DeletePropertyModal
          propertyId={propertyId}
          propertyAddress={propertyAddress}
          locale={locale}
          onCancel={() => setShowDeleteModal(false)}
        />
      )}
    </>
  );
}
