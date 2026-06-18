# Handoff: Makarim Reisen – Website & Content-Management (CMS)

## Overview
A pilgrimage travel agency website (Hajj, Umrah, islamkonforme Kulturreisen) for the German market, plus an in-house CMS to manage its content. The public site lets visitors browse trips by category, view trip detail pages (hotels, included services, day-by-day program), and submit a non-binding booking request. The CMS lets staff edit marketing content, manage per-trip images/texts/SEO, and control which trips are published.

There are **two applications** in this handoff:
1. **Public website** — `Makarim Website.dc.html`
2. **CMS / admin** — `Website CMS.dc.html`

They are decoupled by design (see *Architecture* below).

## About the Design Files
The files in this bundle are **design references created in HTML** — interactive prototypes showing the intended look, content, and behavior. They are **not production code to copy directly**.

The task is to **recreate these designs in the target codebase's environment** (e.g. React/Next.js, Vue/Nuxt, etc.) using its established patterns, component library, and conventions. If no codebase exists yet, choose an appropriate stack. For SEO reasons this site should be built with **server-side rendering / static generation** (see *SEO* — the prototype is client-rendered, which is fine for a mockup but not for production SEO).

> Technical note on the prototype: the files are authored as "Design Components" (`.dc.html`) and rely on `support.js` (a small runtime) to render. Open `Makarim Website.dc.html` or `Website CMS.dc.html` directly in a browser to see them run. Treat the markup and logic as a **spec**, not as files to ship.

## Fidelity
**High-fidelity (hifi).** Final colors, typography, spacing, copy, and interactions are all defined. Recreate the UI pixel-perfectly using the target codebase's libraries and patterns. Exact tokens are listed under *Design Tokens*.

---

## Architecture (important — this drove many decisions)

