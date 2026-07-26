import React, { useEffect, useState } from "react";
import type { AcademicInfoData } from "../schemas/student.schema";
import { getNextRollNumber } from "../services/student.service";

interface StudentAcademicSectionProps {
  data: AcademicInfoData;
  onChange: (data: AcademicInfoData) => void;
  errors?: Record<string, string>;
}

const StudentAcademicSection: React.FC<StudentAcademicSectionProps> = ({
  data,
  onChange,
  errors = {},
}) => {
  const update = (field: keyof AcademicInfoData, value: string) => {
    onChange({ ...data, [field]: value });
  };

  const [rollNumberLoading, setRollNumberLoading] = useState(false);

  useEffect(() => {
    if (data.class && data.section) {
      setRollNumberLoading(true);
      getNextRollNumber(data.class, data.section).then((result) => {
        update("rollNumber", String(result.nextRollNumber));
        setRollNumberLoading(false);
      });
    }
  }, [data.class, data.section]);

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">
        Academic Information
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Academic Year
          </label>
          <select
            value={data.academicYear}
            onChange={(e) => update("academicYear", e.target.value)}
            className={`h-10 w-full rounded-xl border px-3 text-sm outline-none focus:border-[#234A91] focus:ring-2 focus:ring-blue-100 ${
              errors.academicYear ? "border-red-500" : "border-gray-200"
            }`}
          >
            <option value="">Select Year</option>
            <option value="2081/2082 BS">2081/2082 BS</option>
            <option value="2082/2083 BS">2082/2083 BS</option>
            <option value="2083/2084 BS" selected>2083/2084 BS</option>
            <option value="2084/2085 BS">2084/2085 BS</option>
            <option value="2085/2086 BS">2085/2086 BS</option>
          </select>
          {errors.academicYear && (
            <p className="mt-1 text-xs text-red-600">{errors.academicYear}</p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Medium
          </label>
          <select
            value={data.medium}
            onChange={(e) => update("medium", e.target.value)}
            className="h-10 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-[#234A91] focus:ring-2 focus:ring-blue-100"
          >
            <option value="English">English</option>
            <option value="Nepali">Nepali</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Admission Number
          </label>
          <input
            type="text"
            value={data.admissionNo}
            onChange={(e) => update("admissionNo", e.target.value)}
            placeholder="Auto Generated"
            className={`h-10 w-full rounded-xl border px-3 text-sm outline-none focus:border-[#234A91] focus:ring-2 focus:ring-blue-100 ${
              errors.admissionNo ? "border-red-500" : "border-gray-200"
            }`}
          />
          {errors.admissionNo && (
            <p className="mt-1 text-xs text-red-600">{errors.admissionNo}</p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Admission Date
          </label>
          <input
            type="date"
            value={data.admissionDate}
            onChange={(e) => update("admissionDate", e.target.value)}
            className={`h-10 w-full rounded-xl border px-3 text-sm outline-none focus:border-[#234A91] focus:ring-2 focus:ring-blue-100 ${
              errors.admissionDate ? "border-red-500" : "border-gray-200"
            }`}
          />
          {errors.admissionDate && (
            <p className="mt-1 text-xs text-red-600">{errors.admissionDate}</p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Class
          </label>
          <select
            value={data.class}
            onChange={(e) => update("class", e.target.value)}
            className={`h-10 w-full rounded-xl border px-3 text-sm outline-none focus:border-[#234A91] focus:ring-2 focus:ring-blue-100 ${
              errors.class ? "border-red-500" : "border-gray-200"
            }`}
          >
            <option value="">Select Class</option>
            <option value="Grade PG">PG</option>
            <option value="Grade Nursery">Nursery</option>
            <option value="Grade LKG">LKG</option>
            <option value="Grade UKG">UKG</option>
            <option value="Grade 1">Grade 1</option>
            <option value="Grade 2">Grade 2</option>
            <option value="Grade 3">Grade 3</option>
            <option value="Grade 4">Grade 4</option>
            <option value="Grade 5">Grade 5</option>
            <option value="Grade 6">Grade 6</option>
            <option value="Grade 7">Grade 7</option>
            <option value="Grade 8">Grade 8</option>
            <option value="Grade 9">Grade 9</option>
            <option value="Grade 10">Grade 10</option>
            <option value="Grade 11">Grade 11</option>
            <option value="Grade 12">Grade 12</option>
          </select>
          {errors.class && (
            <p className="mt-1 text-xs text-red-600">{errors.class}</p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Section
          </label>
          <select
            value={data.section}
            onChange={(e) => update("section", e.target.value)}
            className={`h-10 w-full rounded-xl border px-3 text-sm outline-none focus:border-[#234A91] focus:ring-2 focus:ring-blue-100 ${
              errors.section ? "border-red-500" : "border-gray-200"
            }`}
          >
            <option value="">Select Section</option>
            <option value="A">A</option>
            <option value="B">B</option>
            <option value="C">C</option>
            <option value="D">D</option>
          </select>
          {errors.section && (
            <p className="mt-1 text-xs text-red-600">{errors.section}</p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Roll Number
          </label>
          <input
            type="text"
            value={data.rollNumber}
            onChange={(e) => update("rollNumber", e.target.value)}
            className={`h-10 w-full rounded-xl border px-3 text-sm outline-none focus:border-[#234A91] focus:ring-2 focus:ring-blue-100 ${
              errors.rollNumber ? "border-red-500" : "border-gray-200"
            }`}
            readOnly
          />
          {rollNumberLoading && (
            <p className="mt-1 text-xs text-gray-400">Generating...</p>
          )}
          {errors.rollNumber && (
            <p className="mt-1 text-xs text-red-600">{errors.rollNumber}</p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            House
          </label>
          <select
            value={data.house}
            onChange={(e) => update("house", e.target.value)}
            className="h-10 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-[#234A91] focus:ring-2 focus:ring-blue-100"
          >
            <option value="">Select House</option>
            <option value="Red">Red</option>
            <option value="Blue">Blue</option>
            <option value="Green">Green</option>
            <option value="Yellow">Yellow</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Student Status
          </label>
          <select
            value={data.status}
            onChange={(e) => update("status", e.target.value)}
            className={`h-10 w-full rounded-xl border px-3 text-sm outline-none focus:border-[#234A91] focus:ring-2 focus:ring-blue-100 ${
              errors.status ? "border-red-500" : "border-gray-200"
            }`}
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="transfer">Transfer</option>
          </select>
          {errors.status && (
            <p className="mt-1 text-xs text-red-600">{errors.status}</p>
          )}
        </div>

        {/* <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Scholarship
          </label>
          <input
            type="text"
            value={data.scholarship}
            onChange={(e) => update("scholarship", e.target.value)}
            className="h-10 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-[#234A91] focus:ring-2 focus:ring-blue-100"
          />
        </div> */}
      </div>
    </div>
  );
};

export default StudentAcademicSection;
