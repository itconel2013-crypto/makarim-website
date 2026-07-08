# CMS-Anpassungen — Teil 2 (Buchungs-Workflow finalisieren)

> **An:** Claude Code im CMS-Projekt (`design_handoff_makarim_website`).
> **Voraussetzung:** Teil 1 (`CMS-Anpassungen.md`) ist bereits umgesetzt — d. h. API-Auth, `bookings`-Tabelle, „Buchung vor E-Mail speichern", `seats`-Dekrement und der CRM-Webhook existieren schon.
> **Dieser Teil** legt nur die **endgültige Rollenverteilung** und die **Zustell-Sicherheit (Retry)** fest. Bitte nur diese Punkte ergänzen/anpassen, nichts Bestehendes umbauen.

---

## Getroffene Entscheidungen (verbindlich)

1. **Es gibt nur EINE Kunden-E-Mail: die Buchungsbestätigung.** Keine separate „Eingangsbestätigung".
2. **Das CRM versendet diese Buchungsbestätigung an den Kunden — nicht das CMS.**
3. **Das CMS verschickt KEINE Kunden-E-Mail mehr.** Es speichert die Buchung, zeigt dem Kunden eine Erfolgsseite und meldet die Buchung per Webhook ans CRM.
4. **Zustellung ist automatisch & selbstheilend** — kein manuelles Nachprüfen nötig (Retry-Mechanismus, siehe unten).

---

## Anpassung A — CMS sendet keine Kunden-E-Mail mehr

**Aktuell:** `app/api/booking/route.ts` ruft `sendCustomerConfirmation()` **und** `sendInternalNotification()` auf.

**Neu:**
- `sendCustomerConfirmation(...)` **nicht mehr aufrufen.** (Funktion in `lib/email.ts` darf bleiben, falls später gebraucht — nur nicht mehr triggern.)
- Die **interne Team-Benachrichtigung** ist **optional** — sie darf bleiben (schadet nicht), ist aber nicht mehr die primäre Übergabe; die echte Übergabe ist der Webhook ans CRM.
- Die **Buchungsbestätigung an den Kunden** erzeugt und versendet ab jetzt **das CRM**, nachdem es die Buchung per Webhook empfangen hat.

> Ergebnis: Aus Sicht des CMS endet der Kunden-Kontakt mit der **Erfolgsseite im Browser** + dem Webhook. Alles Weitere macht das CRM.

---

## Anpassung B — Buchung sichtbar unter „Buchungen"

Die `bookings`-Tabelle existiert bereits. Bitte zusätzlich sicherstellen:

- Es gibt ein Feld **`crm_synced`** (0/1) — falls in Teil 1 noch nicht vorhanden, ergänzen.
- Eine **Admin-Seite `app/admin/buchungen/page.tsx`**, die alle Buchungen listet (neueste zuerst), mit pro Zeile:
  - Vorgangsnummer / Reise-Titel, Kontaktname, Datum, Personenanzahl
  - **Status-Punkt der CRM-Übermittlung:**
    - 🟢 **übermittelt** (`crm_synced = 1`)
    - 🟡 **wird nachgeliefert** (`crm_synced = 0`, Retry läuft)
- Diese Seite liegt unter `/admin`, ist also durch die bestehende Login-Middleware geschützt.

---

## Anpassung C — Automatische Zustellung mit Wiederholung (Retry)

**Ziel:** Wenn der Webhook ans CRM fehlschlägt (CRM offline, Netzwerk-Hänger), wird die Buchung **automatisch später erneut** gesendet — **ohne manuelles Eingreifen**. Es darf nie eine Buchung „hängen bleiben", die jemand von Hand anstoßen muss.

**Ablauf:**

```
Kunde bucht
  → Buchung speichern (crm_synced = 0)         // Sicherheitsnetz, schon vorhanden
  → seats reduzieren                            // schon vorhanden
  → Webhook an CRM senden
        Erfolg (2xx) → crm_synced = 1
        Fehler/Timeout → crm_synced bleibt 0    // Buchung ist trotzdem sicher gespeichert
  → Erfolgsseite an den Kunden anzeigen         // unabhängig vom Webhook-Ergebnis
```

