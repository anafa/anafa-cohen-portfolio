# High level steps for project

## Project context (read first)

This is a personal landing page / portfolio site for an algorithm developer who is open to freelance work. Content comes from a CV the user will provide, plus a headshot and per-job photos (some jobs may be missing photos — use clearly marked placeholders, never stock photos or invented images). The tone/brand should read as: a strong, professional woman in science/tech — sharp, credible, technically deep, warm and personable, not cold or corporate, and not built around soft/pastel "feminine" cliches. Avoid generic AI-site defaults (cream+terracotta, black+neon gradient hero, etc) — make real, justified design choices. This is a static personal site: no user accounts, no database, no AI features — keep scope tight to what's listed below.

## Tooling decision (proposed, needs sign-off)

This machine has **Python 3.11** available but **no Node.js/npm**. Given the brief calls for "the simplest tooling that fits" and explicitly says no framework overhead unless justified, the proposal is:

- **Plain HTML/CSS/JS**, no build step, no framework, no bundler.
- **Local dev server**: Python's built-in `http.server` module, run from `scripts/start` and stopped from `scripts/stop`. Avoids requiring the user to install Node just to preview the site.
- Both a PowerShell (`.ps1`) and a Bash (`.sh`) version of each script will be provided since both shells are available in this environment.
- Content is authored as a single `content/cv.json` that HTML/JS reads at runtime (via `fetch`), so content edits never require touching markup.

If this changes (e.g. the user wants to install Node and use a lightweight static site generator like Eleventy/Astro), say so before Part 2 starts and the plan below will be adjusted.

## Part index

1. Plan (this document)
2. Scaffolding
3. Content ingestion
4. Design direction
5. Hero + About sections
6. Experience / career section
7. Skills, freelance availability, and contact sections
8. Responsive, accessibility, and cross-browser polish
9. Review and refinement loop
10. Deployment

---

## Checklists, tests, and success criteria

### Part 1 — Plan

**Substeps**
- [x] Read existing PLAN.md and understand project goals.
- [x] Check local tooling (Node/npm/Python availability) to ground the tooling decision.
- [x] Enrich PLAN.md with detailed substeps, tests, and success criteria for every part.
- [x] Create `frontend/AGENTS.md` stub describing the (currently empty) frontend code, to be updated as the project grows.
- [x] Present this plan to the user and get explicit approval before Part 2 begins.
  - Tooling confirmed: plain HTML/CSS/JS + Python `http.server`, no Node/framework.
  - CV/photos to be provided after Part 2 scaffolding is confirmed working.

**Tests / checks**
- Plan reviewed by the user; open questions (tooling, structure) answered or explicitly deferred to their respective parts.

**Success criteria**
- User has explicitly approved this plan (including the tooling decision) before any scaffolding work starts.

---

### Part 2 — Scaffolding

**Substeps**
- [x] Create directory structure:
  - `frontend/` — `index.html`, `css/styles.css`, `js/main.js`, `images/` (headshot, job photos, placeholders), `AGENTS.md`
  - `scripts/` — `start.ps1`, `start.sh`, `stop.ps1`, `stop.sh`
  - `content/` — reserved for `cv.json` (Part 3), with a `README.md` explaining its purpose
  - `docs/` — `PLAN.md` (this file), reserved `design.md` (Part 4)
- [x] Write `scripts/start.*`: serve `frontend/` on a fixed local port (8000) via `python -m http.server`, running detached, writing its PID to `scripts/.server.pid`.
- [x] Write `scripts/stop.*`: read the PID file and terminate the dev server process.
- [x] Build a placeholder `frontend/index.html` ("Hello World") with a minimal linked CSS and JS file to confirm the full pipeline (HTML + CSS + JS all load correctly).
- [x] Update `frontend/AGENTS.md` to reflect the real scaffolded structure.

**Tests / checks**
- [x] Ran `scripts/start.sh` — server started, PID file created, printed `http://localhost:8000`.
- [x] `curl`'d `http://localhost:8000/`, `/css/styles.css`, `/js/main.js` — all returned HTTP 200 with expected content.
- [x] Ran `scripts/stop.sh` — process terminated, PID file removed, subsequent request to `http://localhost:8000/` refused (server confirmed down).
- [ ] Visual/console check that `js/main.js` actually executes in a rendered browser (appends "— JS loaded" to the heading, no console errors) — **not verified this session**, no browser automation tool was available (user declined the Chrome extension install). HTTP-level checks confirm the file is served correctly and is syntactically loadable; DOM-execution wasn't visually confirmed. Recommend a quick manual check (`scripts/start`, open `http://localhost:8000` in a browser, confirm heading reads "Hello World — JS loaded") next time a browser is available, or before relying on JS-driven rendering in Part 5.

**Success criteria**
- A single command starts a local server serving the placeholder page; a single command stops it cleanly. No dead processes left behind after stop. Met, with the one caveat above about unverified in-browser JS execution.

