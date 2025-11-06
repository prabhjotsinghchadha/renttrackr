'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { createProperty, createUnit } from '@/actions/PropertyActions';

type PropertyFormProps = {
  locale: string;
};

export function PropertyForm({ locale }: PropertyFormProps) {
  const router = useRouter();
  const t = useTranslations('Properties');
  const [address, setAddress] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [acquiredOn, setAcquiredOn] = useState('');
  const [principalAmount, setPrincipalAmount] = useState('');
  const [rateOfInterest, setRateOfInterest] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const unitIdCounter = useRef(0);
  const generateUnitId = useRef(() => {
    unitIdCounter.current += 1;
    return `unit-${unitIdCounter.current}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }).current;
  const [units, setUnits] = useState<Array<{ id: string; unitNumber: string; rentAmount: string }>>(
    () => [{ id: generateUnitId(), unitNumber: '', rentAmount: '' }],
  );

  const propertyTypes = [
    { value: 'single_family', label: t('property_types.single_family') },
    { value: 'condo', label: t('property_types.condo') },
    { value: 'townhouse', label: t('property_types.townhouse') },
    { value: 'multiunit', label: t('property_types.multiunit') },
    { value: 'apartment', label: t('property_types.apartment') },
    { value: 'duplex', label: t('property_types.duplex') },
    { value: 'residential', label: t('property_types.residential') },
    { value: 'retail', label: t('property_types.retail') },
    { value: 'commercial', label: t('property_types.commercial') },
    { value: 'warehouse', label: t('property_types.warehouse') },
  ];

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

      if (!propertyType) {
        setError(t('property_type_required'));
        setIsSubmitting(false);
        return;
      }

      const canHaveUnits = propertyType === 'multiunit' || propertyType === 'apartment';

      // Validate units if property can have units
      if (canHaveUnits) {
        const validUnits = units.filter(
          (unit) =>
            unit.unitNumber.trim() && unit.rentAmount && Number.parseFloat(unit.rentAmount) > 0,
        );

        if (validUnits.length === 0) {
          setError(t('at_least_one_unit_required'));
          setIsSubmitting(false);
          return;
        }
      }

      // Create the property first
      const result = await createProperty({
        address: address.trim(),
        propertyType,
        acquiredOn: acquiredOn ? new Date(acquiredOn) : undefined,
        principalAmount: principalAmount ? Number.parseFloat(principalAmount) : undefined,
        rateOfInterest: rateOfInterest ? Number.parseFloat(rateOfInterest) : undefined,
      });

      if (result.success && result.property) {
        const propertyId = result.property.id;

        // If property can have units, create them
        if (canHaveUnits) {
          const validUnits = units.filter(
            (unit) =>
              unit.unitNumber.trim() && unit.rentAmount && Number.parseFloat(unit.rentAmount) > 0,
          );

          // Create all units
          const unitPromises = validUnits.map((unit) =>
            createUnit({
              propertyId,
              unitNumber: unit.unitNumber.trim(),
              rentAmount: Number.parseFloat(unit.rentAmount),
            }),
          );

          const unitResults = await Promise.all(unitPromises);
          const failedUnits = unitResults.filter((r) => !r.success);

          if (failedUnits.length > 0) {
            console.error('Some units failed to create:', failedUnits);
            // Property was created but some units failed - still show success but warn user
            setError(t('property_created_units_partial'));
          }
        }

        // Redirect to properties list
        router.push(`/${locale}/dashboard/properties`);
        router.refresh();
      } else {
        console.error('❌ Form error:', result.error);
        setError(result.error || t('create_error'));
        setIsSubmitting(false);
      }
    } catch (err) {
      console.error('Error creating property:', err);
      setError(t('create_error'));
      setIsSubmitting(false);
    }
  };

  const canHaveUnits = propertyType === 'multiunit' || propertyType === 'apartment';
  const unitT = useTranslations('PropertyDetail');

  // Reset units when property type changes
  useEffect(() => {
    const canHaveUnits = propertyType === 'multiunit' || propertyType === 'apartment';
    if (canHaveUnits) {
      // If switching to a property type that can have units, ensure at least one unit field exists
      setUnits((prevUnits) => {
        if (prevUnits.length === 0 || prevUnits.every((u) => !u.unitNumber && !u.rentAmount)) {
          return [{ id: generateUnitId(), unitNumber: '', rentAmount: '' }];
        }
        return prevUnits;
      });
    } else {
      // If switching away from a property type that can have units, clear units
      setUnits([{ id: generateUnitId(), unitNumber: '', rentAmount: '' }]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [propertyType]);

  const addUnit = () => {
    setUnits([...units, { id: generateUnitId(), unitNumber: '', rentAmount: '' }]);
  };

  const removeUnit = (id: string) => {
    if (units.length > 1) {
      setUnits(units.filter((unit) => unit.id !== id));
    }
  };

  const updateUnit = (index: number, field: 'unitNumber' | 'rentAmount', value: string) => {
    const updatedUnits = [...units];
    const currentUnit = updatedUnits[index];
    if (currentUnit) {
      updatedUnits[index] = {
        id: currentUnit.id,
        unitNumber: field === 'unitNumber' ? value : currentUnit.unitNumber,
        rentAmount: field === 'rentAmount' ? value : currentUnit.rentAmount,
      };
      setUnits(updatedUnits);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="address" className="mb-2 block text-lg font-semibold text-gray-800">
          {t('property_address')} <span className="text-red-600">*</span>
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
        <label htmlFor="propertyType" className="mb-2 block text-lg font-semibold text-gray-800">
          {t('property_type')} <span className="text-red-600">*</span>
        </label>
        <select
          id="propertyType"
          value={propertyType}
          onChange={(e) => setPropertyType(e.target.value)}
          disabled={isSubmitting}
          className="w-full rounded-xl border-2 border-gray-200 bg-white px-6 py-4 text-lg text-gray-800 transition-all duration-300 hover:border-gray-300 focus:border-blue-600 focus:ring-4 focus:ring-blue-300 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          required
        >
          <option value="">{t('select_property_type')}</option>
          {propertyTypes.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
        <p className="mt-2 text-sm text-gray-600">{t('property_type_help')}</p>
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
        <label htmlFor="principalAmount" className="mb-2 block text-lg font-semibold text-gray-800">
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
        <label htmlFor="rateOfInterest" className="mb-2 block text-lg font-semibold text-gray-800">
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

      {canHaveUnits && (
        <div className="space-y-4 rounded-xl border-2 border-blue-200 bg-blue-50 p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800">{t('add_units')}</h3>
            <button
              type="button"
              onClick={addUnit}
              disabled={isSubmitting}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-all duration-300 hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            >
              {t('add_another_unit')}
            </button>
          </div>
          <p className="text-sm text-gray-600">{t('add_unit_description')}</p>

          {units.map((unit, index) => (
            <div key={unit.id} className="grid gap-4 rounded-lg bg-white p-4 md:grid-cols-3">
              <div>
                <label
                  htmlFor={`unitNumber-${index}`}
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  {unitT('unit_number')} <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  id={`unitNumber-${index}`}
                  value={unit.unitNumber}
                  onChange={(e) => updateUnit(index, 'unitNumber', e.target.value)}
                  placeholder={unitT('unit_number_placeholder')}
                  disabled={isSubmitting}
                  className="w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-2 text-gray-800 transition-all duration-300 placeholder:text-gray-400 hover:border-gray-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-300 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                  required={canHaveUnits}
                />
              </div>

              <div>
                <label
                  htmlFor={`rentAmount-${index}`}
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  {unitT('rent_amount')} <span className="text-red-600">*</span>
                </label>
                <input
                  type="number"
                  id={`rentAmount-${index}`}
                  value={unit.rentAmount}
                  onChange={(e) => updateUnit(index, 'rentAmount', e.target.value)}
                  placeholder={unitT('rent_amount_placeholder')}
                  disabled={isSubmitting}
                  step="0.01"
                  min="0"
                  className="w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-2 text-gray-800 transition-all duration-300 placeholder:text-gray-400 hover:border-gray-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-300 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                  required={canHaveUnits}
                />
              </div>

              <div className="flex items-end">
                {units.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeUnit(unit.id)}
                    disabled={isSubmitting}
                    className="w-full rounded-lg border-2 border-red-300 bg-white px-4 py-2 text-sm font-semibold text-red-600 transition-all duration-300 hover:border-red-400 hover:bg-red-50 focus:ring-4 focus:ring-red-300 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {t('remove')}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

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
          {isSubmitting ? t('creating') : t('create_property')}
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
