import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({
    locale,
    namespace: 'Tenants',
  });

  return {
    title: t('meta_title'),
    description: t('meta_description'),
  };
}

export default async function TenantsPage(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  const t = await getTranslations({
    locale,
    namespace: 'Tenants',
  });

  // TODO: Fetch tenants from database
  const tenants = [];

  return (
    <div className="py-8 md:py-12">
      <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h1 className="text-4xl font-bold text-gray-800 md:text-5xl">{t('page_title')}</h1>
        <button
          type="button"
          className="inline-block rounded-xl bg-blue-600 px-8 py-4 text-center text-xl font-semibold text-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:bg-blue-700 hover:shadow-xl focus:ring-4 focus:ring-blue-300 focus:outline-none"
        >
          {t('add_tenant')}
        </button>
      </div>

      <div className="overflow-hidden rounded-xl bg-gray-50">
        <div className="p-8">
          {tenants.length === 0 ? (
            <div className="py-12 text-center">
              <div className="mb-6 text-8xl">👥</div>
              <h3 className="mb-4 text-2xl font-semibold text-gray-800">{t('no_tenants')}</h3>
              <p className="mb-8 text-xl leading-relaxed text-gray-600">
                {t('no_tenants_description')}
              </p>
              <button
                type="button"
                className="inline-block rounded-xl bg-blue-600 px-8 py-4 text-xl font-semibold text-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:bg-blue-700 hover:shadow-xl focus:ring-4 focus:ring-blue-300 focus:outline-none"
              >
                {t('add_first_tenant')}
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="px-6 py-4 text-left text-lg font-semibold text-gray-800">
                      {t('tenant_name')}
                    </th>
                    <th className="px-6 py-4 text-left text-lg font-semibold text-gray-800">
                      {t('unit')}
                    </th>
                    <th className="px-6 py-4 text-left text-lg font-semibold text-gray-800">
                      {t('contact')}
                    </th>
                    <th className="px-6 py-4 text-left text-lg font-semibold text-gray-800">
                      {t('lease_status')}
                    </th>
                    <th className="px-6 py-4 text-right text-lg font-semibold text-gray-800">
                      {t('actions')}
                    </th>
                  </tr>
                </thead>
                <tbody>{/* Tenant rows will be rendered here */}</tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
