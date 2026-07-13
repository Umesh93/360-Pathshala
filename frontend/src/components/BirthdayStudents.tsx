import React from "react";
import { Cake } from "lucide-react";
import type { BirthdayStudent } from "../types/dashboard";

interface BirthdayStudentsProps {
  birthdayStudents: BirthdayStudent[];
}

const BirthdayStudents: React.FC<BirthdayStudentsProps> = ({ birthdayStudents }) => {
  if (birthdayStudents.length === 0) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Today&apos;s Birthday Students
        </h3>
        <p className="text-sm text-gray-400 text-center py-8">
          No birthdays today
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Today&apos;s Birthday Students
      </h3>

      <div className="space-y-3">
        {birthdayStudents.map((student) => (
          <div
            key={student.id}
            className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center shrink-0">
              <Cake size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium text-gray-800 truncate">
                {student.name}
              </h4>
              <p className="text-xs text-gray-500">{student.class}</p>
            </div>
            <span className="text-xs text-gray-400">{student.date}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BirthdayStudents;
