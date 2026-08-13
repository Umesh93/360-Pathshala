export type SubscriptionStatus =
  | "ACTIVE"
  | "DEMO"
  | "SCHEDULED"
  | "PENDING"
  | "EXPIRED"
  | "CANCELLED"
  | "FAILED";

export type SubscriptionPaymentStatus =
  "PAID" | "PENDING" | "FAILED" | "REFUNDED" | "NOT_REQUIRED";

export type PaymentStatus =
  | "INITIATED"
  | "PENDING"
  | "COMPLETED"
  | "FAILED"
  | "CANCELLED"
  | "EXPIRED"
  | "REFUNDED";

export interface Plan {
  id: number;
  code: string;
  name: string;
  price: number;
  durationDays: number;
  currency: string;
  active: boolean;
  moduleCodes: string[];
}

export type FeatureBillingType = "REQUIRED" | "INCLUDED" | "PAID";

export interface Feature {
  code: string;
  name: string;
  description: string | null;
  billingType: FeatureBillingType;
  annualPrice: number;
  billingPeriod: string;
  active: boolean;
}

export interface CurrentSubscription {
  id: number;
  schoolId: number;
  schoolName: string;
  planId: number | null;
  planCode: string | null;
  planName: string | null;
  status: SubscriptionStatus;
  paymentStatus: SubscriptionPaymentStatus;
  currency: string;
  featureCodes: string[];
  startsOn: string | null;
  endsOn: string | null;
  entitlements: SubscriptionEntitlement[];
}

export interface SubscriptionEntitlement {
  code: string;
  active: boolean;
  managedBySubscription: boolean;
  startsOn: string | null;
  endsOn: string | null;
}

export interface Payment {
  id: number;
  schoolId: number;
  schoolName: string;
  subscriptionId: number | null;
  planId: number | null;
  planName: string | null;
  featureCodes: string[];
  purchaseOrderId: string;
  pidx: string | null;
  transactionId: string | null;
  amountPaisa: number;
  amountNpr: number;
  currency: string;
  status: PaymentStatus;
  providerStatus: string | null;
  paymentUrl: string | null;
  initiatedAt: string;
  verifiedAt: string | null;
  failureReason: string | null;
}
