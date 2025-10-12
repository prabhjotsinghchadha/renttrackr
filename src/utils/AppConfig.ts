import type { LocalizationResource } from '@clerk/types';
import type { LocalePrefixMode } from 'next-intl/routing';
import { enUS, esES, frFR, hiIN } from '@clerk/localizations';

const localePrefix: LocalePrefixMode = 'as-needed';

// FIXME: Update this configuration file based on your project information
export const AppConfig = {
  name: 'RentTrackr',
  locales: ['en', 'es', 'fr', 'hi'],
  defaultLocale: 'en',
  localePrefix,
};

const supportedLocales: Record<string, LocalizationResource> = {
  en: enUS,
  es: esES,
  fr: frFR,
  hi: hiIN,
};

export const ClerkLocalizations = {
  defaultLocale: enUS,
  supportedLocales,
};
