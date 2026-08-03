import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../layouts/AdminLayout";
import { getAdminDashboard } from "../../services/adminDashboardService";
import type { DashboardData } from "../../types/dashboard";
import Skeleton from "../../components/Skeleton";
import DashboardCards from "../../components/DashboardCards";
import QuickActions from "../../components/QuickActions";
import AttendanceWidget from "../../components/AttendanceWidget";
import RevenueChart from "../../components/RevenueChart";
import NoticeBoard from "../../components/NoticeBoard";
import CalendarWidget from "../../components/CalendarWidget";
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
import PageHeader from "../../components/layout/PageHeader";
import ErrorState from "../../components/feedback/ErrorState";
import ChartCard from "../../components/dashboard/ChartCard";

const SchoolDashboard = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const quickActions = [
    { label: "Add Student", icon: <UserPlus size={20} />, onClick: () => navigate("/admin/students/add") },
    { label: "Add Teacher", icon: <UserCheck size={20} />, onClick: () => navigate("/admin/teachers/add") },
    { label: "Create Class", icon: <School size={20} />, onClick: () => navigate("/admin/classes") },
    { label: "Create Exam", icon: <FileText size={20} />, onClick: () => navigate("/admin/examinations") },
    { label: "Publish Notice", icon: <Megaphone size={20} />, onClick: () => navigate("/admin/dashboard") },
    { label: "Add Event", icon: <CalendarDays size={20} />, onClick: () => navigate("/admin/calendar") },
  ];

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
        <PageHeader title="Dashboard" subtitle="Manage your school efficiently" />
        <ErrorState description={error} onRetry={fetchData} />
      </AdminLayout>
    );
  }

  if (!data) return null;

  return (
    <AdminLayout>
      <PageHeader
        title="Dashboard"
        subtitle={`${data.schoolName} → Manage your school efficiently`}
      />

      <div className="space-y-4 md:space-y-6">
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
          <ChartCard title="Income vs Expense" subtitle="Financial overview">
            <IncomeExpenseChart revenue={data.revenue} />
          </ChartCard>
          <ChartCard title="User Overview">
            <UserOverview userOverview={data.userOverview} />
          </ChartCard>
        </div>

        {/* Top Students + Top Teachers */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard title="Top Students">
            <TopStudents students={data.topStudents} />
          </ChartCard>
          <ChartCard title="Top Teachers">
            <TopTeachers teachers={data.topTeachers} />
          </ChartCard>
        </div>

        {/* Admissions + Recent Activities */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard title="Admissions">
            <AdmissionsChart admissions={data.admissions} />
          </ChartCard>
          <ChartCard title="Recent Activities">
            <RecentActivities activities={data.recentActivities} />
          </ChartCard>
        </div>

        {/* Birthday Students + Upcoming Fee Due + Recent Notifications */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <ChartCard title="Birthday Students">
            <BirthdayStudents birthdayStudents={data.birthdayStudents} />
          </ChartCard>
          <ChartCard title="Upcoming Fee Dues">
            <UpcomingFeeDue feeDues={data.upcomingFeeDues} />
          </ChartCard>
          <ChartCard title="Recent Notifications">
            <RecentNotifications notifications={data.recentNotifications} />
          </ChartCard>
        </div>
      </div>
    </AdminLayout>
  );
};

export default SchoolDashboard;
