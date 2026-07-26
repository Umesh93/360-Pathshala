import { useEffect, useMemo, useState } from "react";
import { Copy, Check, RefreshCw } from "lucide-react";
import MultiSelect from "./MultiSelect";
import { useToast } from "../modules/admin/students/components/Toast";
import { createSchool, updateSchool } from "../services/schoolService";
import type { ModuleOption } from "../types/School";
import type { CreateSchoolResponse } from "../services/schoolService";
import { QRCodeSVG } from "qrcode.react";
import api from "../config/axios";
import type { School } from "../types/School";

const MODULE_OPTIONS: ModuleOption[] = [
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

const generatePassword = () => {
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

interface AddSchoolFormProps {
  onSuccess?: () => void;
  editSchool?: School | null;
}

export default function AddSchoolForm({
  onSuccess,
  editSchool,
}: AddSchoolFormProps) {
  const { showToast } = useToast();
  const isEdit = !!editSchool;
  const [schoolName, setSchoolName] = useState(editSchool?.schoolName || "");
  const [address, setAddress] = useState(editSchool?.address || "");
  const [email, setEmail] = useState(editSchool?.email || "");
  const [phoneNumber, setPhoneNumber] = useState(editSchool?.phoneNumber || "");
  const [status, setStatus] = useState(editSchool?.status || "DEMO");
  const [selectedModules, setSelectedModules] = useState<string[]>(
    editSchool?.modules && editSchool.modules.length > 0
      ? editSchool.modules
      : ["STUDENT_MANAGEMENT", "EXAMINATION"],
  );
  const [username, setUsername] = useState(editSchool?.adminUsername || "");
  const [password, setPassword] = useState(generatePassword());
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<CreateSchoolResponse | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    if (email) {
      const prefix = email.split("@")[0];
      setUsername(prefix);
    }
  }, [email]);

  const modulePricing = useMemo(() => {
    const hasBase =
      selectedModules.includes("STUDENT_MANAGEMENT") &&
      selectedModules.includes("EXAMINATION");
    const base = hasBase ? 5000 : 0;
    const additionalCount = selectedModules.filter(
      (code) => code !== "STUDENT_MANAGEMENT" && code !== "EXAMINATION",
    ).length;
    const additional = additionalCount * 3000;
    const total = base + additional;
    return { base, additional, additionalCount, total };
  }, [selectedModules]);

  const qrValue = useMemo(() => {
    return JSON.stringify({
      schoolName,
      totalAmount: modulePricing.total,
      referenceNumber: `REF-${Date.now()}`,
    });
  }, [schoolName, modulePricing.total]);

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleRegeneratePassword = () => {
    setPassword(generatePassword());
  };

  const handleSubmit = async () => {
    console.log("handleSubmit called", {
      schoolName,
      address,
      email,
      phoneNumber,
      status,
      selectedModules,
    });
    if (!schoolName.trim()) {
      showToast("School Name is required", "error");
      return;
    }
    if (!address.trim()) {
      showToast("Address is required", "error");
      return;
    }
    if (!email.trim()) {
      showToast("Email is required", "error");
      return;
    }
    if (!phoneNumber.trim()) {
      showToast("Phone Number is required", "error");
      return;
    }
    if (selectedModules.length === 0) {
      showToast("Please select at least one module", "error");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: schoolName,
        address,
        email,
        phone: phoneNumber,
        modules: selectedModules,
        status,
      };
      console.log("Submitting payload:", payload);

      let response;
      if (isEdit && editSchool) {
        response = await updateSchool(editSchool.id, payload);
        showToast("School updated successfully!", "success");
      } else {
        response = await createSchool(payload);
        setSuccess(response);
        showToast("School Registered Successfully", "success");
      }
      console.log("Save school response:", response);
      onSuccess?.();
    } catch (error: any) {
      console.error("Save school error:", error);
      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to save school";
      showToast(message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handlePing = async () => {
    try {
      const response = await api.get("/saas/ping");
      showToast("Backend reachable: " + response.data.status, "success");
    } catch (error: any) {
      showToast(
        "Backend not reachable: " + (error.message || "unknown error"),
        "error",
      );
    }
  };

  const handleCancel = () => {
    setSchoolName("");
    setAddress("");
    setEmail("");
    setPhoneNumber("");
    setStatus("DEMO");
    setSelectedModules(["STUDENT_MANAGEMENT", "EXAMINATION"]);
    setPassword(generatePassword());
    setSuccess(null);
    onSuccess?.();
  };

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-8 py-6">
          <h2 className="text-2xl font-semibold text-slate-800">
            {isEdit ? "Edit School" : "School Information"}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {isEdit
              ? "Update school details and modules."
              : "Enter the school's basic information and enable required modules."}
          </p>
        </div>

        <div className="space-y-8 p-8">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-4">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                School Name <span className="text-red-500">*</span>
              </label>
              <input
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
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
                onChange={(e) => setAddress(e.target.value)}
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
                onChange={(e) => setEmail(e.target.value)}
                placeholder="school@gmail.com"
                className="h-12 w-full rounded-xl border border-slate-300 px-4 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="98XXXXXXXX"
                className="h-12 w-full rounded-xl border border-slate-300 px-4 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                School Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="h-12 w-full rounded-xl border border-slate-300 px-4 text-sm outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
              >
                <option value="DEMO">Demo</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Username
              </label>
              <div className="flex items-center gap-2">
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  readOnly
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
                  value={password}
                  readOnly
                  className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-600 font-mono"
                />
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
                  onClick={handleRegeneratePassword}
                  className="rounded-xl border border-slate-200 p-3 hover:bg-slate-50"
                  title="Generate Again"
                >
                  <RefreshCw size={18} className="text-slate-500" />
                </button>
              </div>
              <p className="mt-2 text-xs text-slate-500">
                School Admin can change password after first login.
              </p>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Enabled Modules <span className="text-red-500">*</span>
            </label>
            <MultiSelect
              options={MODULE_OPTIONS.map((m) => m.name)}
              selected={selectedModules.map(
                (code) =>
                  MODULE_OPTIONS.find((m) => m.code === code)?.name || code,
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
                setSelectedModules(merged);
              }}
              placeholder="Choose modules for this school"
            />
            <p className="mt-2 text-xs text-slate-500">
              Student Registration and Examination are required and included in
              the base package.
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-8 py-6">
          <h2 className="text-2xl font-semibold text-slate-800">
            Payment Summary
          </h2>
        </div>
        <div className="p-8">
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">Base Package</span>
              <span className="font-medium text-slate-800">
                NPR {modulePricing.base.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">Additional Modules</span>
              <span className="font-medium text-slate-800">
                NPR {modulePricing.additional.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">Additional Module Count</span>
              <span className="font-medium text-slate-800">
                {modulePricing.additionalCount}
              </span>
            </div>
            <div className="border-t border-slate-200 pt-3 flex items-center justify-between">
              <span className="text-base font-semibold text-slate-800">
                Total Amount
              </span>
              <span className="text-xl font-bold text-teal-600">
                NPR {modulePricing.total.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {status !== "DEMO" && (
        <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-8 py-6">
            <h2 className="text-2xl font-semibold text-slate-800">
              QR Code Payment
            </h2>
          </div>
          <div className="p-8">
            <div className="flex flex-col items-center gap-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <QRCodeSVG value={qrValue} size={180} />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-slate-700">
                  Payment Amount
                </p>
                <p className="text-2xl font-bold text-teal-600">
                  NPR {modulePricing.total.toLocaleString()}
                </p>
              </div>
              <p className="text-xs text-slate-500 text-center max-w-md">
                Scan QR to pay subscription fee.
              </p>
            </div>
          </div>
        </div>
      )}

      {status === "DEMO" && (
        <div className="rounded-3xl border border-green-200 bg-green-50 p-6">
          <h3 className="text-lg font-semibold text-green-800 mb-2">
            1-Month Free Demo
          </h3>
          <p className="text-sm text-green-700">
            No payment is required for the demo period. You will receive a
            billing email with a QR code after 30 days.
          </p>
        </div>
      )}

      {success && (
        <div className="rounded-3xl border border-green-200 bg-green-50 p-6">
          <h3 className="text-lg font-semibold text-green-800 mb-4">
            School Registered Successfully
          </h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-green-700">
                School Code
              </label>
              <div className="flex items-center gap-2">
                <input
                  value={success.schoolCode}
                  readOnly
                  className="h-10 flex-1 rounded-lg border border-green-200 bg-white px-3 text-sm text-green-800"
                />
                <button
                  type="button"
                  onClick={() => handleCopy(success.schoolCode, "schoolCode")}
                  className="rounded-lg border border-green-200 p-2 hover:bg-green-100"
                >
                  {copiedField === "schoolCode" ? (
                    <Check size={16} className="text-green-700" />
                  ) : (
                    <Copy size={16} className="text-green-700" />
                  )}
                </button>
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-green-700">
                Username
              </label>
              <div className="flex items-center gap-2">
                <input
                  value={success.adminUsername}
                  readOnly
                  className="h-10 flex-1 rounded-lg border border-green-200 bg-white px-3 text-sm text-green-800"
                />
                <button
                  type="button"
                  onClick={() =>
                    handleCopy(success.adminUsername, "adminUsername")
                  }
                  className="rounded-lg border border-green-200 p-2 hover:bg-green-100"
                >
                  {copiedField === "adminUsername" ? (
                    <Check size={16} className="text-green-700" />
                  ) : (
                    <Copy size={16} className="text-green-700" />
                  )}
                </button>
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-green-700">
                Temporary Password
              </label>
              <div className="flex items-center gap-2">
                <input
                  value={success.adminPassword}
                  readOnly
                  className="h-10 flex-1 rounded-lg border border-green-200 bg-white px-3 text-sm text-green-800 font-mono"
                />
                <button
                  type="button"
                  onClick={() =>
                    handleCopy(success.adminPassword, "adminPassword")
                  }
                  className="rounded-lg border border-green-200 p-2 hover:bg-green-100"
                >
                  {copiedField === "adminPassword" ? (
                    <Check size={16} className="text-green-700" />
                  ) : (
                    <Copy size={16} className="text-green-700" />
                  )}
                </button>
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-green-700">
                Total Amount
              </label>
              <div className="flex items-center gap-2">
                <input
                  value={"NPR " + success.totalAmount.toLocaleString()}
                  readOnly
                  className="h-10 flex-1 rounded-lg border border-green-200 bg-white px-3 text-sm text-green-800"
                />
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="mb-1 block text-xs font-medium text-green-700">
                Payment Reference
              </label>
              <div className="flex items-center gap-2">
                <input
                  value={success.paymentReference}
                  readOnly
                  className="h-10 flex-1 rounded-lg border border-green-200 bg-white px-3 text-sm text-green-800"
                />
                <button
                  type="button"
                  onClick={() =>
                    handleCopy(success.paymentReference, "paymentReference")
                  }
                  className="rounded-lg border border-green-200 p-2 hover:bg-green-100"
                >
                  {copiedField === "paymentReference" ? (
                    <Check size={16} className="text-green-700" />
                  ) : (
                    <Copy size={16} className="text-green-700" />
                  )}
                </button>
              </div>
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <button
              onClick={() => onSuccess?.()}
              className="rounded-xl bg-green-600 px-6 py-2.5 font-medium text-white transition hover:bg-green-700"
            >
              Back to Schools List
            </button>
          </div>
        </div>
      )}

      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={handlePing}
          className="rounded-xl border border-slate-300 px-6 py-3 font-medium text-slate-700 transition hover:bg-slate-50"
        >
          Test Backend
        </button>

        <button
          type="button"
          onClick={handleCancel}
          disabled={submitting}
          className="rounded-xl border border-slate-300 px-6 py-3 font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
        >
          Cancel
        </button>

        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="rounded-xl bg-teal-600 px-8 py-3 font-medium text-white transition hover:bg-teal-700 disabled:opacity-50 flex items-center gap-2"
        >
          {submitting && (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          )}
          {submitting
            ? isEdit
              ? "Updating..."
              : "Saving..."
            : isEdit
              ? "Update School"
              : "Save School"}
        </button>
      </div>
    </div>
  );
}
