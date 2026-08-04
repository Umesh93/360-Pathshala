import React, { useRef } from "react";
import type { PersonalData } from "../schemas/teacher.schema";

interface TeacherPersonalSectionProps {
  data: PersonalData;
  onChange: (data: PersonalData) => void;
  errors?: Record<string, string>;
}

const TeacherPersonalSection: React.FC<TeacherPersonalSectionProps> = ({
  data,
  onChange,
  errors = {},
}) => {
  const update = (field: keyof PersonalData, value: string) => {
    onChange({ ...data, [field]: value });
  };

  const photoRef = useRef<HTMLInputElement>(null);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        update("photo", reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Personal Information</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="flex flex-col items-center">
          <div
            onClick={() => photoRef.current?.click()}
            className="w-24 h-24 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-[#234A91] overflow-hidden"
          >
            {data.photo ? (
              <img src={data.photo} alt="Preview" className="w-full h-full object-cover" />
            ) : (
              <span className="text-xs text-gray-500 text-center px-2">Click to upload</span>
            )}
          </div>
          <input
            ref={photoRef}
            type="file"
            accept="image/*"
            onChange={handlePhotoChange}
            className="hidden"
          />
          <p className="mt-2 text-xs text-gray-500">Profile Photo</p>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">First Name <span className="text-red-500">*</span></label>
          <input
            type="text"
            value={data.firstName}
            onChange={(e) => {
              update("firstName", e.target.value);
            }}
            className={`h-10 w-full rounded-xl border px-3 text-sm outline-none focus:border-[#234A91] focus:ring-2 focus:ring-blue-100 ${
              errors.firstName ? "border-red-500" : "border-gray-200"
            }`}
          />
          {errors.firstName && <p className="mt-1 text-xs text-red-600">{errors.firstName}</p>}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Middle Name</label>
          <input
            type="text"
            value={data.middleName}
            onChange={(e) => {
              update("middleName", e.target.value);
            }}
            className="h-10 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-[#234A91] focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Last Name <span className="text-red-500">*</span></label>
          <input
            type="text"
            value={data.lastName}
            onChange={(e) => {
              update("lastName", e.target.value);
            }}
            className={`h-10 w-full rounded-xl border px-3 text-sm outline-none focus:border-[#234A91] focus:ring-2 focus:ring-blue-100 ${
              errors.lastName ? "border-red-500" : "border-gray-200"
            }`}
          />
          {errors.lastName && <p className="mt-1 text-xs text-red-600">{errors.lastName}</p>}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Date of Birth <span className="text-red-500">*</span></label>
          <input
            type="date"
            value={data.dob}
            onChange={(e) => update("dob", e.target.value)}
            className={`h-10 w-full rounded-xl border px-3 text-sm outline-none focus:border-[#234A91] focus:ring-2 focus:ring-blue-100 ${
              errors.dob ? "border-red-500" : "border-gray-200"
            }`}
          />
          {errors.dob && <p className="mt-1 text-xs text-red-600">{errors.dob}</p>}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Gender <span className="text-red-500">*</span></label>
          <select
            value={data.gender}
            onChange={(e) => update("gender", e.target.value)}
            className={`h-10 w-full rounded-xl border px-3 text-sm outline-none focus:border-[#234A91] focus:ring-2 focus:ring-blue-100 ${
              errors.gender ? "border-red-500" : "border-gray-200"
            }`}
          >
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
          {errors.gender && <p className="mt-1 text-xs text-red-600">{errors.gender}</p>}
        </div>


        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Nationality</label>
          <input
            type="text"
            value={data.nationality}
            onChange={(e) => update("nationality", e.target.value)}
            className="h-10 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-[#234A91] focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Religion</label>
          <input
            type="text"
            value={data.religion}
            onChange={(e) => update("religion", e.target.value)}
            className="h-10 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-[#234A91] focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Marital Status</label>
          <select
            value={data.maritalStatus}
            onChange={(e) => update("maritalStatus", e.target.value)}
            className="h-10 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-[#234A91] focus:ring-2 focus:ring-blue-100"
          >
            <option value="">Select</option>
            <option value="single">Single</option>
            <option value="married">Married</option>
            <option value="divorced">Divorced</option>
            <option value="widowed">Widowed</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Phone Number <span className="text-red-500">*</span></label>
          <input
            type="tel"
            value={data.phone}
            onChange={(e) => update("phone", e.target.value)}
            className={`h-10 w-full rounded-xl border px-3 text-sm outline-none focus:border-[#234A91] focus:ring-2 focus:ring-blue-100 ${
              errors.phone ? "border-red-500" : "border-gray-200"
            }`}
          />
          {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone}</p>}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Alternative Phone</label>
          <input
            type="tel"
            value={data.alternativePhone}
            onChange={(e) => update("alternativePhone", e.target.value)}
            className="h-10 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-[#234A91] focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Email <span className="text-red-500">*</span></label>
          <input
            type="email"
            value={data.email}
            onChange={(e) => update("email", e.target.value)}
            className={`h-10 w-full rounded-xl border px-3 text-sm outline-none focus:border-[#234A91] focus:ring-2 focus:ring-blue-100 ${
              errors.email ? "border-red-500" : "border-gray-200"
            }`}
          />
          {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Citizenship / National ID</label>
          <input
            type="text"
            value={data.citizenshipNumber}
            onChange={(e) => update("citizenshipNumber", e.target.value)}
            className="h-10 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-[#234A91] focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Passport Number (Optional)</label>
          <input
            type="text"
            value={data.passportNumber}
            onChange={(e) => update("passportNumber", e.target.value)}
            className="h-10 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-[#234A91] focus:ring-2 focus:ring-blue-100"
          />
        </div>
      </div>
    </div>
  );
};

export default TeacherPersonalSection;
