import React from "react";
import { AlertTriangle, Clock } from "lucide-react";
import type { FeeDue } from "../types/dashboard";

interface UpcomingFeeDueProps {
  feeDues: FeeDue[];
}

const UpcomingFeeDue: React.FC<UpcomingFeeDueProps> = ({ feeDues }) => {
  if (feeDues.length === 0) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Upcoming Fee Due
        </h3>
        <p className="text-sm text-gray-400 text-center py-8">
          No upcoming fee dues
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Upcoming Fee Due
      </h3>

      <div className="space-y-3">
        {feeDues.map((fee) => (
          <div
            key={fee.id}
            className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                fee.status === "overdue"
                  ? "bg-red-100 text-red-600"
                  : "bg-orange-100 text-orange-600"
              }`}
            >
              {fee.status === "overdue" ? (
                <AlertTriangle size={20} />
              ) : (
                <Clock size={20} />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium text-gray-800 truncate">
                {fee.studentName}
              </h4>
              <p className="text-xs text-gray-500">{fee.class}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-gray-800">
                Rs. {fee.amount.toLocaleString("en-NP")}
              </p>
              <p className="text-xs text-gray-500">Due: {fee.dueDate}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UpcomingFeeDue;
