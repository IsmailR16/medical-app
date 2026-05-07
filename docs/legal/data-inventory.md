# Diagnostika — Datakarta

**Status:** Internt dokument — beskriver all personuppgiftsbehandling i Diagnostika.
**Senast uppdaterad:** 2026-05-07
**Version:** 1.0

Använd detta som källa för: Privacy Policy, retention-policy, DPIA, sub-processor-lista, frågor från IMY/användare.

---

## 1. Personuppgiftsansvarig (Data Controller)

**[Bolagsnamn TBD — fyll i när AB är registrerat]**
- Org.nr: [TBD]
- Adress: [TBD]
- Privacy-kontakt: privacy@diagnostika.se *(skapa denna mail-alias innan launch)*

> **Att fixa innan launch:** Registrera bolag, sätt upp privacy@-mail som pekar på grundarna. Tills dess: använd founder-mail.

---

## 2. Datakategorier — vad vi behandlar

### 2.1 Konto-data

| Fält | Källa | Var lagras | Rättslig grund |
|---|---|---|---|
| Namn | Clerk (vid signup) | Clerk + spegling i Supabase `users` | Avtal (Art. 6.1.b) |
| E-post | Clerk | Clerk + Supabase `users` | Avtal |
| Avatar URL | Clerk | Supabase `users` | Avtal |
| Clerk user_id | Clerk | Supabase `users` (FK på allt) | Avtal |

**Användning:** identifiera användaren, koppla sessioner till rätt person, logga in.

### 2.2 Sessions- och användningsdata

| Fält | Innehåll | Var lagras | Rättslig grund |
|---|---|---|---|
| Session-metadata | case_id, status, timestamps | Supabase `sessions` | Avtal |
| Beställda undersökningar | `revealed_items` (lista över ordered investigations) | Supabase `sessions` | Avtal |
| Inlämnad diagnos | `primary_diagnosis` (fri text) | Supabase `sessions` | Avtal |
| Differentialdiagnoser | `differential_diagnoses` (lista) | Supabase `sessions` | Avtal |
| Handläggningsplan | `treatment_plan` (fri text) | Supabase `sessions` | Avtal |
| Resonemang | `reasoning` (fri text) | Supabase `sessions` | Avtal |
| Månadsanvändning | sessions_started counter | Supabase `usage` | Avtal (free-tier-gräns) |

**Användning:** följa studentens framsteg, bygga utvärdering, hantera free-tier-gräns.

### 2.3 Chat-meddelanden ⚠️ POTENTIELLT KÄNSLIGT

| Fält | Innehåll | Var lagras | Rättslig grund |
|---|---|---|---|
| Studentens chat-input | Fri text (frågor till AI-patient) | Supabase `messages` | Avtal |
| AI-patient-svar | LLM-genererat svar | Supabase `messages` | Avtal |

**Risk:** trots disclaimers kan studenten råka skriva in:
- Riktiga patientdata (namn, personnummer, journalinformation)
- Hälsouppgifter om sig själv eller anhöriga
- Andra känsliga personuppgifter

**Behandlas internt som potentiellt känslig data** (Art. 9 GDPR — hälsouppgifter), även om vi förbjuder sådan input via Terms.

**Mitigering:**
- Disclaimer i UI flera ställen
- AI ska aktivt vägra om student skriver in identifierande info *(att implementera)*
- Begränsad intern access (bara via service role key, server-side)
- Användaren kan radera sina sessioner

### 2.4 Evaluation-data

| Fält | Innehåll | Var lagras | Rättslig grund |
|---|---|---|---|
| Rubric scores | Per-area + per-item scoring | Supabase `evaluations.rubric_scores` (jsonb) | Avtal |
| Auto-fail triggers | Säkerhetskritiska brister | Supabase `evaluations.auto_fail_triggered` | Avtal |
| Total score + grade | 0-1 + en av 5 betygsband | Supabase `evaluations` | Avtal |
| Sammanfattning | Övergripande feedback | Supabase `evaluations.summary` | Avtal |
| Styrkor / förbättringar | Listor med text | Supabase `evaluations` | Avtal |

> **Tidigare lagrades hela LLM-output i `evaluations.raw_response`. Borttagen i migration 004 (2026-05-07)** för dataminimering — ingen del av appen läste från fältet, så det utgjorde redundant data + ökad blast radius vid läcka. Strukturerade fält ovan täcker alla behov.

### 2.5 Betalnings-data

