import { useEffect, useEffectEvent, useMemo, useRef, useState } from "react";
import { Copy, Check, RefreshCw, Eye, EyeOff } from "lucide-react";
import type { ModuleOption } from "../types/School";
import { getModules } from "../services/schoolService";

// eslint-disable-next-line react-refresh/only-export-components
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
  contactPerson?: string;
  designation?: string;
  username: string;
  password: string;
  selectedModules: string[];
  onSchoolNameChange: (value: string) => void;
  onAddressChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onPhoneChange: (value: string) => void;
  onContactPersonChange?: (value: string) => void;
  onDesignationChange?: (value: string) => void;
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
  contactPerson,
  designation,
  username,
  password,
  selectedModules,
  onSchoolNameChange,
  onAddressChange,
  onEmailChange,
  onPhoneChange,
  onContactPersonChange,
  onDesignationChange,
  onUsernameChange,
  onPasswordChange,
  onModulesChange,
  onRegeneratePassword,
  hideCredentials = false,
  isEdit = false,
}: SchoolFormFieldsProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [modules, setModules] = useState<ModuleOption[]>([]);
  const [moduleSearch, setModuleSearch] = useState("");
  const [modulesOpen, setModulesOpen] = useState(false);
  const [modulesLoading, setModulesLoading] = useState(true);
  const [modulesError, setModulesError] = useState("");
  const moduleRef = useRef<HTMLDivElement>(null);
  const applyCatalogue = useEffectEvent((items: ModuleOption[]) => {
    const activeItems = items.filter((item) => item.active);
    setModules(activeItems);
    const required = activeItems
      .filter((item) => item.required)
      .map((item) => item.code);
    const availableSelected = selectedModules.filter((code) =>
      activeItems.some(
        (item) => item.code === code && item.selectable && !item.comingSoon,
      ),
    );
    onModulesChange([...new Set([...required, ...availableSelected])]);
  });

  useEffect(() => {
    getModules()
      .then(applyCatalogue)
      .catch(() => setModulesError("Unable to load available modules."))
      .finally(() => setModulesLoading(false));
  }, []);
  useEffect(() => {
    const close = (event: MouseEvent) => {
      if (!moduleRef.current?.contains(event.target as Node))
        setModulesOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const requiredModules = useMemo(
    () => modules.filter((item) => item.required).map((item) => item.code),
    [modules],
  );
  const selectable = modules.filter(
    (item) => item.selectable && !item.comingSoon,
  );
  const visible = modules.filter((item) =>
    `${item.name} ${item.description || ""}`
      .toLowerCase()
      .includes(moduleSearch.toLowerCase()),
  );
  const updateModules = (code: string) => {
    if (!selectable.some((item) => item.code === code)) return;
    const next = selectedModules.includes(code)
      ? selectedModules.filter(
          (item) => item !== code && !requiredModules.includes(item),
        )
      : [...selectedModules, code];
    onModulesChange([...new Set([...requiredModules, ...next])]);
  };

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
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="order-1">
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
        <div className="order-5">
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Contact Person <span className="text-red-500">*</span>
          </label>
          <input
            value={contactPerson || ""}
            onChange={(e) => onContactPersonChange?.(e.target.value)}
            placeholder="Ram Sharma"
            className="h-12 w-full rounded-xl border border-slate-300 px-4 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
          />
        </div>
        <div className="order-6">
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Designation <span className="text-red-500">*</span>
          </label>
          <input
            value={designation || ""}
            onChange={(e) => onDesignationChange?.(e.target.value)}
            placeholder="Principal"
            className="h-12 w-full rounded-xl border border-slate-300 px-4 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
          />
        </div>

        <div className="order-2">
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

        <div className="order-3">
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

        <div className="order-4">
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
        <div ref={moduleRef} className="relative">
          <button
            type="button"
            onClick={() => setModulesOpen((open) => !open)}
            className="min-h-14 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-left"
          >
            <span className="flex flex-wrap gap-2 pr-6">
              {selectedModules.length ? (
                selectedModules.map((code) => (
                  <span
                    key={code}
                    className="rounded-full bg-teal-50 px-2 py-1 text-xs font-medium text-teal-700"
                  >
                    {modules.find((item) => item.code === code)?.name || code}
                  </span>
                ))
              ) : (
                <span className="text-slate-400">
                  Choose modules for this school
                </span>
              )}
            </span>
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
              ⌄
            </span>
          </button>
          {modulesOpen && (
            <div className="absolute left-0 right-0 z-50 mt-2 max-h-[420px] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
              <div className="border-b bg-slate-50 p-3">
                <input
                  autoFocus
                  value={moduleSearch}
                  onChange={(event) => setModuleSearch(event.target.value)}
                  placeholder="Search modules..."
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-500"
                />
              </div>
              <div className="max-h-[330px] overflow-y-auto p-3">
                {modulesLoading && (
                  <p className="p-3 text-sm text-slate-500">
                    Loading modules...
                  </p>
                )}
                {modulesError && (
                  <p className="p-3 text-sm text-red-600">{modulesError}</p>
                )}
                {(["REQUIRED", "INCLUDED", "PAID"] as const).map(
                  (billingType) => {
                    const group = visible.filter(
                      (item) => item.billingType === billingType,
                    );
                    if (!group.length) return null;
                    return (
                      <section key={billingType} className="mb-4 last:mb-0">
                        <h3 className="mb-2 px-1 text-xs font-bold uppercase tracking-wide text-slate-500">
                          {billingType === "REQUIRED"
                            ? "Required"
                            : billingType === "INCLUDED"
                              ? "Included"
                              : "Paid Add-ons"}
                        </h3>
                        {group.map((item) => {
                          const checked = selectedModules.includes(item.code);
                          const disabled =
                            item.billingType === "REQUIRED" || !item.selectable;
                          return (
                            <button
                              key={item.code}
                              type="button"
                              disabled={disabled}
                              onClick={() => updateModules(item.code)}
                              className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left ${disabled ? "cursor-not-allowed opacity-55" : "hover:bg-slate-50"}`}
                            >
                              <span>
                                <span className="block text-sm font-medium text-slate-700">
                                  {item.name}
                                </span>
                                <span className="text-[11px] font-semibold text-slate-500">
                                  {item.billingType === "REQUIRED"
                                    ? "Required"
                                    : item.billingType === "INCLUDED"
                                      ? "Included"
                                      : `NPR ${item.annualPrice.toLocaleString()} / ${item.billingPeriod}`}
                                </span>
                              </span>
                              <span
                                className={`flex h-5 w-5 items-center justify-center rounded border ${checked ? "border-teal-600 bg-teal-600 text-white" : "border-slate-300"}`}
                              >
                                {checked ? "✓" : ""}
                              </span>
                            </button>
                          );
                        })}
                      </section>
                    );
                  },
                )}
                {!modulesLoading && !modulesError && !visible.length && (
                  <p className="p-3 text-sm text-slate-500">
                    No modules found.
                  </p>
                )}
              </div>
              <div className="flex items-center justify-between border-t bg-slate-50 px-3 py-2 text-xs text-slate-500">
                <span>{selectedModules.length} selected</span>
                <button
                  type="button"
                  onClick={() => onModulesChange(requiredModules)}
                  className="font-semibold text-teal-700"
                >
                  Clear optional
                </button>
              </div>
            </div>
          )}
        </div>
        <p className="mt-2 text-xs text-slate-500">
          Required modules stay enabled. Included modules and paid add-ons can
          be configured for the school.
        </p>
      </div>
    </div>
  );
}
