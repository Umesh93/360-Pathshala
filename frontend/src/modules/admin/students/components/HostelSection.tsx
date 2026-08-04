import React from "react";
import type { HostelData } from "../schemas/student.schema";

interface HostelSectionProps {
  data: HostelData;
  onChange: (data: HostelData) => void;
  errors?: Record<string, string>;
}

const HostelSection: React.FC<HostelSectionProps> = ({ data, onChange, errors = {} }) => {
  const update = (field: keyof HostelData, value: string | boolean) => {
    onChange({ ...data, [field]: value });
  };

  const fieldClass = (error?: string) => `h-10 w-full rounded-xl border px-3 text-sm outline-none focus:border-[#234A91] focus:ring-2 focus:ring-blue-100 ${error ? "border-red-500" : "border-gray-200"}`;
  const errorText = (error?: string) => error ? <p className="mt-1 text-xs text-red-600">{error}</p> : null;

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Hostel Information</h2>
      <div className="flex gap-4 mb-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name="hasHostel"
            checked={!data.hasHostel}
            onChange={() => update("hasHostel", false)}
            className="w-4 h-4 text-[#234A91] border-gray-300 focus:ring-[#234A91]"
          />
          <span className="text-sm text-gray-700">No</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name="hasHostel"
            checked={data.hasHostel}
            onChange={() => update("hasHostel", true)}
            className="w-4 h-4 text-[#234A91] border-gray-300 focus:ring-[#234A91]"
          />
          <span className="text-sm text-gray-700">Yes</span>
        </label>
      </div>

      {data.hasHostel && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Hostel (Optional)</label>
            <select
              data-field="hostel"
              value={data.hostel}
              onChange={(e) => update("hostel", e.target.value)}
              className={fieldClass(errors.hostel)}
            >
              <option value="">Select Hostel</option>
              <option value="Boys Hostel">Boys Hostel</option>
              <option value="Girls Hostel">Girls Hostel</option>
            </select>
            {errorText(errors.hostel)}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Room Number (Optional)</label>
            <input
              data-field="roomNumber"
              type="text"
              value={data.roomNumber}
              onChange={(e) => update("roomNumber", e.target.value)}
              className={fieldClass()}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Bed Number (Optional)</label>
            <input
              data-field="bedNumber"
              type="text"
              value={data.bedNumber}
              onChange={(e) => update("bedNumber", e.target.value)}
              className={fieldClass()}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default HostelSection;
