'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createParkingPermit } from '@/actions/ParkingActions';
import { getUserProperties, getUserUnits } from '@/actions/PropertyActions';
import { getUserTenants } from '@/actions/TenantActions';

type ParkingFormProps = {
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

type Tenant = {
  id: string;
  name: string;
  unitId: string;
  unitNumber: string;
  propertyAddress: string;
};

export function ParkingForm({ locale, onSuccess }: ParkingFormProps) {
  const router = useRouter();
  const t = useTranslations('Parking');
  const [propertyId, setPropertyId] = useState('');
  const [tenantId, setTenantId] = useState('');
  const [building, setBuilding] = useState('');
  const [permitNumber, setPermitNumber] = useState('');
  const [status, setStatus] = useState('Active');
  const [vehicleMake, setVehicleMake] = useState('');
  const [vehicleModel, setVehicleModel] = useState('');
  const [vehicleYear, setVehicleYear] = useState('');
  const [vehicleColor, setVehicleColor] = useState('');
  const [licensePlate, setLicensePlate] = useState('');
  const [comments, setComments] = useState('');
  const [properties, setProperties] = useState<Property[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [error, setError] = useState('');

  // Common vehicle makes for dropdown
  const vehicleMakes = [
    'Toyota',
    'Honda',
    'Ford',
    'Chevrolet',
    'Nissan',
    'Hyundai',
    'Kia',
    'Volkswagen',
    'BMW',
    'Mercedes-Benz',
    'Audi',
    'Subaru',
    'Mazda',
    'Jeep',
    'Ram',
    'GMC',
    'Other',
  ];

  // Status options
  const statusOptions = ['Active', 'Cancelled', 'Suspended', 'Expired'];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [propertiesResult, tenantsResult] = await Promise.all([
          getUserProperties(),
          getUserTenants(),
        ]);

        if (propertiesResult.success && propertiesResult.properties) {
          setProperties(propertiesResult.properties as Property[]);
        }

        if (tenantsResult.success && tenantsResult.tenants) {
          // Get units to add property info to tenants
          const unitsResult = await getUserUnits();
          if (unitsResult.success && unitsResult.units) {
            const units = unitsResult.units as Unit[];
            const tenantsWithInfo = tenantsResult.tenants.map((tenant: any) => {
              const unit = units.find((u) => u.id === tenant.unitId);
              return {
                ...tenant,
                unitNumber: unit?.unitNumber || 'Unknown',
                propertyAddress: unit?.propertyAddress || 'Unknown',
              };
            });
            setTenants(tenantsWithInfo);
          }
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(t('error_loading_data'));
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchData();
  }, [t]);

  const handlePropertyChange = (selectedPropertyId: string) => {
    setPropertyId(selectedPropertyId);
    setTenantId(''); // Reset tenant selection when property changes
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

      if (!permitNumber.trim()) {
        setError(t('permit_number_required'));
        setIsSubmitting(false);
        return;
      }

      const result = await createParkingPermit({
        propertyId,
        tenantId: tenantId || undefined,
        building: building.trim() || undefined,
        permitNumber: permitNumber.trim(),
        status,
        vehicleMake: vehicleMake.trim() || undefined,
        vehicleModel: vehicleModel.trim() || undefined,
        vehicleYear: vehicleYear.trim() || undefined,
        vehicleColor: vehicleColor.trim() || undefined,
        licensePlate: licensePlate.trim() || undefined,
        comments: comments.trim() || undefined,
      });

      if (result.success && result.permit) {
        if (onSuccess) {
          onSuccess();
        } else {
          router.push(`/${locale}/dashboard/parking`);
          router.refresh();
        }
      } else {
        setError(result.error || t('create_error'));
        setIsSubmitting(false);
      }
    } catch (err) {
      console.error('Error creating parking permit:', err);
      setError(t('create_error'));
      setIsSubmitting(false);
    }
  };

  if (isLoadingData) {
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

  // Filter tenants for selected property
  const availableTenants = tenants.filter((tenant) => {
    const property = properties.find((p) => p.id === propertyId);
    return property && tenant.propertyAddress === property.address;
  });

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

      {propertyId && availableTenants.length > 0 && (
        <div>
          <label htmlFor="tenantId" className="mb-2 block text-lg font-semibold text-gray-800">
            {t('tenant')} <span className="text-gray-500">({t('optional')})</span>
          </label>
          <select
            id="tenantId"
            value={tenantId}
            onChange={(e) => setTenantId(e.target.value)}
            disabled={isSubmitting}
            className="w-full rounded-xl border-2 border-gray-200 bg-white px-6 py-4 text-lg text-gray-800 transition-all duration-300 hover:border-gray-300 focus:border-blue-600 focus:ring-4 focus:ring-blue-300 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="">{t('select_tenant')}</option>
            {availableTenants.map((tenant) => (
              <option key={tenant.id} value={tenant.id}>
                {tenant.name} - {t('unit_number')} {tenant.unitNumber}
              </option>
            ))}
          </select>
          <p className="mt-2 text-sm text-gray-600">{t('tenant_help')}</p>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <label htmlFor="building" className="mb-2 block text-lg font-semibold text-gray-800">
            {t('building')} <span className="text-gray-500">({t('optional')})</span>
          </label>
          <input
            type="text"
            id="building"
            value={building}
            onChange={(e) => setBuilding(e.target.value)}
            placeholder={t('building_placeholder')}
            disabled={isSubmitting}
            className="w-full rounded-xl border-2 border-gray-200 bg-white px-6 py-4 text-lg text-gray-800 transition-all duration-300 placeholder:text-gray-400 hover:border-gray-300 focus:border-blue-600 focus:ring-4 focus:ring-blue-300 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          />
          <p className="mt-2 text-sm text-gray-600">{t('building_help')}</p>
        </div>

        <div>
          <label htmlFor="permitNumber" className="mb-2 block text-lg font-semibold text-gray-800">
            {t('permit_number')} <span className="text-red-600">*</span>
          </label>
          <input
            type="text"
            id="permitNumber"
            value={permitNumber}
            onChange={(e) => setPermitNumber(e.target.value)}
            placeholder={t('permit_number_placeholder')}
            disabled={isSubmitting}
            className="w-full rounded-xl border-2 border-gray-200 bg-white px-6 py-4 text-lg text-gray-800 transition-all duration-300 placeholder:text-gray-400 hover:border-gray-300 focus:border-blue-600 focus:ring-4 focus:ring-blue-300 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            required
          />
          <p className="mt-2 text-sm text-gray-600">{t('permit_number_help')}</p>
        </div>
      </div>

      <div>
        <label htmlFor="status" className="mb-2 block text-lg font-semibold text-gray-800">
          {t('status')}
        </label>
        <select
          id="status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          disabled={isSubmitting}
          className="w-full rounded-xl border-2 border-gray-200 bg-white px-6 py-4 text-lg text-gray-800 transition-all duration-300 hover:border-gray-300 focus:border-blue-600 focus:ring-4 focus:ring-blue-300 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
        >
          {statusOptions.map((statusOption) => (
            <option key={statusOption} value={statusOption}>
              {statusOption}
            </option>
          ))}
        </select>
        <p className="mt-2 text-sm text-gray-600">{t('status_help')}</p>
      </div>

      <div className="rounded-xl bg-blue-50 p-6">
        <h3 className="mb-4 text-xl font-semibold text-gray-800">{t('vehicle_information')}</h3>
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label htmlFor="vehicleMake" className="mb-2 block text-lg font-semibold text-gray-800">
              {t('vehicle_make')} <span className="text-gray-500">({t('optional')})</span>
            </label>
            <select
              id="vehicleMake"
              value={vehicleMake}
              onChange={(e) => setVehicleMake(e.target.value)}
              disabled={isSubmitting}
              className="w-full rounded-xl border-2 border-gray-200 bg-white px-6 py-4 text-lg text-gray-800 transition-all duration-300 hover:border-gray-300 focus:border-blue-600 focus:ring-4 focus:ring-blue-300 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">{t('select_make')}</option>
              {vehicleMakes.map((make) => (
                <option key={make} value={make}>
                  {make}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="vehicleModel"
              className="mb-2 block text-lg font-semibold text-gray-800"
            >
              {t('vehicle_model')} <span className="text-gray-500">({t('optional')})</span>
            </label>
            <input
              type="text"
              id="vehicleModel"
              value={vehicleModel}
              onChange={(e) => setVehicleModel(e.target.value)}
              placeholder={t('vehicle_model_placeholder')}
              disabled={isSubmitting}
              className="w-full rounded-xl border-2 border-gray-200 bg-white px-6 py-4 text-lg text-gray-800 transition-all duration-300 placeholder:text-gray-400 hover:border-gray-300 focus:border-blue-600 focus:ring-4 focus:ring-blue-300 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          <div>
            <label htmlFor="vehicleYear" className="mb-2 block text-lg font-semibold text-gray-800">
              {t('vehicle_year')} <span className="text-gray-500">({t('optional')})</span>
            </label>
            <input
              type="text"
              id="vehicleYear"
              value={vehicleYear}
              onChange={(e) => setVehicleYear(e.target.value)}
              placeholder="2020"
              maxLength={4}
              disabled={isSubmitting}
              className="w-full rounded-xl border-2 border-gray-200 bg-white px-6 py-4 text-lg text-gray-800 transition-all duration-300 placeholder:text-gray-400 hover:border-gray-300 focus:border-blue-600 focus:ring-4 focus:ring-blue-300 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          <div>
            <label
              htmlFor="vehicleColor"
              className="mb-2 block text-lg font-semibold text-gray-800"
            >
              {t('vehicle_color')} <span className="text-gray-500">({t('optional')})</span>
            </label>
            <input
              type="text"
              id="vehicleColor"
              value={vehicleColor}
              onChange={(e) => setVehicleColor(e.target.value)}
              placeholder={t('vehicle_color_placeholder')}
              disabled={isSubmitting}
              className="w-full rounded-xl border-2 border-gray-200 bg-white px-6 py-4 text-lg text-gray-800 transition-all duration-300 placeholder:text-gray-400 hover:border-gray-300 focus:border-blue-600 focus:ring-4 focus:ring-blue-300 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          <div className="md:col-span-2">
            <label
              htmlFor="licensePlate"
              className="mb-2 block text-lg font-semibold text-gray-800"
            >
              {t('license_plate')} <span className="text-gray-500">({t('optional')})</span>
            </label>
            <input
              type="text"
              id="licensePlate"
              value={licensePlate}
              onChange={(e) => setLicensePlate(e.target.value.toUpperCase())}
              placeholder={t('license_plate_placeholder')}
              disabled={isSubmitting}
              className="w-full rounded-xl border-2 border-gray-200 bg-white px-6 py-4 text-lg text-gray-800 transition-all duration-300 placeholder:text-gray-400 hover:border-gray-300 focus:border-blue-600 focus:ring-4 focus:ring-blue-300 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
        </div>
      </div>

      <div>
        <label htmlFor="comments" className="mb-2 block text-lg font-semibold text-gray-800">
          {t('comments')} <span className="text-gray-500">({t('optional')})</span>
        </label>
        <textarea
          id="comments"
          value={comments}
          onChange={(e) => setComments(e.target.value)}
          placeholder={t('comments_placeholder')}
          rows={4}
          disabled={isSubmitting}
          className="w-full rounded-xl border-2 border-gray-200 bg-white px-6 py-4 text-lg text-gray-800 transition-all duration-300 placeholder:text-gray-400 hover:border-gray-300 focus:border-blue-600 focus:ring-4 focus:ring-blue-300 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
        />
        <p className="mt-2 text-sm text-gray-600">{t('comments_help')}</p>
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
          {isSubmitting ? t('creating') : t('create_permit')}
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
