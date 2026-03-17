# Rentopilot - Simple Rental Property Management

**A user-friendly rental property management application designed for property owners aged 50 and above.**

---

## 🏠 About Rentopilot

Rentopilot helps property owners easily manage their rental properties with a focus on simplicity, clarity, and accessibility. No complicated menus, no confusing buttons—just straightforward tools to track rent, tenants, maintenance, and more.

### Key Features (Planned)

- **📊 Rent Tracking:** Track payments, see who has paid, get notified when payments are due
- **👥 Tenant Information:** Store contact details, leases, and important notes
- **🔧 Maintenance Logs:** Keep records of repairs and maintenance work
- **🔔 Payment Reminders:** Never miss an important date with friendly reminders

---

## 🎯 Design Philosophy

Rentopilot is designed with older, non-technical users in mind:

- **Large, readable text** (minimum 18px)
- **Clear, simple navigation**
- **Calm, soothing color palette**
- **High contrast** for easy reading (WCAG AAA compliant)
- **Generous spacing** to reduce visual clutter
- **Plain language** - no technical jargon

---

## 📚 Documentation

- **[HOMEPAGE_SUMMARY.md](HOMEPAGE_SUMMARY.md)** - Complete implementation overview
- **[HOMEPAGE_WIREFRAME.md](HOMEPAGE_WIREFRAME.md)** - Visual structure and wireframes
- **[CONTENT_COPY.md](CONTENT_COPY.md)** - All copy and content guidelines
- **[DESIGN_GUIDE.md](DESIGN_GUIDE.md)** - Comprehensive design system

---

## 🚀 Getting Started

### Requirements

- Node.js 22+ and npm

### Installation

```bash
# Clone the repository
git clone <repository-url> rentopilot
cd rentopilot

# Install dependencies
npm install

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## 🛠️ Tech Stack

- **Framework:** Next.js 15 with App Router
- **Styling:** Tailwind CSS v4
- **Language:** TypeScript
- **Internationalization:** next-intl
- **Database:** DrizzleORM with PostgreSQL/PGlite
- **Authentication:** Clerk
- **Testing:** Vitest, Playwright
- **Code Quality:** ESLint, Prettier

---

## 📁 Project Structure

```
src/
├── app/
│   └── [locale]/
│       ├── (marketing)/        # Public pages (Homepage, About)
│       └── (auth)/              # Authenticated pages
├── components/                  # React components
├── locales/                     # Translations (en.json, fr.json)
├── styles/                      # Global styles
└── lib/                         # Utilities

Documentation/
├── HOMEPAGE_SUMMARY.md          # Implementation overview
├── HOMEPAGE_WIREFRAME.md        # Visual structure
├── CONTENT_COPY.md              # Content guidelines
└── DESIGN_GUIDE.md              # Design system
```

---

## 🎨 Design System

### Colors

- **Primary Blue:** `#2563eb` - CTAs and links
- **Text Dark:** `#111827` - Headings
- **Text Medium:** `#374151` - Body text
- **Background Light Blue:** `#eff6ff` - Section backgrounds
- **Background Light Green:** `#f0fdf4` - Trust sections

### Typography

- **Headings:** 32-60px, bold
- **Body Text:** 18-20px, regular
- **Line Height:** 1.6-1.8
- **Font:** System fonts for performance

### Spacing

- **Base Unit:** 4px
- **Section Padding:** 64-80px vertical
- **Card Padding:** 32px
- **Button Padding:** 40px horizontal, 20px vertical

---

## ✅ Current Status

### ✅ Completed

- [x] Homepage design and implementation
- [x] About page design and implementation
- [x] Responsive layout (mobile, tablet, desktop)
- [x] Accessibility features (WCAG AAA contrast)
- [x] Comprehensive documentation
- [x] Content copywriting
- [x] Design system

### 🔄 In Progress

- [ ] User authentication flow
- [ ] Dashboard for logged-in users
- [ ] Property management interface
- [ ] Rent tracking features

### 📋 Planned

- [ ] Tenant management
- [ ] Maintenance logging
- [ ] Payment reminders system
- [ ] Mobile application

---

## 🧪 Testing

```bash
# Run unit tests
npm run test

# Run E2E tests
npm run test:e2e

# Run linter
npm run lint

# Type checking
npm run check:types
```

---

## 🌐 Internationalization

Rentopilot supports multiple languages using next-intl. All translations are stored in `src/locales/`.

Currently supported:

- English (en)
- French (fr)

To add a new translation, create a new JSON file in `src/locales/` (e.g., `es.json` for Spanish).

---

## ♿ Accessibility

Rentopilot is built with accessibility as a priority:

- **WCAG 2.1 Level AAA** contrast ratios
- **Keyboard navigation** support
- **Screen reader** friendly
- **Focus indicators** on all interactive elements
- **Large touch targets** (minimum 44x44px)
- **Semantic HTML** throughout

---

## 🤝 Contributing

We welcome contributions that maintain the simplicity and accessibility focus of Rentopilot.

### Guidelines

1. Follow the design system (see DESIGN_GUIDE.md)
2. Maintain WCAG AAA accessibility standards
3. Use plain language in all content
4. Test with actual users aged 50+
5. Keep the interface simple and uncluttered

---

## 📝 Development Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm run start            # Start production server

# Database
npm run db:generate      # Generate migrations
npm run db:migrate       # Run migrations
npm run db:studio        # Open database studio

# Code Quality
npm run lint             # Check for linting errors
npm run lint:fix         # Fix linting errors
npm run check:types      # Type checking
npm run format           # Format code with Prettier

# Testing
npm run test             # Run unit tests
npm run test:e2e         # Run E2E tests
npm run storybook        # Start Storybook
```

---

## 📊 Performance Goals

- **First Contentful Paint:** < 1.5s
- **Largest Contentful Paint:** < 2.5s
- **Time to Interactive:** < 3.0s
- **Lighthouse Score:** > 90

---

## 📧 Contact

For questions or support:

- **Email:** info@rentopilot.com
- **Support:** support@rentopilot.com
- **Phone:** 1-800-RENTTRACK

---

## 📄 License

Licensed under the MIT License, Copyright © 2025

See [LICENSE](LICENSE) for more information.

---

## 🙏 Acknowledgments

Built with Next.js Boilerplate by [CreativeDesignsGuru](https://creativedesignsguru.com)

Special thanks to all the sponsors and open-source tools that made this project possible.

---

**Made with care for property owners who value simplicity.** 🏠

_Last updated: October 8, 2025_