**Correction (found during Part 5 testing):** `stop.sh`'s original "stopped cleanly" claim above was a false positive — the dev server was silently leaking processes on port 8000 across sessions. Root cause: Git Bash's MSYS layer assigns its own virtual PID numbers that are only valid within one bash session, so a PID written by `start.sh` could refer to the wrong (or no) process by the time a later `stop.sh` invocation tried to kill it. (First fix attempt blamed `nohup`'s wrapper process alone — real, but not the whole story; the leak persisted after removing it.) Properly fixed by having `start.sh`/`stop.sh` track and kill the real Windows PID via `taskkill` instead of bash's `kill`. Re-verified with repeated start/stop cycles across separate shell invocations, checked with `netstat` each time, not just the scripts' own exit messages. Full explanation in `frontend/AGENTS.md`. Also switched both scripts to serve the **project root** instead of `frontend/` only, so `frontend/js/main.js` can `fetch("../content/cv.json")` — site now lives at `http://localhost:8000/frontend/`.

---

### Part 3 — Content ingestion

**Substeps**
- [x] Receive the CV from the user.
- [x] Extract into `content/cv.json` with: `name`, `title`/tagline, `bio`, `contact`, `skills` (grouped), `roles[]` (company, title, startDate, endDate, description bullets, photo placeholder), plus `education`, `certifications`, and `languages` (captured though not yet assigned a page section).
- [x] Flag ambiguities to the user rather than inferring or embellishing: bio voice (CV summary was third-person; converted to first-person, voice only, no facts changed), missing hero tagline (no tagline in CV — placeholder set to job title, real copy deferred to Part 5), no photos supplied (headshot + all 4 roles marked as placeholders), and no dedicated page section for education/languages (kept in JSON, display decision deferred).
- [x] Present the structured JSON back to the user for review.

**Tests / checks**
- [x] Validated `cv.json` is well-formed JSON (`python -m json.load`).
- [x] Diffed structured content against the source CV line-by-line — all 4 roles, dates, bullets, skills, education, certification, and languages transcribed faithfully with nothing invented or dropped.

**Success criteria**
- Met. User explicitly confirmed the bio wording, tagline placeholder approach, all-placeholder photos, and education/languages handling — all four questions answered "recommended" option, no edits needed to `content/cv.json`.

---

### Part 4 — Design direction

**Substeps**
- [x] Propose a named color palette with real hex values, justified against the brief: "Night Field" — Ink `#14181A`, Ink Raised `#1D2224`, Ivory `#EFEAE0`, Amber Signal `#E8A33D`, Field Teal `#4F9D8C`, Slate `#8B9296`.
- [x] Propose a type pairing with rationale: Space Grotesk (display) + Source Serif 4 (body), loaded via Google Fonts CDN.
- [x] Propose a layout concept: prose + ASCII wireframe for the single-page scroll (hero → about → experience → skills → freelance → contact).
- [x] Propose one signature visual element: bounding-box corner brackets (drawn from the literal output of her CV/detection work), framing photos and tagging skills.
- [x] Write it all up in `docs/design.md`.

**Tests / checks**
- [x] Palette contrast-checked programmatically against the WCAG relative-luminance formula for every active text/background pairing — all pass AA (5.56:1–14.90:1); full page-level audit still happens in Part 8.

**Success criteria**
- Met. User explicitly approved `docs/design.md` (palette, type pairing, layout, signature element, and Google Fonts CDN font-loading decision) before any page markup was written.

---

### Part 5 — Hero + About sections

**Substeps**
- [x] Build hero: name, tagline, headshot (bounding-box framed, placeholder shown since no photo supplied), primary call to action (`mailto:` link to confirmed contact email — no `#contact` anchor yet since Part 7 doesn't exist) — per approved design direction, using only real content from `content/cv.json`.
- [x] Build About: first-person bio pulled from `content/cv.json`, plus stat callouts (years experience, domain count, degree) derived from `highlights`/`education` fields.
- [x] Mobile responsive layout for both sections (mobile-first CSS, `@media (min-width: 768px)` for two-column desktop layout).
- [x] Implement the approved "Night Field" palette, Space Grotesk/Source Serif 4 type pairing, and bounding-box corner signature element (photo frame + section headings) in `css/styles.css`.
- [x] Update `frontend/AGENTS.md` to reflect the real Part 5 structure and conventions.

**Tests / checks**
- [x] Fixed a real dev-server bug found while testing this part (see correction note under Part 2) — `stop.sh` wasn't actually killing the server process; fixed and re-verified via `netstat`.
- [x] HTTP-level check: `index.html`, `css/styles.css`, `js/main.js`, and `../content/cv.json` (fetched from `frontend/`) all return 200.
- [x] Cross-checked every `cv.json` field path referenced in `main.js` against the actual file — all resolve correctly, no silent `undefined`s.
- [x] Confirmed no placeholder/lorem-ipsum content — all rendered text traces to `content/cv.json`.
- [x] Reduced-motion and mobile breakpoints reviewed in code (mobile-first base styles, `prefers-reduced-motion` guards on all animation).
- [ ] **Not verified this session**: actual in-browser visual/DOM rendering. No browser automation tool was available (same limitation as Part 2). HTTP + static field-mapping checks give reasonable confidence, but a manual look in an actual browser is still recommended before Part 6, and full visual review against `docs/design.md` is explicitly still owed per Part 5's own spec ("Comprehensive visual/manual review against the design doc").

**Revision (user visual review, v1 → v2):** User reviewed v1 in-browser and gave feedback: liked the "Night Field" palette, disliked the overall layout/composition, found the page too sparse/empty, and felt the bounding-box corner motif wasn't landing. Root issue: the corners were decorative sprinkling on an otherwise generic centered-hero-plus-stat-cards layout rather than a true structural signature element. Reworked (details in `frontend/AGENTS.md`):
- Hero rebuilt as one `.hero-frame` containing photo + headline + CTA together, large-scale corner brackets at its edges, plus a `.frame-tag` annotation label (`SUBJECT: ENGINEER · CONF 0.99`) styled like a real detection-model overlay — makes the motif load-bearing, not decorative.
- About's stat-card grid (a generic SaaS pattern) replaced with a single bordered "readout panel" (label/value rows, monospace values) — same visual language as the hero frame.
- Added a faint scan-grid body texture (ties to the satellite/radar/tracking imagery in her actual work) and tightened type scale/spacing to address the sparse feeling independent of Experience content not existing yet.
- Direction was described back to the user in prose before rebuilding (given no browser tool to preview against) and got explicit go-ahead before implementation.

**Success criteria**
- Met. User reviewed the v2 rebuild in-browser and confirmed it "looks better" — palette, revised layout, and reworked corner motif all approved. Part 5 closed.

---

### Part 6 — Experience / career section

**Substeps**
- [x] Render one entry per role from `content/cv.json` (company, title, dates, description bullets) — Airis-Labs, Taranis, Pixellot, PlanetWatchers, in the reverse-chronological order already present in the JSON.
- [x] Show each role's photo, or a clearly marked "photo coming soon" placeholder where none was supplied.
- [x] Confirm with the user exactly which roles still need photos — carried forward from Part 3: headshot + all 4 role photos remain placeholders (no new photos supplied since). Flagged again in this session's summary in case that's changed.
- [x] Add descriptive alt text to every image — placeholders use no `<img>` element at all (avoids empty/misleading alt, same pattern as the hero); the alt pattern for when a real photo lands is `"{name} at {company}"`.
- [x] Kept the bounding-box corner motif restricted to the hero frame and section headings — role photos deliberately use the plain placeholder style, not corners, per the restraint established after the Part 5 redesign feedback.

**Tests / checks**
- [x] Cross-checked every field `renderExperience()` references (`company`, `title`, `startDate`, `endDate`, `description[]`, `photoPlaceholder`, `photo`) against `content/cv.json` programmatically — all 4 roles have all required fields, `description` arrays are all string lists.
- [x] `formatDateRange()` correctly collapses Pixellot's `startDate === endDate === "2022"` to a single `"2022"` rather than `"2022 – 2022"`.
- [x] HTTP-level check: page loads, `#experience`/`#role-list` markup present, `css/styles.css` and `js/main.js` both 200.
- [x] Mobile-first CSS: role cards stack (photo above content) below 768px, switch to side-by-side above — reviewed in code, matches the pattern already used for the hero.
- [ ] **Not verified this session**: in-browser visual/DOM rendering — no browser tool available. Recommend a manual look before Part 7.

**Success criteria**
- Every role from the CV appears with correct details (structurally verified); missing photos are clearly marked as placeholders, never faked. Photo status re-confirmed with the user as still "all placeholders." Visual/manual review still owed (see caveat above).

---

### Part 7 — Skills, freelance availability, and contact sections

**Substeps**
- [x] Build a scannable skills section from `content/cv.json`'s skills list — grouped by category (Computer Vision, Deep Learning, Applied ML, Production ML, Programming), each rendered as a row of tag chips styled like detection labels (amber outline, monospace, uppercase) — same visual language as the hero frame tag, no corner brackets (per the established restraint).
- [x] Drafted a freelance-availability statement and explicitly presented the assumption behind it (CV/ML consulting: model development, benchmarking, production pipeline work) to the user before writing it into content.
- [x] Got user confirmation — approved as drafted, no changes. Statement stored in `content/cv.json`'s new `freelance.statement` field (new creative copy, not a CV fact, but structured content per the established pattern of everything living in `cv.json`).
- [x] Built a contact section with email as the contact method. Also explicitly asked the user whether to show the CV's phone number publicly — they chose email-only, so phone (and location) are intentionally omitted from the public page, kept only in `cv.json` for reference.
- [x] Hero CTA switched from a direct `mailto:` link to `#contact` now that the Contact section exists (was previously a placeholder decision noted in Part 5, revisited as planned).

**Tests / checks**
- [x] Cross-checked `skills`, `freelance.statement`, and `contact.email` fields against `content/cv.json` programmatically — skills has 5 categories all with string-array tags, freelance statement and email both present and non-empty.
- [x] `contact-email` link's `href` is set to `mailto:{email}` dynamically from the same confirmed field the hero and noscript fallback already use — one source of truth, no risk of drifting/mismatched email addresses across the page.
- [x] HTTP-level check: `#skills`, `#freelance`, `#contact` markup present, `css/styles.css` / `js/main.js` / `content/cv.json` all 200.
- [ ] **Not verified this session**: in-browser visual/DOM rendering — no browser tool available. Recommend a manual look before Part 8.

**Success criteria**
- Met. User explicitly confirmed the freelance-availability framing and the phone-number/email-only decision before either was built. Contact method (email) is structurally correct and traces to the same confirmed `cv.json` field used elsewhere on the page.

**Revision (user follow-up request, after Part 7):** Three targeted changes across the already-built Hero/Experience/Freelance work, before starting Part 8:
1. Removed the hero's `.frame-tag` annotation label (`SUBJECT: ENGINEER · CONF 0.99`) entirely, per explicit request. The hero frame's corner brackets remain.
2. Reworked Experience cards: each role now shows a small company-logo placeholder on the left (`role.logo` in `cv.json`, replacing the old single `role.photo`/`photoPlaceholder` pair) and a large, browsable project-image gallery on the right (`role.gallery[]`, a real carousel component with prev/next + dots that only appear once 2+ images exist — currently a single "coming soon" placeholder per role since all galleries are empty). Desktop: logo | text | gallery as three columns; mobile: stacked.
3. Moved the freelance-availability statement to a short, unheaded paragraph between the hero and About (`.freelance-intro`), dropping the standalone "Freelance" section, its heading, and its second CTA button. Same confirmed `freelance.statement` text, just relocated.

Re-tested after the changes: `cv.json` still valid JSON and every field the JS references resolves (`logo.file`/`logo.placeholder`, `gallery` as a list on all 4 roles, no leftover `photo`/`photoPlaceholder` references in `main.js`); HTTP-level checks confirm the frame-tag string no longer appears in the served page, the freelance paragraph now sits before `#about` with no wrapping section, and all assets still 200. **Not verified this session**: in-browser visual/DOM rendering of the new gallery/logo layout or the relocated freelance paragraph — no browser tool available. Recommend a manual look before Part 8.

**Revision 2 (user follow-up, About section content):**
1. Replaced the About readout's "Focus Areas" row content — user supplied the exact replacement list directly (`Deep Learning · Computer Vision · Audio Processing · Voice Recognition`, superseding the original list that had been extracted from the CV bio's wording). Stored in `content/cv.json`'s `highlights.domains`.
2. Added a new "Core Capabilities" row to the same readout panel (8 items, user-supplied verbatim) — stored in `highlights.coreCapabilities`. Given its length, a plain right-aligned mono row (the pattern used by the other three rows) would have wrapped into an unreadable block, so this row got a distinct treatment instead: label on its own line, then wrapped tag chips reusing the Skills section's `.skill-tag` styling — same information, same section, more scannable. Documented as a reusable pattern (`.readout-row--wrap`) in `frontend/AGENTS.md` for any future long lists in this panel.

Re-tested: `cv.json` valid JSON, `highlights.domains`/`highlights.coreCapabilities` both present and correctly UTF-8 encoded in the file (a garbled terminal print of the `·` character during testing was a console-encoding display artifact, not file corruption — confirmed by reading the raw file). All assets still 200 after the change. **Not verified this session**: in-browser rendering — no browser tool available. User asked to "check the design is good" after this change; done at the structural/CSS level (reasoned through wrap behavior and content length) but not visually — worth a real look.

**Revision 3 (user visual review of Revision 2):** After actually looking at Revision 2 in-browser, user asked for two changes: (a) swap the order of "Core Capabilities" and "Education" rows, (b) drop the boxed tag-chip treatment — display Core Capabilities as the same plain dot-separated line as the other rows, boxes felt inconsistent. Both applied; `.readout-row--wrap` CSS removed as dead code since nothing used it anymore.

**Revision 4 (user follow-up, restructured further):** User then asked to remove the Core Capabilities row from About entirely, and instead rename the existing "Skills" section to **"Core Capabilities"**, reposition it directly after About (before Experience), and merge all 8 items from the old `highlights.coreCapabilities` list into the appropriate existing skill category ("under the correct subtitle") rather than keeping them as a separate flat list.
- `highlights.coreCapabilities` deleted from `content/cv.json`; About's readout is back to 3 rows (Experience, Focus Areas, Education).
- Merged into `skills`: `Image Segmentation` + `SAR & Optical Satellite Image Processing` → Computer Vision; `Real-Time Algorithm Optimization` → Applied ML; existing `Benchmarking` renamed to `Benchmarking & Evaluation` (the more descriptive phrasing the user had just given) rather than adding a near-duplicate tag. `Object Detection`, `Image Classification`, `OCR` needed no action — already present verbatim under Computer Vision.
- `Speaker Recognition` didn't fit any of the 5 existing categories (none are audio-specific) — asked the user rather than guessing; they chose a new **Audio & Speech** category, added with just that one item.
- Section renamed in `index.html`: `id="skills"` → `id="core-capabilities"`, heading text "Skills" → "Core Capabilities", moved directly after `#about` and before `#experience`. `main.js`'s `renderSkills()` now targets `#core-capabilities-groups`; no other logic changes needed since it already iterates `cv.skills` categories generically.

Re-tested: `cv.json` valid JSON; every category confirmed via a printed dump; confirmed `coreCapabilities` no longer exists in `highlights`; HTTP-level check confirms section order in the served HTML is About → Core Capabilities → Experience → Contact, and the heading text reads "Core Capabilities" with no leftover "Skills" text. **Not verified this session**: in-browser visual rendering — no browser tool available.

**Revision 5 (real project images added, ahead of Part 6's photo confirmation):** User supplied a folder of real project screenshots (`.../Work/images for landing page`, with an `ignore/` subfolder correctly excluded per instruction) and asked them added to each role's gallery, matched by filename prefix, with Airis-Labs left as a placeholder since no images exist for it.
- Copied 18 PNGs into `frontend/images/`: 6 `taranis*`, 5 `pixellot*`, 7 `planetwatchers*`.
- Read every image individually (not just filenames) to write specific, accurate alt text rather than generic placeholders — e.g. Pixellot images turned out to be player/ball detection overlays and broadcast-production UI screenshots, PlanetWatchers images included a U-Net architecture diagram and a multi-model segmentation benchmark comparison, Taranis images showed drone-based seedling detection at multiple growth stages. Alt text reflects what's actually in each image.
- Ordered each gallery numerically by filename suffix (e.g. Pixellot: 2, 5, 6, 7, 10 — not lexical order, which would have put 10 before 2).
- `content/cv.json`: `roles[].gallery` populated for Taranis (6), Pixellot (5), PlanetWatchers (7) with `{file, alt}` objects; Airis-Labs stays `gallery: []`. No code changes needed — `buildGallery()` in `main.js` already handles populated arrays generically (nav controls appear automatically once a role has 2+ images).

Re-tested: `cv.json` valid JSON, gallery counts per role confirmed (0/6/5/7 as expected); spot-checked image files serve correctly (HTTP 200) via the dev server at their `frontend/images/` paths. **Flagged, not acted on**: the 18 images total ~16MB unoptimized — worth compressing before Part 8/10 if page load performance becomes a concern; not done since nobody asked for it yet. **Not verified this session**: in-browser visual rendering of the galleries/carousels — no browser tool available.

**Revision 6 (user follow-up: gallery sizing, logos, profile picture):**
1. **Gallery sizing** — user asked for the gallery images to be shown larger, "to the size of the text of the details," with every company's gallery the same size ("the same size as the largest you find"). Implemented with real measurement rather than a guessed value: `syncGalleryHeights()` in `main.js` measures every `.role-content` block's rendered height at desktop widths and applies the tallest one to all `.gallery-viewport` elements, so all four galleries are guaranteed equal and sized to the tallest role's actual text content. Re-runs on web-font load (avoids a stale measurement from pre-font-swap layout) and on window resize; falls back to a plain `aspect-ratio: 4/3` below the 768px breakpoint where cards stack. Widened the desktop `.role-gallery` column itself too (fixed ~22rem → flexible ~45%, min 26rem).
2. **Company logos** — found real logo files (`airis_logo.png`, `pixellot logo.png`, `planetwatchers_logo.png`, `taranis_logo.png`) in the same source folder as the gallery images; copied in (renaming the one with a space to `pixellot_logo.png`). Checked each with PIL: all 4 are fully opaque PNGs with their own baked-in background — two dark (Airis, Pixellot), two light (Taranis, PlanetWatchers). Design decision (since the user asked for one, not a specific instruction): gave every logo, real or placeholder, a uniform ivory "mount" background in a fixed 7.5rem × 3.25rem rectangle (not square — real wordmark logos are wide), `object-fit: contain` so none get distorted or cropped. This makes the mixed dark/light brand assets read as one consistent set instead of four differently-toned images sitting directly on the page background.
3. **Profile picture** — `headshot.photo` set to `my_profile_picture.jpeg`, `placeholder: false`. Hero photo frame now shows a real portrait instead of the placeholder.

Re-tested: `cv.json` valid JSON; every role's `logo.file`/`logo.placeholder` and `headshot.photo`/`headshot.placeholder` printed and confirmed correct; all 5 new image files (4 logos + headshot) spot-checked as HTTP 200 via the dev server. **Not verified this session**: in-browser visual rendering — no browser tool available, so the actual gallery-height-matching behavior (a real DOM measurement done in the browser, not something checkable via curl) is unverified beyond code review. Recommend a manual look, specifically checking that all 4 galleries really do render at the same height and that it looks intentional rather than oversized/empty.

**Revision 7 (real bug found from Revision 6 + sizing follow-up):**
1. **Real bug, not a design tweak**: user reported leftover "Photo coming soon" / "Logo" text still showing after Revision 6 added the real headshot and logos. Root cause: `.photo-placeholder { display: flex; ... }` (needed for centering the placeholder text) is an author rule, and author rules always beat the browser's default `[hidden] { display: none }` regardless of specificity — so `element.hidden = true` in `main.js` (the mechanism used to hide placeholders once a real image loads) silently had no effect. This bug existed since Part 5, just wasn't visible until real images existed to reveal it. Fixed with one global rule, `[hidden] { display: none !important; }`, added to the CSS reset section — covers every current and future placeholder element using this hide/show pattern, not a per-element patch.
2. **Sizing**: user asked to scale "the images" up by 1.3×, describing the metric as "diameter" (interpreted as the profile picture and company logos — the two image types under discussion — not the project galleries, whose size is already dynamically matched to content height per Revision 6, not a fixed value). `.hero-photo` width: `clamp(140px, 30vw, 190px)` → `clamp(182px, 39vw, 247px)`. `.role-logo`: `7.5rem × 3.25rem` → `9.75rem × 4.23rem`, padding scaled proportionally too.

Re-tested: confirmed the `[hidden]` rule and both new size values are present in the served `css/styles.css`. **Not verified this session**: in-browser confirmation that the placeholders are actually gone now and the new sizes read as intended — no browser tool available. If "the images" in the sizing request was meant to include the project galleries too, that wasn't touched (they're driven by the content-height-matching logic, not a fixed size) — flag if that's wanted.

**Revision 8 (the placeholder bug persisted — real root cause was different):** User reported the exact same "Photo coming soon" box still visible below the profile picture, after Revision 7's `[hidden]` CSS fix. Re-verified HTML (`id` matches), CSS (`[hidden]` rule correctly present with `!important`), and JS (`renderHero()` logic correct) line by line — all three were actually fine. Real cause: `python -m http.server` sends `Last-Modified` but no `Cache-Control`/`Expires` header (confirmed via response headers), which is precisely the condition under which browsers apply heuristic caching and can silently serve a stale response on a normal reload — most likely a cached pre-fix `content/cv.json` (or `styles.css`) being served to the browser without revalidation. Fixed the JSON side by adding `{ cache: "no-store" }` to its `fetch()` call, so `cv.json` is always fetched fresh going forward regardless of browser heuristics. CSS/JS/image assets are loaded via `<link>`/`<script>`/`<img>` tags, not `fetch()`, so they can't get the same fix — **a hard refresh (Ctrl+Shift+R) is needed when reviewing any CSS/JS change from here on**, a plain reload may not pick it up.

**Revision 9 (bug still not resolved after hard refresh — root-caused via screenshot):** User reported "it didn't change" even after being asked to hard refresh. Rather than guess again, asked for a screenshot to see the actual rendered page — this was the right call: it showed the real headshot displaying correctly with the placeholder box still visibly stacked directly beneath it. Before concluding it was still caching, did one more full pass: byte-diffed the exact `id="hero-photo-placeholder"` string in `index.html` against the `getElementById("hero-photo-placeholder")` call in `main.js` via `xxd` (ruled out an invisible-character/typo mismatch), and grepped the entire CSS file for every use of `!important` (only one exists, the `[hidden]` rule itself — no competing important rule was silently winning). Every code-level hypothesis came back negative, which left "the browser is serving something other than what's on disk" as the only remaining explanation, consistent with Revision 8's caching diagnosis — evidently a plain hard refresh wasn't reliably clearing it in practice. Fixed with a manual cache-busting query string (`css/styles.css?v=2`, `js/main.js?v=2` in `index.html`) — a URL the browser has never requested can't be served from a stale cache regardless of the caching mechanism involved, which sidesteps the question of exactly why the hard refresh wasn't sufficient. Documented in `frontend/AGENTS.md`: bump `?v=2` → `?v=3` etc. first whenever a CSS/JS change doesn't appear to take effect, before spending time re-debugging code that's probably already correct.

Re-tested: confirmed both versioned URLs resolve with HTTP 200 through the dev server. **Not verified this session**: whether this actually resolves what the user is seeing — no browser tool available, still waiting on the user to confirm after this fix.

**Revision 10 (Revision 9's fix also didn't work — caching diagnosis was wrong; fixed properly this time):** User reported the exact same boxes still visible even after the `?v=2` cache-busting fix — and now specified it was happening for the role-logo "Logo" placeholders too, not just the hero photo. This retroactively disproved the caching diagnosis from Revisions 8–9: a cache-busted URL the browser has never requested cannot be served from a stale cache under any circumstance, so if the bug survived that, it was never actually a caching problem. Stopped trying to find *why* the `[hidden]`/`!important` CSS approach wasn't working (every static check kept coming back "this should work") and instead **abandoned that whole approach**: `renderHero()` now calls `.remove()` on the unneeded element (placeholder or image) instead of toggling `.hidden`, and `buildLogo()` was rewritten to construct only the element it actually needs — real `<img>` or placeholder `<div>`, never both, never hidden. An element that was never added to the DOM (or was removed from it) cannot be made to render by any CSS rule, which sidesteps the entire bug class regardless of what the real root cause of the CSS approach's failure actually was — never identified with certainty, documented as such in `frontend/AGENTS.md` along with the pattern to use instead for any future placeholder toggle. Bumped cache-busting to `?v=3` on top of this, since the underlying JS changed again.

Re-tested: diffed the served `main.js` (`?v=3`) against source — byte-identical; confirmed `index.html` serves `v=3` on both tags. **Not verified this session**: whether the boxes are actually gone now — no browser tool available. This is the third attempt at this specific bug; if it's not resolved this time, the underlying assumption (that this is fixable through code alone without seeing it render) needs to be revisited rather than trying a fourth variant blind.

**Revision 11 (Revision 10 also reportedly didn't work — user took over):** The `.remove()`-based fix — which should be categorically bulletproof, an element removed from the DOM cannot be rendered by any CSS rule under any circumstances — was still reported as not fixed. Never resolved why. User asked for every file/line responsible for the "Photo coming soon" text (answered: `frontend/index.html` line ~31 for the markup, `frontend/js/main.js`'s `renderHero()` for the removal logic — confirmed via a project-wide case-insensitive grep, nothing else in the codebase references it), then asked me to comment out the HTML block and delete the corresponding JS directly, rather than trust another automated fix. Done exactly as asked: the placeholder markup in `index.html` is now wrapped in `<!-- -->` (parsed by the browser as an inert comment before any JS/CSS involvement — the most bypass-proof option available, since it doesn't depend on `.remove()`, `hidden`, or cascade behavior working correctly), and both lines in `renderHero()` referencing `#hero-photo-placeholder` were deleted (leaving them would have thrown a null-reference error once the element no longer exists). Cache-busting bumped to `?v=4`. The equivalent `.logo-placeholder`/"Logo" case was intentionally **not** touched this pass — flagged for the user, needs the same treatment or a decision if it's still showing.

Re-tested: confirmed via curl that the served HTML contains the commented-out block (present only inside `<!--...-->`, i.e. inert) and that `main.js` (`?v=4`) has zero remaining references to `hero-photo-placeholder`. **Not verified this session**: in-browser confirmation — no browser tool available. Given the pattern in this saga, recommend the user verify directly rather than take another "should be fixed" at face value.

**Resolution:** Had the user check View Source directly — their regular browser's view-source showed the *old, pre-comment* markup while `curl` hitting the identical URL from this machine, at the same moment, correctly showed the commented-out version. That's conclusive proof the server was correct throughout Revisions 10–11; the bug was never in the project code at all. It was a local browser-caching issue on the user's machine, severe enough to survive hard refresh, cache-busted URLs, and a manual cache-clear + browser restart — cause never identified, but confirmed to not reproduce in an incognito/private window, which the user is now using to review the site. Closing this out: nothing further to fix in the codebase for this issue. Noted in `frontend/AGENTS.md` for future reference — if a "should have worked" fix keeps getting reported as broken across multiple genuinely-correct attempts, test an incognito window early rather than continuing to assume the code is at fault.

**Revision 12 (gallery size follow-up):** User found the project-gallery images (sized to match the tallest role's text block, per an earlier request) too big, and asked for 0.75× that size plus proportionally-fitted prev/next arrows. Scaled as one unit: `syncGalleryHeights()` in `main.js` now multiplies the matched height by 0.75 before applying it; the desktop `.role-gallery`/`.role-content` flex-basis and min-width, and the arrow buttons' diameter/font-size/inset, were all scaled by the same 0.75× rather than just shrinking the image area and leaving the controls oversized relative to it. Cache-busting bumped independently per file (`styles.css?v=4`, `main.js?v=5`, since only `main.js` changed since the last CSS edit).

Re-tested: diffed served `main.js`/`styles.css` (with their versioned query strings) against source — byte-identical; confirmed the `maxHeight *= 0.75` line and the new arrow CSS values are present in what's actually served. **Not verified this session**: in-browser visual confirmation — no browser tool available.

**Revision 13 (arrow position follow-up):** User reported the prev/next arrows sitting where the image used to be before the 0.75× resize — a real layout bug, not another false alarm. Cause: the arrows were positioned (`top: 50%`, absolute) relative to `.role-gallery`, the outer wrapper that also contains the dots row below the image, not relative to the image box itself. That's harmless when the image dominates the wrapper's total height, but once the image shrank relative to the (unchanged) dots row, `top: 50%` no longer landed on the image's actual center. Fixed by appending the arrow buttons to `.gallery-viewport` (the image box, now `position: relative`) instead of to `.role-gallery`, so they're vertically centered against just the image regardless of what else shares the wrapper. `.gallery-dots` stays where it was, below the image. Cache-busting bumped to `styles.css?v=5`, `main.js?v=6`.

Re-tested: diffed served files (versioned URLs) against source — byte-identical; confirmed `viewport.append(prevBtn, nextBtn)` and `.gallery-viewport { position: relative; ... }` are both present in what's served. **Not verified this session**: in-browser visual confirmation — no browser tool available.

**Revision 14 (dots position/size follow-up):** User reported the dots indicator row also still sized/positioned for the pre-0.75× image. Real inconsistency, not a phantom bug: the first resize pass (Revision 12) scaled the gallery box, JS-computed height, and arrows by 0.75×, but left `.gallery-dots`/`.gallery-dot` (gap, margin-top, dot diameter) at their original values — so relative to the now-smaller image, the dots' spacing/size looked disproportionate. Checked whether horizontal centering itself was actually broken (analogous to the arrow bug) and found it wasn't — `.gallery-dots` is a full-width flex container matching `.gallery-viewport`'s width, `justify-content: center` correctly centers within that. Fixed by scaling the dots' own sizing by the same 0.75×: `8px`→`6px` dots, `0.5rem`→`0.375rem` gap, `0.75rem`→`0.5625rem` margin-top. Cache-busting bumped to `styles.css?v=6`.

Re-tested: diffed served `styles.css` (`?v=6`) against source — byte-identical; confirmed the new dot values are present. **Not verified this session**: in-browser visual confirmation — no browser tool available.

---

### Part 8 — Responsive, accessibility, and cross-browser polish

**Substeps**
- [ ] Full breakpoint sweep: mobile, tablet, desktop.
- [ ] Keyboard navigation: confirm all interactive elements are reachable via Tab and have a visible focus state.
- [ ] Color contrast audit (WCAG AA) across the whole page using the final rendered palette.
- [ ] Alt text coverage audit across every image on the page.
- [ ] Animation restraint check: any motion respects `prefers-reduced-motion`.
- [ ] Spot-check in at least two browser engines if available (e.g. Chromium-based + one other).

**Tests / checks**
- Documented pass/fail for each checklist item above, with fixes applied for any failure and re-tested.

**Success criteria**
- All checks pass with no known accessibility or responsive-layout failures.

---

### Part 9 — Review and refinement loop

**Substeps**
- [ ] Present the finished local site to the user.
- [ ] Collect feedback and iterate, as many rounds as needed.

**Tests / checks**
- Each round of feedback tracked and addressed; no requested change silently dropped.

**Success criteria**
- User explicitly says the site is done. This part cannot be marked complete on the agent's own judgment.

**Post-launch revision — Projects section redesign (site already live at this point):** user supplied a design handoff file from an external tool ("claude-design", a `.dc.html` + README zip) proposing a restructured "Projects" section — individual expandable project cards grouped by role, replacing the old one-gallery-per-company layout. Instruction: adopt the new structure, but keep all existing editorial copy (bio, tagline, freelance line, skills, contact) as-is rather than the mockup's own placeholder text — except that project write-ups needed genuinely new content, since the mockup's project blurbs/descriptions were explicitly labeled fake ("Placeholder — replace with your own write-up").
- Drafted a 9-project breakdown by splitting the existing, already-verified `roles[].description` bullets (from the original Part 3 CV extraction) into individually named projects — no invented facts, metrics, or outcomes; every sentence traces back to a bullet already confirmed accurate. **Presented this breakdown to the user for explicit sign-off before writing it into `cv.json`** — same process discipline as the original Part 3 extraction, since this was new content synthesis, not just a visual change. Approved as drafted.
- `content/cv.json`: `roles[].description` (flat bullets) + `roles[].gallery` (flat images) replaced by `roles[].projects[]`, each `{title, blurb, description, bullets, image, gallery}`. All 18 existing project images reallocated from role-level to individual projects based on each image's actual content (each was individually viewed/described earlier in the project, not guessed from filename) — documented mapping in `frontend/AGENTS.md`. Projects with no matching real images (5 of 9) got placeholder image slots, same "always show something, real or placeholder" pattern used everywhere else on the site.
- Rebuilt `frontend/index.html` (`#projects`, `#role-groups`), `frontend/js/main.js` (new `renderProjects()`/`buildProjectCard()`/`buildProjectImage()`/`closeAllProjectPanels()`, deleted the old carousel-specific `buildGallery()`/`syncGalleryHeights()`/`initGallerySizing()` entirely rather than leaving dead code), and `frontend/css/styles.css` (new `.project-card`/`.project-expanded` accordion rules, deleted the old `.role-card`/`.gallery-*` rules). Single-open-at-a-time accordion (click a project to expand it, closing whichever was open) — a CSS class toggle (`.is-open`), deliberately not the `hidden` attribute, per the lesson from the earlier placeholder-visibility saga. Kept the per-role company logo in the new design even though the mockup's own role header doesn't include one, since it was a distinct, deliberate earlier user request — noted as an intentional deviation, not an oversight, in `frontend/AGENTS.md`.
- Bumped cache-busting to `styles.css?v=8`, `main.js?v=9`.

Re-tested: validated every field the new JS references exists with the right shape across all 4 roles/9 projects; confirmed no leftover references anywhere in the codebase to any of the deleted classes/functions/HTML ids (`role-list`, `role-card`, `gallery-*`, `renderExperience`, `buildGallery`, etc.); HTTP-level check confirms `#projects`/`#role-groups` render and all assets (including the new versioned CSS/JS) return 200. **Not verified this session**: in-browser visual/interaction confirmation (does the accordion actually expand/collapse correctly, does it look right) — no browser tool available, code review and static field-validation only.

---

### Part 10 — Deployment

**Note:** the user explicitly asked to deploy now (own an already-registered domain, `anafacohen.com`, in Cloudflare, and an existing Netlify account) — this satisfies Part 10's own "explicit go-ahead" gate. Parts 8 (responsive/accessibility/cross-browser polish) and 9 (review/refinement loop, "not done until user explicitly says so") were **not** formally closed out before this — noting that here for accuracy, not blocking on it; going live and continuing to polish afterward is the user's call to make, not something to gate behind an agent-enforced checklist.

**Substeps**
- [x] Choose hosting (and domain) with the user: Netlify (free tier — GitHub-based continuous deployment, custom domains, free SSL, no payment needed for a site this size) + the user's existing `anafacohen.com` domain, DNS staying in Cloudflare (user's choice over migrating nameservers to Netlify).
- [x] User asked to make the GitHub repo public (was private). Same privacy concern as before: `contact.phone` had been committed to the repo (twice) even though never rendered on the page. Since editing the file wouldn't remove it from git history, and the user confirmed "remove it from history and make public": deleted `contact.phone` from `content/cv.json` entirely (not just re-hidden — the field doesn't exist anymore), then rewrote the whole repo history into a single fresh commit via an orphan branch (`git checkout --orphan`) and force-pushed it, replacing the old 2-commit history that contained the phone number. Verified via `git log` and the GitHub API that only the new clean commit exists remotely. Then `gh repo edit --visibility public`. Confirmed public via `gh repo view`.
- [x] Made the codebase actually deployable: the site previously depended on the local dev server serving the *project root* (not just `frontend/`) so `main.js` could reach `content/cv.json`, which lives outside `frontend/`. Netlify only publishes one directory, so as committed, the deployed site would have 404'd fetching its own content. Fixed by changing `main.js`'s fetch to a `frontend/`-relative path (`content/cv.json`, no `../`) and having both `scripts/start.*` (local dev) and `netlify.toml` (Netlify's build command) copy `content/cv.json` into `frontend/content/cv.json` before serving/publishing — `content/cv.json` at the project root stays the single source of truth, the copy is a disposable, gitignored build artifact. Local dev now serves `frontend/` directly (`http://localhost:8000/`, no more `/frontend/` prefix) instead of the project root, matching what Netlify does. Re-tested end-to-end locally: index, content/cv.json, css, js, and images all confirmed 200 from the new root.
- [ ] Netlify site creation and GitHub authorization — inherently manual, requires the user's own login/OAuth consent, cannot be done by the agent. Guided the user through it rather than executed directly.
- [ ] Add custom domain in Netlify + DNS records in Cloudflare (CNAME `@`/`www` → the Netlify site's `*.netlify.app` hostname, DNS-only/grey-clouded, not proxied — keeps Netlify's own free SSL working normally). Waiting on the Netlify site to exist first (need its assigned hostname).
- [ ] Verify the live site matches the local version once DNS/SSL are live.

**Tests / checks**
- [x] Local re-verification after the `frontend/`-as-root restructure: all asset paths and `content/cv.json` confirmed reachable at the new root-relative paths.
- [ ] Live URL loads correctly, matches local build, no broken links/images — pending Netlify site creation.

**Success criteria**
- Not yet met — in progress. Site is live at `anafacohen.com` and the user confirms it matches expectations.
