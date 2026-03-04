import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface CaseContext {
  description: string;
  patient_name: string;
  patient_age: number;
  patient_gender: string;
  patient_background: string;
  presenting_complaint: string;
  hidden_diagnosis: string;
  differential_diagnoses: string[];
  vitals: Record<string, unknown>;
  lab_results: Record<string, unknown>;
  imaging: Record<string, unknown>;
  physical_exam: Record<string, unknown>;
  medications: string[];
  system_prompt_extra: string | null;
}

export interface ConversationMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

/* ------------------------------------------------------------------ */
/*  System prompt builder                                              */
/* ------------------------------------------------------------------ */

function buildSystemPrompt(c: CaseContext): string {
  const genderLabel = c.patient_gender === "male" ? "man" : "kvinna";

  return `Du är en AI-simulerad patient vid namn ${c.patient_name}, en ${c.patient_age}-årig ${genderLabel}.
Du befinner dig i en medicinsk träningssimulering där en läkarstudent intervjuar dig.

BAKGRUND (dold från studenten — använd detta för att svara realistiskt):
- Fallbeskrivning: ${c.description}
- Bakgrundshistorik: ${c.patient_background}
- Sökorsak: ${c.presenting_complaint}
- Korrekt diagnos: ${c.hidden_diagnosis}
- Differentialdiagnoser: ${c.differential_diagnoses.length > 0 ? c.differential_diagnoses.join(", ") : "Inga"}
- Aktuella mediciner: ${c.medications.length > 0 ? c.medications.join(", ") : "Inga"}

KLINISKA DATA (avslöja BARA om studenten specifikt frågar om det relevanta):
- Vitala parametrar: ${JSON.stringify(c.vitals)}
- Laboratorieprover: ${JSON.stringify(c.lab_results)}
- Bilddiagnostik: ${JSON.stringify(c.imaging)}
- Fysikaliska fynd: ${JSON.stringify(c.physical_exam)}

REGLER:
1. Svara ALLTID på svenska.
2. Svara som patienten — inte som läkare. Använd vardagligt, patientvänligt språk.
3. Berätta inte diagnosen eller medicinsk terminologi spontant — du är patienten, inte doktorn.
4. Avslöja symtom och detaljer gradvis. Ge inte all information på en gång.
5. Om studenten frågar om specifika undersökningar (blodtryck, labbprover, röntgen etc.), ge resultaten naturligt som om du vet vad dina provresultat visar.
6. Visa känslor och oro som en riktig patient — du kan vara orolig, frustrerad eller lättad.
7. Håll svaren relativt korta (1-3 meningar) om inte studenten ber dig utveckla.
8. Hitta aldrig på information som inte finns i din bakgrund. Om du inte vet, säg att du inte vet.
9. Avslöja ALDRIG att du är en AI. Du är alltid ${c.patient_name}.
${c.system_prompt_extra ? `\nEXTRA INSTRUKTIONER: ${c.system_prompt_extra}` : ""}
10. Du är INTE en assistent. Säg ALDRIG saker som "Hur kan jag hjälpa dig?", "Vad kan jag göra för dig?" eller liknande. Du är en patient som har sökt vård — det är LÄKAREN (studenten) som hjälper DIG, inte tvärtom.
11. Du har kommit till läkaren på grund av dina besvär. Om studenten hälsar, hälsa tillbaka naturligt och berätta kort varför du söker vård, t.ex. "Hej doktorn, jag har haft ${c.presenting_complaint.toLowerCase()} och ville kolla upp det."
12. Var i karaktär hela tiden. Du är orolig, nervös eller besvärad av dina symtom — inte hjälpsam och serviceinriktad.`;
}

/* ------------------------------------------------------------------ */
/*  Generate patient response                                          */
/* ------------------------------------------------------------------ */

export async function generatePatientResponse(
  caseContext: CaseContext,
  conversationHistory: ConversationMessage[]
): Promise<string> {
  const systemPrompt = buildSystemPrompt(caseContext);

  const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
    { role: "system", content: systemPrompt },
    ...conversationHistory.map((m) => ({
      role: m.role as "user" | "assistant" | "system",
      content: m.content,
    })),
  ];

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages,
    max_tokens: 500,
    temperature: 0.7,
  });

  return (
    completion.choices[0]?.message?.content?.trim() ??
    "Jag förstår inte riktigt. Kan du fråga igen?"
  );
}

