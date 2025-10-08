# RentTrackr Homepage Wireframe & Layout Guide

**Version:** 2.0 (HTML-Inspired Redesign)
**Last Updated:** October 8, 2025

---

## Design Philosophy

RentTrackr's homepage is designed for property owners aged 50+ with varying levels of technical experience. The redesign prioritizes:

- **Clarity:** Large, readable text (20-24px base size)
- **Simplicity:** Minimal, uncluttered layout with generous spacing
- **Professional:** Modern, clean aesthetic that builds trust
- **Calm:** Soothing gradient backgrounds and soft colors
- **Accessibility:** WCAG AAA compliant contrast and keyboard navigation

---

## Homepage Structure

### 1. HEADER

**Visual Hierarchy:** Horizontal bar, logo left, navigation right
**Background:** White with subtle shadow

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  🏠 RentTrackr                              [  Sign In  ]  │
│  (28px, blue-600, bold)                 (button, outlined) │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Key Features:**

- Logo: 28px text with house emoji, blue-600
- Sign In button: Outlined style, 20px text
  - Border: 2px solid blue-600
  - Hover: Fills with blue-600, white text
- Clean, minimal design (no extra nav items)
- Box shadow: `0 1px 3px rgba(0,0,0,0.05)`

---

### 2. HERO SECTION

**Visual Hierarchy:** Centered, prominent
**Background:** Diagonal gradient (blue-50 → sky-50 → blue-100)

```
┌─────────────────────────────────────────────────────────────┐
│                    [Gradient Background]                    │
│                                                             │
│                                                             │
│            Managing Your Rental Properties                  │
│                    Made Simple                             │
│            (48-72px, bold, gray-800)                       │
│                                                             │
│     Keep track of rent payments, maintenance, and          │
│     tenant information all in one easy-to-use place.       │
│     No complicated software—just straightforward            │
│              property management.                           │
│              (24px, gray-600)                              │
│                                                             │
│              ┌────────────────────┐                         │
│              │   Get Started      │                         │
│              │ (Large blue CTA)   │                         │
│              └────────────────────┘                         │
│              (24px text, 48px H padding)                   │
│                                                             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Key Features:**

- Gradient background creates visual interest without being overwhelming
- Centered content, max-width: 896px
- Large headline: 48-72px (responsive), bold, gray-800
- Subtitle: 24px, gray-600, leading-relaxed (line-height: 1.7)
- Single CTA button:
  - Background: blue-600
  - Text: white, 24px, semibold
  - Padding: 20px vertical, 48px horizontal
  - Border radius: 12px
  - Shadow: `0 4px 12px rgba(37,99,235,0.3)`
  - Hover: Lifts up 2px, darker blue, larger shadow
  - Focus: 4px blue ring

---

### 3. FEATURES SECTION

**Visual Hierarchy:** Grid-based layout
**Background:** White

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│          Everything You Need in One Place                   │
│              (36-48px, bold, gray-800)                     │
│                                                             │
│       Simple tools to help you stay organized              │
│              and stress-free                                │
│              (24px, gray-600)                              │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │      💰      │  │      🔧      │  │      👥      │   │
│  │   (56px)     │  │   (56px)     │  │   (56px)     │   │
│  │              │  │              │  │              │   │
│  │ Track Rent   │  │ Maintenance  │  │   Tenant     │   │
│  │  Payments    │  │    Logs      │  │ Information  │   │
│  │  (24px)      │  │  (24px)      │  │  (24px)      │   │
│  │              │  │              │  │              │   │
│  │ See who's    │  │ Keep a       │  │ Store contact│   │
│  │ paid and     │  │ complete     │  │ details,     │   │
│  │ who hasn't   │  │ history of   │  │ lease dates  │   │
│  │ at a glance  │  │ repairs...   │  │ and docs...  │   │
│  │  (18px)      │  │  (18px)      │  │  (18px)      │   │
│  └──────────────┘  └──────────────┘  └──────────────┘   │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │      🔔      │  │      📊      │  │      🔒      │   │
│  │   (56px)     │  │   (56px)     │  │   (56px)     │   │
│  │              │  │              │  │              │   │
│  │  Payment     │  │   Simple     │  │  Secure &    │   │
│  │  Reminders   │  │   Reports    │  │   Private    │   │
│  │  (24px)      │  │  (24px)      │  │  (24px)      │   │
│  │              │  │              │  │              │   │
│  │ Get notified │  │ View clear   │  │ Protected    │   │
│  │ when rent is │  │ summaries    │  │ with bank-   │   │
│  │ due or late  │  │ of income    │  │ level        │   │
│  │ effortlessly │  │ & expenses   │  │ security     │   │
│  │  (18px)      │  │  (18px)      │  │  (18px)      │   │
│  └──────────────┘  └──────────────┘  └──────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Key Features:**

- 6 feature cards (2 rows × 3 columns on desktop)
- Card style:
  - Background: gray-50
  - Padding: 32px
  - Border radius: 12px
  - Text align: center
  - Hover: Lifts up 4px with shadow
  - Transition: 300ms ease
- Grid gap: 40px
- Icon: 56px emoji
- Title: 24px, semibold, gray-800
- Description: 18px, gray-600, leading-relaxed

**Responsive:**

- Desktop (≥1024px): 3 columns
- Tablet (768-1024px): 2 columns
- Mobile (<768px): 1 column

---

### 4. TRUST SECTION

**Visual Hierarchy:** Centered content block
**Background:** Light blue (blue-50)

```
┌─────────────────────────────────────────────────────────────┐
│                  [Light Blue Background]                    │
│                                                             │
│              Built With You in Mind                         │
│              (36-48px, bold, gray-800)                     │
│                                                             │
│     RentTrackr was designed specifically for property       │
│     owners who want simplicity without sacrificing          │
│     functionality. No confusing menus, no technical         │
│     jargon—just a straightforward way to manage your        │
│     properties with confidence.                             │
│              (24px, gray-600, centered)                    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Key Features:**

