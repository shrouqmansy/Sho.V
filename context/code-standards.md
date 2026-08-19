# Code Standards

## General

- Maintain clean, single-responsibility React components.
- Use semantic HTML5 elements (`<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<footer>`).
- No unnecessary third-party npm packages; rely on standard React features and CSS custom properties.

## React & JavaScript

- Use functional components with hooks (`useState`, `useContext`, `useMemo`).
- Export components as named exports or default module exports cleanly.
- Ensure proper key props on mapped arrays (e.g. `product.id`).
- Destructure component props cleanly with default fallbacks where applicable.

## Styling & CSS

- Use CSS variable tokens mapped from `DESIGN.md` (e.g., `var(--surface)`, `var(--primary)`, `var(--secondary)`).
- Border radius must be 0px across containers, input fields, cards, and buttons for the sharp luxury aesthetic.
- Typography classes:
  - Serif headlines: `font-serif`, `Playfair Display`
  - Sans-serif UI & body: `font-sans`, `Montserrat` / `Jost`
  - Label uppercase tracking: `uppercase tracking-widest`

## File Organization

- `src/components/common/` — Structural application shells
- `src/components/sections/` — Content sections
- `src/components/ui/` — Atomic UI elements
- `src/context/` — Application state
- `src/data/` — Data files
- `src/pages/` — Page level views
