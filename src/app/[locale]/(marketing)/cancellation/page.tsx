import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';

type ICancellationPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata(props: ICancellationPageProps): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({
    locale,
    namespace: 'Cancellation',
  });

  return {
    title: t('meta_title'),
    description: t('meta_description'),
  };
}

export default async function CancellationPage(props: ICancellationPageProps) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  const t = await getTranslations({
    locale,
    namespace: 'Cancellation',
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

          {/* Subscription Cancellation */}
          <section className="mb-12">
            <h2 className="mb-6 text-3xl font-semibold text-gray-800">{t('cancellation_title')}</h2>
            <p className="mb-4 leading-relaxed text-gray-600">{t('cancellation_text')}</p>

            <h3 className="mb-4 text-2xl font-semibold text-gray-800">
              {t('how_to_cancel_title')}
            </h3>
            <p className="mb-4 leading-relaxed text-gray-600">{t('how_to_cancel_text')}</p>
            <ol className="mb-4 list-decimal pl-6 text-gray-600">
              <li className="mb-2">{t('cancel_step_1')}</li>
              <li className="mb-2">{t('cancel_step_2')}</li>
              <li className="mb-2">{t('cancel_step_3')}</li>
              <li className="mb-2">{t('cancel_step_4')}</li>
            </ol>

            <h3 className="mb-4 text-2xl font-semibold text-gray-800">
              {t('cancellation_timing_title')}
            </h3>
            <p className="mb-4 leading-relaxed text-gray-600">{t('cancellation_timing_text')}</p>
          </section>

          {/* Refund Policy */}
          <section className="mb-12">
            <h2 className="mb-6 text-3xl font-semibold text-gray-800">
              {t('refund_policy_title')}
            </h2>
            <p className="mb-4 leading-relaxed text-gray-600">{t('refund_policy_text')}</p>

            <h3 className="mb-4 text-2xl font-semibold text-gray-800">
              {t('refund_eligibility_title')}
            </h3>
            <p className="mb-4 leading-relaxed text-gray-600">{t('refund_eligibility_text')}</p>
            <ul className="mb-4 list-disc pl-6 text-gray-600">
              <li className="mb-2">{t('refund_condition_1')}</li>
              <li className="mb-2">{t('refund_condition_2')}</li>
              <li className="mb-2">{t('refund_condition_3')}</li>
              <li className="mb-2">{t('refund_condition_4')}</li>
            </ul>

            <h3 className="mb-4 text-2xl font-semibold text-gray-800">
              {t('refund_process_title')}
            </h3>
            <p className="mb-4 leading-relaxed text-gray-600">{t('refund_process_text')}</p>
            <ol className="mb-4 list-decimal pl-6 text-gray-600">
              <li className="mb-2">{t('refund_step_1')}</li>
              <li className="mb-2">{t('refund_step_2')}</li>
              <li className="mb-2">{t('refund_step_3')}</li>
              <li className="mb-2">{t('refund_step_4')}</li>
            </ol>
          </section>

          {/* Refund Timeline */}
          <section className="mb-12">
            <h2 className="mb-6 text-3xl font-semibold text-gray-800">
              {t('refund_timeline_title')}
            </h2>
            <div className="rounded-lg bg-blue-50 p-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <h4 className="mb-2 text-xl font-semibold text-gray-800">
                    {t('processing_time_title')}
                  </h4>
                  <p className="text-gray-600">{t('processing_time_text')}</p>
                </div>
                <div>
                  <h4 className="mb-2 text-xl font-semibold text-gray-800">
                    {t('bank_processing_title')}
                  </h4>
                  <p className="text-gray-600">{t('bank_processing_text')}</p>
                </div>
              </div>
            </div>
          </section>

          {/* Non-Refundable Items */}
          <section className="mb-12">
            <h2 className="mb-6 text-3xl font-semibold text-gray-800">
              {t('non_refundable_title')}
            </h2>
            <p className="mb-4 leading-relaxed text-gray-600">{t('non_refundable_text')}</p>
            <ul className="mb-4 list-disc pl-6 text-gray-600">
              <li className="mb-2">{t('non_refundable_item_1')}</li>
              <li className="mb-2">{t('non_refundable_item_2')}</li>
              <li className="mb-2">{t('non_refundable_item_3')}</li>
              <li className="mb-2">{t('non_refundable_item_4')}</li>
            </ul>
          </section>

          {/* Partial Refunds */}
          <section className="mb-12">
            <h2 className="mb-6 text-3xl font-semibold text-gray-800">
              {t('partial_refunds_title')}
            </h2>
            <p className="mb-4 leading-relaxed text-gray-600">{t('partial_refunds_text')}</p>
            <div className="rounded-lg bg-yellow-50 p-6">
              <h4 className="mb-2 text-lg font-semibold text-gray-800">
                {t('partial_refund_note_title')}
              </h4>
              <p className="text-gray-600">{t('partial_refund_note_text')}</p>
            </div>
          </section>

          {/* Chargebacks and Disputes */}
          <section className="mb-12">
            <h2 className="mb-6 text-3xl font-semibold text-gray-800">{t('chargebacks_title')}</h2>
            <p className="mb-4 leading-relaxed text-gray-600">{t('chargebacks_text')}</p>
            <ul className="mb-4 list-disc pl-6 text-gray-600">
              <li className="mb-2">{t('chargeback_consequence_1')}</li>
              <li className="mb-2">{t('chargeback_consequence_2')}</li>
              <li className="mb-2">{t('chargeback_consequence_3')}</li>
            </ul>
          </section>

          {/* Account Termination */}
          <section className="mb-12">
            <h2 className="mb-6 text-3xl font-semibold text-gray-800">
              {t('account_termination_title')}
            </h2>
            <p className="mb-4 leading-relaxed text-gray-600">{t('account_termination_text')}</p>
            <ul className="mb-4 list-disc pl-6 text-gray-600">
              <li className="mb-2">{t('termination_effect_1')}</li>
              <li className="mb-2">{t('termination_effect_2')}</li>
              <li className="mb-2">{t('termination_effect_3')}</li>
            </ul>
          </section>

          {/* Reinstatement */}
          <section className="mb-12">
            <h2 className="mb-6 text-3xl font-semibold text-gray-800">
              {t('reinstatement_title')}
            </h2>
            <p className="mb-4 leading-relaxed text-gray-600">{t('reinstatement_text')}</p>
          </section>

          {/* Contact Information */}
          <section className="mb-12">
            <h2 className="mb-6 text-3xl font-semibold text-gray-800">{t('contact_title')}</h2>
            <p className="mb-4 leading-relaxed text-gray-600">{t('contact_text')}</p>
            <div className="rounded-lg bg-gray-50 p-6">
              <p className="text-gray-600">
                <strong>{t('contact_email')}:</strong> billing@renttrackr.com
                <br />
                <strong>{t('contact_phone')}:</strong> 1-800-555-0123
                <br />
                <strong>{t('contact_address')}:</strong> RentTrackr Billing Department
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
