import api from "./api";
import type { DashboardData } from "../types/dashboard";

export const getAdminDashboard = async (): Promise<DashboardData> => {
  const response = await api.get("/dashboards/school-admin");
  const { metrics, charts } = response.data;

  return {
    schoolName: metrics.schoolName || "School",
    statistics: {
      totalStudents: metrics.totalStudents || 0,
      totalTeachers: metrics.totalTeachers || 0,
      totalParents: 0,
      totalClasses: 0,
      attendanceToday: (charts?.attendance?.present as number) || 0,
      feeCollectionThisMonth: metrics.feeCollection || 0,
      pendingFees: (charts?.fees?.expected as number) - (charts?.fees?.collected as number) || 0,
      upcomingExams: 0,
      upcomingEvents: 0,
    },
    attendance: {
      present: (charts?.attendance?.present as number) || 0,
      absent: 0,
      late: 0,
      leave: 0,
      halfDay: 0,
      total: metrics.totalStudents || 0,
      trend: [],
    },
    revenue: {
      monthlyFeeCollection: metrics.feeCollection || 0,
      pendingCollection: 0,
      collectedAmount: metrics.feeCollection || 0,
      monthlyData: [],
    },
    notices: [],
    leaves: [],
    calendar: [],
    events: [],
    topStudents: [],
    topTeachers: [],
    recentActivities: [],
    admissions: [],
    userOverview: {
      students: metrics.totalStudents || 0,
      teachers: metrics.totalTeachers || 0,
      parents: 0,
      staff: 0,
    },
    birthdayStudents: [],
    upcomingFeeDues: [],
    recentNotifications: [],
  };
};
