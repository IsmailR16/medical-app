# Diagnostika — Intended Use Statement

**Status:** Source-of-truth för hur Diagnostika ska beskrivas i alla användartexter (landing, signup, Terms, Privacy Policy, in-app disclaimers, marknadsföring).
**Senast uppdaterad:** 2026-05-03
**Version:** 1.0

---

## Kort definition (1 mening — för subtitles, hero, meta description)

> Diagnostika är ett utbildningsverktyg där läkarstudenter övar kliniskt resonemang genom samtal med AI-patienter i fiktiva patientfall.

## Lång definition (3-5 meningar — för Terms, Privacy Policy, About-sida)

> Diagnostika är en utbildningstjänst som hjälper läkarstudenter att öva anamnesupptagning, kliniskt resonemang och beslutsfattande genom samtal med AI-patienter i fiktiva, AI-genererade patientfall. Tjänsten är utformad för **självständig träning och övning** och tillhandahåller övningsfeedback baserad på OSCE-liknande kriterier.
>
> Diagnostika **är inte** ett medicintekniskt instrument, ett kliniskt beslutsstöd eller ett verktyg för medicinsk rådgivning. Tjänsten ska inte användas för att fatta beslut om verkliga patienter, för formell examination, kursbedömning eller för att ersätta klinisk handledning.

---

## Standardfraser för UI

Använd ordagrant — variera inte formuleringen.

### Hero / landing page (under primary heading)

> Träna kliniskt resonemang i samtal med AI-patienter — en utbildningstjänst för läkarstudenter.

### Signup-acceptansrutan

> Jag förstår att Diagnostika är en utbildningstjänst med fiktiva patientfall, **inte** ett kliniskt beslutsstöd eller verktyg för verkliga patienter.

### Onboarding-modal innan första case

> **Detta är en utbildningssimulering.**
>
> Patienten du samtalar med är en AI-patient i ett fiktivt patientfall. Skriv aldrig in:
> - Namn, personnummer eller andra identifierande uppgifter om verkliga personer
> - Information från riktiga journaler eller VFU-patienter
> - Hälsouppgifter om verkliga personer (även dig själv eller anhöriga)
>
> Bedömning och feedback är endast träningsåterkoppling och får inte användas för formell examination.

### Persistent disclaimer (chat-panelens fot)

> Endast fiktiva fall. Skriv aldrig in riktiga patientuppgifter.

### Footer (alla sidor)

> Diagnostika är en utbildningstjänst — inte medicinsk rådgivning eller kliniskt beslutsstöd.

---

## Fraser att UNDVIKA

Dessa formuleringar kan tolkas som att produkten är ett medicintekniskt instrument eller kliniskt beslutsstöd:

- ❌ "AI som hjälper dig att ställa diagnos"
- ❌ "Få diagnos på minuter"
- ❌ "Kliniskt beslutsstöd för läkare"
- ❌ "Träna inför patientmöten" *(implicerar verkliga patienter)*
- ❌ "Diagnostiskt verktyg"
- ❌ "AI som diagnostiserar"
- ❌ "Säker bedömning av symtom"

### Använd istället

- ✅ "AI-simulerade patientfall för utbildning"
- ✅ "Öva kliniskt resonemang"
- ✅ "Träna anamnesupptagning"
- ✅ "Öva differentialdiagnostik" *(verb: öva, träna, simulera)*
- ✅ "Övningsfeedback" / "Träningsåterkoppling"

---

## Användningskontext (viktigt för AI Act)

Diagnostika är just nu positionerat som **självständigt övningsverktyg för individer**, inte som:

- Formell examination
- Kursbedömning
- Antagningsbeslut
- Underlag för betyg

Om vi i framtiden bygger funktioner för lärare/institutioner att använda data för formell bedömning → trigger för förnyad juridisk granskning (potentiell högrisk-AI under AI Act Annex III).

---

## Hur dokumentet används

- **Marknadsföring (landing, copy, ads):** kopiera kort eller lång definition + använd "Standardfraser för UI"
- **Terms of Service:** inkludera "Lång definition" som §1 (Tjänstens omfattning)
- **Privacy Policy:** inkludera kort definition i inledningen
- **In-app:** kopiera UI-fraserna ordagrant
- **Med-grundare/teammedlemmar:** läs detta innan du skriver något användartext

Versionshantera detta dokument — om definitionen ändras, uppdatera versionsnummer + datum, och re-acceptera Terms från användarna om ändringen är väsentlig.
