import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import SuperAdminLayout from "../../layouts/SuperAdminLayout";
import StatCard from "../../components/StatCard";
import {
  School,
  GraduationCap,
  Users,
  Wallet,
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

export default function Dashboard() {
  const [schoolCount, setSchoolCount] = useState<number | null>(null);
  const [totalDemoRequests, setTotalDemoRequests] = useState(0);
  const [activeDemos, setActiveDemos] = useState(0);
  const [expiredDemos, setExpiredDemos] = useState(0);
  const [convertedCount, setConvertedCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getSchools().catch(() => [] as any[]),
      getAdminDemoRequests().catch(() => [] as any[]),
      getDemoAccounts().catch(() => [] as any[]),
      getConversionHistory().catch(() => [] as any[]),
    ]).then(([schools, requests, accounts, conversions]) => {
      setSchoolCount((schools as any[]).length);
      setTotalDemoRequests((requests as any[]).length);
      setActiveDemos((accounts as any[]).filter((a: any) => a.status === "ACTIVE" || a.status === "EXTENDED").length);
      setExpiredDemos((accounts as any[]).filter((a: any) => a.status === "EXPIRED").length);
      setConvertedCount((conversions as any[]).length);
    }).finally(() => setLoading(false));
  }, []);

  const conversionRate = totalDemoRequests > 0 ? ((convertedCount / totalDemoRequests) * 100).toFixed(1) : "0.0";

  return (
    <SuperAdminLayout>
      <h1 className="text-[42px] font-bold text-gray-800 mb-2">Dashboard</h1>

      <p className="text-gray-600 text-xl mb-10">
        Super Admin → Create Schools and Provide required access
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl">
        <Link to="/super-admin/schools" className="block">
          <StatCard
            title="Total Schools"
            value={loading ? "..." : schoolCount !== null ? schoolCount.toLocaleString() : "0"}
            icon={<School />}
            iconBg="bg-orange-500"
          />
        </Link>

        <Link to="/super-admin/demo-requests" className="block">
          <StatCard
            title="Total Demo Requests"
            value={loading ? "..." : totalDemoRequests.toLocaleString()}
            icon={<ClipboardList />}
            iconBg="bg-blue-500"
          />
        </Link>

        <StatCard
          title="Active Demo Accounts"
          value={loading ? "..." : activeDemos.toLocaleString()}
          icon={<Activity />}
          iconBg="bg-green-500"
        />

        <StatCard
          title="Expired Demo Accounts"
          value={loading ? "..." : expiredDemos.toLocaleString()}
          icon={<XCircle />}
          iconBg="bg-red-500"
        />

        <Link to="/super-admin/demo-conversions" className="block">
          <StatCard
            title="Converted Schools"
            value={loading ? "..." : convertedCount.toLocaleString()}
            icon={<FileCheck />}
            iconBg="bg-purple-500"
          />
        </Link>

        <StatCard
          title="Conversion Rate"
          value={loading ? "..." : `${conversionRate}%`}
          icon={<TrendingUp />}
          iconBg="bg-teal-500"
        />

        <StatCard
          title="Total Student"
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
