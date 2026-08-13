import React from "react";

interface TeacherStatusBadgeProps {
  status: "active" | "inactive" | "resigned" | "suspended";
}

const TeacherStatusBadge: React.FC<TeacherStatusBadgeProps> = ({ status }) => {
  return (
    <span
      className={`
        inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
        ${status === "active" ? "bg-green-100 text-green-700" : status === "inactive" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"}
      `}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
          status === "active"
            ? "bg-green-500"
            : status === "inactive"
              ? "bg-red-500"
              : "bg-yellow-500"
        }`}
      ></span>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

export default TeacherStatusBadge;
