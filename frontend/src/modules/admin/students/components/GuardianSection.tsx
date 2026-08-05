import { useRef } from "react";
import RequiredLabel from "../../../../components/forms/RequiredLabel";
import type { GuardianData } from "../schemas/student.schema";

interface GuardianSectionProps {
  data: GuardianData;
  onChange: (data: GuardianData) => void;
  errors?: Record<string, string>;
}

const fieldClass = (error?: string, readOnly = false) => `h-10 w-full rounded-xl border px-3 text-sm outline-none ${readOnly ? "border-gray-200 bg-gray-50 text-gray-600" : "focus:border-[#234A91] focus:ring-2 focus:ring-blue-100"} ${error ? "border-red-500" : "border-gray-200"}`;
const ErrorText = ({ error }: { error?: string }) => error ? <p className="mt-1 text-xs text-red-600">{error}</p> : null;

const fullName = (...names: (string | undefined)[]) => names.map((name) => name?.trim()).filter(Boolean).join(" ");

export default function GuardianSection({ data, onChange, errors = {} }: GuardianSectionProps) {
  const fatherPhotoRef = useRef<HTMLInputElement>(null);
  const motherPhotoRef = useRef<HTMLInputElement>(null);

  const update = <K extends keyof GuardianData>(field: K, value: GuardianData[K]) => {
    const next = { ...data, [field]: value };
    if (data.guardianSelection === "father" && ["fatherFirstName", "fatherMiddleName", "fatherLastName", "fatherPhone", "fatherEmail", "fatherOccupation", "fatherCitizenship"].includes(field)) {
      next.guardianName = fullName(next.fatherFirstName, next.fatherMiddleName, next.fatherLastName);
      next.guardianRelationship = "Father";
      next.guardianPhone = next.fatherPhone || "";
      next.guardianEmail = next.fatherEmail || "";
      next.guardianOccupation = next.fatherOccupation || "";
      next.guardianCitizenship = next.fatherCitizenship || "";
    }
    if (data.guardianSelection === "mother" && ["motherFirstName", "motherMiddleName", "motherLastName", "motherPhone", "motherEmail", "motherOccupation", "motherCitizenship"].includes(field)) {
      next.guardianName = fullName(next.motherFirstName, next.motherMiddleName, next.motherLastName);
      next.guardianRelationship = "Mother";
      next.guardianPhone = next.motherPhone || "";
      next.guardianEmail = next.motherEmail || "";
      next.guardianOccupation = next.motherOccupation || "";
      next.guardianCitizenship = next.motherCitizenship || "";
    }
    onChange(next);
  };

  const selectGuardian = (selection: GuardianData["guardianSelection"]) => {
    if (selection === "father") {
      onChange({
        ...data,
        guardianSelection: selection,
        guardianName: fullName(data.fatherFirstName, data.fatherMiddleName, data.fatherLastName),
        guardianRelationship: "Father",
        guardianPhone: data.fatherPhone || "",
        guardianEmail: data.fatherEmail || "",
        guardianOccupation: data.fatherOccupation || "",
        guardianCitizenship: data.fatherCitizenship || "",
        guardianAddress: "",
      });
      return;
    }
    if (selection === "mother") {
      onChange({
        ...data,
        guardianSelection: selection,
        guardianName: fullName(data.motherFirstName, data.motherMiddleName, data.motherLastName),
        guardianRelationship: "Mother",
        guardianPhone: data.motherPhone || "",
        guardianEmail: data.motherEmail || "",
        guardianOccupation: data.motherOccupation || "",
        guardianCitizenship: data.motherCitizenship || "",
        guardianAddress: "",
      });
      return;
    }
    onChange({
      ...data,
      guardianSelection: selection,
      guardianName: "",
      guardianRelationship: "",
      guardianPhone: "",
      guardianEmail: "",
      guardianAddress: "",
      guardianOccupation: "",
      guardianCitizenship: "",
    });
  };

  const readPhoto = (field: "fatherPhoto" | "motherPhoto", file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => update(field, String(reader.result));
    reader.readAsDataURL(file);
  };

  const textField = (field: keyof GuardianData, label: string, required = false, type = "text", readOnly = false) => <div>
    <RequiredLabel required={required}>{label}</RequiredLabel>
    <input
      data-field={field}
      type={type}
      value={String(data[field] || "")}
      onChange={(event) => update(field, event.target.value)}
      className={fieldClass(errors[field], readOnly)}
      required={required}
      readOnly={readOnly}
      aria-invalid={!!errors[field]}
    />
    <ErrorText error={errors[field]} />
  </div>;

  return <div className="space-y-4">
    <section className="bg-white rounded-xl p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Father Information</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <RequiredLabel>Photo</RequiredLabel>
          <button type="button" onClick={() => fatherPhotoRef.current?.click()} className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-gray-300 text-xs text-gray-500">
            {data.fatherPhoto ? <img src={String(data.fatherPhoto)} alt="Father" className="h-full w-full object-cover" /> : "Choose Photo"}
          </button>
          <input ref={fatherPhotoRef} type="file" accept="image/*" onChange={(event) => readPhoto("fatherPhoto", event.target.files?.[0])} className="hidden" />
        </div>
        {textField("fatherFirstName", "First Name", true)}
        {textField("fatherMiddleName", "Middle Name")}
        {textField("fatherLastName", "Last Name", true)}
        {textField("fatherOccupation", "Occupation")}
        {textField("fatherPhone", "Phone", true, "tel")}
        {textField("fatherEmail", "Email", false, "email")}
        {textField("fatherCitizenship", "Citizenship")}
      </div>
    </section>

    <section className="bg-white rounded-xl p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Mother Information <span className="text-sm font-normal text-gray-500">(Optional)</span></h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <RequiredLabel>Photo</RequiredLabel>
          <button type="button" onClick={() => motherPhotoRef.current?.click()} className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-gray-300 text-xs text-gray-500">
            {data.motherPhoto ? <img src={String(data.motherPhoto)} alt="Mother" className="h-full w-full object-cover" /> : "Choose Photo"}
          </button>
          <input ref={motherPhotoRef} type="file" accept="image/*" onChange={(event) => readPhoto("motherPhoto", event.target.files?.[0])} className="hidden" />
        </div>
        {textField("motherFirstName", "First Name")}
        {textField("motherMiddleName", "Middle Name")}
        {textField("motherLastName", "Last Name")}
        {textField("motherOccupation", "Occupation")}
        {textField("motherPhone", "Phone", false, "tel")}
        {textField("motherEmail", "Email", false, "email")}
        {textField("motherCitizenship", "Citizenship")}
      </div>
    </section>

    <section className="bg-white rounded-xl p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Guardian Selection</h2>
      <div data-field="guardianSelection" className={`flex flex-wrap gap-6 rounded-xl border p-4 ${errors.guardianSelection ? "border-red-500" : "border-gray-200"}`}>
        {(["father", "mother", "other"] as const).map((selection) => <label key={selection} className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
          <input type="radio" name="guardianSelection" value={selection} checked={data.guardianSelection === selection} onChange={() => selectGuardian(selection)} className="h-4 w-4 text-[#234A91]" />
          <span className="capitalize">{selection}</span>
        </label>)}
      </div>
      <ErrorText error={errors.guardianSelection} />

      {data.guardianSelection && <div className="mt-6">
        <h3 className="mb-4 text-sm font-semibold uppercase text-gray-700">Guardian Information</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {textField("guardianName", "Guardian Name", data.guardianSelection === "other", "text", data.guardianSelection !== "other")}
          {textField("guardianRelationship", "Relationship", data.guardianSelection === "other", "text", data.guardianSelection !== "other")}
          {textField("guardianPhone", "Phone", data.guardianSelection === "other", "tel", data.guardianSelection !== "other")}
          {textField("guardianEmail", "Email", false, "email", data.guardianSelection !== "other")}
          {data.guardianSelection === "other" && textField("guardianAddress", "Address")}
          {data.guardianSelection === "other" && textField("guardianOccupation", "Occupation")}
          {data.guardianSelection === "other" && textField("guardianCitizenship", "Citizenship")}
        </div>
      </div>}
    </section>
  </div>;
}
