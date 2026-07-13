import { useEffect, useState } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import { getAdminDashboard } from "../../services/adminDashboardService";
import type { DashboardData } from "../../types/dashboard";
import Skeleton from "../../components/Skeleton";
import DashboardCards from "../../components/DashboardCards";
import QuickActions from "../../components/QuickActions";
import AttendanceWidget from "../../components/AttendanceWidget";
import RevenueChart from "../../components/RevenueChart";
import CalendarWidget from "../../components/CalendarWidget";
import NoticeBoard from "../../components/NoticeBoard";
import LeaveRequests from "../../components/LeaveRequests";
import UpcomingEvents from "../../components/UpcomingEvents";
import IncomeExpenseChart from "../../components/IncomeExpenseChart";
import UserOverview from "../../components/UserOverview";
import TopStudents from "../../components/TopStudents";
import TopTeachers from "../../components/TopTeachers";
import AdmissionsChart from "../../components/AdmissionsChart";
import RecentActivities from "../../components/RecentActivities";
import BirthdayStudents from "../../components/BirthdayStudents";
import UpcomingFeeDue from "../../components/UpcomingFeeDue";
import RecentNotifications from "../../components/RecentNotifications";
import { UserPlus, UserCheck, School, FileText, Megaphone, CalendarDays } from "lucide-react";

const SchoolDashboard = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await getAdminDashboard();
        setData(result);
      } catch {
        setError("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <div>
            <Skeleton className="h-10 w-48 mb-2" />
            <Skeleton className="h-6 w-96" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <p className="text-red-600 text-lg font-medium">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-[#234A91] text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!data) {
    return null;
  }

  const quickActions = [
    { label: "Add Student", icon: <UserPlus size={20} />, onClick: () => {} },
    { label: "Add Teacher", icon: <UserCheck size={20} />, onClick: () => {} },
    { label: "Create Class", icon: <School size={20} />, onClick: () => {} },
    { label: "Create Exam", icon: <FileText size={20} />, onClick: () => {} },
    { label: "Publish Notice", icon: <Megaphone size={20} />, onClick: () => {} },
    { label: "Add Event", icon: <CalendarDays size={20} />, onClick: () => {} },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-[42px] font-bold text-gray-800 mb-2">
            Dashboard
          </h1>
          <p className="text-gray-600 text-xl mb-10">
            {data.schoolName} → Manage your school efficiently
          </p>
        </div>

        {/* Stat Cards */}
        <DashboardCards stats={data.statistics} />

        {/* Quick Actions */}
        <QuickActions actions={quickActions} />

        {/* Attendance + Revenue + Notice Board */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <AttendanceWidget attendance={data.attendance} />
          <RevenueChart revenue={data.revenue} />
          <NoticeBoard notices={data.notices} />
        </div>

        {/* Calendar + Leave Requests + Upcoming Events */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <CalendarWidget events={data.calendar} />
          <LeaveRequests leaves={data.leaves} />
          <UpcomingEvents events={data.events} />
        </div>

        {/* Income vs Expense + User Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <IncomeExpenseChart revenue={data.revenue} />
          <UserOverview userOverview={data.userOverview} />
        </div>

        {/* Top Students + Top Teachers */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TopStudents students={data.topStudents} />
          <TopTeachers teachers={data.topTeachers} />
        </div>

        {/* Admissions + Recent Activities */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AdmissionsChart admissions={data.admissions} />
          <RecentActivities activities={data.recentActivities} />
        </div>

        {/* Birthday Students + Upcoming Fee Due + Recent Notifications */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <BirthdayStudents birthdayStudents={data.birthdayStudents} />
          <UpcomingFeeDue feeDues={data.upcomingFeeDues} />
          <RecentNotifications notifications={data.recentNotifications} />
        </div>
      </div>
    </AdminLayout>
  );
};

export default SchoolDashboard;
