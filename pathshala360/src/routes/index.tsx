import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Users,
  GraduationCap,
  ClipboardCheck,
  BarChart3,
  MessageSquare,
  Shield,
  Layers,
  Award,
} from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "360 Pathshala — A 360° Student Management System for Modern Schools" },
      {
        name: "description",
        content:
          "Streamline academic administration with 360 Pathshala. Modular features for attendance, grades, results, and seamless teacher–student–parent communication.",
      },
      { property: "og:title", content: "360 Pathshala — A 360° Student Management System" },
      {
        property: "og:description",
        content:
          "Modular Student Management System bringing modern tech to traditional Pathshala learning.",
      },
    ],
  }),
  component: HomePage,
});

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const } },
};

const features = [
  {
    icon: ClipboardCheck,
    title: "Attendance",
    desc: "Real-time digital attendance with instant parent notifications.",
  },
  {
    icon: GraduationCap,
    title: "Grades & Results",
    desc: "Publish results, generate marksheets and report cards in one click.",
  },
  {
    icon: BarChart3,
    title: "Academic Insights",
    desc: "Live dashboards for student performance and class analytics.",
  },
  {
    icon: MessageSquare,
    title: "Communication",
    desc: "Built-in messaging connecting teachers, students and parents.",
  },
  {
    icon: Layers,
    title: "Modular by Design",
    desc: "Activate only the modules your school needs — pay for what you use.",
  },
  {
    icon: Shield,
    title: "Secure & Reliable",
    desc: "Role-based access, encrypted data and a privacy-first architecture.",
  },
];

const steps = [
  {
    n: "01",
    title: "Super Admin enables modules",
    desc: "Our team activates only the features your institution has subscribed to.",
  },
  {
    n: "02",
    title: "School is assigned as Admin",
    desc: "Each school receives admin access via secure email invitation.",
  },
  {
    n: "03",
    title: "Add teachers, students, parents",
    desc: "School admin configures users, classes and the academic structure.",
  },
  {
    n: "04",
    title: "Teach, track, publish results",
    desc: "Daily operations and result publishing happen seamlessly inside one platform.",
  },
];

