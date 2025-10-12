'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { deleteProperty } from '@/actions/PropertyActions';

type DeletePropertyModalProps = {
  propertyId: string;
  propertyAddress: string;
  locale: string;
  onCancel?: () => void;
};

export function DeletePropertyModal({
  propertyId,
  propertyAddress,
  locale,
  onCancel,
}: DeletePropertyModalProps) {
  const router = useRouter();
  const t = useTranslations('PropertyDetail');
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');

  const handleDelete = async () => {
    setError('');
    setIsDeleting(true);

    try {
      const result = await deleteProperty(propertyId);

      if (result.success) {
        router.push(`/${locale}/dashboard/properties`);
        router.refresh();
      } else {
        setError(result.error || t('delete_error'));
        setIsDeleting(false);
      }
    } catch (err) {
      console.error('Error deleting property:', err);
      setError(t('delete_error'));
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-2xl">
        <div className="mb-6 text-center">
          <div className="mb-4 text-6xl">⚠️</div>
          <h2 className="mb-2 text-2xl font-bold text-gray-800">{t('delete_property')}</h2>
          <p className="text-lg text-gray-600">
            {t('delete_confirmation')} <strong>{propertyAddress}</strong>?
          </p>
          <p className="mt-2 text-sm text-red-600">{t('delete_warning')}</p>
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
