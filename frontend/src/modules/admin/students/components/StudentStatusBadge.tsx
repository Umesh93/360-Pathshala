import React from "react";

interface StudentStatusBadgeProps {
  status: "active" | "inactive" | "transferred" | "graduated" | "suspended" | "dropped";
}

const statusConfig = {
  active: { label: "Active", bg: "bg-green-100", text: "text-green-700", dot: "bg-green-500" },
  inactive: { label: "Inactive", bg: "bg-gray-100", text: "text-gray-700", dot: "bg-gray-500" },
  transferred: { label: "Transferred", bg: "bg-yellow-100", text: "text-yellow-700", dot: "bg-yellow-500" },
  graduated: { label: "Graduated", bg: "bg-blue-100", text: "text-blue-700", dot: "bg-blue-500" },
  suspended: { label: "Suspended", bg: "bg-red-100", text: "text-red-700", dot: "bg-red-500" },
  dropped: { label: "Dropped", bg: "bg-orange-100", text: "text-orange-700", dot: "bg-orange-500" },
};

const StudentStatusBadge: React.FC<StudentStatusBadgeProps> = ({ status }) => {
  const config = statusConfig[status] || statusConfig.inactive;

  return (
    <span
      className={`
        inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
        ${config.bg} ${config.text}
      `}
    >
      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${config.dot}`} />
      {config.label}
    </span>
  );
};

export default StudentStatusBadge;
