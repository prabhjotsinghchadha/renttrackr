import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import Link from 'next/link';
import { notFound } from 'next/navigation';

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

  // TODO: Fetch property from database
  // If property not found, call notFound()
  const property = null;

  if (!property) {
    notFound();
  }

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
        <h1 className="text-4xl font-bold text-gray-800 md:text-5xl">{t('page_title')}</h1>
        <div className="flex gap-3">
          <button
            type="button"
            className="rounded-xl border-2 border-blue-600 bg-white px-6 py-3 text-lg font-semibold text-blue-600 transition-all duration-300 hover:bg-blue-600 hover:text-white focus:ring-4 focus:ring-blue-300 focus:outline-none"
          >
            {t('edit_property')}
          </button>
          <button
            type="button"
            className="rounded-xl border-2 border-red-600 bg-white px-6 py-3 text-lg font-semibold text-red-600 transition-all duration-300 hover:bg-red-600 hover:text-white focus:ring-4 focus:ring-red-300 focus:outline-none"
          >
            {t('delete_property')}
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Property details */}
        <div className="lg:col-span-2">
          <div className="mb-6 rounded-xl bg-gray-50 p-8">
            <h2 className="mb-6 text-2xl font-semibold text-gray-800">{t('property_info')}</h2>
            {/* Property information will be rendered here */}
            <p className="text-lg text-gray-600">
              {t('property_id')}:{id}
            </p>
          </div>

          {/* Units section */}
          <div className="rounded-xl bg-gray-50 p-8">
            <h2 className="mb-6 text-2xl font-semibold text-gray-800">{t('units')}</h2>
            {/* Units list will be rendered here */}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="rounded-xl bg-gray-50 p-8">
            <h3 className="mb-6 text-xl font-semibold text-gray-800">{t('quick_stats')}</h3>
            {/* Quick stats will be rendered here */}
          </div>
        </div>
      </div>
    </div>
  );
}
