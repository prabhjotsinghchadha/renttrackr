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
// import { useCurrency } from '@/contexts/CurrencyContext';

type Renovation = {
  id: string;
  title: string;
  startDate?: string;
  endDate?: string;
  totalCost?: number;
  notes?: string;
  propertyAddress: string;
  unitNumber?: string;
};

type EditRenovationFormProps = {
  renovation: Renovation;
  locale: string;
  onUpdate: (data: {
    title: string;
    startDate?: Date;
    endDate?: Date;
    totalCost?: number;
    notes?: string;
  }) => Promise<{ success: boolean; error?: string }>;
};

export function EditRenovationForm({
  renovation,
  locale: _locale,
  onUpdate,
}: EditRenovationFormProps) {
  const t = useTranslations('Renovations');
  // const { formatCurrency } = useCurrency();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: renovation.title,
    startDate: renovation.startDate
      ? new Date(renovation.startDate).toISOString().split('T')[0]
      : '',
    endDate: renovation.endDate ? new Date(renovation.endDate).toISOString().split('T')[0] : '',
    totalCost: renovation.totalCost?.toString() || '',
    notes: renovation.notes || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (!formData.title.trim()) {
        setError(t('title_required'));
        return;
      }

      const totalCost = formData.totalCost ? Number.parseFloat(formData.totalCost) : undefined;
      if (totalCost !== undefined && (Number.isNaN(totalCost) || totalCost < 0)) {
        setError('Invalid total cost amount');
        return;
      }

      const startDate = formData.startDate ? new Date(formData.startDate) : undefined;
      const endDate = formData.endDate ? new Date(formData.endDate) : undefined;

      if (startDate && endDate && endDate <= startDate) {
        setError(t('end_date_after_start'));
        return;
      }

      const result = await onUpdate({
        title: formData.title.trim(),
        startDate,
        endDate,
        totalCost,
        notes: formData.notes.trim() || undefined,
      });

      if (result.success) {
        setOpen(false);
        setFormData({
          title: renovation.title,
          startDate: renovation.startDate
            ? new Date(renovation.startDate).toISOString().split('T')[0]
            : '',
          endDate: renovation.endDate
            ? new Date(renovation.endDate).toISOString().split('T')[0]
            : '',
          totalCost: renovation.totalCost?.toString() || '',
          notes: renovation.notes || '',
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
      title: renovation.title,
      startDate: renovation.startDate
        ? new Date(renovation.startDate).toISOString().split('T')[0]
        : '',
      endDate: renovation.endDate ? new Date(renovation.endDate).toISOString().split('T')[0] : '',
      totalCost: renovation.totalCost?.toString() || '',
      notes: renovation.notes || '',
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
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t('edit_renovation')}</DialogTitle>
          <DialogDescription>
            {t('property')}: {renovation.propertyAddress}
            {renovation.unitNumber && ` - ${t('unit_number')} ${renovation.unitNumber}`}
            {renovation.totalCost && renovation.totalCost > 0 && (
              <>
                <br />
                Current Cost: ${renovation.totalCost.toLocaleString()}
              </>
            )}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                {t('renovation_title')}
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="startDate" className="text-right">
                {t('start_date')}
              </Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="endDate" className="text-right">
                {t('end_date')}
              </Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="totalCost" className="text-right">
                {t('total_cost')}
              </Label>
              <Input
                id="totalCost"
                type="number"
                step="0.01"
                min="0"
                value={formData.totalCost}
                onChange={(e) => setFormData({ ...formData, totalCost: e.target.value })}
                className="col-span-3"
                placeholder="0.00"
              />
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="notes" className="pt-2 text-right">
                {t('notes')}
              </Label>
              <textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="col-span-3 min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                placeholder={t('notes_placeholder')}
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
