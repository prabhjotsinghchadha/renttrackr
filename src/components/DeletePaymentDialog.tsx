'use client';

import { TrashIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

type Payment = {
  id: string;
  amount: number;
  date: string;
  lateFee?: number;
  tenantName: string;
  unitNumber: string;
};

type DeletePaymentDialogProps = {
  payment: Payment;
  locale: string;
  onDelete: () => Promise<{ success: boolean; error?: string }>;
};

export function DeletePaymentDialog({ payment, locale, onDelete }: DeletePaymentDialogProps) {
  const t = useTranslations('Rents');
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await onDelete();

      if (result.success) {
        setOpen(false);
      } else {
        setError(result.error || t('delete_error'));
      }
    } catch {
      setError(t('delete_error'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setOpen(false);
    setError(null);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-8 w-8 p-0 text-red-600 hover:bg-red-50 hover:text-red-700"
        >
          <TrashIcon className="h-4 w-4" />
          <span className="sr-only">{t('delete')}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-red-600">{t('delete_payment')}</DialogTitle>
          <DialogDescription>
            {t('confirm_delete')} {t('delete_confirmation')}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <div className="rounded-lg bg-gray-50 p-4">
            <div className="text-sm text-gray-600">
              <div className="font-medium">
                {t('tenant_name')}: {payment.tenantName}
              </div>
              <div className="font-medium">
                {t('unit_number')}: {payment.unitNumber}
              </div>
              <div className="font-medium">
                {t('amount')}: ${payment.amount.toFixed(2)}
              </div>
              <div className="font-medium">
                {t('date')}: {new Date(payment.date).toLocaleDateString(locale)}
              </div>
              {payment.lateFee && (
                <div className="font-medium">
                  {t('late_fee')}: ${payment.lateFee.toFixed(2)}
                </div>
              )}
            </div>
          </div>
          {error && <div className="mt-4 text-sm text-red-600">{error}</div>}
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleCancel}>
            {t('cancel')}
          </Button>
          <Button type="button" variant="destructive" onClick={handleDelete} disabled={isLoading}>
            {isLoading ? t('deleting') : t('confirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
