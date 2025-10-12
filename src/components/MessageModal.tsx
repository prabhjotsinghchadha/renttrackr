'use client';

import { MessageForm } from './MessageForm';

type MessageModalProps = {
  tenantName?: string;
  tenantPhone?: string;
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
  isOpen: boolean;
  onClose: () => void;
};

export function MessageModal({
  tenantName,
  tenantPhone,
  locale,
  translations,
  isOpen,
  onClose,
}: MessageModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md">
        <MessageForm
          tenantName={tenantName}
          tenantPhone={tenantPhone}
          locale={locale}
          translations={translations}
          onSuccess={onClose}
          onCancel={onClose}
        />
      </div>
    </div>
  );
}
