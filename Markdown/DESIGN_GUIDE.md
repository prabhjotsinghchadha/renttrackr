# RentTrackr Design Guide

A comprehensive design system for RentTrackr, focused on accessibility and usability for property owners aged 50+.

**Last Updated:** October 8, 2025
**Version:** 2.0 (HTML-Inspired Redesign)

---

## Design Principles

### 1. Clarity Over Cleverness

- Use straightforward layouts, not trendy designs
- Prioritize function over form
- Make every element's purpose immediately obvious

### 2. Accessibility First

- Meet WCAG AAA standards for text contrast
- Design for various visual abilities
- Support keyboard navigation fully

### 3. Comfort and Calm

- Use soothing colors that don't strain eyes
- Provide generous spacing (no crowding)
- Create a relaxed, unhurried feeling

### 4. Simplicity

- Clean, uncluttered interface
- Minimal navigation
- No unnecessary complexity

---

## Color System

### Primary Palette

#### Blue (Primary Brand Color)

- **Blue-600:** `#2563eb` - Primary buttons, links, logo
- **Blue-700:** `#1d4ed8` - Button hover states
- **Blue-300:** `#93c5fd` - Focus rings (4px)
- **Blue-200:** `#bfdbfe` - Light accents
- **Blue-100:** `#dbeafe` - Very light backgrounds
- **Blue-50:** `#eff6ff` - Section backgrounds, subtle tints

**Usage:** Primary actions, brand identity, trust-building elements

#### Grays (Text & Backgrounds)

- **Gray-800:** `#1f2937` - Primary headings, footer background
- **Gray-700:** `#374151` - Secondary headings
- **Gray-600:** `#4b5563` - Body text, descriptions
- **Gray-200:** `#e5e7eb` - Borders, dividers
- **Gray-50:** `#f9fafb` - Card backgrounds, subtle sections
- **White:** `#ffffff` - Main backgrounds, cards

**Usage:** All text, neutral backgrounds, cards

#### Sky (Gradient Accents)

- **Sky-50:** `#f0f9ff` - Gradient backgrounds (hero section)

**Usage:** Hero section gradients, special backgrounds

### Gradient Backgrounds

**Hero Gradient:**

```css
background: linear-gradient(to bottom right, #eff6ff, #f0f9ff, #dbeafe);
/* From blue-50 via sky-50 to blue-100 */
```

**Usage:** Hero section for visual interest without overwhelming

### Color Contrast Requirements

All text must meet **WCAG AAA** standards:

- **Normal text (< 18px):** 7:1 contrast ratio minimum
- **Large text (≥ 18px):** 4.5:1 contrast ratio minimum

**Approved Combinations:**
✅ Gray-800 on White (21:1)
✅ Gray-600 on White (12:1)
✅ White on Blue-600 (6.7:1)
✅ Gray-800 on Blue-50 (18:1)
✅ Blue-600 on White (8.6:1)

### Dark Mode Palette

#### Dark Backgrounds

- **Gray-900:** `#111827` - Primary dark background
- **Gray-800:** `#1f2937` - Secondary dark background, cards
- **Gray-700:** `#374151` - Tertiary dark background, elevated cards
- **Gray-600:** `#4b5563` - Dark borders, dividers

#### Dark Text Colors

- **White:** `#ffffff` - Primary text on dark backgrounds
- **Gray-100:** `#f3f4f6` - Secondary text on dark backgrounds
- **Gray-200:** `#e5e7eb` - Tertiary text, muted content
- **Gray-300:** `#d1d5db` - Disabled text, placeholders

#### Dark Mode Accents

- **Blue-400:** `#60a5fa` - Primary buttons, links in dark mode
- **Blue-500:** `#3b82f6` - Button hover states in dark mode
- **Blue-300:** `#93c5fd` - Focus rings, light accents
- **Blue-200:** `#bfdbfe` - Very light accents, borders

#### Dark Mode Gradients

**Dark Hero Gradient:**

```css
background: linear-gradient(to bottom right, #1f2937, #111827, #374151);
/* From gray-800 via gray-900 to gray-700 */
```

**Dark Card Gradient:**

```css
background: linear-gradient(to bottom right, #374151, #1f2937);
/* From gray-700 to gray-800 */
```

### Dark Mode Color Contrast Requirements

All dark mode text must meet **WCAG AAA** standards:

