'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import {
  createUnit,
  deleteUnit,
  getPropertyById,
  updateProperty,
  updateUnit,
} from '@/actions/PropertyActions';

type EditPropertyFormProps = {
  propertyId: string;
  currentAddress: string;
  currentPropertyType?: string;
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
  currentPropertyType,
  currentAcquiredOn,
  currentPrincipalAmount,
  currentRateOfInterest,
  locale,
  onSuccess,
  onCancel,
}: EditPropertyFormProps) {
  const router = useRouter();
  const t = useTranslations('PropertyDetail');
  const unitT = useTranslations('PropertyDetail');
  const propertiesT = useTranslations('Properties');
  const [address, setAddress] = useState(currentAddress);
  const [propertyType, setPropertyType] = useState(currentPropertyType || '');
  const [acquiredOn, setAcquiredOn] = useState(
    currentAcquiredOn ? currentAcquiredOn.toISOString().split('T')[0] : '',
  );
  const [principalAmount, setPrincipalAmount] = useState(currentPrincipalAmount?.toString() || '');
  const [rateOfInterest, setRateOfInterest] = useState(currentRateOfInterest?.toString() || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const unitIdCounter = useRef(0);
  const generateUnitId = useRef(() => {
    unitIdCounter.current += 1;
    return `unit-${unitIdCounter.current}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }).current;
  const [units, setUnits] = useState<
    Array<{ id: string; unitId?: string; unitNumber: string; rentAmount: string }>
  >([]);
  const [isLoadingUnits, setIsLoadingUnits] = useState(true);

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

  // Fetch existing units when component mounts or property type changes
  useEffect(() => {
    const fetchUnits = async () => {
      const canHaveUnits = propertyType === 'multiunit' || propertyType === 'apartment';
      if (canHaveUnits) {
        setIsLoadingUnits(true);
        try {
          const result = await getPropertyById(propertyId);
          if (result.success && result.units) {
            const formattedUnits = result.units.map((unit: any) => ({
              id: generateUnitId(),
              unitId: unit.id,
              unitNumber: unit.unitNumber || '',
              rentAmount: unit.rentAmount?.toString() || '',
            }));
            // If no units exist, add one empty unit
            setUnits(
              formattedUnits.length > 0
                ? formattedUnits
                : [{ id: generateUnitId(), unitNumber: '', rentAmount: '' }],
            );
          } else {
            setUnits([{ id: generateUnitId(), unitNumber: '', rentAmount: '' }]);
          }
        } catch (err) {
          console.error('Error fetching units:', err);
          setUnits([{ id: generateUnitId(), unitNumber: '', rentAmount: '' }]);
        } finally {
          setIsLoadingUnits(false);
        }
      } else {
        setUnits([]);
        setIsLoadingUnits(false);
      }
    };

    fetchUnits();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [propertyType, propertyId]);

  // Reset units when property type changes
  useEffect(() => {
    const canHaveUnits = propertyType === 'multiunit' || propertyType === 'apartment';
    if (!canHaveUnits) {
      setUnits([]);
    } else if (units.length === 0) {
      setUnits([{ id: generateUnitId(), unitNumber: '', rentAmount: '' }]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [propertyType]);

  const canHaveUnits = propertyType === 'multiunit' || propertyType === 'apartment';

  const addUnit = () => {
    setUnits([...units, { id: generateUnitId(), unitNumber: '', rentAmount: '' }]);
  };

  const removeUnit = (id: string) => {
    if (units.length > 1) {
      setUnits(units.filter((unit) => unit.id !== id));
    }
  };

  const updateUnitField = (index: number, field: 'unitNumber' | 'rentAmount', value: string) => {
    const updatedUnits = [...units];
    const currentUnit = updatedUnits[index];
    if (currentUnit) {
      updatedUnits[index] = {
        id: currentUnit.id,
        unitId: currentUnit.unitId,
        unitNumber: field === 'unitNumber' ? value : currentUnit.unitNumber,
        rentAmount: field === 'rentAmount' ? value : currentUnit.rentAmount,
      };
      setUnits(updatedUnits);
    }
  };

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

      // Validate units if property can have units
      if (canHaveUnits) {
        const validUnits = units.filter(
          (unit) =>
            unit.unitNumber.trim() && unit.rentAmount && Number.parseFloat(unit.rentAmount) > 0,
        );

        if (validUnits.length === 0) {
          setError(propertiesT('at_least_one_unit_required'));
          setIsSubmitting(false);
          return;
        }
      }

      const result = await updateProperty(propertyId, {
        address: address.trim(),
        propertyType: propertyType || undefined,
        acquiredOn: acquiredOn ? new Date(acquiredOn) : undefined,
        principalAmount: principalAmount ? Number.parseFloat(principalAmount) : undefined,
        rateOfInterest: rateOfInterest ? Number.parseFloat(rateOfInterest) : undefined,
      });

      if (result.success && result.property) {
        // Handle units if property can have units
        if (canHaveUnits) {
          const validUnits = units.filter(
            (unit) =>
              unit.unitNumber.trim() && unit.rentAmount && Number.parseFloat(unit.rentAmount) > 0,
          );

          // Get existing units to compare
          const existingUnitsResult = await getPropertyById(propertyId);
          const existingUnits = existingUnitsResult.success ? existingUnitsResult.units || [] : [];

          // Update or create units
          for (const unit of validUnits) {
            if (unit.unitId) {
              // Update existing unit
              await updateUnit(unit.unitId, {
                unitNumber: unit.unitNumber.trim(),
                rentAmount: Number.parseFloat(unit.rentAmount),
              });
            } else {
              // Create new unit
              await createUnit({
                propertyId,
                unitNumber: unit.unitNumber.trim(),
                rentAmount: Number.parseFloat(unit.rentAmount),
              });
            }
          }

          // Delete units that were removed
          const currentUnitIds = validUnits.map((u) => u.unitId).filter(Boolean) as string[];
          const unitsToDelete = existingUnits
            .map((u: any) => u.id)
            .filter((id: string) => !currentUnitIds.includes(id));

          for (const unitId of unitsToDelete) {
            await deleteUnit(unitId);
          }
        }

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
            <label
              htmlFor="propertyType"
              className="mb-2 block text-lg font-semibold text-gray-800"
            >
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

          {canHaveUnits && !isLoadingUnits && (
            <div className="space-y-4 rounded-xl border-2 border-blue-200 bg-blue-50 p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800">{propertiesT('add_units')}</h3>
                <button
                  type="button"
                  onClick={addUnit}
                  disabled={isSubmitting}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-all duration-300 hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {propertiesT('add_another_unit')}
                </button>
              </div>
              <p className="text-sm text-gray-600">{propertiesT('add_unit_description')}</p>

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
                      onChange={(e) => updateUnitField(index, 'unitNumber', e.target.value)}
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
                      onChange={(e) => updateUnitField(index, 'rentAmount', e.target.value)}
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
                        {propertiesT('remove')}
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
