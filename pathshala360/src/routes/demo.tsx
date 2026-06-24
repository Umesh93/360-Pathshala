import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CheckCircle2, ArrowRight, Sparkles } from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";

export const Route = createFileRoute("/demo")({
  head: () => ({
    meta: [
      { title: "Book a Demo — 360 Pathshala Student Management System" },
      {
        name: "description",
        content:
          "Schedule a free, personalized 30-minute demo of 360 Pathshala for your school or college. See modules tailored to your needs.",
      },
      { property: "og:title", content: "Book a Free Demo — 360 Pathshala" },
      {
        property: "og:description",
        content: "Personalized demos for schools and colleges. No commitment.",
      },
    ],
  }),
  component: DemoPage,
});

const moduleOptions = [
  "Attendance",
  "Grades & Exams",
  "Result Publishing",
  "Assignments",
  "Timetable",
  "Communication",
  "Fees & Billing",
  "Library",
  "Transport",
  "Analytics",
];

function DemoPage() {
  const [submitted, setSubmitted] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);

  const toggle = (m: string) =>
    setSelected((prev) => (prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <SiteLayout>
      <section className="bg-gradient-hero">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-10 lg:py-24">
          <div className="grid gap-12 lg:grid-cols-[1fr_1.2fr] lg:gap-16">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-xs font-medium text-foreground/70 shadow-soft">
                <Sparkles className="h-3.5 w-3.5 text-accent" />
                Free 30-min demo
              </span>
              <h1 className="mt-6 font-display text-5xl font-extrabold leading-tight text-foreground sm:text-6xl">
                See 360 Pathshala in <span className="text-gradient-accent">action</span>.
              </h1>
              <p className="mt-5 text-lg text-muted-foreground">
                Tell us a little about your institution and we'll set up a tailored walkthrough of
                the modules that matter most to you.
              </p>
              <ul className="mt-8 space-y-3 text-sm text-foreground/80">
                {[
                  "Personalized to your school's size and needs",
                  "See modular pricing — pay only for what you use",
                  "Live Q&A with our product team",
                ].map((t) => (
                  <li key={t} className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
                    {t}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-3xl border border-border bg-card p-6 shadow-elevated md:p-8">
              {submitted ? (
                <div className="flex h-full flex-col items-center justify-center py-12 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent-soft text-accent">
                    <CheckCircle2 className="h-8 w-8" />
                  </div>
                  <h2 className="mt-6 font-display text-3xl font-bold text-foreground">
                    Request received!
                  </h2>
                  <p className="mt-3 max-w-sm text-muted-foreground">
                    Thank you. Our team will reach out within one business day to schedule your
                    personalized demo.
                  </p>
                  <button
                    onClick={() => {
                      setSubmitted(false);
                      setSelected([]);
                    }}
                    className="mt-8 inline-flex items-center gap-2 rounded-full border border-border bg-background px-5 py-2.5 text-sm font-semibold text-foreground hover:bg-secondary"
                  >
                    Submit another request
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field
                      label="School / Institution"
                      name="school"
                      required
                      placeholder="Himalayan Public School"
                    />
                    <Field label="Your name" name="name" required placeholder="Anita Karki" />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field
                      label="Email"
                      type="email"
                      name="email"
                      required
                      placeholder="you@school.edu.np"
                    />
                    <Field label="Phone" name="phone" required placeholder="+977 98-XXXXXXXX" />
                  </div>
                  <Field label="Role" name="role" placeholder="Principal, IT head, owner…" />

                  <div>
                    <label className="text-sm font-semibold text-foreground">
                      Modules of interest
                    </label>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Pick everything you'd like to explore.
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {moduleOptions.map((m) => {
                        const active = selected.includes(m);
                        return (
                          <button
                            key={m}
                            type="button"
                            onClick={() => toggle(m)}
                            className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all ${
                              active
                                ? "border-accent bg-accent text-accent-foreground shadow-soft"
                                : "border-border bg-background text-foreground/70 hover:border-accent/50"
                            }`}
                          >
                            {m}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="msg" className="text-sm font-semibold text-foreground">
                      Anything else?
                    </label>
                    <textarea
                      id="msg"
                      name="message"
                      rows={3}
                      placeholder="Number of students, current setup, preferred demo time…"
                      className="mt-2 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-ring"
                    />
                  </div>

                  <button
                    type="submit"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-brand px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-brand transition-transform hover:scale-[1.01]"
                  >
                    Request my demo <ArrowRight className="h-4 w-4" />
                  </button>
                  <p className="text-center text-xs text-muted-foreground">
                    By submitting, you agree to be contacted by the 360 Pathshala team about your
                    request.
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  placeholder,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className="text-sm font-semibold text-foreground">
        {label} {required && <span className="text-accent">*</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        className="mt-2 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-ring"
      />
    </div>
  );
}
