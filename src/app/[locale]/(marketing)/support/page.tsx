import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';

type ISupportPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata(props: ISupportPageProps): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({
    locale,
    namespace: 'Support',
  });

  return {
    title: t('meta_title'),
    description: t('meta_description'),
  };
}

export default async function SupportPage(props: ISupportPageProps) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  const t = await getTranslations({
    locale,
    namespace: 'Support',
  });

  return (
    <div className="w-full bg-white px-6 py-16 md:px-12 lg:px-16 xl:px-24">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold text-gray-800 md:text-5xl">{t('title')}</h1>
          <p className="text-xl text-gray-600">{t('subtitle')}</p>
        </div>

        {/* Contact Methods */}
        <div className="mb-16 grid gap-8 md:grid-cols-2">
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-8">
            <div className="mb-4 text-4xl">📧</div>
            <h3 className="mb-3 text-2xl font-semibold text-gray-800">
              {t('email_support_title')}
            </h3>
            <p className="mb-4 text-gray-600">{t('email_support_description')}</p>
            <a
              href="mailto:support@renttrackr.com"
              className="inline-block rounded-lg bg-blue-600 px-6 py-3 text-white transition-colors hover:bg-blue-700"
            >
              {t('email_support_button')}
            </a>
          </div>

          <div className="rounded-lg border border-gray-200 bg-gray-50 p-8">
            <div className="mb-4 text-4xl">📞</div>
            <h3 className="mb-3 text-2xl font-semibold text-gray-800">
              {t('phone_support_title')}
            </h3>
            <p className="mb-4 text-gray-600">{t('phone_support_description')}</p>
            <a
              href="tel:1-800-555-0123"
              className="inline-block rounded-lg bg-blue-600 px-6 py-3 text-white transition-colors hover:bg-blue-700"
            >
              {t('phone_support_button')}
            </a>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mb-16">
          <h2 className="mb-8 text-center text-3xl font-bold text-gray-800">{t('faq_title')}</h2>
          <div className="space-y-6">
            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <h3 className="mb-3 text-xl font-semibold text-gray-800">{t('faq_1_question')}</h3>
              <p className="text-gray-600">{t('faq_1_answer')}</p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <h3 className="mb-3 text-xl font-semibold text-gray-800">{t('faq_2_question')}</h3>
              <p className="text-gray-600">{t('faq_2_answer')}</p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <h3 className="mb-3 text-xl font-semibold text-gray-800">{t('faq_3_question')}</h3>
              <p className="text-gray-600">{t('faq_3_answer')}</p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <h3 className="mb-3 text-xl font-semibold text-gray-800">{t('faq_4_question')}</h3>
              <p className="text-gray-600">{t('faq_4_answer')}</p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <h3 className="mb-3 text-xl font-semibold text-gray-800">{t('faq_5_question')}</h3>
              <p className="text-gray-600">{t('faq_5_answer')}</p>
            </div>
          </div>
        </div>

        {/* Response Times */}
        <div className="rounded-lg bg-blue-50 p-8 text-center">
          <h3 className="mb-4 text-2xl font-semibold text-gray-800">{t('response_times_title')}</h3>
          <div className="grid gap-6 md:grid-cols-3">
            <div>
              <div className="mb-2 text-3xl font-bold text-blue-600">
                {t('email_response_time')}
              </div>
              <p className="text-gray-600">{t('email_response_description')}</p>
            </div>
            <div>
              <div className="mb-2 text-3xl font-bold text-blue-600">
                {t('phone_response_time')}
              </div>
              <p className="text-gray-600">{t('phone_response_description')}</p>
            </div>
            <div>
              <div className="mb-2 text-3xl font-bold text-blue-600">
                {t('urgent_response_time')}
              </div>
              <p className="text-gray-600">{t('urgent_response_description')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
