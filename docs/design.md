# Design direction

Status: **approved** (Part 4 of `docs/PLAN.md`). Building against this direction from Part 5 onward.

## Concept

Anafa's work is literally about teaching machines to *see* — drawing boxes around crops from a drone, tracking a football through broadcast video, segmenting flood water in radar imagery, clustering license plates from CCTV. The design leans into that directly instead of reaching for generic "AI startup" visual language (neural-net node graphics, circuit patterns, purple-to-pink gradients) or soft/pastel "feminine" defaults (blush pink, script fonts, rounded bubbly UI).

The throughline is **the vocabulary of computer vision itself**: bounding boxes, detection corners, confidence tags. It's authentic to the CV — nearly every role listed (Airis-Labs, Taranis, Pixellot, PlanetWatchers) centers on detection, segmentation, or tracking — and it reads as sharp and technical without being cold, because it's applied with warm, human color and a serif body voice rather than a sterile dashboard aesthetic.

## Palette — "Night Field"

Named for the dark, high-signal imagery her work is built on (satellite passes, night broadcast floodlights, radar returns) crossed with the warmth of an actual field under sun — not a cold black-and-neon "AI" palette, and not a cream/terracotta soft palette either.

| Token | Hex | Role |
|---|---|---|
| Ink | `#14181A` | Primary background — near-black with a faint cool-green cast (not flat #000; softer, less "dashboard") |
| Ink Raised | `#1D2224` | Card/panel surface, one step up from Ink — subtle elevation, not a contrast pair |
| Ivory | `#EFEAE0` | Primary text on dark, and background for light content bands — warm off-white, deliberately not stark white or cream-yellow |
| Amber Signal | `#E8A33D` | Primary accent — links, CTAs, bounding-box corners, active states. Warm gold, evokes sunlit fields / sensor highlight overlays. Used flat, never as a gradient. |
| Field Teal | `#4F9D8C` | Secondary accent — skill tags, secondary UI, small highlights. Desaturated teal-green, evoking vegetation-index and radar-return color coding from her satellite/agriculture work. |
| Slate | `#8B9296` | Muted text — dates, captions, metadata |

**Contrast verified (WCAG relative-luminance formula, checked programmatically):**

| Pair | Ratio | AA normal text (≥4.5:1) |
|---|---|---|
| Ivory on Ink | 14.90:1 | Pass |
| Amber on Ink | 8.28:1 | Pass |
| Field Teal on Ink | 5.56:1 | Pass |
| Slate on Ink | 5.66:1 | Pass |
| Ink on Amber (button label) | 8.28:1 | Pass |
| Ink on Ivory (light band text) | 14.90:1 | Pass |

Every text/background pairing in active use clears AA for normal text, several clear AAA (7:1). Ink Raised vs. Ink (1.11:1) is a surface/elevation pair, not a text pair — intentionally subtle, not meant to carry contrast on its own. Full page-level accessibility pass still happens in Part 8.

**Why not the obvious choices:** no cream+terracotta (too soft/decorative for "sharp, technically deep"); no black+neon-gradient hero (the single flat amber accent avoids the generic-AI-startup gradient look); no pastel/blush palette (the brief explicitly rejects soft "feminine" cliché); no pure black (`#14181A` is warmer and less sterile than `#000000`).

## Type pairing

- **Display — [Space Grotesk](https://fonts.google.com/specimen/Space+Grotesk)**: name, section headings, nav, stats/numbers, role titles. A grotesk with a distinct technical/scientific character (designed originally for a monospaced context) — confident and precise without being another generic Inter/Poppins SaaS default.
- **Body — [Source Serif 4](https://fonts.google.com/specimen/Source+Serif+4)**: bio paragraph, role descriptions, running copy. A warm, highly readable humanist serif. Pairing a technical display face with a serif body is the deliberate warmth move — it reads like a well-written professional profile rather than a marketing dashboard, and directly serves the "warm and personable, not cold or corporate" brief.

Both are open-source (SIL OFL), available via Google Fonts, and free to self-host if we want to avoid an external font-CDN request later — worth deciding before Part 5 (see open question below).

## Layout concept

Single-page scrolling site, one clear section per screen, generous vertical rhythm (no cramped SaaS-style dense grid). Content sections follow CV structure directly — no invented sections.

```
┌──────────────────────────────────────────────┐
│  ANAFA COHEN                                  │  slim wordmark / top anchor
├──────────────────────────────────────────────┤
│   ⌐                                    ¬      │
│        Anafa Cohen                            │
│        Senior Computer Vision & ML Engineer   │  HERO
│        [ headshot — bounding-box framed ]     │
│        [ Let's talk → ]                       │
│   ⌞                                    ⌟      │
├──────────────────────────────────────────────┤
│  ABOUT                                        │
│  bio paragraph (serif)      6+ yrs             │  stat callouts pulled
│                              4 industries       │  straight from cv.json,
│                              Physics B.Sc.      │  no invented copy
├──────────────────────────────────────────────┤
│  EXPERIENCE                                    │
│  ⌐ Airis-Labs · 2024–2025 ¬   [photo/placeholder]│
│    — bullet, bullet, bullet                    │
│  ⌐ Taranis · 2023–2024 ¬      [photo/placeholder]│
│  ⌐ Pixellot · 2022 ¬          [photo/placeholder]│
│  ⌐ PlanetWatchers · 2019–2021 ¬ [photo/placeholder]│
├──────────────────────────────────────────────┤
│  SKILLS                                        │
│  [Computer Vision tags]  [Deep Learning tags]  │
│  [Applied ML tags]  [Production ML tags]  [Programming tags] │
├──────────────────────────────────────────────┤
│  AVAILABLE FOR FREELANCE WORK                  │
│  short statement + contact CTA                 │
├──────────────────────────────────────────────┤
│  CONTACT — email · location                    │
└──────────────────────────────────────────────┘
```

Mobile: same section order, single column, hero image drops below the name/tagline, experience cards stack full-width.

## Signature visual element: bounding-box corners

A recurring **detection-frame motif** — four thin L-shaped corner brackets (⌐ ⌝ ⌞ ⌟, drawn as simple CSS-bordered pseudo-elements, not images/icons) framing:
- the hero headshot and every role photo/placeholder,
- section headings on scroll-into-view (corners "snap in" briefly, respecting `prefers-reduced-motion` — no motion if set),
- skill tags styled as small detection labels (e.g. a tag reading `OBJECT DETECTION` in the Amber accent, echoing a model's output label).

This is drawn directly from her actual work — bounding boxes are the literal output of nearly every project on the CV — rather than a decorative "tech" flourish. It's the one signature element carried consistently through hero, experience, and skills.

## Font loading

Decided: Space Grotesk / Source Serif 4 load via Google Fonts `<link>` in `<head>` — simplest, standard for static sites, no build step required.
