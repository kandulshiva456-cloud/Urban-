# Urban Man Ayurveda & Wellness Center — Static Website

A production-ready, dependency-free website (HTML5 / CSS3 / vanilla JavaScript) for
Urban Man Ayurveda & Wellness Center, Pune. No build step, no framework, no backend —
every page works when opened directly from disk and deploys as-is to GitHub Pages.

## Pages

| Page | File | Notes |
| --- | --- | --- |
| Home | `index.html` | Hero video, trust strip, featured services, gallery, course promo |
| Services | `services.html` | All nine treatments with category filters, duration chips, prices |
| Service detail | `services/<slug>.html` | 9 pages, generated from the approved reference copy |
| Book | `book.html` | 7-step appointment wizard (`noindex`) |
| About | `about.html` | Story, stats, gallery, modes of care |
| Massage course | `massage-course.html` | Syllabus, course facts, enquiry form |
| Careers | `careers.html` | Application form with skills, resume upload (client-side validation only) |
| Contact | `contact.html` | Contact cards, map link, message form, FAQ |
| Privacy / Terms | `privacy.html`, `terms.html` | Legal copy |
| Not found | `404.html` | `noindex` |

## Running locally

Open `index.html` in any modern browser — no server required. Everything uses relative
paths, so `file://` works for development. For the most realistic check (video autoplay,
form behaviour), serve the folder locally if you prefer, e.g.:

```
python -m http.server --directory .
```

## Deploying to GitHub Pages

1. Push the contents of this folder to a repository (the folder itself is the site root).
2. Repository → Settings → Pages → Deploy from a branch → `main` / ` (root)`.
3. No build, install or "generate" step exists — do not add one.

All links are relative, so the site works at the domain root **and** under a project
sub-path (e.g. `https://<user>.github.io/<repo>/`) without edits.

## Configuration — `js/config.js`

Single source of truth for everything a client might change:

- `BUSINESS_CONFIG` — phones, WhatsApp number, email, address, hours, `siteUrl`,
  `googleMapsUrl`, social URLs (only what is actually confirmed).
- `SERVICES_CONFIG` — the nine services: slugs, categories, durations, prices,
  descriptions, featured flags.
- `CAREERS_CONFIG` — job positions (`publishingOpenPositions: false` hides the live
  openings list; each position also needs `confirmed: true` to appear).
- `FORMS_CONFIG` / form endpoints — all `endpoint: null` until a backend exists (see below).
- `UM.TESTIMONIALS` — intentionally empty; quotes are only rendered when supplied.

### Price duplication (read this before editing prices)

Prices appear in **two places that must stay in sync**:

1. **The HTML markup** — service cards on `index.html` / `services.html`, the detail
   pages under `services/`, and the JSON-LD `Offer` blocks in `index.html`. This is the
   visible, crawlable price list.
2. **`js/config.js` (`SERVICES_CONFIG`)** — drives the booking wizard, duration
   pickers, and the price shown after choosing a duration.

Changing a price means editing both. A mismatch will not throw an error — the card and
the booking summary will simply disagree.

## Forms and integrations (TODO — client/backend needed)

No form posts anywhere yet, deliberately: there is no backend and the site never fakes a
successful submission. Each form validates fully in the browser, then shows an honest
fallback telling the visitor to call/WhatsApp, until an endpoint is configured:

- Contact form → `UM.BUSINESS_CONFIG.forms.endpoint`
- Course enquiry → same `forms.endpoint`
- Careers application → `forms.resumeEndpoint` (also accepts resume file name only)

Set a real endpoint in `js/config.js`; the submit flow will then POST to it.

## TODO — before going live

1. **Site URL** — `BUSINESS_CONFIG.siteUrl` is empty. Replace `https://your-domain.example/`
   in `sitemap.xml` with the final URL, and add the matching `Sitemap:` line to `robots.txt`.
2. **Maps** — `BUSINESS_CONFIG.googleMapsUrl` is empty (never invented a maps link).
3. **Form endpoints** — see above.
4. **Careers** — `publishingOpenPositions` / per-position `confirmed` flags need client
   confirmation before any role is presented as a live vacancy.
5. **Course facts** — fee, duration, dates etc. are shown as "To be confirmed with Urban Man"
   because they were not confirmed; replace when the client supplies them.

## Project structure

```
urban/
├── index.html, services.html, book.html, about.html, massage-course.html,
│   careers.html, contact.html, privacy.html, terms.html, 404.html
├── services/            9 generated service detail pages
├── css/                 fonts.css, style.css, animations.css, responsive.css
├── js/                  config.js, main.js, services.js, booking.js, forms.js, careers.js
├── assets/              images, fonts (woff2), icons, hero video
├── robots.txt
├── sitemap.xml          (placeholder host — see TODO)
└── README.md
```

## Conventions

- **Icons** are injected by JS into `<span data-icon="name">`; all icon names live in the
  `ICONS` map in `js/main.js`.
- **Active navigation** (`aria-current`) is set by JS on load — never hard-code it.
- **Booking state** persists in `sessionStorage` under `um.booking.v1`.
- Service pages carry `data-service-page="<slug>"` on `<main>`; `js/services.js` reads it
  to fill duration lines, prices, the WhatsApp message and the booking deep link.
- Copy is kept verbatim from the approved reference — including honest placeholders such
  as "To be confirmed with Urban Man" and "Duration not currently confirmed."

## QA notes

- All 19 HTML files pass a case-sensitive link/asset audit (no root-relative paths, no
  absolute local paths, every `href`/`src` resolves with exact casing).
- All pages were verified headless in Edge with zero console errors, and key JS-driven
  content (booking wizard, duration sync, careers form, filters) was checked in the
  post-script DOM.
