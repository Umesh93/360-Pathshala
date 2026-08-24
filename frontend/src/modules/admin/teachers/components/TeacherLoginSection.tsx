import React, { useState } from "react";
import type { LoginData } from "../schemas/teacher.schema";
import { generatePassword } from "../utils/teacherFormHelpers";

interface TeacherLoginSectionProps {
  data: LoginData;
  onChange: (data: LoginData) => void;
  errors?: Record<string, string>;
  accountCreated?: boolean;
}

const TeacherLoginSection: React.FC<TeacherLoginSectionProps> = ({
  data,
  onChange,
  errors = {},
  accountCreated = false,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const update = (field: keyof LoginData, value: string | boolean) => {
    onChange({ ...data, [field]: value });
  };

  const handleGeneratePassword = () => {
    const newPassword = generatePassword();
    onChange({ ...data, password: newPassword, confirmPassword: newPassword });
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">
        Login Account
      </h2>

      {accountCreated ? (
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          Login account is active for this Teacher.
        </p>
      ) : <>

      <div className="flex items-center gap-2 mb-4">
        <input
          type="checkbox"
          id="createLogin"
          checked={data.createLogin}
          onChange={(e) => update("createLogin", e.target.checked)}
          className="h-4 w-4 rounded border-gray-300 text-[#234A91] focus:ring-[#234A91]"
        />
        <label
          htmlFor="createLogin"
          className="text-sm font-medium text-gray-700"
        >
          Create Login Account
        </label>
      </div>

      {data.createLogin && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Username
            </label>
            <input
              type="text"
              value={data.username}
              onChange={(e) => update("username", e.target.value)}
              className="h-10 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-[#234A91] focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              value={data.email}
              onChange={(e) => update("email", e.target.value)}
              className={`h-10 w-full rounded-xl border px-3 text-sm outline-none focus:border-[#234A91] focus:ring-2 focus:ring-blue-100 ${
                errors.email ? "border-red-500" : "border-gray-200"
              }`}
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-600">{errors.email}</p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={data.password}
                onChange={(e) => update("password", e.target.value)}
                className="h-10 w-full rounded-xl border border-gray-200 px-3 pr-20 text-sm outline-none focus:border-[#234A91] focus:ring-2 focus:ring-blue-100"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <button
                  type="button"
                  onClick={handleGeneratePassword}
                  className="text-xs text-[#234A91] hover:text-blue-700 font-medium"
                >
                  Generate
                </button>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={data.confirmPassword}
                onChange={(e) => update("confirmPassword", e.target.value)}
                className="h-10 w-full rounded-xl border border-gray-200 px-3 pr-16 text-sm outline-none focus:border-[#234A91] focus:ring-2 focus:ring-blue-100"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2">
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="text-xs text-gray-500 hover:text-gray-700"
                >
                  {showConfirmPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      </>}
    </div>
  );
};

export default TeacherLoginSection;
