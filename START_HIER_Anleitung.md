# START HIER — Anleitung für die Umsetzung mit Claude Code

Diese Anleitung bringt die Designs (Website + CMS) mit **Claude Code** in echten Code.
Du brauchst keine Programmierkenntnisse, um zu starten — folge einfach den Schritten.

---

## Was ist Claude Code?
Ein Programmier-Assistent, der in einem Ordner auf deinem Computer arbeitet: er liest Dateien,
schreibt Code und kann das Projekt starten. Du gibst Anweisungen in normaler Sprache.

---

## Schritt 1 — Vorbereiten
1. Entpacke dieses ZIP in einen Ordner, z. B. `makarim-handoff/`.
   Darin liegen: `README.md`, `Makarim Website.dc.html`, `Website CMS.dc.html`, `support.js`, `assets/` und diese Datei.
2. Installiere **Claude Code** (falls noch nicht vorhanden): siehe https://docs.claude.com/claude-code
3. Lege einen **leeren Projektordner** an, in dem die echte App entstehen soll, z. B. `makarim-app/`.
4. Kopiere den entpackten `makarim-handoff/`-Ordner **in** `makarim-app/` hinein
   (dann hat Claude Code die Designs als Referenz direkt zur Hand).

```
makarim-app/                ← hier startest du Claude Code
└── makarim-handoff/        ← die Designreferenz (dieses Paket)
    ├── README.md
    ├── Makarim Website.dc.html
    ├── Website CMS.dc.html
    ├── support.js
    └── assets/
```

## Schritt 2 — Claude Code starten
Öffne ein Terminal im Ordner `makarim-app/` und starte Claude Code dort.

## Schritt 3 — Ersten Prompt schicken
Kopiere den **Prompt unten** (Abschnitt „PROMPT 1") und schicke ihn ab.
Claude Code liest dann zuerst das README und macht dir einen Plan — **lass es erst planen, bevor es baut.**

## Schritt 4 — Plan prüfen & bauen lassen
- Sieh dir den Plan an (Technologie-Wahl, Reihenfolge). Passt er, sag „Ja, bitte umsetzen".
- Lass **zuerst die öffentliche Website** bauen, **dann das CMS** (PROMPT 2).

## Schritt 5 — Ansehen & iterieren
- Bitte Claude Code, die App lokal zu starten (es nennt dir die Adresse, meist `http://localhost:3000`).
- Vergleiche mit den HTML-Designs (öffne die `.dc.html`-Dateien einfach im Browser).
- Nenne konkrete Korrekturen („Abstand zu groß", „Farbe X stimmt nicht") — klein und gezielt.

## Schritt 6 — Echte Inhalte & CRM
- Ersetze die Beispielbilder in `assets/` durch echte Fotos.
- Wenn das CRM so weit ist: setzt die Schnittstelle nach dem **Hotel-Datenvertrag** im README um
  (Push vom CRM → CMS). Bis dahin kann das CMS mit eigenen Daten/Defaults laufen.

---

## PROMPT 1 — Einstieg (kopieren & an Claude Code senden)

```
Im Ordner makarim-handoff/ liegt eine Design-Übergabe für eine Reise-Website
(Hajj/Umrah/Kulturreisen) plus ein CMS. Bitte:

1. Lies zuerst makarim-handoff/README.md vollständig. Es ist die maßgebliche
   Spezifikation (Architektur, Datenmodell, alle Screens, Tokens, SEO, Publish-Workflow).
2. Die .dc.html-Dateien sind DESIGN-REFERENZEN, kein Produktionscode — nicht 1:1 kopieren.
   Bau die Designs sauber in einem geeigneten, modernen Stack nach.
3. Empfehlung für SEO: Next.js (App Router) mit Server-Side-Rendering/Static Generation,
   TypeScript und Tailwind CSS. Wenn du etwas Besseres vorschlägst, begründe es kurz.
4. Übernimm die Design-Tokens (Farben, Schriften Newsreader/Schibsted Grotesk/JetBrains Mono,
   Radien, Schatten) exakt aus dem README. Es ist High-Fidelity — pixelnah nachbauen.
5. Wichtig zur Architektur: Website und CMS sind ENTKOPPELT. Die Website liest NUR aus dem
   CMS-Datenbestand, nie direkt aus dem CRM. Das CMS hält eine eigene Kopie. Plane eine
   Datenschicht (vorerst lokale DB/JSON oder SQLite), die später eine CRM-Push-Schnittstelle
   nach dem Hotel-Datenvertrag im README bekommt.

Fang NICHT sofort an zu programmieren. Erstelle zuerst:
(a) die Technologie-Wahl mit kurzer Begründung,
(b) die geplante Ordner-/Routenstruktur (echte URLs: /, /umrah, /hajj, /kulturreisen,
    /umrah/<slug>, /ueber-uns, plus /admin fürs CMS),
(c) die Reihenfolge der Umsetzung.
Dann warte auf mein OK.
```

## PROMPT 2 — Nach dem OK (Website zuerst, dann CMS)

```
Plan ist freigegeben. Setze in dieser Reihenfolge um und halte dabei das README ein:

1. Projektgerüst + Design-Tokens (Farben, Fonts, Spacing) als Theme/Tailwind-Config.
2. Öffentliche Website, Screen für Screen laut README:
   Home → Kategorie → Reise-Detail (Reihenfolge: Hotels-Block mit Rating-Badge + Distanz-
   Pille [🕋 Mekka / grüne Kuppel Medina], dann Enthaltene Leistungen, dann Programm)
   → Buchung → Bestätigung → Über uns.
   Inklusive: SEO (title/meta pro Seite + strukturierte Daten), alt-Texte, WhatsApp-Button.
3. Datenschicht: Content-Modell exakt wie im README (trips mit published-Flag, hotels-Array,
   seoTitle/seoDesc, about-tiles, seo-Objekt usw.). Website zeigt nur published !== false.
4. Danach das CMS (/admin): Editoren für Startseite, Kategorien, Reisen (mit den drei
   zuklappbaren Bereichen Inhalt/Hotels/SEO + Entwurf/Veröffentlicht-Status), FAQ, Über uns,
   SEO, Mediathek, Kontakt & Footer. Mit Live-Vorschau und Bild-Upload.

Zeig mir nach jedem großen Schritt das Ergebnis, dann gebe ich Feedback.
Bei Unklarheiten frag nach, statt zu raten.
```

## Tipps
- **Klein iterieren.** Lieber „bau Schritt 2 fertig, zeig her" als alles auf einmal.
- **Designs offen halten.** Öffne die `.dc.html`-Dateien im Browser zum Vergleich.
- **Nichts erfinden lassen.** Wenn Claude Code Inhalte/Felder erfindet, verweise aufs README.
- **CRM später.** Die CRM-Anbindung kommt zum Schluss — vorher läuft alles mit CMS-Daten.
