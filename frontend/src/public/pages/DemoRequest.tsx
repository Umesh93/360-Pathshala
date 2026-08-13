import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  ImagePlus,
  Sparkles,
  Trash2,
} from "lucide-react";
import { PublicLayout } from "@/public/layouts/PublicLayout";
import { useToast } from "@/modules/admin/students/components/Toast";
import {
  getPublicModules,
  moduleLabel,
  submitDemoRequest,
  type PublicModule,
} from "@/services/demoRequestService";
import type { CreateDemoRequestPayload } from "@/types/DemoRequest";

const allowedLogoTypes = ["image/png", "image/jpeg", "image/webp"];
const maxLogoSize = 2 * 1024 * 1024;

type FormErrors = Record<string, string>;

const backendErrors = (error: unknown): FormErrors => {
  const data = (error as { response?: { data?: unknown } }).response?.data as
    | {
        message?: string;
        errors?: Record<string, string>;
        fieldErrors?: Record<string, string>;
      }
    | undefined;
  return data?.errors ?? data?.fieldErrors ?? {};
};

const errorMessage = (error: unknown): string => {
  const data = (error as { response?: { data?: { message?: string } } })
    .response?.data;
  return (
    data?.message ??
    (error instanceof Error ? error.message : "Unable to submit the request.")
  );
};

