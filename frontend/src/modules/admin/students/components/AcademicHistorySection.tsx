import React from "react";
import type { AcademicHistoryData } from "../schemas/student.schema";

interface AcademicHistorySectionProps {
  data: AcademicHistoryData;
  onChange: (data: AcademicHistoryData) => void;
}

const AcademicHistorySection: React.FC<AcademicHistorySectionProps> = ({ data, onChange }) => {
  const update = (field: keyof AcademicHistoryData, value: string) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Academic History</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Previous School</label>
          <input
            type="text"
            value={data.previousSchool}
            onChange={(e) => update("previousSchool", e.target.value)}
            className="h-10 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-[#234A91] focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Address</label>
          <input
            type="text"
            value={data.previousAddress}
            onChange={(e) => update("previousAddress", e.target.value)}
            className="h-10 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-[#234A91] focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Previous Class</label>
          <input
            type="text"
            value={data.previousClass}
            onChange={(e) => update("previousClass", e.target.value)}
            className="h-10 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-[#234A91] focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Transfer Certificate Number</label>
          <input
            type="text"
            value={data.transferCertificateNumber}
            onChange={(e) => update("transferCertificateNumber", e.target.value)}
            className="h-10 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-[#234A91] focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div className="sm:col-span-2 lg:col-span-2">
          <label className="mb-1 block text-sm font-medium text-gray-700">Reason for Leaving</label>
          <input
            type="text"
            value={data.reasonForLeaving}
            onChange={(e) => update("reasonForLeaving", e.target.value)}
            className="h-10 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-[#234A91] focus:ring-2 focus:ring-blue-100"
          />
        </div>
      </div>
    </div>
  );
};

export default AcademicHistorySection;
