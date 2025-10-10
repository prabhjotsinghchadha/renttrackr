'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getUserUnits } from '@/actions/PropertyActions';
import { createTenant } from '@/actions/TenantActions';

type TenantFormProps = {
  locale: string;
};

type Unit = {
  id: string;
  unitNumber: string;
  propertyAddress: string;
  rentAmount: number;
};

export function TenantForm({ locale }: TenantFormProps) {
  const router = useRouter();
  const t = useTranslations('Tenants');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [unitId, setUnitId] = useState('');
  const [units, setUnits] = useState<Unit[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingUnits, setIsLoadingUnits] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUnits = async () => {
      try {
        const result = await getUserUnits();
        if (result.success && result.units) {
          setUnits(result.units as Unit[]);
        }
      } catch (err) {
        console.error('Error fetching units:', err);
        setError(t('error_loading_units'));
      } finally {
        setIsLoadingUnits(false);
      }
    };

    fetchUnits();
  }, [t]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      if (!name.trim()) {
        setError(t('name_required'));
        setIsSubmitting(false);
        return;
      }

      if (!unitId) {
        setError(t('unit_required'));
        setIsSubmitting(false);
        return;
      }

      const result = await createTenant({
        unitId,
        name: name.trim(),
        phone: phone.trim() || undefined,
        email: email.trim() || undefined,
      });

      if (result.success && result.tenant) {
        // Redirect to the tenants list
        router.push(`/${locale}/dashboard/tenants`);
        router.refresh();
      } else {
        setError(result.error || t('create_error'));
        setIsSubmitting(false);
      }
    } catch (err) {
      console.error('Error creating tenant:', err);
      setError(t('create_error'));
      setIsSubmitting(false);
    }
  };

  if (isLoadingUnits) {
    return (
      <div className="py-12 text-center">
        <div className="mb-4 text-4xl">⏳</div>
        <p className="text-xl text-gray-600">{t('loading_units')}</p>
      </div>
    );
  }

  if (units.length === 0) {
    return (
      <div className="rounded-xl bg-yellow-50 p-8 text-center">
        <div className="mb-4 text-6xl">⚠️</div>
        <h3 className="mb-2 text-2xl font-semibold text-gray-800">{t('no_units_available')}</h3>
        <p className="mb-6 text-xl text-gray-600">{t('no_units_description')}</p>
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
        <label htmlFor="name" className="mb-2 block text-lg font-semibold text-gray-800">
          {t('tenant_name')} <span className="text-red-600">*</span>
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t('name_placeholder')}
          disabled={isSubmitting}
          className="w-full rounded-xl border-2 border-gray-200 bg-white px-6 py-4 text-lg text-gray-800 transition-all duration-300 placeholder:text-gray-400 hover:border-gray-300 focus:border-blue-600 focus:ring-4 focus:ring-blue-300 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          required
        />
        <p className="mt-2 text-sm text-gray-600">{t('name_help')}</p>
      </div>

      <div>
        <label htmlFor="unitId" className="mb-2 block text-lg font-semibold text-gray-800">
          {t('unit')} <span className="text-red-600">*</span>
        </label>
        <select
          id="unitId"
          value={unitId}
          onChange={(e) => setUnitId(e.target.value)}
          disabled={isSubmitting}
          className="w-full rounded-xl border-2 border-gray-200 bg-white px-6 py-4 text-lg text-gray-800 transition-all duration-300 hover:border-gray-300 focus:border-blue-600 focus:ring-4 focus:ring-blue-300 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          required
        >
          <option value="">{t('select_unit')}</option>
          {units.map((unit) => (
            <option key={unit.id} value={unit.id}>
              {unit.propertyAddress} - {t('unit_number')} {unit.unitNumber}
            </option>
          ))}
        </select>
        <p className="mt-2 text-sm text-gray-600">{t('unit_help')}</p>
      </div>

      <div>
        <label htmlFor="email" className="mb-2 block text-lg font-semibold text-gray-800">
          {t('email')}
        </label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t('email_placeholder')}
          disabled={isSubmitting}
          className="w-full rounded-xl border-2 border-gray-200 bg-white px-6 py-4 text-lg text-gray-800 transition-all duration-300 placeholder:text-gray-400 hover:border-gray-300 focus:border-blue-600 focus:ring-4 focus:ring-blue-300 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
        />
        <p className="mt-2 text-sm text-gray-600">{t('email_help')}</p>
      </div>

      <div>
        <label htmlFor="phone" className="mb-2 block text-lg font-semibold text-gray-800">
          {t('phone')}
        </label>
        <input
          type="tel"
          id="phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder={t('phone_placeholder')}
          disabled={isSubmitting}
          className="w-full rounded-xl border-2 border-gray-200 bg-white px-6 py-4 text-lg text-gray-800 transition-all duration-300 placeholder:text-gray-400 hover:border-gray-300 focus:border-blue-600 focus:ring-4 focus:ring-blue-300 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
        />
        <p className="mt-2 text-sm text-gray-600">{t('phone_help')}</p>
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
          {isSubmitting ? t('creating') : t('create_tenant')}
        </button>

        <button
          type="button"
          onClick={() => router.back()}
          disabled={isSubmitting}
          className="rounded-xl border-2 border-gray-300 bg-white px-8 py-4 text-xl font-semibold text-gray-700 transition-all duration-300 hover:border-gray-400 hover:bg-gray-50 focus:ring-4 focus:ring-gray-300 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
        >
          {t('cancel')}
        </button>
      </div>
    </form>
  );
}

