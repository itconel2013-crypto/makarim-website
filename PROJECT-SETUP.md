# Makarim Website & CMS — Project Setup

**Phase 1 Complete: Projektgerüst + Design Tokens**

---

## ✓ Was wurde eingerichtet

### 1. **Technologie-Stack**
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 3.4 (mit Design Tokens)
- **Database**: SQLite (better-sqlite3)
- **Runtime**: Node.js

### 2. **Design Tokens (Tailwind Config)**
Alle Farben, Fonts, Spacing, Radii, Schatten aus dem README sind in `tailwind.config.ts` definiert:
- **Colors**: Primary (Terracotta #C2724A), Ink (#16242B), Success (#3E6B52), Status, Medina, Mekka, etc.
- **Fonts**: Newsreader (serif, headings), Schibsted Grotesk (sans, body), JetBrains Mono (labels)
- **Spacing**: Gutter (40px), Section (80px)
- **Radii**: Button (9px), Card (18px), Band (24px), Pill (16–20px)
- **Shadows**: Card (`0 6px 22px rgba(40,30,20,0.05)`), WhatsApp button

### 3. **TypeScript Content Schema** (`lib/content-schema.ts`)
Vollständige Typ-Definitionen für:
- `CMSContent` (Home, Categories, Trips, FAQ, About, CTA, Brand, SEO)
- `Trip` mit Hotels, Banner, Publish-Flag, SEO Overrides
- `Hotel` mit Rating, Distance, Photo
- Helper-Funktionen: `deriveStatus()`, `getPublishedTrips()`, `getFeaturedTrips()`, etc.

### 4. **SQLite Datenbank** (`lib/db.ts`)
- Initialisierung mit `cms_content` Tabelle
- `loadContent()` / `saveContent()` Funktionen
- Automatische Seed mit Beispiel-Daten aus `lib/seed-data.ts`

### 5. **API Route** (`app/api/content/route.ts`)
- **GET /api/content**: Alle CMS-Daten laden
- **POST /api/content**: CMS-Daten speichern (Merge)

### 6. **Seed Data** (`lib/seed-data.ts`)
4 Beispiel-Trips (Umrah Luxus/Budget, Hajj, Kulturreisen) mit:
- Hotels mit Ratings & Distanzen
- Marketing Texte
- SEO Defaults
- FAQ, About, CTA, Brand Info

### 7. **App-Struktur**
```
app/
├── layout.tsx           # Root Layout (Header/Footer/Providers kommen später)
├── page.tsx             # Home (Placeholder)
├── [category]/          # Category List (/umrah, /hajj, /kulturreisen)
├── [category]/[slug]/   # Trip Detail
└── api/content/         # CMS Content API
```

### 8. **Styles**
- `styles/globals.css` mit Tailwind Direktiven
- Google Fonts geladen (Newsreader, Schibsted Grotesk, JetBrains Mono)
- Base-Layer Styles für h1–h3, Links, Buttons

---

## 📋 Nächste Schritte (Phase 2: Public Website)

Nach Feedback werden diese Screens gebaut:

1. **Header** (sticky): Logo, Nav, WhatsApp Button
2. **Home** (`/`): Hero, Trust Cards, Category Grid, Featured Trips, CTA
3. **Category** (`/[category]`): Trip Grid
4. **Trip Detail** (`/[category]/[slug]`): Hotels (mit Badges), Services, Program
5. **Booking** (`/[category]/[slug]/booking`): Travelers Form
6. **Confirm** (`/[category]/[slug]/confirm`): Success + Bank Details
7. **About** (`/ueber-uns`): Intro, Tiles
8. **SEO**: Metadata, Structured Data, Alt Texts

---

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Initialize database (automatic on first dev run)
npm run db:init

# 3. Start development server
npm run dev

# 4. Open http://localhost:3000
```

---

## 📁 Key Files

| File | Purpose |
|------|---------|
| `tailwind.config.ts` | Design Tokens (Colors, Fonts, Spacing) |
| `lib/content-schema.ts` | TypeScript Types for CMS Data |
| `lib/seed-data.ts` | Default Content (Trips, FAQ, etc.) |
| `lib/db.ts` | SQLite Client & Persistence |
| `lib/utils.ts` | Helper Functions |
| `app/api/content/route.ts` | CMS Content API (GET/POST) |
| `styles/globals.css` | Tailwind Base + Components |

---

## 🔗 API Endpoints

### `/api/content` (GET)
Retrieve all CMS content.

**Response:**
```json
{
  "c": {
    "home": {...},
    "categories": [...],
    "trips": [...],
    "faq": [...],
    "about": {...},
    "cta": {...},
    "brand": {...},
    "seo": {...}
  },
  "media": []
}
```

### `/api/content` (POST)
Update CMS content (accepts partial updates via merge).

**Request:**
```json
{
  "c": {
    "home": {
      "headline": "Neuer Titel"
    }
  }
}
```

---

## 📌 Design Decisions

1. **SQLite lokal**: Schnell zum Starten, später austauschbar gegen PostgreSQL/MongoDB
2. **Seed Data im Code**: Seed beim App-Start, nicht via API
3. **API Route für Content**: Zentrale Schnittstelle für Website + CMS
4. **Publish Model B**: Per-Trip `published` Flag (später ggf. Draft/Published Snapshot in der DB)
5. **Tailwind Design Tokens**: Zentral definiert, skalierbar, wiederverwendbar

---

Bereit für Phase 2? Warte auf dein Feedback. 🎯