- Background: blue-50 (light, calming)
- Centered content, max-width: 896px
- Title: 36-48px, bold, gray-800
- Description: 24px, gray-600, leading-relaxed (1.7)
- Padding: 64-80px vertical
- Simple, clean message (no bullet points)

---

### 5. FOOTER

**Visual Hierarchy:** 4-column grid
**Background:** Dark gray (gray-800)

```
┌─────────────────────────────────────────────────────────────┐
│                    [Dark Gray Background]                   │
│                                                             │
│  🏠 RentTrackr    Support        Company      Contact      │
│                                                             │
│  Simple property  Help Center    About Us     Email:       │
│  management for   Contact Us     Privacy      support@     │
│  peace of mind.   FAQ            Terms        renttrackr   │
│                                               .com          │
│                                               Phone:        │
│                                               1-800-555-    │
│                                               0123          │
│                                                             │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│         © 2025 RentTrackr. All rights reserved.            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Key Features:**

- Background: gray-800 (dark, professional)
- Text color: blue-200 (soft on dark)
- Hover: white
- 4 columns on desktop, 2 on tablet, 1 on mobile
- Column headings: 20px, semibold, white
- Links: 18px, blue-200
- Gap: 32px between columns
- Footer bottom:
  - Border top: gray-600
  - Centered text
  - Padding top: 32px

---

## Color Palette

### Primary Colors

- **Primary Blue:** `#2563eb` (blue-600) - CTAs, links, logo
- **Hover Blue:** `#1d4ed8` (blue-700) - Button hover
- **Focus Blue:** `#93c5fd` (blue-300) - Focus rings

### Text Colors

- **Headings:** `#1f2937` (gray-800)
- **Body:** `#4b5563` (gray-600)
- **Light Text:** `#bfdbfe` (blue-200) - Footer links

### Background Colors

