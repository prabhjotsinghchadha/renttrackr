'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getUserProperties, getUserUnits } from '@/actions/PropertyActions';
import { createRenovation } from '@/actions/RenovationActions';

type RenovationFormProps = {
  locale: string;
  onSuccess?: () => void;
};

type Property = {
  id: string;
  address: string;
};

type Unit = {
  id: string;
  unitNumber: string;
  propertyId: string;
  propertyAddress: string;
};

export function RenovationForm({ locale, onSuccess }: RenovationFormProps) {
  const router = useRouter();
  const t = useTranslations('Renovations');
  const [propertyId, setPropertyId] = useState('');
  const [unitId, setUnitId] = useState('');
  const [title, setTitle] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [totalCost, setTotalCost] = useState('');
  const [notes, setNotes] = useState('');
  const [properties, setProperties] = useState<Property[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingProperties, setIsLoadingProperties] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [propertiesResult, unitsResult] = await Promise.all([
          getUserProperties(),
          getUserUnits(),
        ]);

        if (propertiesResult.success && propertiesResult.properties) {
          setProperties(propertiesResult.properties as Property[]);
        }

        if (unitsResult.success && unitsResult.units) {
          setUnits(unitsResult.units as Unit[]);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(t('error_loading_data'));
      } finally {
        setIsLoadingProperties(false);
      }
    };

    fetchData();
  }, [t]);

  const handlePropertyChange = (selectedPropertyId: string) => {
    setPropertyId(selectedPropertyId);
    setUnitId(''); // Reset unit selection when property changes
  };

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

      if (!title.trim()) {
        setError(t('title_required'));
        setIsSubmitting(false);
        return;
      }

      // Validate that end date is after start date if both are provided
      if (startDate && endDate && new Date(endDate) <= new Date(startDate)) {
        setError(t('end_date_after_start'));
        setIsSubmitting(false);
        return;
      }

      const result = await createRenovation({
        propertyId,
        unitId: unitId || undefined,
        title: title.trim(),
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        totalCost: totalCost ? Number.parseFloat(totalCost) : undefined,
        notes: notes.trim() || undefined,
      });

      if (result.success && result.renovation) {
        if (onSuccess) {
          onSuccess();
        } else {
          router.push(`/${locale}/dashboard/renovations`);
          router.refresh();
        }
      } else {
        setError(result.error || t('create_error'));
        setIsSubmitting(false);
      }
    } catch (err) {
      console.error('Error creating renovation:', err);
      setError(t('create_error'));
      setIsSubmitting(false);
    }
  };

  if (isLoadingProperties) {
    return (
      <div className="py-12 text-center">
        <div className="mb-4 text-4xl">⏳</div>
        <p className="text-xl text-gray-600">{t('loading_data')}</p>
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

  // Filter units for selected property
  const availableUnits = units.filter((unit) => unit.propertyId === propertyId);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="propertyId" className="mb-2 block text-lg font-semibold text-gray-800">
          {t('property')} <span className="text-red-600">*</span>
        </label>
        <select
          id="propertyId"
          value={propertyId}
          onChange={(e) => handlePropertyChange(e.target.value)}
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

      {propertyId && availableUnits.length > 0 && (
        <div>
          <label htmlFor="unitId" className="mb-2 block text-lg font-semibold text-gray-800">
            {t('unit')} <span className="text-gray-500">({t('optional')})</span>
          </label>
          <select
            id="unitId"
            value={unitId}
            onChange={(e) => setUnitId(e.target.value)}
            disabled={isSubmitting}
            className="w-full rounded-xl border-2 border-gray-200 bg-white px-6 py-4 text-lg text-gray-800 transition-all duration-300 hover:border-gray-300 focus:border-blue-600 focus:ring-4 focus:ring-blue-300 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="">{t('select_unit')}</option>
            {availableUnits.map((unit) => (
              <option key={unit.id} value={unit.id}>
                {t('unit_number')} {unit.unitNumber}
              </option>
            ))}
          </select>
          <p className="mt-2 text-sm text-gray-600">{t('unit_help')}</p>
        </div>
      )}

      <div>
        <label htmlFor="title" className="mb-2 block text-lg font-semibold text-gray-800">
          {t('renovation_title')} <span className="text-red-600">*</span>
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={t('title_placeholder')}
          disabled={isSubmitting}
          className="w-full rounded-xl border-2 border-gray-200 bg-white px-6 py-4 text-lg text-gray-800 transition-all duration-300 placeholder:text-gray-400 hover:border-gray-300 focus:border-blue-600 focus:ring-4 focus:ring-blue-300 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          required
        />
        <p className="mt-2 text-sm text-gray-600">{t('title_help')}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <label htmlFor="startDate" className="mb-2 block text-lg font-semibold text-gray-800">
            {t('start_date')} <span className="text-gray-500">({t('optional')})</span>
          </label>
          <input
            type="date"
            id="startDate"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            disabled={isSubmitting}
            className="w-full rounded-xl border-2 border-gray-200 bg-white px-6 py-4 text-lg text-gray-800 transition-all duration-300 hover:border-gray-300 focus:border-blue-600 focus:ring-4 focus:ring-blue-300 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          />
          <p className="mt-2 text-sm text-gray-600">{t('start_date_help')}</p>
        </div>

        <div>
          <label htmlFor="endDate" className="mb-2 block text-lg font-semibold text-gray-800">
            {t('end_date')} <span className="text-gray-500">({t('optional')})</span>
          </label>
          <input
            type="date"
            id="endDate"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            disabled={isSubmitting}
            className="w-full rounded-xl border-2 border-gray-200 bg-white px-6 py-4 text-lg text-gray-800 transition-all duration-300 hover:border-gray-300 focus:border-blue-600 focus:ring-4 focus:ring-blue-300 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          />
          <p className="mt-2 text-sm text-gray-600">{t('end_date_help')}</p>
        </div>
      </div>

      <div>
        <label htmlFor="totalCost" className="mb-2 block text-lg font-semibold text-gray-800">
          {t('total_cost')} <span className="text-gray-500">({t('optional')})</span>
        </label>
        <input
          type="number"
          id="totalCost"
          value={totalCost}
          onChange={(e) => setTotalCost(e.target.value)}
          placeholder="0.00"
          step="0.01"
          min="0"
          disabled={isSubmitting}
          className="w-full rounded-xl border-2 border-gray-200 bg-white px-6 py-4 text-lg text-gray-800 transition-all duration-300 placeholder:text-gray-400 hover:border-gray-300 focus:border-blue-600 focus:ring-4 focus:ring-blue-300 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
        />
        <p className="mt-2 text-sm text-gray-600">{t('total_cost_help')}</p>
      </div>

      <div>
        <label htmlFor="notes" className="mb-2 block text-lg font-semibold text-gray-800">
          {t('notes')} <span className="text-gray-500">({t('optional')})</span>
        </label>
        <textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder={t('notes_placeholder')}
          rows={4}
          disabled={isSubmitting}
          className="w-full rounded-xl border-2 border-gray-200 bg-white px-6 py-4 text-lg text-gray-800 transition-all duration-300 placeholder:text-gray-400 hover:border-gray-300 focus:border-blue-600 focus:ring-4 focus:ring-blue-300 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
        />
        <p className="mt-2 text-sm text-gray-600">{t('notes_help')}</p>
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
          {isSubmitting ? t('creating') : t('create_renovation')}
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
