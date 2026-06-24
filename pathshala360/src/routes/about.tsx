import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Heart, Lightbulb, Shield, Users, ArrowRight } from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About 360 Pathshala — Our Story & Mission" },
      { name: "description", content: "360 Pathshala blends the soul of traditional Pathshala learning with modern technology to empower schools, teachers, students and parents." },
      { property: "og:title", content: "About 360 Pathshala" },
      { property: "og:description", content: "Tradition meets technology — building the future of academic administration." },
    ],
  }),
  component: AboutPage,
});

const values = [
  { icon: Heart, title: "Education-first", desc: "We design for teachers and learners — not just administrators." },
  { icon: Lightbulb, title: "Simple by design", desc: "Powerful features wrapped in interfaces anyone can use." },
  { icon: Shield, title: "Privacy & trust", desc: "Student data is sacred. We treat it that way, end to end." },
  { icon: Users, title: "Community-rooted", desc: "Built for South Asian schools, shaped by their feedback." },
];

function AboutPage() {
  return (
    <SiteLayout>
      <section className="bg-gradient-hero">
        <div className="mx-auto max-w-4xl px-6 py-20 text-center lg:px-10 lg:py-28">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">About us</span>
          <h1 className="mt-4 font-display text-5xl font-extrabold leading-tight text-foreground sm:text-6xl">
            The soul of <span className="text-gradient-accent">Pathshala</span>, reimagined.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            360 Pathshala was born from a simple belief — that every school, no matter how small, deserves modern tools that respect its tradition and amplify its mission.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-20 lg:px-10">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <h2 className="font-display text-3xl font-bold text-foreground">Our story</h2>
            <p className="mt-5 leading-relaxed text-muted-foreground">
              We watched dedicated teachers drown in paperwork and parents struggle to stay informed. Schools wanted technology — but most platforms were built for somewhere else, in someone else's voice.
            </p>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              So we built 360 Pathshala — a Student Management System rooted in our culture, modular for our schools, and beautiful enough to actually love using.
            </p>
          </div>
          <div>
            <h2 className="font-display text-3xl font-bold text-foreground">Our mission</h2>
            <p className="mt-5 leading-relaxed text-muted-foreground">
              To give every educational institution — from village schools to urban colleges — a single, elegant platform that handles administration so educators can focus on what truly matters: teaching.
            </p>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              Modular. Affordable. Honest. That's how we ship.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-surface">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10">
          <h2 className="text-center font-display text-4xl font-bold text-foreground">What we value</h2>
          <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {values.map((v, i) => (
              <motion.div
                key={v.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: i * 0.06 }}
                className="rounded-2xl border border-border bg-card p-6 shadow-soft"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent-soft text-accent">
                  <v.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-5 font-display text-lg font-bold text-foreground">{v.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-20 lg:px-10">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-display text-4xl font-bold text-foreground">See it for yourself.</h2>
          <p className="mt-4 text-muted-foreground">A 30-minute demo is the quickest way to feel the difference.</p>
          <Link
            to="/demo"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-brand"
          >
            Book a Demo <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </SiteLayout>
  );
}
