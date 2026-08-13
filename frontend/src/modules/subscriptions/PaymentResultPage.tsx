import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  Loader2,
  RefreshCw,
  RotateCcw,
} from "lucide-react";

import ErrorState from "@/components/feedback/ErrorState";
import Skeleton from "@/components/Skeleton";
import { Button } from "@/components/ui/button";
import AdminLayout from "@/layouts/AdminLayout";
import { useToast } from "@/modules/admin/students/components/Toast";

import {
  getCurrentSubscription,
  getPayment,
  refreshPayment,
  subscriptionError,
} from "./service";
import type { Payment, PaymentStatus } from "./types";

const money = (payment: Payment) =>
  new Intl.NumberFormat("en-NP", {
    style: "currency",
    currency: payment.currency,
    maximumFractionDigits: 2,
  }).format(payment.amountNpr);

const notifySubscriptionUpdated = async () => {
  window.dispatchEvent(new Event("school-modules-updated"));
  try {
    await getCurrentSubscription();
  } catch {
    // Payment remains successful even if the follow-up subscription refresh fails.
  }
};

const stateContent: Record<
  PaymentStatus,
  { title: string; description: string; tone: string }
> = {
  COMPLETED: {
    title: "Payment successful",
    description:
      "Your payment was verified and the subscription has been updated.",
    tone: "text-emerald-600 bg-emerald-50",
  },
  INITIATED: {
    title: "Payment is awaiting confirmation",
    description:
      "The payment was initiated but has not been confirmed by Khalti yet.",
    tone: "text-amber-600 bg-amber-50",
  },
  PENDING: {
    title: "Payment is pending",
    description:
      "Khalti is still processing this payment. Check again shortly.",
    tone: "text-amber-600 bg-amber-50",
  },
  FAILED: {
    title: "Payment failed",
    description: "The payment could not be completed.",
    tone: "text-red-600 bg-red-50",
  },
  CANCELLED: {
    title: "Payment cancelled",
    description: "The Khalti checkout was cancelled before completion.",
    tone: "text-slate-600 bg-slate-100",
  },
  EXPIRED: {
    title: "Payment expired",
    description: "This payment session expired before it was completed.",
    tone: "text-red-600 bg-red-50",
  },
  REFUNDED: {
    title: "Payment refunded",
    description: "Khalti reports that this payment has been refunded.",
    tone: "text-blue-600 bg-blue-50",
  },
};

export default function PaymentResultPage() {
  const [searchParams] = useSearchParams();
  const { showToast } = useToast();
  const paymentId = Number(searchParams.get("paymentId"));
  const [payment, setPayment] = useState<Payment | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const initialRefreshDone = useRef(false);

  const load = useCallback(async () => {
    if (!Number.isInteger(paymentId) || paymentId <= 0) {
      setError("The payment result link is missing a valid payment ID.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      let next = await getPayment(paymentId);
      if (
        !initialRefreshDone.current &&
        (next.status === "INITIATED" || next.status === "PENDING")
      ) {
        initialRefreshDone.current = true;
        try {
          next = await refreshPayment(paymentId);
        } catch (reason) {
          showToast(
            subscriptionError(reason, "Unable to refresh payment status."),
            "error",
          );
        }
      }
      setPayment(next);
      if (next.status === "COMPLETED") {
        await notifySubscriptionUpdated();
      }
    } catch (reason) {
      setError(subscriptionError(reason, "Unable to load this payment."));
    } finally {
      setLoading(false);
    }
  }, [paymentId, showToast]);

  useEffect(() => {
    queueMicrotask(() => void load());
  }, [load]);

  const checkStatus = async () => {
    if (!payment) return;
    setRefreshing(true);
    try {
      const next = await refreshPayment(payment.id);
      setPayment(next);
      showToast("Payment status updated", "success");
      if (next.status === "COMPLETED") {
        await notifySubscriptionUpdated();
      }
    } catch (reason) {
      showToast(
        subscriptionError(reason, "Unable to refresh payment status."),
        "error",
      );
    } finally {
      setRefreshing(false);
    }
  };

  const state = payment ? stateContent[payment.status] : null;
  const StatusIcon =
    payment?.status === "COMPLETED"
      ? CheckCircle2
      : payment?.status === "INITIATED" || payment?.status === "PENDING"
        ? Clock3
        : payment?.status === "CANCELLED" || payment?.status === "REFUNDED"
          ? RotateCcw
          : AlertCircle;

  return (
    <AdminLayout>
      <div className="mx-auto flex min-h-[60vh] w-full max-w-3xl items-center justify-center">
        {loading ? (
          <Skeleton className="h-96 w-full" />
        ) : error ? (
          <section className="w-full rounded-lg bg-white shadow-sm">
            <ErrorState
              title="Payment result unavailable"
              description={error}
              onRetry={() => void load()}
            />
          </section>
        ) : payment && state ? (
          <section className="w-full rounded-lg border border-slate-200 bg-white p-6 text-center shadow-sm md:p-9">
            <div
              className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full ${state.tone}`}
            >
              <StatusIcon className="h-8 w-8" />
            </div>
            <h1 className="mt-5 text-2xl font-bold text-slate-900 md:text-3xl">
              {state.title}
            </h1>
            <p className="mx-auto mt-2 max-w-xl text-sm text-slate-600">
              {payment.failureReason || state.description}
            </p>

            <dl className="mx-auto mt-7 grid max-w-xl gap-4 rounded-lg bg-slate-50 p-5 text-left sm:grid-cols-2">
              <div>
                <dt className="text-xs text-slate-500">Order</dt>
                <dd className="mt-1 break-all text-sm font-semibold text-slate-800">
                  {payment.purchaseOrderId}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Amount</dt>
                <dd className="mt-1 text-sm font-semibold text-slate-800">
                  {money(payment)}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">API status</dt>
                <dd className="mt-1 text-sm font-semibold text-slate-800">
                  {payment.status}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Khalti status</dt>
                <dd className="mt-1 text-sm font-semibold text-slate-800">
                  {payment.providerStatus || "Not reported"}
                </dd>
              </div>
            </dl>

            <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row sm:flex-wrap">
              <Button asChild variant="outline">
                <Link to="/admin/settings/subscription">Subscription</Link>
              </Button>
              {(payment.status === "INITIATED" ||
                payment.status === "PENDING") && (
                <Button
                  disabled={refreshing}
                  onClick={() => void checkStatus()}
                  className="bg-[#234A91] hover:bg-[#193b78]"
                >
                  {refreshing ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <RefreshCw />
                  )}
                  Check status
                </Button>
              )}
              {payment.status === "COMPLETED" ? (
                <Button
                  className="bg-[#234A91] hover:bg-[#193b78]"
                  onClick={() => window.location.assign("/admin/dashboard")}
                >
                  Dashboard
                </Button>
              ) : !["INITIATED", "PENDING", "REFUNDED"].includes(
                  payment.status,
                ) ? (
                <Button asChild className="bg-[#234A91] hover:bg-[#193b78]">
                  <Link to="/admin/settings/subscription">Try again</Link>
                </Button>
              ) : null}
            </div>
          </section>
        ) : null}
      </div>
    </AdminLayout>
  );
}
