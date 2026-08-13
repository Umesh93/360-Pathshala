import React, { useRef } from "react";
import type { PersonalInfoData } from "../schemas/student.schema";
import RequiredLabel from "../../../../components/forms/RequiredLabel";

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

  const fieldClass = (error?: string) =>
    `h-10 w-full rounded-xl border px-3 text-sm outline-none focus:border-[#234A91] focus:ring-2 focus:ring-blue-100 ${error ? "border-red-500" : "border-gray-200"}`;
  const errorText = (error?: string) =>
    error ? <p className="mt-1 text-xs text-red-600">{error}</p> : null;

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
          <RequiredLabel required>First Name</RequiredLabel>
          <input
            data-field="firstName"
            type="text"
            value={data.firstName}
            onChange={(e) => {
              update("firstName", e.target.value);
            }}
            className={fieldClass(errors.firstName)}
            aria-required="true"
            aria-invalid={!!errors.firstName}
          />
          {errorText(errors.firstName)}
        </div>

        <div>
          <RequiredLabel>Middle Name</RequiredLabel>
          <input
            data-field="middleName"
            type="text"
            value={data.middleName}
            onChange={(e) => {
              update("middleName", e.target.value);
            }}
            className={fieldClass()}
          />
        </div>

        <div>
          <RequiredLabel required>Last Name</RequiredLabel>
          <input
            data-field="lastName"
            type="text"
            value={data.lastName}
            onChange={(e) => {
              update("lastName", e.target.value);
            }}
            className={fieldClass(errors.lastName)}
            aria-required="true"
            aria-invalid={!!errors.lastName}
          />
          {errorText(errors.lastName)}
        </div>

        <div>
          <RequiredLabel required>Date of Birth</RequiredLabel>
          <input
            data-field="dob"
            type="date"
            value={data.dob}
            onChange={(e) => update("dob", e.target.value)}
            className={fieldClass(errors.dob)}
            aria-required="true"
            aria-invalid={!!errors.dob}
          />
          {errorText(errors.dob)}
        </div>

        <div>
          <RequiredLabel required>Gender</RequiredLabel>
          <select
            data-field="gender"
            value={data.gender}
            onChange={(e) => update("gender", e.target.value)}
            className={fieldClass(errors.gender)}
            aria-required="true"
            aria-invalid={!!errors.gender}
          >
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
          {errorText(errors.gender)}
        </div>

        <div>
          <RequiredLabel required>Religion</RequiredLabel>
          <select
            data-field="religion"
            value={data.religion}
            onChange={(e) => update("religion", e.target.value)}
            className={fieldClass(errors.religion)}
            aria-required="true"
            aria-invalid={!!errors.religion}
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
          {errorText(errors.religion)}
        </div>

        <div>
          <RequiredLabel required>Caste</RequiredLabel>
          <select
            data-field="caste"
            value={data.caste}
            onChange={(e) => update("caste", e.target.value)}
            className={fieldClass(errors.caste)}
            aria-required="true"
            aria-invalid={!!errors.caste}
          >
            <option value="">Select Caste</option>
            <option value="Brahmin/Chhetri">Brahmin/Chhetri</option>
            <option value="Adivasi/Janajati">Adivasi/Janajati</option>
            <option value="Dalit">Dalit</option>
            <option value="Madhesi">Madhesi</option>
            <option value="Other">Other</option>
          </select>
          {errorText(errors.caste)}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Citizenship Number (Optional)
          </label>
          <input
            data-field="citizenshipNumber"
            type="text"
            value={data.citizenshipNumber}
            onChange={(e) => update("citizenshipNumber", e.target.value)}
            className={fieldClass()}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Nationality
          </label>
          <input
            data-field="nationality"
            type="text"
            value={data.nationality}
            onChange={(e) => update("nationality", e.target.value)}
            className={fieldClass()}
          />
        </div>

        <div>
          <RequiredLabel required>Phone Number</RequiredLabel>
          <input
            data-field="phone"
            type="tel"
            value={data.phone}
            onChange={(e) => update("phone", e.target.value)}
            className={fieldClass(errors.phone)}
            aria-required="true"
            aria-invalid={!!errors.phone}
          />
          {errorText(errors.phone)}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Email (Optional)
          </label>
          <input
            data-field="email"
            type="email"
            value={data.email}
            onChange={(e) => update("email", e.target.value)}
            className={fieldClass(errors.email)}
            aria-invalid={!!errors.email}
          />
          {errorText(errors.email)}
        </div>

        {/* <div>
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
        </div> */}
      </div>
    </div>
  );
};

export default StudentPersonalSection;
