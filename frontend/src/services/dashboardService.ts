import api from "./api";
import type {
  ParentDashboardResponse,
  StudentDashboardResponse,
  TeacherDashboardResponse,
} from "../types/dashboard";

export const getTeacherDashboard =
  async (): Promise<TeacherDashboardResponse> => {
    const response = await api.get<TeacherDashboardResponse>(
      "/dashboards/teacher/summary",
    );
    return response.data;
  };

export const getStudentDashboard =
  async (): Promise<StudentDashboardResponse> => {
    const response = await api.get<StudentDashboardResponse>(
      "/dashboards/student/summary",
    );
    return response.data;
  };

export const getParentDashboard =
  async (): Promise<ParentDashboardResponse> => {
    const response = await api.get<ParentDashboardResponse>(
      "/dashboards/parent/summary",
    );
    return response.data;
  };
