const STATS = [
  { value: "10 000+", label: "Genomförda fall" },
  { value: "95%", label: "Studentnöjdhet" },
  { value: "50+", label: "Medicinska specialiteter" },
  { value: "24/7", label: "Alltid tillgänglig" },
] as const;

export default function SocialProofSection() {
  return (
    <section aria-labelledby="social-proof-heading" className="px-6 py-20 lg:px-8 lg:py-28">
      <div className="mx-auto max-w-7xl">
        <h2 id="social-proof-heading" className="sr-only">
          Plattformsstatistik
        </h2>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
          {STATS.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
                {stat.value}
              </p>
              <p className="mt-2 text-sm font-medium text-slate-500">
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        {/* Testimonials */}
        <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3 lg:mt-20">
          {TESTIMONIALS.map((testimonial) => (
            <blockquote
              key={testimonial.name}
              className="rounded-3xl border border-slate-100 bg-white p-8"
            >
              <p className="mb-6 leading-relaxed text-slate-600">
                &ldquo;{testimonial.quote}&rdquo;
              </p>
              <footer className="flex items-center gap-3">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-100 text-sm font-bold text-teal-700"
                  aria-hidden="true"
                >
                  {testimonial.name[0]}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">{testimonial.name}</p>
                  <p className="text-xs text-slate-500">{testimonial.role}</p>
                </div>
              </footer>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}

const TESTIMONIALS = [
  {
    quote:
      "MedSim AI förändrade hur jag närmar mig patientintervjuer. Feedbacken på missade fynd är otroligt värdefull.",
    name: "Sara Lindqvist",
    role: "Läkarstudent, termin 10",
  },
  {
    quote:
      "Jag använder det dagligen för att öva på sällsynta fall jag aldrig skulle se under min placering. AI-patienterna känns förvånansvärt verkliga.",
    name: "Marcus Johansson",
    role: "AT-läkare, internmedicin",
  },
  {
    quote:
      "Som handledare hjälper analyspanelen mig att identifiera var mina studenter har svårast.",
    name: "Dr. Emma Bergström",
    role: "Klinisk handledare, Karolinska",
  },
] as const;
