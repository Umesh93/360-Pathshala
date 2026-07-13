import React from "react";
import type { RecentAdmission } from "../types/dashboard";

interface AdmissionsChartProps {
  admissions: RecentAdmission[];
}

const AdmissionsChart: React.FC<AdmissionsChartProps> = ({ admissions }) => {
  const statusCounts = admissions.reduce((acc, curr) => {
    acc[curr.status] = (acc[curr.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const total = admissions.length;
  const confirmed = statusCounts["Confirmed"] || 0;
  const pending = statusCounts["Pending"] || 0;

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Student Admissions
      </h3>

      <div className="flex items-center gap-6 mb-6">
        <div className="relative w-24 h-24">
          <svg viewBox="0 0 36 36" className="w-24 h-24 transform -rotate-90">
            <circle
              cx="18"
              cy="18"
              r="15.9"
              fill="none"
              stroke="#E5E7EB"
              strokeWidth="4"
            />
            <circle
              cx="18"
              cy="18"
              r="15.9"
              fill="none"
              stroke="#234A91"
              strokeWidth="4"
              strokeDasharray={`${(confirmed / total) * 100}, 100`}
              strokeLinecap="round"
            />
            <circle
              cx="18"
              cy="18"
              r="15.9"
              fill="none"
              stroke="#F59E0B"
              strokeWidth="4"
              strokeDasharray={`${(pending / total) * 100}, 100`}
              strokeDashoffset={`-${(confirmed / total) * 100}`}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-sm font-bold text-gray-800">{total}</span>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#234A91]"></div>
            <span className="text-sm text-gray-600">
              Confirmed ({confirmed})
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-orange-400"></div>
            <span className="text-sm text-gray-600">Pending ({pending})</span>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
          Recent Admissions
        </h4>
        {admissions.slice(0, 4).map((admission) => (
          <div
            key={admission.id}
            className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50"
          >
            <div>
              <p className="text-sm font-medium text-gray-800">
                {admission.name}
              </p>
              <p className="text-xs text-gray-500">{admission.class}</p>
            </div>
            <span
              className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                admission.status === "Confirmed"
                  ? "bg-green-100 text-green-700"
                  : "bg-orange-100 text-orange-700"
              }`}
            >
              {admission.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdmissionsChart;