**Approved Dark Mode Combinations:**
✅ White on Gray-900 (21:1)
✅ Gray-100 on Gray-800 (12:1)
✅ Blue-400 on Gray-900 (8.2:1)
✅ Gray-200 on Gray-700 (9.1:1)
✅ White on Gray-800 (18:1)

---

## Typography

### Font Families

**Primary:** System font stack for instant loading

```css
font-family:
  -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
```

**Benefits:**

- Loads instantly (no web fonts)
- Optimized for each OS
- Excellent readability
- Familiar to users

### Font Sizes

#### Headings

- **H1 (Hero):** 48px - 72px (3rem - 4.5rem) - Page hero titles
- **H2 (Section):** 36px - 48px (2.25rem - 3rem) - Section titles
- **H3 (Card):** 24px (1.5rem) - Card titles, subsections
- **H4 (Footer):** 20px (1.25rem) - Footer headings

#### Body Text

- **Extra Large:** 24px (1.5rem) - Hero subtitle, important copy
- **Large:** 20px (1.25rem) - Default body text, descriptions
- **Standard:** 18px (1.125rem) - Footer text, secondary content
- **Small:** 16px (1rem) - Minimum size (rarely used)

**Minimum font size:** 18px (never go smaller)

### Font Weights

- **Bold (700):** H1, H2, important headings, logo
- **Semibold (600):** H3, H4, buttons, emphasis
- **Regular (400):** Body text, descriptions

**Never use:** Light (300) or Thin (100) - too hard to read

### Line Height

- **Headings:** 1.2 - 1.3 (tight for impact)
- **Body text:** 1.6 - 1.7 (comfortable reading)
- **Buttons:** 1.0 (tight)

### Letter Spacing

- **Headings:** -0.02em (slightly tight)
- **Body:** 0 (normal)
- **Buttons:** 0 (normal)

---

## Spacing System

### Base Unit: 4px

All spacing is a multiple of 4px for consistency.

### Common Spacing Values

- **1:** 4px (0.25rem)
- **2:** 8px (0.5rem)
- **3:** 12px (0.75rem)
- **4:** 16px (1rem)
- **5:** 20px (1.25rem)
- **6:** 24px (1.5rem)
- **8:** 32px (2rem)
- **10:** 40px (2.5rem)
- **12:** 48px (3rem)
- **16:** 64px (4rem)
- **20:** 80px (5rem)
- **24:** 96px (6rem)

### Section Padding

**Horizontal Padding (Responsive):**

- **Mobile:** 24px (px-6)
- **Tablet:** 48px (md:px-12)
- **Desktop:** 64px (lg:px-16)
- **Large Desktop:** 96px (xl:px-24)

**Vertical Padding:**

- **Sections:** 64px - 80px (py-16 to py-20)
- **Hero:** 64px - 96px (py-16 to py-24)

### Card Padding

- **Feature Cards:** 32px (p-8)
- **Content Cards:** 40px (p-10)

### Button Padding

- **Horizontal:** 48px (px-12)
- **Vertical:** 20px (py-5)

### Grid Gaps

- **Feature Grid:** 40px (gap-10)
- **Footer Grid:** 32px (gap-8)

---

## Components

### Header

**Specifications:**

```css
background: White;
padding:
  24px vertical,
  responsive horizontal;
shadow: Subtle (0 1px 3px rgba(0, 0, 0, 0.05));
```

**Layout:**

- Logo left (🏠 RentTrackr, 24px text, blue-600, bold)
- Navigation right (Sign In button)

**Sign In Button:**

```css
Border: 2px solid blue-600
Background: Transparent
Text: Blue-600, 20px, semibold
Padding: 12px horizontal, 12px vertical
Border radius: 8px
Hover: Blue-600 background, white text
Transition: 300ms ease
```

**Dark Mode Header:**

```
Background: Gray-900
Shadow: Subtle (0 1px 3px rgba(255,255,255,0.05))
Logo: White text, blue-400 accent
```

**Dark Mode Sign In Button:**

```
Border: 2px solid blue-400
Background: Transparent
Text: Blue-400, 20px, semibold
Padding: 12px horizontal, 12px vertical
Border radius: 8px
Hover: Blue-400 background, gray-900 text
Transition: 300ms ease
```

### Hero Section

**Background:**

