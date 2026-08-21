import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  CalendarDays,
  Check,
  Clock3,
  CreditCard,
  Loader2,
  PackageCheck,
  ShieldCheck,
} from "lucide-react";

import ErrorState from "@/components/feedback/ErrorState";
import Skeleton from "@/components/Skeleton";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import AdminLayout from "@/layouts/AdminLayout";
import { useToast } from "@/modules/admin/students/components/Toast";
import { getCurrentSchoolModuleCodes } from "@/services/schoolService";

import {
  getCurrentSubscription,
  getFeatures,
  getPayments,
  initiatePayment,
  moduleLabel,
  subscriptionError,
} from "./service";
import type { CurrentSubscription, Feature, Payment } from "./types";

const money = (value: number, currency = "NPR") =>
  new Intl.NumberFormat("en-NP", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(value);

const date = (value: string | null) =>
  value
    ? new Date(`${value.slice(0, 10)}T00:00:00`).toLocaleDateString("en-NP", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "Not set";

const dateTime = (value: string | null) =>
  value
    ? new Date(value).toLocaleString("en-NP", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : "-";

const statusClass = (status: string) => {
  if (["ACTIVE", "PAID", "COMPLETED"].includes(status))
    return "bg-emerald-50 text-emerald-700";
  if (["PENDING", "INITIATED", "SCHEDULED", "DEMO"].includes(status))
    return "bg-amber-50 text-amber-700";
  if (status === "REFUNDED") return "bg-blue-50 text-blue-700";
  return "bg-red-50 text-red-700";
};

const billingLabel = (value: string) => {
  const normalized = value.replaceAll("_", " ").toLowerCase();
  if (normalized.includes("annual") || normalized.includes("year")) {
    return "Annual";
  }
  return normalized.replace(/\b\w/g, (letter) => letter.toUpperCase());
};

const Badge = ({ value }: { value: string }) => (
  <span
    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass(value)}`}
  >
    {value.replaceAll("_", " ")}
  </span>
);

const FeatureChips = ({ codes }: { codes: string[] }) => (
  <div className="flex flex-wrap gap-1.5">
    {codes.map((code) => (
      <span
        key={code}
        className="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700"
      >
        {moduleLabel(code)}
      </span>
    ))}
  </div>
);

export default function SubscriptionPage({
  embedded = false,
}: {
  embedded?: boolean;
}) {
  const { showToast } = useToast();
  const [features, setFeatures] = useState<Feature[]>([]);
  const [current, setCurrent] = useState<CurrentSubscription | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [activeCodes, setActiveCodes] = useState<string[]>([]);
  const [selectedCodes, setSelectedCodes] = useState<string[]>([]);
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const submittingRef = useRef(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [nextFeatures, nextCurrent, nextPayments, nextActiveCodes] =
        await Promise.all([
          getFeatures(),
          getCurrentSubscription(),
          getPayments(),
          getCurrentSchoolModuleCodes(),
        ]);
      setFeatures(nextFeatures.filter((feature) => feature.active));
      setCurrent(nextCurrent);
      setPayments(nextPayments);
      setActiveCodes(nextActiveCodes);
    } catch (reason) {
      setError(
        subscriptionError(reason, "Unable to load subscription details."),
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    queueMicrotask(() => void load());
  }, [load]);

  const paidFeatures = features.filter(
    (feature) => feature.billingType === "PAID",
  );
  const includedFeatures = features.filter(
    (feature) => feature.billingType !== "PAID",
  );
  const selectedFeatures = paidFeatures.filter((feature) =>
    selectedCodes.includes(feature.code),
  );
  const selectedTotal = selectedFeatures.reduce(
    (total, feature) => total + feature.annualPrice,
    0,
  );
  const selectedBillingLabels = Array.from(
    new Set(selectedFeatures.map((feature) => billingLabel(feature.billingPeriod))),
  );
  const selectedBilling =
    selectedBillingLabels.length === 1 ? selectedBillingLabels[0] : "Multiple";
  const entitlementFor = (code: string) =>
    current?.entitlements?.find((entitlement) => entitlement.code === code);
  const isFeatureActive = (code: string) =>
    entitlementFor(code)?.active ?? activeCodes.includes(code);
  const activePaidCount = paidFeatures.filter((feature) =>
    isFeatureActive(feature.code),
  ).length;

  const toggleFeature = (code: string) => {
    setSelectedCodes((codes) =>
      codes.includes(code)
        ? codes.filter((item) => item !== code)
        : [...codes, code],
    );
  };

  const proceed = async () => {
    if (!selectedCodes.length || submittingRef.current) return;
    submittingRef.current = true;
    setSubmitting(true);
    try {
      const payment = await initiatePayment(selectedCodes);
      if (!payment.paymentUrl) {
        throw new Error("The payment provider did not return a checkout URL.");
      }
      window.location.assign(payment.paymentUrl);
    } catch (reason) {
      showToast(subscriptionError(reason, "Unable to start payment."), "error");
      submittingRef.current = false;
      setSubmitting(false);
    }
  };

  const body = (
    <>
      <div className="mx-auto w-full max-w-7xl space-y-6">
        <header>
          <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">
            Subscription &amp; Features
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage your enabled features, annual add-ons, and payment history.
          </p>
        </header>

        {loading ? (
          <div className="space-y-6">
            <Skeleton className="h-56 w-full" />
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {[1, 2, 3].map((item) => (
                <Skeleton key={item} className="h-72" />
              ))}
            </div>
          </div>
        ) : error ? (
          <section className="rounded-lg bg-white shadow-sm">
            <ErrorState
              title="Subscription data unavailable"
              description={error}
              onRetry={() => void load()}
            />
          </section>
        ) : (
          <>
            <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm md:p-6">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-50 text-[#234A91]">
                      <PackageCheck className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase text-slate-500">
                        Current subscription
                      </p>
                      <h2 className="text-xl font-bold text-slate-900">
                        Base Platform
                      </h2>
                    </div>
                    {current && <Badge value={current.status} />}
                  </div>
                  <p className="mt-5 max-w-2xl text-sm text-slate-600">
                    Core platform features are included. Select paid add-ons
                    below when your school needs more capabilities.
                  </p>
                </div>
                <dl className="grid shrink-0 grid-cols-2 gap-x-6 gap-y-4 border-t border-slate-100 pt-5 sm:grid-cols-4 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
                  <div>
                    <dt className="text-xs text-slate-500">Included</dt>
                    <dd className="mt-1 text-sm font-semibold text-slate-800">
                      {includedFeatures.length} features
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-slate-500">Active add-ons</dt>
                    <dd className="mt-1 text-sm font-semibold text-slate-800">
                      {activePaidCount} features
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-slate-500">Status</dt>
                    <dd className="mt-1">
                      {current ? (
                        <Badge value={current.status} />
                      ) : (
                        <span className="text-sm font-semibold text-slate-800">
                          Included
                        </span>
                      )}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-slate-500">Next renewal</dt>
                    <dd className="mt-1 text-sm font-semibold text-slate-800">
                      {date(current?.endsOn ?? null)}
                    </dd>
                  </div>
                </dl>
              </div>
            </section>

            <section>
              <div className="mb-3">
                <h2 className="text-lg font-bold text-slate-900">
                  Included Features
                </h2>
                <p className="text-sm text-slate-500">
                  Available with the base platform.
                </p>
              </div>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {includedFeatures.map((feature) => (
                  <article
                    key={feature.code}
                    className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-bold text-slate-900">
                          {feature.name}
                        </h3>
                        {feature.description && (
                          <p className="mt-1 text-sm text-slate-500">
                            {feature.description}
                          </p>
                        )}
                      </div>
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                        {feature.billingType === "REQUIRED"
                          ? "Required"
                          : "Included"}
                      </span>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <section>
              <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Paid Add-ons
                  </h2>
                  <p className="text-sm text-slate-500">
                    Select one or more annual features. Pricing is confirmed by
                    the server.
                  </p>
                </div>
                {selectedFeatures.length > 0 && (
                  <div className="text-sm text-slate-600">
                    <strong className="text-slate-900">
                      {selectedFeatures.length}
                    </strong>{" "}
                    selected,{" "}
                    <strong className="text-slate-900">
                      {money(selectedTotal)}
                    </strong>{" "}
                    annually
                  </div>
                )}
              </div>
              {paidFeatures.length === 0 ? (
                <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
                  No paid add-ons are currently available.
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {paidFeatures.map((feature) => {
                    const entitlement = entitlementFor(feature.code);
                    const active =
                      entitlement?.active ?? activeCodes.includes(feature.code);
                    const selected = selectedCodes.includes(feature.code);
                    const renewal = active ? entitlement?.endsOn : null;
                    return (
                      <article
                        key={feature.code}
                        className={`flex min-h-64 flex-col rounded-lg border bg-white p-5 shadow-sm ${active || selected ? "border-[#234A91]" : "border-slate-200"}`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h3 className="font-bold text-slate-900">
                              {feature.name}
                            </h3>
                            {feature.description && (
                              <p className="mt-1 text-sm text-slate-500">
                                {feature.description}
                              </p>
                            )}
                          </div>
                          {active ? (
                            <Badge value="ACTIVE" />
                          ) : (
                            selected && (
                              <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-[#234A91]">
                                Selected
                              </span>
                            )
                          )}
                        </div>
                        <p className="mt-5 text-2xl font-bold text-slate-900">
                          {money(feature.annualPrice)}
                        </p>
                        <p className="mt-1 flex items-center gap-2 text-sm text-slate-500">
                          <CalendarDays className="h-4 w-4" />
                          {feature.billingPeriod}
                        </p>
                        <div className="mt-auto pt-5">
                          {active ? (
                            <p className="mb-3 text-sm font-medium text-emerald-700">
                              {renewal
                                ? `Active, renew by ${date(renewal)}`
                                : "Active"}
                            </p>
                          ) : entitlement ? (
                            <p className="mb-3 text-sm font-medium text-red-700">
                              Expired / not active
                            </p>
                          ) : null}
                          <Button
                            variant={selected ? "default" : "outline"}
                            className={
                              selected
                                ? "w-full bg-[#234A91] hover:bg-[#193b78]"
                                : "w-full"
                            }
                            onClick={() => toggleFeature(feature.code)}
                          >
                            <Check />
                            {selected
                              ? "Selected"
                              : active
                                ? "Renew for one year"
                                : "Select add-on"}
                          </Button>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
              {selectedFeatures.length > 0 && (
                <div className="mt-4 flex flex-col gap-3 rounded-lg border border-blue-100 bg-blue-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-semibold text-slate-900">
                      {selectedFeatures.length} add-on
                      {selectedFeatures.length === 1 ? "" : "s"} selected
                    </p>
                    <p className="text-sm text-slate-600">
                      {money(selectedTotal)} per year
                    </p>
                  </div>
                  <Button
                    className="bg-[#234A91] hover:bg-[#193b78]"
                    onClick={() => setConfirming(true)}
                  >
                    <CreditCard />
                    Proceed
                  </Button>
                </div>
              )}
            </section>

            <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center gap-3 border-b border-slate-100 p-5">
                <Clock3 className="h-5 w-5 text-[#234A91]" />
                <div>
                  <h2 className="font-bold text-slate-900">Payment history</h2>
                  <p className="text-sm text-slate-500">
                    Khalti payment attempts and results.
                  </p>
                </div>
              </div>
              <div className="max-w-full overflow-x-auto">
                <table className="w-full min-w-[900px] text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                    <tr>
                      <th className="px-5 py-3">Order</th>
                      <th className="px-5 py-3">Features</th>
                      <th className="px-5 py-3">Amount</th>
                      <th className="px-5 py-3">Status</th>
                      <th className="px-5 py-3">Initiated</th>
                      <th className="px-5 py-3">Verified</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((payment) => (
                      <tr
                        key={payment.id}
                        className="border-t border-slate-100"
                      >
                        <td className="px-5 py-4 font-medium text-slate-800">
                          {payment.purchaseOrderId}
                        </td>
                        <td className="px-5 py-4 text-slate-600">
                          {payment.featureCodes.length ? (
                            <FeatureChips codes={payment.featureCodes} />
                          ) : (
                            payment.planName || "-"
                          )}
                        </td>
                        <td className="px-5 py-4 text-slate-600">
                          {money(payment.amountNpr, payment.currency)}
                        </td>
                        <td className="px-5 py-4">
                          <Badge value={payment.status} />
                        </td>
                        <td className="px-5 py-4 text-slate-600">
                          {dateTime(payment.initiatedAt)}
                        </td>
                        <td className="px-5 py-4 text-slate-600">
                          {dateTime(payment.verifiedAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {payments.length === 0 && (
                  <p className="p-8 text-center text-sm text-slate-500">
                    No payment attempts yet.
                  </p>
                )}
              </div>
            </section>
          </>
        )}
      </div>

      <Dialog
        open={confirming}
        onOpenChange={(open) => !open && !submitting && setConfirming(false)}
      >
        <DialogContent className="max-h-[90vh] w-[calc(100vw-2rem)] max-w-[560px] overflow-hidden rounded-lg !bg-white p-0 dark:!bg-white">
          <DialogHeader className="border-b border-slate-100 px-5 py-5 pr-12 text-left sm:px-6">
            <DialogTitle className="text-xl font-bold text-slate-900">
              Confirm Payment
            </DialogTitle>
            <DialogDescription className="mt-1 text-sm leading-6 text-slate-500">
              Review your selected add-ons before continuing to Khalti.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 overflow-y-auto px-5 py-5 sm:px-6">
            <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
              <dl className="grid grid-cols-2 gap-x-4 gap-y-3 border-b border-slate-100 bg-slate-50 px-4 py-4">
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-sm font-medium text-slate-600">
                    Selected Add-ons
                  </dt>
                  <dd className="text-sm font-bold text-slate-900">
                    {selectedFeatures.length}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-sm font-medium text-slate-600">
                    Billing
                  </dt>
                  <dd className="text-sm font-bold text-slate-900">
                    {selectedBilling}
                  </dd>
                </div>
              </dl>

              <div className="divide-y divide-slate-100">
                {selectedFeatures.map((feature) => (
                  <div
                    key={feature.code}
                    className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 px-4 py-4"
                  >
                    <h3 className="min-w-0 text-sm font-semibold text-slate-900">
                      {feature.name}
                    </h3>
                    <p className="text-right text-sm font-semibold text-slate-800">
                      {money(feature.annualPrice)}
                      <span className="ml-1 font-normal text-slate-500">
                        / year
                      </span>
                    </p>
                  </div>
                ))}
              </div>

              <div className="border-t border-slate-200 bg-slate-50 px-4 py-4">
                <p className="text-xs font-semibold uppercase text-slate-500">
                  Total
                </p>
                <div className="mt-2 flex items-baseline justify-between gap-4">
                  <span className="text-sm font-semibold text-slate-700">
                    Total Amount
                  </span>
                  <span className="text-xl font-bold text-slate-900">
                    {money(selectedTotal)}
                  </span>
                </div>
              </div>
            </section>

            <p className="flex items-start gap-2 rounded-lg bg-blue-50 px-4 py-3 text-sm leading-6 text-slate-600">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#234A91]" />
              <span>
                You will be securely redirected to Khalti to complete your
                payment.
              </span>
            </p>
          </div>
          <DialogFooter className="border-t border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:space-x-0 sm:px-6">
            <Button
              variant="outline"
              className="sm:min-w-28"
              disabled={submitting}
              onClick={() => setConfirming(false)}
            >
              Cancel
            </Button>
            <Button
              className="bg-[#234A91] hover:bg-[#193b78] sm:min-w-44"
              disabled={submitting}
              onClick={() => void proceed()}
            >
              {submitting && <Loader2 className="animate-spin" />}
              {submitting ? "Starting payment" : "Proceed to Khalti"}
              {!submitting && <ArrowRight />}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );

  return embedded ? body : <AdminLayout>{body}</AdminLayout>;
}
