import { GraduationCap, UserCheck, Users, UserCog } from "lucide-react";
import type { UserOverview } from "../types/dashboard";

interface UserOverviewProps {
  userOverview: UserOverview;
}

const UserOverviewComponent: React.FC<UserOverviewProps> = ({ userOverview }) => {
  const items = [
    {
      label: "Students",
      value: userOverview.students,
      icon: <GraduationCap size={20} />,
      color: "bg-blue-500",
    },
    {
      label: "Teachers",
      value: userOverview.teachers,
      icon: <UserCheck size={20} />,
      color: "bg-green-500",
    },
    {
      label: "Parents",
      value: userOverview.parents,
      icon: <Users size={20} />,
      color: "bg-purple-500",
    },
    {
      label: "Staff",
      value: userOverview.staff,
      icon: <UserCog size={20} />,
      color: "bg-orange-500",
    },
  ];

  const maxValue = Math.max(...items.map((i) => i.value), 1);

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        User Overview
      </h3>

      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.label}>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${item.color}`}
                >
                  {item.icon}
                </div>
                <span className="text-sm text-gray-600">{item.label}</span>
              </div>
              <span className="text-sm font-bold text-gray-800">
                {item.value.toLocaleString("en-NP")}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`${item.color} h-2 rounded-full transition-all duration-500`}
                style={{ width: `${(item.value / maxValue) * 100}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserOverviewComponent;