```
Gradient: from-blue-50 via-sky-50 to-blue-100
Direction: Diagonal (135deg)
```

**Layout:**

- Centered content
- Max width: 896px (max-w-4xl)
- Padding: Responsive (64-96px vertical)

**Typography:**

- H1: 48-72px, bold, gray-800
- Subtitle: 24px, gray-600, leading-relaxed
- Spacing: 24px between elements

**CTA Button:**

```
Background: Blue-600
Text: White, 24px, semibold
Padding: 20px vertical, 48px horizontal
Border radius: 12px
Shadow: Large (0 4px 12px rgba(37,99,235,0.3))
Hover: Blue-700 background, lift -4px, larger shadow
Transition: 300ms ease
Focus: 4px blue-300 ring
```

**Dark Mode Hero Section:**

```
Background: Dark gradient (gray-800 via gray-900 to gray-700)
Typography:
- H1: White, 48-72px, bold
- Subtitle: Gray-200, 24px, leading-relaxed
```

**Dark Mode CTA Button:**

```
Background: Blue-400
Text: Gray-900, 24px, semibold
Padding: 20px vertical, 48px horizontal
Border radius: 12px
Shadow: Large (0 4px 12px rgba(96,165,250,0.3))
Hover: Blue-500 background, lift -4px, larger shadow
Transition: 300ms ease
Focus: 4px blue-300 ring
```

### Feature Cards

**Specifications:**

```
Background: Gray-50
Padding: 32px
Border radius: 12px
Text align: Center
```

**Hover Effect:**

```
Transform: translateY(-4px)
Shadow: 0 8px 20px rgba(0,0,0,0.08)
Transition: 300ms ease
```

**Content:**

- Icon: 56px emoji
- Title: 24px, semibold, gray-800
- Description: 18px, gray-600, leading-relaxed

**Grid Layout:**

- 1 column on mobile
- 2 columns on tablet (md:grid-cols-2)
- 3 columns on desktop (lg:grid-cols-3)
- Gap: 40px

**Dark Mode Feature Cards:**

```
Background: Gray-800
Border: 1px solid gray-700
Padding: 32px
Border radius: 12px
Text align: Center
```

**Dark Mode Hover Effect:**

```
Transform: translateY(-4px)
Shadow: 0 8px 20px rgba(255,255,255,0.05)
Border: 1px solid blue-400
Transition: 300ms ease
```

**Dark Mode Content:**

- Icon: 56px emoji (unchanged)
- Title: 24px, semibold, white
- Description: 18px, gray-200, leading-relaxed

### Trust Section

**Background:** Blue-50

**Layout:**

- Centered content
- Max width: 896px (max-w-4xl)
- Padding: 64-80px vertical

**Typography:**

- H2: 36-48px, bold, gray-800
- Body: 24px, gray-600, leading-relaxed

**Dark Mode Trust Section:**

```
Background: Gray-800
Typography:
- H2: White, 36-48px, bold
- Body: Gray-200, 24px, leading-relaxed
```

### Footer

**Background:** Gray-800 (dark)

**Text Colors:**

- Headings: White, 20px, semibold
- Links: Blue-200, 18px
- Hover: White
- Body text: Blue-200

**Layout:**

- 4-column grid on desktop
- 2-column on tablet
- 1-column on mobile
- Gap: 32px

**Footer Bottom:**

- Border top: Gray-600
- Text: Blue-200, 18px
- Center aligned
- Padding top: 32px

**Dark Mode Footer:**

```
Background: Gray-900 (darker than light mode)
Text Colors:
- Headings: White, 20px, semibold
- Links: Blue-400, 18px
- Hover: Blue-300
- Body text: Gray-200
```

**Dark Mode Footer Bottom:**

- Border top: Gray-700
- Text: Gray-200, 18px
- Center aligned
- Padding top: 32px

---

## Layout System

### Responsive Breakpoints

```
sm: 640px   (small tablets)
md: 768px   (tablets)
lg: 1024px  (small desktops)
xl: 1280px  (desktops)
2xl: 1536px (large screens)
```

### Container Approach

**Full Width with Responsive Padding:**

- No max-width constraints
- Content expands to fill screen
- Progressive padding increases with screen size

### Grid System

- **Feature Cards:** 1-2-3 column responsive grid
- **Footer:** 1-2-4 column responsive grid
- **Gap:** 32-40px between items

---

## Theme Switching System

