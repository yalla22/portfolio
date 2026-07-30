# Flight Deck — Portfolio for Janadri Yalla Yashwanth

A clean-minimal aerospace portfolio (React + Vite + Framer Motion) for a
**Drone & Geospatial AI Engineer**. Calm "flight deck / survey planner"
aesthetic: a fixed left **instrument spine**, an asymmetric editorial grid, a
Space Grotesk × Inter × JetBrains Mono type system, one decisive **Signal
Orange** accent, a parallax two-column hero, and a visual capability showcase
that deep-links into full case studies.

## Sections (in order)

1. **Hero** — full-screen, two-column, parallax. Role headline, tagline,
   CTAs, contact row, portrait, and four folded-in stat tiles.
2. **Proof Marquee** — seamless auto-scrolling ribbon of the full tech stack.
3. **Showcase** (`#showcase`) — capability gallery (orthomosaic, building /
   tree detection, drone imagery, precision landing, flight-log reports).
   Each panel deep-links into its case study.
4. **Work** (`#work`) — case studies with cover banners, filter chips, and a
   focus-trapped case-study modal (gallery, problem/solution/impact,
   architecture pipeline). Listens for the Showcase deep-link event.
5. **Stack** (`#stack`) — proficiency meters + hub-and-spoke ecosystem diagram.
6. **Path** (`#path`) — interactive vertical career **timeline** + certs strip.
7. **About** (`#about`) — bio.
8. **Contact** (`#contact`) — full contact links (email/phone/GitHub/LinkedIn)
   + résumé and "say hello" CTAs.
9. **Footer** — plus a floating **sticky Résumé CTA** that appears past the hero.

Contact links appear in **both** the hero contact row and the bottom Contact
section. The left instrument spine / mobile nav sheet map to section ids
`work · showcase · stack · path · about · contact`.

## Run locally

```bash
npm install
npm run dev        # http://localhost:5173
```

## Build & preview

```bash
npm run build      # outputs to ./dist
npm run preview    # serves the production build locally
```

## ✅ What YOU need to drop in before publishing

### 1. Headshot — `public/profile.jpg`
Replace the placeholder image with your own square-ish headshot. The hero
portrait and About section read this file; a labelled placeholder shows
automatically if it is missing.

### 2. Résumé — `public/resume.pdf`
Drop your résumé here. The hero "Download Résumé" CTA, the floating sticky
résumé button, and the Contact section all link to it.

### 3. Showcase screenshots — `public/showcase/` (6 files)
The site ships with on-brand **SAMPLE .svg placeholders** (each watermarked
"SAMPLE — replace with real screenshot"). Replace each by either overwriting
the `.svg` with the same filename, or by adding a `.jpg`/`.webp` and updating
the matching `img:` path in `src/data/showcase.js`. Recommended ratio 16:10.

| File (in `public/showcase/`) | Panel |
| --- | --- |
| `orthomosaic.svg`        | Orthomosaic Imagery |
| `building-detection.svg` | Building Detection |
| `tree-detection.svg`     | Tree-Crown Detection |
| `drone-imagery.svg`      | Drone Imagery |
| `precision-landing.svg`  | Precision Landing |
| `flight-log-report.svg`  | Flight-Log Analyzer Reports |

### 4. Case-study gallery screenshots — `public/showcase/` (optional, 10 files)
Until added, each case-study modal shows an inline themed SVG placeholder.
Drop in (referenced by `src/data/projects.js` → `gallery[].src`):
`flight-log-analyzer-1.jpg` / `-2.jpg`, `marut-survey-platform-1.jpg` / `-2.jpg`,
`aerial-object-detection-1.jpg` / `-2.jpg`, `geoai-detection-1.jpg` / `-2.jpg`,
`precision-landing-1.jpg` / `-2.jpg`.

### 5. Per-project GitHub / demo URLs — `src/data/projects.js`
All public repos currently point at the shared profile URL via the `REPO`
constant near the top of the file (`https://github.com/yalla22`). Replace it,
or set each project's `repo`, `live`, and `demo` fields individually:

| Project (`id`) | `repo` | `live` / `demo` |
| --- | --- | --- |
| `flight-log-analyzer`     | shared `REPO` → real repo | add `live`/`demo` |
| `marut-survey-platform`   | `null` (internal — keep private) | — |
| `aerial-object-detection` | shared `REPO` → real repo | add `live`/`demo` |
| `geoai-detection`         | shared `REPO` → real repo | add `live`/`demo` |
| `precision-landing`       | shared `REPO` → real repo | add `live`/`demo` |

### 6. (optional) Social / SEO
Replace `public/og-image.svg` and update the absolute `og:url` / `og:image`
URLs in `index.html` (currently `https://example.com`) to your deployed domain.
Generate a 1200×630 `og-image.png` for social crawlers.

Pre-filled and verified (no placeholder): name, email
`yallayashwanth99@gmail.com`, phone `+91 8790819924`, Hyderabad, CGPA 8.6,
B.Tech CSE (AI & ML) at SVCE Tirupati, Marut Drones / Rooman experience, certs,
and all five project briefs.

## Deploy

### Vercel
1. Push the repo to GitHub.
2. Import at vercel.com → framework preset **Vite**.
3. Build command `npm run build`, output dir `dist`. Deploy.

### Netlify
- New site from Git → build command `npm run build`, publish directory `dist`.
- Or drag-and-drop the `dist/` folder into the Netlify dashboard.

### GitHub Pages
1. `vite.config.js` already uses a relative `base: "./"`, so it works from a
   project subpath.
2. Build, then publish `dist/` (e.g. with `gh-pages` or a GitHub Actions
   workflow that uploads `dist` as a Pages artifact).

## Tech

React 18 · Vite 5 · Framer Motion 11 · @fontsource (Space Grotesk, Inter,
JetBrains Mono) · plain CSS with design tokens (light + dark). Below-the-fold
sections are `lazy()`-loaded and code-split.

## Project structure

```
public/            profile.jpg · resume.pdf · favicon.svg · og-image.svg
                   showcase/  (6 sample SVGs + README)
src/
  main.jsx · App.jsx
  styles/          tokens.css · global.css · fonts.css
  data/            profile.js · projects.js · experience.js · skills.js · showcase.js
  lib/             useTheme · useScrollSpy · useScrollProgress ·
                   useReducedMotion · useInView · useCountUp · motion
  ui/              Dialog.jsx
  components/
    spine/  hero/  marquee/  showcase/  work/  stack/  timeline/  about/  contact/
    common/  Footer.jsx  StickyResume.jsx
```
