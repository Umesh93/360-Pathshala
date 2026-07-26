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
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Additional Information</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">PAN Number (Optional)</label>
          <input
            type="text"
            value={data.panNumber}
            onChange={(e) => update("panNumber", e.target.value)}
            className="h-10 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-[#234A91] focus:ring-2 focus:ring-blue-100"
          />
        </div>
      </div>
    </div>
  );
};

export default TeacherBankSection;