- **White:** `#ffffff` - Main sections
- **Light Gray:** `#f9fafb` (gray-50) - Cards
- **Light Blue:** `#eff6ff` (blue-50) - Trust section
- **Sky:** `#f0f9ff` (sky-50) - Hero gradient
- **Dark Gray:** `#1f2937` (gray-800) - Footer

### Gradient

- **Hero Gradient:** blue-50 → sky-50 → blue-100 (diagonal)

---

## Typography Scale

### Headings

- **H1 (Hero):** 48-72px, bold, gray-800
- **H2 (Section):** 36-48px, bold, gray-800
- **H3 (Card):** 24px, semibold, gray-800
- **H4 (Footer):** 20px, semibold, white

### Body Text

- **Extra Large:** 24px - Hero subtitle, trust section
- **Large:** 20px - Standard body
- **Standard:** 18px - Card descriptions, footer
- **Minimum:** 18px (never smaller)

### Line Heights

- **Headings:** 1.2-1.3
- **Body:** 1.6-1.7

---

## Spacing System

### Section Padding (Responsive)

**Horizontal:**

- Mobile: 24px (px-6)
- Tablet: 48px (md:px-12)
- Desktop: 64px (lg:px-16)
- Large: 96px (xl:px-24)

**Vertical:**

- Sections: 64-80px (py-16 to py-20)
- Hero: 64-96px (py-16 to py-24)

### Component Spacing

- Header padding: 24px vertical
- Card padding: 32px
- Footer padding: 48px vertical
- Grid gap: 40px (features)

---

## Responsive Breakpoints

### Mobile (< 768px)

- Single column layout
- Stacked cards
- 24px padding
- Full-width buttons
- Large touch targets (48px+)

### Tablet (768px - 1024px)

- 2-column grid
- 48px padding
- Side-by-side elements

### Desktop (> 1024px)

- 3-column grid (features)
- 4-column grid (footer)
- 64-96px padding
- Hover effects enabled

---

## Component Specifications

### 1. Header Component

**Structure:**

```
Header (white bg, shadow-sm)
├── Logo (🏠 RentTrackr, 28px, blue-600, bold)
└── Navigation
    └── Sign In Button (outlined, blue-600)
```

**Padding:** 24px vertical, responsive horizontal

### 2. HeroSection Component

**Props:**

- title: string
- subtitle: string
- ctaText: string
- ctaLink: string

**Structure:**

```
Section (gradient bg)
├── H1 (48-72px, bold, gray-800)
├── Subtitle (24px, gray-600)
└── CTA Button (blue-600, large)
```

**Max-width:** 896px, centered

### 3. FeatureCard Component

**Props:**

- icon: string (emoji)
- title: string
- description: string

**Structure:**

```
Card (gray-50 bg, rounded-xl)
├── Icon (56px emoji)
├── Title (24px, semibold, gray-800)
└── Description (18px, gray-600)
```

**Hover:** Lifts 4px, adds shadow

### 4. TrustSection Component

**Props:**

- title: string
- description: string

**Structure:**

```
Section (blue-50 bg)
├── H2 (36-48px, bold, gray-800)
└── Description (24px, gray-600)
```

**Max-width:** 896px, centered

### 5. Footer Component

**Structure:**

```
Footer (gray-800 bg)
├── Grid (4 columns, responsive)
│   ├── Brand (logo + tagline)
│   ├── Support (links)
│   ├── Company (links)
│   └── Contact (email, phone)
└── Footer Bottom (copyright, centered)
```

**Text:** blue-200, links hover to white

---

## Accessibility Features

### WCAG AAA Compliance

✅ Contrast ratios: 7:1+ for normal text
✅ Font sizes: 18px minimum
✅ Touch targets: 44×44px minimum
✅ Focus indicators: 4px blue-300 ring
✅ Keyboard navigation: Full support

### Semantic HTML

- `<header>` for header
- `<main>` for main content
- `<section>` for each section
- `<footer>` for footer
- Proper heading hierarchy (H1 → H2 → H3)

### Screen Reader Support

