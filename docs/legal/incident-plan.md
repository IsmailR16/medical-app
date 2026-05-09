# Incidentplan — Diagnostika

**Dokumenttyp:** Plan för hantering av personuppgiftsincidenter (Art. 33-34 GDPR)
**Senast uppdaterad:** 2026-05-09
**Version:** 1.0
**Ansvarig:** Grundarna ([Namn 1], [Namn 2])

---

## Vad är en personuppgiftsincident?

GDPR Art. 4.12: "en säkerhetsincident som leder till oavsiktlig eller olaglig förstöring, förlust eller ändring eller till obehörigt röjande av eller obehörig åtkomst till de personuppgifter som överförts, lagrats eller på annat sätt behandlats."

**Exempel för Diagnostika:**
- Bug i RLS låter en användare läsa annan användares data
- Service role key exponeras (Git-commit, klient-bundle, etc.)
- Supabase-databasen blir publik / läcker via konfigurationsfel
- En användare skriver in riktiga patientuppgifter (Art. 9-data)
- API-nyckel (OpenAI, Clerk, Stripe) kommer på avvägar
- Skadlig kod eller intrång i kontosystemen
- Felaktig export skickas till fel mottagare
- Backup hamnar på opassande lagring

---

## 72-timmars-regeln (Art. 33)

Incident som innebär **risk för fysiska personers rättigheter och friheter** ska anmälas till **IMY inom 72 timmar** från att ni fick vetskap om incidenten.

Vid **hög risk** ska även **berörda personer informeras** utan onödigt dröjsmål (Art. 34).

---

## Procedur — vid misstanke om incident

### Steg 1 — Bekräfta och dokumentera (inom 1 timme)

Skapa en intern incident-rapport (Word/Notion/dokument) med:

```
INCIDENTRAPPORT
================
Datum/tid upptäckt: [YYYY-MM-DD HH:MM]
Upptäckt av: [Namn]
Beskrivning av händelsen:
  [Vad har hänt? Vad observerade ni?]

Datakategorier som potentiellt påverkats:
  [ ] Konto-data (namn, e-post)
  [ ] Chat-innehåll (potentiellt känsligt)
  [ ] Sessioner / inlämningar
  [ ] Bedömningsdata
  [ ] Betalningsdata
  [ ] Tekniska loggar
  [ ] Annat: ___

Antal användare påverkade: [X]
Geografisk omfattning: [Sverige / EU / globalt]
```

### Steg 2 — Begränsa skadan (inom 1-3 timmar)

| Typ av incident | Omedelbar åtgärd |
|---|---|
| Service role key läckt | Rotera nyckeln i Supabase dashboard, uppdatera env vars i Vercel + .env.local, force-redeploy |
| OpenAI/Clerk/Stripe API-nyckel läckt | Återkalla i resp. dashboard, ny nyckel, redeploy |
| RLS-bug upptäckt | Stäng åtkomst till påverkad tabell tillfälligt (revoke), patcha kod, deploy |
| Publik databas | Sätt RLS, kontrollera vilka som kommit åt, granska Vercel/Supabase logs |
| Användarinmatning av riktig data | Identifiera + radera den specifika sessionen + meddela användaren |
| Intrång i konton | Force-logout (Clerk dashboard), kontakta påverkade användare |

### Steg 3 — Bedöm risken (inom 24 timmar)

| Bedömningsfråga | Svar |
|---|---|
| Är det risk för enskildas rättigheter och friheter? | Ja / Nej |
| Vilken typ av data har potentiellt läckts? | Ej känslig / Känslig (Art. 9) |
| Hur många personer påverkas? | [X] |
| Kan personerna identifieras direkt eller indirekt? | Ja / Nej |
| Finns risk för identitetsstöld, diskriminering, ekonomisk skada? | Ja / Nej |
| Är data krypterad eller pseudonymiserad? | Ja / Nej |

**Beslutsmatris:**

| Risk | Anmäl IMY? | Informera användare? |
|---|---|---|
| Ingen risk | Nej | Nej |
| Låg risk | Nej (men dokumentera internt) | Nej (men överväg) |
| Risk | Ja (inom 72h) | Beror på sannolikhet |
| Hög risk | Ja (inom 72h) | Ja (utan onödigt dröjsmål) |

