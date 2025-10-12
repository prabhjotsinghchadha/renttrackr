'use client';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { AppConfig } from '@/utils/AppConfig';

export const BaseTemplate = (props: {
  leftNav: React.ReactNode;
  rightNav?: React.ReactNode;
  children: React.ReactNode;
}) => {
  const t = useTranslations('BaseTemplate');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 text-gray-700 antialiased">
      {/* Header */}
      <header className="relative sticky top-0 z-50 border-b border-gray-200 bg-white shadow-sm">
        <div className="mx-auto max-w-[1920px]">
          <div className="flex items-center justify-between gap-6 px-6 py-4 md:px-8 lg:px-12">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <span className="text-3xl" aria-hidden="true">
                🏠
              </span>
              <h1 className="text-2xl font-bold text-gray-800 lg:text-3xl">{AppConfig.name}</h1>
            </div>

            {/* Navigation Container */}
            <div className="flex flex-1 items-center justify-between gap-6">
              {/* Main Navigation */}
              <nav aria-label="Main navigation" className="hidden flex-1 justify-center lg:flex">
                <ul className="flex flex-wrap items-center gap-x-1 xl:gap-x-2">{props.leftNav}</ul>
              </nav>

              {/* Right Navigation */}
              {props.rightNav && (
                <nav aria-label="Secondary navigation" className="hidden lg:flex">
                  <ul className="flex items-center gap-x-4">{props.rightNav}</ul>
                </nav>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="flex items-center justify-center rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-800 lg:hidden"
              aria-label="Toggle menu"
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="size-6"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="size-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                  />
                </svg>
              )}
            </button>
          </div>

          {/* Mobile Navigation */}
          <div
            className={`relative z-40 border-t border-gray-200 bg-white px-6 py-4 shadow-sm transition-all duration-300 ease-in-out lg:hidden ${
              isMobileMenuOpen ? 'max-h-[37.5rem] opacity-100' : 'max-h-0 overflow-hidden opacity-0'
            }`}
          >
            <nav aria-label="Mobile main navigation" className="mb-4">
              <ul className="space-y-2">{props.leftNav}</ul>
            </nav>
            {props.rightNav && (
              <nav
                aria-label="Mobile secondary navigation"
                className="border-t border-gray-200 pt-4"
              >
                <ul className="space-y-2">{props.rightNav}</ul>
              </nav>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 mx-auto w-full max-w-[1920px] flex-1 px-6 py-8 md:px-8 md:py-12 lg:px-12">
        {props.children}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-gray-800 px-6 py-8 text-center md:px-8 lg:px-12">
        <div className="mx-auto max-w-[1920px]">
          <p className="text-lg leading-relaxed text-blue-200">
            {`© Copyright ${new Date().getFullYear()} ${AppConfig.name}. `}
            {t.rich('made_with', {
              author: () => (
                <a
                  href="https://prabhjotsinghchadha.com"
                  className="text-blue-300 transition-colors hover:text-white hover:underline"
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
        </div>
      </footer>
    </div>
  );
};
