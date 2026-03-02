const STATS = [
  { value: "10,000+", label: "Cases Practiced" },
  { value: "95%", label: "Student Satisfaction" },
  { value: "50+", label: "Medical Specialties" },
  { value: "24/7", label: "Available Anytime" },
] as const;

export default function SocialProofSection() {
  return (
    <section aria-labelledby="social-proof-heading" className="px-6 py-20 lg:px-8 lg:py-28">
      <div className="mx-auto max-w-7xl">
        <h2 id="social-proof-heading" className="sr-only">
          Platform Statistics
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
      "MedSim AI transformed how I approach patient interviews. The feedback on missed findings is incredibly valuable.",
    name: "Sarah Chen",
    role: "4th Year Medical Student",
  },
  {
    quote:
      "I use it daily to practice rare cases I'd never see in my rotation. The AI patients feel surprisingly real.",
    name: "Marcus Johnson",
    role: "Internal Medicine Resident",
  },
  {
    quote:
      "As an instructor, the analytics dashboard helps me identify where my students struggle most.",
    name: "Dr. Emily Torres",
    role: "Clinical Instructor, NYU",
  },
] as const;
