import React from "react";
import type { TopTeacher } from "../types/dashboard";

interface TopTeachersProps {
  teachers: TopTeacher[];
}

const TopTeachers: React.FC<TopTeachersProps> = ({ teachers }) => {
  if (teachers.length === 0) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Top Teachers
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
        Top Performing Teachers
      </h3>

      <div className="space-y-4">
        {teachers.map((teacher, index) => (
          <div
            key={teacher.id}
            className="flex items-center gap-4"
          >
            <div className="w-8 h-8 rounded-full bg-[#234A91] text-white flex items-center justify-center text-sm font-medium shrink-0">
              {index + 1}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h4 className="text-sm font-medium text-gray-800 truncate">
                  {teacher.name}
                </h4>
                <span className="text-sm font-bold text-[#234A91]">
                  {teacher.performance}%
                </span>
              </div>
              <p className="text-xs text-gray-500 mb-2">{teacher.subject}</p>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-[#234A91] h-2 rounded-full transition-all duration-500"
                  style={{ width: `${teacher.performance}%` }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TopTeachers;
