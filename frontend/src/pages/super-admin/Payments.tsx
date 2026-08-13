import { useCallback, useEffect, useState } from "react";

import ErrorState from "@/components/feedback/ErrorState";
import Skeleton from "@/components/Skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SuperAdminLayout from "@/layouts/SuperAdminLayout";
import {
  getSaasPayments,
  getSaasSubscriptions,
  moduleLabel,
  subscriptionError,
} from "@/modules/subscriptions/service";
import type {
  CurrentSubscription,
  Payment,
} from "@/modules/subscriptions/types";

const money = (value: number, currency: string) =>
  new Intl.NumberFormat("en-NP", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(value);

const dateTime = (value: string | null) =>
  value ? new Date(value).toLocaleString("en-NP") : "-";

const date = (value: string | null) =>
  value
    ? new Date(`${value.slice(0, 10)}T00:00:00`).toLocaleDateString("en-NP")
    : "-";

const badge = (status: string) => {
  if (["ACTIVE", "PAID", "COMPLETED"].includes(status))
    return "bg-emerald-50 text-emerald-700";
  if (["INITIATED", "PENDING", "SCHEDULED", "DEMO"].includes(status))
    return "bg-amber-50 text-amber-700";
  if (status === "REFUNDED") return "bg-blue-50 text-blue-700";
  return "bg-red-50 text-red-700";
};

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [subscriptions, setSubscriptions] = useState<CurrentSubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [nextPayments, nextSubscriptions] = await Promise.all([
        getSaasPayments(),
        getSaasSubscriptions(),
      ]);
      setPayments(nextPayments);
      setSubscriptions(nextSubscriptions);
    } catch (reason) {
      setError(
        subscriptionError(reason, "Unable to load SaaS billing history."),
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    queueMicrotask(() => void load());
  }, [load]);

  return (
    <SuperAdminLayout>
      <div className="mx-auto w-full max-w-7xl space-y-6">
        <header>
          <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">
            Payments & subscriptions
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Read-only platform billing records.
          </p>
        </header>

        {loading ? (
          <Skeleton className="h-[460px] w-full" />
        ) : error ? (
          <section className="rounded-lg bg-white shadow-sm">
            <ErrorState description={error} onRetry={() => void load()} />
          </section>
        ) : (
          <Tabs defaultValue="payments" className="min-w-0">
            <TabsList className="grid w-full max-w-sm grid-cols-2">
              <TabsTrigger value="payments">
                Payments ({payments.length})
              </TabsTrigger>
              <TabsTrigger value="subscriptions">
                Subscriptions ({subscriptions.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="payments" className="mt-4">
              <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
                <div className="max-w-full overflow-x-auto">
                  <table className="w-full min-w-[1050px] text-left text-sm">
                    <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                      <tr>
                        <th className="px-5 py-3">Order</th>
                        <th className="px-5 py-3">School</th>
                        <th className="px-5 py-3">Features</th>
                        <th className="px-5 py-3">Amount</th>
                        <th className="px-5 py-3">Status</th>
                        <th className="px-5 py-3">Provider status</th>
                        <th className="px-5 py-3">Transaction</th>
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
                            {payment.schoolName}
                          </td>
                          <td className="px-5 py-4 text-slate-600">
                            {payment.featureCodes.length ? (
                              <div className="flex flex-wrap gap-1.5">
                                {payment.featureCodes.map((code) => (
                                  <span
                                    key={code}
                                    className="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700"
                                  >
                                    {moduleLabel(code)}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              payment.planName || "-"
                            )}
                          </td>
                          <td className="px-5 py-4 text-slate-600">
                            {money(payment.amountNpr, payment.currency)}
                          </td>
                          <td className="px-5 py-4">
                            <span
                              className={`rounded-full px-2.5 py-1 text-xs font-semibold ${badge(payment.status)}`}
                            >
                              {payment.status}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-slate-600">
                            {payment.providerStatus || "-"}
                          </td>
                          <td className="px-5 py-4 text-slate-600">
                            {payment.transactionId || "-"}
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
                    <p className="p-10 text-center text-sm text-slate-500">
                      No payment records found.
                    </p>
                  )}
                </div>
              </section>
            </TabsContent>

            <TabsContent value="subscriptions" className="mt-4">
              <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
                <div className="max-w-full overflow-x-auto">
                  <table className="w-full min-w-[900px] text-left text-sm">
                    <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                      <tr>
                        <th className="px-5 py-3">Subscription ID</th>
                        <th className="px-5 py-3">School</th>
                        <th className="px-5 py-3">Features</th>
                        <th className="px-5 py-3">Status</th>
                        <th className="px-5 py-3">Payment</th>
                        <th className="px-5 py-3">Starts</th>
                        <th className="px-5 py-3">Ends</th>
                      </tr>
                    </thead>
                    <tbody>
                      {subscriptions.map((subscription) => (
                        <tr
                          key={subscription.id}
                          className="border-t border-slate-100"
                        >
                          <td className="px-5 py-4 font-medium text-slate-800">
                            {subscription.id}
                          </td>
                          <td className="px-5 py-4 text-slate-600">
                            {subscription.schoolName}
                          </td>
                          <td className="px-5 py-4 text-slate-600">
                            {subscription.featureCodes.length ? (
                              <div className="flex flex-wrap gap-1.5">
                                {subscription.featureCodes.map((code) => (
                                  <span
                                    key={code}
                                    className="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700"
                                  >
                                    {moduleLabel(code)}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              subscription.planName ||
                              subscription.planCode ||
                              "Base Platform"
                            )}
                          </td>
                          <td className="px-5 py-4">
                            <span
                              className={`rounded-full px-2.5 py-1 text-xs font-semibold ${badge(subscription.status)}`}
                            >
                              {subscription.status}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <span
                              className={`rounded-full px-2.5 py-1 text-xs font-semibold ${badge(subscription.paymentStatus)}`}
                            >
                              {subscription.paymentStatus}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-slate-600">
                            {date(subscription.startsOn)}
                          </td>
                          <td className="px-5 py-4 text-slate-600">
                            {date(subscription.endsOn)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {subscriptions.length === 0 && (
                    <p className="p-10 text-center text-sm text-slate-500">
                      No subscription records found.
                    </p>
                  )}
                </div>
              </section>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </SuperAdminLayout>
  );
}