| Fält | Innehåll | Var lagras | Rättslig grund |
|---|---|---|---|
| Stripe customer ID | Identifierare | Stripe + Supabase `users.stripe_customer_id` | Avtal |
| Subscription ID | Aktivt abonnemang | Stripe + Supabase `users.stripe_subscription_id` | Avtal |
| Plan | free / pro / institution | Supabase `users.plan` | Avtal |
| Subscription-status, period-datum | För access-kontroll | Supabase `users` | Avtal |
| Faktiska betalkortsdata | (PAN, CVV) | **Endast Stripe — aldrig hos oss** | n/a |
| Faktura-historik | Belopp, datum | Stripe | Rättslig skyldighet (Bokföringslagen 7 år) |

**Notera:** Bokföringslagen kräver 7 års lagring av fakturor → vid radering av konto raderas inte Stripe-betalhistoriken automatiskt. Detta måste skrivas tydligt i Privacy Policy.

### 2.6 Acceptans- och samtyckesloggar

| Fält | Innehåll | Var lagras | Rättslig grund |
|---|---|---|---|
| Terms-acceptans | timestamp + version | Supabase `users.terms_accepted_at` + `terms_version` | Avtal |
| Privacy-acceptans | timestamp + version | Supabase `users.privacy_policy_accepted_at` + `privacy_policy_version` | Avtal |
| "Inga riktiga patientuppgifter"-ack | timestamp | Supabase `users.no_real_patient_data_acknowledged_at` | Bevis på upplyst samtycke |
| Marketing-samtycke | boolean | Supabase `users.marketing_consent` | Samtycke (Art. 6.1.a) |
| Senaste login | timestamp | Supabase `users.last_login_at` | Berättigat intresse (säkerhet + retention) |

> **Status:** Lades till i migration 005. Gating mot dashboard finns i `(dashboard)/layout.tsx` — användare som inte accepterat omdirigeras till `/accept-terms`.

### 2.7 Institutionell data (framtida — inaktivt nu)

| Fält | Innehåll | Var lagras | Rättslig grund |
|---|---|---|---|
| Institution-membership | Vilken institution + roll | Supabase `institution_members` | Avtal |

> **Inaktivt nu.** När vi börjar erbjuda institutionsabonnemang behöver detta avsnitt utökas + ny DPIA.

### 2.8 Tekniska loggar

| Fält | Innehåll | Var lagras | Rättslig grund |
|---|---|---|---|
| IP-adress | Vid request | Vercel access logs | Berättigat intresse (säkerhet) |
| User-agent | Browser-info | Vercel logs | Berättigat intresse |
| Server-error logs | Stack traces, request-IDs | Vercel | Berättigat intresse |
| Webhook-events | Stripe webhook-logs | Stripe + Vercel | Avtal |

**Inte:** vi använder INTE för tillfället analytics (Google Analytics, PostHog, Hotjar). Om det aktiveras → cookie banner krävs och denna sektion uppdateras.

---

## 3. Personuppgiftsbiträden (Sub-processors)

| Leverantör | Funktion | Region | DPA-status | Tredjelandsöverföring? |
|---|---|---|---|---|
| **Clerk** | Auth, signup, email | USA (med EU-data residency option) | DPA finns publikt, kontrollera signering | Ja — hanteras via SCC i DPA |
| **Supabase** | Databas, lagring | Stockholm *(verifiera projektregion)* | DPA finns, **måste begäras/signas via dashboard** | Beror på sub-processors (kontrollera) |
| **OpenAI** | LLM (AI-patient + evaluation) via API | USA | DPA finns för API-kunder. **API-data används EJ för träning** (default) | Ja — hanteras via SCC i DPA |
| **Stripe** | Betalning, prenumerationer | USA + EU | DPA finns publikt | Ja — hanteras via SCC i DPA |
| **Vercel** | Hosting, edge, deployment | USA + EU edge | DPA finns för Pro+. **Kontrollera er plan** | Ja — hanteras via SCC i DPA |

> **Action items innan launch:**
> - [ ] Verifiera Supabase-projektets region (Stockholm preferred)
> - [ ] Sign Supabase DPA via dashboard
> - [ ] Spara kopior av alla DPA i `docs/legal/dpa/`
> - [ ] Lista underbiträden (sub-sub-processors) per leverantör
> - [ ] Verifiera Vercel-plan har DPA-täckning (kräver Pro)

---

## 4. Tredjelandsöverföring (utanför EU/EES)

**Ja — Diagnostika överför personuppgifter till tredjeland (USA-baserade leverantörer).**

