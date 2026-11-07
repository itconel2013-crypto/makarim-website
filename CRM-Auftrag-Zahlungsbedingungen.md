# CRM-Auftrag: Zahlungs- und Stornobedingungen an die Website schicken

> **An:** Claude Code im CRM-Projekt (`makarim_crm`).
> **Von:** CMS-Website-Projekt (`design_handoff_makarim_website`).
> **Erweitert:** `design_handoff_makarim_crm/CRM-an-CMS-Anbindung.md`, Abschnitt 3 (Datenvertrag Reise).
> **Richtung:** CRM → Website. Diesmal **sendet** das CRM, es muss nichts entgegennehmen.

---

## Warum das gebraucht wird

Die Buchungsseite zeigt seit dem 07.11.2026 einen Abschnitt „Zahlung & Stornierung"
**vor** dem verbindlichen Absenden — Anzahlung, Fälligkeiten, Stornostaffel. Das ist
vorvertragliche Information nach Pauschalreiserecht und muss mit dem übereinstimmen,
was der Kunde später per E-Mail und Rechnung aus dem CRM bekommt.

Die Werte lassen sich im CMS von Hand pflegen. **Das ist der falsche Ort.** Im CRM
stehen sie bereits (`PaymentTerm`, `CancellationTier`, je Reise `Trip.zahlMode` /
`Trip.stornoMode`), dort werden sie gepflegt, und dort hängen Rechnung, Zahlungsplan
und Mahnwesen daran. Zwei Pflegeorte bedeuten früher oder später zwei verschiedene
Wahrheiten — und die auf der Website wäre die, die der Kunde vor dem Buchen gelesen hat.

Deshalb: **Das CRM schickt die Bedingungen mit dem Reise-Push mit.** Die Website zeigt
sie nur an.

---

## Der Datenvertrag

Der bestehende Push bleibt unverändert: `PATCH {CMS_BASE_URL}/api/content`, Body
`{ trip }`, gebaut in `lib/cms.ts` → `buildTripPayload()`. Dort kommt **ein neues,
optionales Feld** dazu:

```jsonc
{
  "vg": "2026-0912",
  "name": "…", "price": 1890, "seats": 12,   // alles unverändert
  "terms": {                                  // NEU — optional
    "depositPerPerson": 400,                  // € je Person (Zahl, > 0)
    "depositDays": 7,                         // Tage NACH der Buchungsbestätigung
    "finalDays": 30,                          // Tage VOR Abreise
    "cancellation": [                         // Staffel, bereits sortiert
      { "deadline": "bis 60 Tage vor Abreise", "feePct": 20 },
      { "deadline": "59–30 Tage vor Abreise",  "feePct": 50 },
      { "deadline": "ab 29 Tage vor Abreise",  "feePct": 80 }
    ],
    "cancellationText": "…"                   // ALTERNATIV zur Staffel, siehe unten
  }
}
```

### Fünf Regeln, die den Unterschied machen

**1. Immer die *wirksamen* Werte dieser Reise senden, nie die Rohdaten.**
Das CRM löst `zahlMode` / `stornoMode` selbst auf: Bei `Standard` kommen die Werte aus
`PaymentTerm` (`isStandard`) und `CancellationTier`, bei `Abweichend` aus
`Trip.zahlCfgJson` bzw. `Trip.stornoText`. Die Website kennt diese Logik nicht und soll
sie nicht nachbauen — sonst gibt es zwei Implementierungen derselben Regel, die
auseinanderlaufen. `lib/paymentPlan.ts` löst das für den Zahlungsplan bereits auf;
dieselbe Auflösung hier verwenden.

**2. `cancellation` und `cancellationText` schließen einander aus.**
Bei `stornoMode = "Standard"` die Staffel senden, bei `"Abweichend"` den Freitext.
Nie beides. Kommt trotzdem beides an, zeigt die Website den Freitext.

**3. Lieber nichts senden als etwas Falsches.**
Ist eine Angabe nicht gepflegt, das jeweilige Feld **weglassen** — kein `0`, kein `""`,
kein `null`. Eine fehlende Angabe blendet die Website aus; eine `0` würde als
„0 € Anzahlung" auf der Buchungsseite stehen. Ist gar nichts gepflegt, `terms`
komplett weglassen; dann erscheint der Abschnitt wie bisher nicht.

