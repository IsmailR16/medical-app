# Integritetspolicy — Diagnostika

**Senast uppdaterad:** 2026-05-07
**Version:** 1.0

Den här policyn beskriver hur Diagnostika behandlar dina personuppgifter när du använder vår tjänst. Vi vill att den ska vara begriplig — om något är otydligt, mejla oss på privacy@diagnostika.se.

---

## 1. Vem är ansvarig?

**[Bolagsnamn]** är personuppgiftsansvarig för behandlingen av dina personuppgifter inom Diagnostika.

- **Org.nr:** [TBD]
- **Adress:** [TBD]
- **Privacy-kontakt:** privacy@diagnostika.se

> *Bolaget registreras före publik launch. Tills dess hanteras frågor av grundarna direkt.*

---

## 2. Vad är Diagnostika?

Diagnostika är en utbildningstjänst som hjälper läkarstudenter att öva anamnesupptagning, kliniskt resonemang och beslutsfattande genom samtal med AI-patienter i fiktiva, AI-genererade patientfall. Tjänsten är utformad för **självständig träning och övning** och tillhandahåller övningsfeedback baserad på OSCE-liknande kriterier.

Diagnostika **är inte** ett medicintekniskt instrument, ett kliniskt beslutsstöd eller ett verktyg för medicinsk rådgivning. Tjänsten ska inte användas för att fatta beslut om verkliga patienter, för formell examination, kursbedömning eller för att ersätta klinisk handledning.

---

## 3. Vilka uppgifter vi samlar in

### 3.1 När du skapar konto
- Namn, e-postadress och avatar (från Clerk, vår inloggningstjänst)
- Tidpunkten du accepterade användarvillkor och denna policy

### 3.2 När du använder tjänsten
- Vilka patientfall du startat, slutfört och fått feedback på
- Innehållet i dina chattkonversationer med AI-patienten
- Din inlämnade primära diagnos, differentialdiagnoser, handläggningsplan och resonemang
- Vilka undersökningar du beställt under en session
- Den feedback (poäng, betyg, sammanfattning) som genereras efter inlämning

### 3.3 När du betalar
- Stripe-identifierare (customer-id, subscription-id), aktuell plan och prenumerationsstatus
- **Vi lagrar aldrig själva betalkortuppgifter** — det hanteras enbart av Stripe.

### 3.4 Tekniskt
- IP-adress och webbläsarinformation (lagras tillfälligt hos vår hostingleverantör Vercel för säkerhet och felsökning)

### 3.5 Vad vi **inte** samlar in
- Vi använder för närvarande inga analytics-verktyg (Google Analytics, PostHog eller liknande)
- Vi använder inga marknadsförings-cookies
- Vi spårar dig inte över andra webbplatser

---

## 4. Varför vi behandlar uppgifterna och rättslig grund

| Ändamål | Vilken data | Rättslig grund |
|---|---|---|
| Tillhandahålla tjänsten (konto, sessioner, feedback) | Konto-data, session-data, chat, evaluations | **Avtal** — för att uppfylla användaravtalet |
| Hantera betalning och abonnemang | Stripe-IDs, plan, betalningsstatus | **Avtal** + **rättslig skyldighet** (Bokföringslagen) |
| Säkerhet och felsökning | Tekniska loggar | **Berättigat intresse** — att skydda tjänsten |
| Markandsföringsmail (om du valt det) | E-post + samtycke | **Samtycke** — kan när som helst återkallas |

Vi använder **inte** dina chattar eller inlämningar för att träna AI-modeller. Om vi någonsin skulle vilja det krävs ditt explicita samtycke först.

---

## 5. Särskilt om chattinnehåll

Diagnostika är endast avsett för **fiktiva** patientfall. Trots våra varningar i tjänsten kan en användare av misstag skriva in information som rör verkliga personer. Vi behandlar därför chattinnehåll **internt som potentiellt känsliga uppgifter** och tillämpar förstärkta skyddsåtgärder:

- Åtkomst sker endast via krypterade serveranslutningar
- Inga interna medarbetare har slumpmässig åtkomst till enskilda chattar
- Du kan när som helst radera enskilda sessioner eller hela ditt konto

Du **får inte** skriva in:
- Namn, personnummer eller andra identifierande uppgifter om verkliga personer
- Information från riktiga journaler eller VFU-patienter
- Hälsouppgifter om dig själv eller anhöriga

Att göra det bryter mot våra användarvillkor och kan leda till att kontot stängs av.

---

## 6. Vilka har tillgång till dina uppgifter

För att leverera tjänsten anlitar vi följande personuppgiftsbiträden (sub-processors):

| Leverantör | Funktion | Region |
|---|---|---|
| **Clerk** | Inloggning och kontohantering | USA (med EU-data residency) |
| **Supabase** | Databas och lagring | EU (Stockholm) |
| **OpenAI** | AI-patient och feedback (via API) | USA |
| **Stripe** | Betalningar och abonnemang | USA + EU |
| **Vercel** | Hosting och drift | USA + EU edge |

Med samtliga leverantörer har vi personuppgiftsbiträdesavtal (DPA) som säkerställer att de behandlar uppgifterna i enlighet med GDPR.

OpenAI har bekräftat att data som skickas via deras API **inte används för att träna deras modeller** (default-inställning som vi använder).

