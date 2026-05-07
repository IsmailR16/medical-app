# Diagnostika — Retention Policy

**Status:** Bestämmer hur länge varje datatyp lagras och hur radering sker. Refereras från Privacy Policy och styr cron-jobb i appen.
**Senast uppdaterad:** 2026-05-07
**Version:** 1.0

---

## Princip

GDPR Art. 5.1.e (lagringsminimering): personuppgifter får inte behållas längre än nödvändigt för det syfte de samlats in för.

För Diagnostika betyder detta:
1. Default-radering vid **24 månaders inaktivitet** på kontonivå.
2. Användaren kan när som helst radera enskilda sessioner eller hela kontot (Art. 17).
3. Tekniska loggar och debug-data lagras kortast möjligt.
4. Lagstadgade undantag (bokföring) hanteras separat.

---

## Retention per datatyp

| Kategori | Retention | Motivering | Trigger för radering |
|---|---|---|---|
| **Konto** (`users`) | Tills användaren raderar **eller** 24 månaders inaktivitet | Identifierare för tjänsten, behövs för access så länge tjänsten används | Användarrequest, auto-cleanup vid inaktivitet, Clerk-radering |
| **Sessioner** (`sessions`) | Hängs på kontot | Behövs för progression och historik så länge konto finns | Kontoradering, sessionsradering på user-request |
| **Chat-meddelanden** (`messages`) | Hängs på sessionen (CASCADE) | Beroende av session — utan session = ingen mening | Sessionsradering, kontoradering |
| **Evaluations** (`evaluations`) | Hängs på sessionen (CASCADE) | Som ovan | Som ovan |
| **Acceptansloggar** (terms_accepted_at, privacy_policy_accepted_at, no_real_patient_data_acknowledged_at) | Tills kontot raderas | Bevis på upplyst samtycke; behövs så länge konto finns | Kontoradering |
| **Marketing-samtycke** (marketing_consent) | Tills användaren återkallar **eller** kontot raderas | Bevis på samtycke | Återkallelse, kontoradering |
| **Användning/usage** (`usage`) | Tills kontot raderas (free-tier-räknare per månad) | Behövs för free-tier-gräns aktuell månad | Kontoradering |
| **Stripe customer/subscription IDs** (i Supabase) | Tills kontot raderas | Behövs för access-kontroll | Kontoradering — IDs i Stripe består separat |
| **Stripe-betalningshistorik** (i Stripe) | **7 år** | Bokföringslagen (1999:1078) — fakturor och underlag måste sparas 7 år | Lagkrav — kan inte raderas tidigare |
| **Tekniska loggar** (Vercel: IP, user-agent, request logs) | 30-90 dagar (Vercel default) | Säkerhet och felsökning | Auto-rotation hos Vercel |
| **Webhook-events** (Stripe i Vercel logs) | Som tekniska loggar | Felsökning | Auto-rotation |
| **Cases** (`cases`) | Permanent (tjänstedata, ej personuppgift) | Innehåll i biblioteket — inte personuppgift | Manuell radering av admin |

---

## Användarinitierad radering (GDPR Art. 17)

### Radera enskild session
- Endpoint: `DELETE /api/sessions/[id]` *(att implementera)*
- Effekt: cascade-radering av session + tillhörande messages + evaluations
- UI: knapp i `/sessions`-listan + på session-detaljsidan
- Bekräftelse: modal "Är du säker?"

### Radera hela kontot
- Endpoint: `DELETE /api/users/me` *(att implementera)*
- Effekt:
  - Cascade-radering av alla sessions, messages, evaluations
  - Radering av usage, institution_members
  - **Behåll:** Stripe customer-data (lagkrav, separat från Supabase)
  - Radering av Clerk-konto (via Clerk API)
- UI: "Radera mitt konto" i `/settings` med dubbel-bekräftelse (skriv "RADERA")
- Bekräftelse via mail: "Ditt konto raderas inom 30 dagar"

### Datatabell-export (Art. 20)
- Endpoint: `GET /api/users/me/export` *(att implementera)*
- Format: JSON med alla användarens data
- Innehåll: konto, alla sessions, messages, evaluations, acceptansloggar
- UI: "Exportera mina data" i `/settings`

---

## Auto-cleanup-jobb (att implementera)

