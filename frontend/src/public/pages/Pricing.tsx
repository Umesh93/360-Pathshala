import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle2, ArrowRight, Sparkles } from "lucide-react";
import { PublicLayout } from "@/public/layouts/PublicLayout";


const baseModules = [
  "Student Registration",
  "Examination & Result Publishing",
];

const addonModules = [
  { name: "Attendance", price: 3000 },
  { name: "Teacher Dashboard", price: 3000 },
  { name: "Student Dashboard", price: 3000 },
  { name: "Parent / Guardian Dashboard", price: 3000 },
  { name: "Accounts", price: 3000 },
  { name: "Library", price: 3000 },
  { name: "Transport", price: 3000 },
  { name: "Hostel", price: 3000 },
  { name: "Inventory", price: 3000 },
  { name: "Payroll", price: 3000 },
  { name: "HR Management", price: 3000 },
  { name: "Leave Management", price: 3000 },
  { name: "Assignments", price: 3000 },
  { name: "Academic Calendar", price: 3000 },
  { name: "Notifications", price: 3000 },
];

function PricingPage() {
  return (
    <PublicLayout>
      <section className="bg-gradient-hero">
        <div className="mx-auto max-w-4xl px-6 py-20 text-center lg:px-10 lg:py-28">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Pricing</span>
          <h1 className="mt-4 font-display text-5xl font-extrabold leading-tight text-foreground sm:text-6xl">
            Simple, <span className="text-gradient-accent">modular</span> pricing.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            Start with the essentials. Add modules as you grow. No hidden fees, no surprises.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-10">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Base Package */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-3xl border border-border bg-card p-8 shadow-soft"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-soft text-primary">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-display text-xl font-bold text-foreground">Base Package</h3>
                <p className="text-sm text-muted-foreground">Required for every school</p>
              </div>
            </div>

            <div className="mt-6">
              <span className="font-display text-4xl font-extrabold text-foreground">NPR 5,000</span>
              <span className="text-muted-foreground">/month</span>
            </div>

            <ul className="mt-8 space-y-4">
              {baseModules.map((m) => (
                <li key={m} className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
                  <span className="text-sm text-foreground">{m}</span>
                </li>
              ))}
            </ul>

            <Link
              to="/demo"
              className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-brand transition-transform hover:scale-[1.01]"
            >
              Get Started <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>

          {/* Add-ons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="rounded-3xl border border-border bg-card p-8 shadow-soft"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-soft text-accent">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-display text-xl font-bold text-foreground">Add-on Modules</h3>
                <p className="text-sm text-muted-foreground">Pick what you need</p>
              </div>
            </div>

            <div className="mt-6">
              <span className="font-display text-4xl font-extrabold text-foreground">NPR 3,000</span>
              <span className="text-muted-foreground">/module/month</span>
            </div>

            <ul className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {addonModules.map((m) => (
                <li key={m.name} className="flex items-center gap-2 rounded-xl border border-border bg-surface p-3">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-accent" />
                  <span className="text-sm text-foreground">{m.name}</span>
                  <span className="ml-auto text-xs font-medium text-muted-foreground">+NPR {m.price.toLocaleString()}</span>
                </li>
              ))}
            </ul>

            <Link
              to="/demo"
              className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-accent px-6 py-3 text-sm font-semibold text-accent-foreground shadow-soft transition-transform hover:scale-[1.01]"
            >
              Build Your Plan <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>
        </div>
      </section>

      <section className="px-6 pb-24 lg:px-10">
        <div className="relative mx-auto max-w-6xl overflow-hidden rounded-3xl bg-gradient-brand p-10 text-center shadow-elevated md:p-16">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-accent/30 blur-3xl" />
          <h2 className="relative font-display text-4xl font-extrabold text-white">
            Ready to digitize your school?
          </h2>
          <p className="relative mx-auto mt-4 max-w-xl text-primary-foreground/80">
            Schedule a personalized demo and we'll tailor the right module mix for your institution.
          </p>
          <Link
            to="/demo"
            className="relative mt-8 inline-flex items-center gap-2 rounded-full bg-accent px-7 py-3.5 text-sm font-semibold text-accent-foreground shadow-glow"
          >
            Book Your Free Demo <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </PublicLayout>
  );
}

export default PricingPage;
