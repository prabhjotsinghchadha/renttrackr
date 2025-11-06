import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import Link from 'next/link';
import { getUserOwners } from '@/actions/OwnerActions';
import { getUserProperties } from '@/actions/PropertyActions';

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic';

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({
    locale,
    namespace: 'Properties',
  });

  return {
    title: t('meta_title'),
    description: t('meta_description'),
  };
}

export default async function PropertiesPage(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  const t = await getTranslations({
    locale,
    namespace: 'Properties',
  });

  // Fetch properties and owners from database
  const result = await getUserProperties();
  const properties = result.properties || [];
  const ownersResult = await getUserOwners();
  const hasOwners = ownersResult.success && ownersResult.owners && ownersResult.owners.length > 0;

  return (
    <div className="py-8 md:py-12">
      <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h1 className="text-4xl font-bold text-gray-800 md:text-5xl">{t('page_title')}</h1>
        {hasOwners && (
          <Link
            href="/dashboard/properties/new"
            className="inline-block rounded-xl bg-blue-600 px-8 py-4 text-center text-xl font-semibold text-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:bg-blue-700 hover:shadow-xl focus:ring-4 focus:ring-blue-300 focus:outline-none"
          >
            {t('add_property')}
          </Link>
        )}
      </div>

      {properties.length === 0 ? (
        <div className="rounded-xl bg-gray-50 p-12 text-center md:p-20">
          <div className="mb-6 text-8xl">🏠</div>
          <h3 className="mb-4 text-2xl font-semibold text-gray-800">{t('no_properties')}</h3>
          {!hasOwners ? (
            <>
              <p className="mb-4 text-xl leading-relaxed text-gray-600">
                You'll need to create an owner first before adding properties.
              </p>
              <p className="mb-8 text-lg text-gray-500">
                Owners represent you or your LLCs. Properties belong to owners.
              </p>
              <Link
                href={`/${locale}/dashboard/owners`}
                className="inline-block rounded-xl bg-purple-600 px-8 py-4 text-xl font-semibold text-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:bg-purple-700 hover:shadow-xl focus:ring-4 focus:ring-purple-300 focus:outline-none"
              >
                Add Owner First
              </Link>
            </>
          ) : (
            <>
              <p className="mb-8 text-xl leading-relaxed text-gray-600">
                {t('no_properties_description')}
              </p>
              <Link
                href="/dashboard/properties/new"
                className="inline-block rounded-xl bg-blue-600 px-8 py-4 text-xl font-semibold text-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:bg-blue-700 hover:shadow-xl focus:ring-4 focus:ring-blue-300 focus:outline-none"
              >
                {t('add_first_property')}
              </Link>
            </>
          )}
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {properties.map((property) => (
            <Link
              key={property.id}
              href={`/dashboard/properties/${property.id}`}
              className="group rounded-xl bg-gray-50 p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="mb-4 text-5xl">🏠</div>
              <h3 className="mb-2 text-xl font-semibold text-gray-800 group-hover:text-blue-600">
                {property.address}
              </h3>
              <div className="space-y-1 text-sm text-gray-600">
                <p>
                  {t('added_on')}: {new Date(property.createdAt).toLocaleDateString()}
                </p>
                {property.acquiredOn && (
                  <p>
                    {t('acquired_on_label')}: {new Date(property.acquiredOn).toLocaleDateString()}
                  </p>
                )}
                {property.principalAmount && (
                  <p>
                    {t('principal_amount')}: ${property.principalAmount.toLocaleString()}
                  </p>
                )}
                {property.rateOfInterest && (
                  <p>
                    {t('rate_of_interest')}: {property.rateOfInterest}%
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
