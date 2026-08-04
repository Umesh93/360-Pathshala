import React from "react";
import type { EmploymentData } from "../schemas/teacher.schema";
import RequiredLabel from "../../../../components/forms/RequiredLabel";

interface TeacherEmploymentSectionProps {
  data: EmploymentData;
  onChange: (data: EmploymentData) => void;
  errors?: Record<string, string>;
}

const TeacherEmploymentSection: React.FC<TeacherEmploymentSectionProps> = ({
  data,
  onChange,
  errors = {},
}) => {
  const update = (field: keyof EmploymentData, value: string) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Employment Information</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <RequiredLabel required>Teacher ID</RequiredLabel>
          <div>
            <input
              type="text"
              value={data.teacherId}
              readOnly
              className="h-10 flex-1 rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm outline-none"
            />
          </div>
          {errors.teacherId && <p className="mt-1 text-xs text-red-600">{errors.teacherId}</p>}
        </div>

        <div>
          <RequiredLabel required>Employee Code</RequiredLabel>
          <div>
            <input
              type="text"
              value={data.employeeCode}
              readOnly
              className="h-10 flex-1 rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm outline-none"
            />
          </div>
          {errors.employeeCode && <p className="mt-1 text-xs text-red-600">{errors.employeeCode}</p>}
        </div>

        <div>
          <RequiredLabel required>Joining Date</RequiredLabel>
          <input
            type="date"
            value={data.joiningDate}
            onChange={(e) => update("joiningDate", e.target.value)}
            className={`h-10 w-full rounded-xl border px-3 text-sm outline-none focus:border-[#234A91] focus:ring-2 focus:ring-blue-100 ${
              errors.joiningDate ? "border-red-500" : "border-gray-200"
            }`}
          />
          {errors.joiningDate && <p className="mt-1 text-xs text-red-600">{errors.joiningDate}</p>}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Employment Type <span className="text-red-500">*</span></label>
          <select
            value={data.employmentType}
            onChange={(e) => update("employmentType", e.target.value)}
            className="h-10 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-[#234A91] focus:ring-2 focus:ring-blue-100"
          >
            <option value="permanent">Permanent</option>
            <option value="contract">Contract</option>
            <option value="part-time">Part-Time</option>
            <option value="visiting">Visiting</option>
            <option value="intern">Intern</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Department <span className="text-red-500">*</span></label>
          <select
            value={data.department}
            onChange={(e) => update("department", e.target.value)}
            className={`h-10 w-full rounded-xl border px-3 text-sm outline-none focus:border-[#234A91] focus:ring-2 focus:ring-blue-100 ${
              errors.department ? "border-red-500" : "border-gray-200"
            }`}
          >
            <option value="">Select Department</option>
            <option value="Mathematics">Mathematics</option>
            <option value="Science">Science</option>
            <option value="English">English</option>
            <option value="Social Studies">Social Studies</option>
            <option value="Computer Science">Computer Science</option>
            <option value="Physical Education">Physical Education</option>
          </select>
          {errors.department && <p className="mt-1 text-xs text-red-600">{errors.department}</p>}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Designation <span className="text-red-500">*</span></label>
          <select
            value={data.designation}
            onChange={(e) => update("designation", e.target.value)}
            className={`h-10 w-full rounded-xl border px-3 text-sm outline-none focus:border-[#234A91] focus:ring-2 focus:ring-blue-100 ${
              errors.designation ? "border-red-500" : "border-gray-200"
            }`}
          >
            <option value="">Select Designation</option>
            <option value="Teacher">Teacher</option>
            <option value="Senior Teacher">Senior Teacher</option>
            <option value="HOD">Head of Department</option>
            <option value="Vice Principal">Vice Principal</option>
          </select>
          {errors.designation && <p className="mt-1 text-xs text-red-600">{errors.designation}</p>}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Status <span className="text-red-500">*</span></label>
          <select
            value={data.status}
            onChange={(e) => update("status", e.target.value)}
            className="h-10 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-[#234A91] focus:ring-2 focus:ring-blue-100"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="resigned">Resigned</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Reporting Manager</label>
          <input
            type="text"
            value={data.reportingManager}
            onChange={(e) => update("reportingManager", e.target.value)}
            className="h-10 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-[#234A91] focus:ring-2 focus:ring-blue-100"
          />
        </div>
      </div>
    </div>
  );
};

export default TeacherEmploymentSection;