function HomePage() {
  return (
    <SiteLayout>
      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-hero">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-6 pb-20 pt-16 lg:grid-cols-2 lg:gap-16 lg:px-10 lg:pt-24">
          <motion.div initial="hidden" animate="show" variants={fadeUp}>
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-xs font-medium text-foreground/70 shadow-soft">
              <Sparkles className="h-3.5 w-3.5 text-accent" />A 360° Student Management System
            </span>
            <h1 className="mt-6 font-display text-5xl font-extrabold leading-[1.05] tracking-tight text-foreground sm:text-6xl lg:text-7xl">
              Where tradition meets <span className="text-gradient-accent">modern learning</span>.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
              360 Pathshala digitizes every part of academic life — from attendance and assignments
              to results and communication — through a single, beautiful, modular platform.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                to="/demo"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-brand transition-transform hover:scale-[1.03]"
              >
                Book a Free Demo <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/features"
                className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
              >
                Explore Features
              </Link>
            </div>
            <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3 text-sm text-muted-foreground">
              {["No setup fees", "Modular pricing", "Made for South Asian schools"].map((p) => (
                <div key={p} className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-accent" />
                  {p}
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, ease: "easeOut", delay: 0.15 }}
            className="relative"
          >
            <div className="absolute -inset-6 -z-10 rounded-[2.5rem] bg-gradient-brand opacity-20 blur-3xl" />
            <div className="rounded-3xl border border-border bg-card p-2 shadow-elevated">
              <div className="rounded-2xl bg-gradient-soft p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Class 8-A · Today</p>
                    <h3 className="mt-1 font-display text-xl font-bold text-foreground">
                      Daily Snapshot
                    </h3>
                  </div>
                  <span className="rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold text-accent">
                    Live
                  </span>
                </div>

                <div className="mt-6 grid grid-cols-3 gap-3">
                  {[
                    { label: "Present", value: "42", tone: "text-primary" },
                    { label: "Absent", value: "3", tone: "text-accent" },
                    { label: "Avg. score", value: "87%", tone: "text-primary" },
                  ].map((s) => (
                    <div key={s.label} className="rounded-xl border border-border bg-card p-4">
                      <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                        {s.label}
                      </p>
                      <p className={`mt-1 font-display text-2xl font-bold ${s.tone}`}>{s.value}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-6 space-y-3">
                  {[
                    { name: "Aarav Sharma", note: "Math · 95/100", icon: Award },
                    {
                      name: "Sita Karki",
                      note: "Submitted Science assignment",
                      icon: ClipboardCheck,
                    },
                    {
                      name: "Parents · 12 messages",
                      note: "PTM scheduled · Friday 4 PM",
                      icon: MessageSquare,
                    },
                  ].map((r) => (
                    <div
                      key={r.name}
                      className="flex items-center gap-3 rounded-xl border border-border bg-card p-3"
                    >
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-soft text-primary">
                        <r.icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-foreground">{r.name}</p>
                        <p className="truncate text-xs text-muted-foreground">{r.note}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* STATS */}
      <section className="border-y border-border bg-surface">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-6 py-12 md:grid-cols-4 lg:px-10">
          {[
            { v: "360°", l: "Coverage" },
            { v: "10+", l: "Modules" },
            { v: "4", l: "User roles" },
            { v: "24/7", l: "Cloud access" },
          ].map((s) => (
            <div key={s.l}>
              <p className="font-display text-4xl font-extrabold text-gradient-brand">{s.v}</p>
              <p className="mt-1 text-sm text-muted-foreground">{s.l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section className="mx-auto max-w-7xl px-6 py-24 lg:px-10">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
            Features
          </span>
          <h2 className="mt-3 font-display text-4xl font-bold text-foreground sm:text-5xl">
            Everything an institution needs.
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Carefully crafted modules that work beautifully on their own — and even better together.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
              className="group rounded-2xl border border-border bg-card p-7 shadow-soft transition-all hover:-translate-y-1 hover:border-accent/40 hover:shadow-elevated"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-soft text-primary transition-colors group-hover:bg-accent-soft group-hover:text-accent">
                <f.icon className="h-6 w-6" />
              </div>
              <h3 className="mt-5 font-display text-xl font-bold text-foreground">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="bg-surface">
        <div className="mx-auto max-w-7xl px-6 py-24 lg:px-10">
          <div className="grid gap-12 lg:grid-cols-[1fr_1.4fr] lg:gap-16">
            <div>
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
                How it works
              </span>
              <h2 className="mt-3 font-display text-4xl font-bold text-foreground sm:text-5xl">
                A modular system, set up in minutes.
              </h2>
              <p className="mt-5 text-muted-foreground">
                360 Pathshala follows a clean role-based flow. Super Admin enables paid modules,
                schools manage users, and everyone else just teaches and learns.
              </p>
              <Link
                to="/demo"
                className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-brand"
              >
                Book a Demo <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <ol className="space-y-4">
              {steps.map((s, i) => (
                <motion.li
                  key={s.n}
                  initial={{ opacity: 0, x: 24 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                  className="flex gap-5 rounded-2xl border border-border bg-card p-6 shadow-soft"
                >
                  <span className="font-display text-3xl font-extrabold text-gradient-accent">
                    {s.n}
                  </span>
                  <div>
                    <h3 className="font-display text-lg font-bold text-foreground">{s.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{s.desc}</p>
                  </div>
                </motion.li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* ROLES */}
      <section className="mx-auto max-w-7xl px-6 py-24 lg:px-10">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
            Built for everyone
          </span>
          <h2 className="mt-3 font-display text-4xl font-bold text-foreground sm:text-5xl">
            One platform. Four perspectives.
          </h2>
        </div>

        <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {[
            {
              icon: Shield,
              role: "Super Admin",
              desc: "Activates modules per school subscription and onboards new institutions.",
            },
            {
              icon: Users,
              role: "School Admin",
              desc: "Manages teachers, students, parents and overall academic structure.",
            },
            {
              icon: GraduationCap,
              role: "Teacher",
              desc: "Marks attendance, grades assignments, and publishes results with ease.",
            },
            {
              icon: Award,
              role: "Student & Parent",
              desc: "Tracks performance, results, and stays connected with the school.",
            },
          ].map((r, i) => (
            <motion.div
              key={r.role}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.06 }}
              className="rounded-2xl border border-border bg-card p-6 shadow-soft"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-accent text-accent-foreground shadow-glow">
                <r.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-5 font-display text-lg font-bold text-foreground">{r.role}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{r.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* TESTIMONIAL */}
      <section className="bg-surface">
        <div className="mx-auto max-w-5xl px-6 py-24 text-center lg:px-10">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
            Loved by educators
          </span>
          <blockquote className="mt-6 font-display text-3xl font-medium leading-snug text-foreground sm:text-4xl">
            “360 Pathshala feels like the school itself was redesigned around clarity. Our teachers
            spend less time on paperwork and more time teaching.”
          </blockquote>
          <div className="mt-8 flex items-center justify-center gap-3 text-sm text-muted-foreground">
            <div className="h-10 w-10 rounded-full bg-gradient-brand" />
            <div className="text-left">
              <p className="font-semibold text-foreground">Principal Sharma</p>
              <p>Himalayan Public School</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 pb-24 pt-12 lg:px-10">
        <div className="relative mx-auto max-w-6xl overflow-hidden rounded-3xl bg-gradient-brand p-10 shadow-elevated md:p-16">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-accent/30 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

          <div className="relative flex flex-col items-center justify-center text-center">
            <h2 className="font-display text-4xl font-extrabold text-primary-foreground sm:text-5xl">
              Ready to digitize your school?
            </h2>

            <p className="mt-4 max-w-xl text-primary-foreground/80">
              Schedule a personalized demo and see how 360 Pathshala fits your institution — only
              the modules you need, nothing more.
            </p>

            <Link
              to="/demo"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-accent px-7 py-3.5 text-sm font-semibold text-accent-foreground shadow-glow transition-transform hover:scale-[1.04]"
            >
              Book Your Free Demo <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