| Mottagare | Land | Skyddsmekanism |
|---|---|---|
| Clerk | USA | Standardklausuler (SCC) i DPA |
| OpenAI | USA | SCC i DPA + API-data ej för modellträning |
| Stripe | USA | SCC i DPA |
| Vercel | USA | SCC i DPA (Pro-plan) |

**Skyddsåtgärder:**
- Alla leverantörer har Standard Contractual Clauses (SCC) i sina DPA
- Inget data lagras lokalt utanför vår kontroll
- Användaren informeras om detta i Privacy Policy

> **Notera:** Vid Schrems II-uppdateringar eller om EU-USA Data Privacy Framework påverkas → granska igen.

---

## 5. Retention (sammanfattning — full policy i separat dok)

| Datatyp | Default-retention | Trigger för radering |
|---|---|---|
| Konto | Tills användaren raderar **eller 24 månaders inaktivitet** | Användarrequest, inaktivitet, kontoradering |
| Sessioner | Hängs på kontot (raderas med kontot) | Användarrequest, kontoradering |
| Chat-meddelanden | Hängs på sessionen | Användarrequest, sessionsradering |
| Evaluations | Hängs på sessionen | Användarrequest, sessionsradering |
| Betalningshistorik (Stripe) | **7 år** (Bokföringslagen) | Lagkrav — kan inte raderas tidigare |
| Tekniska loggar (Vercel) | 30-90 dagar (default) | Auto-rotation |
| Acceptans/samtyckesloggar | Tills kontot raderas (bevis på samtycke) | Kontoradering |

> **Att implementera:**
> - [ ] Auto-cleanup av inaktiva konton (24 mån) — cron-job
> - [ ] Varningsmail vid 30 dagar / 7 dagar innan auto-radering

---

## 6. Användarrättigheter (GDPR Art. 15-22)

Användaren har rätt att:

| Rättighet | Hur uppfylls |
|---|---|
| **Tillgång** (Art. 15) | Manuellt via privacy@diagnostika.se *(automatisk export på sikt)* |
| **Rättelse** (Art. 16) | Via /settings (namn, e-post via Clerk) |
| **Radering** (Art. 17) | Self-service "Radera mitt konto" + sessionsradering *(att implementera)* |
| **Begränsning** (Art. 18) | Via privacy@-mail |
| **Dataportabilitet** (Art. 20) | JSON-export av sessioner + evaluations *(att implementera)* |
| **Invändning** (Art. 21) | Via privacy@-mail |

> **Att implementera:**
> - [ ] /settings → "Radera mitt konto"-knapp (delete account flow)
> - [ ] /settings → "Radera session"-knapp (per-session)
> - [ ] /settings → "Exportera mina data" (JSON download)
> - [ ] privacy@diagnostika.se mail-alias

---

## 7. Dataflöde — överblick (text-form)

```
Student-browser
   ↓ (HTTPS)
Vercel Edge / Next.js
   ↓
Clerk (auth-check) ──→ användare verifierad
   ↓
Supabase (sessions, messages, evaluations)
   ↓ vid AI-anrop
OpenAI API (chat-historik + clinical_data skickas → svar tillbaka)
   ↓
Stripe (vid betalning + subscription-events)
   ↓ webhook tillbaka
Vercel handler → Supabase (uppdatera plan)
```

**Ingen data går direkt från klient till OpenAI eller Stripe** — allt routas via Vercel-server-funktioner.

---

## 8. Mitigering av kända risker

| Risk | Hantering |
|---|---|
| Student skriver riktiga patientuppgifter i chat | Disclaimers + AI-stop-respons + ack-checkbox + Terms-förbud |
| Sessioner läcker mellan användare | Supabase RLS — testas innan launch |
| Service role-nyckel exponeras | Aldrig i klient-kod, endast server-side |
| Konto-byte / phishing | Clerk hanterar 2FA, password reset |
| Otillåten datadelning | Sessioner är privata per default, inga delningsfunktioner |

---

## 9. Hur dokumentet används

- **Privacy Policy** ska beskriva sektionerna 2, 3, 4, 5, 6 — ofta i sammanfattad form
- **Terms of Service** ska referera till denna karta + Privacy Policy
- **DPIA** baseras på sektion 2.3 (känslig data) + sektion 8 (risker)
- **Vid IMY-förfrågan** kan vi visa detta direkt
- **Vid sub-processor-byte** uppdatera sektion 3 och bumpa version

---

## 10. Versionering

| Version | Datum | Ändring |
|---|---|---|
| 1.0 | 2026-05-07 | Initial datakarta före beta-launch |