Three systems, with deliberate separation so the website never breaks if the CRM changes (a problem with the client's previous site):

```
CRM (separate system, in development)
  │  Owns operational trip data: dates, prices, available seats,
  │  hotel assignment (name, city, nights, rating, distance to Haram),
  │  cancellation & payment terms.
  │
  │  PUSH ("Veröffentlichen/Senden" in the CRM) — CRM is the trigger.
  ▼
CMS (this app)
  │  Owns marketing layer: trip photo, marketing text, banner overlay,
  │  per-trip SEO overrides, hotel photos, category/home/about content,
  │  global SEO, contact/footer data.
  │  Stores its OWN copy of everything → website keeps working if CRM is gone.
  │
  │  Website reads from the CMS only.
  ▼
Website (this app)  — public site
```

**Data flow rules**
- **Push, not pull**: the CRM pushes trip data into the CMS when staff publish in the CRM. The CMS does not actively fetch. (A single, low-key "Mit CRM synchronisieren" reserve button is acceptable for error recovery, but is not the normal path.)
- **CMS owns its own copy** of the content. The website never reads the CRM directly. If the CRM is swapped or offline, the website is unaffected.
- **Photos are CMS-only**, never from the CRM.

**Hotel data contract from CRM → CMS** (per trip, array `hotels`):
```js
hotels: [
  { city: "Medina", name: "Pullman Zamzam Madina", nights: "5 Nächte",
    rating: "9,3", dist: "ca. 150 m zum Haram" },
  { city: "Mekka",  name: "Fairmont Makkah Clock Tower", nights: "5 Nächte",
    rating: "9,4", dist: "ca. 100 m zum Haram" }
]
```
- `rating` = Booking-style score on a **0–10** scale, comma decimal (e.g. `"8,6"`). **No star ratings shown to pilgrims.**
- `nights`, `dist` are pre-formatted display strings.
- `photo` is **not** part of the contract — added in the CMS.
- The CMS displays `city`, `name`, `nights`, `rating`, `dist` **read-only**; only the hotel photo is editable.

---

## Prototype data model (the `content` object)

Both apps share one content shape (the CMS persists it; the website reads it). Key fields:

```
content = {
  home:       { kicker, headline, sub, btnP, btnS, heroUrl, trust: [{value,label}] },
  categories: [{ title, text, url }],            // Umrah / Hajj / Kulturreisen
  trips:      [{
                 vg,                 // CRM Vorgangsnummer (id), e.g. "2026-0912"
                 title, typ, date, price, status, text, url,
                 startseite,         // bool — featured on home page
                 published,          // bool — Model B; website shows only published
                 seats, waitlist,    // availability (drives status pill)
                 banner: {...},      // optional image overlay (on/off, 2 lines, color)
                 seoTitle, seoDesc,  // optional per-trip SEO overrides (empty = auto)
                 hotels: [{ city, name, nights, rating, dist, photo }]
              }],
  faq:        [{ q, a }],
  about:      { title, body, url, url2, whyTitle, whyBody, tiles: [{t,b}] },
  cta:        { headline, sub, btnCall, btnWrite },
  brand:      { phone, whatsapp, email, instagram, address1, address2,
                bank: { inhaber, iban, bic, name } },
  seo:        { siteName, defaultDesc,
                home:{title,desc}, umrah:{...}, hajj:{...}, kultur:{...}, about:{...} }
}
```

In the prototype this is persisted in `localStorage` under key `makarim_cms_v1` (`{ c: content, media: [...] }`). **In production replace with a real database + API.** `media` is the CMS image library; in the prototype uploads are stored as base64 (this is why a full draft/publish snapshot was avoided — see *Publish workflow*).

---

## Screens / Views

### A) PUBLIC WEBSITE (`Makarim Website.dc.html`)
Single-page app with views switched in state: `home`, `category`, `detail`, `booking`, `confirm`, `about`. Max content width **1200px**, centered, 40px side padding. Global font: Schibsted Grotesk; headings: Newsreader (serif); mono labels: JetBrains Mono.

**Fixed elements**
- **Header** (sticky top): logo left (`assets/makarim_soultreat.png`, height 48px), right nav links *Umrah · Hajj · Kulturreisen · Über uns* (16.5px, color #3F4A44, hover #A8542F).
- **WhatsApp floating button**: bottom-right, fixed, 60×60px circle, background `#25D366`, white WhatsApp glyph (inline SVG), links to `https://wa.me/<number>`. Shadow `0 8px 24px rgba(37,211,102,0.45)`.

**1. Home (`home`)**
- **Hero**: full-bleed image (`home.heroUrl`) with dark gradient overlay `linear-gradient(180deg,rgba(20,14,8,0.32),rgba(20,14,8,0.62))`, centered text, max 760px. Kicker (mono, 13px, letter-spacing .2em, #F0CDA8). H1 Newsreader 62px/1.05, white. Sub 18px rgba(255,255,255,.92). Two buttons: primary "Reisen entdecken" (terracotta `#C2724A`, 54px tall, radius 13px) → smooth-scrolls to the categories section (`#kategorien`); secondary "Mehr erfahren" (translucent white border) → opens About view.
- **Trust row** ("Warum wir"): H2 Newsreader 42px "Vier gute Gründe, mit uns zu reisen", then a 4-column grid of cards (white, border `#EAE3D8`, radius 18px, padding 28×24, shadow `0 6px 22px rgba(40,30,20,0.05)`), each with a circular index badge (42px, bg `#F0E4DC`, text `#A8542F`), H3 Newsreader 20px, body 14px `#6B6457`.
- **Categories (`#kategorien`)**: kicker + H2 "Finde deine perfekte Reise" + sub. 3-column grid of category cards: image (aspect 4/3), H3 Newsreader 24px, text, full-width button "Jetzt entdecken" (`#C2724A`, 48px) → opens that category.
- **Featured trips**: header row H2 "Unsere Umrah Reisen" + "Alle Reisen ansehen →" link. 3-column grid of trip cards (only `published !== false` AND `startseite === true`, max 3).
- **CTA band**: dark `#16242B` rounded 24px block, H2 40px `#F4F1EA`, sub `#9DB0AD`, two buttons.
- **Footer** (see brand data).

**2. Category (`category`)**: back link, kicker "Alle Termine", H1 Newsreader 46px (category name), lead paragraph. Grid (3-col) of all published trips whose `typ` matches the category. Empty state: "Bald verfügbar" card. Trip card anatomy: image 188px tall (optional banner overlay bottom-left), status pill (top of body), H3 Newsreader 21px title, date row (tabular-nums, 13.5px, weight 600), 14px text, price.

**3. Trip detail (`detail`)** — order is intentional:
- **Hero**: full-bleed trip image, dark gradient, bottom-left kicker `{typ} · {duration}` + H1 Newsreader 44px white title.
- **Intro paragraph** (16.5px `#5A5448`).
- **Enthaltene Leistungen** (included services): H2 Newsreader 28px; 2-col grid of items, each a green check circle (24px, bg `#EAF0E8`, color `#3E6B52`) + 14.5px label.
- **Deine Hotels**: H2; 2-col grid of hotel cards. Each card: optional photo (158px tall) on top; body padded 20×22: top row = city (mono 11px uppercase `#A8542F`) + **rating badge** (right): terracotta pill `#C2724A`, white, "★ 8,6" + grey "/ 10". H3-ish hotel name Newsreader 19px. Then `nights` line, and a **distance pill** (small, 12px, weight 500): for **Mekka** a 🕋 Kaaba glyph in a sand pill (`bg #F2E8DF`, color `#A8542F`); for **Medina** a small green dome shape (CSS half-ellipse `#3E7256`) in a green pill (`bg #EAF1EC`, color `#3E7256`). Distance text e.g. "ca. 150 m zum Haram".
- **Dein Programm**: H2; vertical timeline of day items.
- **Sticky sidebar** (right, 372px): price box, availability, CTA "Jetzt anfragen" → booking.

**4. Booking (`booking`)**: H1 38px trip title + date/duration. "Preise pro Person" table (dark header `#16242B`, columns for room categories). "Reisende" repeater (Anrede, Vor-/Nachname, Geburtstag, room category per traveler; add/remove). "Kontaktperson" form (2-col). Notes textarea. Submit → confirm.

**5. Confirm (`confirm`)**: success check circle (74px, bg `#EAF0E8`), H1 38px "Deine Buchungsanfrage ist eingegangen", personalized text. "So schließt du deine Buchung ab" card with bank details (from `brand.bank`) — pay by bank transfer using the Vorgangsnummer as reference.

**6. About (`about`)**: back link; two-column intro (text left: kicker, H1 40px, body; right: overlapping image collage from `about.url` + `about.url2`). Then "Warum Makarim?" section (`about.whyTitle` H2 30px + `about.whyBody`) and a 2-col grid of tiles (`about.tiles`, bg `#F7ECE4`, radius 18px, H3 Newsreader 22px + body).

### B) CMS (`Website CMS.dc.html`)
Two-column shell: dark sidebar (`#16242B`-ish) with nav, and a main column with a header bar + scrollable editor, plus a **540px live-preview** column on the right for most sections.

- **Sidebar nav** (INHALTE): Übersicht, Startseite, Kategorien, Reisen, FAQ, Über uns, **SEO**, Mediathek, Kontakt & Footer. Bottom: "Website ansehen →", user chip.
- **Header bar**: section title + subtitle; right side: **publish status** (green dot "Alles veröffentlicht" / amber dot "N im Entwurf"), on Reisen a "↻ Aus CRM aktualisieren" button, and a **Veröffentlichen** button (terracotta when drafts exist, grey "Veröffentlicht ✓" when none).
- **Übersicht**: stat cards (trips/FAQ/media counts) + quick links.
- **Startseite / Kategorien / FAQ / Über uns / Kontakt & Footer**: form editors for the matching content; live preview on the right mirrors the public site.
- **Reisen** (key screen): info banner "Aus dem CRM …". One card per trip. Card header: `VG {vg}` chip, **published badge** (green "● Veröffentlicht" / amber "● Entwurf"), title, and on the right: **publish toggle** ("Veröffentlichen"/"Zurückziehen"), "★ Startseite" toggle chip, CRM status pill, up/down reorder. Below header: availability row (seats number input, "Warteliste bei 0" toggle). Then **three collapsible sections** (collapsed by default, chevron ▸/▾, with a one-line summary on the right):
  - **Inhalt** — trip photo picker (108×80 thumb + "Bild ändern"), Marketing-Text textarea, and "Balken auf dem Bild" (banner overlay: on/off switch + live preview, 2 text lines, color swatches).
  - **Hotels** ("aus CRM" tag) — read-only list (city, rating badge, name, nights·dist) each with a photo picker only.
  - **SEO** ("optional") — Google SERP preview card + "Eigener Seitentitel" + "Eigene Meta-Beschreibung" with character counters (empty = auto from title + marketing text).
- **SEO** (section): "Allgemein" (Seitenname/title suffix + Standard-Beschreibung) and per-page cards (Startseite, Umrah, Hajj, Kulturreisen, Über uns), each with a **Google result preview**, title field (ideal 50–60 chars) and meta-description field (ideal 140–158 chars).
- **Mediathek**: image library grid; uploads.
- **Image picker modal**: choose from library or upload; used by every "Wählen/Bild ändern" button.

---

## Interactions & Behavior
- **Navigation**: client-side view switching; every view change scrolls to top. Category/detail/about have "← Zurück" affordances. "Reisen entdecken" scrolls to `#kategorien` (offset −70px). "Mehr erfahren" + nav "Über uns" → About view.
- **Trip visibility (Model B – draft/publish)**: the website shows a trip **only if `published !== false`**. Newly pushed-from-CRM trips arrive as **draft** (`published: false`) and stay off the site until staff publish them (per-trip toggle, or the global "Veröffentlichen" button which publishes all drafts at once). Existing trips with no `published` field are treated as published (so nothing disappears on migration).
- **Availability → status pill**: derived from `seats`/`waitlist` — e.g. `0` with waitlist off ⇒ "ausgebucht"; `> 18` ⇒ "begrenzte Plätze"; etc. (See `derive()` in the website logic.)
- **CMS auto-save**: edits persist immediately (prototype: to localStorage). The publish state is separate (see below).
- **SEO application (website)**: on mount and on every view change, the app sets `document.title` and `<meta name="description">` for the current view. Detail pages use `seoTitle`/`seoDesc` if set, else auto: title = `{trip.title} | {siteName}`, description = marketing text (clipped to ~158 chars). Category/about/home pull from `content.seo`.
- **Alt text**: every image gets a meaningful `alt` derived from existing data (trip title, hotel name + city, category title, headline).
- **CMS live preview**: right-hand 540px column re-renders the relevant public section as the user edits (hidden for Übersicht, Mediathek, SEO — the SEO tab shows its own SERP previews inline).
- **Cross-tab sync (prototype)**: website listens for `storage` events on `makarim_cms_v1` and reloads content live.

## Publish workflow (Model B) — production guidance
The intended behavior: **content pushed from the CRM is not instantly public; staff publish it.** The prototype implements this with a **per-trip `published` flag** (storage-safe) rather than a full draft/published content snapshot, because the prototype stores uploaded images as base64 in localStorage and a second full copy exceeded the ~5MB quota. **In production with a real DB, prefer a proper draft vs. published model** (separate published snapshot or per-field versioning) so that text edits to an already-published trip can also be staged before going live. Keep the per-trip status and the global "publish all drafts" action.

## State Management
Website view state: `view`, `categoryType`, `tripIdx`, plus `booking` form state (travelers array, contact, notes). Content is loaded once from the store and refreshed on `storage` events.
CMS state: `c` (content), `media`, `section` (active nav), `pickerFor` (image-picker target), `toast`, `expanded` (which trip sub-sections are open). All content edits go through an `upd(fn)` immutable-update helper that persists.

## Design Tokens

**Colors**
| Token | Hex | Use |
|---|---|---|
| Ink / dark | `#16242B` | headings, dark bands, footer, CMS sidebar |
| Primary (terracotta) | `#C2724A` | primary buttons, accents, rating badge |
| Primary dark | `#A8542F` | hover, kickers, mono accent text |
| Teal (CMS action) | `#14617A` / hover `#0F4F63` | CMS image-picker buttons |
| Body text | `#5A5448` / `#6B6457` / `#41494A` | paragraphs |
| Muted label | `#9A9082` / `#B4AB9B` / `#A99F8D` | uppercase labels, hints |
| Page bg | `#F4F1EA` | image placeholders / light bg |
| Soft card bg | `#FBF9F4`, `#F7ECE4`, `#F0E4DC` | cards, chips, tiles |
| Border | `#EAE3D8`, `#E2DBCF`, `#EFE8DC`, `#F2ECE1` | card/input borders, dividers |
| Hero kicker | `#F0CDA8` | kicker text on hero |
| Success/green | `#3E6B52` / `#2E6B48`, bg `#EAF0E8`/`#E3EEE4` | checks, "verfügbar", Medina dome |
| Medina dome/pill | `#3E7256`, pill bg `#EAF1EC` | detail distance pill (Medina) |
| Mekka pill | text `#A8542F`, bg `#F2E8DF` | detail distance pill (Mekka, 🕋) |
| Status amber | `#956214`, bg `#F6ECD9`; dot `#E0A23C` | "Entwurf"/limited, publish-pending |
| WhatsApp green | `#25D366` | floating button |
| Booking blue link (SERP) | `#1a0dab`, url green `#3E6B52` | CMS Google preview only |

**Typography**
- **Newsreader** (serif), weights 400/500/600: all headings (H1–H3) and hotel/section titles. Sizes used: hero H1 62px, section H2 40–42px, detail H1 44px, category H1 46px, section H2 28–30px, card H3 19–24px.
- **Schibsted Grotesk** (sans): body text, nav, buttons, forms. Body 14–18px, line-height ~1.6–1.75.
- **JetBrains Mono**: small uppercase kickers/labels, VG numbers, SERP URL (10–13px, letter-spacing .1–.2em).
- **Quicksand** (600/700): the on-image banner overlay text only.

**Spacing / radius / shadow**
- Content max-width 1200px (about 1100px), side padding 40px; section vertical padding ~80px.
- Radii: cards 18px, large bands 24px, inputs/buttons 9–13px, pills 16–20px, small chips 5–8px.
- Card shadow: `0 6px 22px rgba(40,30,20,0.05)`; hero/image cards `0 14px 34px rgba(40,30,20,0.14)`.
- Buttons: primary height 48–54px; CMS controls 38–42px. Mobile hit targets ≥44px.

## Assets
In `assets/` (placeholder/example imagery — replace with the client's real photos):
- `makarim_soultreat.png`, `makarim_logo.png` — brand logos.
- `examples/hero-a.jpg`, `hero-b.jpg` — hero candidates.
- `examples/cat-umrah.jpg`, `cat-hajj.jpg`, `cat-kultur.jpg` — category images.
- `examples/trip-*.jpg` — per-trip example images.
Icons used are inline Unicode glyphs / inline SVG (WhatsApp, Kaaba 🕋, green dome via CSS) — re-implement with the codebase's icon set where appropriate.

## SEO requirements (production)
The prototype is client-rendered (fine for a mockup). For production, implement: **SSR/SSG**, real per-page **URLs** (e.g. `/umrah`, `/umrah/<slug>`, `/ueber-uns`), per-page `<title>` + `<meta description>` (data already modeled in `content.seo` and per-trip `seoTitle/seoDesc`), image `alt` (already wired from data), and **structured data** (e.g. Trip/Offer schema) for rich results. No star ratings exposed to users — use the 0–10 Booking-style rating.

## Files
- `Makarim Website.dc.html` — public website (all views, logic, content defaults).
- `Website CMS.dc.html` — CMS/admin (editors, live preview, publish workflow, SEO).
- `support.js` — prototype runtime that renders the `.dc.html` files (reference only; do not ship).
- `assets/` — images & logos used by both.

Open either `.dc.html` in a browser to run the prototype. The website reads CMS content from `localStorage` key `makarim_cms_v1`; open the CMS first (or use its defaults) to populate it.
