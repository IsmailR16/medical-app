# Mini-DPIA — Diagnostika

**Dokumenttyp:** Konsekvensbedömning avseende dataskydd (förenklad version, Art. 35 GDPR)
**Senast uppdaterad:** 2026-05-09
**Version:** 1.0
**Författare:** [Grundare-namn]
**Status:** Internt dokument inför beta-launch

---

## 1. Sammanfattning

Diagnostika är en utbildningstjänst där läkarstudenter övar kliniskt resonemang i samtal med AI-patienter i fiktiva patientfall. Behandlingen sker via webbtjänst med Clerk (autentisering), Supabase (databas), OpenAI (AI-inferens), Stripe (betalning) och Vercel (hosting).

Denna förenklade konsekvensbedömning bedömer **medel-till-låg restrisk** efter implementerade skyddsåtgärder. Behandlingen kan starta i beta-format utan ytterligare åtgärder, förutsatt att åtgärder i avsnitt 5 är på plats.

---

## 2. Behandlingens omfattning

### 2.1 Vad behandlas

Se [data-inventory.md](data-inventory.md) för fullständig lista. Sammanfattat:

- **Konto-data:** namn, e-post, avatar (från Clerk)
- **Användning:** vilka case, sessioner, beställda undersökningar
- **Chat-innehåll:** studentens frågor + AI-patientens svar (fri text — risk-zon)
- **Inlämning:** primary_diagnosis, differentialdiagnoser, treatment_plan, reasoning
- **Bedömning:** rubric-scores, betyg, sammanfattning
- **Betalning:** Stripe customer-id, plan, status

### 2.2 Vem ingår

- Läkarstudenter (myndiga, 18+, eller 13-17 med vårdnadshavares samtycke)
- Inga verkliga patienter eller patientdata
- Inga särskilt sårbara grupper

### 2.3 Volym (beta-fas)

- 0-50 användare initialt (closed beta)
- Skalning planerad efter validering

### 2.4 Ny teknik

Tjänsten använder **stora språkmodeller (LLM)** för:
1. Att simulera AI-patient i chatten
2. Att generera bedömning/feedback efter inlämning

Klassas som "ny teknik" i GDPR Art. 35.3.b — triggar uppmärksamhet.

---

## 3. Nödvändighetsbedömning

| Datatyp | Behövs verkligen? | Rättslig grund |
|---|---|---|
| Konto (namn, e-post) | Ja — krävs för att tillhandahålla tjänsten | Avtal |
| Chat-innehåll | Ja — kärnfunktion (anamnesträning) | Avtal |
| Inlämning (diagnos, plan) | Ja — bedömning kräver detta | Avtal |
| Bedömning/feedback | Ja — produktens värde | Avtal |
| Betalning | Ja för betalande | Avtal + bokföringskrav |
| IP/User-agent | Ja för säkerhet | Berättigat intresse |
| Marketing-mail | Nej (default off) | Samtycke |
| AI-modellträning | Nej — vi gör inte detta | n/a |

Behandlingen är **proportionell** och kollekterar inte mer än nödvändigt.

---

## 4. Identifierade risker

### Risk 1 — Student skriver in riktiga patientuppgifter trots disclaimers

**Beskrivning:** En student kan av misstag skriva in namn, personnummer, journalinformation eller hälsouppgifter om en verklig person (patient, anhörig, sig själv) i chat-fältet.

**Skada om det händer:** Hälsouppgifter (Art. 9) hamnar i vår databas + skickas tillfälligt till OpenAI. Risk för otillåten behandling av känslig data.

**Sannolikhet:** Medel — trots flera varningar kan det ske.
**Konsekvens:** Hög — Art. 9-data kräver explicit samtycke vi inte har.

### Risk 2 — AI hallucinerar fel medicinsk information

**Beskrivning:** LLM:n kan generera felaktig medicinsk information som student tar med sig ut i klinisk praxis.

**Skada:** Student lär sig fel → potentiellt påverkan på verklig patientvård.

**Sannolikhet:** Medel.
**Konsekvens:** Medel — detta är en utbildningstjänst, inte beslutsstöd. Studenten ska ha klinisk handledning som backup.

### Risk 3 — Tredjelandsöverföring (USA-baserade leverantörer)

**Beskrivning:** Clerk, OpenAI, Stripe och Vercel är USA-baserade. Personuppgifter överförs.

**Sannolikhet:** Säker (sker varje dag).
**Konsekvens:** Låg-medel — alla har Standard Contractual Clauses (SCC) i sina DPA.

### Risk 4 — Profilering / automatiserat beslut (Art. 22)

**Beskrivning:** Rubric-scoring + betygsband kan tolkas som automatiserat beslut.

**Sannolikhet:** Beror på hur tjänsten används.
**Konsekvens:** Medel om institutioner börjar använda för examination.

### Risk 5 — Säkerhetsbrist i åtkomstkontroll

**Beskrivning:** Bug i Supabase RLS eller exponering av service role key kan låta en användare läsa annan användares data.

**Sannolikhet:** Låg — RLS implementerat och service-key används endast server-side.
**Konsekvens:** Hög om det händer — potentiell läcka av chat-innehåll.

### Risk 6 — Långtidslagring av känsligt innehåll

**Beskrivning:** Chat-loggar och inlämningar lagras tillsvidare på kontot.

**Sannolikhet:** Säker.
**Konsekvens:** Låg-medel — minimerad genom radera-knapp + 24-mån-cleanup.

