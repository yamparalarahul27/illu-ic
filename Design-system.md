# Design System — predictions.paradigm.xyz

Reference design system extracted from https://predictions.paradigm.xyz

---

## Color Palette

| Role | Value |
|---|---|
| Background | `#ffffff` |
| Primary text | `#000000` |
| Near-black text | `#1a1a1a`, `#1d1c1c` |
| **Accent (electric green)** | `#00e100` |
| Accent dimmed | `#00e10080` (50% opacity) |
| Muted text | `opacity: 0.5` over black |
| Header border | `#000000` |
| Tooltip background | `#000000` |
| Tooltip text | `#ffffff` |
| Warm off-white overlay | `#ece8e3e6` |
| Detail slider track | `#ff8888` (coral) |
| Chart canvas background | `#ffffff` |

> Rule: Zero gradients, zero shadows. The single `#00e100` accent is the only non-monochrome color — used surgically for critical interactive states only.

---

## Typography

### Primary Font — Atlas Typewriter Web
- **Type:** Monospace (typewriter-style)
- **Foundry:** Commercial Type / Atlas Font Foundry
- **Format:** Self-hosted `.woff2`
- **Used for:** All UI text — nav title, controls, data labels, tooltips, button labels, body copy

| Weight | Style |
|---|---|
| 100 | Regular + Italic |
| 300 | Regular + Italic |
| 400 | Regular + Italic |
| 500 | Regular + Italic |
| 700 | Regular + Italic |
| 900 | Regular + Italic |

```css
font-family: 'Atlas Typewriter Web', monospace;
font-size: 14px;
line-height: 1.4;
-webkit-font-smoothing: antialiased;
```

### Secondary Font — Martina Plantijn
- **Type:** Contemporary editorial serif
- **Format:** Self-hosted `.woff2`
- **Used for:** Nav overlay links (large display), footer disclaimer

| Weight | Style |
|---|---|
| 300 | Regular + Italic |
| 400 | Regular + Italic |
| 500 | Regular + Italic |
| 700 | Regular + Italic |
| 900 | Regular + Italic |

```css
font-family: 'Martina Plantijn', serif;
```

### Type Scale

| Element | Font | Size | Weight | Notes |
|---|---|---|---|---|
| Body / UI | Atlas Typewriter Web | `14px` | 400 | Base |
| Header title | Atlas Typewriter Web | `14px` | 500 | Medium |
| Version tag | Atlas Typewriter Web | `14px` | 400 | `opacity: 0.5` |
| Tooltips | Atlas Typewriter Web | `14px` | 400 | `letter-spacing: 0.28px` |
| Data labels | Atlas Typewriter Web | `14px` | 400 | — |
| Footer disclaimer | Martina Plantijn | `14px` | 400 | `opacity: 0.5` |
| Nav links (mobile) | Martina Plantijn | `50px` | 300 | Hamburger overlay |
| Nav links (desktop) | Martina Plantijn | `80px` | 300 | `1024px+` breakpoint |

> Rule: The jump from 14px monospace → 80px light serif is intentional. Maximum scale contrast between data/UI and editorial/brand elements.

---

## Spacing

| Property | Value |
|---|---|
| Base font size | `14px` |
| Line height | `1.4` |
| Container padding — mobile | `20px` |
| Container padding — wide (`1280px+`) | `60px` |
| Max content width | `1400px` |
| Header height — mobile | `60px` |
| Header height — tablet (`768px+`) | `64px` |
| Header `z-index` | `2000` |
| Logo height | `28px` |
| Hamburger icon | `24 × 14px` |
| Legend swatch size | `10 × 10px` |

---

## Border Radius

| Element | Value |
|---|---|
| Tooltips | `2px` |
| All other components | `2px` or `0` |

> Rule: Hard edges everywhere. Zero soft rounding. `2px` is the maximum border-radius used anywhere on the site.

---

## Borders

