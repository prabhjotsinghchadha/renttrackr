'use client';

import { useEffect, useState } from 'react';
import { getUserOwners } from '@/actions/OwnerActions';
import { OwnerForm } from './Form/OwnerForm';
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

export function OwnerManagement({ locale }: { locale: string }) {
  const [owners, setOwners] = useState<Owner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedOwnerForUsers, setSelectedOwnerForUsers] = useState<{
    id: string;
    name: string;
    role: string;
  } | null>(null);

  const fetchOwners = async () => {
    setIsLoading(true);
    try {
      const result = await getUserOwners();
      if (result.success && result.owners) {
        setOwners(result.owners as Owner[]);
      }
    } catch (error) {
      console.error('Error fetching owners:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOwners();
  }, []);

  const handleFormSuccess = () => {
    setShowForm(false);
    fetchOwners();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Owner Management</h2>
          <p className="mt-2 text-gray-600">
            Manage property owners and ownership entities. Owners can be individuals or LLCs.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="rounded-lg bg-purple-600 px-6 py-3 font-semibold text-white transition-all duration-300 hover:bg-purple-700 focus:ring-4 focus:ring-purple-300 focus:outline-none"
        >
          Add Owner
        </button>
      </div>

      {isLoading ? (
        <div className="rounded-xl bg-white p-8 text-center shadow-md">
          <p className="text-gray-600">Loading owners...</p>
        </div>
      ) : owners.length === 0 ? (
        <div className="rounded-xl bg-white p-8 text-center shadow-md">
          <p className="mb-4 text-lg text-gray-600">No owners found</p>
          <p className="text-sm text-gray-500">
            Create your first owner entity to start managing property ownership
          </p>
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
                    <span className="text-gray-500">Email:</span>
                    <span className="text-gray-700">{owner.email}</span>
                  </div>
                )}
                {owner.phone && (
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">Phone:</span>
                    <span className="text-gray-700">{owner.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">Created:</span>
                  <span className="text-gray-700">
                    {new Date(owner.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="mt-4">
                <button
                  type="button"
                  onClick={() =>
                    setSelectedOwnerForUsers({
                      id: owner.id,
                      name: owner.name,
                      role: owner.role,
                    })
                  }
                  className="w-full rounded-lg border-2 border-purple-300 bg-white px-4 py-2 text-sm font-semibold text-purple-700 transition-all duration-300 hover:border-purple-400 hover:bg-purple-50 focus:outline-none"
                >
                  Manage Users
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <OwnerForm locale={locale} onSuccess={handleFormSuccess} onCancel={() => setShowForm(false)} />
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

