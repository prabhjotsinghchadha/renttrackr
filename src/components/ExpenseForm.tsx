'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createExpense } from '@/actions/ExpenseActions';
import { getUserProperties } from '@/actions/PropertyActions';

type ExpenseFormProps = {
  locale: string;
  onSuccess?: () => void;
};

type Property = {
  id: string;
  address: string;
};

export function ExpenseForm({ locale, onSuccess }: ExpenseFormProps) {
  const router = useRouter();
  const t = useTranslations('Expenses');
  const [propertyId, setPropertyId] = useState('');
  const [type, setType] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingProperties, setIsLoadingProperties] = useState(true);
  const [error, setError] = useState('');

  // Common expense types
  const expenseTypes = [
    'Maintenance',
    'Repair',
    'Association Fee',
    'Insurance',
    'Property Tax',
    'Utilities',
    'Landscaping',
    'Cleaning',
    'Advertising',
    'Legal',
    'Accounting',
    'Other',
  ];

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const result = await getUserProperties();
        if (result.success && result.properties) {
          setProperties(result.properties as Property[]);
        }
      } catch (err) {
        console.error('Error fetching properties:', err);
        setError(t('error_loading_properties'));
      } finally {
        setIsLoadingProperties(false);
      }
    };

    fetchProperties();
  }, [t]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      if (!propertyId) {
        setError(t('property_required'));
        setIsSubmitting(false);
        return;
      }

      if (!type.trim()) {
        setError(t('type_required'));
        setIsSubmitting(false);
        return;
      }

      if (!amount || Number.parseFloat(amount) <= 0) {
        setError(t('amount_required'));
        setIsSubmitting(false);
        return;
      }

      const expenseDate = date ? new Date(date) : new Date();

      const result = await createExpense({
        propertyId,
        type: type.trim(),
        amount: Number.parseFloat(amount),
        date: expenseDate,
      });

      if (result.success && result.expense) {
        if (onSuccess) {
          onSuccess();
        } else {
          router.push(`/${locale}/dashboard/expenses`);
          router.refresh();
        }
      } else {
        setError(result.error || t('create_error'));
        setIsSubmitting(false);
      }
    } catch (err) {
      console.error('Error creating expense:', err);
      setError(t('create_error'));
      setIsSubmitting(false);
    }
  };

  if (isLoadingProperties) {
    return (
      <div className="py-12 text-center">
        <div className="mb-4 text-4xl">⏳</div>
        <p className="text-xl text-gray-600">{t('loading_properties')}</p>
      </div>
    );
  }

  if (properties.length === 0) {
    return (
      <div className="rounded-xl bg-yellow-50 p-8 text-center">
        <div className="mb-4 text-6xl">⚠️</div>
        <h3 className="mb-2 text-2xl font-semibold text-gray-800">
          {t('no_properties_available')}
        </h3>
        <p className="mb-6 text-xl text-gray-600">{t('no_properties_description')}</p>
        <button
          type="button"
          onClick={() => router.push(`/${locale}/dashboard/properties`)}
          className="rounded-xl bg-blue-600 px-8 py-4 text-xl font-semibold text-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:bg-blue-700 hover:shadow-xl focus:ring-4 focus:ring-blue-300 focus:outline-none"
        >
          {t('go_to_properties')}
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="propertyId" className="mb-2 block text-lg font-semibold text-gray-800">
          {t('property')} <span className="text-red-600">*</span>
        </label>
        <select
          id="propertyId"
          value={propertyId}
          onChange={(e) => setPropertyId(e.target.value)}
          disabled={isSubmitting}
          className="w-full rounded-xl border-2 border-gray-200 bg-white px-6 py-4 text-lg text-gray-800 transition-all duration-300 hover:border-gray-300 focus:border-blue-600 focus:ring-4 focus:ring-blue-300 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          required
        >
          <option value="">{t('select_property')}</option>
          {properties.map((property) => (
            <option key={property.id} value={property.id}>
              {property.address}
            </option>
          ))}
        </select>
        <p className="mt-2 text-sm text-gray-600">{t('property_help')}</p>
      </div>

      <div>
        <label htmlFor="type" className="mb-2 block text-lg font-semibold text-gray-800">
          {t('expense_type')} <span className="text-red-600">*</span>
        </label>
        <select
          id="type"
          value={type}
          onChange={(e) => setType(e.target.value)}
          disabled={isSubmitting}
          className="w-full rounded-xl border-2 border-gray-200 bg-white px-6 py-4 text-lg text-gray-800 transition-all duration-300 hover:border-gray-300 focus:border-blue-600 focus:ring-4 focus:ring-blue-300 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          required
        >
          <option value="">{t('select_type')}</option>
          {expenseTypes.map((expenseType) => (
            <option key={expenseType} value={expenseType}>
              {expenseType}
            </option>
          ))}
        </select>
        <p className="mt-2 text-sm text-gray-600">{t('type_help')}</p>
      </div>

      <div>
        <label htmlFor="amount" className="mb-2 block text-lg font-semibold text-gray-800">
          {t('expense_amount')} <span className="text-red-600">*</span>
        </label>
        <input
          type="number"
          id="amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="100.00"
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
          {t('expense_date')} <span className="text-red-600">*</span>
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
          {isSubmitting ? t('adding') : t('add_expense')}
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
