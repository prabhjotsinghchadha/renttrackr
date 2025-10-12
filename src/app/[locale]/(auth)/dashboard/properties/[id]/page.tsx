import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPropertyById } from '@/actions/PropertyActions';
import { AddUnitForm } from '@/components/AddUnitForm';
import { PropertyActions } from '@/components/PropertyActions';
import { UnitActions } from '@/components/UnitActions';

export async function generateMetadata(props: {
  params: Promise<{ locale: string; id: string }>;
}): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({
    locale,
    namespace: 'PropertyDetail',
  });

  return {
    title: t('meta_title'),
    description: t('meta_description'),
  };
}

export default async function PropertyDetailPage(props: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await props.params;
  setRequestLocale(locale);
  const t = await getTranslations({
    locale,
    namespace: 'PropertyDetail',
  });

  // Fetch property from database
  const result = await getPropertyById(id);

  if (!result.success || !result.property) {
    notFound();
  }

  const property = result.property;
  const units = result.units || [];

  return (
    <div className="py-8 md:py-12">
      <div className="mb-8">
        <Link
          href="/dashboard/properties"
          className="inline-flex items-center text-lg text-blue-600 transition-colors hover:text-blue-700"
        >
          ← {t('back_to_properties')}
        </Link>
      </div>

      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-800 md:text-5xl">{property.address}</h1>
          <p className="mt-2 text-lg text-gray-600">
            {t('added_on')}: {new Date(property.createdAt).toLocaleDateString()}
          </p>
        </div>
        <PropertyActions 
          propertyId={id} 
          propertyAddress={property.address}
          propertyAcquiredOn={property.acquiredOn || undefined}
          propertyPrincipalAmount={property.principalAmount || undefined}
          propertyRateOfInterest={property.rateOfInterest || undefined}
          locale={locale} 
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Property details */}
        <div className="lg:col-span-2">
          <div className="mb-6 rounded-xl bg-gray-50 p-8">
            <h2 className="mb-6 text-2xl font-semibold text-gray-800">{t('property_info')}</h2>
            <div className="space-y-3">
              <div>
                <span className="text-lg font-semibold text-gray-700">{t('address')}:</span>
                <span className="ml-2 text-lg text-gray-600">{property.address}</span>
              </div>
              {property.acquiredOn && (
                <div>
                  <span className="text-lg font-semibold text-gray-700">{t('acquired_on')}:</span>
                  <span className="ml-2 text-lg text-gray-600">
                    {new Date(property.acquiredOn).toLocaleDateString()}
                  </span>
                </div>
              )}
              {property.principalAmount && (
                <div>
                  <span className="text-lg font-semibold text-gray-700">{t('principal_amount')}:</span>
                  <span className="ml-2 text-lg text-gray-600">
                    ${property.principalAmount.toLocaleString()}
                  </span>
                </div>
              )}
              {property.rateOfInterest && (
                <div>
                  <span className="text-lg font-semibold text-gray-700">{t('rate_of_interest')}:</span>
                  <span className="ml-2 text-lg text-gray-600">
                    {property.rateOfInterest}%
                  </span>
                </div>
              )}
              <div>
                <span className="text-lg font-semibold text-gray-700">{t('total_units')}:</span>
                <span className="ml-2 text-lg text-gray-600">{units.length}</span>
              </div>
            </div>
          </div>

          {/* Units section */}
          <div className="rounded-xl bg-gray-50 p-8">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-gray-800">{t('units')}</h2>
            </div>

            {units.length === 0 ? (
              <div className="mb-6 rounded-lg bg-yellow-50 p-6 text-center">
                <div className="mb-3 text-5xl">🏢</div>
                <h3 className="mb-2 text-xl font-semibold text-gray-800">{t('no_units')}</h3>
                <p className="mb-4 text-gray-600">{t('no_units_description')}</p>
              </div>
            ) : (
              <div className="mb-6 space-y-3">
                {units.map((unit) => (
                  <div
                    key={unit.id}
                    className="flex items-center justify-between rounded-lg bg-white p-4 shadow-sm"
                  >
                    <div>
                      <span className="text-lg font-semibold text-gray-800">
                        {t('unit')} {unit.unitNumber}
                      </span>
                      <span className="ml-4 text-gray-600">
                        {t('rent')}: ${unit.rentAmount.toFixed(2)}
                      </span>
                    </div>
                    <UnitActions
                      unitId={unit.id}
                      unitNumber={unit.unitNumber}
                      propertyAddress={property.address}
                      locale={locale}
                    />
                  </div>
                ))}
              </div>
            )}

            <AddUnitForm propertyId={id} />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="rounded-xl bg-gray-50 p-8">
            <h3 className="mb-6 text-xl font-semibold text-gray-800">{t('quick_stats')}</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">{t('total_units')}</p>
                <p className="text-3xl font-bold text-gray-800">{units.length}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">{t('total_rent')}</p>
                <p className="text-3xl font-bold text-gray-800">
                  ${units.reduce((sum, unit) => sum + unit.rentAmount, 0).toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
