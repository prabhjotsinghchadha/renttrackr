'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { createLease } from '@/actions/LeaseActions';

type LeaseFormProps = {
  locale: string;
  tenantId: string;
  tenantName: string;
  defaultRent?: number;
  onSuccess?: () => void;
};

export function LeaseForm({
  locale,
  tenantId,
  tenantName,
  defaultRent,
  onSuccess,
}: LeaseFormProps) {
  const router = useRouter();
  const t = useTranslations('Leases');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [rent, setRent] = useState(defaultRent?.toString() || '');
  const [deposit, setDeposit] = useState('');
  const [securityDeposit, setSecurityDeposit] = useState('');
  const [petDeposit, setPetDeposit] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      if (!startDate) {
        setError(t('start_date_required'));
        setIsSubmitting(false);
        return;
      }

      if (!endDate) {
        setError(t('end_date_required'));
        setIsSubmitting(false);
        return;
      }

      if (!rent || Number.parseFloat(rent) <= 0) {
        setError(t('rent_required'));
        setIsSubmitting(false);
        return;
      }

      if (!deposit || Number.parseFloat(deposit) < 0) {
        setError(t('deposit_required'));
        setIsSubmitting(false);
        return;
      }

      // Validate that end date is after start date
      if (new Date(endDate) <= new Date(startDate)) {
        setError(t('end_date_after_start'));
        setIsSubmitting(false);
        return;
      }

      const result = await createLease({
        tenantId,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        rent: Number.parseFloat(rent),
        deposit: Number.parseFloat(deposit),
        securityDeposit: securityDeposit ? Number.parseFloat(securityDeposit) : undefined,
        petDeposit: petDeposit ? Number.parseFloat(petDeposit) : undefined,
      });

      if (result.success && result.lease) {
        if (onSuccess) {
          onSuccess();
        } else {
          router.push(`/${locale}/dashboard/tenants/${tenantId}`);
          router.refresh();
        }
      } else {
        setError(result.error || t('create_error'));
        setIsSubmitting(false);
      }
    } catch (err) {
      console.error('Error creating lease:', err);
      setError(t('create_error'));
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="rounded-xl bg-blue-50 p-6">
        <p className="text-lg text-gray-700">
          <span className="font-semibold">{t('creating_lease_for')}:</span> {tenantName}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <label htmlFor="startDate" className="mb-2 block text-lg font-semibold text-gray-800">
            {t('start_date')} <span className="text-red-600">*</span>
          </label>
          <input
            type="date"
            id="startDate"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            disabled={isSubmitting}
            className="w-full rounded-xl border-2 border-gray-200 bg-white px-6 py-4 text-lg text-gray-800 transition-all duration-300 hover:border-gray-300 focus:border-blue-600 focus:ring-4 focus:ring-blue-300 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            required
          />
          <p className="mt-2 text-sm text-gray-600">{t('start_date_help')}</p>
        </div>

        <div>
          <label htmlFor="endDate" className="mb-2 block text-lg font-semibold text-gray-800">
            {t('end_date')} <span className="text-red-600">*</span>
          </label>
          <input
            type="date"
            id="endDate"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            disabled={isSubmitting}
            className="w-full rounded-xl border-2 border-gray-200 bg-white px-6 py-4 text-lg text-gray-800 transition-all duration-300 hover:border-gray-300 focus:border-blue-600 focus:ring-4 focus:ring-blue-300 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            required
          />
          <p className="mt-2 text-sm text-gray-600">{t('end_date_help')}</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <label htmlFor="rent" className="mb-2 block text-lg font-semibold text-gray-800">
            {t('monthly_rent')} <span className="text-red-600">*</span>
          </label>
          <input
            type="number"
            id="rent"
            value={rent}
            onChange={(e) => setRent(e.target.value)}
            placeholder="1000.00"
            step="0.01"
            min="0"
            disabled={isSubmitting}
            className="w-full rounded-xl border-2 border-gray-200 bg-white px-6 py-4 text-lg text-gray-800 transition-all duration-300 placeholder:text-gray-400 hover:border-gray-300 focus:border-blue-600 focus:ring-4 focus:ring-blue-300 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            required
          />
          <p className="mt-2 text-sm text-gray-600">{t('rent_help')}</p>
        </div>

        <div>
          <label htmlFor="deposit" className="mb-2 block text-lg font-semibold text-gray-800">
            {t('general_deposit')} <span className="text-red-600">*</span>
          </label>
          <input
            type="number"
            id="deposit"
            value={deposit}
            onChange={(e) => setDeposit(e.target.value)}
            placeholder="1000.00"
            step="0.01"
            min="0"
            disabled={isSubmitting}
            className="w-full rounded-xl border-2 border-gray-200 bg-white px-6 py-4 text-lg text-gray-800 transition-all duration-300 placeholder:text-gray-400 hover:border-gray-300 focus:border-blue-600 focus:ring-4 focus:ring-blue-300 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            required
          />
          <p className="mt-2 text-sm text-gray-600">{t('general_deposit_help')}</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <label htmlFor="securityDeposit" className="mb-2 block text-lg font-semibold text-gray-800">
            {t('security_deposit')}
          </label>
          <input
            type="number"
            id="securityDeposit"
            value={securityDeposit}
            onChange={(e) => setSecurityDeposit(e.target.value)}
            placeholder="1500.00"
            step="0.01"
            min="0"
            disabled={isSubmitting}
            className="w-full rounded-xl border-2 border-gray-200 bg-white px-6 py-4 text-lg text-gray-800 transition-all duration-300 placeholder:text-gray-400 hover:border-gray-300 focus:border-blue-600 focus:ring-4 focus:ring-blue-300 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          />
          <p className="mt-2 text-sm text-gray-600">{t('security_deposit_help')}</p>
        </div>

        <div>
          <label htmlFor="petDeposit" className="mb-2 block text-lg font-semibold text-gray-800">
            {t('pet_deposit')}
          </label>
          <input
            type="number"
            id="petDeposit"
            value={petDeposit}
            onChange={(e) => setPetDeposit(e.target.value)}
            placeholder="500.00"
            step="0.01"
            min="0"
            disabled={isSubmitting}
            className="w-full rounded-xl border-2 border-gray-200 bg-white px-6 py-4 text-lg text-gray-800 transition-all duration-300 placeholder:text-gray-400 hover:border-gray-300 focus:border-blue-600 focus:ring-4 focus:ring-blue-300 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          />
          <p className="mt-2 text-sm text-gray-600">{t('pet_deposit_help')}</p>
        </div>
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
          className="rounded-xl bg-blue-600 px-8 py-4 text-xl font-semibold text-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:bg-blue-700 hover:shadow-xl focus:ring-4 focus:ring-blue-300 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
        >
          {isSubmitting ? t('creating') : t('create_lease')}
        </button>

        <button
          type="button"
          onClick={() => (onSuccess ? onSuccess() : router.back())}
          disabled={isSubmitting}
          className="rounded-xl border-2 border-gray-300 bg-white px-8 py-4 text-xl font-semibold text-gray-700 transition-all duration-300 hover:border-gray-400 hover:bg-gray-50 focus:ring-4 focus:ring-gray-300 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
        >
          {t('cancel')}
        </button>
      </div>
    </form>
  );
}
