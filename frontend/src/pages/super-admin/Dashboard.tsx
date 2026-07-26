import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import SuperAdminLayout from "../../layouts/SuperAdminLayout";
import StatCard from "../../components/StatCard";
import { School, GraduationCap, Users, Wallet } from "lucide-react";
import { getSchools } from "../../services/schoolService";

export default function Dashboard() {
  const [schoolCount, setSchoolCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSchools()
      .then((schools) => {
        setSchoolCount(schools.length);
      })
      .catch((err) => {
        console.error("Failed to fetch schools for dashboard", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <SuperAdminLayout>
      <h1 className="text-[42px] font-bold text-gray-800 mb-2">Dashboard</h1>

      <p className="text-gray-600 text-xl mb-10">
        Super Admin → Create Schools and Provide required access
      </p>

      <div className="grid grid-cols-4 gap-6 max-w-6xl">
        <Link to="/super-admin/schools" className="block">
          <StatCard
            title="Total School"
            value={loading ? "..." : schoolCount !== null ? schoolCount.toLocaleString() : "0"}
            icon={<School />}
            iconBg="bg-orange-500"
          />
        </Link>

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

        <StatCard
          title="Total Earning"
          value="—"
          icon={<Wallet />}
          iconBg="bg-teal-500"
        />
      </div>
    </SuperAdminLayout>
  );
}