### Theme Toggle Component

**Specifications:**

```
Position: Top-right corner of header
Size: 44x44px (minimum touch target)
Icon: Sun/Moon emoji or SVG icons
Background: Transparent
Border: 1px solid current theme border color
Border radius: 8px
Padding: 8px
```

**Light Mode Toggle:**

```
Icon: 🌙 (moon)
Border: Gray-200
Hover: Gray-300 background
```

**Dark Mode Toggle:**

```
Icon: ☀️ (sun)
Border: Gray-600
Hover: Gray-700 background
```

### Theme Persistence

**Storage Strategy:**

- **localStorage:** Persist user preference
- **System Preference:** Respect `prefers-color-scheme`
- **Default:** Light mode for accessibility

**Implementation:**

```typescript
// Theme preference storage
const THEME_KEY = 'renttrackr-theme';

// Get system preference
const getSystemTheme = () => {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

// Get stored preference or system preference
const getTheme = () => {
  return localStorage.getItem(THEME_KEY) || getSystemTheme();
};
```

### Theme Transition

**Smooth Transitions:**

```css
/* Apply to all theme-dependent properties */
* {
  transition:
    background-color 300ms ease,
    color 300ms ease,
    border-color 300ms ease,
    box-shadow 300ms ease;
}

/* Respect user's motion preferences */
@media (prefers-reduced-motion: reduce) {
  * {
    transition: none;
  }
}
```

### CSS Custom Properties

**Theme Variables:**

```css
:root {
  /* Light mode (default) */
  --bg-primary: #ffffff;
  --bg-secondary: #f9fafb;
  --bg-tertiary: #eff6ff;
  --text-primary: #1f2937;
  --text-secondary: #4b5563;
  --text-tertiary: #6b7280;
  --border-primary: #e5e7eb;
  --accent-primary: #2563eb;
  --accent-hover: #1d4ed8;
}

[data-theme='dark'] {
  /* Dark mode overrides */
  --bg-primary: #111827;
  --bg-secondary: #1f2937;
  --bg-tertiary: #374151;
  --text-primary: #ffffff;
  --text-secondary: #e5e7eb;
  --text-tertiary: #d1d5db;
  --border-primary: #4b5563;
  --accent-primary: #60a5fa;
  --accent-hover: #3b82f6;
}
```

### Theme Detection

**System Preference Detection:**

```typescript
// Listen for system theme changes
const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

const handleSystemThemeChange = (e: MediaQueryListEvent) => {
  // Only apply if user hasn't set a manual preference
  if (!localStorage.getItem(THEME_KEY)) {
    applyTheme(e.matches ? 'dark' : 'light');
  }
};

mediaQuery.addEventListener('change', handleSystemThemeChange);
```

---

## Animation & Motion

### Transition Duration

- **Fast:** 150ms - Small interactions
- **Normal:** 300ms - Standard transitions (preferred)
- **Slow:** 500ms - Page transitions

### Easing Functions

- **ease-in-out:** Standard transitions
- **ease-out:** Element entrances
- **ease-in:** Element exits

### Common Animations

**Card Hover:**

```css
transition:
  transform 300ms ease,
  box-shadow 300ms ease;
transform: translateY(-4px);
box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
```

**Button Hover:**

```css
transition:
  background-color 300ms ease,
  transform 300ms ease;
transform: translateY(-2px);
box-shadow: 0 6px 16px rgba(37, 99, 235, 0.4);
```

**Link Hover:**

```css
transition: color 300ms ease;
```

### Motion Principles

1. **Subtle:** Animations enhance, don't distract
2. **Fast:** Keep animations snappy (≤ 300ms)
3. **Purposeful:** Every animation serves a purpose
4. **Respectful:** Honor `prefers-reduced-motion`

---

## Accessibility Guidelines

### WCAG AAA Compliance

✅ **Color Contrast:** 7:1 for normal text, 4.5:1 for large text
✅ **Font Size:** Minimum 18px for body text
✅ **Touch Targets:** Minimum 44x44px
✅ **Focus Indicators:** 4px blue ring on all interactive elements
✅ **Keyboard Navigation:** Full support with logical tab order

### Dark Mode Accessibility

