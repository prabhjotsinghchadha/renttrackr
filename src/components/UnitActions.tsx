'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { DeleteUnitModal } from './DeleteUnitModal';

type UnitActionsProps = {
  unitId: string;
  unitNumber: string;
  propertyAddress: string;
  locale: string;
};

export function UnitActions({ unitId, unitNumber, propertyAddress, locale }: UnitActionsProps) {
  const t = useTranslations('PropertyDetail');
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setShowDeleteModal(true)}
        className="rounded-lg border-2 border-red-500 bg-white px-4 py-2 text-sm font-semibold text-red-500 transition-all duration-300 hover:bg-red-500 hover:text-white focus:ring-4 focus:ring-red-300 focus:outline-none"
      >
        {t('delete')}
      </button>

      {showDeleteModal && (
        <DeleteUnitModal
          unitId={unitId}
          unitNumber={unitNumber}
          propertyAddress={propertyAddress}
          locale={locale}
          onCancel={() => setShowDeleteModal(false)}
        />
      )}
    </>
  );
}
