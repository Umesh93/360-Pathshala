import { useState, type FormEvent } from "react";
import { CheckCircle2, ArrowRight, Sparkles } from "lucide-react";
import { PublicLayout } from "@/public/layouts/PublicLayout";
import { useToast } from "@/modules/admin/students/components/Toast";
import { submitDemoRequest } from "@/services/demoRequestService";
import type { CreateDemoRequestPayload } from "@/types/DemoRequest";

const moduleOptions = [
  "Student Registration",
  "Teacher Management",
  "Parent Management",
  "Attendance",
  "Examination & Result Publishing",
  "Assignments",
  "Fee Management",
  "Leave Management",
  "Notifications",
  "Analytics Dashboard",
  "Student Dashboard",
  "Teacher Dashboard",
  "Parent / Guardian Dashboard",
  "Accounts",
  "Library",
  "Transport",
  "Hostel",
  "Inventory",
  "Payroll",
  "HR Management",
  "Academic Calendar",
];

function DemoRequestPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [school, setSchool] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [studentCount, setStudentCount] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { showToast } = useToast();

  const toggle = (m: string) =>
    setSelected((prev) =>
      prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m],
    );

  const validate = (): boolean => {
    const next: Record<string, string> = {};
    if (!school.trim()) next.school = "School / Institution is required.";
    if (!contactPerson.trim())
      next.contactPerson = "Contact person is required.";
    if (!email.trim() || !email.includes("@"))
      next.email = "A valid email is required.";
    if (!phone.trim()) next.phone = "Phone number is required.";
    if (selected.length === 0)
      next.modules = "Please select at least one module.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      showToast("Please fix the errors in the form.", "error");
      return;
    }

    setLoading(true);

    try {
      const payload: CreateDemoRequestPayload = {
        schoolName: school.trim(),
        contactPerson: contactPerson.trim(),
        email: email.trim(),
        phone: phone.trim(),
        address: address.trim() || undefined,
        studentCount: studentCount ? parseInt(studentCount, 10) : undefined,
        interestedModules: selected,
        message: message.trim() || undefined,
      };

      await submitDemoRequest(payload);

      setSubmitted(true);
      showToast("Demo request submitted successfully!", "success");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } }; message?: string };
      const message =
        error.response?.data?.message ||
        error.message ||
        "Something went wrong. Please try again.";
      showToast(message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSubmitted(false);
    setSelected([]);
    setSchool("");
    setContactPerson("");
    setEmail("");
    setPhone("");
    setAddress("");
    setStudentCount("");
    setMessage("");
    setErrors({});
  };

  return (
    <PublicLayout>
      <section className="bg-gradient-hero">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-10 lg:py-24">
          <div className="grid gap-12 lg:grid-cols-[1fr_1.2fr] lg:gap-16">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-xs font-medium text-foreground/70 shadow-soft">
                <Sparkles className="h-3.5 w-3.5 text-accent" />
                Free 30-days demo
              </span>
              <h1 className="mt-6 font-display text-5xl font-extrabold leading-tight text-foreground sm:text-6xl">
                See 360 Pathshala in{" "}
                <span className="text-gradient-accent">action</span>.
              </h1>
              <p className="mt-5 text-lg text-muted-foreground">
                Tell us a little about your institution and we'll set up a
                tailored walkthrough of the modules that matter most to you.
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
                    Thank you. Our team will reach out within one business day
                    to schedule your personalized demo.
                  </p>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="mt-8 inline-flex items-center gap-2 rounded-full border border-border bg-background px-5 py-2.5 text-sm font-semibold text-foreground hover:bg-secondary"
                  >
                    Submit another request
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="school"
                        className="text-sm font-semibold text-foreground"
                      >
                        School / Institution{" "}
                        <span className="text-accent">*</span>
                      </label>
                      <input
                        id="school"
                        name="school"
                        type="text"
                        required
                        placeholder="Himalayan Public School"
                        value={school}
                        onChange={(e) => setSchool(e.target.value)}
                        className={`mt-2 w-full rounded-xl border bg-background px-4 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-ring ${
                          errors.school ? "border-red-500" : "border-input"
                        }`}
                      />
                      {errors.school && (
                        <p className="mt-1 text-xs text-red-500">
                          {errors.school}
                        </p>
                      )}
                    </div>
                    <div>
                      <label
                        htmlFor="contactPerson"
                        className="text-sm font-semibold text-foreground"
                      >
                        Contact Person <span className="text-accent">*</span>
                      </label>
                      <input
                        id="contactPerson"
                        name="contactPerson"
                        type="text"
                        required
                        placeholder="Anita Karki"
                        value={contactPerson}
                        onChange={(e) => setContactPerson(e.target.value)}
                        className={`mt-2 w-full rounded-xl border bg-background px-4 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-ring ${
                          errors.contactPerson
                            ? "border-red-500"
                            : "border-input"
                        }`}
                      />
                      {errors.contactPerson && (
                        <p className="mt-1 text-xs text-red-500">
                          {errors.contactPerson}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="email"
                        className="text-sm font-semibold text-foreground"
                      >
                        Email <span className="text-accent">*</span>
                      </label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        placeholder="you@school.edu.np"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={`mt-2 w-full rounded-xl border bg-background px-4 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-ring ${
                          errors.email ? "border-red-500" : "border-input"
                        }`}
                      />
                      {errors.email && (
                        <p className="mt-1 text-xs text-red-500">
                          {errors.email}
                        </p>
                      )}
                    </div>
                    <div>
                      <label
                        htmlFor="phone"
                        className="text-sm font-semibold text-foreground"
                      >
                        Phone <span className="text-accent">*</span>
                      </label>
                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        required
                        placeholder="+977 98-XXXXXXXX"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className={`mt-2 w-full rounded-xl border bg-background px-4 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-ring ${
                          errors.phone ? "border-red-500" : "border-input"
                        }`}
                      />
                      {errors.phone && (
                        <p className="mt-1 text-xs text-red-500">
                          {errors.phone}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="address"
                        className="text-sm font-semibold text-foreground"
                      >
                        Address
                      </label>
                      <input
                        id="address"
                        name="address"
                        type="text"
                        placeholder="Kathmandu, Nepal"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="mt-2 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-ring"
                      />
                    </div>
                    {/* <div>
                      <label
                        htmlFor="studentCount"
                        className="text-sm font-semibold text-foreground"
                      >
                        Student Count
                      </label>
                      <input
                        id="studentCount"
                        name="studentCount"
                        type="number"
                        placeholder="e.g. 500"
                        value={studentCount}
                        onChange={(e) => setStudentCount(e.target.value)}
                        className="mt-2 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-ring"
                      />
                    </div> */}
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-foreground">
                      Modules of interest <span className="text-accent">*</span>
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
                    {errors.modules && (
                      <p className="mt-1 text-xs text-red-500">
                        {errors.modules}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="message"
                      className="text-sm font-semibold text-foreground"
                    >
                      Anything else?
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows={3}
                      placeholder="Preferred demo time, specific questions..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="mt-2 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-ring"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-brand px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-brand transition-transform hover:scale-[1.01] disabled:opacity-50"
                  >
                    {loading && (
                      <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    )}
                    {loading ? "Submitting..." : "Request my demo"}
                    {!loading && <ArrowRight className="h-4 w-4" />}
                  </button>
                  <p className="text-center text-xs text-muted-foreground">
                    By submitting, you agree to be contacted by the 360
                    Pathshala team about your request.
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}

export default DemoRequestPage;
