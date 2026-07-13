# The Citadel of Vael Anore

> A working archive of oaths, tides, and tallies. Single-page medieval dark-fantasy brand surface built with Astro, Three.js, and GSAP.

[![Astro](https://img.shields.io/badge/Astro-4.16-ff5a03?logo=astro)](https://astro.build)
[![Three.js](https://img.shields.io/badge/Three.js-r184-000?logo=threedotjs)](https://threejs.org)
[![GSAP](https://img.shields.io/badge/GSAP-3.15-88ce02?logo=greensock)](https://gsap.com)

**[Live Demo →](https://medieval-ages-hxt8.vercel.app/)**

---

## Overview

An immersive, design-forward marketing page for a fictional medieval record-keeping institution. The page itself is the artifact — no product, no checkout, no transaction. Typography, color, motion, and restraint do the persuasion.

Voice: **weathered**, **heraldic**, **solemn**. Aesthetic lane: the working records of a 14th-century port authority — tide tables, customs rolls, oath ledgers — kept by a careful clerk.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | [Astro 4](https://astro.build) — static HTML/CSS output, no client-side framework |
| 3D | [Three.js](https://threejs.org) — brass astrolabe hero artifact & ambient particle system |
| Animation | [GSAP](https://gsap.com) — scroll-triggered reveals, custom cursor, wax-seal interaction, dialogue overlay |
| Fonts | Marcellus (display), Spectral (body), JetBrains Mono (ledger), Pixelify Sans (dialogue) |
| Hosting | [Vercel](https://vercel.com) |

---

## Getting Started

```bash
npm install
npm run dev      # http://localhost:4321
```

| Command | Action |
|---------|--------|
| `npm run dev` | Start dev server with HMR |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview the production build |

---

## Project Structure

```
src/
├── components/        # Astro components (14 section + widget components)
│   ├── Hero.astro             # Asymmetric hero with Three.js astrolabe
│   ├── Chronicles.astro       # Editorial text-led section
│   ├── RelicVault.astro       # Bento-grid relic gallery
│   ├── Orders.astro           # Large-stat oath callouts
│   ├── InnerCircle.astro      # Asymmetric council section
│   ├── SealedCorrespondence.astro  # Wax-seal letter opener (GSAP)
│   ├── GuildTrades.astro      # Ruled ledger list
│   ├── WizardCat.astro        # Animated sprite companion + dialogue overlay
│   ├── AmbientParticles.astro # Three.js particle engine
│   ├── CustomCursor.astro     # GSAP-driven custom cursor with trails
│   ├── BackgroundAudio.astro  # Ambient medieval music toggle
│   ├── SectionFire.astro      # Ember hotspot glow effects
│   └── SiteHeader.astro / SiteFooter.astro  # Chrome
│
├── scripts/           # TypeScript modules for interactivity
│   ├── wizard-cat.ts           # Dialogue engine, sprite cycler, typing SFX
│   ├── sealed-correspondence.ts # Wax-seal break & letter reveal (GSAP timelines)
│   ├── custom-cursor.ts        # Dot/ring/trail cursor (GSAP quickTo)
│   ├── ambient-particles.ts    # Shader-based particle field
│   └── section-fire.ts         # IntersectionObserver glow manager
│
├── styles/            # Global CSS
│   ├── tokens.css     # OKLCH palette, type scale, spacing, motion, z-index
│   ├── typography.css # Font utility classes
│   └── page.css       # Section layouts, bento grid, ledger, header/footer
│
├── data/
│   └── letters.ts     # Sealed correspondence content model
│
├── layouts/
│   └── BaseLayout.astro  # HTML shell, font loading, skip-link
│
└── pages/
    └── index.astro    # Single-page composition entry
```

---

## Features

- **3D Hero** — Brass astrolabe rotating over a wax-sealed letter (Three.js + custom vertex shaders)
- **Ambient Particles** — Shader-based floating ember/snow system synced to scroll
- **Custom Cursor** — GSAP-driven dot + rotating ring + particle trail, with hover scale effects
- **Wax-Seal Letters** — Four seals break open with GSAP-timelined shard scatter, revealing aged parchment correspondence
- **Wizard Cat Companion** — Animated pixel-art sprite in the bottom-right corner cycles 3 idle frames. Click to open a Stardew-inspired dialogue overlay with typewriter effect, 8-bit typing sound, and portrait jitter (all GSAP). Linear 9-page dialogue chain about the sealed letters
- **Bento Relic Grid** — Intentionally varied tile sizes (not 4 identical cards)
- **Ruled Ledger List** — Trade records as a working clerk's table, not a card grid
- **Scroll Animations** — CSS `@keyframes` archive-rise with staggered `nth-child` delays applied on section entry
- **Glassmorphism Header** — Sticky nav with backdrop blur and brass accents
- **Background Audio** — Ambient medieval village music with toggle button
- **Accessible** — `prefers-reduced-motion`, `prefers-contrast`, skip-link, semantic ARIA, keyboard navigation

---

## Design Tokens

All theming lives in `src/styles/tokens.css`. Palette built in OKLCH around a cobalt-indigo anchor at hue 230°:

| Token | Role | Sample |
|-------|------|--------|
| `--ink-well` | Page background | Deep near-black with cobalt undertone |
| `--parchment` | Primary text | Aged paper cream |
| `--brass` | Brand accent | Tarnished bronze-gold |
| `--ember` | Warning / wax-seal | Sealed-wax red, used sparingly |
| `--cobalt` | Brand signal | Royal signal-blue |

Motion tokens: `--ease-out-quart`, `--ease-out-expo`, `--ease-in-out-quart` with a semantic duration scale from 140ms to 1000ms.

---

## License

Private project. Not licensed for redistribution.