export default function DemoRequestPage() {
  const { showToast } = useToast();
  const logoInput = useRef<HTMLInputElement>(null);
  const [modules, setModules] = useState<PublicModule[]>([]);
  const [modulesLoading, setModulesLoading] = useState(true);
  const [selected, setSelected] = useState<string[]>([]);
  const [logo, setLogo] = useState<File>();
  const [submitting, setSubmitting] = useState(false);
  const [requestCode, setRequestCode] = useState<string>();
  const [errors, setErrors] = useState<FormErrors>({});
  const [form, setForm] = useState({
    schoolName: "",
    contactPerson: "",
    designation: "",
    email: "",
    phone: "",
    address: "",
  });

  useEffect(() => {
    let active = true;
    getPublicModules()
      .then((items) => {
        if (active) {
          setModules(items);
          setSelected(
            items
              .filter(
                (module) =>
                  module.billingType === "REQUIRED" ||
                  module.billingType === "INCLUDED",
              )
              .map((module) => module.code),
          );
        }
      })
      .catch(() => showToast("Unable to load available modules.", "error"))
      .finally(() => {
        if (active) setModulesLoading(false);
      });
    return () => {
      active = false;
    };
  }, [showToast]);

  const logoPreview = useMemo(
    () => (logo ? URL.createObjectURL(logo) : undefined),
    [logo],
  );

  useEffect(
    () => () => {
      if (logoPreview) URL.revokeObjectURL(logoPreview);
    },
    [logoPreview],
  );

  const update = (field: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: "" }));
  };

  const chooseLogo = (file?: File) => {
    if (!file) return;
    if (!allowedLogoTypes.includes(file.type)) {
      showToast("Logo must be PNG, JPG, JPEG, or WebP.", "error");
      return;
    }
    if (file.size > maxLogoSize) {
      showToast("Logo must be 2 MiB or smaller.", "error");
      return;
    }
    setLogo(file);
  };

  const validate = (): boolean => {
    const next: FormErrors = {};
    if (!form.schoolName.trim()) next.schoolName = "School name is required.";
    if (!form.contactPerson.trim())
      next.contactPerson = "Contact person is required.";
    if (!form.designation.trim()) next.designation = "Designation is required.";
    if (!form.email.trim() || !/^\S+@\S+\.\S+$/.test(form.email))
      next.email = "A valid email is required.";
    if (!form.phone.trim()) next.phone = "Phone number is required.";
    if (!form.address.trim()) next.address = "Address is required.";
    if (!selected.length)
      next.interestedModules = "Select at least one module.";
    setErrors(next);
    return !Object.keys(next).length;
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!validate()) {
      showToast("Please fix the highlighted fields.", "error");
      return;
    }
    const payload: CreateDemoRequestPayload = {
      schoolName: form.schoolName.trim(),
      contactPerson: form.contactPerson.trim(),
      designation: form.designation.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      address: form.address.trim(),
      interestedModules: selected,
    };
    setSubmitting(true);
    try {
      const result = await submitDemoRequest(payload, logo);
      setRequestCode(result.requestCode);
      showToast("Demo request submitted successfully.", "success");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      const fields = backendErrors(error);
      setErrors((current) => ({ ...current, ...fields }));
      showToast(errorMessage(error), "error");
    } finally {
      setSubmitting(false);
    }
  };

  const reset = () => {
    setRequestCode(undefined);
    setSelected(
      modules
        .filter(
          (module) =>
            module.billingType === "REQUIRED" ||
            module.billingType === "INCLUDED",
        )
        .map((module) => module.code),
    );
    setLogo(undefined);
    setErrors({});
    setForm({
      schoolName: "",
      contactPerson: "",
      designation: "",
      email: "",
      phone: "",
      address: "",
    });
  };

  const fieldClass = (field: string) =>
    `mt-2 w-full rounded-xl border bg-background px-4 py-3 text-sm outline-none transition-colors focus:border-ring ${
      errors[field] ? "border-red-500" : "border-input"
    }`;

  return (
    <PublicLayout>
      <section className="bg-gradient-hero">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-10 lg:py-20">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
            <div className="lg:pt-8">
              <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-xs font-medium shadow-soft">
                <Sparkles className="h-3.5 w-3.5 text-accent" /> Free 30-day
                demo
              </span>
              <h1 className="mt-6 font-display text-4xl font-extrabold leading-tight text-foreground sm:text-6xl">
                See 360 Pathshala in{" "}
                <span className="text-gradient-accent">action</span>.
              </h1>
              <p className="mt-5 text-lg text-muted-foreground">
                Tell us about your institution and the modules you want to
                explore. We will provision a tailored demo for your team.
              </p>
              <ul className="mt-8 space-y-3 text-sm text-foreground/80">
                {[
                  "Configured for your institution",
                  "Only the modules you select",
                  "Credentials delivered by email",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-accent" />{" "}
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-border bg-card p-5 shadow-elevated sm:p-8">
              {requestCode ? (
                <div className="flex min-h-96 flex-col items-center justify-center text-center">
                  <CheckCircle2 className="h-14 w-14 text-accent" />
                  <h2 className="mt-5 font-display text-3xl font-bold">
                    Request received
                  </h2>
                  <p className="mt-3 text-muted-foreground">
                    Keep this reference for your records.
                  </p>
                  <strong className="mt-4 rounded-lg bg-secondary px-4 py-2 font-mono text-foreground">
                    {requestCode}
                  </strong>
                  <button
                    type="button"
                    onClick={reset}
                    className="mt-8 rounded-full border border-border px-5 py-2.5 text-sm font-semibold hover:bg-secondary"
                  >
                    Submit another request
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {(
                      [
                        [
                          "schoolName",
                          "School / Institution",
                          "Himalayan Public School",
                          "text",
                        ],
                        [
                          "contactPerson",
                          "Contact Person",
                          "Anita Karki",
                          "text",
                        ],
                        ["designation", "Designation", "Principal", "text"],
                        ["email", "Email", "you@school.edu.np", "email"],
                        ["phone", "Phone", "+977 98-XXXXXXXX", "tel"],
                      ] as const
                    ).map(([field, label, placeholder, type]) => (
                      <label key={field} className="text-sm font-semibold">
                        {label} <span className="text-accent">*</span>
                        <input
                          type={type}
                          value={form[field]}
                          onChange={(e) => update(field, e.target.value)}
                          placeholder={placeholder}
                          className={fieldClass(field)}
                        />
                        {errors[field] && (
                          <span className="mt-1 block text-xs text-red-600">
                            {errors[field]}
                          </span>
                        )}
                      </label>
                    ))}
                  </div>

                  <label className="block text-sm font-semibold">
                    Address <span className="text-accent">*</span>
                    <input
                      value={form.address}
                      onChange={(e) => update("address", e.target.value)}
                      placeholder="Kathmandu, Nepal"
                      className={fieldClass("address")}
                    />
                    {errors.address && (
                      <span className="mt-1 block text-xs text-red-600">
                        {errors.address}
                      </span>
                    )}
                  </label>

                  <div>
                    <span className="text-sm font-semibold">
                      School Logo{" "}
                      <span className="font-normal text-muted-foreground">
                        (optional)
                      </span>
                    </span>
                    <div className="mt-2 flex flex-wrap items-center gap-4">
                      <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-lg border border-input bg-secondary text-xs text-muted-foreground">
                        {logoPreview ? (
                          <img
                            src={logoPreview}
                            alt="School logo preview"
                            className="h-full w-full object-contain"
                          />
                        ) : (
                          "No logo"
                        )}
                      </div>
                      <input
                        ref={logoInput}
                        type="file"
                        accept=".png,.jpg,.jpeg,.webp,image/png,image/jpeg,image/webp"
                        className="hidden"
                        onChange={(e) => chooseLogo(e.target.files?.[0])}
                      />
                      <button
                        type="button"
                        onClick={() => logoInput.current?.click()}
                        className="inline-flex items-center gap-2 rounded-lg border border-input px-3 py-2 text-sm font-medium hover:bg-secondary"
                      >
                        <ImagePlus className="h-4 w-4" />{" "}
                        {logo ? "Replace" : "Choose logo"}
                      </button>
                      {logo && (
                        <button
                          type="button"
                          onClick={() => setLogo(undefined)}
                          className="inline-flex items-center gap-2 text-sm font-medium text-red-600"
                        >
                          <Trash2 className="h-4 w-4" /> Remove
                        </button>
                      )}
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">
                      PNG, JPG, JPEG, or WebP. Maximum 2 MiB.
                    </p>
                  </div>

                  <div>
                    <span className="text-sm font-semibold">
                      Modules of interest <span className="text-accent">*</span>
                    </span>
                    <div className="mt-3 space-y-4">
                      {modulesLoading ? (
                        <p className="text-sm text-muted-foreground">
                          Loading modules...
                        </p>
                      ) : (
                        (["REQUIRED", "INCLUDED", "PAID"] as const).map(
                          (billingType) => {
                            const group = modules.filter(
                              (module) => module.billingType === billingType,
                            );
                            if (!group.length) return null;
                            return (
                              <section key={billingType}>
                                <h3 className="mb-2 text-xs font-bold uppercase text-muted-foreground">
                                  {billingType === "REQUIRED"
                                    ? "Required"
                                    : billingType === "INCLUDED"
                                      ? "Included"
                                      : "Paid Add-ons"}
                                </h3>
                                <div className="grid gap-2 sm:grid-cols-2">
                                  {group.map((module) => {
                                    const active = selected.includes(
                                      module.code,
                                    );
                                    const required = billingType === "REQUIRED";
                                    return (
                                      <label
                                        key={module.code}
                                        className={`flex min-h-14 items-center gap-3 rounded-lg border px-3 py-2 text-left text-sm font-medium transition-colors duration-200 ${required ? "cursor-not-allowed" : "cursor-pointer"} ${active ? "border-accent bg-accent-soft text-foreground" : "border-input bg-white hover:border-accent/60 hover:bg-secondary"}`}
                                      >
                                        <input
                                          type="checkbox"
                                          checked={active}
                                          disabled={required}
                                          onChange={() => {
                                            setSelected((current) =>
                                              active
                                                ? current.filter(
                                                    (code) =>
                                                      code !== module.code,
                                                  )
                                                : [...current, module.code],
                                            );
                                            setErrors((current) => ({
                                              ...current,
                                              interestedModules: "",
                                            }));
                                          }}
                                          className="sr-only"
                                        />
                                        <span
                                          className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${active ? "border-accent bg-accent text-white" : "border-input"}`}
                                        >
                                          {active && (
                                            <Check className="h-3 w-3" />
                                          )}
                                        </span>
                                        <span>
                                          <span className="block">
                                            {moduleLabel(
                                              module.code,
                                              module.name,
                                            )}
                                          </span>
                                          <span className="block text-xs font-normal text-muted-foreground">
                                            {required
                                              ? "Required"
                                              : billingType === "INCLUDED"
                                                ? "Included"
                                                : `NPR ${module.annualPrice.toLocaleString()} / ${module.billingPeriod}`}
                                          </span>
                                        </span>
                                      </label>
                                    );
                                  })}
                                </div>
                              </section>
                            );
                          },
                        )
                      )}
                    </div>
                    {errors.interestedModules && (
                      <p className="mt-1 text-xs text-red-600">
                        {errors.interestedModules}
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={submitting || modulesLoading || !modules.length}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-brand px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-brand disabled:opacity-50"
                  >
                    {submitting ? "Submitting..." : "Request my demo"}{" "}
                    {!submitting && <ArrowRight className="h-4 w-4" />}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
