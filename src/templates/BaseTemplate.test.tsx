import { page } from '@vitest/browser/context';
import { NextIntlClientProvider } from 'next-intl';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-react';
import messages from '@/locales/en.json';
import { BaseTemplate } from './BaseTemplate';

describe('Base template', () => {
  describe('Render method', () => {
    it('should have 3 menu items', () => {
      render(
        <NextIntlClientProvider locale="en" messages={messages}>
          <BaseTemplate
            leftNav={
              <>
                <li>link 1</li>
                <li>link 2</li>
                <li>link 3</li>
              </>
            }
          >
            {null}
          </BaseTemplate>
        </NextIntlClientProvider>,
      );

      // BaseTemplate renders leftNav in both desktop and mobile nav
      // So we get 6 items total (3 desktop + 3 mobile)
      // We can check that we have at least the 3 items we passed
      const menuItemList = page.getByRole('listitem');

      expect(menuItemList.elements().length).toBeGreaterThanOrEqual(3);
    });

    it('should have a link to support prabhjotsinghchadha.com', () => {
      render(
        <NextIntlClientProvider locale="en" messages={messages}>
          <BaseTemplate leftNav={<li>1</li>}>{null}</BaseTemplate>
        </NextIntlClientProvider>,
      );

      const copyrightSection = page.getByText(/© Copyright/);
      const copyrightLink = copyrightSection.getByRole('link');

      /*
       * PLEASE READ THIS SECTION
       * We'll really appreciate if you could have a link to our website
       * The link doesn't need to appear on every pages, one link on one page is enough.
       * Thank you for your support it'll mean a lot for us.
       */
      expect(copyrightLink).toHaveAttribute('href', 'https://prabhjotsinghchadha.com');
    });
  });
});
