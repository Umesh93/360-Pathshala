import React, { useState } from "react";
import { Check, X } from "lucide-react";
import type { LeaveRequest } from "../types/dashboard";

interface LeaveRequestsProps {
  leaves: LeaveRequest[];
  onApprove?: (id: number) => void;
  onReject?: (id: number) => void;
}

const LeaveRequests: React.FC<LeaveRequestsProps> = ({
  leaves,
  onApprove,
  onReject,
}) => {
  const pendingLeaves = leaves.filter((l) => l.status === "pending");
  const [localLeaves, setLocalLeaves] = useState<LeaveRequest[]>(pendingLeaves);

  const handleApprove = (id: number) => {
    setLocalLeaves((prev) =>
      prev.map((leave) =>
        leave.id === id ? { ...leave, status: "approved" as const } : leave,
      ),
    );
    onApprove?.(id);
  };

  const handleReject = (id: number) => {
    setLocalLeaves((prev) =>
      prev.map((leave) =>
        leave.id === id ? { ...leave, status: "rejected" as const } : leave,
      ),
    );
    onReject?.(id);
  };

  if (localLeaves.length === 0) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Leave Requests
        </h3>
        <p className="text-sm text-gray-400 text-center py-8">
          No pending leave requests
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Leave Requests
      </h3>

      <div className="space-y-3">
        {localLeaves.map((leave) => (
          <div
            key={leave.id}
            className="p-4 rounded-lg border border-gray-200 bg-gray-50"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    leave.type === "teacher"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-purple-100 text-purple-700"
                  }`}
                >
                  {leave.type === "teacher" ? "Teacher" : "Student"}
                </span>
                <h4 className="text-sm font-medium text-gray-800">
                  {leave.name}
                </h4>
              </div>
              <span className="text-xs text-gray-500">{leave.role}</span>
            </div>

            <p className="text-xs text-gray-500 mb-2">
              {leave.fromDate} - {leave.toDate}
            </p>
            <p className="text-sm text-gray-600 mb-3">{leave.reason}</p>

            <div className="flex gap-2">
              <button
                onClick={() => handleApprove(leave.id)}
                className="flex items-center gap-1 px-3 py-1.5 bg-green-500 text-white text-xs font-medium rounded-lg hover:bg-green-600 transition-colors"
              >
                <Check size={14} />
                Approve
              </button>
              <button
                onClick={() => handleReject(leave.id)}
                className="flex items-center gap-1 px-3 py-1.5 bg-red-500 text-white text-xs font-medium rounded-lg hover:bg-red-600 transition-colors"
              >
                <X size={14} />
                Reject
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LeaveRequests;
