import React from "react";
import type { EmergencyData } from "../schemas/teacher.schema";

interface TeacherEmergencySectionProps {
  data: EmergencyData;
  onChange: (data: EmergencyData) => void;
  errors?: Record<string, string>;
}

const relationshipOptions = [
  { value: "Father", label: "Father" },
  { value: "Mother", label: "Mother" },
  { value: "Brother", label: "Brother" },
  { value: "Sister", label: "Sister" },
  { value: "Spouse", label: "Spouse" },
  { value: "Relative", label: "Relative" },
  { value: "Friend", label: "Friend" },
  { value: "Other", label: "Other" },
];

const TeacherEmergencySection: React.FC<TeacherEmergencySectionProps> = ({
  data,
  onChange,
  errors = {},
}) => {
  const update = (field: keyof EmergencyData, value: string) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">
        Emergency Contact
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Emergency Contact Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={data.emergencyContactName}
            onChange={(e) => update("emergencyContactName", e.target.value)}
            className={`h-10 w-full rounded-xl border px-3 text-sm outline-none focus:border-[#234A91] focus:ring-2 focus:ring-blue-100 ${
              errors.emergencyContactName ? "border-red-500" : "border-gray-200"
            }`}
          />
          {errors.emergencyContactName && (
            <p className="mt-1 text-xs text-red-600">
              {errors.emergencyContactName}
            </p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Relationship <span className="text-red-500">*</span>
          </label>
          <select
            value={data.relationship}
            onChange={(e) => update("relationship", e.target.value)}
            className={`h-10 w-full rounded-xl border px-3 text-sm outline-none focus:border-[#234A91] focus:ring-2 focus:ring-blue-100 ${
              errors.relationship ? "border-red-500" : "border-gray-200"
            }`}
          >
            <option value="">Select Relationship</option>
            {relationshipOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {errors.relationship && (
            <p className="mt-1 text-xs text-red-600">{errors.relationship}</p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Emergency Contact Phone <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            value={data.emergencyContactNumber}
            onChange={(e) => update("emergencyContactNumber", e.target.value)}
            className={`h-10 w-full rounded-xl border px-3 text-sm outline-none focus:border-[#234A91] focus:ring-2 focus:ring-blue-100 ${
              errors.emergencyContactNumber
                ? "border-red-500"
                : "border-gray-200"
            }`}
          />
          {errors.emergencyContactNumber && (
            <p className="mt-1 text-xs text-red-600">
              {errors.emergencyContactNumber}
            </p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Alternative Phone
          </label>
          <input
            type="tel"
            value={data.alternativePhone}
            onChange={(e) => update("alternativePhone", e.target.value)}
            className="h-10 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-[#234A91] focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            type="email"
            value={data.email}
            onChange={(e) => update("email", e.target.value)}
            className={`h-10 w-full rounded-xl border px-3 text-sm outline-none focus:border-[#234A91] focus:ring-2 focus:ring-blue-100 ${
              errors.email ? "border-red-500" : "border-gray-200"
            }`}
          />
          {errors.email && (
            <p className="mt-1 text-xs text-red-600">{errors.email}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeacherEmergencySection;
