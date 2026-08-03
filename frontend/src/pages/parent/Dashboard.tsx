import { useEffect, useState } from "react";
import ParentLayout from "../../layouts/ParentLayout";
import { getParentDashboard } from "../../services/dashboardService";
import type { DashboardResponse } from "../../services/dashboardService";
import Skeleton from "../../components/Skeleton";
import StatCard from "../../components/StatCard";
import { Wallet, ClipboardCheck, FileText, CalendarDays } from "lucide-react";
import PageHeader from "../../components/layout/PageHeader";
import ErrorState from "../../components/feedback/ErrorState";
import ChartCard from "../../components/dashboard/ChartCard";

const ParentDashboard = () => {
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await getParentDashboard();
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
      <ParentLayout>
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
      </ParentLayout>
    );
  }

  if (error) {
    return (
      <ParentLayout>
        <PageHeader title="Parent / Guardian Dashboard" subtitle="Here's your children's overview." />
        <ErrorState description={error} onRetry={() => window.location.reload()} />
      </ParentLayout>
    );
  }

  if (!data) return null;

  const metrics = data.metrics || {};
  const charts = data.charts || {};

  return (
    <ParentLayout>
      <PageHeader title="Parent / Guardian Dashboard" subtitle="Here's your children's overview." />

      <div className="space-y-4 md:space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Outstanding Fees"
            value={String(metrics.feeCollected || 0)}
            icon={<Wallet />}
            iconBg="bg-blue-500"
          />
          <StatCard
            title="Child Attendance (Today)"
            value={String((charts?.childAttendance?.present as number) || 0)}
            icon={<ClipboardCheck />}
            iconBg="bg-green-500"
          />
          <StatCard
            title="Pending Assignments"
            value={String(metrics.pendingAssignments || 0)}
            icon={<FileText />}
            iconBg="bg-purple-500"
          />
          <StatCard
            title="Upcoming Events"
            value={String(metrics.upcomingEvents || 0)}
            icon={<CalendarDays />}
            iconBg="bg-orange-500"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard title="Child Performance">
            <div className="h-64 flex items-center justify-center text-gray-400 text-sm">
              Performance chart placeholder
            </div>
          </ChartCard>
          <ChartCard title="Recent Activities">
            <div className="h-64 flex items-center justify-center text-gray-400 text-sm">
              Activities placeholder
            </div>
          </ChartCard>
        </div>
      </div>
    </ParentLayout>
  );
};

export default ParentDashboard;
