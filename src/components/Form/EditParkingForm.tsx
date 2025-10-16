'use client';

import { PencilIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { getAvailableTenants } from '@/actions/ParkingActions';
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
  tenantId?: string;
};

type Tenant = {
  id: string;
  name: string;
  unitNumber: string;
  propertyAddress: string;
};

type EditParkingFormProps = {
  permit: ParkingPermit;
  locale: string;
  onUpdate: (data: {
    tenantId?: string;
    building?: string;
    permitNumber: string;
    status: string;
    vehicleMake?: string;
    vehicleModel?: string;
    vehicleYear?: string;
    vehicleColor?: string;
    licensePlate?: string;
    comments?: string;
  }) => Promise<{ success: boolean; error?: string }>;
};

export function EditParkingForm({ permit, locale: _locale, onUpdate }: EditParkingFormProps) {
  const t = useTranslations('Parking');
  // const { formatCurrency: _formatCurrency } = useCurrency();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loadingTenants, setLoadingTenants] = useState(false);
  const [formData, setFormData] = useState({
    tenantId: permit.tenantId || '',
    permitNumber: permit.permitNumber,
    status: permit.status,
    building: permit.building || '',
    vehicleMake: permit.vehicleMake || '',
    vehicleModel: permit.vehicleModel || '',
    vehicleYear: permit.vehicleYear || '',
    vehicleColor: permit.vehicleColor || '',
    licensePlate: permit.licensePlate || '',
    comments: permit.comments || '',
  });

  const loadTenants = async () => {
    setLoadingTenants(true);
    try {
      const result = await getAvailableTenants();
      if (result.success) {
        setTenants(result.tenants);
      }
    } catch (error) {
      console.error('Error loading tenants:', error);
    } finally {
      setLoadingTenants(false);
    }
  };

  // Load available tenants when dialog opens
  useEffect(() => {
    if (open) {
      loadTenants();
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (!formData.permitNumber.trim()) {
        setError(t('permit_number_required'));
        return;
      }

      const result = await onUpdate({
        tenantId: formData.tenantId || undefined,
        building: formData.building.trim() || undefined,
        permitNumber: formData.permitNumber.trim(),
        status: formData.status,
        vehicleMake: formData.vehicleMake.trim() || undefined,
        vehicleModel: formData.vehicleModel.trim() || undefined,
        vehicleYear: formData.vehicleYear.trim() || undefined,
        vehicleColor: formData.vehicleColor.trim() || undefined,
        licensePlate: formData.licensePlate.trim() || undefined,
        comments: formData.comments.trim() || undefined,
      });

      if (result.success) {
        setOpen(false);
        setFormData({
          tenantId: permit.tenantId || '',
          permitNumber: permit.permitNumber,
          status: permit.status,
          building: permit.building || '',
          vehicleMake: permit.vehicleMake || '',
          vehicleModel: permit.vehicleModel || '',
          vehicleYear: permit.vehicleYear || '',
          vehicleColor: permit.vehicleColor || '',
          licensePlate: permit.licensePlate || '',
          comments: permit.comments || '',
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
      tenantId: permit.tenantId || '',
      permitNumber: permit.permitNumber,
      status: permit.status,
      building: permit.building || '',
      vehicleMake: permit.vehicleMake || '',
      vehicleModel: permit.vehicleModel || '',
      vehicleYear: permit.vehicleYear || '',
      vehicleColor: permit.vehicleColor || '',
      licensePlate: permit.licensePlate || '',
      comments: permit.comments || '',
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
      <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{t('edit_permit')}</DialogTitle>
          <DialogDescription>
            {t('property')}: {permit.propertyAddress}
            {permit.unitNumber && ` - ${t('unit_number')} ${permit.unitNumber}`}
            {permit.tenantName && ` (${permit.tenantName})`}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="tenantId" className="text-right">
                {t('tenant')}
              </Label>
              <select
                id="tenantId"
                value={formData.tenantId}
                onChange={(e) => setFormData({ ...formData, tenantId: e.target.value })}
                className="col-span-3 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                disabled={loadingTenants}
              >
                <option value="">
                  {t('select_tenant')} ({t('optional')})
                </option>
                {tenants.map((tenant) => (
                  <option key={tenant.id} value={tenant.id}>
                    {tenant.name} - {t('unit_number')} {tenant.unitNumber} ({tenant.propertyAddress}
                    )
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="permitNumber" className="text-right">
                {t('permit_number')}
              </Label>
              <Input
                id="permitNumber"
                value={formData.permitNumber}
                onChange={(e) => setFormData({ ...formData, permitNumber: e.target.value })}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">
                {t('status')}
              </Label>
              <select
                id="status"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="col-span-3 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="Active">Active</option>
                <option value="Suspended">Suspended</option>
                <option value="Cancelled">Cancelled</option>
                <option value="Expired">Expired</option>
              </select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="building" className="text-right">
                {t('building')}
              </Label>
              <Input
                id="building"
                value={formData.building}
                onChange={(e) => setFormData({ ...formData, building: e.target.value })}
                className="col-span-3"
                placeholder={t('building_placeholder')}
              />
            </div>

            <div className="col-span-4">
              <h4 className="mb-3 font-semibold text-gray-800">{t('vehicle_information')}</h4>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="vehicleMake" className="text-right">
                {t('vehicle_make')}
              </Label>
              <Input
                id="vehicleMake"
                value={formData.vehicleMake}
                onChange={(e) => setFormData({ ...formData, vehicleMake: e.target.value })}
                className="col-span-3"
                placeholder={t('select_make')}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="vehicleModel" className="text-right">
                {t('vehicle_model')}
              </Label>
              <Input
                id="vehicleModel"
                value={formData.vehicleModel}
                onChange={(e) => setFormData({ ...formData, vehicleModel: e.target.value })}
                className="col-span-3"
                placeholder={t('vehicle_model_placeholder')}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="vehicleYear" className="text-right">
                {t('vehicle_year')}
              </Label>
              <Input
                id="vehicleYear"
                value={formData.vehicleYear}
                onChange={(e) => setFormData({ ...formData, vehicleYear: e.target.value })}
                className="col-span-3"
                placeholder="2020"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="vehicleColor" className="text-right">
                {t('vehicle_color')}
              </Label>
              <Input
                id="vehicleColor"
                value={formData.vehicleColor}
                onChange={(e) => setFormData({ ...formData, vehicleColor: e.target.value })}
                className="col-span-3"
                placeholder={t('vehicle_color_placeholder')}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="licensePlate" className="text-right">
                {t('license_plate')}
              </Label>
              <Input
                id="licensePlate"
                value={formData.licensePlate}
                onChange={(e) => setFormData({ ...formData, licensePlate: e.target.value })}
                className="col-span-3"
                placeholder={t('license_plate_placeholder')}
              />
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="comments" className="pt-2 text-right">
                {t('comments')}
              </Label>
              <textarea
                id="comments"
                value={formData.comments}
                onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
                className="col-span-3 min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                placeholder={t('comments_placeholder')}
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
