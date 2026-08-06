import api from "./api";

export interface DashboardMetrics {
  [key: string]: unknown;
}

export interface DashboardCharts {
  [key: string]: Record<string, unknown> | undefined;
}

export interface DashboardResponse {
  metrics: DashboardMetrics;
  charts: DashboardCharts;
}

export const getSchoolAdminDashboard = async (): Promise<DashboardResponse> => {
  const response = await api.get("/dashboards/school-admin");
  return response.data;
};

export const getTeacherDashboard = async (): Promise<DashboardResponse> => {
  const response = await api.get("/dashboards/teacher");
  return response.data;
};

export const getStudentDashboard = async (): Promise<DashboardResponse> => {
  const response = await api.get("/dashboards/student");
  return response.data;
};

export const getParentDashboard = async (): Promise<DashboardResponse> => {
  const response = await api.get("/dashboards/parent");
  return response.data;
};
