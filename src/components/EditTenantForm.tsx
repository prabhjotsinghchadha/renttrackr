'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { updateTenant } from '@/actions/TenantActions';

type EditTenantFormProps = {
  tenantId: string;
  currentName: string;
  currentPhone?: string;
  currentEmail?: string;
  locale: string;
  onSuccess?: () => void;
  onCancel?: () => void;
};

export function EditTenantForm({
  tenantId,
  currentName,
  currentPhone,
  currentEmail,
  locale,
  onSuccess,
  onCancel,
}: EditTenantFormProps) {
  const router = useRouter();
  const t = useTranslations('TenantDetail');
  const [name, setName] = useState(currentName);
  const [phone, setPhone] = useState(currentPhone || '');
  const [email, setEmail] = useState(currentEmail || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

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

      const result = await updateTenant(tenantId, {
        name: name.trim(),
        phone: phone.trim() || undefined,
        email: email.trim() || undefined,
      });

      if (result.success && result.tenant) {
        if (onSuccess) {
          onSuccess();
        } else {
          router.push(`/${locale}/dashboard/tenants`);
          router.refresh();
        }
      } else {
        setError(result.error || t('update_error'));
        setIsSubmitting(false);
      }
    } catch (err) {
      console.error('Error updating tenant:', err);
      setError(t('update_error'));
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-2xl">
        <h2 className="mb-6 text-2xl font-bold text-gray-800">{t('edit_tenant')}</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="mb-2 block text-lg font-semibold text-gray-800">
              {t('name')} <span className="text-red-600">*</span>
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

          <div>
            <label htmlFor="phone" className="mb-2 block text-lg font-semibold text-gray-800">
              {t('phone')} <span className="text-gray-500">({t('optional')})</span>
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

          <div>
            <label htmlFor="email" className="mb-2 block text-lg font-semibold text-gray-800">
              {t('email')} <span className="text-gray-500">({t('optional')})</span>
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
              {isSubmitting ? t('updating') : t('update_tenant')}
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
