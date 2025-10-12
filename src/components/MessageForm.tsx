'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { sendWhatsAppMessage } from '@/actions/MessageActions';

// Client-side phone validation
const isValidPhoneNumber = (phoneNumber: string): boolean => {
  const cleaned = phoneNumber.replace(/[^\d+]/g, '');
  const phoneRegex = /^\+[1-9]\d{9,14}$/;
  return phoneRegex.test(cleaned);
};

const formatPhoneNumber = (phoneNumber: string): string => {
  const cleaned = phoneNumber.replace(/[^\d+]/g, '');
  if (!cleaned.startsWith('+')) {
    return `+1${cleaned}`;
  }
  return cleaned;
};

// Form validation schema
const messageFormSchema = z.object({
  phone: z.string().min(1, 'Phone number is required'),
  message: z.string().min(1, 'Message is required').max(1600, 'Message is too long'),
});

type MessageFormData = z.infer<typeof messageFormSchema>;

type MessageFormProps = {
  tenantName?: string;
  tenantPhone?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
  locale?: string;
  translations: {
    send_message: string;
    phone_number: string;
    message: string;
    send: string;
    cancel: string;
    message_sent: string;
    message_failed: string;
    invalid_phone: string;
    phone_placeholder: string;
    message_placeholder: string;
    sending: string;
  };
};

export function MessageForm({
  tenantName,
  tenantPhone,
  onSuccess,
  onCancel,
  locale = 'en',
  translations,
}: MessageFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<MessageFormData>({
    resolver: zodResolver(messageFormSchema),
    defaultValues: {
      phone: tenantPhone || '',
      message: '',
    },
  });

  const watchedPhone = watch('phone');

  // Validate phone number in real-time
  const isPhoneValid = watchedPhone ? isValidPhoneNumber(formatPhoneNumber(watchedPhone)) : true;

  const onSubmit = async (data: MessageFormData) => {
    setIsSubmitting(true);
    setSubmitResult(null);

    try {
      const result = await sendWhatsAppMessage({
        to: data.phone,
        message: data.message,
        tenantName,
        locale,
      });

      if (result.success) {
        setSubmitResult({
          type: 'success',
          message: translations.message_sent,
        });
        reset();
        setTimeout(() => {
          onSuccess?.();
        }, 2000);
      } else {
        setSubmitResult({
          type: 'error',
          message: result.error || translations.message_failed,
        });
      }
    } catch {
      setSubmitResult({
        type: 'error',
        message: translations.message_failed,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rounded-xl bg-white p-6 shadow-lg">
      <h3 className="mb-6 text-xl font-semibold text-gray-800">{translations.send_message}</h3>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Phone Number Field */}
        <div>
          <label htmlFor="phone" className="mb-2 block text-sm font-medium text-gray-700">
            {translations.phone_number}
          </label>
          <input
            id="phone"
            type="tel"
            {...register('phone')}
            placeholder={translations.phone_placeholder}
            className={`w-full rounded-lg border px-4 py-3 text-lg transition-colors focus:ring-2 focus:ring-blue-500 focus:outline-none ${
              errors.phone || (!isPhoneValid && watchedPhone)
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-300'
            }`}
          />
          {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>}
          {!isPhoneValid && watchedPhone && (
            <p className="mt-1 text-sm text-red-600">{translations.invalid_phone}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            {`Format: +1234567890 (include country code)`}
          </p>
        </div>

        {/* Message Field */}
        <div>
          <label htmlFor="message" className="mb-2 block text-sm font-medium text-gray-700">
            {translations.message}
          </label>
          <textarea
            id="message"
            {...register('message')}
            placeholder={translations.message_placeholder}
            rows={4}
            className={`w-full resize-none rounded-lg border px-4 py-3 text-lg transition-colors focus:ring-2 focus:ring-blue-500 focus:outline-none ${
              errors.message ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'
            }`}
          />
          {errors.message && <p className="mt-1 text-sm text-red-600">{errors.message.message}</p>}
          <p className="mt-1 text-xs text-gray-500">{`Maximum 1600 characters`}</p>
        </div>

        {/* Submit Result */}
        {submitResult && (
          <div
            className={`rounded-lg p-3 text-sm ${
              submitResult.type === 'success'
                ? 'bg-green-50 text-green-700'
                : 'bg-red-50 text-red-700'
            }`}
          >
            {submitResult.message}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={isSubmitting || !isPhoneValid}
            className="flex-1 rounded-lg bg-blue-600 px-6 py-3 text-lg font-semibold text-white transition-all duration-300 hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-400"
          >
            {isSubmitting ? translations.sending : translations.send}
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className="flex-1 rounded-lg border-2 border-gray-300 bg-white px-6 py-3 text-lg font-semibold text-gray-700 transition-all duration-300 hover:border-gray-400 hover:bg-gray-50 focus:ring-4 focus:ring-gray-300 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            >
              {translations.cancel}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