/* ------------------------------------------------------------------ */
/*  Generate evaluation                                                */
/* ------------------------------------------------------------------ */

export interface EvaluationResult {
  overall_score: number;
  history_taking_score: number;
  physical_exam_score: number;
  diagnosis_score: number;
  treatment_score: number;
  reasoning_score: number;
  summary: string;
  strengths: string[];
  improvements: string[];
  missed_findings: string[];
  diagnosis_correct: boolean;
}

export async function generateEvaluation(
  caseContext: CaseContext,
  conversationHistory: ConversationMessage[],
  studentDiagnosis: string,
  studentTreatment: string
): Promise<EvaluationResult> {
  const systemPrompt = `Du är en erfaren medicinsk examinator som utvärderar läkarstudenter.
Analysera följande patientintervju och studentens diagnos/behandlingsförslag.

KORREKT DIAGNOS: ${caseContext.hidden_diagnosis}
DIFFERENTIALDIAGNOSER: ${caseContext.differential_diagnoses.join(", ") || "Inga"}
PATIENTBAKGRUND: ${caseContext.patient_background}
VITALA PARAMETRAR: ${JSON.stringify(caseContext.vitals)}
LABORATORIEPROVER: ${JSON.stringify(caseContext.lab_results)}
BILDDIAGNOSTIK: ${JSON.stringify(caseContext.imaging)}
FYSIKALISKA FYND: ${JSON.stringify(caseContext.physical_exam)}
AKTUELLA MEDICINER: ${caseContext.medications.join(", ") || "Inga"}

STUDENTENS DIAGNOS: ${studentDiagnosis}
STUDENTENS BEHANDLINGSPLAN: ${studentTreatment}

Utvärdera studenten på följande kriterier (0-100 poäng varje):
1. history_taking_score — Hur väl tog studenten anamnes? Ställde de rätt frågor?
2. physical_exam_score — Efterfrågade studenten relevanta undersökningar?
3. diagnosis_score — Hur korrekt var diagnosen?
4. treatment_score — Hur adekvat var behandlingsplanen?
5. reasoning_score — Visar studenten logiskt kliniskt resonemang?

Svara ENBART i följande JSON-format (inget annat):
{
  "overall_score": <number 0-100>,
  "history_taking_score": <number 0-100>,
  "physical_exam_score": <number 0-100>,
  "diagnosis_score": <number 0-100>,
  "treatment_score": <number 0-100>,
  "reasoning_score": <number 0-100>,
  "summary": "<övergripande feedback på svenska, 2-3 meningar>",
  "strengths": ["<styrka 1>", "<styrka 2>"],
  "improvements": ["<förbättringsområde 1>", "<förbättringsområde 2>"],
  "missed_findings": ["<missat fynd 1>", "<missat fynd 2>"],
  "diagnosis_correct": <true/false>
}`;

  const conversationText = conversationHistory
    .map((m) => `${m.role === "user" ? "Student" : "Patient"}: ${m.content}`)
    .join("\n");

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: systemPrompt },
      {
        role: "user",
        content: `Här är hela intervjun:\n\n${conversationText}`,
      },
    ],
    max_tokens: 1000,
    temperature: 0.3,
    response_format: { type: "json_object" },
  });

  const raw = completion.choices[0]?.message?.content ?? "{}";
  const parsed = JSON.parse(raw);

  // Clamp scores to 0-100
  const clamp = (n: unknown) => Math.max(0, Math.min(100, Number(n) || 0));

  return {
    overall_score: clamp(parsed.overall_score),
    history_taking_score: clamp(parsed.history_taking_score),
    physical_exam_score: clamp(parsed.physical_exam_score),
    diagnosis_score: clamp(parsed.diagnosis_score),
    treatment_score: clamp(parsed.treatment_score),
    reasoning_score: clamp(parsed.reasoning_score),
    summary: String(parsed.summary ?? ""),
    strengths: Array.isArray(parsed.strengths)
      ? parsed.strengths.map(String)
      : [],
    improvements: Array.isArray(parsed.improvements)
      ? parsed.improvements.map(String)
      : [],
    missed_findings: Array.isArray(parsed.missed_findings)
      ? parsed.missed_findings.map(String)
      : [],
    diagnosis_correct: Boolean(parsed.diagnosis_correct),
  };
}
