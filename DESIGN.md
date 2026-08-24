---
name: VoxCart Mobile Design System
colors:
  surface: '#f6faff'
  surface-dim: '#d4dbe3'
  surface-bright: '#f6faff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eef4fc'
  surface-container: '#e8eff7'
  surface-container-high: '#e2e9f1'
  surface-container-highest: '#dce3eb'
  on-surface: '#151c22'
  on-surface-variant: '#3d4a3e'
  inverse-surface: '#2a3137'
  inverse-on-surface: '#ebf1f9'
  outline: '#6d7b6d'
  outline-variant: '#bccaba'
  surface-tint: '#006d34'
  primary: '#006d34'
  on-primary: '#ffffff'
  primary-container: '#00b259'
  on-primary-container: '#003b19'
  inverse-primary: '#51e081'
  secondary: '#5d5e61'
  on-secondary: '#ffffff'
  secondary-container: '#e2e2e5'
  on-secondary-container: '#636467'
  tertiary: '#ad2e48'
  on-tertiary: '#ffffff'
  tertiary-container: '#fc6a81'
  on-tertiary-container: '#6b0021'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#70fd9a'
  primary-fixed-dim: '#51e081'
  on-primary-fixed: '#00210b'
  on-primary-fixed-variant: '#005226'
  secondary-fixed: '#e2e2e5'
  secondary-fixed-dim: '#c6c6c9'
  on-secondary-fixed: '#1a1c1e'
  on-secondary-fixed-variant: '#454749'
  tertiary-fixed: '#ffd9dc'
  tertiary-fixed-dim: '#ffb2ba'
  on-tertiary-fixed: '#400010'
  on-tertiary-fixed-variant: '#8c1332'
  background: '#f6faff'
  on-background: '#151c22'
  surface-variant: '#dce3eb'
typography:
  display:
    fontFamily: Plus Jakarta Sans
    fontSize: 22px
    fontWeight: '700'
    lineHeight: 28px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '700'
    lineHeight: 24px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '700'
    lineHeight: 20px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '500'
    lineHeight: 22px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-bold:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '700'
    lineHeight: 14px
  price-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '700'
    lineHeight: 16px
  price-sm:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '600'
    lineHeight: 13px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  container-margin: 12px
  gutter-grid: 8px
  stack-xs: 4px
  stack-sm: 8px
  stack-md: 12px
  section-gap: 24px
---

## Brand & Style
The design system is engineered for high-velocity grocery commerce, prioritizing speed of recognition and density of information. The brand personality is efficient, reliable, and functional, stripping away decorative elements to focus on utility. 

The aesthetic follows a **High-Density Functional** style:
- **Minimalist Foundations:** Heavy use of whitespace is replaced by "smart spacing" to maximize the number of SKUs visible on screen.
- **Flat UI:** No shadows, no gradients, and no glassmorphism. Depth is communicated through subtle borders and tonal shifts.
- **Efficiency-First:** Every element must serve a transactional purpose. Icons are literal and functional; typography is used as a structural tool rather than a decorative one.

## Colors
The color palette is strictly functional, designed to guide the eye toward conversion points and price information.

