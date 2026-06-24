import { createFileRoute } from "@tanstack/react-router";
import { Mail, Phone, MapPin, Clock } from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact 360 Pathshala — Get in Touch" },
      { name: "description", content: "Reach out to the 360 Pathshala team. We're happy to answer questions about our Student Management System, pricing, or modules." },
      { property: "og:title", content: "Contact 360 Pathshala" },
      { property: "og:description", content: "Talk to our team about modules, pricing, and onboarding." },
    ],
  }),
  component: ContactPage,
});

const items = [
  { icon: Mail, label: "Email", value: "hello@360pathshala.com" },
  { icon: Phone, label: "Phone", value: "+977 98-00000000" },
  { icon: MapPin, label: "Office", value: "Kathmandu, Nepal" },
  { icon: Clock, label: "Hours", value: "Sun–Fri · 9 AM – 6 PM" },
];

function ContactPage() {
  return (
    <SiteLayout>
      <section className="bg-gradient-hero">
        <div className="mx-auto max-w-3xl px-6 py-20 text-center lg:px-10 lg:py-28">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Contact</span>
          <h1 className="mt-4 font-display text-5xl font-extrabold text-foreground sm:text-6xl">
            We'd love to <span className="text-gradient-accent">hear from you</span>.
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg text-muted-foreground">
            Questions about modules, pricing or onboarding? Our team usually responds within one business day.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-24 lg:px-10">
        <div className="grid gap-5 md:grid-cols-2">
          {items.map((it) => (
            <div key={it.label} className="flex items-start gap-4 rounded-2xl border border-border bg-card p-6 shadow-soft">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
                <it.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{it.label}</p>
                <p className="mt-1 font-display text-lg font-semibold text-foreground">{it.value}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </SiteLayout>
  );
}
