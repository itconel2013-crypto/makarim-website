# CRM-Auftrag: „Wie bist du auf uns aufmerksam geworden?"

> **An:** Claude Code im CRM-Projekt (`makarim_crm`).
> **Von:** CMS-Website-Projekt (`design_handoff_makarim_website`).
> **Status Website-Seite:** fertig und ausgeliefert — der Webhook schickt die Felder bereits mit.

---

## Warum das gebraucht wird

Das Partner-Tracking (`?ref=` → `Booking.affiliateCode`) erfasst nur, wer über einen
Partnerlink kommt. Der vermutlich stärkste Kanal eines Pilgerreise-Veranstalters —
die Empfehlung aus der Familie, der Hinweis in der Moschee — hinterlässt **keine
technische Spur**: Diese Leute tippen `makarim.de` direkt ein und erscheinen in jeder
Statistik als Direktverkehr.

Die Website fragt deshalb jetzt freiwillig nach. **Damit daraus eine Auswertung wird,
muss das CRM die Angabe speichern und anzeigen.** Tut es das nicht, fällt das Feld
still unter den Tisch und wir sammeln Daten, die niemand je sieht.

---

## Was bereits ankommt

Der Buchungs-Webhook an `CRM_WEBHOOK_URL` enthält ab sofort zwei zusätzliche Felder
auf oberster Ebene (neben `bookingId`, `tripVg`, `travelers`, `contact`, `notes`, `ref`):

```jsonc
{
  "bookingId": 1234,
  "tripVg": "2026-0912",
  "travelers": [ /* … */ ],
  "contact":   { /* … */ },
  "notes": "…",
  "ref": "partnercode",          // bestehend: Partner-Tracking
  "leadSource": "moschee",       // NEU — fester Wert aus der Liste unten, oder fehlt/undefined
  "leadSourceText": "…"          // NEU — nur bei leadSource === "sonstiges", sonst fehlt/undefined
}
```

**Beide Felder sind optional und können fehlen.** Die Angabe ist für den Kunden
freiwillig; eine Buchung ohne sie ist der Normalfall, kein Fehler.

---

## Die Werteliste (verbindlich)

Gespeichert wird der **stabile Schlüssel**, nicht die Beschriftung — so bleiben
Auswertungen über Jahre vergleichbar, auch wenn jemand später die Formulierung auf
der Website ändert. Quelle auf Website-Seite: `lib/lead-source.ts`.

| Wert (speichern) | Label (anzeigen) |
|---|---|
| `empfehlung` | Empfehlung |
| `instagram` | Instagram |
| `google` | Google |
| `whatsapp_facebook` | WhatsApp oder Facebook |
| `moschee` | Moschee oder Gemeinde |
| `wiederkehrer` | Ich war schon einmal mit euch unterwegs |
| `sonstiges` | Sonstiges *(+ Freitext in `leadSourceText`, max. 200 Zeichen)* |

Die Website validiert bereits gegen diese Liste: Unbekannte Werte werden dort
verworfen und kommen gar nicht erst an. Im CRM trotzdem defensiv behandeln —
ein unbekannter Wert darf die Webhook-Verarbeitung **nie** abbrechen lassen.

---

## Zu erledigen

### 1. Datenmodell
- `Booking.leadSource` (String, optional)
- `Booking.leadSourceText` (String, optional)
- Schema-Deploy wie üblich per `prisma db push` in die private Prod-DB
  (temp. Public Access + `railway run -s Postgres node …`), **vor** dem Code-Deploy.

### 2. Webhook-Verarbeitung
Beide Felder aus der Nutzlast übernehmen und am `Booking` speichern. Fehlen sie,
bleibt das Feld leer — kein Fehler, keine Warnung.

> **Idempotenz beachten:** Der Retry-Mechanismus des CMS kann dieselbe Buchung
> mehrfach schicken (Abgleich über `bookingId`). Die Felder dabei einfach
> mitschreiben, keine zweite Buchung anlegen.

### 3. Anzeige im Vorgang
Im Vorgang sichtbar machen, am sinnvollsten direkt neben dem Partner-Badge (🤝),
das es schon gibt. Vorschlag: kleines Abzeichen mit dem Label, bei `sonstiges`
zusätzlich der Freitext.

### 4. Auswertungen — **der eigentliche Zweck**
Im bestehenden Bereich „Auswertungen" einen Baustein ergänzen:

- Verteilung der Herkunft über alle Buchungen eines Zeitraums (Anzahl + Prozent je Kanal)
- Filter nach Jahr/Reise wie bei den anderen Bausteinen
- Die Freitexte zu `sonstiges` als Liste darunter — dort stehen erfahrungsgemäß die
  Hinweise auf Kanäle, an die vorher niemand gedacht hat
- „Keine Angabe" als eigene Zeile ausweisen, nicht verstecken. Wenn 70 % nichts
  angeben, ist die Statistik mit Vorsicht zu genießen — und genau das muss man sehen.

### 5. Kontaktanfragen (optional, später)
Die Website stellt dieselbe Frage auch im **Kontaktformular**. Diese Anfragen liegen
derzeit nur in der CMS-Datenbank (`contact_requests`) und gehen **nicht** ans CRM.
Falls diese Gruppe später interessant wird — es sind die Leute, die anfragen und
*nicht* buchen — wäre ein eigener Übertragungsweg nötig. Nicht Teil dieses Auftrags.

---

## Definition of Done

- [ ] `Booking.leadSource` + `Booking.leadSourceText` im Schema, auf Prod gepusht
- [ ] Webhook speichert beide Felder; fehlende Felder verursachen keinen Fehler
- [ ] Herkunft im Vorgang sichtbar
- [ ] Baustein in „Auswertungen" inkl. „Keine Angabe" und Freitext-Liste
- [ ] Mit einer Testbuchung end-to-end geprüft (Website → Webhook → CRM-Anzeige)

> **Nicht ändern:** die Werteliste oben (sie ist der gemeinsame Vertrag mit der
> Website), das bestehende Partner-Tracking, die Idempotenz über `bookingId`.
