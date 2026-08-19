---
name: Sho.V Editorial Luxury
colors:
  surface: '#fbf9f9'
  surface-dim: '#dbdad9'
  surface-bright: '#fbf9f9'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f5f3f3'
  surface-container: '#efeded'
  surface-container-high: '#e9e8e7'
  surface-container-highest: '#e4e2e2'
  on-surface: '#1b1c1c'
  on-surface-variant: '#444748'
  inverse-surface: '#303031'
  inverse-on-surface: '#f2f0f0'
  outline: '#747878'
  outline-variant: '#c4c7c7'
  surface-tint: '#5f5e5e'
  primary: '#151616'
  on-primary: '#ffffff'
  primary-container: '#2a2a2a'
  on-primary-container: '#929191'
  inverse-primary: '#c8c6c5'
  secondary: '#6d5b49'
  on-secondary: '#ffffff'
  secondary-container: '#f6dec7'
  on-secondary-container: '#73614f'
  tertiary: '#141613'
  on-tertiary: '#ffffff'
  tertiary-container: '#292a27'
  on-tertiary-container: '#91918d'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e4e2e1'
  primary-fixed-dim: '#c8c6c5'
  on-primary-fixed: '#1b1c1c'
  on-primary-fixed-variant: '#474746'
  secondary-fixed: '#f6dec7'
  secondary-fixed-dim: '#d9c3ac'
  on-secondary-fixed: '#25190b'
  on-secondary-fixed-variant: '#544433'
  tertiary-fixed: '#e3e3de'
  tertiary-fixed-dim: '#c7c7c2'
  on-tertiary-fixed: '#1b1c19'
  on-tertiary-fixed-variant: '#464744'
  background: '#fbf9f9'
  on-background: '#1b1c1c'
  surface-variant: '#e4e2e2'
typography:
  display-lg:
    fontFamily: Playfair Display
    fontSize: 64px
    fontWeight: '600'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Playfair Display
    fontSize: 40px
    fontWeight: '600'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Playfair Display
    fontSize: 32px
    fontWeight: '500'
    lineHeight: '1.3'
  headline-sm:
    fontFamily: Playfair Display
    fontSize: 24px
    fontWeight: '500'
    lineHeight: '1.4'
  body-lg:
    fontFamily: Montserrat
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
    letterSpacing: 0.01em
  body-md:
    fontFamily: Montserrat
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-caps:
    fontFamily: Montserrat
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1.0'
    letterSpacing: 0.15em
  button:
    fontFamily: Montserrat
    fontSize: 14px
    fontWeight: '500'
    lineHeight: '1.0'
    letterSpacing: 0.1em
spacing:
  unit: 8px
  container-max: 1440px
  gutter: 24px
  margin-desktop: 80px
  margin-mobile: 20px
  section-gap: 120px
---

## Brand & Style
The brand personality is rooted in "Quiet Luxury"—an understated, sophisticated approach to high-end fashion e-commerce. It targets a discerning audience that values craftsmanship, heritage, and intentionality over loud branding.

The design style is **Minimalist / Editorial**. It prioritizes vast amounts of whitespace (negative space) to allow product photography to breathe, mimicking the layout of a high-end physical lookbook. Visual weight is carried by high-contrast typography and a rigid, disciplined grid. The emotional response should be one of calm, exclusivity, and timelessness.

## Colors
The palette is centered on natural, warm tones that evoke high-quality textiles like silk, cashmere, and fine leather.

- **Primary (Charcoal):** Used for all primary text, iconography, and high-emphasis UI borders to provide a sharp, authoritative anchor.
- **Secondary (Taupe):** Reserved for interactive accents, CTA backgrounds, and subtle decorative elements.
- **Tertiary (Warm Ivory):** The foundation of the entire system. All "surfaces" should use this color to create a softer, more premium feel than pure white.
- **Neutral:** Mid-tone greys are used sparingly for secondary metadata and disabled states.

## Typography
The typographic system relies on the interplay between the classical elegance of **Playfair Display** and the geometric clarity of **Montserrat**.

- **Serif (Headlines):** Use for product names, editorial titles, and section headers. Higher weights should be used for the largest display sizes to emphasize the high-contrast strokes of the font.
- **Sans-Serif (Body & UI):** Use for descriptions, pricing, navigation, and technical details. 
- **Character Spacing:** To achieve the editorial feel, utilize generous letter spacing for labels and buttons. Conversely, tighten spacing slightly for large display headlines to maintain a cohesive visual block.

## Layout & Spacing
This design system utilizes a **12-column fixed grid** for desktop and a **4-column fluid grid** for mobile.

The "Editorial" feel is achieved through intentional asymmetrical layouts and large vertical gaps between sections (`section-gap`). Horizontal margins are wider than standard e-commerce to create a "framed" effect for the content.

- **Desktop:** 80px side margins provide a luxury buffer.
- **Mobile:** 20px side margins with stacked elements.
- **Rhythm:** All spacing (padding, margins) must be a multiple of the 8px base unit to ensure mathematical harmony amidst the whitespace.

## Elevation & Depth
In alignment with the minimalist luxury aesthetic, this design system avoids traditional drop shadows and neomorphic effects. 

- **Flat Depth:** Depth is communicated through **Tonal Layers** (Warm Ivory surfaces on slightly darker Taupe backgrounds) and **Low-contrast Outlines**. 
- **Borders:** Use 1px solid borders in Charcoal (#2A2A2A) for high-definition separation or Taupe at 30% opacity for subtle containment.
- **Overlays:** For modals or cart drawers, use a subtle 40% opacity Charcoal backdrop to maintain focus without losing the warmth of the Ivory background.

## Shapes
The shape language is **Sharp (0px)**. All containers, buttons, input fields, and image frames must have perfectly square corners. This architectural approach reinforces the "high-fashion" and "structured" nature of the brand, contrasting against the soft curves of fabric shown in photography.

## Components
- **Buttons:** All buttons are strictly rectangular with 0px border radius. Primary buttons use a Taupe background with Charcoal or White text, centered text, and 16px vertical / 40px horizontal padding.
- **Inputs:** Simple bottom-border only (1px Charcoal) or full rectangular strokes. Labels use the `label-caps` style positioned above the field.
- **Product Cards:** Image-heavy with no borders. Product names use `headline-sm` and prices use `body-md`. Metadata is minimal.
- **Navigation:** Top-tier navigation uses `label-caps`. Hover states should be a subtle underline or a slight opacity shift rather than a color change.
- **Chips/Tags:** Used for "New Arrival" or "Sold Out" status. These are small, rectangular boxes with a 1px Charcoal border and `label-caps` text.
- **Image Treatment:** All product photography should have a consistent desaturated or warm-white background to blend seamlessly with the UI's Ivory surface.