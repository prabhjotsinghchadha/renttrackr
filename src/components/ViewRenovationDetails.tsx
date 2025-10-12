'use client';

import { EyeIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { CurrencyDisplay } from '@/components/CurrencyDisplay';
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

type ViewRenovationDetailsProps = {
  renovation: Renovation;
  locale: string;
};

export function ViewRenovationDetails({ renovation, locale }: ViewRenovationDetailsProps) {
  const t = useTranslations('Renovations');
  const [open, setOpen] = useState(false);

  const getStatusInfo = () => {
    const now = new Date();
    const startDate = renovation.startDate ? new Date(renovation.startDate) : null;
    const endDate = renovation.endDate ? new Date(renovation.endDate) : null;

    if (startDate && (!endDate || endDate >= now)) {
      return {
        status: 'in_progress',
        color: 'bg-blue-100 text-blue-800',
        icon: '🔨',
      };
    } else if (endDate && endDate < now) {
      return {
        status: 'completed',
        color: 'bg-green-100 text-green-800',
        icon: '✅',
      };
    } else {
      return {
        status: 'pending',
        color: 'bg-yellow-100 text-yellow-800',
        icon: '⏳',
      };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 w-8 p-0">
          <EyeIcon className="h-4 w-4" />
          <span className="sr-only">{t('view_details')}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            {t('renovation_details')}
            <span className={`rounded-full px-3 py-1 text-sm font-medium ${statusInfo.color}`}>
              {statusInfo.icon} {t(statusInfo.status as any)}
            </span>
          </DialogTitle>
          <DialogDescription>
            {t('property')}: {renovation.propertyAddress}
            {renovation.unitNumber && ` - ${t('unit_number')} ${renovation.unitNumber}`}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <div className="space-y-4">
            <div className="rounded-lg bg-gray-50 p-4">
              <h4 className="mb-3 font-semibold text-gray-800">{renovation.title}</h4>

              <div className="grid gap-3 text-sm">
                {renovation.startDate && (
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-600">{t('start_date')}:</span>
                    <span className="text-gray-800">
                      {new Date(renovation.startDate).toLocaleDateString(locale, {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                )}

                {renovation.endDate && (
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-600">{t('end_date')}:</span>
                    <span className="text-gray-800">
                      {new Date(renovation.endDate).toLocaleDateString(locale, {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                )}

                {renovation.totalCost && renovation.totalCost > 0 && (
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-600">{t('total_cost')}:</span>
                    <span className="font-semibold text-green-600">
                      <CurrencyDisplay amount={renovation.totalCost} />
                    </span>
                  </div>
                )}
              </div>
            </div>

            {renovation.notes && (
              <div className="rounded-lg bg-gray-50 p-4">
                <h4 className="mb-2 font-semibold text-gray-800">{t('notes')}</h4>
                <p className="text-sm whitespace-pre-wrap text-gray-600">{renovation.notes}</p>
              </div>
            )}

            {!renovation.notes && (
              <div className="rounded-lg bg-gray-50 p-4">
                <p className="text-sm text-gray-500 italic">{t('no_notes')}</p>
              </div>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>
            {t('close')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
