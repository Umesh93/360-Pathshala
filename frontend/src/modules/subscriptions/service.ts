import axios from "axios";

import api from "@/config/axios";

import type { CurrentSubscription, Feature, Payment, Plan } from "./types";

const MODULE_LABELS: Record<string, string> = {
  STUDENT_MANAGEMENT: "Student Registration",
  TEACHER_MANAGEMENT: "Teacher Registration",
  SUBJECT_MANAGEMENT: "Class & Subject Management",
  TEACHER_ASSIGNMENT: "Teacher Assignment",
  PARENT_MANAGEMENT: "Parent / Guardian Management",
  ATTENDANCE: "Attendance Management",
  EXAMINATION: "Examination & Result Publishing",
  ASSIGNMENT: "Assignment Management",
  FEE_MANAGEMENT: "Fee Management",
  HOSTEL: "Hostel Management",
  TRANSPORT: "Transport Management",
  ACADEMIC_CALENDAR: "Academic Calendar",
  TIMETABLE: "Timetable Management",
  STUDENT_DASHBOARD: "Student Dashboard",
  TEACHER_DASHBOARD: "Teacher Dashboard",
  PARENT_DASHBOARD: "Parent Dashboard",
  CERTIFICATES: "Certificates",
};

export const moduleLabel = (code: string): string =>
  MODULE_LABELS[code] ??
  code
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

export const subscriptionError = (
  error: unknown,
  fallback = "Request failed. Please try again.",
): string => {
  if (!axios.isAxiosError(error))
    return error instanceof Error ? error.message : fallback;
  const data = error.response?.data as
    { message?: string; error?: string } | string | undefined;
  if (typeof data === "string" && data.trim()) return data;
  if (data && typeof data === "object") {
    return data.message ?? data.error ?? error.message ?? fallback;
  }
  return error.message || fallback;
};

export const getPlans = async (): Promise<Plan[]> =>
  (await api.get<Plan[]>("/admin/subscriptions/plans")).data;

export const getFeatures = async (): Promise<Feature[]> =>
  (await api.get<Feature[]>("/admin/subscriptions/features")).data;

export const getCurrentSubscription =
  async (): Promise<CurrentSubscription | null> => {
    try {
      const response = await api.get<CurrentSubscription | null>(
        "/admin/subscriptions/current",
      );
      return response.data || null;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404)
        return null;
      throw error;
    }
  };

export const getPayments = async (): Promise<Payment[]> =>
  (await api.get<Payment[]>("/admin/subscriptions/payments")).data;

export const initiatePayment = async (
  featureCodes: string[],
): Promise<Payment> =>
  (
    await api.post<Payment>("/admin/subscriptions/payment/initiate", {
      featureCodes,
    })
  ).data;

export const getPayment = async (id: number): Promise<Payment> =>
  (await api.get<Payment>(`/admin/subscriptions/payments/${id}`)).data;

export const refreshPayment = async (id: number): Promise<Payment> =>
  (await api.post<Payment>(`/admin/subscriptions/payments/${id}/refresh`)).data;

export const getSaasPayments = async (): Promise<Payment[]> =>
  (await api.get<Payment[]>("/saas/payments")).data;

export const getSaasSubscriptions = async (): Promise<CurrentSubscription[]> =>
  (await api.get<CurrentSubscription[]>("/saas/subscriptions")).data;
