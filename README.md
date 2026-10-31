# Enterprise Classifieds 365

Production-ready Microsoft 365 internal marketplace built with SharePoint Framework (SPFx) 1.21.1, React 17, TypeScript, and Fluent UI v9.

## Overview

Enterprise Classifieds 365 enables employees to **sell**, **buy**, **rent**, **exchange**, **donate**, and post **wanted ads** within SharePoint Online and Microsoft Teams.

## Technology Stack

| Layer | Technology |
|-------|------------|
| Framework | SPFx 1.21.1 |
| UI | Fluent UI v9 (@fluentui/react-components) |
| Data | PnPjs v4, SharePoint REST |
| Identity | Microsoft Graph |
| Routing | React Router v6 (HashRouter) |
| Teams | @microsoft/teams-js |
| AI | Azure OpenAI (configurable) |

## Project Structure

```
src/
├── components/          # Shared composite components
├── pages/               # Feature pages (Dashboard, Listings, Admin, etc.)
├── layouts/             # AppShell, PageLayout
├── navigation/          # Left nav, command bar, search, breadcrumbs
├── services/            # Business logic layer
├── repositories/        # SharePoint data access (Repository Pattern)
├── models/              # SharePoint ↔ domain mappers
├── interfaces/          # TypeScript interfaces
├── hooks/               # Custom React hooks
├── providers/           # Context providers
├── contexts/            # React context definitions
├── constants/           # Central constants and configuration
├── utilities/           # Pure utility functions
├── helpers/             # Domain-specific helpers
├── controls/            # Reusable UI controls
├── dialogs/             # Modal dialogs
├── panels/              # Side panels
├── forms/               # Form components
├── cards/               # Card components
├── grids/               # Data grids with virtualization
├── icons/               # Icon mappings
├── permissions/         # RBAC permission checker
├── notifications/       # Toast and notification center
├── telemetry/           # Application Insights ready telemetry
├── localization/        # i18n strings (en-us, RTL ready)
└── webparts/            # SPFx web part entry point

provisioning/
├── schemas/             # SharePoint list/library JSON schemas
├── security/            # SharePoint groups and permissions
└── power-automate/      # Flow documentation
```

## Getting Started

### Prerequisites

- Node.js 22.x (LTS)
- gulp-cli, yo, @microsoft/generator-sharepoint@1.21.1
- SharePoint Online tenant

### Install & Run

```bash
cd enterprise-classifieds-365
npm install
gulp serve
```

### Build for Production

```bash
gulp bundle --ship
gulp package-solution --ship
```

Output: `sharepoint/solution/enterprise-classifieds-365.sppkg`

## SharePoint Provisioning

1. Deploy the `.sppkg` to your App Catalog
2. Run provisioning via Admin Center → Storage tab, or use `ProvisioningService`
3. Configure SharePoint groups: `EC365_Owners`, `EC365_Moderators`, `EC365_Approvers`, `EC365_Contributors`, `EC365_Visitors`
4. Approve Microsoft Graph permission requests in SharePoint Admin Center

## Modules

| Module | Route | Description |
|--------|-------|-------------|
| Dashboard | `/` | Widgets, stats, featured listings |
| Listings | `/listings` | Grid/list/gallery views, filters, export |
| Listing Detail | `/listings/:id` | Gallery, seller, reviews, timeline |
| Create Listing | `/create` | 6-step wizard with AI assist |
| Categories | `/categories` | Hierarchical category management |
| Seller Profile | `/seller/:id` | Ratings, listings, reviews |
| Favorites | `/favorites` | Collections, saved searches |
| Wanted Ads | `/wanted` | Wanted ads with auto-matching |
| My Listings | `/my-listings` | Draft/pending/sold management |
| Messages | `/messages` | Inbox and conversations |
| Reviews | `/reviews` | Ratings and moderation |
| Reports | `/reports` | Abuse/spam admin review |
| Admin Center | `/admin` | Full admin configuration |
| Search | `/search` | Advanced search with history |

## Architecture Patterns

- **Repository Pattern** — `BaseRepository` with PnPjs for all SharePoint lists
- **Service Layer** — Business logic in services, injected via `ServiceContainer`
- **Dependency Injection** — Factory-based `ServiceContainer` singleton
- **Context Providers** — Theme, localization, notifications, app state
- **Lazy Loading** — All pages loaded via `React.lazy` + `Suspense`

## Unit Test Strategy

Tests use Jest + React Testing Library (SPFx default):

| Layer | Test Focus |
|-------|------------|
| Models | Mapper functions, tree builders |
| Utilities | Validation, formatting, debounce |
| Repositories | Mock PnPjs, OData filter building |
| Services | Business rules, publish/approve flows |
| Hooks | State transitions, infinite scroll |
| Components | Render, a11y, user interactions |

Run: `gulp test`

## AppSource Certification

- WCAG 2.2 accessibility (ARIA, keyboard nav, focus management)
- Responsive design with mobile collapse
- Dark mode via Fluent UI v9 themes
- Localization ready (en-us, RTL support)
- Privacy Policy and Terms placeholders at `/privacy`, `/terms`
- Telemetry opt-in via settings
- Application Insights integration in `TelemetryClient`
- Browser compatibility: Edge, Chrome, Firefox, Safari (latest 2 versions)

## License

Commercial — Enterprise Classifieds 365