**Retry-Mechanismus für `crm_synced = 0`:**

1. **Hintergrund-Job alle ~5 Minuten:** holt alle Buchungen mit `crm_synced = 0` und sendet den Webhook erneut. Erfolgreiche → `crm_synced = 1`.
   - Umsetzung in dieser Next.js-App z. B. als **Vercel Cron** / geplanter Route-Handler `app/api/cron/retry-bookings/route.ts`, der per Scheduler alle 5 Min. aufgerufen wird. Falls kein Cron verfügbar: ein einfacher `setInterval`-Worker in `instrumentation.ts` (läuft beim Serverstart an).
   - Diese Cron-/Worker-Route mit einem **Secret** absichern (Header `X-Cron-Key` == `process.env.CRON_SECRET`), damit sie nicht öffentlich auslösbar ist.
2. **Timeout pro Webhook-Versuch** (z. B. 8 Sek.), damit ein hängendes CRM den Versuch nicht blockiert.
3. **Idempotenz:** Jeder Webhook enthält die eindeutige `bookingId`. Wird eine Buchung doppelt gesendet (z. B. Erstversuch lief doch durch, Retry feuert nochmal), darf das CRM daraus **keine zweite Buchung** machen — es matcht auf `bookingId`. *(Hinweis an die CRM-Seite.)*

**Optionaler Alarm (empfohlen):** Bleibt eine Buchung **länger als 60 Minuten** auf `crm_synced = 0`, eine kurze Warn-E-Mail an `BOOKING_NOTIFY_EMAIL` senden („Buchung VG … konnte seit 1 Std nicht ans CRM übermittelt werden"). So wirst du im seltenen Dauerausfall **aktiv informiert**, statt selbst nachsehen zu müssen.

---

## Webhook-Inhalt (zur Erinnerung / Abstimmung mit CRM)

Der Webhook an `CRM_WEBHOOK_URL` schickt pro Buchung mindestens:

```jsonc
{
  "bookingId": 1234,                 // eindeutige CMS-Buchungs-ID → Idempotenz
  "tripVg": "2026-0912",
  "travelers": [
    { "anrede": "Herr", "vorname": "…", "nachname": "…", "geburtstag": "1981-04-12", "zimmer": "DZ" }
  ],
  "contact": { "vorname": "…", "nachname": "…", "email": "…", "telefon": "…" },
  "notes": "…",
  "createdAt": "2026-06-22T10:15:00Z"
}
```
Header: `Content-Type: application/json` und `X-API-Key: <CRM_API_KEY>`.

Das CRM antwortet mit `2xx` = „angenommen". Erst dann setzt das CMS `crm_synced = 1`. Das **Versenden der Buchungsbestätigung an den Kunden übernimmt das CRM** nach Empfang.

---

## Definition of Done (Teil 2)

- [ ] CMS ruft **`sendCustomerConfirmation` nicht mehr** auf; keine Kunden-E-Mail mehr aus dem CMS.
- [ ] Erfolgsseite für den Kunden nach dem Buchen (Browser), unabhängig vom Webhook-Ergebnis.
- [ ] `crm_synced`-Feld vorhanden; Admin-Seite `/admin/buchungen` mit 🟢/🟡-Status.
- [ ] Retry: 5-Min-Job (Cron oder Worker) für `crm_synced = 0`, mit Cron-Secret abgesichert; Webhook-Timeout gesetzt.
- [ ] Webhook enthält `bookingId` (Idempotenz); optionaler 60-Min-Alarm an `BOOKING_NOTIFY_EMAIL`.
- [ ] Neue `.env`-Variablen falls nötig: `CRON_SECRET`.

> **Nicht ändern:** Trip-Schema in `lib/content-schema.ts`, Single-DB-Prinzip, E-Mail-Template-Design. Die CRM-seitige Buchungsbestätigung wird **dort** gebaut, nicht hier.
