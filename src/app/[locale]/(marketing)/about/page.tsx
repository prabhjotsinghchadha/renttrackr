import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';

type IAboutProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata(props: IAboutProps): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({
    locale,
    namespace: 'About',
  });

  return {
    title: t('meta_title'),
    description: t('meta_description'),
  };
}

export default async function About(props: IAboutProps) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  const t = await getTranslations({
    locale,
    namespace: 'About',
  });

  return (
    <div className="w-full bg-white px-6 py-16 md:px-12 md:py-20 lg:px-16 xl:px-24">
      <div className="mx-auto max-w-5xl">
        <h1 className="mb-8 text-5xl font-bold text-gray-800 md:text-6xl">{t('page_title')}</h1>

        <div className="space-y-8 text-xl leading-relaxed text-gray-600">
          <p>{t('about_paragraph_1')}</p>

          <p>{t('about_paragraph_2')}</p>

          <p>{t('about_paragraph_3')}</p>

          <div className="my-12 rounded-xl bg-blue-50 p-10">
            <h2 className="mb-6 text-3xl font-bold text-gray-800">{t('mission_title')}</h2>
            <p className="text-xl leading-relaxed text-gray-600">{t('mission_statement')}</p>
          </div>

          <h2 className="mt-12 mb-8 text-4xl font-bold text-gray-800">{t('values_title')}</h2>

          <div className="space-y-8">
            <div className="rounded-xl bg-gray-50 p-8 transition-all duration-300 hover:shadow-lg">
              <h3 className="mb-4 text-2xl font-semibold text-gray-800">
                {t('value_simplicity_title')}
              </h3>
              <p className="text-xl text-gray-600">{t('value_simplicity_description')}</p>
            </div>

            <div className="rounded-xl bg-gray-50 p-8 transition-all duration-300 hover:shadow-lg">
              <h3 className="mb-4 text-2xl font-semibold text-gray-800">
                {t('value_accessibility_title')}
              </h3>
              <p className="text-xl text-gray-600">{t('value_accessibility_description')}</p>
            </div>

            <div className="rounded-xl bg-gray-50 p-8 transition-all duration-300 hover:shadow-lg">
              <h3 className="mb-4 text-2xl font-semibold text-gray-800">
                {t('value_trust_title')}
              </h3>
              <p className="text-xl text-gray-600">{t('value_trust_description')}</p>
            </div>
          </div>

          <div className="my-12 text-center">
            <h2 className="mb-6 text-3xl font-bold text-gray-800">{t('contact_title')}</h2>
            <p className="mb-6 text-xl text-gray-600">{t('contact_text')}</p>
            <p className="text-xl text-gray-600">
              {t('contact_email')}{' '}
              <a
                href="mailto:info@renttrackr.com"
                className="font-semibold text-blue-600 transition-colors hover:text-blue-700"
              >
                info@renttrackr.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
