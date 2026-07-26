import React, { useRef } from "react";
import type { PersonalInfoData } from "../schemas/student.schema";

interface StudentPersonalSectionProps {
  data: PersonalInfoData;
  onChange: (data: PersonalInfoData) => void;
  errors?: Record<string, string>;
}

const StudentPersonalSection: React.FC<StudentPersonalSectionProps> = ({
  data,
  onChange,
  errors = {},
}) => {
  const update = (field: keyof PersonalInfoData, value: string) => {
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
      <h2 className="text-lg font-semibold text-gray-800 mb-4">
        Personal Information
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="flex flex-col items-center">
          <div
            onClick={() => photoRef.current?.click()}
            className="w-24 h-24 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-[#234A91] overflow-hidden"
          >
            {data.photo ? (
              <img
                src={data.photo}
                alt="Preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-xs text-gray-500 text-center px-2">
                Click to upload
              </span>
            )}
          </div>
          <input
            ref={photoRef}
            type="file"
            accept="image/*"
            onChange={handlePhotoChange}
            className="hidden"
          />
          <p className="mt-2 text-xs text-gray-500">Student Photo</p>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            First Name
          </label>
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
          {errors.firstName && (
            <p className="mt-1 text-xs text-red-600">{errors.firstName}</p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Middle Name
          </label>
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
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Last Name
          </label>
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
          {errors.lastName && (
            <p className="mt-1 text-xs text-red-600">{errors.lastName}</p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Date of Birth
          </label>
          <input
            type="date"
            value={data.dob}
            onChange={(e) => update("dob", e.target.value)}
            className={`h-10 w-full rounded-xl border px-3 text-sm outline-none focus:border-[#234A91] focus:ring-2 focus:ring-blue-100 ${
              errors.dob ? "border-red-500" : "border-gray-200"
            }`}
          />
          {errors.dob && (
            <p className="mt-1 text-xs text-red-600">{errors.dob}</p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Gender
          </label>
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
          {errors.gender && (
            <p className="mt-1 text-xs text-red-600">{errors.gender}</p>
          )}
        </div>

        {/* <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Blood Group
          </label>
          <select
            value={data.bloodGroup}
            onChange={(e) => update("bloodGroup", e.target.value)}
            className="h-10 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-[#234A91] focus:ring-2 focus:ring-blue-100"
          >
            <option value="">Select</option>
            <option value="A+">A+</option>
            <option value="A-">A-</option>
            <option value="B+">B+</option>
            <option value="B-">B-</option>
            <option value="AB+">AB+</option>
            <option value="AB-">AB-</option>
            <option value="O+">O+</option>
            <option value="O-">O-</option>
          </select>
        </div> */}

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Religion
          </label>
          <select
            value={data.religion}
            onChange={(e) => update("religion", e.target.value)}
            className={`h-10 w-full rounded-xl border px-3 text-sm outline-none focus:border-[#234A91] focus:ring-2 focus:ring-blue-100 ${
              errors.religion ? "border-red-500" : "border-gray-200"
            }`}
          >
            <option value="">Select Religion</option>
            <option value="Hindu">Hindu</option>
            <option value="Buddhist">Buddhist</option>
            <option value="Muslim">Muslim</option>
            <option value="Christian">Christian</option>
            <option value="Kirat">Kirat</option>
            <option value="Sikh">Sikh</option>
            <option value="Jain">Jain</option>
            <option value="Bon">Bon</option>
            <option value="Other">Other</option>
          </select>
          {errors.religion && (
            <p className="mt-1 text-xs text-red-600">{errors.religion}</p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Caste
          </label>
          <select
            value={data.caste}
            onChange={(e) => update("caste", e.target.value)}
            className={`h-10 w-full rounded-xl border px-3 text-sm outline-none focus:border-[#234A91] focus:ring-2 focus:ring-blue-100 ${
              errors.caste ? "border-red-500" : "border-gray-200"
            }`}
          >
            <option value="">Select Caste</option>
            <option value="Brahmin/Chhetri">Brahmin/Chhetri</option>
            <option value="Adivasi/Janajati">Adivasi/Janajati</option>
            <option value="Dalit">Dalit</option>
            <option value="Madhesi">Madhesi</option>
            <option value="Other">Other</option>
          </select>
          {errors.caste && (
            <p className="mt-1 text-xs text-red-600">{errors.caste}</p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Citizenship Number (Optional)
          </label>
          <input
            type="text"
            value={data.citizenshipNumber}
            onChange={(e) => update("citizenshipNumber", e.target.value)}
            className="h-10 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-[#234A91] focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            EMIS ID / Student Registration Number (Optional)
          </label>
          <input
            type="text"
            value={data.emisId}
            onChange={(e) => update("emisId", e.target.value)}
            className="h-10 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-[#234A91] focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Nationality
          </label>
          <input
            type="text"
            value={data.nationality}
            onChange={(e) => update("nationality", e.target.value)}
            className="h-10 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-[#234A91] focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Student ID Barcode
          </label>
          <input
            type="text"
            value={data.studentIdBarcode}
            onChange={(e) => update("studentIdBarcode", e.target.value)}
            placeholder="Future Ready"
            className="h-10 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-[#234A91] focus:ring-2 focus:ring-blue-100"
          />
        </div>
      </div>
    </div>
  );
};

export default StudentPersonalSection;
