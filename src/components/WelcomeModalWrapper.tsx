'use client';

import type { OnboardingStep } from '@/actions/OnboardingActions';
import { useEffect, useState } from 'react';
import { WelcomeModal } from './WelcomeModal';

type WelcomeModalWrapperProps = {
  showWelcome: boolean;
  steps: OnboardingStep[];
  locale: string;
};

export function WelcomeModalWrapper({ showWelcome, steps, locale }: WelcomeModalWrapperProps) {
  const [shouldShow, setShouldShow] = useState(false);

  useEffect(() => {
    // Check if user has dismissed the modal before
    const dismissed = localStorage.getItem('welcomeModalDismissed') === 'true';
    setShouldShow(showWelcome && !dismissed);
  }, [showWelcome]);

  const handleDismiss = () => {
    localStorage.setItem('welcomeModalDismissed', 'true');
    setShouldShow(false);
  };

  return (
    <WelcomeModal
      open={shouldShow}
      onDismiss={handleDismiss}
      steps={steps}
      locale={locale}
    />
  );
}

