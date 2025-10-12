import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import Link from 'next/link';
import { RenovationForm } from '@/components/Form/RenovationForm';

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({
    locale,
    namespace: 'Renovations',
  });

  return {
    title: t('add_task'),
    description: t('meta_description'),
  };
}

export default async function NewRenovationPage(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  const t = await getTranslations({
    locale,
    namespace: 'Renovations',
  });

  return (
    <div className="py-8 md:py-12">
      <div className="mb-8">
        <Link
          href="/dashboard/renovations"
          className="inline-flex items-center text-lg text-blue-600 transition-colors hover:text-blue-700"
        >
          ← {t('page_title')}
        </Link>
      </div>

      <div className="mb-10">
        <h1 className="text-4xl font-bold text-gray-800 md:text-5xl">{t('add_task')}</h1>
        <p className="mt-4 text-xl leading-relaxed text-gray-600">{t('no_tasks_description')}</p>
      </div>

      <div className="rounded-xl bg-gray-50 p-8 md:p-12">
        <RenovationForm locale={locale} />
      </div>
    </div>
  );
}
