import React from "react";
import type { EducationData } from "../schemas/teacher.schema";

interface TeacherEducationSectionProps {
  data: EducationData;
  onChange: (data: EducationData) => void;
  errors?: Record<string, string>;
}

const TeacherEducationSection: React.FC<TeacherEducationSectionProps> = ({
  data,
  onChange,
  errors = {},
}) => {
  const update = (field: keyof EducationData, value: string | string[]) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">
        Education & Professional Details
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Highest Qualification <span className="text-red-500">*</span>
          </label>
          <select
            value={data.highestQualification}
            onChange={(e) => update("highestQualification", e.target.value)}
            className={`h-10 w-full rounded-xl border px-3 text-sm outline-none focus:border-[#234A91] focus:ring-2 focus:ring-blue-100 ${
              errors.highestQualification ? "border-red-500" : "border-gray-200"
            }`}
          >
            <option value="">Select</option>
            <option value="Bachelor">Bachelor</option>
            <option value="Master">Master</option>
            <option value="M.Phil">M.Phil</option>
            <option value="PhD">PhD</option>
          </select>
          {errors.highestQualification && (
            <p className="mt-1 text-xs text-red-600">
              {errors.highestQualification}
            </p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            University
          </label>
          <input
            type="text"
            value={data.university}
            onChange={(e) => update("university", e.target.value)}
            className="h-10 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-[#234A91] focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Specialization
          </label>
          <input
            type="text"
            value={data.specialization}
            onChange={(e) => update("specialization", e.target.value)}
            className="h-10 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-[#234A91] focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Passing Year
          </label>
          <input
            type="text"
            value={data.passingYear}
            onChange={(e) => update("passingYear", e.target.value)}
            className="h-10 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-[#234A91] focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Experience (Years)
          </label>
          <input
            type="text"
            value={data.experience}
            onChange={(e) => update("experience", e.target.value)}
            className="h-10 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-[#234A91] focus:ring-2 focus:ring-blue-100"
          />
        </div>
      </div>
    </div>
  );
};

export default TeacherEducationSection;
