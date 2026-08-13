import React, { useEffect } from "react";
import type { MedicalData } from "../schemas/student.schema";
import type { GuardianData } from "../schemas/student.schema";
import RequiredLabel from "../../../../components/forms/RequiredLabel";

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
    const contactNumber =
      data.emergencyContactPerson === "Father"
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
    data,
    data.emergencyContactNumber,
    data.emergencyContactPerson,
    guardianData?.fatherPhone,
    guardianData?.motherPhone,
    guardianData?.guardianPhone,
    onChange,
  ]);

  const handleEmergencyPersonChange = (value: string) => {
    const contactNumber =
      value === "Father"
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

  const fieldClass = (error?: string) =>
    `h-10 w-full rounded-xl border px-3 text-sm outline-none focus:border-[#234A91] focus:ring-2 focus:ring-blue-100 ${error ? "border-red-500" : "border-gray-200"}`;
  const errorText = (error?: string) =>
    error ? <p className="mt-1 text-xs text-red-600">{error}</p> : null;

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">
        Medical Information
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Blood Group (Optional)
          </label>
          <select
            data-field="bloodGroup"
            value={data.bloodGroup}
            onChange={(e) => update("bloodGroup", e.target.value)}
            className={fieldClass(errors.bloodGroup)}
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
          {errorText(errors.bloodGroup)}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Height (Optional)
          </label>
          <input
            data-field="height"
            type="text"
            value={data.height}
            onChange={(e) => update("height", e.target.value)}
            placeholder="e.g. 150 cm"
            className={fieldClass()}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Weight (Optional)
          </label>
          <input
            data-field="weight"
            type="text"
            value={data.weight}
            onChange={(e) => update("weight", e.target.value)}
            placeholder="e.g. 45 kg"
            className={fieldClass()}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Medical Conditions (Optional)
          </label>
          <select
            data-field="medicalConditions"
            value={data.medicalConditions}
            onChange={(e) => update("medicalConditions", e.target.value)}
            className={fieldClass(errors.medicalConditions)}
          >
            <option value="">Select</option>
            {medicalConditionsOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          {errorText(errors.medicalConditions)}
        </div>

        {data.medicalConditions === "Other" && (
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Specify Medical Condition (Optional)
            </label>
            <input
              data-field="medicalConditionsOther"
              type="text"
              value={data.medicalConditionsOther || ""}
              onChange={(e) => update("medicalConditionsOther", e.target.value)}
              className={fieldClass()}
            />
          </div>
        )}

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Allergies (Optional)
          </label>
          <input
            data-field="allergies"
            type="text"
            value={data.allergies}
            onChange={(e) => update("allergies", e.target.value)}
            className={fieldClass()}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Disability (Optional)
          </label>
          <input
            data-field="disability"
            type="text"
            value={data.disability}
            onChange={(e) => update("disability", e.target.value)}
            className={fieldClass()}
          />
        </div>

        <div>
          <RequiredLabel required>Emergency Contact Person</RequiredLabel>
          <select
            data-field="emergencyContactPerson"
            value={data.emergencyContactPerson}
            onChange={(e) => handleEmergencyPersonChange(e.target.value)}
            className={fieldClass(errors.emergencyContactPerson)}
            aria-required="true"
            aria-invalid={!!errors.emergencyContactPerson}
          >
            <option value="">Select</option>
            {emergencyContactOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          {errorText(errors.emergencyContactPerson)}
        </div>

        <div>
          <RequiredLabel required>Emergency Contact Number</RequiredLabel>
          <input
            data-field="emergencyContactNumber"
            type="tel"
            value={data.emergencyContactNumber}
            onChange={(e) => update("emergencyContactNumber", e.target.value)}
            className={fieldClass(errors.emergencyContactNumber)}
            aria-required="true"
            aria-invalid={!!errors.emergencyContactNumber}
          />
          {errorText(errors.emergencyContactNumber)}
        </div>
      </div>
    </div>
  );
};

export default MedicalSection;
