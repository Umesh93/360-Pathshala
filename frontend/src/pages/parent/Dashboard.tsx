import { useEffect, useState } from "react";
import ParentLayout from "../../layouts/ParentLayout";
import { getParentDashboard } from "../../services/dashboardService";
import type { DashboardResponse } from "../../services/dashboardService";
import Skeleton from "../../components/Skeleton";
import StatCard from "../../components/StatCard";
import { Wallet, ClipboardCheck, FileText, CalendarDays } from "lucide-react";

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
          <Skeleton className="h-10 w-48 mb-2" />
          <Skeleton className="h-6 w-96 mb-6" />
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
      </ParentLayout>
    );
  }

  if (!data) return null;

  const metrics = data.metrics || {};
  const charts = data.charts || {};

  return (
    <ParentLayout>
      <div className="space-y-4 md:space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl lg:text-[42px] font-bold text-gray-800 mb-2">
            Parent / Guardian Dashboard
          </h1>
          <p className="text-gray-600 text-base md:text-xl mb-6">
            Welcome back! Here's your children's overview.
          </p>
        </div>

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
      </div>
    </ParentLayout>
  );
};

export default ParentDashboard;
