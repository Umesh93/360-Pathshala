import api from "../config/axios";
import {
  type AcceptDemoResponse,
  type CreateDemoRequestPayload,
  type DemoModuleCode,
  type DemoRequest,
  type PublicDemoRequestResponse,
  type RequestStatus,
  type UpdateDemoRequestPayload,
} from "../types/DemoRequest";

export interface PublicModule {
  code: string;
  name: string;
  description?: string | null;
  active: boolean;
  selectable?: boolean;
  comingSoon?: boolean;
  category?: string;
  required?: boolean;
  billingType: "REQUIRED" | "INCLUDED" | "PAID";
  annualPrice: number;
  billingPeriod: string;
}

const moduleLabelOverrides: Partial<Record<DemoModuleCode, string>> = {
  TEACHER_MANAGEMENT: "Teacher Registration",
  PARENT_MANAGEMENT: "Parent / Guardian Management",
  ASSIGNMENT: "Assignment Management",
  ATTENDANCE: "Attendance Management",
};

export const moduleLabel = (code: string, backendName?: string): string =>
  moduleLabelOverrides[code as DemoModuleCode] ??
  backendName ??
  code
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

export const parseModuleCodes = (value?: string | null): string[] =>
  value
    ? value
        .split(",")
        .map((code) => code.trim())
        .filter(Boolean)
    : [];

const normalizeRequest = (
  request: DemoRequest & { status: string },
): DemoRequest => ({
  ...request,
  status: (["APPROVED", "DEMO_ACCOUNT_CREATED"].includes(request.status)
    ? "ACCEPTED"
    : request.status) as RequestStatus,
});

export const submitDemoRequest = async (
  payload: CreateDemoRequestPayload,
  logo?: File,
): Promise<PublicDemoRequestResponse> => {
  const formData = new FormData();
  formData.append(
    "request",
    new Blob([JSON.stringify(payload)], { type: "application/json" }),
  );
  if (logo) formData.append("logo", logo);
  const response = await api.post("/public/demo-request", formData);
  return response.data;
};

export const getPublicModules = async (): Promise<PublicModule[]> => {
  const response = await api.get<PublicModule[]>("/public/modules");
  return response.data.filter((module) => module.active && !module.comingSoon);
};

export const getAdminDemoRequests = async (): Promise<DemoRequest[]> => {
  const response = await api.get<DemoRequest[]>("/super-admin/demo-requests");
  return response.data.map(normalizeRequest);
};

export const getAdminDemoRequest = async (id: number): Promise<DemoRequest> => {
  const response = await api.get<DemoRequest>(
    `/super-admin/demo-requests/${id}`,
  );
  return normalizeRequest(response.data);
};

export const updateAdminDemoRequest = async (
  id: number,
  payload: UpdateDemoRequestPayload,
): Promise<DemoRequest> => {
  const response = await api.put<DemoRequest>(
    `/super-admin/demo-requests/${id}`,
    payload,
  );
  return normalizeRequest(response.data);
};

export const deleteAdminDemoRequest = async (id: number): Promise<void> => {
  await api.delete(`/super-admin/demo-requests/${id}`);
};

export const acceptDemoRequest = async (
  id: number,
  username?: string,
): Promise<AcceptDemoResponse> => {
  const response = await api.post<AcceptDemoResponse>(
    `/super-admin/demo-requests/${id}/accept`,
    { remarks: null, username: username || null },
  );
  return response.data;
};

export const getDemoUsername = async (id: number, candidate?: string) =>
  (
    await api.get<{ username: string; available: boolean }>(
      `/super-admin/demo-requests/${id}/username`,
      { params: { candidate } },
    )
  ).data;

export const resendDemoCredentials = async (
  id: number,
): Promise<AcceptDemoResponse> => {
  const response = await api.post<AcceptDemoResponse>(
    `/super-admin/demo-requests/${id}/resend-credentials`,
  );
  return response.data;
};

export const rejectDemoRequest = async (id: number): Promise<DemoRequest> => {
  const response = await api.post<DemoRequest>(
    `/super-admin/demo-requests/${id}/reject`,
  );
  return normalizeRequest(response.data);
};

export const loadDemoRequestLogoUrl = async (id: number): Promise<string> => {
  const response = await api.get<Blob>(
    `/super-admin/demo-requests/${id}/logo`,
    { responseType: "blob" },
  );
  return URL.createObjectURL(response.data);
};
