'use client';

import type { OnboardingStep } from '@/actions/OnboardingActions';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useEffect, useState } from 'react';

type WelcomeModalProps = {
  open: boolean;
  onDismiss: () => void;
  steps: OnboardingStep[];
  locale: string;
};

export function WelcomeModal({ open, onDismiss, steps, locale }: WelcomeModalProps) {
  const t = useTranslations('Onboarding');
  const [isClosing, setIsClosing] = useState(false);
  const [isVisible, setIsVisible] = useState(open);

  useEffect(() => {
    setIsVisible(open);
  }, [open]);

  if (!isVisible) return null;

  const handleDismiss = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsVisible(false);
      onDismiss();
      setIsClosing(false);
    }, 200);
  };

  const firstIncompleteStep = steps.find((step) => !step.complete);

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 transition-opacity ${
        isClosing ? 'opacity-0' : 'opacity-100'
      }`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="welcome-modal-title"
    >
      <button
        type="button"
        onClick={handleDismiss}
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            handleDismiss();
          }
        }}
        className="absolute inset-0 -z-10 h-full w-full"
        aria-label={t('close_modal')}
      />
      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
      <div
        className={`w-full max-w-2xl rounded-xl bg-white shadow-2xl transition-all ${
          isClosing ? 'scale-95 opacity-0' : 'scale-100 opacity-100'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <h2 id="welcome-modal-title" className="text-3xl font-bold text-gray-800">
              {t('welcome_title_with_emoji')}
            </h2>
            <button
              type="button"
              onClick={handleDismiss}
              className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
              aria-label={t('close')}
            >
              ✕
            </button>
          </div>
        </div>

        <div className="p-6">
          <p className="mb-6 text-lg text-gray-600">{t('welcome_description')}</p>

          <div className="mb-6 space-y-4">
            {steps.map((step, index) => (
              <div
                key={step.key}
                className="flex items-start gap-4 rounded-lg border-2 border-gray-200 bg-gray-50 p-4"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-500 font-bold text-white">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800">{step.title}</h3>
                  <p className="mt-1 text-sm text-gray-600">{step.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            {firstIncompleteStep && (
              <Link
                href={`/${locale}${firstIncompleteStep.ctaHref}`}
                className="flex-1 rounded-lg bg-blue-600 px-6 py-3 text-center font-semibold text-white transition-all duration-300 hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 focus:outline-none"
                onClick={handleDismiss}
              >
                {firstIncompleteStep.ctaText}
              </Link>
            )}
            <button
              type="button"
              onClick={handleDismiss}
              className="rounded-lg border-2 border-gray-300 bg-white px-6 py-3 font-semibold text-gray-700 transition-all duration-300 hover:bg-gray-50 focus:outline-none"
            >
              {t('explore_first')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

