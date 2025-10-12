'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { deleteUnit } from '@/actions/PropertyActions';

type DeleteUnitModalProps = {
  unitId: string;
  unitNumber: string;
  propertyAddress: string;
  locale: string;
  onCancel?: () => void;
};

export function DeleteUnitModal({
  unitId,
  unitNumber,
  propertyAddress,
  locale: _locale,
  onCancel,
}: DeleteUnitModalProps) {
  const t = useTranslations('PropertyDetail');
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');

  const handleDelete = async () => {
    setError('');
    setIsDeleting(true);

    try {
      const result = await deleteUnit(unitId);

      if (result.success) {
        // Refresh the page to show updated data
        window.location.reload();
      } else {
        setError(result.error || 'Failed to delete unit');
        setIsDeleting(false);
      }
    } catch (err) {
      console.error('Error deleting unit:', err);
      setError('Failed to delete unit');
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-2xl">
        <div className="mb-6 text-center">
          <div className="mb-4 text-6xl">⚠️</div>
          <h2 className="mb-2 text-2xl font-bold text-gray-800">Delete Unit</h2>
          <p className="text-lg text-gray-600">
            Are you sure you want to delete <strong>Unit {unitNumber}</strong> at{' '}
            <strong>{propertyAddress}</strong>?
          </p>
          <p className="mt-2 text-sm text-red-600">
            This action cannot be undone. All tenants and related data will be permanently deleted.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-xl bg-red-50 p-4 text-red-600">
            <p className="text-lg font-semibold">{error}</p>
          </div>
        )}

        <div className="flex gap-4">
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex-1 rounded-xl bg-red-600 px-8 py-4 text-xl font-semibold text-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:bg-red-700 hover:shadow-xl focus:ring-4 focus:ring-red-300 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
          >
            {isDeleting ? t('deleting') : t('delete_confirm')}
          </button>

          <button
            type="button"
            onClick={onCancel}
            disabled={isDeleting}
            className="rounded-xl border-2 border-gray-300 bg-white px-8 py-4 text-xl font-semibold text-gray-700 transition-all duration-300 hover:border-gray-400 hover:bg-gray-50 focus:ring-4 focus:ring-gray-300 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          >
            {t('cancel')}
          </button>
        </div>
      </div>
    </div>
  );
}
