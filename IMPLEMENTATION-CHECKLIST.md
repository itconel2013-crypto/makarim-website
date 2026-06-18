# Implementation Checklist

## Phase 1: Projektgerüst + Design-Tokens ✓
- [x] package.json (Next.js, TypeScript, Tailwind, SQLite)
- [x] tsconfig.json (TypeScript Config)
- [x] next.config.js (Next.js Config)
- [x] tailwind.config.ts (Design Tokens → Tailwind)
- [x] postcss.config.mjs (PostCSS Config)
- [x] styles/globals.css (Base Styles + Tailwind Directives)
- [x] lib/content-schema.ts (TypeScript Types)
- [x] lib/seed-data.ts (Default Content)
- [x] lib/db.ts (SQLite Client)
- [x] lib/utils.ts (Helper Functions)
- [x] app/layout.tsx (Root Layout)
- [x] app/page.tsx (Home Placeholder)
- [x] app/api/content/route.ts (GET/POST Content API)
- [x] .env.local (Environment Variables)
- [x] .gitignore (Git Ignore)
- [x] PROJECT-SETUP.md (Documentation)

## Phase 2: Public Website
### Sub-Phase 2a: Layout & Components ✓
- [x] components/layout/Header.tsx (Sticky Navigation, Logo)
- [x] components/layout/Footer.tsx (Brand Data)
- [x] components/layout/WhatsAppButton.tsx (60×60 Fixed Button)
- [x] Update app/layout.tsx (Header + Footer)

### Sub-Phase 2b: Home Page ✓
- [x] components/website/HeroSection.tsx (Image, Gradient, CTA)
- [x] components/website/TrustCards.tsx (4-Col Grid)
- [x] components/website/CategoryGrid.tsx (3-Col Categories)
- [x] components/website/TripCardGrid.tsx (Featured Trips)
- [x] components/website/CTABand.tsx (Dark CTA)
- [x] Complete app/page.tsx (Full Home)
- [x] app/page.tsx (Metadata + SEO)

### Sub-Phase 2c: Category Page ✓
- [x] app/[category]/page.tsx (Trip List per Category)
- [x] components/website/TripCard.tsx (Trip Card mit Status-Pill, Banner, Preis)
- [x] Filtering by `typ` and `published !== false`
- [x] Empty State Handling

### Sub-Phase 2d: Trip Detail Page ✓
- [x] app/[category]/[slug]/page.tsx (Trip Detail Screen)
- [x] Hero Section (Image + Overlay, Kicker #F0CDA8, H1 44px)
- [x] Hotels Grid (Rating Badge terracotta + Distanz-Pill Mekka/Medina)
- [x] Services Grid (Checkmarks, bg #EAF0E8, color #3E6B52)
- [x] Program Timeline (vertikale Linie, Tages-Badge terrakotta)
- [x] Sticky Sidebar (Preis, Datum, Verfügbarkeit, CTA "Jetzt anfragen", Mobile-Fallback)
- [x] SEO: Per-Trip Metadata (seoTitle/seoDesc mit Fallback auf Auto)

### Sub-Phase 2e: Booking & Confirmation ✓
- [x] components/website/BookingForm.tsx (Travelers Repeater, Zimmer-Kategorie, Kontaktformular)
- [x] app/[category]/[slug]/booking/page.tsx
- [x] app/[category]/[slug]/confirm/page.tsx (Success-Check, Bankdaten, VG als Verwendungszweck)

### Sub-Phase 2f: About Page ✓
- [x] app/ueber-uns/page.tsx (About Page)
- [x] Zwei-Spalten Intro (Text + Bild-Collage), Warum-Sektion, Tiles 2-Spalten

### Sub-Phase 2g: SEO & Fine-Tuning ✓
- [x] Metadata per Route (generateMetadata auf allen Seiten)
- [x] Structured Data JSON-LD: TravelAgency (Home), TouristTrip + Offer (Detail)
- [x] Alt Texts on Images (alle img-Tags mit beschreibenden alt-Attributen)
- [x] Mobile Responsiveness: clamp() auf H1 Hero (36–62px), Kategorie (28–46px), Detail (26–44px), Über uns (28–40px)

## Phase 3: CMS (/admin)
### Sub-Phase 3a: CMS Layout & Navigation
- [ ] app/admin/layout.tsx (Sidebar + Main)
- [ ] components/cms/CMSSidebar.tsx (Navigation)
- [ ] components/cms/PublishBar.tsx (Status + Publish Button)

### Sub-Phase 3b: CMS Dashboard
- [ ] app/admin/page.tsx (Übersicht — Stats + Quick Links)

### Sub-Phase 3c: CMS Editors (Startseite, Kategorien, FAQ, Über uns, Kontakt)
- [ ] components/cms/FormEditor.tsx (Generic Form Component)
- [ ] app/admin/startseite/page.tsx
- [ ] app/admin/kategorien/page.tsx
- [ ] app/admin/faq/page.tsx
- [ ] app/admin/ueber-uns/page.tsx
- [ ] app/admin/kontakt-footer/page.tsx

### Sub-Phase 3d: Trips Manager (KEY SCREEN)
- [ ] app/admin/reisen/page.tsx (Trip Manager)
- [ ] components/cms/TripCardCMS.tsx (Collapsible Card)
- [ ] Sections: Inhalt / Hotels / SEO (collapsible)
- [ ] Publish Toggle, Startseite Toggle, Reorder
- [ ] Status Pills (Draft/Published)

### Sub-Phase 3e: Image & Media Management
- [ ] components/cms/ImagePicker.tsx (Modal + Library)
- [ ] components/cms/MediaLibrary.tsx (Grid + Upload)
- [ ] app/admin/mediathek/page.tsx

### Sub-Phase 3f: SEO Manager
- [ ] components/cms/SERPPreview.tsx (Google Result Mockup)
- [ ] app/admin/seo/page.tsx (Per-Page SEO Overrides)

### Sub-Phase 3g: Live Preview
- [ ] components/cms/LivePreview.tsx (Right Panel Preview)
- [ ] Integration mit Editor Pages

## Phase 4: Integration & Polish
- [ ] API Polling / WebSocket for Live Sync
- [ ] Image Upload Endpoint (/api/media)
- [ ] Form Validation
- [ ] Error Handling & Toast Notifications
- [ ] Mobile Responsiveness Check
- [ ] Performance Optimization
- [ ] Cross-Tab Sync (localStorage events)
- [ ] Build & Production Check

---

**Current Status**: Phase 1 Complete ✓
**Next**: Phase 2a (Layout Components)
