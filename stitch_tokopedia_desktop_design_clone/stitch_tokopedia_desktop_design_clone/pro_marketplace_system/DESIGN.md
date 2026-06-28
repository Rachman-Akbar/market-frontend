---
name: Pro-Marketplace System
colors:
  surface: '#fcf9f8'
  surface-dim: '#dcd9d9'
  surface-bright: '#fcf9f8'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f3f2'
  surface-container: '#f0eded'
  surface-container-high: '#eae7e7'
  surface-container-highest: '#e5e2e1'
  on-surface: '#1b1c1c'
  on-surface-variant: '#3e4a39'
  inverse-surface: '#303030'
  inverse-on-surface: '#f3f0ef'
  outline: '#6d7b67'
  outline-variant: '#bccbb4'
  surface-tint: '#006e04'
  primary: '#006e04'
  on-primary: '#ffffff'
  primary-container: '#03ac0e'
  on-primary-container: '#003501'
  inverse-primary: '#55e248'
  secondary: '#b02f00'
  on-secondary: '#ffffff'
  secondary-container: '#ff5722'
  on-secondary-container: '#541100'
  tertiary: '#7e5700'
  on-tertiary: '#ffffff'
  tertiary-container: '#c38900'
  on-tertiary-container: '#3e2900'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#76ff64'
  primary-fixed-dim: '#55e248'
  on-primary-fixed: '#002200'
  on-primary-fixed-variant: '#005302'
  secondary-fixed: '#ffdbd1'
  secondary-fixed-dim: '#ffb5a0'
  on-secondary-fixed: '#3b0900'
  on-secondary-fixed-variant: '#862200'
  tertiary-fixed: '#ffdeac'
  tertiary-fixed-dim: '#ffba35'
  on-tertiary-fixed: '#281900'
  on-tertiary-fixed-variant: '#5f4100'
  background: '#fcf9f8'
  on-background: '#1b1c1c'
  surface-variant: '#e5e2e1'
typography:
  headline-lg:
    fontFamily: Open Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  headline-md:
    fontFamily: Open Sans
    fontSize: 18px
    fontWeight: '700'
    lineHeight: 24px
  body-lg:
    fontFamily: Open Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Open Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Open Sans
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 18px
  price-lg:
    fontFamily: Open Sans
    fontSize: 16px
    fontWeight: '700'
    lineHeight: 20px
  label-bold:
    fontFamily: Open Sans
    fontSize: 12px
    fontWeight: '700'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  container-max: 1200px
  gutter: 16px
  margin-desktop: 24px
  stack-sm: 4px
  stack-md: 8px
  stack-lg: 16px
---

## Brand & Style

This design system is engineered for a high-volume, multi-category e-commerce environment. The brand personality is **reliable, efficient, and approachable**, aiming to evoke a sense of security and ease during the shopping experience.

The visual style follows a **Modern Corporate** aesthetic with a strong emphasis on utility and clarity. It prioritizes information density without sacrificing white space, ensuring that product discovery remains the primary focus. Key characteristics include:
- **Cleanliness:** High-contrast backgrounds (primarily white) to make product imagery pop.
- **Accessibility:** Clear visual cues for actions (buttons, links) and status (discounts, ratings).
- **Structure:** A disciplined alignment of elements that creates a sense of professional stability.

## Colors

The palette is anchored by a vibrant, signature green that represents growth and freshness, balanced by high-energy accent colors for conversion.

- **Primary (Green):** Used for main actions (Buy, Login), brand identity, and positive status indicators.
- **Secondary (Orange/Red):** Reserved for urgency, such as flash sales, price drops, and "Beli Langsung" (Direct Buy) buttons.
- **Tertiary (Yellow):** Exclusively for rating stars and social proof metrics.
- **Neutral:** A range of grays from `#212121` (Text) to `#999999` (Secondary info) and `#F0F3F7` (Background surfaces).

The background is strictly white (`#FFFFFF`) to maintain a "clean shelf" feel for products.

## Typography

The typography system uses a highly legible, humanist sans-serif to ensure readability across long browsing sessions. 

- **Hierarchy:** Bold weights are used strictly for product titles, prices, and section headers. 
- **Scale:** On mobile, large headlines scale down slightly (e.g., `headline-lg` becomes 20px) to prevent excessive text wrapping.
- **Coloring:** Primary body text uses a dark charcoal, while metadata (location, shipping info) uses a medium gray to create a clear visual hierarchy.

## Layout & Spacing

The system utilizes a **Fixed Grid** for desktop and a **Fluid Grid** for mobile.

- **Desktop:** A 12-column grid with a maximum container width of 1200px. Product cards typically span 2 columns (6 items per row) or 2.4 columns (5 items per row) depending on the section context.
- **Mobile:** A 2-column layout for product feeds, ensuring images remain large enough for detail recognition.
- **Spacing Rhythm:** An 8px base unit drives the system. Internal card padding is 8px or 12px, while section vertical margins are 32px or 40px to provide breathing room between distinct content blocks.

## Elevation & Depth

Visual hierarchy is achieved through a combination of **Tonal Layers** and **Subtle Shadows**.

- **Surfaces:** The main background is light gray, while content containers (cards, sidebars) are white.
- **Shadows:** Cards use an extremely diffused, low-opacity shadow (`0 1px 6px rgba(0,0,0,0.12)`) that appears only on hover to indicate interactivity.
- **Outlines:** In a static state, cards and inputs often use a 1px border (`#E5E7E9`) instead of shadows to keep the UI flat and performant.
- **Fixed Elements:** Navigation bars use a slight elevation to remain visible above scrolling content.

## Shapes

The shape language is **friendly yet structured**, utilizing consistent corner rounding to soften the interface.

- **Standard Radius:** 8px (Rounded) for product cards, buttons, and input fields.
- **Small Radius:** 4px for chips, badges, and small thumbnail containers.
- **Pill Shapes:** Used for specific navigation toggles or "promo" tags to differentiate them from standard action buttons.

## Components

### Buttons
- **Primary:** Solid Green (`#03AC0E`) with white text. 8px radius.
- **Secondary:** White background with Green border and text.
- **Tertiary/Ghost:** No border, green text, used for less prominent actions like "Lihat Semua".

### Product Cards
The core unit of the system.
- **Structure:** Top-aligned image (1:1 ratio), followed by a vertical stack of content: Title (max 2 lines), Price (Bold), Discount/Original Price (if applicable), Merchant Location, and Rating.
- **Hover State:** Card lifts slightly with a subtle shadow and the border may change to the primary green color.

### Input Fields
- **Search Bar:** Large, rounded (8px), with a gray border and a magnifying glass icon. The search bar is the central functional element of the header.
- **Checkboxes:** Standard 16px square with an 4px radius, turning primary green when selected.

### Navigation
- **Global Header:** White background, fixed to top. Contains logo, category dropdown, search bar, cart, and user authentication.
- **Filter Sidebar:** Found on search result pages. Collapsible sections with checkboxes and price range sliders.