# Architecture Context

## Stack

| Layer     | Technology                  | Role   |
| --------- | --------------------------- | ------ |
| Framework | React 18 + Vite             | SPA Frontend rendering engine |
| Styling   | Vanilla CSS + CSS Variables | Design tokens, typography, grid layouts |
| Icons     | Material Symbols / Inline SVG | Minimal stroke icons matching Stitch source |
| State     | React Context API           | Shopping cart, active page route, search, filters |

## System Boundaries

- `src/components/common/` — Shared structural layout components (Header, Footer, MobileMenu, CartDrawer, SearchModal)
- `src/components/sections/` — Page sections (HeroSection, FeaturedCollection, CollectionList, FilterSortBar, BrandStory, NewsletterSection)
- `src/components/ui/` — Reusable primitive UI components (ProductCard, SwatchPicker, Badge, Button, Input)
- `src/data/` — Static catalogs (`products.js`, `collections.js`, `navigation.js`)
- `src/context/` — Global application state management (`ShopContext.jsx`)
- `src/pages/` — Top-level page views (`HomePage`, `ShopPage`, `NewInPage`, `SalePage`, `AboutPage`, `ContactPage`)
- `src/styles/` — Core design system styles and CSS variables (`tokens.css`, `index.css`)

## Storage & State Model

- **Client State**: Shopping cart items array, search filter string, active category filter, cart drawer open state, mobile menu toggle, current active view.
- **Static Asset Data**: Product details, imagery URLs, swatches, categories stored in JS data files under `src/data/`.

## Invariants

1. **Visual Fidelity**: All components must conform to the 0px border radius, Playfair Display headline hierarchy, and warm ivory background palette defined in `DESIGN.md`.
2. **Pricing Rule**: Every monetary display MUST use Egyptian Pounds (`EGP [amount]`) format.
3. **Nav Contract**: Top navigation links must strictly include: *Theme Features, Sale, Shop, New in, About, Contact, English, EGP, Search, Account, Cart*.
4. **Hero Messaging Contract**: The homepage hero title MUST be *"Beyond the Ordinary."*, subtitle *"For those who find beauty beyond the expected."*, and button *"SHOP NOW"*.
5. **No Announcement Bar**: Top announcement bar is omitted.
