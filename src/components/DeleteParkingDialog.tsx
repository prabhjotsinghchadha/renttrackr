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

type ParkingPermit = {
  id: string;
  permitNumber: string;
  status: string;
  building?: string;
  vehicleMake?: string;
  vehicleModel?: string;
  vehicleYear?: string;
  vehicleColor?: string;
  licensePlate?: string;
  comments?: string;
  propertyAddress: string;
  tenantName?: string;
  unitNumber?: string;
};

type DeleteParkingDialogProps = {
  permit: ParkingPermit;
  locale: string;
  onDelete: () => Promise<{ success: boolean; error?: string }>;
};

export function DeleteParkingDialog({ permit, locale: _locale, onDelete }: DeleteParkingDialogProps) {
  const t = useTranslations('Parking');
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
          <DialogTitle className="text-red-600">{t('delete_permit')}</DialogTitle>
          <DialogDescription>
            {t('confirm_delete')} {t('delete_confirmation')}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <div className="rounded-lg bg-gray-50 p-4">
            <div className="text-sm text-gray-600">
              <div className="font-medium">
                {t('permit_number')}: {permit.permitNumber}
              </div>
              <div className="font-medium">
                {t('property')}: {permit.propertyAddress}
                {permit.unitNumber && ` - ${t('unit_number')} ${permit.unitNumber}`}
              </div>
              {permit.tenantName && (
                <div className="font-medium">
                  {t('tenant')}: {permit.tenantName}
                </div>
              )}
              {permit.vehicleMake && permit.vehicleModel && (
                <div className="font-medium">
                  {t('vehicle')}: {permit.vehicleYear} {permit.vehicleMake} {permit.vehicleModel}
                  {permit.licensePlate && ` (${permit.licensePlate})`}
                </div>
              )}
              <div className="font-medium">
                {t('status')}: {permit.status}
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
