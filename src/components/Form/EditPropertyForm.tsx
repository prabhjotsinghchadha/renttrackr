'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { updateProperty } from '@/actions/PropertyActions';

type EditPropertyFormProps = {
  propertyId: string;
  currentAddress: string;
  currentAcquiredOn?: Date;
  currentPrincipalAmount?: number;
  currentRateOfInterest?: number;
  locale: string;
  onSuccess?: () => void;
  onCancel?: () => void;
};

export function EditPropertyForm({
  propertyId,
  currentAddress,
  currentAcquiredOn,
  currentPrincipalAmount,
  currentRateOfInterest,
  locale,
  onSuccess,
  onCancel,
}: EditPropertyFormProps) {
  const router = useRouter();
  const t = useTranslations('PropertyDetail');
  const [address, setAddress] = useState(currentAddress);
  const [acquiredOn, setAcquiredOn] = useState(
    currentAcquiredOn ? currentAcquiredOn.toISOString().split('T')[0] : '',
  );
  const [principalAmount, setPrincipalAmount] = useState(currentPrincipalAmount?.toString() || '');
  const [rateOfInterest, setRateOfInterest] = useState(currentRateOfInterest?.toString() || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      if (!address.trim()) {
        setError(t('address_required'));
        setIsSubmitting(false);
        return;
      }

      const result = await updateProperty(propertyId, {
        address: address.trim(),
        acquiredOn: acquiredOn ? new Date(acquiredOn) : undefined,
        principalAmount: principalAmount ? Number.parseFloat(principalAmount) : undefined,
        rateOfInterest: rateOfInterest ? Number.parseFloat(rateOfInterest) : undefined,
      });

      if (result.success && result.property) {
        if (onSuccess) {
          onSuccess();
        } else {
          router.push(`/${locale}/dashboard/properties`);
          router.refresh();
        }
      } else {
        setError(result.error || t('update_error'));
        setIsSubmitting(false);
      }
    } catch (err) {
      console.error('Error updating property:', err);
      setError(t('update_error'));
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-2xl">
        <h2 className="mb-6 text-2xl font-bold text-gray-800">{t('edit_property')}</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="address" className="mb-2 block text-lg font-semibold text-gray-800">
              {t('address')} <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder={t('address_placeholder')}
              disabled={isSubmitting}
              className="w-full rounded-xl border-2 border-gray-200 bg-white px-6 py-4 text-lg text-gray-800 transition-all duration-300 placeholder:text-gray-400 hover:border-gray-300 focus:border-blue-600 focus:ring-4 focus:ring-blue-300 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
              required
            />
            <p className="mt-2 text-sm text-gray-600">{t('address_help')}</p>
          </div>

          <div>
            <label htmlFor="acquiredOn" className="mb-2 block text-lg font-semibold text-gray-800">
              {t('property_acquired_on')}
            </label>
            <input
              type="date"
              id="acquiredOn"
              value={acquiredOn}
              onChange={(e) => setAcquiredOn(e.target.value)}
              disabled={isSubmitting}
              className="w-full rounded-xl border-2 border-gray-200 bg-white px-6 py-4 text-lg text-gray-800 transition-all duration-300 hover:border-gray-300 focus:border-blue-600 focus:ring-4 focus:ring-blue-300 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            />
            <p className="mt-2 text-sm text-gray-600">{t('acquired_on_help')}</p>
          </div>

          <div>
            <label
              htmlFor="principalAmount"
              className="mb-2 block text-lg font-semibold text-gray-800"
            >
              {t('principal_amount')}
            </label>
            <input
              type="number"
              id="principalAmount"
              value={principalAmount}
              onChange={(e) => setPrincipalAmount(e.target.value)}
              placeholder={t('principal_amount_placeholder')}
              disabled={isSubmitting}
              className="w-full rounded-xl border-2 border-gray-200 bg-white px-6 py-4 text-lg text-gray-800 transition-all duration-300 placeholder:text-gray-400 hover:border-gray-300 focus:border-blue-600 focus:ring-4 focus:ring-blue-300 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
              min="0"
              step="0.01"
            />
            <p className="mt-2 text-sm text-gray-600">{t('principal_amount_help')}</p>
          </div>

          <div>
            <label
              htmlFor="rateOfInterest"
              className="mb-2 block text-lg font-semibold text-gray-800"
            >
              {t('rate_of_interest')}
            </label>
            <input
              type="number"
              id="rateOfInterest"
              value={rateOfInterest}
              onChange={(e) => setRateOfInterest(e.target.value)}
              placeholder={t('rate_of_interest_placeholder')}
              disabled={isSubmitting}
              className="w-full rounded-xl border-2 border-gray-200 bg-white px-6 py-4 text-lg text-gray-800 transition-all duration-300 placeholder:text-gray-400 hover:border-gray-300 focus:border-blue-600 focus:ring-4 focus:ring-blue-300 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
              min="0"
              max="100"
              step="0.01"
            />
            <p className="mt-2 text-sm text-gray-600">{t('rate_of_interest_help')}</p>
          </div>

          {error && (
            <div className="rounded-xl bg-red-50 p-4 text-red-600">
              <p className="text-lg font-semibold">{error}</p>
            </div>
          )}

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 rounded-xl bg-blue-600 px-8 py-4 text-xl font-semibold text-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:bg-blue-700 hover:shadow-xl focus:ring-4 focus:ring-blue-300 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
            >
              {isSubmitting ? t('updating') : t('update_property')}
            </button>

            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className="rounded-xl border-2 border-gray-300 bg-white px-8 py-4 text-xl font-semibold text-gray-700 transition-all duration-300 hover:border-gray-400 hover:bg-gray-50 focus:ring-4 focus:ring-gray-300 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            >
              {t('cancel')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
