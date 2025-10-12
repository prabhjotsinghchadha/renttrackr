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

type Expense = {
  id: string;
  type: string;
  amount: number;
  date: string;
  propertyAddress: string;
};

type DeleteExpenseDialogProps = {
  expense: Expense;
  locale: string;
  onDelete: () => Promise<{ success: boolean; error?: string }>;
};

export function DeleteExpenseDialog({ expense, locale, onDelete }: DeleteExpenseDialogProps) {
  const t = useTranslations('Expenses');
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
          <DialogTitle className="text-red-600">{t('delete_expense')}</DialogTitle>
          <DialogDescription>
            {t('confirm_delete')} {t('delete_confirmation')}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <div className="rounded-lg bg-gray-50 p-4">
            <div className="text-sm text-gray-600">
              <div className="font-medium">
                {t('property')}: {expense.propertyAddress}
              </div>
              <div className="font-medium">
                {t('type')}: {expense.type}
              </div>
              <div className="font-medium">
                {t('amount')}: ${expense.amount.toFixed(2)}
              </div>
              <div className="font-medium">
                {t('date')}: {new Date(expense.date).toLocaleDateString(locale)}
              </div>
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
