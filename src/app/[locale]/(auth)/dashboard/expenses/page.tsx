import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import Link from 'next/link';
import {
  deleteExpense,
  getExpenseMetrics,
  getExpensesWithPropertyInfo,
  updateExpense,
} from '@/actions/ExpenseActions';
import { CurrencyDisplay } from '@/components/CurrencyDisplay';
import { DeleteExpenseDialog } from '@/components/DeleteExpenseDialog';
import { EditExpenseForm } from '@/components/Form/EditExpenseForm';

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({
    locale,
    namespace: 'Expenses',
  });

  return {
    title: t('meta_title'),
    description: t('meta_description'),
  };
}

export default async function ExpensesPage(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  const t = await getTranslations({
    locale,
    namespace: 'Expenses',
  });

  // Fetch expenses and metrics from database
  const expensesResult = await getExpensesWithPropertyInfo();
  const expenses = expensesResult.success ? expensesResult.expenses : [];

  const metrics = await getExpenseMetrics();

  return (
    <div className="py-8 md:py-12">
      <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h1 className="text-4xl font-bold text-gray-800 md:text-5xl">{t('page_title')}</h1>
        <Link
          href={`/${locale}/dashboard/expenses/new`}
          className="inline-block rounded-xl bg-blue-600 px-8 py-4 text-center text-xl font-semibold text-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:bg-blue-700 hover:shadow-xl focus:ring-4 focus:ring-blue-300 focus:outline-none"
        >
          {t('add_expense')}
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="mb-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="group rounded-xl bg-gray-50 p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
          <div className="mb-4 text-4xl">📅</div>
          <div className="mb-2 text-lg font-semibold text-gray-600">{t('total_this_month')}</div>
          <div className="text-4xl font-bold text-gray-800">
            <CurrencyDisplay amount={metrics.totalThisMonth} />
          </div>
        </div>
        <div className="group rounded-xl bg-gray-50 p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
          <div className="mb-4 text-4xl">📆</div>
          <div className="mb-2 text-lg font-semibold text-gray-600">{t('total_this_year')}</div>
          <div className="text-4xl font-bold text-gray-800">
            <CurrencyDisplay amount={metrics.totalThisYear} />
          </div>
        </div>
        <div className="group rounded-xl bg-gray-50 p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
          <div className="mb-4 text-4xl">🔧</div>
          <div className="mb-2 text-lg font-semibold text-gray-600">{t('maintenance')}</div>
          <div className="text-4xl font-bold text-gray-800">
            <CurrencyDisplay amount={metrics.maintenance} />
          </div>
        </div>
        <div className="group rounded-xl bg-gray-50 p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
          <div className="mb-4 text-4xl">🏢</div>
          <div className="mb-2 text-lg font-semibold text-gray-600">{t('association')}</div>
          <div className="text-4xl font-bold text-gray-800">
            <CurrencyDisplay amount={metrics.association} />
          </div>
        </div>
      </div>

      {/* Expense List */}
      <div className="overflow-hidden rounded-xl bg-gray-50">
        <div className="p-8">
          {expenses.length === 0 ? (
            <div className="py-12 text-center">
              <div className="mb-6 text-8xl">📄</div>
              <h3 className="mb-4 text-2xl font-semibold text-gray-800">{t('no_expenses')}</h3>
              <p className="mb-8 text-xl leading-relaxed text-gray-600">
                {t('no_expenses_description')}
              </p>
              <Link
                href={`/${locale}/dashboard/expenses/new`}
                className="inline-block rounded-xl bg-blue-600 px-8 py-4 text-xl font-semibold text-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:bg-blue-700 hover:shadow-xl focus:ring-4 focus:ring-blue-300 focus:outline-none"
              >
                {t('add_first_expense')}
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="px-4 py-4 text-left text-lg font-semibold text-gray-700">
                      {t('property')}
                    </th>
                    <th className="px-4 py-4 text-left text-lg font-semibold text-gray-700">
                      {t('type')}
                    </th>
                    <th className="px-4 py-4 text-left text-lg font-semibold text-gray-700">
                      {t('amount')}
                    </th>
                    <th className="px-4 py-4 text-left text-lg font-semibold text-gray-700">
                      {t('date')}
                    </th>
                    <th className="px-4 py-4 text-left text-lg font-semibold text-gray-700">
                      {t('actions')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.map((expense: any) => (
                    <tr
                      key={expense.id}
                      className="border-b border-gray-200 transition-colors hover:bg-gray-100"
                    >
                      <td className="px-4 py-4 text-lg text-gray-800">{expense.propertyAddress}</td>
                      <td className="px-4 py-4 text-lg text-gray-600">{expense.type}</td>
                      <td className="px-4 py-4 text-lg font-semibold text-red-600">
                        <CurrencyDisplay amount={expense.amount} />
                      </td>
                      <td className="px-4 py-4 text-lg text-gray-600">
                        {new Date(expense.date).toLocaleDateString(locale, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex gap-2">
                          <EditExpenseForm
                            expense={expense}
                            locale={locale}
                            onUpdate={async (updatedExpense: {
                              type: string;
                              amount: number;
                              date: Date;
                            }) => {
                              'use server';
                              const result = await updateExpense(expense.id, updatedExpense);
                              if (result.success) {
                                // Refresh the page to show updated data
                                window.location.reload();
                              }
                              return result;
                            }}
                          />
                          <DeleteExpenseDialog
                            expense={expense}
                            locale={locale}
                            onDelete={async () => {
                              'use server';
                              const result = await deleteExpense(expense.id);
                              if (result.success) {
                                // Refresh the page to show updated data
                                window.location.reload();
                              }
                              return result;
                            }}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
