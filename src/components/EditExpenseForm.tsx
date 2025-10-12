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

type Expense = {
  id: string;
  type: string;
  amount: number;
  date: string;
  propertyAddress: string;
};

type EditExpenseFormProps = {
  expense: Expense;
  locale: string;
  onUpdate: (data: {
    type: string;
    amount: number;
    date: Date;
  }) => Promise<{ success: boolean; error?: string }>;
};

export function EditExpenseForm({ expense, locale: _locale, onUpdate }: EditExpenseFormProps) {
  const t = useTranslations('Expenses');
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    type: expense.type,
    amount: expense.amount.toString(),
    date: new Date(expense.date).toISOString().split('T')[0],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const amount = Number.parseFloat(formData.amount);

      if (Number.isNaN(amount) || amount <= 0) {
        setError(t('amount_required'));
        return;
      }

      if (!formData.type.trim()) {
        setError(t('type_required'));
        return;
      }

      if (!formData.date) {
        setError('Please select an expense date');
        return;
      }

      const result = await onUpdate({
        type: formData.type.trim(),
        amount,
        date: new Date(formData.date),
      });

      if (result.success) {
        setOpen(false);
        setFormData({
          type: expense.type,
          amount: expense.amount.toString(),
          date: new Date(expense.date).toISOString().split('T')[0],
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
      type: expense.type,
      amount: expense.amount.toString(),
      date: new Date(expense.date).toISOString().split('T')[0],
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
          <DialogTitle>{t('edit_expense')}</DialogTitle>
          <DialogDescription>
            {t('property')}: {expense.propertyAddress}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="type" className="text-right">
                {t('expense_type')}
              </Label>
              <Input
                id="type"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="amount" className="text-right">
                {t('expense_amount')}
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
                {t('expense_date')}
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
