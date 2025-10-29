'use client';

import { useTheme } from '@/contexts/ThemeContext';

type ThemeToggleProps = {
  className?: string;
};

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = '' }) => {
  // Handle case when ThemeProvider is not available (SSR)
  let theme: 'light' | 'dark' = 'light';
  let toggleTheme: () => void = () => {};

  try {
    const themeContext = useTheme();
    theme = themeContext.theme;
    toggleTheme = themeContext.toggleTheme;
  } catch {
    // ThemeProvider not available, use default values
    console.warn('ThemeProvider not available, using default theme');
  }

  // Always show light mode icon initially to prevent hydration mismatch
  // This will update after client-side hydration completes
  const icon = theme === 'light' ? '🌙' : '☀️';
  const ariaLabel = `Switch to ${theme === 'light' ? 'dark' : 'light'} mode`;

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`
        flex h-11 w-11 items-center justify-center
        rounded-lg border border-gray-200
        bg-transparent transition-colors
        duration-300 hover:bg-gray-100
        focus:ring-4 focus:ring-blue-300
        focus:outline-none dark:border-gray-600 dark:hover:bg-gray-700
        ${className}
      `}
      aria-label={ariaLabel}
      title={ariaLabel}
      suppressHydrationWarning
    >
      <span className="text-lg" suppressHydrationWarning>
        {icon}
      </span>
    </button>
  );
};
