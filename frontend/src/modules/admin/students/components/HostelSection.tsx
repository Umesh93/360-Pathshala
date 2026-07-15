import React from "react";
import type { HostelData } from "../schemas/student.schema";

interface HostelSectionProps {
  data: HostelData;
  onChange: (data: HostelData) => void;
}

const HostelSection: React.FC<HostelSectionProps> = ({ data, onChange }) => {
  const update = (field: keyof HostelData, value: string | boolean) => {
    onChange({ ...data, [field]: value });
  };

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
            <label className="mb-1 block text-sm font-medium text-gray-700">Hostel</label>
            <select
              value={data.hostel}
              onChange={(e) => update("hostel", e.target.value)}
              className="h-10 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-[#234A91] focus:ring-2 focus:ring-blue-100"
            >
              <option value="">Select Hostel</option>
              <option value="Boys Hostel">Boys Hostel</option>
              <option value="Girls Hostel">Girls Hostel</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Room Number</label>
            <input
              type="text"
              value={data.roomNumber}
              onChange={(e) => update("roomNumber", e.target.value)}
              className="h-10 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-[#234A91] focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Bed Number</label>
            <input
              type="text"
              value={data.bedNumber}
              onChange={(e) => update("bedNumber", e.target.value)}
              className="h-10 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-[#234A91] focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default HostelSection;
