import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';

type ITermsPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata(props: ITermsPageProps): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({
    locale,
    namespace: 'Terms',
  });

  return {
    title: t('meta_title'),
    description: t('meta_description'),
  };
}

export default async function TermsPage(props: ITermsPageProps) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  const t = await getTranslations({
    locale,
    namespace: 'Terms',
  });

  return (
    <div className="w-full bg-white px-6 py-16 md:px-12 lg:px-16 xl:px-24">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold text-gray-800 md:text-5xl">{t('title')}</h1>
          <p className="text-xl text-gray-600">{t('last_updated')}</p>
        </div>

        {/* Content */}
        <div className="prose prose-lg max-w-none">
          {/* Introduction */}
          <section className="mb-12">
            <h2 className="mb-6 text-3xl font-semibold text-gray-800">{t('introduction_title')}</h2>
            <p className="mb-4 leading-relaxed text-gray-600">{t('introduction_text')}</p>
          </section>

          {/* Acceptance of Terms */}
          <section className="mb-12">
            <h2 className="mb-6 text-3xl font-semibold text-gray-800">{t('acceptance_title')}</h2>
            <p className="mb-4 leading-relaxed text-gray-600">{t('acceptance_text')}</p>
          </section>

          {/* Service Description */}
          <section className="mb-12">
            <h2 className="mb-6 text-3xl font-semibold text-gray-800">
              {t('service_description_title')}
            </h2>
            <p className="mb-4 leading-relaxed text-gray-600">{t('service_description_text')}</p>
            <ul className="mb-4 list-disc pl-6 text-gray-600">
              <li className="mb-2">{t('service_feature_1')}</li>
              <li className="mb-2">{t('service_feature_2')}</li>
              <li className="mb-2">{t('service_feature_3')}</li>
              <li className="mb-2">{t('service_feature_4')}</li>
            </ul>
          </section>

          {/* User Accounts */}
          <section className="mb-12">
            <h2 className="mb-6 text-3xl font-semibold text-gray-800">
              {t('user_accounts_title')}
            </h2>
            <p className="mb-4 leading-relaxed text-gray-600">{t('user_accounts_text')}</p>
            <ul className="mb-4 list-disc pl-6 text-gray-600">
              <li className="mb-2">{t('account_responsibility_1')}</li>
              <li className="mb-2">{t('account_responsibility_2')}</li>
              <li className="mb-2">{t('account_responsibility_3')}</li>
            </ul>
          </section>

          {/* Subscription and Payment */}
          <section className="mb-12">
            <h2 className="mb-6 text-3xl font-semibold text-gray-800">{t('subscription_title')}</h2>
            <p className="mb-4 leading-relaxed text-gray-600">{t('subscription_text')}</p>
            <ul className="mb-4 list-disc pl-6 text-gray-600">
              <li className="mb-2">{t('payment_term_1')}</li>
              <li className="mb-2">{t('payment_term_2')}</li>
              <li className="mb-2">{t('payment_term_3')}</li>
              <li className="mb-2">{t('payment_term_4')}</li>
            </ul>
          </section>

          {/* Prohibited Uses */}
          <section className="mb-12">
            <h2 className="mb-6 text-3xl font-semibold text-gray-800">
              {t('prohibited_uses_title')}
            </h2>
            <p className="mb-4 leading-relaxed text-gray-600">{t('prohibited_uses_text')}</p>
            <ul className="mb-4 list-disc pl-6 text-gray-600">
              <li className="mb-2">{t('prohibited_use_1')}</li>
              <li className="mb-2">{t('prohibited_use_2')}</li>
              <li className="mb-2">{t('prohibited_use_3')}</li>
              <li className="mb-2">{t('prohibited_use_4')}</li>
            </ul>
          </section>

          {/* Privacy and Data */}
          <section className="mb-12">
            <h2 className="mb-6 text-3xl font-semibold text-gray-800">{t('privacy_title')}</h2>
            <p className="mb-4 leading-relaxed text-gray-600">{t('privacy_text')}</p>
          </section>

          {/* Limitation of Liability */}
          <section className="mb-12">
            <h2 className="mb-6 text-3xl font-semibold text-gray-800">{t('liability_title')}</h2>
            <p className="mb-4 leading-relaxed text-gray-600">{t('liability_text')}</p>
          </section>

          {/* Termination */}
          <section className="mb-12">
            <h2 className="mb-6 text-3xl font-semibold text-gray-800">{t('termination_title')}</h2>
            <p className="mb-4 leading-relaxed text-gray-600">{t('termination_text')}</p>
          </section>

          {/* Changes to Terms */}
          <section className="mb-12">
            <h2 className="mb-6 text-3xl font-semibold text-gray-800">{t('changes_title')}</h2>
            <p className="mb-4 leading-relaxed text-gray-600">{t('changes_text')}</p>
          </section>

          {/* Contact Information */}
          <section className="mb-12">
            <h2 className="mb-6 text-3xl font-semibold text-gray-800">{t('contact_title')}</h2>
            <p className="mb-4 leading-relaxed text-gray-600">{t('contact_text')}</p>
            <div className="rounded-lg bg-gray-50 p-6">
              <p className="text-gray-600">
                <strong>{t('contact_email')}:</strong> legal@renttrackr.com
                <br />
                <strong>{t('contact_address')}:</strong> RentTrackr Legal Department
                <br />
                123 Business Street, Suite 100
                <br />
                City, State 12345
                <br />
                United States
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
