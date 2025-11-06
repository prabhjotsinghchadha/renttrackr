'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { getOwnerProperties, getUnlinkedProperties, getUserOwners } from '@/actions/OwnerActions';
import { OwnerForm } from './Form/OwnerForm';
import { LinkPropertyToOwner } from './LinkPropertyToOwner';
import { OwnerUserManagement } from './OwnerUserManagement';

type Owner = {
  id: string;
  name: string;
  type: string;
  email?: string;
  phone?: string;
  role: string;
  createdAt: Date;
};

type Property = {
  id: string;
  address: string;
  propertyType?: string | null;
  ownershipPercentage?: number;
};

export function OwnerManagement({ locale }: { locale: string }) {
  const t = useTranslations('Owners');
  const [owners, setOwners] = useState<Owner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedOwnerForUsers, setSelectedOwnerForUsers] = useState<{
    id: string;
    name: string;
    role: string;
  } | null>(null);
  const [showLinkProperty, setShowLinkProperty] = useState(false);
  const [unlinkedPropertiesCount, setUnlinkedPropertiesCount] = useState(0);
  const [ownerPropertiesMap, setOwnerPropertiesMap] = useState<Record<string, Property[]>>({});

  const fetchOwners = async () => {
    setIsLoading(true);
    try {
      const result = await getUserOwners();
      if (result.success && result.owners) {
        const ownersList = result.owners as Owner[];
        setOwners(ownersList);

        // Fetch properties for each owner
        const propertiesMap: Record<string, Property[]> = {};
        for (const owner of ownersList) {
          const propertiesResult = await getOwnerProperties(owner.id);
          if (propertiesResult.success && propertiesResult.properties) {
            propertiesMap[owner.id] = propertiesResult.properties as Property[];
          }
        }
        setOwnerPropertiesMap(propertiesMap);
      }
    } catch (error) {
      console.error('Error fetching owners:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUnlinkedCount = async () => {
    try {
      const result = await getUnlinkedProperties();
      if (result.success && result.properties) {
        setUnlinkedPropertiesCount(result.properties.length);
      }
    } catch (error) {
      console.error('Error fetching unlinked properties:', error);
    }
  };

  useEffect(() => {
    fetchOwners();
    fetchUnlinkedCount();
     
  }, []);

  const handleLinkSuccess = () => {
    fetchOwners();
    fetchUnlinkedCount();
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    fetchOwners();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">{t('management_title')}</h2>
          <p className="mt-2 text-gray-600">{t('management_description')}</p>
        </div>
        <div className="flex gap-3">
          {unlinkedPropertiesCount > 0 && (
            <button
              type="button"
              onClick={() => setShowLinkProperty(true)}
              className="rounded-lg bg-green-600 px-6 py-3 font-semibold text-white transition-all duration-300 hover:bg-green-700 focus:ring-4 focus:ring-green-300 focus:outline-none"
            >
              {t('link_properties')} ({unlinkedPropertiesCount})
            </button>
          )}
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="rounded-lg bg-purple-600 px-6 py-3 font-semibold text-white transition-all duration-300 hover:bg-purple-700 focus:ring-4 focus:ring-purple-300 focus:outline-none"
          >
            {t('add_owner')}
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="rounded-xl bg-white p-8 text-center shadow-md">
          <p className="text-gray-600">{t('loading_owners')}</p>
        </div>
      ) : owners.length === 0 ? (
        <div className="rounded-xl bg-gradient-to-br from-purple-50 to-blue-50 p-12 text-center shadow-md md:p-20">
          <div className="mb-6 text-8xl">👤</div>
          <h3 className="mb-4 text-2xl font-semibold text-gray-800">{t('no_owners')}</h3>
          <p className="mb-2 text-xl leading-relaxed text-gray-700">{t('owners_represent')}</p>
          <p className="mb-8 text-lg text-gray-600">{t('create_first_owner')}</p>
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="inline-block rounded-xl bg-purple-600 px-8 py-4 text-xl font-semibold text-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:bg-purple-700 hover:shadow-xl focus:ring-4 focus:ring-purple-300 focus:outline-none"
          >
            {t('create_first_owner_button')}
          </button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {owners.map((owner) => (
            <div
              key={owner.id}
              className="rounded-xl border-2 border-gray-200 bg-white p-6 shadow-md transition-all duration-300 hover:border-purple-300 hover:shadow-lg"
            >
              <div className="mb-4 flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-800">{owner.name}</h3>
                  <p className="text-sm text-gray-600">
                    {owner.type === 'llc' ? 'LLC' : 'Individual'}
                  </p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    owner.role === 'admin'
                      ? 'bg-purple-100 text-purple-700'
                      : owner.role === 'editor'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {owner.role}
                </span>
              </div>

              <div className="space-y-2 text-sm">
                {owner.email && (
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">{t('email_label')}</span>
                    <span className="text-gray-700">{owner.email}</span>
                  </div>
                )}
                {owner.phone && (
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">{t('phone_label')}</span>
                    <span className="text-gray-700">{owner.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">{t('created_label')}</span>
                  <span className="text-gray-700">
                    {new Date(owner.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">{t('properties_count')}</span>
                  <span className="text-gray-700">
                    {ownerPropertiesMap[owner.id]?.length || 0}
                  </span>
                </div>
              </div>

              {(() => {
                const properties = ownerPropertiesMap[owner.id];
                return properties && properties.length > 0 ? (
                  <div className="mt-4 rounded-lg bg-gray-50 p-3">
                    <p className="mb-2 text-xs font-semibold text-gray-600">{t('linked_properties')}:</p>
                    <ul className="space-y-1">
                      {properties.map((property) => (
                        <li key={property.id} className="text-xs text-gray-700">
                          • {property.address}
                          {property.ownershipPercentage !== undefined && (
                            <span className="ml-2 text-gray-500">
                              ({property.ownershipPercentage}%)
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null;
              })()}

              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setSelectedOwnerForUsers({
                      id: owner.id,
                      name: owner.name,
                      role: owner.role,
                    })
                  }
                  className="flex-1 rounded-lg border-2 border-purple-300 bg-white px-4 py-2 text-sm font-semibold text-purple-700 transition-all duration-300 hover:border-purple-400 hover:bg-purple-50 focus:outline-none"
                >
                  {t('manage_users')}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <OwnerForm locale={locale} onSuccess={handleFormSuccess} onCancel={() => setShowForm(false)} />
      )}

      {showLinkProperty && (
        <LinkPropertyToOwner
          onSuccess={handleLinkSuccess}
          onCancel={() => setShowLinkProperty(false)}
        />
      )}

      {selectedOwnerForUsers && (
        <OwnerUserManagement
          ownerId={selectedOwnerForUsers.id}
          ownerName={selectedOwnerForUsers.name}
          currentUserRole={selectedOwnerForUsers.role as 'admin' | 'editor' | 'viewer'}
          onClose={() => setSelectedOwnerForUsers(null)}
        />
      )}
    </div>
  );
}