- **Primary (#00B259):** Reserved exclusively for "Success" states, primary actions (Add to Cart), price highlights, and active navigation indicators.
- **Secondary (#1A1C1E):** Used for primary headings and high-priority text to ensure maximum legibility.
- **Neutral (#70777E):** Applied to secondary metadata like unit measurements, weight, and "MSRP" strikethroughs.
- **Borders (#E8EAEB):** A consistent, light gray used for card strokes and separators to maintain structure without adding visual weight.

## Typography
Typography is the primary driver of the UI hierarchy. This design system utilizes a dual-font approach: **Plus Jakarta Sans** for expressive, high-impact headings and **Inter** for dense, readable product data.

- **Headings:** Use tight letter-spacing and bold weights to anchor product categories and screen titles.
- **Product Labels:** Use `body-sm` for unit weights (e.g., "500 g") in Neutral gray.
- **Price Display:** Prices should always use bold weights. Current price in Primary Green; strikethrough prices in Neutral gray at a smaller size.

## Layout & Spacing
The layout is optimized for a 390px mobile viewport using a high-density 2-column or 3-column grid for product listings.

- **Grid System:** A 12-column fluid grid is used for full-width elements, but the primary product grid relies on a **12px outer margin** and **8px gutters** between cards.
- **Vertical Rhythm:** Tight vertical spacing (`4px` and `8px`) between product titles, weights, and prices to ensure the "Add" button remains visible above the fold in most card formats.
- **Density:** Favor vertical lists for search results and horizontal carousels for "Frequently Bought Together" to maximize content discovery.

## Elevation & Depth
This design system rejects the use of drop shadows. Depth is achieved through a **Layered Tonal** approach:

1.  **Level 0 (Canvas):** Pure white (#FFFFFF) background.
2.  **Level 1 (Cards/Sections):** White surface with a 1px solid border (#E8EAEB).
3.  **Level 2 (In-set elements):** Occasional use of an ultra-light gray (#F8F9F9) for input fields or search bars to distinguish them from the card surfaces.

Interaction states (taps/presses) are indicated by a brief background color shift to #F2F2F2 rather than an elevation lift.

## Shapes
The shape language is "Soft-Square." It maintains a professional, organized look while avoiding the childishness of full-pill shapes.

- **Standard Radius:** 0.25rem (4px) for small components like checkboxes and quantity steppers.
- **Large Radius:** 0.5rem (8px) for product cards and category containers.
- **Exceptions:** No circles or pill shapes are permitted for buttons; all buttons must be rectangular with the standard 4px or 8px radius.

## Components
- **Buttons:** High-contrast blocks. Primary action buttons use the Primary Green background with White text. No pill shapes; use 8px rounded corners.
- **Product Cards:** Flat white containers with a 1px #E8EAEB border. Image at the top, followed by a tight vertical stack of metadata.
- **Quantity Steppers:** A compact component with a "-" and "+" icon. When the count is 0, it shows a prominent "ADD" label. When > 0, the background remains white with a green border.
- **Chips:** Used for filters (e.g., "Under 10 mins"). 4px radius, light gray background, black text. Active state uses a green border.
- **Input Fields:** Search bars should be full-width with a 1px border and a subtle magnifying glass icon. No shadows.
- **Lists:** Dense list items with 12px vertical padding and a full-width bottom separator. 
- **Bottom Bar:** A fixed utility bar for the "View Cart" action, using the primary green color to create a clear "Go" signal.

## VoxCart Structural Framework & Architecture

This document defines the structural skeleton for the VoxCart application, complementing the "Luminous Utility" visual design system. All current and future screens must adhere to these architectural rules.

### 1. Global Layout Shell

#### Desktop (1024px+)
- **Left Sidebar (Persistent):** Fixed 260px width. Contains Brand Logo, Primary Navigation (Home, Marketplace, Voice Orders, Profile), and User Account entry.
- **Top Bar (Page-Specific):** Contains Search Input and contextual actions (e.g., Cart Icon, Notifications).
- **Main Content Area:** Flexible width, fluid layout.
- **Right Contextual Panel (Optional):** 340px width. Reuses the "List Summary" pattern for cart summaries, active filters, or order totals.

#### Mobile (<768px)
- **Top Bar (Persistent):** Sticky. Contains Logo/Title and the global Mic button/Search toggle.
- **Bottom Tab Bar (Persistent):** 4-destination navigation (Home, Marketplace, Orders, Profile).
- **Main Content:** Single column, full width.

---

### 2. Page Template Types

Every screen is classified into one of the following structural patterns:

| Template | Screens | Structural Rules |
| :--- | :--- | :--- |
| **List** | Home/My List, Order History | Header + Grouped List (Vertical) + Desktop Summary Panel / Mobile Sticky Bar. |
| **Grid** | Marketplace, Search | Header + Filter Sidebar (Desktop) or Chip Row (Mobile) + Product Grid (4 cols Desktop, 2 cols Mobile). |
| **Detail** | Product Detail | **Desktop:** 2-column (Image + Info | Related). **Mobile:** Vertical stack (Hero Media > Info > Related Rows). |
| **Form/Action** | Checkout, Preferences | Header + Form Sections + Sticky Primary CTA. Minimalist layout to focus on task completion. |
| **Overlay** | Vox Panel, Modals | Glass surface, dimmed backdrop. **Desktop:** Anchored panel (30% width) or Centered modal. **Mobile:** Bottom Sheet (slide-up). |
| **Marketing** | Landing Page | Full-bleed hero section with shader background. Scroll-triggered stacked sections. Not bound by app shell navigation. |

---

### 3. Navigation Hierarchy & Sitemap

#### Top-Level (Persistent Nav)
- **Home / My List:** User's active shopping list and recommendations.
- **Marketplace:** Catalog browsing and discovery.
- **Orders:** Past order history and tracking.
- **Profile:** Account settings and dietary preferences.

#### Secondary (Contextual)
- **Product Detail:** Navigated from Marketplace or Home list.
- **Cart & Checkout:** Navigated from Cart summary triggers.
- **Order Confirmation:** Terminal state of the Checkout flow.

#### Global Overlays
- **Vox Voice Agent:** Accessible via global Mic button on all authenticated screens.

---

### 4. Responsive Rules

| Breakpoint | Structural Change |
| :--- | :--- |
| **Desktop (1024px+)** | Left sidebar visible. Right summary panel enabled. Product grid: 4 columns. |
| **Tablet (768-1024px)** | Sidebar collapses to rail (icons only). Right panel becomes a slide-out drawer. Grid: 3 columns. |
| **Mobile (<768px)** | Sidebar removed; Bottom Tab Bar active. Right panel content moves to sticky bottom bar or full-screen modal. Grid: 2 columns. |

---

### 5. Component Reuse Map

To maintain a single library, the following components are strictly standardized:

- **List Row:** Thumbnail (left), Info (center), Stepper/Action (right). Fixed 64px-72px height.
- **Product Card:** Image (top), Metadata (bottom). Standardized aspect ratio and "Add" button placement.
- **Primary Button:** Luminous Utility Green (#00b259), specific border-radius and lift-on-hover state.
- **Glass Panel:** Standard 20px blur, 70% opacity white, 1px light border.
- **Stepper:** Consistent +/- toggle with center numeric value.