import React from "react";
import type { AddressData } from "../schemas/teacher.schema";

interface TeacherAddressSectionProps {
  data: AddressData;
  onChange: (data: AddressData) => void;
}

const TeacherAddressSection: React.FC<TeacherAddressSectionProps> = ({
  data,
  onChange,
}) => {
  const update = (field: keyof AddressData, value: string | boolean) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Address</h2>

      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">Current Address</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Province</label>
              <input
                type="text"
                value={data.currentProvince}
                onChange={(e) => update("currentProvince", e.target.value)}
                className="h-10 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-[#234A91] focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">District</label>
              <input
                type="text"
                value={data.currentDistrict}
                onChange={(e) => update("currentDistrict", e.target.value)}
                className="h-10 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-[#234A91] focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Municipality</label>
              <input
                type="text"
                value={data.currentMunicipality}
                onChange={(e) => update("currentMunicipality", e.target.value)}
                className="h-10 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-[#234A91] focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Ward</label>
              <input
                type="text"
                value={data.currentWard}
                onChange={(e) => update("currentWard", e.target.value)}
                className="h-10 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-[#234A91] focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div className="sm:col-span-2 lg:col-span-4">
              <label className="mb-1 block text-sm font-medium text-gray-700">Street</label>
              <input
                type="text"
                value={data.currentStreet}
                onChange={(e) => update("currentStreet", e.target.value)}
                className="h-10 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-[#234A91] focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="permanentSameAsCurrent"
            checked={data.permanentSameAsCurrent}
            onChange={(e) => update("permanentSameAsCurrent", e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-[#234A91] focus:ring-[#234A91]"
          />
          <label htmlFor="permanentSameAsCurrent" className="text-sm font-medium text-gray-700">
            Same as Current Address
          </label>
        </div>

        {!data.permanentSameAsCurrent && (
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Permanent Address</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Province</label>
                <input
                  type="text"
                  value={data.permanentProvince}
                  onChange={(e) => update("permanentProvince", e.target.value)}
                  className="h-10 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-[#234A91] focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">District</label>
                <input
                  type="text"
                  value={data.permanentDistrict}
                  onChange={(e) => update("permanentDistrict", e.target.value)}
                  className="h-10 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-[#234A91] focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Municipality</label>
                <input
                  type="text"
                  value={data.permanentMunicipality}
                  onChange={(e) => update("permanentMunicipality", e.target.value)}
                  className="h-10 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-[#234A91] focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Ward</label>
                <input
                  type="text"
                  value={data.permanentWard}
                  onChange={(e) => update("permanentWard", e.target.value)}
                  className="h-10 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-[#234A91] focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div className="sm:col-span-2 lg:col-span-4">
                <label className="mb-1 block text-sm font-medium text-gray-700">Street</label>
                <input
                  type="text"
                  value={data.permanentStreet}
                  onChange={(e) => update("permanentStreet", e.target.value)}
                  className="h-10 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-[#234A91] focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherAddressSection;