✅ **Dark Mode Contrast:** All dark mode combinations meet WCAG AAA standards
✅ **Theme Toggle:** Accessible toggle with clear labels and keyboard support
✅ **System Preference:** Respects `prefers-color-scheme` media query
✅ **Reduced Motion:** Honors `prefers-reduced-motion` for theme transitions
✅ **Focus Indicators:** Maintained visibility in both light and dark modes

### Semantic HTML

- Proper heading hierarchy (H1 → H2 → H3)
- `<header>`, `<main>`, `<footer>`, `<section>` landmarks
- `<nav>` for navigation
- Descriptive link text (no "click here")

### Screen Reader Support

- Alt text for all images
- ARIA labels for icon-only buttons
- Descriptive page titles
- Skip links for main content

### Keyboard Navigation

- Tab through all interactive elements
- Enter/Space to activate buttons
- Escape to close modals
- Logical tab order (left-to-right, top-to-bottom)

---

## Component Library

### 1. FeatureCard Component

**Props:**

- `icon`: string (emoji)
- `title`: string
- `description`: string

**Styling:**

- Background: gray-50
- Padding: 32px
- Border radius: 12px
- Hover: lift -4px, shadow-xl

**Usage:**

```tsx
<FeatureCard icon="💰" title="Track Rent Payments" description="See who's paid and who hasn't..." />
```

### 2. HeroSection Component

**Props:**

- `title`: string
- `subtitle`: string
- `ctaText`: string
- `ctaLink`: string

**Styling:**

- Background: Gradient (blue-50 to sky-50 to blue-100)
- Text: Centered, large typography
- Max width: 896px (max-w-4xl)

**Usage:**

```tsx
<HeroSection
  title="Managing Your Rental Properties Made Simple"
  subtitle="Keep track of rent payments..."
  ctaText="Get Started"
  ctaLink="/sign-up/"
/>
```

### 3. TrustSection Component

**Props:**

- `title`: string
- `description`: string

**Styling:**

- Background: blue-50
- Text: Centered, large typography
- Max width: 896px (max-w-4xl)

**Usage:**

```tsx
<TrustSection title="Built With You in Mind" description="RentTrackr was designed..." />
```

### 4. ThemeToggle Component

**Props:**

- `theme`: 'light' | 'dark'
- `onToggle`: () => void
- `className?`: string (optional)

**Styling:**

- Size: 44x44px (minimum touch target)
- Border: 1px solid current theme border
- Background: Transparent
- Icon: Sun/Moon emoji based on current theme

**Usage:**

```tsx
<ThemeToggle theme={currentTheme} onToggle={handleThemeToggle} className="ml-4" />
```

**Implementation Example:**

```tsx
import { useState, useEffect } from 'react';

interface ThemeToggleProps {
  theme: 'light' | 'dark';
  onToggle: () => void;
  className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ theme, onToggle, className = '' }) => {
  return (
    <button
      onClick={onToggle}
      className={`
        w-11 h-11 flex items-center justify-center
        border border-gray-200 dark:border-gray-600
        rounded-lg bg-transparent
        hover:bg-gray-100 dark:hover:bg-gray-700
        transition-colors duration-300
        focus:outline-none focus:ring-4 focus:ring-blue-300
        ${className}
      `}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      <span className="text-lg">{theme === 'light' ? '🌙' : '☀️'}</span>
    </button>
  );
};
```

### 5. ThemeProvider Component

**Context Provider:**

```tsx
import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    // Check for saved theme preference or default to system preference
    const savedTheme = localStorage.getItem('renttrackr-theme') as Theme;
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';

    setTheme(savedTheme || systemTheme);
  }, []);

  useEffect(() => {
    // Apply theme to document
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('renttrackr-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
```

---

## Design Patterns

### Hero Pattern

```
1. Full-width gradient background
2. Centered content (max-w-4xl)
3. Large headline (48-72px)
4. Descriptive subtitle (24px)
5. Single primary CTA button
6. Generous vertical padding (64-96px)
```

### Feature Grid Pattern

```
1. Section title (36-48px) + subtitle (24px)
2. 3-column responsive grid (1-2-3 columns)
3. Feature cards with hover effects
4. Icon (56px emoji) + Title (24px) + Description (18px)
5. Gap: 40px between cards
```

### Footer Pattern

```
1. Dark background (gray-800)
2. 4-column grid (responsive to 1 column)
3. Logo/tagline + Support + Company + Contact
4. Light text (blue-200) on dark background
5. Bottom border with copyright
```

