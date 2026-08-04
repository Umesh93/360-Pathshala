import { useEffect, useState } from "react";
import { getDistricts, getProvinces } from "./address.service";
import type { AddressValue, LocationOption } from "./address.types";
import RequiredLabel from "../../forms/RequiredLabel";

interface AddressFormProps<T extends AddressValue> {
  data: T;
  onChange: (data: T) => void;
  errors?: Record<string, string>;
}

const selectedId = (value: string, options: LocationOption[]) =>
  options.find((option) => option.name === value)?.id.toString() ?? value;

export default function AddressForm<T extends AddressValue>({ data, onChange, errors = {} }: AddressFormProps<T>) {
  const [provinces, setProvinces] = useState<LocationOption[]>([]);
  const [currentDistricts, setCurrentDistricts] = useState<LocationOption[]>([]);
  const [permanentDistricts, setPermanentDistricts] = useState<LocationOption[]>([]);
  const [provinceLoading, setProvinceLoading] = useState(true);
  const [currentDistrictLoading, setCurrentDistrictLoading] = useState(false);
  const [permanentDistrictLoading, setPermanentDistrictLoading] = useState(false);

  useEffect(() => {
    let active = true;
    getProvinces().then((items) => {
      if (active) setProvinces(items);
    }).finally(() => {
      if (active) setProvinceLoading(false);
    });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    const provinceId = Number(selectedId(data.currentProvince, provinces));
    if (!provinceId) return;
    let active = true;
    Promise.resolve().then(() => setCurrentDistrictLoading(true));
    getDistricts(provinceId).then((items) => {
      if (active) setCurrentDistricts(items);
    }).finally(() => {
      if (active) setCurrentDistrictLoading(false);
    });
    return () => { active = false; };
  }, [data.currentProvince, provinces]);

  useEffect(() => {
    const provinceId = Number(selectedId(data.permanentProvince || "", provinces));
    if (!provinceId || data.permanentSameAsCurrent) return;
    let active = true;
    Promise.resolve().then(() => setPermanentDistrictLoading(true));
    getDistricts(provinceId).then((items) => {
      if (active) setPermanentDistricts(items);
    }).finally(() => {
      if (active) setPermanentDistrictLoading(false);
    });
    return () => { active = false; };
  }, [data.permanentProvince, data.permanentSameAsCurrent, provinces]);

  const fieldClass = (error?: string) => `h-10 w-full rounded-xl border px-3 text-sm outline-none focus:border-[#234A91] focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100 ${error ? "border-red-500" : "border-gray-200"}`;
  const errorText = (error?: string) => error ? <p className="mt-1 text-xs text-red-600">{error}</p> : null;
  const currentProvinceId = selectedId(data.currentProvince, provinces);
  const currentDistrictId = selectedId(data.currentDistrict, currentDistricts);
  const permanentProvinceId = selectedId(data.permanentProvince || "", provinces);
  const permanentDistrictId = selectedId(data.permanentDistrict || "", permanentDistricts);

  const copyCurrent = (checked: boolean) => onChange({
    ...data,
    permanentSameAsCurrent: checked,
    ...(checked ? {
      permanentProvince: data.currentProvince,
      permanentProvinceName: data.currentProvinceName,
      permanentDistrict: data.currentDistrict,
      permanentDistrictName: data.currentDistrictName,
      permanentMunicipality: data.currentMunicipality,
      permanentWard: data.currentWard,
      permanentStreet: data.currentStreet,
    } : {}),
  });

  return <div className="bg-white rounded-xl p-6 shadow-sm">
    <h2 className="text-lg font-semibold text-gray-800 mb-4">Address</h2>
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Current Address</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <RequiredLabel required>Province</RequiredLabel>
            <select value={currentProvinceId} onChange={(event) => { const item = provinces.find((option) => String(option.id) === event.target.value); onChange({ ...data, currentProvince: event.target.value, currentProvinceName: item?.name || "", currentDistrict: "", currentDistrictName: "" }); }} disabled={provinceLoading} className={fieldClass(errors.currentProvince)} aria-required="true" aria-invalid={!!errors.currentProvince}>
              <option value="">{provinceLoading ? "Loading..." : "Select Province"}</option>
              {provinces.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
            </select>
            {errorText(errors.currentProvince)}
          </div>
          <div>
            <RequiredLabel required>District</RequiredLabel>
            <select value={currentDistrictId} onChange={(event) => { const item = currentDistricts.find((option) => String(option.id) === event.target.value); onChange({ ...data, currentDistrict: event.target.value, currentDistrictName: item?.name || "" }); }} disabled={!data.currentProvince || currentDistrictLoading} className={fieldClass(errors.currentDistrict)} aria-required="true" aria-invalid={!!errors.currentDistrict}>
              <option value="">{currentDistrictLoading ? "Loading..." : "Select District"}</option>
              {currentDistricts.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
            </select>
            {errorText(errors.currentDistrict)}
          </div>
          <div>
            <RequiredLabel required>Municipality</RequiredLabel>
            <input data-field="currentMunicipality" type="text" value={data.currentMunicipality} onChange={(event) => onChange({ ...data, currentMunicipality: event.target.value, currentMunicipalityName: event.target.value })} className={fieldClass(errors.currentMunicipality)} aria-required="true" aria-invalid={!!errors.currentMunicipality} />
            {errorText(errors.currentMunicipality)}
          </div>
          <div>
            <RequiredLabel required>Ward Number</RequiredLabel>
            <input data-field="currentWard" type="number" min={1} max={35} value={data.currentWard} onChange={(event) => onChange({ ...data, currentWard: event.target.value, currentWardNumber: event.target.value })} className={fieldClass(errors.currentWard)} aria-required="true" aria-invalid={!!errors.currentWard} />
            {errorText(errors.currentWard)}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Street/Tole (Optional)</label>
            <input data-field="currentStreet" type="text" value={data.currentStreet || ""} onChange={(event) => onChange({ ...data, currentStreet: event.target.value })} className={fieldClass()} />
          </div>
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm text-gray-700"><input type="checkbox" checked={data.permanentSameAsCurrent} onChange={(event) => copyCurrent(event.target.checked)} className="w-4 h-4 rounded border-gray-300 text-[#234A91] focus:ring-[#234A91]" />Same as Current Address</label>

      {!data.permanentSameAsCurrent && <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Permanent Address</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Province (Optional)</label>
            <select value={permanentProvinceId} onChange={(event) => { const item = provinces.find((option) => String(option.id) === event.target.value); onChange({ ...data, permanentProvince: event.target.value, permanentProvinceName: item?.name || "", permanentDistrict: "", permanentDistrictName: "" }); }} disabled={provinceLoading} className={fieldClass()}>
              <option value="">Select Province</option>
              {provinces.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">District (Optional)</label>
            <select value={permanentDistrictId} onChange={(event) => { const item = permanentDistricts.find((option) => String(option.id) === event.target.value); onChange({ ...data, permanentDistrict: event.target.value, permanentDistrictName: item?.name || "" }); }} disabled={!data.permanentProvince || permanentDistrictLoading} className={fieldClass()}>
              <option value="">{permanentDistrictLoading ? "Loading..." : "Select District"}</option>
              {permanentDistricts.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Municipality (Optional)</label>
            <input data-field="permanentMunicipality" type="text" value={data.permanentMunicipality || ""} onChange={(event) => onChange({ ...data, permanentMunicipality: event.target.value })} className={fieldClass()} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Ward Number (Optional)</label>
            <input data-field="permanentWard" type="number" min={1} max={35} value={data.permanentWard || ""} onChange={(event) => onChange({ ...data, permanentWard: event.target.value })} className={fieldClass()} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Street/Tole (Optional)</label>
            <input data-field="permanentStreet" type="text" value={data.permanentStreet || ""} onChange={(event) => onChange({ ...data, permanentStreet: event.target.value })} className={fieldClass()} />
          </div>
        </div>
      </div>}
    </div>
  </div>;
}
