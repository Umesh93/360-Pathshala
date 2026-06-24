import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  ClipboardCheck,
  GraduationCap,
  BarChart3,
  MessageSquare,
  Calendar,
  CreditCard,
  BookOpen,
  Bus,
  Library,
  FileText,
  Shield,
  Bell,
  ArrowRight,
} from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";

export const Route = createFileRoute("/features")({
  head: () => ({
    meta: [
      { title: "Features — 360 Pathshala Student Management System" },
      {
        name: "description",
        content:
          "Explore every module of 360 Pathshala: attendance, grades, results, fees, communication, library, transport, and more — fully modular.",
      },
      { property: "og:title", content: "Features — 360 Pathshala" },
      {
        property: "og:description",
        content: "Modular features for modern schools — pay only for what you use.",
      },
    ],
  }),
  component: FeaturesPage,
});

const modules = [
  {
    icon: ClipboardCheck,
    title: "Attendance Management",
    desc: "Daily attendance with biometric or manual entry. Auto-notifications to parents.",
  },
  {
    icon: GraduationCap,
    title: "Grades & Examinations",
    desc: "Configure exam patterns, grading scales, internal & external marks.",
  },
  {
    icon: FileText,
    title: "Result Publishing",
    desc: "Generate marksheets and report cards. Publish results with one click.",
  },
  {
    icon: BookOpen,
    title: "Assignments & Homework",
    desc: "Teachers create, share and grade assignments — students submit online.",
  },
  {
    icon: Calendar,
    title: "Timetable & Scheduling",
    desc: "Smart class scheduling with automatic conflict detection.",
  },
  {
    icon: MessageSquare,
    title: "Communication Hub",
    desc: "Direct messaging, announcements and notices for all stakeholders.",
  },
  {
    icon: BarChart3,
    title: "Analytics & Reports",
    desc: "Real-time dashboards on attendance, performance and engagement.",
  },
  {
    icon: CreditCard,
    title: "Fees & Billing",
    desc: "Fee structure, online payments, receipts and dues tracking.",
  },
  {
    icon: Library,
    title: "Library Management",
    desc: "Catalog books, manage issues/returns and track member activity.",
  },
  {
    icon: Bus,
    title: "Transport Management",
    desc: "Routes, stops, vehicle assignments and driver records.",
  },
  {
    icon: Bell,
    title: "Notifications",
    desc: "SMS, email & in-app push for everything that matters.",
  },
  {
    icon: Shield,
    title: "Role-Based Access",
    desc: "Granular permissions for super admin, school admin, teachers, students, parents.",
  },
];

function FeaturesPage() {
  return (
    <SiteLayout>
      <section className="bg-gradient-hero  flex justify-center items-center">
        {/* <div className="mx-auto max-w-[100vh] px-6 py-20 text-center lg:px-10 lg:py-28"> */}
        <div>
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
            Features
          </span>
          <h1 className="font-display text-5xl font-extrabold leading-tight text-foreground sm:text-6xl flex flex-col">
            A complete <span className="text-gradient-accent">modular</span> toolkit for schools.
          </h1>
          <p className="max-w-xl mt-6 text-lg text-muted-foreground">
            Every module is independent. Activate only what your institution needs — scale up
            anytime.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-10">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {modules.map((m, i) => (
            <motion.div
              key={m.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.45, delay: (i % 3) * 0.06 }}
              className="group rounded-2xl border border-border bg-card p-7 shadow-soft transition-all hover:-translate-y-1 hover:border-accent/40 hover:shadow-elevated"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-soft text-primary transition-colors group-hover:bg-accent-soft group-hover:text-accent">
                <m.icon className="h-6 w-6" />
              </div>
              <h3 className="mt-5 font-display text-xl font-bold text-foreground">{m.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{m.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="px-6 pb-24 lg:px-10">
        <div className="relative mx-auto max-w-6xl overflow-hidden rounded-3xl bg-gradient-brand p-10 text-center shadow-elevated md:p-16">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-accent/30 blur-3xl" />
          <h2 className="relative font-display text-4xl font-extrabold text-white">
            Pick your modules. We'll handle the rest.
          </h2>
          <p className="relative mx-auto mt-4 max-w-xl text-primary-foreground/80">
            Tell us your school's needs in a 30-minute demo and we'll tailor the right setup.
          </p>
          <Link
            to="/demo"
            className="relative mt-8 inline-flex items-center gap-2 rounded-full bg-accent px-7 py-3.5 text-sm font-semibold text-accent-foreground shadow-glow"
          >
            Book a Demo <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </SiteLayout>
  );
}
