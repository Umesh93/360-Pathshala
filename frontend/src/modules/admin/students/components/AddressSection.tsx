import React, { useState, useEffect, useRef, useCallback } from "react";
import type { AddressData } from "../schemas/student.schema";
import { getProvinces, getDistricts, getMunicipalities, getWards } from "../services/student.service";

interface AddressSectionProps {
  data: AddressData;
  onChange: (data: AddressData) => void;
  errors?: Record<string, string>;
  lookupData?: {
    provinces: { id: number; name: string }[];
    districts: { id: number; name: string; provinceId: number }[];
    municipalities: { id: number; name: string; type: string; districtId: number }[];
    wards: { id: number; number: number; name: string; municipalityId: number }[];
  };
}

const AddressSection: React.FC<AddressSectionProps> = ({
  data,
  onChange,
  errors = {},
  lookupData,
}) => {
  const update = useCallback((field: keyof AddressData, value: string | boolean) => {
    onChange({ ...data, [field]: value });
  }, [data, onChange]);

  const [provinces, setProvinces] = useState<{ id: number; name: string }[]>([]);
  const [districts, setDistricts] = useState<{ id: number; name: string }[]>([]);
  const [municipalities, setMunicipalities] = useState<{ id: number; name: string; type: string }[]>([]);
  const [wards, setWards] = useState<{ id: number; number: number; name: string }[]>([]);

  const [provinceLoading, setProvinceLoading] = useState(false);
  const [districtLoading, setDistrictLoading] = useState(false);
  const [municipalityLoading, setMunicipalityLoading] = useState(false);
  const [wardLoading, setWardLoading] = useState(false);

  const provinceLoadingRef = useRef(false);
  const districtLoadingRef = useRef(false);
  const municipalityLoadingRef = useRef(false);
  const wardLoadingRef = useRef(false);

  const provinceUserChanged = useRef(false);
  const districtUserChanged = useRef(false);
  const municipalityUserChanged = useRef(false);

  const setProvinceLoadingSafe = (val: boolean) => {
    provinceLoadingRef.current = val;
    setProvinceLoading(val);
  };
  const setDistrictLoadingSafe = (val: boolean) => {
    districtLoadingRef.current = val;
    setDistrictLoading(val);
  };
  const setMunicipalityLoadingSafe = (val: boolean) => {
    municipalityLoadingRef.current = val;
    setMunicipalityLoading(val);
  };
  const setWardLoadingSafe = (val: boolean) => {
    wardLoadingRef.current = val;
    setWardLoading(val);
  };

  useEffect(() => {
    if (lookupData) {
      setProvinces(lookupData.provinces);
      return;
    }
    if (provinces.length === 0 && !provinceLoadingRef.current) {
      setProvinceLoadingSafe(true);
      getProvinces().then((result) => {
        setProvinces(result);
        setProvinceLoadingSafe(false);
      }).catch(() => setProvinceLoadingSafe(false));
    }
  }, [lookupData, provinces]);

  useEffect(() => {
    if (data.currentProvince && provinces.length > 0) {
      const provinceId = Number(data.currentProvince);
      if (provinceId) {
        if (lookupData) {
          setDistricts(lookupData.districts.filter((district) => district.provinceId === provinceId));
          provinceUserChanged.current = false;
          return;
        }
        Promise.resolve().then(() => {
          setDistrictLoadingSafe(true);
          setDistricts([]);
        });
        getDistricts(provinceId).then((result) => {
          setDistricts(result);
          setDistrictLoadingSafe(false);
        }).catch(() => setDistrictLoadingSafe(false));
      }
    } else if (!data.currentProvince) {
      setDistricts([]);
      setMunicipalities([]);
      setWards([]);
    }
    provinceUserChanged.current = false;
  }, [data.currentProvince, lookupData, provinces]);

  useEffect(() => {
    if (data.currentDistrict && districts.length > 0) {
      const districtId = Number(data.currentDistrict);
      if (districtId) {
        if (lookupData) {
          setMunicipalities(lookupData.municipalities.filter((municipality) => municipality.districtId === districtId));
          districtUserChanged.current = false;
          return;
        }
        Promise.resolve().then(() => {
          setMunicipalityLoadingSafe(true);
          setMunicipalities([]);
        });
        getMunicipalities(districtId).then((result) => {
          setMunicipalities(result);
          setMunicipalityLoadingSafe(false);
        }).catch(() => setMunicipalityLoadingSafe(false));
      }
    } else if (!data.currentDistrict) {
      setMunicipalities([]);
      setWards([]);
    }
    districtUserChanged.current = false;
  }, [data.currentDistrict, districts, lookupData]);

  useEffect(() => {
    if (data.currentMunicipality && municipalities.length > 0) {
      const municipalityId = Number(data.currentMunicipality);
      if (municipalityId) {
        if (lookupData) {
          setWards(lookupData.wards.filter((ward) => ward.municipalityId === municipalityId));
          municipalityUserChanged.current = false;
          return;
        }
        Promise.resolve().then(() => {
          setWardLoadingSafe(true);
          setWards([]);
        });
        getWards(municipalityId).then((result) => {
          setWards(result);
          setWardLoadingSafe(false);
        }).catch(() => setWardLoadingSafe(false));
      }
    } else if (!data.currentMunicipality) {
      setWards([]);
    }
    municipalityUserChanged.current = false;
  }, [data.currentMunicipality, lookupData, municipalities]);

  const copyToPermanent = () => {
    onChange({
      ...data,
      permanentSameAsCurrent: true,
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
                onChange={(e) => {
                  const id = e.target.value;
                  provinceUserChanged.current = true;
                  onChange({
                    ...data,
                    currentProvince: id,
                    currentProvinceName: provinces.find((item) => String(item.id) === id)?.name ?? "",
                    currentDistrict: "",
                    currentDistrictName: "",
                    currentMunicipality: "",
                    currentMunicipalityName: "",
                    currentWard: "",
                    currentWardNumber: "",
                  });
                }}
                disabled={provinceLoading}
                className={`h-10 w-full rounded-xl border px-3 text-sm outline-none focus:border-[#234A91] focus:ring-2 focus:ring-blue-100 ${
                  errors.currentProvince ? "border-red-500" : "border-gray-200"
                }`}
              >
                <option value="">{provinceLoading ? "Loading..." : "Select Province"}</option>
                {provinces.map((p) => (
                  <option key={p.id} value={String(p.id)}>{p.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">District</label>
              <select
                value={data.currentDistrict}
                onChange={(e) => {
                  const id = e.target.value;
                  districtUserChanged.current = true;
                  onChange({
                    ...data,
                    currentDistrict: id,
                    currentDistrictName: districts.find((item) => String(item.id) === id)?.name ?? "",
                    currentMunicipality: "",
                    currentMunicipalityName: "",
                    currentWard: "",
                    currentWardNumber: "",
                  });
                }}
                disabled={districtLoading || data.currentProvince === ""}
                className={`h-10 w-full rounded-xl border px-3 text-sm outline-none focus:border-[#234A91] focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100 ${
                  errors.currentDistrict ? "border-red-500" : "border-gray-200"
                }`}
              >
                <option value="">{districtLoading ? "Loading..." : "Select District"}</option>
                {districts.map((d) => (
                  <option key={d.id} value={String(d.id)}>{d.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Municipality</label>
              <select
                value={data.currentMunicipality}
                onChange={(e) => {
                  const id = e.target.value;
                  municipalityUserChanged.current = true;
                  onChange({
                    ...data,
                    currentMunicipality: id,
                    currentMunicipalityName: municipalities.find((item) => String(item.id) === id)?.name ?? "",
                    currentWard: "",
                    currentWardNumber: "",
                  });
                }}
                disabled={municipalityLoading || data.currentDistrict === ""}
                className={`h-10 w-full rounded-xl border px-3 text-sm outline-none focus:border-[#234A91] focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100 ${
                  errors.currentMunicipality ? "border-red-500" : "border-gray-200"
                }`}
              >
                <option value="">{municipalityLoading ? "Loading..." : "Select Municipality"}</option>
                {municipalities.map((m) => (
                  <option key={m.id} value={String(m.id)}>{m.name} ({m.type})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Ward</label>
              <select
                value={data.currentWard}
                onChange={(e) => {
                  const id = e.target.value;
                  onChange({
                    ...data,
                    currentWard: id,
                    currentWardNumber: wards.find((item) => String(item.id) === id)?.number.toString() ?? "",
                  });
                }}
                disabled={wardLoading || data.currentMunicipality === ""}
                className={`h-10 w-full rounded-xl border px-3 text-sm outline-none focus:border-[#234A91] focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100 ${
                  errors.currentWard ? "border-red-500" : "border-gray-200"
                }`}
              >
                <option value="">{wardLoading ? "Loading..." : "Select Ward"}</option>
                {wards.map((w) => (
                  <option key={w.id} value={String(w.id)}>{w.number}</option>
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
            id="sameAsCurrent"
            checked={data.permanentSameAsCurrent}
            onChange={(e) => {
              update("permanentSameAsCurrent", e.target.checked);
              if (e.target.checked) copyToPermanent();
            }}
            className="w-4 h-4 rounded border-gray-300 text-[#234A91] focus:ring-[#234A91]"
          />
          <label htmlFor="sameAsCurrent" className="text-sm text-gray-700">
            Same as Current Address
          </label>
        </div>

        {!data.permanentSameAsCurrent && (
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Permanent Address</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Province</label>
                <input
                  type="text"
                  value={data.permanentProvince}
                  onChange={(e) => update("permanentProvince", e.target.value)}
                  disabled={data.permanentSameAsCurrent}
                  className="h-10 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-[#234A91] focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">District</label>
                <input
                  type="text"
                  value={data.permanentDistrict}
                  onChange={(e) => update("permanentDistrict", e.target.value)}
                  disabled={data.permanentSameAsCurrent}
                  className="h-10 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-[#234A91] focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Municipality</label>
                <input
                  type="text"
                  value={data.permanentMunicipality}
                  onChange={(e) => update("permanentMunicipality", e.target.value)}
                  disabled={data.permanentSameAsCurrent}
                  className="h-10 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-[#234A91] focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Ward</label>
                <input
                  type="text"
                  value={data.permanentWard}
                  onChange={(e) => update("permanentWard", e.target.value)}
                  disabled={data.permanentSameAsCurrent}
                  className="h-10 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-[#234A91] focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100"
                />
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

export default AddressSection;
