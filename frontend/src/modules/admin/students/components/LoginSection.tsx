import React, { useState } from "react";
import { Eye, EyeOff, RefreshCw } from "lucide-react";
import type { LoginData } from "../schemas/student.schema";

interface LoginSectionProps {
  data: LoginData;
  onChange: (data: LoginData) => void;
}

const LoginSection: React.FC<LoginSectionProps> = ({ data, onChange }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const update = (field: keyof LoginData, value: string | boolean) => {
    onChange({ ...data, [field]: value });
  };

  const generatePassword = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let password = "";
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    update("password", password);
    update("confirmPassword", password);
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Login Account</h2>

      <div className="flex items-center gap-2 mb-4">
        <input
          type="checkbox"
          id="createLogin"
          checked={data.createLogin}
          onChange={(e) => update("createLogin", e.target.checked)}
          className="w-4 h-4 rounded border-gray-300 text-[#234A91] focus:ring-[#234A91]"
        />
        <label htmlFor="createLogin" className="text-sm text-gray-700">
          Create Login Account
        </label>
      </div>

      {data.createLogin && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Student Email</label>
            <input
              type="email"
              value={data.email}
              onChange={(e) => update("email", e.target.value)}
              className="h-10 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-[#234A91] focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Username</label>
            <input
              type="text"
              value={data.username}
              onChange={(e) => update("username", e.target.value)}
              className="h-10 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-[#234A91] focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Password</label>
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
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-1 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
                <button
                  type="button"
                  onClick={generatePassword}
                  className="p-1 text-gray-400 hover:text-gray-600"
                >
                  <RefreshCw size={16} />
                </button>
              </div>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Confirm Password</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={data.confirmPassword}
                onChange={(e) => update("confirmPassword", e.target.value)}
                className="h-10 w-full rounded-xl border border-gray-200 px-3 pr-10 text-sm outline-none focus:border-[#234A91] focus:ring-2 focus:ring-blue-100"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginSection;
