# PRODUCT.md — The Citadel of Vael Anore

> Marketing landing page for a fictional medieval archive / strategic-records society. Brand is design-forward, voice-driven, deliberately not a fantasy-RPG or Game-of-Thrones reference. Reads as a working institution: careful, ceremonial, and slow.

## Type
Brand surface · single-page · portfolio-style · one dominant scroll.

## Audience
Visitors who care about craft, restraint, and atmosphere. The page itself is the artifact: typography, color, and rhythm do the persuasion. No product, no checkout, no transaction.

## Register
Brand (`reference/brand.md`). Design IS the product.

## Voice (three concrete words)
- **Weathered.** Not clean, not "luxe". Stone, ink, brass that has been touched for years.
- **Heraldic.** Formal, structured, ruled. Not fantasy.
- **Solemn.** Quiet authority. No exclamation marks, no urgency.

## Aesthetic lane (named, deliberate)
**Heraldic-archive.** A reference, not a recipe: the working records of a 14th-century port authority — tide tables, customs rolls, oath ledgers — kept by a careful clerk. *Not* italic display serifs on a magazine grid (that's a reflex-reject lane).

Distinct from typical medieval:
- ❌ Cinzel + parchment + "FORGED IN SILENCE" (Cinzel reflex)
- ❌ Game of Thrones title card
- ❌ Italic display serif + tracked mono (editorial reflex)
- ❌ Dark fantasy RPG UI

Closer to:
- A tide-and-customs ledger from a working medieval port authority
- Wax-sealed correspondence, not epic poetry
- Brass instruments laid out on a counting board

## Color strategy
**Drenched.** The page IS a deep, weathered near-black with cool-cobalt undertone. Bronze/brass carries the brand; parchment cream carries legibility; ember red is reserved for a single active oath/contract.

Anchor: cobalt-indigo at hue 230°. Compose around it.

## Sections (each with a different shape; break the card-grid reflex)
1. **Header.** Minimal nav, brand stamp, no bar of pills.
2. **Landing.** Asymmetric, full-bleed ink, hero h1 leads at display scale, 3D scene as artifact, not decoration.
3. **Chronicles.** Editorial text-led with one large pull quote. *Not* a card grid.
4. **Relic Vault.** Bento grid with intentionally varied tile sizes (one large, others smaller). *Not* 4 identical cards.
5. **Orders.** Large-stat callouts (one big number per order, then context). *Not* icon+heading+text card.
6. **The Inner Circle.** Asymmetric — alternating portrait-and-text columns, not 4 cards.
7. **Guild Trades.** LEDGER LIST — a two-column ruled ledger of trades, not cards. *Not* numbered boxes.
8. **Quiet footer** with seal stamp.

## Typography
- Display: **Marcellus** (single-weight Roman, heraldic, not Cinzel)
- Body: **Spectral** (long-form, period-neutral)
- Ledger: **JetBrains Mono** (numbers, dates, columns)

## Tech stack
Astro (default for brand surfaces). Compiles to clean static HTML/CSS. No client-side framework.

## Imagery
The medieval portraits from the original `template 3/image/` directory are re-used — they fit the heraldic-archive voice. The 3D scene in the original is re-built as a more deliberate Three.js artifact (a brass astrolabe rotating on a wax-sealed letter, not just a sword).

## What we are NOT shipping
- "01 / 02 / 03" numbered section markers (absolute ban)
- Repeated tiny uppercase tracked eyebrows above every section (AI grammar)
- Identical card grids repeated across 5 sections
- "border + wide soft drop shadow" ghost-card pattern on the same element
- Glassmorphism, gradient text, repeating-linear-gradient stripe backgrounds
- "Read The Scroll" / "Inspect" generic CTAs (specific verbs instead)
- 32px+ border-radius on cards (12-16px ceiling)
- Em dashes in copy
- All-caps body copy
