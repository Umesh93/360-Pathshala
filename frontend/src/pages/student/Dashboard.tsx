import { useEffect, useState } from "react";
import StudentLayout from "../../layouts/StudentLayout";
import { getStudentDashboard } from "../../services/dashboardService";
import type { DashboardResponse } from "../../services/dashboardService";
import Skeleton from "../../components/Skeleton";
import StatCard from "../../components/StatCard";
import { ClipboardCheck, FileText, Wallet, CalendarDays } from "lucide-react";
import PageHeader from "../../components/layout/PageHeader";
import ErrorState from "../../components/feedback/ErrorState";
import ChartCard from "../../components/dashboard/ChartCard";

const StudentDashboard = () => {
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await getStudentDashboard();
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
      <StudentLayout>
        <div className="space-y-6">
          <div>
            <Skeleton className="h-10 w-48 mb-2" />
            <Skeleton className="h-6 w-96 mb-6" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        </div>
      </StudentLayout>
    );
  }

  if (error) {
    return (
      <StudentLayout>
        <PageHeader title="Student Dashboard" subtitle="Welcome back! Here's your overview." />
        <ErrorState description={error} onRetry={() => window.location.reload()} />
      </StudentLayout>
    );
  }

  if (!data) return null;

  const metrics = data.metrics || {};
  const charts = data.charts || {};

  return (
    <StudentLayout>
      <PageHeader title="Student Dashboard" subtitle="Welcome back! Here's your overview." />

      <div className="space-y-4 md:space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="My Assignments"
            value={String(metrics.assignments || 0)}
            icon={<FileText />}
            iconBg="bg-blue-500"
          />
          <StatCard
            title="Attendance (Today)"
            value={String(charts.attendance?.present || 0)}
            icon={<ClipboardCheck />}
            iconBg="bg-green-500"
          />
          <StatCard
            title="Fee Due"
            value={String(metrics.feesDue || 0)}
            icon={<Wallet />}
            iconBg="bg-purple-500"
          />
          <StatCard
            title="Upcoming Exams"
            value={String(metrics.upcomingExams || 0)}
            icon={<CalendarDays />}
            iconBg="bg-orange-500"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard title="Recent Results">
            <div className="h-64 flex items-center justify-center text-gray-400 text-sm">
              Results chart placeholder
            </div>
          </ChartCard>
          <ChartCard title="Attendance Overview">
            <div className="h-64 flex items-center justify-center text-gray-400 text-sm">
              Attendance chart placeholder
            </div>
          </ChartCard>
        </div>
      </div>
    </StudentLayout>
  );
};

export default StudentDashboard;
