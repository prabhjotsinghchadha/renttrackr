'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { createOwner } from '@/actions/OwnerActions';

type OwnerFormProps = {
  locale: string;
  onSuccess?: () => void;
  onCancel?: () => void;
};

export function OwnerForm({ locale: _locale, onSuccess, onCancel }: OwnerFormProps) {
  const router = useRouter();
  const [name, setName] = useState('');
  const [type, setType] = useState<'individual' | 'llc'>('individual');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [taxId, setTaxId] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      if (!name.trim()) {
        setError('Owner name is required');
        setIsSubmitting(false);
        return;
      }

      const result = await createOwner({
        name: name.trim(),
        type,
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        taxId: taxId.trim() || undefined,
        address: address.trim() || undefined,
        notes: notes.trim() || undefined,
      });

      if (result.success && result.owner) {
        if (onSuccess) {
          onSuccess();
        } else {
          router.refresh();
        }
      } else {
        setError(result.error || 'Failed to create owner');
        setIsSubmitting(false);
      }
    } catch (err) {
      console.error('Error creating owner:', err);
      setError('Failed to create owner');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white p-8 shadow-2xl">
        <h2 className="mb-6 text-2xl font-bold text-gray-800">Add New Owner</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="mb-2 block text-sm font-semibold text-gray-700">
              Owner Name <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe or ABC Properties LLC"
              disabled={isSubmitting}
              className="w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-2 text-gray-800 transition-all duration-300 placeholder:text-gray-400 hover:border-gray-300 focus:border-purple-600 focus:ring-2 focus:ring-purple-300 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
              required
            />
            <p className="mt-1 text-xs text-gray-600">
              Full name for individuals or legal entity name for LLCs
            </p>
          </div>

          <div>
            <label htmlFor="type" className="mb-2 block text-sm font-semibold text-gray-700">
              Owner Type <span className="text-red-600">*</span>
            </label>
            <select
              id="type"
              value={type}
              onChange={(e) => setType(e.target.value as 'individual' | 'llc')}
              disabled={isSubmitting}
              className="w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-2 text-gray-800 transition-all duration-300 hover:border-gray-300 focus:border-purple-600 focus:ring-2 focus:ring-purple-300 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
              required
            >
              <option value="individual">Individual</option>
              <option value="llc">LLC</option>
            </select>
            <p className="mt-1 text-xs text-gray-600">Select the type of ownership entity</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-semibold text-gray-700">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="owner@example.com"
                disabled={isSubmitting}
                className="w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-2 text-gray-800 transition-all duration-300 placeholder:text-gray-400 hover:border-gray-300 focus:border-purple-600 focus:ring-2 focus:ring-purple-300 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            <div>
              <label htmlFor="phone" className="mb-2 block text-sm font-semibold text-gray-700">
                Phone
              </label>
              <input
                type="tel"
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 123-4567"
                disabled={isSubmitting}
                className="w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-2 text-gray-800 transition-all duration-300 placeholder:text-gray-400 hover:border-gray-300 focus:border-purple-600 focus:ring-2 focus:ring-purple-300 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
          </div>

          <div>
            <label htmlFor="taxId" className="mb-2 block text-sm font-semibold text-gray-700">
              Tax ID / EIN
            </label>
            <input
              type="text"
              id="taxId"
              value={taxId}
              onChange={(e) => setTaxId(e.target.value)}
              placeholder="12-3456789"
              disabled={isSubmitting}
              className="w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-2 text-gray-800 transition-all duration-300 placeholder:text-gray-400 hover:border-gray-300 focus:border-purple-600 focus:ring-2 focus:ring-purple-300 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            />
            <p className="mt-1 text-xs text-gray-600">
              EIN for LLC or SSN for individual (optional, encrypted if stored)
            </p>
          </div>

          <div>
            <label htmlFor="address" className="mb-2 block text-sm font-semibold text-gray-700">
              Address
            </label>
            <input
              type="text"
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="123 Main St, City, State 12345"
              disabled={isSubmitting}
              className="w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-2 text-gray-800 transition-all duration-300 placeholder:text-gray-400 hover:border-gray-300 focus:border-purple-600 focus:ring-2 focus:ring-purple-300 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          <div>
            <label htmlFor="notes" className="mb-2 block text-sm font-semibold text-gray-700">
              Notes
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional information about this owner..."
              disabled={isSubmitting}
              rows={3}
              className="w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-2 text-gray-800 transition-all duration-300 placeholder:text-gray-400 hover:border-gray-300 focus:border-purple-600 focus:ring-2 focus:ring-purple-300 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-red-600">
              <p className="text-sm font-semibold">{error}</p>
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 rounded-lg bg-purple-600 px-6 py-2 font-semibold text-white transition-all duration-300 hover:bg-purple-700 focus:ring-4 focus:ring-purple-300 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? 'Creating...' : 'Create Owner'}
            </button>

            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className="rounded-lg border-2 border-gray-300 bg-white px-6 py-2 font-semibold text-gray-700 transition-all duration-300 hover:border-gray-400 hover:bg-gray-50 focus:ring-4 focus:ring-gray-300 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

