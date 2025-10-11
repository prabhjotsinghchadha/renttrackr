'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getLeasesWithTenantInfo } from '@/actions/LeaseActions';
import { createPayment } from '@/actions/PaymentActions';

type PaymentFormProps = {
  locale: string;
  onSuccess?: () => void;
};

type LeaseInfo = {
  id: string;
  tenantName: string;
  unitNumber: string;
  rent: number;
  startDate: Date;
  endDate: Date;
};

export function PaymentForm({ locale, onSuccess }: PaymentFormProps) {
  const router = useRouter();
  const t = useTranslations('Rents');
  const [leaseId, setLeaseId] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [lateFee, setLateFee] = useState('');
  const [leases, setLeases] = useState<LeaseInfo[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingLeases, setIsLoadingLeases] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchLeases = async () => {
      try {
        const result = await getLeasesWithTenantInfo();
        if (result.success && result.leases) {
          setLeases(result.leases as LeaseInfo[]);
        }
      } catch (err) {
        console.error('Error fetching leases:', err);
        setError(t('error_loading_leases'));
      } finally {
        setIsLoadingLeases(false);
      }
    };

    fetchLeases();
  }, [t]);

  const handleLeaseChange = (selectedLeaseId: string) => {
    setLeaseId(selectedLeaseId);
    // Auto-fill the amount with the lease rent
    const selectedLease = leases.find((l) => l.id === selectedLeaseId);
    if (selectedLease) {
      setAmount(selectedLease.rent.toString());
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      if (!leaseId) {
        setError(t('lease_required'));
        setIsSubmitting(false);
        return;
      }

      if (!amount || Number.parseFloat(amount) <= 0) {
        setError(t('amount_required'));
        setIsSubmitting(false);
        return;
      }

      const paymentDate = date ? new Date(date) : new Date();

      const result = await createPayment({
        leaseId,
        amount: Number.parseFloat(amount),
        date: paymentDate,
        lateFee: lateFee ? Number.parseFloat(lateFee) : undefined,
      });

      if (result.success && result.payment) {
        if (onSuccess) {
          onSuccess();
        } else {
          router.push(`/${locale}/dashboard/rents`);
          router.refresh();
        }
      } else {
        setError(result.error || t('create_error'));
        setIsSubmitting(false);
      }
    } catch (err) {
      console.error('Error creating payment:', err);
      setError(t('create_error'));
      setIsSubmitting(false);
    }
  };

  if (isLoadingLeases) {
    return (
      <div className="py-12 text-center">
        <div className="mb-4 text-4xl">⏳</div>
        <p className="text-xl text-gray-600">{t('loading_leases')}</p>
      </div>
    );
  }

  if (leases.length === 0) {
    return (
      <div className="rounded-xl bg-yellow-50 p-8 text-center">
        <div className="mb-4 text-6xl">⚠️</div>
        <h3 className="mb-2 text-2xl font-semibold text-gray-800">{t('no_leases_available')}</h3>
        <p className="mb-6 text-xl text-gray-600">{t('no_leases_description')}</p>
        <button
          type="button"
          onClick={() => router.push(`/${locale}/dashboard/tenants`)}
          className="rounded-xl bg-blue-600 px-8 py-4 text-xl font-semibold text-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:bg-blue-700 hover:shadow-xl focus:ring-4 focus:ring-blue-300 focus:outline-none"
        >
          {t('go_to_tenants')}
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="leaseId" className="mb-2 block text-lg font-semibold text-gray-800">
          {t('tenant')} <span className="text-red-600">*</span>
        </label>
        <select
          id="leaseId"
          value={leaseId}
          onChange={(e) => handleLeaseChange(e.target.value)}
          disabled={isSubmitting}
          className="w-full rounded-xl border-2 border-gray-200 bg-white px-6 py-4 text-lg text-gray-800 transition-all duration-300 hover:border-gray-300 focus:border-blue-600 focus:ring-4 focus:ring-blue-300 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          required
        >
          <option value="">{t('select_tenant')}</option>
          {leases.map((lease) => (
            <option key={lease.id} value={lease.id}>
              {lease.tenantName} - {t('unit_number')} {lease.unitNumber} (${lease.rent}/mo)
            </option>
          ))}
        </select>
        <p className="mt-2 text-sm text-gray-600">{t('tenant_help')}</p>
      </div>

      <div>
        <label htmlFor="amount" className="mb-2 block text-lg font-semibold text-gray-800">
          {t('payment_amount')} <span className="text-red-600">*</span>
        </label>
        <input
          type="number"
          id="amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="1000.00"
          step="0.01"
          min="0"
          disabled={isSubmitting}
          className="w-full rounded-xl border-2 border-gray-200 bg-white px-6 py-4 text-lg text-gray-800 transition-all duration-300 placeholder:text-gray-400 hover:border-gray-300 focus:border-blue-600 focus:ring-4 focus:ring-blue-300 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          required
        />
        <p className="mt-2 text-sm text-gray-600">{t('amount_help')}</p>
      </div>

      <div>
        <label htmlFor="date" className="mb-2 block text-lg font-semibold text-gray-800">
          {t('payment_date')} <span className="text-red-600">*</span>
        </label>
        <input
          type="date"
          id="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          disabled={isSubmitting}
          className="w-full rounded-xl border-2 border-gray-200 bg-white px-6 py-4 text-lg text-gray-800 transition-all duration-300 hover:border-gray-300 focus:border-blue-600 focus:ring-4 focus:ring-blue-300 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          required
        />
        <p className="mt-2 text-sm text-gray-600">{t('date_help')}</p>
      </div>

      <div>
        <label htmlFor="lateFee" className="mb-2 block text-lg font-semibold text-gray-800">
          {t('late_fee')}
        </label>
        <input
          type="number"
          id="lateFee"
          value={lateFee}
          onChange={(e) => setLateFee(e.target.value)}
          placeholder="0.00"
          step="0.01"
          min="0"
          disabled={isSubmitting}
          className="w-full rounded-xl border-2 border-gray-200 bg-white px-6 py-4 text-lg text-gray-800 transition-all duration-300 placeholder:text-gray-400 hover:border-gray-300 focus:border-blue-600 focus:ring-4 focus:ring-blue-300 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
        />
        <p className="mt-2 text-sm text-gray-600">{t('late_fee_help')}</p>
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
          {isSubmitting ? t('recording') : t('record_payment')}
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
