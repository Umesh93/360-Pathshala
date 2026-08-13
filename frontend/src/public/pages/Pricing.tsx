import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2, Sparkles } from "lucide-react";

import { PublicLayout } from "@/public/layouts/PublicLayout";
import {
  getPublicModules,
  type PublicModule,
} from "@/services/demoRequestService";

export default function PricingPage() {
  const [modules, setModules] = useState<PublicModule[]>([]);

  useEffect(() => {
    getPublicModules()
      .then(setModules)
      .catch(() => setModules([]));
  }, []);

  const included = modules.filter(
    (module) =>
      module.billingType === "REQUIRED" || module.billingType === "INCLUDED",
  );
  const paid = modules.filter((module) => module.billingType === "PAID");

  return (
    <PublicLayout>
      <section className="bg-gradient-hero">
        <div className="mx-auto max-w-4xl px-6 py-20 text-center lg:py-28">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
            Pricing
          </span>
          <h1 className="mt-4 font-display text-5xl font-extrabold text-foreground sm:text-6xl">
            Simple, <span className="text-gradient-accent">feature-based</span>{" "}
            pricing.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            Core school management is included. Add only the annual features
            your school needs.
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-6 py-20 lg:grid-cols-2 lg:px-10">
        <article className="rounded-3xl border border-border bg-card p-8 shadow-soft">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-soft text-primary">
              <Sparkles className="h-5 w-5" />
            </span>
            <div>
              <h2 className="font-display text-xl font-bold">
                Included Platform
              </h2>
              <p className="text-sm text-muted-foreground">
                Available to every school
              </p>
            </div>
          </div>
          <ul className="mt-8 space-y-3">
            {included.map((module) => (
              <li key={module.code} className="flex gap-3">
                <CheckCircle2 className="h-5 w-5 shrink-0 text-accent" />
                <span>{module.name}</span>
              </li>
            ))}
          </ul>
        </article>

        <article className="rounded-3xl border border-border bg-card p-8 shadow-soft">
          <h2 className="font-display text-xl font-bold">
            Paid Add-on Features
          </h2>
          <p className="text-sm text-muted-foreground">
            NPR 3,000 per feature per year
          </p>
          <ul className="mt-8 grid gap-3 sm:grid-cols-2">
            {paid.map((module) => (
              <li
                key={module.code}
                className="rounded-xl border border-border bg-surface p-3"
              >
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                  <span className="text-sm font-medium">{module.name}</span>
                </div>
                <p className="mt-2 text-xs font-semibold text-muted-foreground">
                  NPR {module.annualPrice.toLocaleString()} / year
                </p>
              </li>
            ))}
          </ul>
        </article>
      </section>

      <section className="px-6 pb-24">
        <div className="mx-auto max-w-6xl rounded-3xl bg-gradient-brand p-10 text-center shadow-elevated">
          <h2 className="font-display text-4xl font-extrabold text-white">
            Build the right feature mix for your school.
          </h2>
          <Link
            to="/demo"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-accent px-7 py-3.5 text-sm font-semibold text-accent-foreground"
          >
            Request a Demo <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </PublicLayout>
  );
}
