import { useEffect, useState } from "react";
import { Copy, Check, RefreshCw, Eye, EyeOff } from "lucide-react";
import MultiSelect from "./MultiSelect";
import { useToast } from "../modules/admin/students/components/Toast";
import type { ModuleOption } from "../types/School";

export const MODULE_OPTIONS: ModuleOption[] = [
  {
    code: "STUDENT_MANAGEMENT",
    name: "Student Registration",
    price: 0,
    isBase: true,
  },
  {
    code: "EXAMINATION",
    name: "Examination & Result Publishing",
    price: 0,
    isBase: true,
  },
  { code: "ATTENDANCE", name: "Attendance", price: 3000, isBase: false },
  {
    code: "TEACHER_DASHBOARD",
    name: "Teacher Dashboard",
    price: 3000,
    isBase: false,
  },
  {
    code: "STUDENT_DASHBOARD",
    name: "Student Dashboard",
    price: 3000,
    isBase: false,
  },
  {
    code: "PARENT_DASHBOARD",
    name: "Parent / Guardian Dashboard",
    price: 3000,
    isBase: false,
  },
  { code: "ACCOUNTS", name: "Accounts", price: 3000, isBase: false },
  { code: "LIBRARY", name: "Library", price: 3000, isBase: false },
  { code: "TRANSPORT", name: "Transport", price: 3000, isBase: false },
  { code: "HOSTEL", name: "Hostel", price: 3000, isBase: false },
  { code: "INVENTORY", name: "Inventory", price: 3000, isBase: false },
  { code: "PAYROLL", name: "Payroll", price: 3000, isBase: false },
  { code: "HR_MANAGEMENT", name: "HR Management", price: 3000, isBase: false },
  {
    code: "LEAVE_MANAGEMENT",
    name: "Leave Management",
    price: 3000,
    isBase: false,
  },
  { code: "ASSIGNMENT", name: "Assignments", price: 3000, isBase: false },
  {
    code: "ACADEMIC_CALENDAR",
    name: "Academic Calendar",
    price: 3000,
    isBase: false,
  },
  { code: "NOTIFICATIONS", name: "Notifications", price: 3000, isBase: false },
];

