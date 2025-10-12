'use client';

import { PencilIcon } from 'lucide-react';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCurrency } from '@/contexts/CurrencyContext';

type Payment = {
  id: string;
  amount: number;
  date: string;
  lateFee?: number;
  tenantName: string;
  unitNumber: string;
};

type EditPaymentFormProps = {
  payment: Payment;
  locale: string;
  onUpdate: (data: {
    amount: number;
    date: Date;
    lateFee?: number;
  }) => Promise<{ success: boolean; error?: string }>;
};

export function EditPaymentForm({ payment, locale: _locale, onUpdate }: EditPaymentFormProps) {
  const t = useTranslations('Rents');
  const { formatCurrency } = useCurrency();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    amount: payment.amount.toString(),
    date: new Date(payment.date).toISOString().split('T')[0],
    lateFee: payment.lateFee?.toString() || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const amount = Number.parseFloat(formData.amount);
      const lateFee = formData.lateFee ? Number.parseFloat(formData.lateFee) : undefined;

      if (Number.isNaN(amount) || amount <= 0) {
        setError(t('amount_required'));
        return;
      }

      if (lateFee !== undefined && (Number.isNaN(lateFee) || lateFee < 0)) {
        setError('Invalid late fee amount');
        return;
      }

      if (!formData.date) {
        setError('Please select a payment date');
        return;
      }

      const result = await onUpdate({
        amount,
        date: new Date(formData.date),
        lateFee,
      });

      if (result.success) {
        setOpen(false);
        setFormData({
          amount: payment.amount.toString(),
          date: new Date(payment.date).toISOString().split('T')[0],
          lateFee: payment.lateFee?.toString() || '',
        });
      } else {
        setError(result.error || t('update_error'));
      }
    } catch {
      setError(t('update_error'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setOpen(false);
    setError(null);
    setFormData({
      amount: payment.amount.toString(),
      date: new Date(payment.date).toISOString().split('T')[0],
      lateFee: payment.lateFee?.toString() || '',
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 w-8 p-0">
          <PencilIcon className="h-4 w-4" />
          <span className="sr-only">{t('edit')}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t('edit_payment')}</DialogTitle>
          <DialogDescription>
            {t('tenant_name')}: {payment.tenantName} - {t('unit_number')} {payment.unitNumber}
            <br />
            Current Amount: {formatCurrency(payment.amount)}
            {payment.lateFee && ` (Late Fee: ${formatCurrency(payment.lateFee)})`}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="amount" className="text-right">
                {t('payment_amount')}
              </Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="date" className="text-right">
                {t('payment_date')}
              </Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="lateFee" className="text-right">
                {t('late_fee')}
              </Label>
              <Input
                id="lateFee"
                type="number"
                step="0.01"
                min="0"
                value={formData.lateFee}
                onChange={(e) => setFormData({ ...formData, lateFee: e.target.value })}
                className="col-span-3"
                placeholder="0.00"
              />
            </div>
            {error && <div className="col-span-4 text-sm text-red-600">{error}</div>}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleCancel}>
              {t('cancel')}
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? t('updating') : t('edit')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
