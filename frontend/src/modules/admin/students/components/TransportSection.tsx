import React from "react";
import type { TransportData } from "../schemas/student.schema";

interface TransportSectionProps {
  data: TransportData;
  onChange: (data: TransportData) => void;
}

const TransportSection: React.FC<TransportSectionProps> = ({ data, onChange }) => {
  const update = (field: keyof TransportData, value: string | boolean) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Transport</h2>
      <div className="flex gap-4 mb-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name="usesTransport"
            checked={!data.usesTransport}
            onChange={() => update("usesTransport", false)}
            className="w-4 h-4 text-[#234A91] border-gray-300 focus:ring-[#234A91]"
          />
          <span className="text-sm text-gray-700">No</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name="usesTransport"
            checked={data.usesTransport}
            onChange={() => update("usesTransport", true)}
            className="w-4 h-4 text-[#234A91] border-gray-300 focus:ring-[#234A91]"
          />
          <span className="text-sm text-gray-700">Yes</span>
        </label>
      </div>

      {data.usesTransport && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Route</label>
            <select
              value={data.route}
              onChange={(e) => update("route", e.target.value)}
              className="h-10 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-[#234A91] focus:ring-2 focus:ring-blue-100"
            >
              <option value="">Select Route</option>
              <option value="Route 1">Route 1</option>
              <option value="Route 2">Route 2</option>
              <option value="Route 3">Route 3</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Pickup Point</label>
            <input
              type="text"
              value={data.pickupPoint}
              onChange={(e) => update("pickupPoint", e.target.value)}
              className="h-10 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-[#234A91] focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Vehicle</label>
            <input
              type="text"
              value={data.vehicle}
              onChange={(e) => update("vehicle", e.target.value)}
              className="h-10 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-[#234A91] focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default TransportSection;
