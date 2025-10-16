'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getUserProperties, getUserUnits } from '@/actions/PropertyActions';
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
  const tProperty = useTranslations('Properties');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [unitId, setUnitId] = useState('');
  const [propertyId, setPropertyId] = useState('');
  const [units, setUnits] = useState<Unit[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingUnits, setIsLoadingUnits] = useState(true);
  const [error, setError] = useState('');

  // Helper function to check if we should show warning (only for multi-unit properties without units)
  const shouldShowWarning = () => {
    if (properties.length === 0) {
      return true; // No properties at all
    }

    // Check if there are any multi-unit properties
    const multiUnitProperties = properties.filter(
      (p) =>
        p.propertyType === 'multiunit' ||
        p.propertyType === 'apartment' ||
        p.propertyType === 'duplex',
    );

    // Only show warning if ALL properties are multi-unit AND there are no units
    const allPropertiesAreMultiUnit = multiUnitProperties.length === properties.length;

    return allPropertiesAreMultiUnit && units.length === 0;
  };

  // Helper function to get properties that don't require units (single-family, condo, townhouse)
  const getSingleFamilyProperties = () => {
    return properties.filter(
      (p) =>
        p.propertyType === 'single_family' ||
        p.propertyType === 'condo' ||
        p.propertyType === 'townhouse',
    );
  };

  // Helper function to determine what message to show
  const getNoUnitsMessage = () => {
    if (properties.length === 0) {
      return {
        message: t('no_properties_description'),
        showLink: true,
      };
    }

    // For multi-unit properties without units
    return {
      message: t('no_units_description'),
      showLink: false,
    };
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [unitsResult, propertiesResult] = await Promise.all([
          getUserUnits(),
          getUserProperties(),
        ]);

        if (unitsResult.success && unitsResult.units) {
          setUnits(unitsResult.units as Unit[]);
        }

        if (propertiesResult.success && propertiesResult.properties) {
          setProperties(propertiesResult.properties);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(t('error_loading_units'));
      } finally {
        setIsLoadingUnits(false);
      }
    };

    fetchData();
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

      const result = await createTenant({
        propertyId: propertyId || undefined,
        unitId: unitId || undefined,
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

      {/* Property selector - for single-family properties */}
      {getSingleFamilyProperties().length > 0 && (
        <div>
          <label htmlFor="propertyId" className="mb-2 block text-lg font-semibold text-gray-800">
            {t('property')}{' '}
            {!unitId && <span className="text-sm text-gray-500">({t('for_single_family')})</span>}
          </label>
          {isLoadingUnits ? (
            <div className="w-full rounded-xl border-2 border-gray-200 bg-gray-50 px-6 py-4 text-lg text-gray-500">
              {t('loading_units')}
            </div>
          ) : (
            <select
              id="propertyId"
              value={propertyId}
              onChange={(e) => {
                setPropertyId(e.target.value);
                setUnitId(''); // Clear unit selection when property is selected
              }}
              disabled={isSubmitting || unitId !== ''}
              className="w-full rounded-xl border-2 border-gray-200 bg-white px-6 py-4 text-lg text-gray-800 transition-all duration-300 hover:border-gray-300 focus:border-blue-600 focus:ring-4 focus:ring-blue-300 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">{t('select_property')}</option>
              {getSingleFamilyProperties().map((property) => (
                <option key={property.id} value={property.id}>
                  {property.address} (
                  {property.propertyType === 'single_family'
                    ? tProperty('property_types.single_family')
                    : property.propertyType === 'condo'
                      ? tProperty('property_types.condo')
                      : tProperty('property_types.townhouse')}
                  )
                </option>
              ))}
            </select>
          )}
          <p className="mt-2 text-sm text-gray-600">{t('property_help')}</p>
        </div>
      )}

      {/* Unit selector - for multi-unit properties */}
      {units.length > 0 && (
        <div>
          <label htmlFor="unitId" className="mb-2 block text-lg font-semibold text-gray-800">
            {t('unit_optional')}{' '}
            {!propertyId && <span className="text-sm text-gray-500">({t('for_multi_unit')})</span>}
          </label>
          <select
            id="unitId"
            value={unitId}
            onChange={(e) => {
              setUnitId(e.target.value);
              setPropertyId(''); // Clear property selection when unit is selected
            }}
            disabled={isSubmitting || propertyId !== ''}
            className="w-full rounded-xl border-2 border-gray-200 bg-white px-6 py-4 text-lg text-gray-800 transition-all duration-300 hover:border-gray-300 focus:border-blue-600 focus:ring-4 focus:ring-blue-300 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
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
      )}

      {/* Warning message - only when no properties or all multi-unit without units */}
      {shouldShowWarning() && (
        <div className="rounded-xl border-2 border-yellow-200 bg-yellow-50 p-6">
          <p className="font-semibold text-yellow-800">{t('no_units_available')}</p>
          <p className="mt-1 text-sm text-yellow-700">{getNoUnitsMessage().message}</p>
          {getNoUnitsMessage().showLink && (
            <div className="mt-3">
              <a
                href={`/${locale}/dashboard/properties`}
                className="inline-flex items-center font-medium text-blue-600 hover:text-blue-700"
              >
                {t('go_to_properties')} →
              </a>
            </div>
          )}
        </div>
      )}

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