- Descriptive link text
- Alt text for images (if any)
- ARIA labels where needed
- Logical reading order

---

## Animation & Transitions

### Hover Effects

**Cards:**

```css
transition:
  transform 300ms ease,
  box-shadow 300ms ease;
hover: translateY(-4px) + shadow-xl;
```

**Buttons:**

```css
transition:
  background 300ms ease,
  transform 300ms ease;
hover: darker background + translateY(-2px) + larger shadow;
```

**Links:**

```css
transition: color 300ms ease;
hover: color change (blue-200 → white in footer);
```

### Focus States

All interactive elements have 4px blue-300 ring on focus

---

## Content Guidelines

### Tone & Voice

- **Friendly:** Warm and approachable
- **Professional:** Trustworthy and competent
- **Clear:** Simple, jargon-free language
- **Reassuring:** Confidence-building

### Word Choice

✅ Use: Simple, easy, straightforward, clear, organized, secure
❌ Avoid: Leverage, utilize, optimize, robust, innovative

### Sentence Structure

- Keep sentences short (12-20 words)
- Use active voice
- One idea per sentence
- Plain language (8th-grade reading level)

---

## Success Metrics

A successful homepage should:

1. Clearly communicate RentTrackr's purpose in < 5 seconds
2. Be fully keyboard navigable
3. Load in < 2 seconds on 3G
4. Have zero WCAG violations
5. Convert visitors through clear CTAs

---

## File Structure

### Components Created

```
src/components/
├── FeatureCard.tsx       (Reusable feature card)
├── HeroSection.tsx       (Hero with gradient)
└── TrustSection.tsx      (Trust message section)
```

### Page Structure

```
src/app/[locale]/(marketing)/
├── layout.tsx            (Header wrapper)
├── page.tsx              (Homepage)
└── about/page.tsx        (About page)
```

---

## Design Decisions & Rationale

### Why Gradient Hero?

- Creates visual interest without overwhelming
- Soft, calming colors (blue-50, sky-50)
- Professional appearance
- No images needed (faster loading)

### Why 6 Feature Cards?

- Covers all major features
- Symmetric grid (2×3)
- Comprehensive overview
- Easy to scan

### Why Dark Footer?

- Professional appearance
- Industry standard
- Good contrast with white text
- Defines end of page clearly

### Why Minimal Navigation?

- Reduces cognitive load
- Focuses attention on CTA
- Cleaner appearance
- Less overwhelming for 50+ users

### Why Large Text?

- Easier to read for older eyes
- Reduces eye strain
- Improves comprehension
- Feels more premium

---

## Testing Checklist

### Visual Testing

- [ ] View on 320px (iPhone SE)
- [ ] View on 768px (iPad)
- [ ] View on 1024px (Desktop)
- [ ] View on 1920px (Large desktop)
- [ ] All hover states work
- [ ] Gradient displays correctly

### Accessibility Testing

- [ ] Keyboard navigation (Tab through page)
- [ ] Screen reader test (NVDA/VoiceOver)
- [ ] Color contrast check (WAVE/axe)
- [ ] Focus indicators visible
- [ ] Heading hierarchy correct
- [ ] All links have descriptive text

### Performance Testing

- [ ] Lighthouse score > 95
- [ ] First Contentful Paint < 1.5s
- [ ] Largest Contentful Paint < 2.5s
- [ ] Cumulative Layout Shift < 0.1
- [ ] No console errors

---

## Version History

### Version 2.0 (October 8, 2025)

- Complete redesign based on HTML inspiration
- New gradient hero section
- 6 feature cards (added Reports & Security)
- Simplified header (single Sign In button)
- Dark footer with 4-column layout
- New component library
- Updated color system with gradients
- Improved spacing and typography

### Version 1.0 (October 8, 2025)

- Initial wireframe design
- 4 feature cards
- Multiple sections with different backgrounds
- Complex navigation
- Multiple CTAs

---

_Wireframe guide maintained by the RentTrackr team_
_Last updated: October 8, 2025_
