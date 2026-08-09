import api from "./api";
import type { AdminDashboardResponse } from "../types/dashboard";

export const localDateString = (value = new Date()): string =>
  `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}-${String(value.getDate()).padStart(2, "0")}`;

export const getAdminDashboard = async (
  academicSessionId?: number,
  signal?: AbortSignal,
): Promise<AdminDashboardResponse> => {
  const response = await api.get<AdminDashboardResponse>(
    "/dashboards/school-admin",
    { params: { academicSessionId }, signal },
  );
  return response.data;
};