**4. Fristen als Zahl, nicht als Satz.**
`depositDays` und `finalDays` sind reine Tageszahlen, so wie sie im CRM stehen. Die
Formulierung („spätestens 30 Tage vor Abreise") baut die Website daraus. So bleibt die
Sprache der Website in einer Hand, und ihr müsst bei einer Textänderung nichts anfassen.

**5. Die Zwischenzahlung bleibt außen vor.**
`PaymentTerm.midAmount` / `midDays` existieren, werden laut `lib/paymentPlan.ts` aber
bewusst nicht genutzt. Nicht senden. Falls ihr sie später einsetzt: kurz Bescheid geben,
dann erweitern wir den Vertrag gemeinsam — die Website stellt dann eine dritte Rate dar.

---

## Was die Website damit macht

Zum Mitprüfen, damit ihr das Ergebnis beurteilen könnt:

| Feld | Darstellung auf der Buchungsseite |
|---|---|
| `depositPerPerson` | „400 € je Person" + Hochrechnung „800 € für 2 Personen" |
| `depositDays` | „fällig innerhalb von 7 Tagen nach unserer Buchungsbestätigung" |
| `finalDays` | „spätestens 30 Tage vor Abreise" |
| `cancellation` | Tabelle Frist → Prozentsatz |
| `cancellationText` | derselbe Text als Absatz statt der Tabelle |

Die Anzahlung wird **pro Person** hochgerechnet — passend zu `deposit × pax` im
Zahlungsplan. Reisen mit `vorreservierung: true` zeigen weiterhin „jetzt keine Zahlung
nötig" und ignorieren `terms`.

---

## Zu erledigen

### 1. `buildTripPayload()` um `terms` erweitern
In `lib/cms.ts`, nach den Regeln oben. `TripPayload` mitziehen. Die Auflösung
Standard/Abweichend aus `lib/paymentPlan.ts` wiederverwenden, nicht neu schreiben.

### 2. Re-Push bei Änderung der **globalen** Bedingungen
Das ist der Punkt, der leicht übersehen wird: Bisher löst nur eine Änderung **an einer
Reise** einen Push aus. Ändert jemand die globale Stornostaffel oder den Standard-
`PaymentTerm`, steht auf der Website wochenlang der alte Stand — bei jeder Reise.

Nach dem Speichern von `PaymentTerm` (Standard) oder `CancellationTier` deshalb alle
veröffentlichten, noch nicht abgelaufenen Reisen neu pushen. Ein Fehler bei einer Reise
darf die anderen nicht abbrechen; Ergebnis wie bisher über `syncStatus` / `syncedAt`
sichtbar machen.

### 3. Kein Schema-Deploy nötig
Es kommt **kein neues Feld** in die Datenbank — alles ist vorhanden. Damit entfällt der
`prisma db push`-Schritt und das Risiko an der Prod-DB.

---

## Ihr könnt sofort anfangen

Die Website-Seite baue ich (CMS-Projekt). Ihr müsst **nicht** darauf warten: Unbekannte
Felder im Trip-Payload werden heute schon klaglos mitgespeichert und ignoriert. Ein
`terms`-Objekt, das ankommt, bevor die Website es auswertet, richtet keinen Schaden an —
es liegt einfach bereit.

Umgekehrt gilt: Solange `terms` nicht kommt, bleiben die CMS-Felder die einzige Quelle.

---

## Definition of Done

- [ ] `terms` im `TripPayload`, gefüllt aus den wirksamen Bedingungen der Reise
- [ ] `Standard` **und** `Abweichend` geprüft — je einmal für Zahlung und Storno
- [ ] Nicht gepflegte Angaben fehlen im JSON (keine `0`, kein `""`, kein `null`)
- [ ] Änderung an globalem `PaymentTerm` / `CancellationTier` pusht alle aktiven Reisen neu
- [ ] Ein Push im Log geprüft: `terms` enthält genau die Werte, die auch auf der Rechnung stehen

> **Nicht ändern:** die übrigen Felder des Datenvertrags, die Hoheitsverteilung aus der
> Spec (CMS besitzt Bilder, Banner, `nights`, `slug` …), die Idempotenz des Pushes.
> **Nicht senden:** Bankverbindung, Zahlungseingänge, Mahnstände, personenbezogene Daten.
> Dieses Objekt beschreibt die Bedingungen der Reise, nicht den Stand eines Vorgangs.
