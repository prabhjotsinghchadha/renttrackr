import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({
    locale,
    namespace: 'Renovations',
  });

  return {
    title: t('meta_title'),
    description: t('meta_description'),
  };
}

export default async function RenovationsPage(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  const t = await getTranslations({
    locale,
    namespace: 'Renovations',
  });

  // TODO: Fetch renovation tasks from database
  const tasks = [];

  return (
    <div className="py-8 md:py-12">
      <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h1 className="text-4xl font-bold text-gray-800 md:text-5xl">{t('page_title')}</h1>
        <button
          type="button"
          className="inline-block rounded-xl bg-blue-600 px-8 py-4 text-center text-xl font-semibold text-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:bg-blue-700 hover:shadow-xl focus:ring-4 focus:ring-blue-300 focus:outline-none"
        >
          {t('add_task')}
        </button>
      </div>

      {/* Status Overview */}
      <div className="mb-10 grid gap-6 sm:grid-cols-3">
        <div className="group rounded-xl bg-gray-50 p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
          <div className="mb-4 text-4xl">⏳</div>
          <div className="mb-2 text-lg font-semibold text-gray-600">{t('pending_tasks')}</div>
          <div className="text-4xl font-bold text-yellow-600">0</div>
        </div>
        <div className="group rounded-xl bg-gray-50 p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
          <div className="mb-4 text-4xl">🔨</div>
          <div className="mb-2 text-lg font-semibold text-gray-600">{t('in_progress')}</div>
          <div className="text-4xl font-bold text-blue-600">0</div>
        </div>
        <div className="group rounded-xl bg-gray-50 p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
          <div className="mb-4 text-4xl">✅</div>
          <div className="mb-2 text-lg font-semibold text-gray-600">{t('completed')}</div>
          <div className="text-4xl font-bold text-green-600">0</div>
        </div>
      </div>

      {/* Task List */}
      <div className="overflow-hidden rounded-xl bg-gray-50">
        <div className="p-8">
          {tasks.length === 0 ? (
            <div className="py-12 text-center">
              <div className="mb-6 text-8xl">🛠️</div>
              <h3 className="mb-4 text-2xl font-semibold text-gray-800">{t('no_tasks')}</h3>
              <p className="mb-8 text-xl leading-relaxed text-gray-600">
                {t('no_tasks_description')}
              </p>
              <button
                type="button"
                className="inline-block rounded-xl bg-blue-600 px-8 py-4 text-xl font-semibold text-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:bg-blue-700 hover:shadow-xl focus:ring-4 focus:ring-blue-300 focus:outline-none"
              >
                {t('add_first_task')}
              </button>
            </div>
          ) : (
            <div className="space-y-4">{/* Task items will be rendered here */}</div>
          )}
        </div>
      </div>
    </div>
  );
}