export const generatePassword = () => {
  const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lower = "abcdefghijklmnopqrstuvwxyz";
  const digits = "0123456789";
  const special = "!@#$%^&*";
  const all = upper + lower + digits + special;
  const random = (max: number) => Math.floor(Math.random() * max);
  const chars = [
    upper[random(upper.length)],
    lower[random(lower.length)],
    digits[random(digits.length)],
    special[random(special.length)],
  ];
  for (let i = 4; i < 12; i++) {
    chars.push(all[random(all.length)]);
  }
  for (let i = chars.length - 1; i > 0; i--) {
    const j = random(i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.join("");
};

interface SchoolFormFieldsProps {
  schoolName: string;
  address: string;
  email: string;
  phone: string;
  username: string;
  password: string;
  selectedModules: string[];
  onSchoolNameChange: (value: string) => void;
  onAddressChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onPhoneChange: (value: string) => void;
  onUsernameChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onModulesChange: (value: string[]) => void;
  onRegeneratePassword?: () => void;
  hideCredentials?: boolean;
  isEdit?: boolean;
}

export default function SchoolFormFields({
  schoolName,
  address,
  email,
  phone,
  username,
  password,
  selectedModules,
  onSchoolNameChange,
  onAddressChange,
  onEmailChange,
  onPhoneChange,
  onUsernameChange,
  onPasswordChange,
  onModulesChange,
  onRegeneratePassword,
  hideCredentials = false,
  isEdit = false,
}: SchoolFormFieldsProps) {
  const { showToast } = useToast();
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [passwordVisible, setPasswordVisible] = useState(false);

  useEffect(() => {
    if (email) {
      const prefix = email.split("@")[0];
      onUsernameChange(prefix);
    }
  }, [email, onUsernameChange]);

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-4">
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            School Name <span className="text-red-500">*</span>
          </label>
          <input
            value={schoolName}
            onChange={(e) => onSchoolNameChange(e.target.value)}
            placeholder="ABC Secondary School"
            className="h-12 w-full rounded-xl border border-slate-300 px-4 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Address <span className="text-red-500">*</span>
          </label>
          <input
            value={address}
            onChange={(e) => onAddressChange(e.target.value)}
            placeholder="Kathmandu"
            className="h-12 w-full rounded-xl border border-slate-300 px-4 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Email Address <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            placeholder="school@gmail.com"
            className="h-12 w-full rounded-xl border border-slate-300 px-4 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Phone Number <span className="text-red-500">*</span>
          </label>
          <input
            value={phone}
            onChange={(e) => onPhoneChange(e.target.value)}
            placeholder="98XXXXXXXX"
            className="h-12 w-full rounded-xl border border-slate-300 px-4 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
          />
        </div>
      </div>

      {!hideCredentials && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Username
            </label>
            <div className="flex items-center gap-2">
              <input
                value={username}
                onChange={(e) => onUsernameChange(e.target.value)}
                className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-600"
              />
              <button
                type="button"
                onClick={() => handleCopy(username, "username")}
                className="rounded-xl border border-slate-200 p-3 hover:bg-slate-50"
              >
                {copiedField === "username" ? (
                  <Check size={18} className="text-teal-600" />
                ) : (
                  <Copy size={18} className="text-slate-500" />
                )}
              </button>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Password
            </label>
            <div className="flex items-center gap-2">
              <input
                type={passwordVisible ? "text" : "password"}
                value={password}
                onChange={(e) => onPasswordChange(e.target.value)}
                readOnly={isEdit}
                className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-600 font-mono"
              />
              <button
                type="button"
                onClick={() => setPasswordVisible(!passwordVisible)}
                className="rounded-xl border border-slate-200 p-3 hover:bg-slate-50"
                title={passwordVisible ? "Hide password" : "Show password"}
              >
                {passwordVisible ? (
                  <EyeOff size={18} className="text-slate-500" />
                ) : (
                  <Eye size={18} className="text-slate-500" />
                )}
              </button>
              <button
                type="button"
                onClick={() => handleCopy(password, "password")}
                className="rounded-xl border border-slate-200 p-3 hover:bg-slate-50"
              >
                {copiedField === "password" ? (
                  <Check size={18} className="text-teal-600" />
                ) : (
                  <Copy size={18} className="text-slate-500" />
                )}
              </button>
              <button
                type="button"
                onClick={onRegeneratePassword}
                className="rounded-xl border border-slate-200 p-3 hover:bg-slate-50"
                title="Regenerate Password"
              >
                <RefreshCw size={18} className="text-slate-500" />
              </button>
            </div>
            <p className="mt-2 text-xs text-slate-500">
              School Admin can change password after first login.
            </p>
          </div>
        </div>
      )}

      <div>
        <label className="mb-2 block text-sm font-semibold text-slate-700">
          Enabled Modules <span className="text-red-500">*</span>
        </label>
        <MultiSelect
          options={MODULE_OPTIONS.map((m) => m.name)}
          selected={selectedModules.map(
            (code) => MODULE_OPTIONS.find((m) => m.code === code)?.name || code,
          )}
          onChange={(names) => {
            const newCodes = names
              .map(
                (name) => MODULE_OPTIONS.find((m) => m.name === name)?.code,
              )
              .filter((code): code is string => !!code);
            const baseModules = MODULE_OPTIONS.filter((m) => m.isBase).map(
              (m) => m.code,
            );
            const merged = [...new Set([...newCodes, ...baseModules])];
            onModulesChange(merged);
          }}
          placeholder="Choose modules for this school"
        />
        <p className="mt-2 text-xs text-slate-500">
          Student Registration and Examination are required and included in
          the base package.
        </p>
      </div>
    </div>
  );
}
