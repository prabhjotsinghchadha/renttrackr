'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { createUnit } from '@/actions/PropertyActions';

type AddUnitFormProps = {
  propertyId: string;
  onSuccess?: () => void;
};

export function AddUnitForm({ propertyId, onSuccess }: AddUnitFormProps) {
  const router = useRouter();
  const t = useTranslations('PropertyDetail');
  const [unitNumber, setUnitNumber] = useState('');
  const [rentAmount, setRentAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      if (!unitNumber.trim()) {
        setError(t('unit_number_required'));
        setIsSubmitting(false);
        return;
      }

      if (!rentAmount || Number.parseFloat(rentAmount) <= 0) {
        setError(t('rent_amount_required'));
        setIsSubmitting(false);
        return;
      }

      const result = await createUnit({
        propertyId,
        unitNumber: unitNumber.trim(),
        rentAmount: Number.parseFloat(rentAmount),
      });

      if (result.success && result.unit) {
        setUnitNumber('');
        setRentAmount('');
        setShowForm(false);
        router.refresh();
        if (onSuccess) onSuccess();
      } else {
        setError(result.error || t('create_unit_error'));
        setIsSubmitting(false);
      }
    } catch (err) {
      console.error('Error creating unit:', err);
      setError(t('create_unit_error'));
      setIsSubmitting(false);
    }
  };

  if (!showForm) {
    return (
      <button
        type="button"
        onClick={() => setShowForm(true)}
        className="rounded-xl bg-blue-600 px-6 py-3 text-lg font-semibold text-white transition-all duration-300 hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 focus:outline-none"
      >
        {t('add_unit')}
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-xl bg-white p-6 shadow-md">
      <h3 className="text-xl font-semibold text-gray-800">{t('add_new_unit')}</h3>
      
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label htmlFor="unitNumber" className="mb-2 block text-sm font-semibold text-gray-700">
            {t('unit_number')} <span className="text-red-600">*</span>
          </label>
          <input
            type="text"
            id="unitNumber"
            value={unitNumber}
            onChange={(e) => setUnitNumber(e.target.value)}
            placeholder={t('unit_number_placeholder')}
            disabled={isSubmitting}
            className="w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-2 text-gray-800 transition-all duration-300 placeholder:text-gray-400 hover:border-gray-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-300 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            required
          />
        </div>

        <div>
          <label htmlFor="rentAmount" className="mb-2 block text-sm font-semibold text-gray-700">
            {t('rent_amount')} <span className="text-red-600">*</span>
          </label>
          <input
            type="number"
            id="rentAmount"
            value={rentAmount}
            onChange={(e) => setRentAmount(e.target.value)}
            placeholder={t('rent_amount_placeholder')}
            disabled={isSubmitting}
            step="0.01"
            min="0"
            className="w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-2 text-gray-800 transition-all duration-300 placeholder:text-gray-400 hover:border-gray-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-300 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            required
          />
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-red-600">
          <p className="text-sm font-semibold">{error}</p>
        </div>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-lg bg-blue-600 px-6 py-2 font-semibold text-white transition-all duration-300 hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? t('adding') : t('add_unit')}
        </button>

        <button
          type="button"
          onClick={() => {
            setShowForm(false);
            setUnitNumber('');
            setRentAmount('');
            setError('');
          }}
          disabled={isSubmitting}
          className="rounded-lg border-2 border-gray-300 bg-white px-6 py-2 font-semibold text-gray-700 transition-all duration-300 hover:border-gray-400 hover:bg-gray-50 focus:ring-4 focus:ring-gray-300 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
        >
          {t('cancel')}
        </button>
      </div>
    </form>
  );
}

