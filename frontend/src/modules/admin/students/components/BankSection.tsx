import React from "react";
import type { BankData } from "../schemas/student.schema";

interface BankSectionProps {
  data: BankData;
  onChange: (data: BankData) => void;
}

const BankSection: React.FC<BankSectionProps> = ({ data, onChange }) => {
  const update = (field: keyof BankData, value: string) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Bank Information</h2>
      <p className="text-xs text-gray-500 mb-4">Optional</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Bank Name</label>
          <input
            type="text"
            value={data.bankName}
            onChange={(e) => update("bankName", e.target.value)}
            className="h-10 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-[#234A91] focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Account Number</label>
          <input
            type="text"
            value={data.accountNumber}
            onChange={(e) => update("accountNumber", e.target.value)}
            className="h-10 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-[#234A91] focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Branch</label>
          <input
            type="text"
            value={data.branch}
            onChange={(e) => update("branch", e.target.value)}
            className="h-10 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-[#234A91] focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">IFSC / SWIFT</label>
          <input
            type="text"
            value={data.ifsc}
            onChange={(e) => update("ifsc", e.target.value)}
            className="h-10 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-[#234A91] focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">National Identification Number</label>
          <input
            type="text"
            value={data.nationalId}
            onChange={(e) => update("nationalId", e.target.value)}
            className="h-10 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-[#234A91] focus:ring-2 focus:ring-blue-100"
          />
        </div>
      </div>
    </div>
  );
};

export default BankSection;
