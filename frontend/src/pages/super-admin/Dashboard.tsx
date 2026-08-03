import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import SuperAdminLayout from "../../layouts/SuperAdminLayout";
import StatCard from "../../components/StatCard";
import Skeleton from "../../components/Skeleton";
import {
  School,
  GraduationCap,
  Users,
  ClipboardList,
  FileCheck,
  Activity,
  XCircle,
  TrendingUp,
} from "lucide-react";
import { getSchools } from "../../services/schoolService";
import { getAdminDemoRequests } from "../../services/demoRequestService";
import { getDemoAccounts } from "../../services/demoAccountService";
import { getConversionHistory } from "../../services/conversionHistoryService";
import PageHeader from "../../components/layout/PageHeader";
import ErrorState from "../../components/feedback/ErrorState";

export default function Dashboard() {
  const [schoolCount, setSchoolCount] = useState<number | null>(null);
  const [totalDemoRequests, setTotalDemoRequests] = useState(0);
  const [activeDemos, setActiveDemos] = useState(0);
  const [expiredDemos, setExpiredDemos] = useState(0);
  const [convertedCount, setConvertedCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      getSchools().catch(() => []),
      getAdminDemoRequests().catch(() => []),
      getDemoAccounts().catch(() => []),
      getConversionHistory().catch(() => []),
    ])
      .then(([schools, requests, accounts, conversions]) => {
        setSchoolCount((schools as { id: number }[]).length);
        setTotalDemoRequests((requests as { id: number }[]).length);
        setActiveDemos((accounts as { status: string }[]).filter((a) => a.status === "ACTIVE" || a.status === "EXTENDED").length);
        setExpiredDemos((accounts as { status: string }[]).filter((a) => a.status === "EXPIRED").length);
        setConvertedCount((conversions as { id: number }[]).length);
      })
      .catch(() => setError("Failed to load dashboard data"))
      .finally(() => setLoading(false));
  }, []);

  const conversionRate = totalDemoRequests > 0 ? ((convertedCount / totalDemoRequests) * 100).toFixed(1) : "0.0";

  if (loading) {
    return (
      <SuperAdminLayout>
        <div className="space-y-6">
          <div>
            <Skeleton className="h-10 w-48 mb-2" />
            <Skeleton className="h-6 w-96 mb-6" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        </div>
      </SuperAdminLayout>
    );
  }

  if (error) {
    return (
      <SuperAdminLayout>
        <PageHeader title="Dashboard" subtitle="Super Admin → Create Schools and Provide required access" />
        <ErrorState description={error} onRetry={() => window.location.reload()} />
      </SuperAdminLayout>
    );
  }

  return (
    <SuperAdminLayout>
      <PageHeader
        title="Dashboard"
        subtitle="Super Admin → Create Schools and Provide required access"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl">
        <Link to="/super-admin/schools" className="block">
          <StatCard
            title="Total Schools"
            value={schoolCount !== null ? schoolCount.toLocaleString() : "0"}
            icon={<School />}
            iconBg="bg-orange-500"
          />
        </Link>

        <Link to="/super-admin/demo-requests" className="block">
          <StatCard
            title="Total Demo Requests"
            value={totalDemoRequests.toLocaleString()}
            icon={<ClipboardList />}
            iconBg="bg-blue-500"
          />
        </Link>

        <StatCard
          title="Active Demo Accounts"
          value={activeDemos.toLocaleString()}
          icon={<Activity />}
          iconBg="bg-green-500"
        />

        <StatCard
          title="Expired Demo Accounts"
          value={expiredDemos.toLocaleString()}
          icon={<XCircle />}
          iconBg="bg-red-500"
        />

        <Link to="/super-admin/demo-conversions" className="block">
          <StatCard
            title="Converted Schools"
            value={convertedCount.toLocaleString()}
            icon={<FileCheck />}
            iconBg="bg-purple-500"
          />
        </Link>

        <StatCard
          title="Conversion Rate"
          value={`${conversionRate}%`}
          icon={<TrendingUp />}
          iconBg="bg-teal-500"
        />

        <StatCard
          title="Total Students"
          value="—"
          icon={<GraduationCap />}
          iconBg="bg-blue-500"
        />

        <StatCard
          title="Total Teachers"
          value="—"
          icon={<Users />}
          iconBg="bg-purple-500"
        />
      </div>
    </SuperAdminLayout>
  );
}
