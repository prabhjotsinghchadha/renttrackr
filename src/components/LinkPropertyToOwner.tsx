'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { addPropertyOwner, getUnlinkedProperties, getUserOwners } from '@/actions/OwnerActions';

type Property = {
  id: string;
  address: string;
  propertyType?: string | null;
};

type Owner = {
  id: string;
  name: string;
  type: string;
  role: string;
};

export function LinkPropertyToOwner({
  onSuccess,
  onCancel,
}: {
  onSuccess?: () => void;
  onCancel?: () => void;
}) {
  const t = useTranslations('Owners');
  const [unlinkedProperties, setUnlinkedProperties] = useState<Property[]>([]);
  const [owners, setOwners] = useState<Owner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>('');
  const [selectedOwnerId, setSelectedOwnerId] = useState<string>('');
  const [ownershipPercentage, setOwnershipPercentage] = useState<string>('100');
  const [isLinking, setIsLinking] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [propertiesResult, ownersResult] = await Promise.all([
          getUnlinkedProperties(),
          getUserOwners(),
        ]);

        if (propertiesResult.success && propertiesResult.properties) {
          setUnlinkedProperties(propertiesResult.properties as Property[]);
        }

        if (ownersResult.success && ownersResult.owners) {
          const adminOwners = (ownersResult.owners as Owner[]).filter(
            (o) => o.role === 'admin' || o.role === 'editor',
          );
          setOwners(adminOwners);
          if (adminOwners.length > 0 && adminOwners[0]) {
            setSelectedOwnerId(adminOwners[0].id);
          }
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleLink = async () => {
    if (!selectedPropertyId || !selectedOwnerId) {
      setError(t('select_property_and_owner'));
      return;
    }

    const percentage = Number.parseFloat(ownershipPercentage);
    if (Number.isNaN(percentage) || percentage <= 0 || percentage > 100) {
      setError(t('invalid_percentage'));
      return;
    }

    setIsLinking(true);
    setError('');

    try {
      const result = await addPropertyOwner({
        propertyId: selectedPropertyId,
        ownerId: selectedOwnerId,
        ownershipPercentage: percentage,
      });

      if (result.success) {
        // Remove the linked property from the list
        setUnlinkedProperties((prev) => prev.filter((p) => p.id !== selectedPropertyId));
        setSelectedPropertyId('');
        setOwnershipPercentage('100');
        if (onSuccess) {
          onSuccess();
        }
      } else {
        setError(result.error || t('link_failed'));
      }
    } catch (err) {
      console.error('Error linking property:', err);
      setError(t('link_failed'));
    } finally {
      setIsLinking(false);
    }
  };

  if (isLoading) {
    return (
      <div className="rounded-xl bg-white p-8 text-center shadow-md">
        <p className="text-gray-600">{t('loading')}</p>
      </div>
    );
  }

  if (unlinkedProperties.length === 0) {
    return (
      <div className="rounded-xl bg-gradient-to-br from-green-50 to-blue-50 p-12 text-center shadow-md md:p-20">
        <div className="mb-6 text-8xl">✅</div>
        <h3 className="mb-4 text-2xl font-semibold text-gray-800">{t('all_properties_linked')}</h3>
        <p className="mb-8 text-lg text-gray-600">{t('no_unlinked_properties')}</p>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="inline-block rounded-xl bg-gray-600 px-8 py-4 text-xl font-semibold text-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:bg-gray-700 hover:shadow-xl focus:ring-4 focus:ring-gray-300 focus:outline-none"
          >
            {t('close')}
          </button>
        )}
      </div>
    );
  }

  if (owners.length === 0) {
    return (
      <div className="rounded-xl bg-gradient-to-br from-yellow-50 to-orange-50 p-12 text-center shadow-md md:p-20">
        <div className="mb-6 text-8xl">⚠️</div>
        <h3 className="mb-4 text-2xl font-semibold text-gray-800">{t('no_owners_available')}</h3>
        <p className="mb-8 text-lg text-gray-600">{t('create_owner_first')}</p>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="inline-block rounded-xl bg-gray-600 px-8 py-4 text-xl font-semibold text-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:bg-gray-700 hover:shadow-xl focus:ring-4 focus:ring-gray-300 focus:outline-none"
          >
            {t('close')}
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-xl border-2 border-gray-200 bg-white p-6 shadow-md">
      <h3 className="mb-6 text-2xl font-bold text-gray-800">{t('link_property_to_owner')}</h3>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 p-4 text-red-700">{error}</div>
      )}

      <div className="space-y-4">
        <div>
          <label htmlFor="property-select" className="mb-2 block text-sm font-semibold text-gray-700">
            {t('select_property')}
          </label>
          <select
            id="property-select"
            value={selectedPropertyId}
            onChange={(e) => setSelectedPropertyId(e.target.value)}
            className="w-full rounded-lg border-2 border-gray-300 px-4 py-2 focus:border-purple-500 focus:outline-none"
          >
            <option value="">{t('choose_property')}</option>
            {unlinkedProperties.map((property) => (
              <option key={property.id} value={property.id}>
                {property.address} {property.propertyType ? `(${property.propertyType})` : ''}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="owner-select" className="mb-2 block text-sm font-semibold text-gray-700">
            {t('select_owner')}
          </label>
          <select
            id="owner-select"
            value={selectedOwnerId}
            onChange={(e) => setSelectedOwnerId(e.target.value)}
            className="w-full rounded-lg border-2 border-gray-300 px-4 py-2 focus:border-purple-500 focus:outline-none"
          >
            {owners.map((owner) => (
              <option key={owner.id} value={owner.id}>
                {owner.name} ({owner.type === 'llc' ? 'LLC' : 'Individual'})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="percentage-input" className="mb-2 block text-sm font-semibold text-gray-700">
            {t('ownership_percentage')}
          </label>
          <input
            id="percentage-input"
            type="number"
            min="0.01"
            max="100"
            step="0.01"
            value={ownershipPercentage}
            onChange={(e) => setOwnershipPercentage(e.target.value)}
            className="w-full rounded-lg border-2 border-gray-300 px-4 py-2 focus:border-purple-500 focus:outline-none"
            placeholder="100"
          />
          <p className="mt-1 text-xs text-gray-500">{t('percentage_hint')}</p>
        </div>

        <div className="flex gap-4 pt-4">
          <button
            type="button"
            onClick={handleLink}
            disabled={isLinking || !selectedPropertyId || !selectedOwnerId}
            className="flex-1 rounded-lg bg-purple-600 px-6 py-3 font-semibold text-white transition-all duration-300 hover:bg-purple-700 focus:ring-4 focus:ring-purple-300 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLinking ? t('linking') : t('link_property')}
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="rounded-lg border-2 border-gray-300 bg-white px-6 py-3 font-semibold text-gray-700 transition-all duration-300 hover:bg-gray-50 focus:outline-none"
            >
              {t('cancel')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

