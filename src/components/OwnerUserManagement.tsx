'use client';

import { useEffect, useState } from 'react';
import {
  getOwnerUsers,
  inviteUserToOwner,
  removeUserFromOwner,
  updateUserRole,
} from '@/actions/OwnerActions';

type User = {
  id: string;
  email: string;
  name: string | null;
  role: 'admin' | 'editor' | 'viewer';
  userOwnerId?: string;
};

type OwnerUserManagementProps = {
  ownerId: string;
  ownerName: string;
  currentUserRole: 'admin' | 'editor' | 'viewer';
  onClose: () => void;
};

export function OwnerUserManagement({
  ownerId,
  ownerName,
  currentUserRole,
  onClose,
}: OwnerUserManagementProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'admin' | 'editor' | 'viewer'>('viewer');
  const [isInviting, setIsInviting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchUsers = async () => {
    setIsLoading(true);
    setError('');
    try {
      const result = await getOwnerUsers(ownerId);
      if (result.success && result.users) {
        setUsers(result.users as User[]);
      } else {
        setError(result.error || 'Failed to fetch users');
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to fetch users');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsInviting(true);

    try {
      const result = await inviteUserToOwner({
        ownerId,
        email: inviteEmail.trim(),
        role: inviteRole,
      });

      if (result.success) {
        setSuccess(`Invitation sent to ${inviteEmail}`);
        setInviteEmail('');
        setInviteRole('viewer');
        setShowInviteForm(false);
        // Refresh users list
        fetchUsers();
      } else {
        setError(result.error || 'Failed to send invitation');
      }
    } catch (err) {
      console.error('Error inviting user:', err);
      setError('Failed to send invitation');
    } finally {
      setIsInviting(false);
    }
  };

  // Fetch users on mount
  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRoleChange = async (userId: string, newRole: 'admin' | 'editor' | 'viewer') => {
    setError('');
    setSuccess('');

    try {
      const result = await updateUserRole(ownerId, userId, newRole);
      if (result.success) {
        setSuccess('Role updated successfully');
        fetchUsers();
      } else {
        setError(result.error || 'Failed to update role');
      }
    } catch (err) {
      console.error('Error updating role:', err);
      setError('Failed to update role');
    }
  };

  const handleRemoveUser = async (userId: string, userName: string) => {
    // eslint-disable-next-line no-alert
    if (!window.confirm(`Are you sure you want to remove ${userName || 'this user'} from ${ownerName}?`)) {
      return;
    }

    setError('');
    setSuccess('');

    try {
      const result = await removeUserFromOwner(ownerId, userId);
      if (result.success) {
        setSuccess('User removed successfully');
        fetchUsers();
      } else {
        setError(result.error || 'Failed to remove user');
      }
    } catch (err) {
      console.error('Error removing user:', err);
      setError('Failed to remove user');
    }
  };

  const isAdmin = currentUserRole === 'admin';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-3xl rounded-xl bg-white shadow-xl">
        <div className="border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Manage Users - {ownerName}</h2>
              <p className="mt-1 text-sm text-gray-600">
                Manage who has access to this owner and their roles
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="max-h-[70vh] overflow-y-auto p-6">
          {error && (
            <div className="mb-4 rounded-lg bg-red-50 p-4 text-red-600">{error}</div>
          )}
          {success && (
            <div className="mb-4 rounded-lg bg-green-50 p-4 text-green-600">{success}</div>
          )}

          {isAdmin && (
            <div className="mb-6">
              {!showInviteForm ? (
                <button
                  type="button"
                  onClick={() => setShowInviteForm(true)}
                  className="rounded-lg bg-purple-600 px-4 py-2 font-semibold text-white transition-all duration-300 hover:bg-purple-700 focus:ring-4 focus:ring-purple-300 focus:outline-none"
                >
                  + Invite User
                </button>
              ) : (
                <form onSubmit={handleInvite} className="rounded-lg border-2 border-purple-200 bg-purple-50 p-4">
                  <h3 className="mb-4 font-semibold text-gray-800">Invite User</h3>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="invite-email" className="mb-2 block text-sm font-semibold text-gray-700">
                        Email Address
                      </label>
                      <input
                        type="email"
                        id="invite-email"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        placeholder="user@example.com"
                        required
                        className="w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-2 text-gray-800 focus:border-purple-600 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label htmlFor="invite-role" className="mb-2 block text-sm font-semibold text-gray-700">
                        Role
                      </label>
                      <select
                        id="invite-role"
                        value={inviteRole}
                        onChange={(e) => setInviteRole(e.target.value as 'admin' | 'editor' | 'viewer')}
                        className="w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-2 text-gray-800 focus:border-purple-600 focus:outline-none"
                      >
                        <option value="viewer">Viewer (Read-only)</option>
                        <option value="editor">Editor (Can edit properties)</option>
                        <option value="admin">Admin (Full access)</option>
                      </select>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        disabled={isInviting}
                        className="rounded-lg bg-purple-600 px-4 py-2 font-semibold text-white transition-all duration-300 hover:bg-purple-700 focus:ring-4 focus:ring-purple-300 focus:outline-none disabled:opacity-50"
                      >
                        {isInviting ? 'Sending...' : 'Send Invitation'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowInviteForm(false);
                          setInviteEmail('');
                          setError('');
                          setSuccess('');
                        }}
                        className="rounded-lg border-2 border-gray-300 bg-white px-4 py-2 font-semibold text-gray-700 transition-all duration-300 hover:bg-gray-50 focus:outline-none"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </div>
          )}

          {isLoading ? (
            <div className="text-center text-gray-600">Loading users...</div>
          ) : users.length === 0 ? (
            <div className="rounded-lg bg-gray-50 p-8 text-center">
              <p className="text-gray-600">No users found</p>
              {isAdmin && (
                <p className="mt-2 text-sm text-gray-500">Invite users to grant them access</p>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between rounded-lg border-2 border-gray-200 bg-white p-4"
                >
                  <div className="flex-1">
                    <div className="font-semibold text-gray-800">{user.name || 'No name'}</div>
                    <div className="text-sm text-gray-600">{user.email}</div>
                  </div>
                  <div className="flex items-center gap-4">
                    {isAdmin ? (
                      <select
                        value={user.role}
                        onChange={(e) =>
                          handleRoleChange(user.id, e.target.value as 'admin' | 'editor' | 'viewer')
                        }
                        className="rounded-lg border-2 border-gray-200 bg-white px-3 py-1 text-sm font-semibold text-gray-800 focus:border-purple-600 focus:outline-none"
                      >
                        <option value="viewer">Viewer</option>
                        <option value="editor">Editor</option>
                        <option value="admin">Admin</option>
                      </select>
                    ) : (
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          user.role === 'admin'
                            ? 'bg-purple-100 text-purple-700'
                            : user.role === 'editor'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {user.role}
                      </span>
                    )}
                    {isAdmin && (
                      <button
                        type="button"
                        onClick={() => handleRemoveUser(user.id, user.name || user.email)}
                        className="rounded-lg border-2 border-red-300 bg-white px-3 py-1 text-sm font-semibold text-red-600 transition-all duration-300 hover:border-red-400 hover:bg-red-50 focus:outline-none"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-gray-200 p-6">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-lg bg-gray-200 px-4 py-2 font-semibold text-gray-700 transition-all duration-300 hover:bg-gray-300 focus:outline-none"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

