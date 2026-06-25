import React from "react";

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  iconBg: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, iconBg }) => {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <div className="flex items-center gap-4 mb-6">
        <div
          className={`w-12 h-12 rounded-full flex items-center justify-center text-white ${iconBg}`}
        >
          {icon}
        </div>

        <h3 className="text-xl font-medium">{title}</h3>
      </div>

      <h2 className="text-4xl font-bold mb-3">{value}</h2>

      <p className="text-teal-600 font-medium">
        10% ▲ <span className="text-gray-700">+5 This Month</span>
      </p>
    </div>
  );
};

export default StatCard;
