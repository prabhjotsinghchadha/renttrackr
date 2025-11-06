'use client';

import type { OnboardingStep } from '@/actions/OnboardingActions';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useState } from 'react';

type OnboardingChecklistProps = {
  steps: OnboardingStep[];
  locale: string;
};

export function OnboardingChecklist({ steps, locale }: OnboardingChecklistProps) {
  const t = useTranslations('Onboarding');
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Don't show if all steps are complete
  if (steps.every((step) => step.complete)) {
    return null;
  }

  const completedCount = steps.filter((step) => step.complete).length;
  const totalSteps = steps.length;
  const progressPercentage = (completedCount / totalSteps) * 100;

  return (
    <div className="mb-8 rounded-xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-purple-50 p-6 shadow-lg">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="mb-2 flex items-center gap-3">
            <h2 className="text-2xl font-bold text-gray-800">{t('get_started_title')}</h2>
            <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-700">
              {t('checklist_progress', { completed: completedCount, total: totalSteps })}
            </span>
          </div>
          <p className="text-gray-600">{t('get_started_description')}</p>
        </div>
        <button
          type="button"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-white/50 hover:text-gray-600"
          aria-label={isCollapsed ? t('expand_checklist') : t('collapse_checklist')}
        >
          {isCollapsed ? '▼' : '▲'}
        </button>
      </div>

      {/* Progress bar */}
      <div className="my-4 h-2 w-full overflow-hidden rounded-full bg-gray-200">
        <div
          className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>

      {!isCollapsed && (
        <div className="mt-4 space-y-3">
          {steps.map((step, index) => (
            <div
              key={step.key}
              className={`flex items-start gap-4 rounded-lg border-2 p-4 transition-all ${
                step.complete
                  ? 'border-green-200 bg-green-50'
                  : 'border-gray-200 bg-white hover:border-blue-300'
              }`}
            >
              {/* Step number / Checkmark */}
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-bold ${
                  step.complete
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {step.complete ? '✓' : index + 1}
              </div>

              {/* Step content */}
              <div className="flex-1">
                <h3
                  className={`font-semibold ${
                    step.complete ? 'text-green-800' : 'text-gray-800'
                  }`}
                >
                  {step.title}
                </h3>
                <p className="mt-1 text-sm text-gray-600">{step.description}</p>
              </div>

              {/* CTA Button */}
              {!step.complete && (
                <Link
                  href={`/${locale}${step.ctaHref}`}
                  className="shrink-0 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-all duration-300 hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 focus:outline-none"
                >
                  {step.ctaText}
                </Link>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