### Steg 4 — Anmäl till IMY (inom 72 timmar om risk finns)

**Anmälan görs via:** [imy.se/anmalan](https://imy.se/verksamhet/dataskydd/anmal-en-personuppgiftsincident/)

Anmälan ska innehålla (Art. 33.3):
- Beskrivning av incidenten
- Antal berörda registrerade
- Antal påverkade poster
- Kontaktuppgifter till privacy-kontakt
- Sannolika konsekvenser
- Vidtagna och planerade åtgärder

> **Tips:** anmäl även om ni är osäkra. IMY är hellre överinformerade än underinformerade. Bättre med en "preventiv" anmälan än att missa 72-timmars-fönstret.

### Steg 5 — Informera användare (om hög risk, Art. 34)

Skicka e-post till påverkade användare med:
- Beskrivning av incidenten i klarspråk
- Vilken data som potentiellt påverkats
- Sannolika konsekvenser för dem
- Vilka åtgärder ni har vidtagit
- Vad de själva kan göra (byta lösenord, kolla kontoutdrag, etc.)
- Kontaktuppgifter för frågor

### Steg 6 — Dokumentera (Art. 33.5)

Behåll incidentrapporten + alla vidtagna åtgärder + kommunikation som intern dokumentation. Detta är ett **lagkrav** även om incidenten inte anmäls.

Lagras i: `docs/legal/incidents/[YYYY-MM-DD]-[kort-beskrivning].md`

### Steg 7 — Lärdomar (inom 2 veckor)

- Vad orsakade incidenten?
- Vilka skyddsåtgärder var inte tillräckliga?
- Vad ändrar vi för att förhindra upprepning?
- Behöver vi uppdatera DPIA, retention-policy, eller andra dokument?

---

## Specifika scenarion — snabbreferens

### Scenario A: Service role key exponerad

```
1. Logga in i Supabase dashboard → Settings → API → "Reset service_role key"
2. Kopiera den nya nyckeln
3. Uppdatera SUPABASE_SERVICE_ROLE_KEY i Vercel (Settings → Environment Variables)
4. Trigger redeploy: Vercel dashboard → Deployments → Redeploy senaste
5. Uppdatera .env.local lokalt
6. Granska Supabase audit logs för obehörig åtkomst senaste 24-72h
7. Bedöm om data exfiltrerats — om ja, anmäl IMY
```

### Scenario B: Användare skriver in riktiga patientuppgifter

```
1. Identifiera den specifika sessionen via support-mail eller logg
2. Radera sessionen direkt via Supabase SQL:
   DELETE FROM sessions WHERE id = '<session-uuid>';
3. Kontakta användaren och påminn om Terms §4.1
4. Vid upprepat brott: stäng av kontot
5. Dokumentera incidenten internt
6. Bedöm: om data lämnat våra system (t.ex. via OpenAI-anrop) → potentiell anmälningsplikt
```

### Scenario C: Bug i RLS

```
1. Upptäck via bug-rapport eller dataimpedans
2. Patcha RLS-policy direkt i Supabase
3. Kör test mellan två konton för att verifiera fix
4. Granska sessioner senaste 30 dagar för misstänkta access-mönster
5. Anmäl IMY om data potentiellt läckt mellan användare
6. Informera påverkade användare
```

---

## Kontakter

### Internt
- **Grundare 1:** [Namn], [E-post], [Telefon]
- **Grundare 2:** [Namn], [E-post], [Telefon]
- **Privacy-kontakt:** privacy@diagnostika.se

### Externt
- **IMY (anmälan):** [imy.se](https://imy.se), 08-657 61 00
- **Supabase support:** support@supabase.com (Pro-plan support)
- **Clerk support:** support@clerk.com
- **OpenAI:** support@openai.com
- **Vercel:** support@vercel.com
- **Stripe:** support@stripe.com

### Jurist (vid större incident)
- **[Företagsnamn]:** [Kontaktinfo]

---

## Versioner

| Version | Datum | Sammanfattning |
|---|---|---|
| 1.0 | 2026-05-09 | Initial incidentplan |