---

## 5. Skyddsåtgärder

### Mot Risk 1 (felaktig input av riktig data)

| Åtgärd | Status |
|---|---|
| Disclaimer på landing-sida | ✅ Plats för i marketing-layout |
| Checkbox vid signup ("inga riktiga uppgifter") | ✅ `/accept-terms` |
| Onboarding-modal innan första case | ✅ `CaseDisclaimerModal` |
| Persistent varning i chat-input | ✅ ChatComposer |
| Förbjuden användning i Terms (§4.1) | ✅ |
| AI-säkerhetsrespons om misstänkt data upptäcks | ⏳ planerat (steg 10) |
| Studentens egen radera-session-knapp | ✅ |

### Mot Risk 2 (AI-hallucinationer)

| Åtgärd | Status |
|---|---|
| Tydlig medicinsk friskrivning i Terms (§11) | ✅ |
| Tydlig "ej kliniskt beslutsstöd" i Privacy Policy | ✅ |
| Disclaimers i UI | ✅ |
| AI-prompten förbjuder att ställa diagnos i chatten | ✅ ([lib/ai/patient.ts](../../lib/ai/patient.ts)) |

### Mot Risk 3 (tredjelandsöverföring)

| Åtgärd | Status |
|---|---|
| SCC i DPA hos alla leverantörer | ⏳ kontroll/signering pågår |
| Supabase i Stockholm-region | ⏳ verifieras |
| Användaren informerad i Privacy Policy | ✅ §7 |

### Mot Risk 4 (Art. 22 profilering)

| Åtgärd | Status |
|---|---|
| Privacy Policy §10 förklarar att det INTE är ett automatiserat beslut | ✅ |
| Terms §5.2 begränsar användning till självträning | ✅ |
| AI Act-monitoring vid eventuella institutionsavtal | ⏳ trigger för förnyad granskning |

### Mot Risk 5 (säkerhetsbrist)

| Åtgärd | Status |
|---|---|
| RLS aktiverat på alla tabeller | ✅ ([schema.sql](../../supabase/schema.sql)) |
| Service role key endast server-side | ✅ ([lib/supabase/server.ts](../../lib/supabase/server.ts)) |
| RLS-test mellan två konton | ⏳ planerat |
| Webhook-signaturer verifieras (svix) | ✅ |
| HTTPS via Vercel | ✅ |
| Incident-plan | ✅ ([incident-plan.md](incident-plan.md)) |

### Mot Risk 6 (långtidslagring)

| Åtgärd | Status |
|---|---|
| `evaluations.raw_response` borttagen (data minimization) | ✅ migration 004 |
| Användaren kan radera enskild session | ✅ |
| Användaren kan radera hela kontot | ✅ |
| 24-månaders inaktivitets-radering | ⏳ cron-jobb planerat |
| Retentionspolicy dokumenterad | ✅ ([retention-policy.md](retention-policy.md)) |

---

## 6. Restrisk och slutsats

### Sammanvägd restrisk efter åtgärder

| Risk | Före åtgärder | Efter åtgärder |
|---|---|---|
| 1 (riktig data i chat) | Hög | **Medel-låg** |
| 2 (AI-hallucinationer) | Medel | **Låg** |
| 3 (tredjeland) | Medel | **Låg** |
| 4 (Art. 22) | Medel | **Låg** |
| 5 (säkerhet) | Hög | **Låg** efter RLS-test |
| 6 (långtidslagring) | Medel | **Låg** |

### Sammanvägd bedömning

**Restrisken bedöms som medel-låg** efter samtliga skyddsåtgärder. Behandlingen kan starta i beta-format med begränsad användarvolym.

### Förbehåll innan launch

- [ ] AI-säkerhetsrespons implementerad (Risk 1)
- [ ] DPA verifierat och signerat hos alla sub-processors (Risk 3)
- [ ] RLS-test genomfört mellan minst två konton (Risk 5)
- [ ] Cron-jobb för 24-mån-cleanup driftsatt (Risk 6)

### Triggers för förnyad bedömning

- Institutionsavtal (formell examination → Art. 22 högrisk)
- Användarvolym > 1000 aktiva
- Nya datakategorier (t.ex. röst, bild)
- Byte av sub-processor
- Större ändring i Clerk/OpenAI/Supabases hantering

---

## 7. Konsultation av berörda

GDPR Art. 35.9: konsekvensbedömningen ska inhämta synpunkter från registrerade när lämpligt.

För beta-fasen anses **inte** föregående konsultation lämplig eftersom:
- Användarna är frivilliga, vuxna deltagare
- Ingen oproportionerlig påverkan på rättigheter förväntas
- Användaren får full transparens via Privacy Policy + acceptansflöde
- Beta-användare kan när som helst lämna och radera sin data

Vid skalning till institutionsavtal eller obligatorisk användning ska konsultation övervägas.

---

## 8. IMY-konsultation (Art. 36)

Krävs om **hög restrisk kvarstår efter åtgärder** och inte kan minskas. Vår bedömning är att restrisken är medel-låg → **IMY-konsultation krävs inte**.

Behandlingen påbörjas under eget ansvar enligt principen om ansvarsskyldighet (Art. 5.2).

---

## 9. Versioner

| Version | Datum | Sammanfattning |
|---|---|---|
| 1.0 | 2026-05-09 | Initial mini-DPIA inför beta-launch |
