import React, { useRef } from "react";
import type { GuardianData } from "../schemas/student.schema";

interface GuardianSectionProps {
  data: GuardianData;
  onChange: (data: GuardianData) => void;
  errors?: Record<string, string>;
}

const GuardianSection: React.FC<GuardianSectionProps> = ({
  data,
  onChange,
  errors = {},
}) => {
  const update = (field: keyof GuardianData, value: string | boolean) => {
    onChange({ ...data, [field]: value });
  };

  const fatherPhotoRef = useRef<HTMLInputElement>(null);
  const motherPhotoRef = useRef<HTMLInputElement>(null);
  const guardianPhotoRef = useRef<HTMLInputElement>(null);

  const handlePhotoChange = (ref: React.RefObject<HTMLInputElement | null>, field: "fatherPhoto" | "motherPhoto" | "guardianPhoto") => {
    const file = ref.current?.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        update(field, reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Parent / Guardian</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Father Information</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col items-center">
              <div
                onClick={() => fatherPhotoRef.current?.click()}
                className="w-20 h-20 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-[#234A91] overflow-hidden"
              >
                {data.fatherPhoto ? (
                  <img src={data.fatherPhoto} alt="Father" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xs text-gray-500 text-center px-2">Father Photo</span>
                )}
              </div>
              <input
                ref={fatherPhotoRef}
                type="file"
                accept="image/*"
                onChange={() => handlePhotoChange(fatherPhotoRef, "fatherPhoto")}
                className="hidden"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                value={data.fatherName}
                onChange={(e) => update("fatherName", e.target.value)}
                className={`h-10 w-full rounded-xl border px-3 text-sm outline-none focus:border-[#234A91] focus:ring-2 focus:ring-blue-100 ${
                  errors.fatherName ? "border-red-500" : "border-gray-200"
                }`}
              />
              {errors.fatherName && <p className="mt-1 text-xs text-red-600">{errors.fatherName}</p>}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Occupation</label>
              <input
                type="text"
                value={data.fatherOccupation}
                onChange={(e) => update("fatherOccupation", e.target.value)}
                className="h-10 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-[#234A91] focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Phone</label>
              <input
                type="tel"
                value={data.fatherPhone}
                onChange={(e) => update("fatherPhone", e.target.value)}
                className={`h-10 w-full rounded-xl border px-3 text-sm outline-none focus:border-[#234A91] focus:ring-2 focus:ring-blue-100 ${
                  errors.fatherPhone ? "border-red-500" : "border-gray-200"
                }`}
              />
              {errors.fatherPhone && <p className="mt-1 text-xs text-red-600">{errors.fatherPhone}</p>}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                value={data.fatherEmail}
                onChange={(e) => update("fatherEmail", e.target.value)}
                className={`h-10 w-full rounded-xl border px-3 text-sm outline-none focus:border-[#234A91] focus:ring-2 focus:ring-blue-100 ${
                  errors.fatherEmail ? "border-red-500" : "border-gray-200"
                }`}
              />
              {errors.fatherEmail && <p className="mt-1 text-xs text-red-600">{errors.fatherEmail}</p>}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Mother Information</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col items-center">
              <div
                onClick={() => motherPhotoRef.current?.click()}
                className="w-20 h-20 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-[#234A91] overflow-hidden"
              >
                {data.motherPhoto ? (
                  <img src={data.motherPhoto} alt="Mother" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xs text-gray-500 text-center px-2">Mother Photo</span>
                )}
              </div>
              <input
                ref={motherPhotoRef}
                type="file"
                accept="image/*"
                onChange={() => handlePhotoChange(motherPhotoRef, "motherPhoto")}
                className="hidden"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                value={data.motherName}
                onChange={(e) => update("motherName", e.target.value)}
                className="h-10 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-[#234A91] focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Occupation</label>
              <input
                type="text"
                value={data.motherOccupation}
                onChange={(e) => update("motherOccupation", e.target.value)}
                className="h-10 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-[#234A91] focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Phone</label>
              <input
                type="tel"
                value={data.motherPhone}
                onChange={(e) => update("motherPhone", e.target.value)}
                className="h-10 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-[#234A91] focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                value={data.motherEmail}
                onChange={(e) => update("motherEmail", e.target.value)}
                className="h-10 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-[#234A91] focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-gray-200">
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">Guardian Selection</h3>
        <div className="flex gap-4 mb-4">
          {(["father", "mother", "other"] as const).map((option) => (
            <label key={option} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="guardianSelection"
                value={option}
                checked={data.guardianSelection === option}
                onChange={(e) => update("guardianSelection", e.target.value)}
                className="w-4 h-4 text-[#234A91] border-gray-300 focus:ring-[#234A91]"
              />
              <span className="text-sm text-gray-700 capitalize">{option}</span>
            </label>
          ))}
        </div>

        {data.guardianSelection === "other" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex flex-col items-center">
              <div
                onClick={() => guardianPhotoRef.current?.click()}
                className="w-20 h-20 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-[#234A91] overflow-hidden"
              >
                {data.guardianPhoto ? (
                  <img src={data.guardianPhoto} alt="Guardian" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xs text-gray-500 text-center px-2">Guardian Photo</span>
                )}
              </div>
              <input
                ref={guardianPhotoRef}
                type="file"
                accept="image/*"
                onChange={() => handlePhotoChange(guardianPhotoRef, "guardianPhoto")}
                className="hidden"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Guardian Name</label>
              <input
                type="text"
                value={data.guardianName}
                onChange={(e) => update("guardianName", e.target.value)}
                className="h-10 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-[#234A91] focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Relationship</label>
              <input
                type="text"
                value={data.guardianRelationship}
                onChange={(e) => update("guardianRelationship", e.target.value)}
                className="h-10 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-[#234A91] focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Occupation</label>
              <input
                type="text"
                value={data.guardianOccupation}
                onChange={(e) => update("guardianOccupation", e.target.value)}
                className="h-10 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-[#234A91] focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Phone</label>
              <input
                type="tel"
                value={data.guardianPhone}
                onChange={(e) => update("guardianPhone", e.target.value)}
                className="h-10 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-[#234A91] focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                value={data.guardianEmail}
                onChange={(e) => update("guardianEmail", e.target.value)}
                className="h-10 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-[#234A91] focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div className="sm:col-span-2 lg:col-span-3">
              <label className="mb-1 block text-sm font-medium text-gray-700">Address</label>
              <input
                type="text"
                value={data.guardianAddress}
                onChange={(e) => update("guardianAddress", e.target.value)}
                className="h-10 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-[#234A91] focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GuardianSection;