---

## 7. Överföring till länder utanför EU/EES

Eftersom flera av våra leverantörer är USA-baserade förekommer överföring av personuppgifter till tredjeland. Detta sker med skyddsåtgärder enligt artikel 46 GDPR — primärt **Standardklausuler (SCC)** i biträdesavtalen.

---

## 8. Hur länge vi sparar uppgifterna

| Datatyp | Lagringstid |
|---|---|
| Konto | Tills du raderar kontot, eller efter **24 månaders inaktivitet** (du får varningsmail innan radering) |
| Sessioner, chattar, feedback | Hängs på kontot — raderas när konto eller enskild session raderas |
| Betalningshistorik (hos Stripe) | **7 år** — krävs enligt Bokföringslagen, kan inte raderas tidigare |
| Tekniska loggar | 30-90 dagar (auto-rotation hos Vercel) |
| Acceptansloggar (att du accepterat villkor) | Tills kontot raderas |

> **Viktigt:** Om du raderar ditt konto raderas alla dina chattar, sessioner och feedback. Däremot finns dina betalningar kvar hos Stripe i upp till 7 år enligt svensk bokföringslag — det är ett lagkrav vi inte kan kringgå.

---

## 9. Dina rättigheter

Enligt GDPR har du rätt att:

- **Få tillgång** till dina personuppgifter (artikel 15)
- **Rätta** felaktiga uppgifter (artikel 16)
- **Bli raderad** ("rätten att bli bortglömd") (artikel 17)
- **Begränsa** behandlingen (artikel 18)
- **Få ut dina uppgifter** i ett maskinläsbart format (artikel 20)
- **Invända** mot behandling som baseras på berättigat intresse (artikel 21)
- **Återkalla samtycke** för marknadsföringsmail eller annan samtyckesbaserad behandling

### Hur du utnyttjar dina rättigheter

- **Radera enskild session:** klicka på "Radera"-knappen i `/sessions` *(under utveckling — tills dess: mejla privacy@diagnostika.se)*
- **Radera hela kontot:** under `/settings` → "Radera mitt konto" *(under utveckling — tills dess: mejla privacy@diagnostika.se)*
- **Exportera mina data:** under `/settings` → "Exportera data" *(under utveckling — tills dess: mejla privacy@diagnostika.se)*
- **Övriga frågor och förfrågningar:** privacy@diagnostika.se

Vi besvarar förfrågningar inom **30 dagar** (i komplexa fall kan svar dröja upp till 90 dagar enligt artikel 12.3 — du informeras då).

### Klagomål till tillsynsmyndighet

Du har rätt att klaga hos **Integritetsskyddsmyndigheten (IMY)** om du anser att vi behandlar dina uppgifter i strid med GDPR.
- Hemsida: [imy.se](https://imy.se)
- Telefon: 08-657 61 00
- E-post: imy@imy.se

---

## 10. AI och automatiserade beslut

Diagnostika använder AI på två sätt:
1. **AI-patienten** i chatten genereras av en språkmodell (OpenAI GPT)
2. **Feedback och poäng** efter en inlämning beräknas med hjälp av samma typ av modell

Den feedback du får är **endast träningsåterkoppling** och utgör inte ett automatiserat beslut i den meningen som artikel 22 GDPR avser. Poängen påverkar inte din anställning, antagning, betyg eller andra rättigheter.

Vi rekommenderar att du **inte** förlitar dig på AI-feedback för formell bedömning.

---

## 11. Säkerhet

Vi vidtar tekniska och organisatoriska åtgärder för att skydda dina uppgifter:
- All trafik krypteras (HTTPS/TLS)
- Databasen ligger i EU och är skyddad av Row-Level Security (RLS) — du kan endast se dina egna data
- Endast servern har åtkomst till vår databas via en serviceringsnyckel som aldrig exponeras i webbläsaren
- Begränsad intern åtkomst — endast administratörer av plattformen har behörighet, och då endast för support eller felsökning

Om en personuppgiftsincident skulle inträffa anmäler vi det till IMY inom 72 timmar och informerar dig om det finns hög risk för dina rättigheter (artikel 33-34 GDPR).

---

## 12. Cookies

Diagnostika använder för närvarande **endast tekniskt nödvändiga cookies** — främst sessionscookies för inloggning (hanteras av Clerk).

Vi använder **inte**:
- Marknadsföringscookies
- Analytics-cookies
- Cookies från tredje part för spårning

Om vi i framtiden inför analytics eller andra icke-nödvändiga cookies kommer du att få samtycka först via en cookie-banner.

---

## 13. Ändringar i policyn

Vi kan komma att uppdatera denna policy — t.ex. om vi byter leverantör, lägger till funktioner eller om lagstiftningen ändras.

Vid **väsentliga** ändringar:
- Du informeras via e-post
- Du ombeds acceptera den nya versionen vid nästa inloggning

Mindre redaktionella ändringar (stavning, förtydliganden) görs utan separat avisering — men datumet för "Senast uppdaterad" ovan ändras alltid.

---

## 14. Kontakt

Frågor om denna policy eller hur vi hanterar dina uppgifter:

**privacy@diagnostika.se**

---

## Versioner

| Version | Datum | Sammanfattning |
|---|---|---|
| 1.0 | 2026-05-07 | Första version inför beta-launch |
