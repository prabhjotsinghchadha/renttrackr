import { useTranslations } from 'next-intl';
import { AppConfig } from '@/utils/AppConfig';

export const BaseTemplate = (props: {
  leftNav: React.ReactNode;
  rightNav?: React.ReactNode;
  children: React.ReactNode;
}) => {
  const t = useTranslations('BaseTemplate');

  return (
    <div className="min-h-screen w-full bg-white text-gray-700 antialiased">
      <div className="mx-auto">
        {/* Header */}
        <header className="border-b border-gray-200 bg-white shadow-sm">
          <div className="px-6 py-6 md:px-12 lg:px-16 xl:px-24">
            {/* Logo and Description */}
            <div className="mb-6">
              <h1 className="mb-2 flex items-center gap-2 text-3xl font-bold text-gray-800 md:text-4xl">
                <span className="text-4xl">🏠</span>
                {AppConfig.name}
              </h1>
              <p className="text-lg text-gray-600">{t('description')}</p>
            </div>

            {/* Navigation */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <nav aria-label="Main navigation">
                <ul className="flex flex-wrap gap-x-6 gap-y-3 text-lg">{props.leftNav}</ul>
              </nav>

              {props.rightNav && (
                <nav aria-label="Secondary navigation">
                  <ul className="flex flex-wrap gap-x-6 gap-y-3 text-lg">{props.rightNav}</ul>
                </nav>
              )}
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="min-h-[calc(100vh-300px)] px-6 md:px-12 lg:px-16 xl:px-24">
          {props.children}
        </main>

        {/* Footer */}
        <footer className="border-t border-gray-200 bg-gray-50 px-6 py-12 text-center md:px-12 lg:px-16 xl:px-24">
          <p className="text-lg leading-relaxed text-gray-600">
            {`© Copyright ${new Date().getFullYear()} ${AppConfig.name}. `}
            {t.rich('made_with', {
              author: () => (
                <a
                  href="https://prabhjotsinghchadha.com"
                  className="text-blue-600 transition-colors hover:text-blue-700 hover:underline"
                >
                  Prabhjot Singh Chadha
                </a>
              ),
            })}
          </p>
          {/*
           * PLEASE READ THIS SECTION
           * I'm an indie maker with limited resources and funds, I'll really appreciate if you could have a link to my website.
           * The link doesn't need to appear on every pages, one link on one page is enough.
           * For example, in the `About` page. Thank you for your support, it'll mean a lot to me.
           */}
        </footer>
      </div>
    </div>
  );
};
