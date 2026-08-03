import React, { useEffect } from "react";
import type { MedicalData } from "../schemas/student.schema";
import type { GuardianData } from "../schemas/student.schema";

interface MedicalSectionProps {
  data: MedicalData;
  onChange: (data: MedicalData) => void;
  guardianData?: GuardianData;
  errors?: Record<string, string>;
}

const medicalConditionsOptions = [
  "None",
  "Physical / Mobility Disability",
  "Visual Impairment",
  "Hearing Impairment",
  "Speech Impairment",
  "Cognitive / Intellectual Disability",
  "Autism Spectrum Disorder",
  "Multiple Disabilities",
  "Chronic Illness",
  "Other",
];

const emergencyContactOptions = ["Father", "Mother", "Guardian", "Other"];

const MedicalSection: React.FC<MedicalSectionProps> = ({
  data,
  onChange,
  guardianData,
  errors = {},
}) => {
  const update = (field: keyof MedicalData, value: string) => {
    onChange({ ...data, [field]: value });
  };

  useEffect(() => {
    const contactNumber = data.emergencyContactPerson === "Father"
      ? guardianData?.fatherPhone
      : data.emergencyContactPerson === "Mother"
        ? guardianData?.motherPhone
        : data.emergencyContactPerson === "Guardian"
          ? guardianData?.guardianPhone
          : undefined;
    if (contactNumber && contactNumber !== data.emergencyContactNumber) {
      onChange({ ...data, emergencyContactNumber: contactNumber });
    }
  }, [
    data.emergencyContactNumber,
    data.emergencyContactPerson,
    guardianData?.fatherPhone,
    guardianData?.motherPhone,
    guardianData?.guardianPhone,
    onChange,
  ]);

  const handleEmergencyPersonChange = (value: string) => {
    const contactNumber = value === "Father"
      ? guardianData?.fatherPhone
      : value === "Mother"
        ? guardianData?.motherPhone
        : value === "Guardian"
          ? guardianData?.guardianPhone
          : "";
    onChange({
      ...data,
      emergencyContactPerson: value,
      emergencyContactNumber: contactNumber || data.emergencyContactNumber,
    });
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Medical Information</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Blood Group</label>
          <select
            value={data.bloodGroup}
            onChange={(e) => update("bloodGroup", e.target.value)}
            className="h-10 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-[#234A91] focus:ring-2 focus:ring-blue-100"
          >
            <option value="">Select</option>
            <option value="A+">A+</option>
            <option value="A-">A-</option>
            <option value="B+">B+</option>
            <option value="B-">B-</option>
            <option value="AB+">AB+</option>
            <option value="AB-">AB-</option>
            <option value="O+">O+</option>
            <option value="O-">O-</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Height</label>
          <input
            type="text"
            value={data.height}
            onChange={(e) => update("height", e.target.value)}
            placeholder="e.g. 150 cm"
            className="h-10 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-[#234A91] focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Weight</label>
          <input
            type="text"
            value={data.weight}
            onChange={(e) => update("weight", e.target.value)}
            placeholder="e.g. 45 kg"
            className="h-10 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-[#234A91] focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Medical Conditions</label>
          <select
            value={data.medicalConditions}
            onChange={(e) => update("medicalConditions", e.target.value)}
            className={`h-10 w-full rounded-xl border px-3 text-sm outline-none focus:border-[#234A91] focus:ring-2 focus:ring-blue-100 ${
              errors.medicalConditions ? "border-red-500" : "border-gray-200"
            }`}
          >
            <option value="">Select</option>
            {medicalConditionsOptions.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
          {errors.medicalConditions && <p className="mt-1 text-xs text-red-600">{errors.medicalConditions}</p>}
        </div>

        {data.medicalConditions === "Other" && (
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Specify Medical Condition</label>
            <input
              type="text"
              value={data.medicalConditionsOther || ""}
              onChange={(e) => update("medicalConditionsOther", e.target.value)}
              className="h-10 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-[#234A91] focus:ring-2 focus:ring-blue-100"
            />
          </div>
        )}

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Allergies</label>
          <input
            type="text"
            value={data.allergies}
            onChange={(e) => update("allergies", e.target.value)}
            className="h-10 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-[#234A91] focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Disability</label>
          <input
            type="text"
            value={data.disability}
            onChange={(e) => update("disability", e.target.value)}
            className="h-10 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-[#234A91] focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Emergency Contact Person</label>
          <select
            value={data.emergencyContactPerson}
            onChange={(e) => handleEmergencyPersonChange(e.target.value)}
            className={`h-10 w-full rounded-xl border px-3 text-sm outline-none focus:border-[#234A91] focus:ring-2 focus:ring-blue-100 ${
              errors.emergencyContactPerson ? "border-red-500" : "border-gray-200"
            }`}
          >
            <option value="">Select</option>
            {emergencyContactOptions.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
          {errors.emergencyContactPerson && <p className="mt-1 text-xs text-red-600">{errors.emergencyContactPerson}</p>}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Emergency Contact Number</label>
          <input
            type="tel"
            value={data.emergencyContactNumber}
            onChange={(e) => update("emergencyContactNumber", e.target.value)}
            className={`h-10 w-full rounded-xl border px-3 text-sm outline-none focus:border-[#234A91] focus:ring-2 focus:ring-blue-100 ${
              errors.emergencyContactNumber ? "border-red-500" : "border-gray-200"
            }`}
          />
          {errors.emergencyContactNumber && <p className="mt-1 text-xs text-red-600">{errors.emergencyContactNumber}</p>}
        </div>
      </div>
    </div>
  );
};

export default MedicalSection;
