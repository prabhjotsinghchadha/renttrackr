import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';

type IPrivacyPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata(props: IPrivacyPageProps): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({
    locale,
    namespace: 'Privacy',
  });

  return {
    title: t('meta_title'),
    description: t('meta_description'),
  };
}

export default async function PrivacyPage(props: IPrivacyPageProps) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  const t = await getTranslations({
    locale,
    namespace: 'Privacy',
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

          {/* Information We Collect */}
          <section className="mb-12">
            <h2 className="mb-6 text-3xl font-semibold text-gray-800">
              {t('information_collection_title')}
            </h2>
            <p className="mb-4 leading-relaxed text-gray-600">{t('information_collection_text')}</p>

            <h3 className="mb-4 text-2xl font-semibold text-gray-800">
              {t('personal_information_title')}
            </h3>
            <ul className="mb-4 list-disc pl-6 text-gray-600">
              <li className="mb-2">{t('personal_info_1')}</li>
              <li className="mb-2">{t('personal_info_2')}</li>
              <li className="mb-2">{t('personal_info_3')}</li>
              <li className="mb-2">{t('personal_info_4')}</li>
            </ul>

            <h3 className="mb-4 text-2xl font-semibold text-gray-800">
              {t('property_information_title')}
            </h3>
            <ul className="mb-4 list-disc pl-6 text-gray-600">
              <li className="mb-2">{t('property_info_1')}</li>
              <li className="mb-2">{t('property_info_2')}</li>
              <li className="mb-2">{t('property_info_3')}</li>
              <li className="mb-2">{t('property_info_4')}</li>
            </ul>

            <h3 className="mb-4 text-2xl font-semibold text-gray-800">
              {t('technical_information_title')}
            </h3>
            <ul className="mb-4 list-disc pl-6 text-gray-600">
              <li className="mb-2">{t('technical_info_1')}</li>
              <li className="mb-2">{t('technical_info_2')}</li>
              <li className="mb-2">{t('technical_info_3')}</li>
              <li className="mb-2">{t('technical_info_4')}</li>
            </ul>
          </section>

          {/* How We Use Information */}
          <section className="mb-12">
            <h2 className="mb-6 text-3xl font-semibold text-gray-800">
              {t('use_information_title')}
            </h2>
            <p className="mb-4 leading-relaxed text-gray-600">{t('use_information_text')}</p>
            <ul className="mb-4 list-disc pl-6 text-gray-600">
              <li className="mb-2">{t('use_purpose_1')}</li>
              <li className="mb-2">{t('use_purpose_2')}</li>
              <li className="mb-2">{t('use_purpose_3')}</li>
              <li className="mb-2">{t('use_purpose_4')}</li>
              <li className="mb-2">{t('use_purpose_5')}</li>
            </ul>
          </section>

          {/* Information Sharing */}
          <section className="mb-12">
            <h2 className="mb-6 text-3xl font-semibold text-gray-800">
              {t('information_sharing_title')}
            </h2>
            <p className="mb-4 leading-relaxed text-gray-600">{t('information_sharing_text')}</p>

            <h3 className="mb-4 text-2xl font-semibold text-gray-800">
              {t('third_party_services_title')}
            </h3>
            <p className="mb-4 leading-relaxed text-gray-600">{t('third_party_services_text')}</p>
            <ul className="mb-4 list-disc pl-6 text-gray-600">
              <li className="mb-2">{t('third_party_1')}</li>
              <li className="mb-2">{t('third_party_2')}</li>
              <li className="mb-2">{t('third_party_3')}</li>
            </ul>
          </section>

          {/* Data Security */}
          <section className="mb-12">
            <h2 className="mb-6 text-3xl font-semibold text-gray-800">
              {t('data_security_title')}
            </h2>
            <p className="mb-4 leading-relaxed text-gray-600">{t('data_security_text')}</p>
            <ul className="mb-4 list-disc pl-6 text-gray-600">
              <li className="mb-2">{t('security_measure_1')}</li>
              <li className="mb-2">{t('security_measure_2')}</li>
              <li className="mb-2">{t('security_measure_3')}</li>
              <li className="mb-2">{t('security_measure_4')}</li>
            </ul>
          </section>

          {/* Your Rights */}
          <section className="mb-12">
            <h2 className="mb-6 text-3xl font-semibold text-gray-800">{t('your_rights_title')}</h2>
            <p className="mb-4 leading-relaxed text-gray-600">{t('your_rights_text')}</p>
            <ul className="mb-4 list-disc pl-6 text-gray-600">
              <li className="mb-2">{t('right_1')}</li>
              <li className="mb-2">{t('right_2')}</li>
              <li className="mb-2">{t('right_3')}</li>
              <li className="mb-2">{t('right_4')}</li>
              <li className="mb-2">{t('right_5')}</li>
            </ul>
          </section>

          {/* Cookies */}
          <section className="mb-12">
            <h2 className="mb-6 text-3xl font-semibold text-gray-800">{t('cookies_title')}</h2>
            <p className="mb-4 leading-relaxed text-gray-600">{t('cookies_text')}</p>
            <ul className="mb-4 list-disc pl-6 text-gray-600">
              <li className="mb-2">{t('cookie_type_1')}</li>
              <li className="mb-2">{t('cookie_type_2')}</li>
              <li className="mb-2">{t('cookie_type_3')}</li>
            </ul>
          </section>

          {/* Data Retention */}
          <section className="mb-12">
            <h2 className="mb-6 text-3xl font-semibold text-gray-800">
              {t('data_retention_title')}
            </h2>
            <p className="mb-4 leading-relaxed text-gray-600">{t('data_retention_text')}</p>
          </section>

          {/* Children's Privacy */}
          <section className="mb-12">
            <h2 className="mb-6 text-3xl font-semibold text-gray-800">
              {t('children_privacy_title')}
            </h2>
            <p className="mb-4 leading-relaxed text-gray-600">{t('children_privacy_text')}</p>
          </section>

          {/* Changes to Privacy Policy */}
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
                <strong>{t('contact_email')}:</strong> privacy@renttrackr.com
                <br />
                <strong>{t('contact_address')}:</strong> RentTrackr Privacy Officer
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
