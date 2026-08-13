import React from "react";
import type { TopStudent } from "../types/dashboard";

interface TopStudentsProps {
  students: TopStudent[];
}

const TopStudents: React.FC<TopStudentsProps> = ({ students }) => {
  if (students.length === 0) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Top Students
        </h3>
        <p className="text-sm text-gray-400 text-center py-8">
          No data available
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Top Performing Students
      </h3>

      <div className="space-y-4">
        {students.map((student, index) => (
          <div key={student.id} className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-full bg-[#234A91] text-white flex items-center justify-center text-sm font-medium shrink-0">
              {index + 1}
            </div>
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 shrink-0">
              {student.profileImage ? (
                <img
                  src={student.profileImage}
                  alt={student.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <span className="text-sm font-medium">
                  {student.name.charAt(0)}
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h4 className="text-sm font-medium text-gray-800 truncate">
                  {student.name}
                </h4>
                <span className="text-sm font-bold text-[#234A91]">
                  {student.marks}%
                </span>
              </div>
              <p className="text-xs text-gray-500">{student.class}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TopStudents;
