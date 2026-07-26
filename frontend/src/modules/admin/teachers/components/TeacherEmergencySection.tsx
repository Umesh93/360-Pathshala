import React from "react";
import type { EmergencyData } from "../schemas/teacher.schema";

interface TeacherEmergencySectionProps {
  data: EmergencyData;
  onChange: (data: EmergencyData) => void;
  errors?: Record<string, string>;
}

const relationshipOptions = [
  { value: "father", label: "Father" },
  { value: "mother", label: "Mother" },
  { value: "spouse", label: "Spouse" },
  { value: "sibling", label: "Sibling" },
  { value: "relative", label: "Relative" },
  { value: "friend", label: "Friend" },
  { value: "other", label: "Other" },
];

const TeacherEmergencySection: React.FC<TeacherEmergencySectionProps> = ({
  data,
  onChange,
  errors = {},
}) => {
  const update = (field: keyof EmergencyData, value: string) => {
    onChange({ ...data, [field]: value });
  };

  const handleRelationshipChange = (relationship: "father" | "mother" | "spouse" | "sibling" | "relative" | "friend" | "other") => {
    let phone = "";
    if (relationship === "father") phone = data.fatherPhone || "";
    else if (relationship === "mother") phone = data.motherPhone || "";
    else if (relationship === "spouse") phone = data.spousePhone || "";

    onChange({
      ...data,
      relationship,
      phone,
    });
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Family & Emergency Contact</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Father Name</label>
          <input
            type="text"
            value={data.fatherName}
            onChange={(e) => update("fatherName", e.target.value)}
            className="h-10 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-[#234A91] focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Father Phone Number</label>
          <input
            type="tel"
            value={data.fatherPhone}
            onChange={(e) => update("fatherPhone", e.target.value)}
            className="h-10 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-[#234A91] focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Mother Name</label>
          <input
            type="text"
            value={data.motherName}
            onChange={(e) => update("motherName", e.target.value)}
            className="h-10 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-[#234A91] focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Mother Phone Number</label>
          <input
            type="tel"
            value={data.motherPhone}
            onChange={(e) => update("motherPhone", e.target.value)}
            className="h-10 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-[#234A91] focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Spouse Name (Optional)</label>
          <input
            type="text"
            value={data.spouseName}
            onChange={(e) => update("spouseName", e.target.value)}
            className="h-10 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-[#234A91] focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Spouse Phone Number (Optional)</label>
          <input
            type="tel"
            value={data.spousePhone}
            onChange={(e) => update("spousePhone", e.target.value)}
            className="h-10 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-[#234A91] focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Emergency Contact Person</label>
          <input
            type="text"
            value={data.emergencyContactPerson}
            onChange={(e) => update("emergencyContactPerson", e.target.value)}
            className={`h-10 w-full rounded-xl border px-3 text-sm outline-none focus:border-[#234A91] focus:ring-2 focus:ring-blue-100 ${
              errors.emergencyContactPerson ? "border-red-500" : "border-gray-200"
            }`}
          />
          {errors.emergencyContactPerson && <p className="mt-1 text-xs text-red-600">{errors.emergencyContactPerson}</p>}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Relationship</label>
          <select
            value={data.relationship}
            onChange={(e) => handleRelationshipChange(e.target.value as "father" | "mother" | "spouse" | "sibling" | "relative" | "friend" | "other")}
            className={`h-10 w-full rounded-xl border px-3 text-sm outline-none focus:border-[#234A91] focus:ring-2 focus:ring-blue-100 ${
              errors.relationship ? "border-red-500" : "border-gray-200"
            }`}
          >
            <option value="">Select Relationship</option>
            {relationshipOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
          {errors.relationship && <p className="mt-1 text-xs text-red-600">{errors.relationship}</p>}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Emergency Contact Number</label>
          <input
            type="tel"
            value={data.phone}
            onChange={(e) => update("phone", e.target.value)}
            className={`h-10 w-full rounded-xl border px-3 text-sm outline-none focus:border-[#234A91] focus:ring-2 focus:ring-blue-100 ${
              errors.phone ? "border-red-500" : "border-gray-200"
            }`}
          />
          {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone}</p>}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Emergency Contact Email (Optional)</label>
          <input
            type="email"
            value={data.email}
            onChange={(e) => update("email", e.target.value)}
            className="h-10 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-[#234A91] focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div className="sm:col-span-2 lg:col-span-4">
          <label className="mb-1 block text-sm font-medium text-gray-700">Emergency Contact Address (Optional)</label>
          <textarea
            value={data.address}
            onChange={(e) => update("address", e.target.value)}
            rows={2}
            className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#234A91] focus:ring-2 focus:ring-blue-100"
          />
        </div>
      </div>
    </div>
  );
};

export default TeacherEmergencySection;
