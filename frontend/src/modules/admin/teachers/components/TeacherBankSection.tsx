import React from "react";
import type { BankData } from "../schemas/teacher.schema";

interface TeacherBankSectionProps {
  data: BankData;
  onChange: (data: BankData) => void;
}

const TeacherBankSection: React.FC<TeacherBankSectionProps> = ({
  data,
  onChange,
}) => {
  const update = (field: keyof BankData, value: string) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Bank & Payroll Information</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
          <label className="mb-1 block text-sm font-medium text-gray-700">Branch</label>
          <input
            type="text"
            value={data.branch}
            onChange={(e) => update("branch", e.target.value)}
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
          <label className="mb-1 block text-sm font-medium text-gray-700">Account Holder Name</label>
          <input
            type="text"
            value={data.accountHolderName}
            onChange={(e) => update("accountHolderName", e.target.value)}
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
          <label className="mb-1 block text-sm font-medium text-gray-700">PAN Number</label>
          <input
            type="text"
            value={data.panNumber}
            onChange={(e) => update("panNumber", e.target.value)}
            className="h-10 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-[#234A91] focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Tax Number</label>
          <input
            type="text"
            value={data.taxNumber}
            onChange={(e) => update("taxNumber", e.target.value)}
            className="h-10 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-[#234A91] focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Salary Type</label>
          <select
            value={data.salaryType}
            onChange={(e) => update("salaryType", e.target.value)}
            className="h-10 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-[#234A91] focus:ring-2 focus:ring-blue-100"
          >
            <option value="monthly">Monthly</option>
            <option value="hourly">Hourly</option>
            <option value="contract">Contract</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Basic Salary</label>
          <input
            type="text"
            value={data.basicSalary}
            onChange={(e) => update("basicSalary", e.target.value)}
            className="h-10 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-[#234A91] focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Allowances</label>
          <input
            type="text"
            value={data.allowances}
            onChange={(e) => update("allowances", e.target.value)}
            className="h-10 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-[#234A91] focus:ring-2 focus:ring-blue-100"
          />
        </div>
      </div>
    </div>
  );
};

export default TeacherBankSection;