| Element | Value |
|---|---|
| Legend swatch | `1px solid #000000` |
| Header (on scroll) | `1px solid #000000` (bottom) |
| General borders | `1px solid #000000` |

---

## Layout

```css
/* App container */
min-height: 100vh;
display: flex;
flex-direction: column;

/* Main content */
flex: 1;
overflow-x: clip;

/* Centered content wrapper */
max-width: 1400px;
margin: 0 auto;

/* Sticky header */
position: sticky;
top: 0;
height: 60px; /* 64px at 768px+ */
z-index: 2000;
```

- No CSS grid at top level — flex throughout
- Header is transparent on desktop (`960px+`) with `pointer-events: none`, becomes solid white with border on scroll via `.header.scrolled`
- No traditional hero section — the data visualization is the centerpiece

---

## Responsive Breakpoints

```
440px → 490px → 500px → 640px → 768px → 890px → 960px → 1024px → 1280px → 1345px
```

---

## UI Components

### Button / Toggle Groups
- Segmented pill-style
- **Active state:** `background: #000; color: #fff`
- **Inactive state:** transparent background
- Disabled and `.suggested` (default/recommended) states supported
- Hover transition: `0.12s ease`

### Tooltips
```css
background: #000000;
color: #ffffff;
border-radius: 2px;
font-family: 'Atlas Typewriter Web', monospace;
font-size: 14px;
letter-spacing: 0.28px;
bottom: calc(100% + 0px);
left: 50%;
transform: translate(-50%);
```

### Legend Swatches
```css
width: 10px;
height: 10px;
border: 1px solid #000000;
border-radius: 0; /* square, no rounding */
```

### Hamburger Menu (Full-screen Overlay)
- `position: fixed` full-viewport takeover
- Background: `#ffffff`
- Nav links: Martina Plantijn, `50–80px`, weight 300
- Active link: `opacity: 1` / Inactive: `opacity: 0.6`
- Hover: underline animates in via `::after` pseudo-element (`width: 0 → 100%`, `height: 3px`, `background: #000`)

### Range Sliders
- Heavily customized `svelte-range-slider-pips`
- Detail + overview dual-slider pattern
- Detail track: `#ff8888` (coral) as visual differentiator
- Detail track width: `--track-width: 60px`

### Loading States
- Spinner: `@keyframes spin` — `0.8s linear infinite`
- Pulse: `@keyframes pulseOpacity` — `1.1s ease-in-out infinite` (`opacity: 0.2 → 1 → 0.2`)

---

## Animation

| Interaction | Duration | Easing |
|---|---|---|
| Header bg on scroll | `0.3s` | `ease` |
| Hamburger → X morph | `0.3s` | `ease` |
| Nav link underline hover | `0.3s` | `ease-out` |
| Nav link opacity | `0.2s` | — |
| Tooltip appear | `0.15s` | `ease-out` + 4px upward slide |
| Basis indicator | `0.6s` | `cubic-bezier(0.2, 0.9, 0.2, 1)` (spring-like) |
| Range float elements | `0.22s` | `cubic-bezier(0.33, 1, 0.68, 1)` (deceleration) |
| Button hover | `0.12s` | `ease` |
| Spinner | `0.8s` | `linear infinite` |
| Pulse (loading) | `1.1s` | `ease-in-out infinite` |

> Rule: All animations are functional and purposeful. No parallax, no scroll-triggered reveals, no decorative motion.

---

## Design Language

- **Aesthetic:** Editorial minimalism with a data-tool backbone (Swiss/International Style applied to a financial dashboard)
- **Foundation:** Monochromatic — black on white, broken only by `#00e100`
- **Edges:** Hard (`2px` max radius), `1px` borders, square swatches
- **Shadows:** None
- **Gradients:** None
- **Framework:** No external UI library — fully custom SvelteKit components
- **CSS theming:** `--color-bg` variable used throughout (architected to support dark mode)
- **Font delivery:** Both fonts are commercially licensed and self-hosted (not Google Fonts)
