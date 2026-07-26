import React, { useState, useEffect } from "react";
import type { AddressData } from "../schemas/teacher.schema";
import { getDistricts, getMunicipalities, getWards } from "../services/teacher.service";

interface TeacherAddressSectionProps {
  data: AddressData;
  onChange: (data: AddressData) => void;
  errors?: Record<string, string>;
}

const provinces = [
  { id: 1, name: "Koshi" },
  { id: 2, name: "Madhesh" },
  { id: 3, name: "Bagmati" },
  { id: 4, name: "Gandaki" },
  { id: 5, name: "Lumbini" },
  { id: 6, name: "Karnali" },
  { id: 7, name: "Sudurpashchim" },
];

const TeacherAddressSection: React.FC<TeacherAddressSectionProps> = ({
  data,
  onChange,
  errors = {},
}) => {
  const update = (field: keyof AddressData, value: string | boolean) => {
    onChange({ ...data, [field]: value });
  };

  const [districts, setDistricts] = useState<{ id: number; name: string }[]>([]);
  const [municipalities, setMunicipalities] = useState<{ id: number; name: string }[]>([]);
  const [wards, setWards] = useState<{ id: number; number: number }[]>([]);
  const [districtLoading, setDistrictLoading] = useState(false);
  const [municipalityLoading, setMunicipalityLoading] = useState(false);
  const [wardLoading, setWardLoading] = useState(false);

  useEffect(() => {
    if (data.currentProvince) {
      const provinceId = provinces.find((p) => p.name === data.currentProvince)?.id;
      if (provinceId) {
        setDistrictLoading(true);
        setDistricts([]);
        setMunicipalities([]);
        setWards([]);
        update("currentDistrict", "");
        update("currentMunicipality", "");
        update("currentWard", "");
        getDistricts(provinceId).then((result) => {
          setDistricts(result);
          setDistrictLoading(false);
        });
      }
    } else {
      setDistricts([]);
      setMunicipalities([]);
      setWards([]);
      update("currentDistrict", "");
      update("currentMunicipality", "");
      update("currentWard", "");
    }
  }, [data.currentProvince]);

  useEffect(() => {
    if (data.currentDistrict) {
      setMunicipalityLoading(true);
      setMunicipalities([]);
      setWards([]);
      update("currentMunicipality", "");
      update("currentWard", "");
      getMunicipalities(Number(data.currentDistrict)).then((result) => {
        setMunicipalities(result);
        setMunicipalityLoading(false);
      });
    } else {
      setMunicipalities([]);
      setWards([]);
      update("currentMunicipality", "");
      update("currentWard", "");
    }
  }, [data.currentDistrict]);

  useEffect(() => {
    if (data.currentMunicipality) {
      setWardLoading(true);
      setWards([]);
      update("currentWard", "");
      getWards(Number(data.currentMunicipality)).then((result) => {
        setWards(result);
        setWardLoading(false);
      });
    } else {
      setWards([]);
      update("currentWard", "");
    }
  }, [data.currentMunicipality]);

  const copyToPermanent = () => {
    onChange({
      ...data,
      permanentProvince: data.currentProvince,
      permanentDistrict: data.currentDistrict,
      permanentMunicipality: data.currentMunicipality,
      permanentWard: data.currentWard,
      permanentStreet: data.currentStreet,
    });
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Address</h2>

      <div className="space-y-6">
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Current Address</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Province</label>
              <select
                value={data.currentProvince}
                onChange={(e) => update("currentProvince", e.target.value)}
                className={`h-10 w-full rounded-xl border px-3 text-sm outline-none focus:border-[#234A91] focus:ring-2 focus:ring-blue-100 ${
                  errors.currentProvince ? "border-red-500" : "border-gray-200"
                }`}
              >
                <option value="">Select Province</option>
                {provinces.map((p) => (
                  <option key={p.id} value={p.name}>{p.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">District</label>
              <select
                value={data.currentDistrict}
                onChange={(e) => update("currentDistrict", e.target.value)}
                disabled={districtLoading || data.currentProvince === ""}
                className={`h-10 w-full rounded-xl border px-3 text-sm outline-none focus:border-[#234A91] focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100 ${
                  errors.currentDistrict ? "border-red-500" : "border-gray-200"
                }`}
              >
                <option value="">{districtLoading ? "Loading..." : "Select District"}</option>
                {districts.map((d) => (
                  <option key={d.id} value={d.name}>{d.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Municipality</label>
              <select
                value={data.currentMunicipality}
                onChange={(e) => update("currentMunicipality", e.target.value)}
                disabled={municipalityLoading || data.currentDistrict === ""}
                className={`h-10 w-full rounded-xl border px-3 text-sm outline-none focus:border-[#234A91] focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100 ${
                  errors.currentMunicipality ? "border-red-500" : "border-gray-200"
                }`}
              >
                <option value="">{municipalityLoading ? "Loading..." : "Select Municipality"}</option>
                {municipalities.map((m) => (
                  <option key={m.id} value={m.name}>{m.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Ward</label>
              <select
                value={data.currentWard}
                onChange={(e) => update("currentWard", e.target.value)}
                disabled={wardLoading || data.currentMunicipality === ""}
                className={`h-10 w-full rounded-xl border px-3 text-sm outline-none focus:border-[#234A91] focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100 ${
                  errors.currentWard ? "border-red-500" : "border-gray-200"
                }`}
              >
                <option value="">{wardLoading ? "Loading..." : "Select Ward"}</option>
                {wards.map((w) => (
                  <option key={w.id} value={String(w.number)}>{w.number}</option>
                ))}
              </select>
            </div>

            <div>
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
            onChange={(e) => {
              update("permanentSameAsCurrent", e.target.checked);
              if (e.target.checked) copyToPermanent();
            }}
            className="w-4 h-4 rounded border-gray-300 text-[#234A91] focus:ring-[#234A91]"
          />
          <label htmlFor="permanentSameAsCurrent" className="text-sm font-medium text-gray-700">
            Same as Current Address
          </label>
        </div>

        {!data.permanentSameAsCurrent && (
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Permanent Address</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Province</label>
                <select
                  value={data.permanentProvince}
                  onChange={(e) => update("permanentProvince", e.target.value)}
                  disabled={data.permanentSameAsCurrent}
                  className="h-10 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-[#234A91] focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100"
                >
                  <option value="">Select Province</option>
                  {provinces.map((p) => (
                    <option key={p.id} value={p.name}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">District</label>
                <select
                  value={data.permanentDistrict}
                  onChange={(e) => update("permanentDistrict", e.target.value)}
                  disabled={data.permanentSameAsCurrent}
                  className="h-10 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-[#234A91] focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100"
                >
                  <option value="">Select District</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Municipality</label>
                <select
                  value={data.permanentMunicipality}
                  onChange={(e) => update("permanentMunicipality", e.target.value)}
                  disabled={data.permanentSameAsCurrent}
                  className="h-10 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-[#234A91] focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100"
                >
                  <option value="">Select Municipality</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Ward</label>
                <select
                  value={data.permanentWard}
                  onChange={(e) => update("permanentWard", e.target.value)}
                  disabled={data.permanentSameAsCurrent}
                  className="h-10 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-[#234A91] focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100"
                >
                  <option value="">Select Ward</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Street</label>
                <input
                  type="text"
                  value={data.permanentStreet}
                  onChange={(e) => update("permanentStreet", e.target.value)}
                  disabled={data.permanentSameAsCurrent}
                  className="h-10 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-[#234A91] focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100"
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
