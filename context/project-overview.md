# Sho.V — Premium Fashion E-Commerce

## Overview

Sho.V is a contemporary luxury fashion e-commerce React.js web application built from Google Stitch visual design specifications. Embodying a "Quiet Luxury" aesthetic, the site emphasizes minimal typography, generous whitespace, warm neutral color palettes, and editorial product presentation for a sophisticated online shopping experience.

## Goals

1. Faithfully convert Google Stitch HTML/CSS outputs into clean, modular, and reusable React.js components.
2. Deliver a responsive interface across Desktop, Laptop, Tablet, and Mobile viewports without visual compromise.
3. Provide interactive frontend capabilities including mobile menu navigation, product color swatches, filter and sort controls, search modal, and cart drawer management.
4. Enforce strict brand requirements: currency in Egyptian Pounds (EGP), exact hero message ("Beyond the Ordinary."), and customized navigation.

## Core User Flow

1. User arrives at the Editorial Homepage showcasing the hero campaign and featured collections.
2. User browses curated categories (Shop All, New In, Sale, Dresses, Blazers, Tops) via top navigation or homepage feature cards.
3. User filters products by category, color, size, and price, or uses real-time search.
4. User inspects product cards with hover zoom and color swatches, and adds items to cart.
5. User manages selected items in the slide-over Cart Drawer displaying subtotal in EGP.
6. User explores brand storytelling on the About page or sends inquiries on the Contact page.

## Features

### Navigation & Header
- Sticky header with brand logo "Sho.V"
- Navigation links: Theme Features, Sale, Shop, New in, About, Contact, English, EGP, Search, Account, Cart
- Slide-over Mobile Navigation Drawer
- Live Cart Badge Counter

### Product Catalog & Shopping
- Hero Banner ("Beyond the Ordinary." / "For those who find beauty beyond the expected." / "SHOP NOW")
- Asymmetrical Featured Collection Grid
- Category Grid (Dresses, New in, Blazers, Tops)
- Product Cards with high-contrast serifs, brand labels, price displays in EGP, and color swatches
- Interactive Filter & Sort Bar (Category, Size, Color, Price, Sort by Featured)

### Modals & Interactivity
- Slide-over Cart Drawer with quantity adjustment, item removal, and subtotal calculation
- Instant Search Overlay Modal
- Dynamic multi-page navigation (Home, Shop All, New In, Sale, About, Contact)

## Scope

### In Scope
- Complete React.js component architecture
- 6 distinct page views (Home, Shop, New In, Sale, About, Contact)
- Interactive frontend state management (Cart, Search, Filters, Active View)
- Responsive CSS design system adhering to Stitch `DESIGN.md` rules
- Product pricing strictly formatted in EGP

### Out of Scope
- Backend server APIs, database storage, user authentication services, live payment gateways.

## Success Criteria

1. Visual layout matches Google Stitch designs (`sho.v_homepage_refined_hero`, `shop_sho.v`, etc.) closely.
2. Zero build errors or unhandled console exceptions.
3. Fully functional cart drawer, search modal, mobile menu, and page tab navigation.
4. 100% responsive layout across all device viewports.
