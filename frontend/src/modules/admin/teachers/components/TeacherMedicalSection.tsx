import React from "react";
import type { MedicalData } from "../schemas/teacher.schema";

interface TeacherMedicalSectionProps {
  data: MedicalData;
  onChange: (data: MedicalData) => void;
}

const TeacherMedicalSection: React.FC<TeacherMedicalSectionProps> = ({
  data,
  onChange,
}) => {
  const update = (field: keyof MedicalData, value: string) => {
    onChange({ ...data, [field]: value });
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
            placeholder="e.g. 5'10&quot;"
            className="h-10 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-[#234A91] focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Weight</label>
          <input
            type="text"
            value={data.weight}
            onChange={(e) => update("weight", e.target.value)}
            placeholder="e.g. 70 kg"
            className="h-10 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-[#234A91] focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Medical Conditions</label>
          <input
            type="text"
            value={data.medicalConditions}
            onChange={(e) => update("medicalConditions", e.target.value)}
            className="h-10 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-[#234A91] focus:ring-2 focus:ring-blue-100"
          />
        </div>

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
          <label className="mb-1 block text-sm font-medium text-gray-700">Doctor Name</label>
          <input
            type="text"
            value={data.doctorName}
            onChange={(e) => update("doctorName", e.target.value)}
            className="h-10 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-[#234A91] focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Emergency Contact</label>
          <input
            type="tel"
            value={data.emergencyContact}
            onChange={(e) => update("emergencyContact", e.target.value)}
            className="h-10 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-[#234A91] focus:ring-2 focus:ring-blue-100"
          />
        </div>
      </div>
    </div>
  );
};

export default TeacherMedicalSection;