### Job 1: Inaktivitetsradering (24 mån)

**Schema:** Daglig cron, kör 03:00 UTC.

**Logik:**
```
1. Hämta alla users där:
   - last_login_at < (now - 24 månader)
   - OR (last_login_at IS NULL AND created_at < (now - 24 månader))
2. För varje match:
   a. Skicka varningsmail om datum-flagga "warning_30d_sent_at" är NULL och inaktivitet > 23 mån
   b. Skicka varningsmail om "warning_7d_sent_at" är NULL och inaktivitet > 23 mån + 23 dagar
   c. Cascade-radera om inaktivitet > 24 mån
3. Logga åtgärden (vilka konton, datum) — för revisionsspår
```

**Krav på schema:**
- Lägg till `users.last_login_at timestamptz` (uppdateras vid varje login)
- Lägg till `users.warning_30d_sent_at timestamptz null`
- Lägg till `users.warning_7d_sent_at timestamptz null`

> **Inaktivitet definieras som:** `last_login_at` — när användaren senast loggade in. Inte sista session, inte sista chat-meddelande.

### Job 2: Tech-log-cleanup
**Hanteras automatiskt av Vercel.** Inget eget jobb behövs.

---

## Konflikt: GDPR vs Bokföringslagen

Bokföringslagen kräver **7 års lagring** av räkenskapsmaterial. Detta inkluderar fakturor, transaktionshistorik, kvitton.

**Praktisk hantering:**
- Stripe lagrar betalningshistorik i 7 år (deras default)
- Vid kontoradering i Diagnostika:
  - Vi raderar `stripe_customer_id` och `stripe_subscription_id` från Supabase `users`
  - Vi **rör inte** Stripe-data — den behålls separat enligt lagkrav
  - Användaren informeras i Privacy Policy: "Betalningsuppgifter lagras hos Stripe i 7 år enligt Bokföringslagen, även efter att ditt konto raderats"

Detta är **lagligt** under GDPR Art. 17.3.b (rättslig förpliktelse).

---

## När konto eller session raderas — vad händer

### Sessions-radering
```
DELETE FROM sessions WHERE id = X;
  → CASCADE → DELETE FROM messages WHERE session_id = X;
  → CASCADE → DELETE FROM evaluations WHERE session_id = X;
```

### Konto-radering
```
1. DELETE FROM sessions WHERE user_id = X;     -- cascadar messages + evaluations
2. DELETE FROM usage WHERE user_id = X;
3. DELETE FROM institution_members WHERE user_id = X;
4. DELETE FROM users WHERE user_id = X;
5. Anropa Clerk API: clerk.users.deleteUser(X);
6. (Stripe-data behålls — lagkrav)
```

> **Implementations-not:** Foreign keys måste ha `ON DELETE CASCADE` för att detta ska fungera atomiskt.

---

## Att implementera (checklista)

- [ ] Migration 005: lägg till `users.last_login_at`, `warning_30d_sent_at`, `warning_7d_sent_at`
- [ ] Uppdatera Clerk-webhook eller middleware: skriv `last_login_at` vid varje session-start
- [ ] Bygg `DELETE /api/sessions/[id]` med ownership-check
- [ ] Bygg `DELETE /api/users/me` med ägarskaps- + Clerk-radering
- [ ] Bygg `GET /api/users/me/export`
- [ ] UI: "Radera session", "Radera konto", "Exportera data" i `/settings`
- [ ] Cron-jobb för inaktivitetsradering (Vercel cron eller Supabase Edge function)
- [ ] Mailmall för varningar (kan vara enkel: "ditt Diagnostika-konto raderas om N dagar")

---

## Avvikelser och undantag

Följande situationer är medvetet undantagna från standardretentionen ovan:

1. **Pågående juridisk process** — om vi får begäran från myndighet att bevara data, pausas auto-cleanup för det specifika kontot. Dokumenteras separat.
2. **Bedrägeriutredning** — om användaren misstänks för bedrägeri kan vi behålla data längre under "berättigat intresse".
3. **Bokföringsmaterial** — som ovan: 7 år.

I alla fall ska användaren informeras (såvida inte myndighet beordrar tystnad).

---

## Versionering

| Version | Datum | Ändring |
|---|---|---|
| 1.0 | 2026-05-07 | Initial retention policy före beta-launch |
