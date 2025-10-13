import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import Link from 'next/link';
import { FeatureCard } from '@/components/FeatureCard';
import { HeroSection } from '@/components/HeroSection';
import { TrustSection } from '@/components/TrustSection';

type IIndexProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata(props: IIndexProps): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({
    locale,
    namespace: 'Index',
  });

  return {
    title: t('meta_title'),
    description: t('meta_description'),
  };
}

export default async function Index(props: IIndexProps) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  const t = await getTranslations({
    locale,
    namespace: 'Index',
  });

  return (
    <div className="w-full">
      {/* Hero Section */}
      <HeroSection
        title={t('hero_title')}
        subtitle={t('hero_subtitle')}
        ctaText={t('cta_get_started')}
        ctaLink="/sign-up/"
      />

      {/* Features Section */}
      <section className="w-full bg-white px-6 py-16 md:px-12 md:py-20 lg:px-16 xl:px-24">
        <div className="mx-auto">
          <h2 className="mb-4 text-center text-4xl font-bold text-gray-800 md:text-5xl">
            {t('features_title')}
          </h2>
          <p className="mb-12 text-center text-2xl text-gray-600">{t('features_subtitle')}</p>

          <div className="mt-8 grid gap-10 md:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon="💰"
              title={t('feature_rent_tracking_title')}
              description={t('feature_rent_tracking_description')}
            />
            <FeatureCard
              icon="🔧"
              title={t('feature_maintenance_title')}
              description={t('feature_maintenance_description')}
            />
            <FeatureCard
              icon="👥"
              title={t('feature_tenant_info_title')}
              description={t('feature_tenant_info_description')}
            />
            <FeatureCard
              icon="🔔"
              title={t('feature_reminders_title')}
              description={t('feature_reminders_description')}
            />
            <FeatureCard
              icon="📊"
              title={t('feature_reports_title')}
              description={t('feature_reports_description')}
            />
            <FeatureCard
              icon="🔒"
              title={t('feature_security_title')}
              description={t('feature_security_description')}
            />
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <TrustSection title={t('trust_title')} description={t('trust_description')} />

      {/* Footer */}
      <footer className="w-full bg-gray-800 px-6 py-12 text-white md:px-12 lg:px-16 xl:px-24">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Company Info */}
          <div>
            <h4 className="mb-4 text-2xl font-semibold">
              🏠
              {t('footer_brand')}
            </h4>
            <p className="text-lg leading-relaxed text-blue-200">{t('footer_tagline')}</p>
          </div>

          {/* Support Links */}
          <div>
            <h4 className="mb-4 text-xl font-semibold">{t('footer_support_title')}</h4>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/support/"
                  className="text-lg text-blue-200 transition-colors hover:text-white"
                >
                  {t('footer_help_center')}
                </Link>
              </li>
              <li>
                <Link
                  href="/support/"
                  className="text-lg text-blue-200 transition-colors hover:text-white"
                >
                  {t('footer_contact_us')}
                </Link>
              </li>
              <li>
                <Link
                  href="/support/"
                  className="text-lg text-blue-200 transition-colors hover:text-white"
                >
                  {t('footer_faq')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="mb-4 text-xl font-semibold">{t('footer_company_title')}</h4>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/about/"
                  className="text-lg text-blue-200 transition-colors hover:text-white"
                >
                  {t('footer_about_us')}
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy/"
                  className="text-lg text-blue-200 transition-colors hover:text-white"
                >
                  {t('footer_privacy')}
                </Link>
              </li>
              <li>
                <Link
                  href="/terms/"
                  className="text-lg text-blue-200 transition-colors hover:text-white"
                >
                  {t('footer_terms')}
                </Link>
              </li>
              <li>
                <Link
                  href="/cancellation/"
                  className="text-lg text-blue-200 transition-colors hover:text-white"
                >
                  {t('footer_cancellation')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="mb-4 text-xl font-semibold">{t('footer_contact_title')}</h4>
            <ul className="space-y-3">
              <li>
                <a
                  href="mailto:support@renttrackr.com"
                  className="text-lg text-blue-200 transition-colors hover:text-white"
                >
                  support@renttrackr.com
                </a>
              </li>
              <li>
                <a
                  href="tel:1-800-555-0123"
                  className="text-lg text-blue-200 transition-colors hover:text-white"
                >
                  1-800-555-0123
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="mt-10 border-t border-gray-600 pt-8 text-center">
          <p className="text-lg text-blue-200">{t('footer_copyright')}</p>
        </div>
      </footer>
    </div>
  );
}