---

## Responsive Design

### Mobile First Approach

Start with mobile, enhance for larger screens.

### Mobile Design (< 768px)

- Single column layouts
- Full-width cards
- 24px padding
- 48px+ touch targets
- Stacked navigation

### Tablet Design (768px - 1024px)

- 2-column grids
- 48px padding
- Side-by-side buttons

### Desktop Design (> 1024px)

- 3-4 column grids
- 64-96px padding
- Horizontal layouts
- Hover effects enabled

---

## Performance Guidelines

### Image Optimization

- Use emoji for icons (no images needed)
- Lazy load images below fold
- WebP format with fallbacks
- Responsive images with srcset

### CSS Performance

- System fonts (instant load)
- Minimal CSS (Tailwind utilities)
- No unused styles
- Critical CSS inline

### Loading Strategy

- Above-the-fold content first
- Progressive enhancement
- No layout shift (CLS < 0.1)
- Fast First Contentful Paint (< 1.5s)

---

## Brand Voice in Design

### Visual Personality

- **Calm:** Soft gradients, generous spacing, soothing colors
- **Trustworthy:** Professional typography, clear hierarchy, consistent styling
- **Approachable:** Emoji icons, friendly text, rounded corners
- **Confident:** Bold headlines, clear CTAs, strong contrast

### Design Metaphors

- **Organized:** Grid-based layouts, aligned elements
- **Simple:** Minimal navigation, clean interface
- **Helpful:** Clear labels, obvious actions

---

## Quality Checklist

Before launching any page, verify:

- [ ] All text meets WCAG AAA contrast (7:1)
- [ ] Font sizes are ≥ 18px for body text
- [ ] Touch targets are ≥ 44x44px
- [ ] Focus indicators visible (4px blue ring)
- [ ] Heading hierarchy is logical (H1 → H2 → H3)
- [ ] Hover states on all interactive elements
- [ ] Responsive on mobile, tablet, desktop
- [ ] Keyboard navigation works throughout
- [ ] Page loads in < 2 seconds
- [ ] No horizontal scrolling on any device
- [ ] Components are reusable and well-documented
- [ ] Colors match design system
- [ ] Spacing follows 4px grid
- [ ] Typography scale is consistent

### Dark Mode Checklist

- [ ] Dark mode colors meet WCAG AAA contrast requirements
- [ ] Theme toggle is accessible and properly labeled
- [ ] Smooth transitions between themes (300ms)
- [ ] System preference detection works correctly
- [ ] Theme persistence in localStorage
- [ ] All components have dark mode variants
- [ ] Focus indicators visible in both themes
- [ ] Images and icons work in both themes
- [ ] No flash of unstyled content (FOUC)
- [ ] Reduced motion preferences respected

---

## Design Tools & Resources

### Development

- **Tailwind CSS:** Utility-first CSS framework
- **Next.js:** React framework for production
- **TypeScript:** Type-safe component props

### Testing

- **Chrome DevTools:** Responsive testing, Lighthouse
- **WAVE:** Browser extension for accessibility
- **axe DevTools:** Automated accessibility testing

### Color Tools

- **WebAIM Contrast Checker:** Verify WCAG compliance
- **Color Oracle:** Simulate color blindness

---

## Version History

### Version 2.1 (October 8, 2025)

- **Added comprehensive dark mode system**
- Complete dark mode color palette with WCAG AAA compliance
- Dark mode specifications for all components (header, hero, cards, footer)
- Theme switching system with toggle component
- Theme persistence and system preference detection
- Smooth theme transitions with reduced motion support
- CSS custom properties for theme variables
- Updated accessibility guidelines for dark mode
- New ThemeToggle and ThemeProvider components
- Enhanced quality checklist with dark mode requirements

### Version 2.0 (October 8, 2025)

- Complete redesign based on HTML inspiration
- New gradient hero section
- 6 feature cards (added Reports & Security)
- Cleaner header with single Sign In button
- Dark footer for professional look
- New component library (FeatureCard, HeroSection, TrustSection)
- Updated color palette with gradients
- Improved typography scale
- Better hover effects and animations

### Version 1.0 (October 8, 2025)

- Initial design system
- Basic color palette
- Typography scale
- Component specifications
- Accessibility guidelines

---

_Design guide maintained by the RentTrackr team_
_Last updated: October 8, 2025_
