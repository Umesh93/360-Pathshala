import SuperAdminLayout from "../../layouts/SuperAdminLayout";
import StatCard from "../../components/StatCard";
import { School, GraduationCap, Users, Wallet } from "lucide-react";

export default function Dashboard() {
  return (
    <SuperAdminLayout>
      <h1 className="text-[42px] font-bold text-gray-800 mb-2">Dashboard</h1>

      <p className="text-gray-600 text-xl mb-10">
        Super Admin → Create Schools and Provide required access
      </p>

      <div className="grid grid-cols-4 gap-6 max-w-6xl">
        <StatCard
          title="Total School"
          value="20,000"
          icon={<School />}
          iconBg="bg-orange-500"
        />

        <StatCard
          title="Total Student"
          value="20,000"
          icon={<GraduationCap />}
          iconBg="bg-blue-500"
        />

        <StatCard
          title="Total Teachers"
          value="20,000"
          icon={<Users />}
          iconBg="bg-purple-500"
        />

        <StatCard
          title="Total Earning"
          value="20,000"
          icon={<Wallet />}
          iconBg="bg-teal-500"
        />
      </div>
    </SuperAdminLayout>
  );
}
