import { useState, useEffect } from "react";
import { RefreshCw, Copy, Check } from "lucide-react";
import { useToast } from "@/modules/admin/students/components/Toast";
import SchoolFormFields, {
  MODULE_OPTIONS,
} from "@/components/SchoolFormFields";
import type { DemoRequest } from "@/types";
import type { CreateDemoAccountPayload } from "@/types/DemoSchool";

interface Props {
  demoRequest?: DemoRequest | null;
  onSuccess: (payload: CreateDemoAccountPayload) => void;
  onCancel: () => void;
}

const DURATIONS = [
  { label: "7 Days", value: 7 },
  { label: "15 Days", value: 15 },
  { label: "30 Days", value: 30 },
  { label: "60 Days", value: 60 },
  { label: "90 Days", value: 90 },
];

function generatePassword() {
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
}

export default function CreateDemoAccountForm({
  demoRequest,
  onSuccess,
  onCancel,
}: Props) {
  const { showToast } = useToast();
  const isFromRequest = !!demoRequest;
  const [schoolName, setSchoolName] = useState(demoRequest?.schoolName || "");
  const [address, setAddress] = useState(demoRequest?.address || "");
  const [email, setEmail] = useState(demoRequest?.email || "");
  const [phone, setPhone] = useState(demoRequest?.phone || "");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState(generatePassword());
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [startDate, setStartDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [duration, setDuration] = useState(30);
  const [remarks, setRemarks] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    if (email) {
      const prefix = email.split("@")[0];
      setUsername(prefix);
    }
  }, [email]);

  const expiryDate = (() => {
    if (!startDate) return "";
    const expiry = new Date(startDate);
    expiry.setDate(expiry.getDate() + duration);
    return expiry.toISOString().split("T")[0];
  })();

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopied(field);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleRegenerate = () => {
    setPassword(generatePassword());
  };

  const handleSubmit = async () => {
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
    if (!phone.trim()) {
      showToast("Phone Number is required", "error");
      return;
    }
    if (!username.trim()) {
      showToast("Username is required", "error");
      return;
    }
    if (!password.trim()) {
      showToast("Password is required", "error");
      return;
    }
    if (selectedModules.length === 0) {
      showToast("Please select at least one module", "error");
      return;
    }
    if (!startDate) {
      showToast("Start date is required", "error");
      return;
    }
    if (!expiryDate) {
      showToast("Expiry date is required", "error");
      return;
    }

    setSubmitting(true);
    try {
      await onSuccess({
        demoRequestId: demoRequest?.id,
        username: username.trim(),
        password,
        enabledModules: selectedModules,
        startDate,
        expiryDate,
        remarks: remarks.trim() || undefined,
      });
    } catch {
      // error handled in parent
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-800">
            {isFromRequest ? "Create Demo Account" : "Create Demo Account"}
          </h3>
          <p className="text-sm text-slate-500">
            {isFromRequest ? `${demoRequest.schoolName} — ${demoRequest.email}` : "Manual demo account creation"}
          </p>
        </div>
        <button type="button" onClick={onCancel} className="rounded-lg p-1 hover:bg-slate-100">
          <span className="text-sm text-slate-500">Back to List</span>
        </button>
      </div> */}

      <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-8 py-6">
          <h2 className="text-2xl font-semibold text-slate-800">
            School Information
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Enter the school's basic information and enable required modules.
          </p>
        </div>
        <div className="p-8">
          <SchoolFormFields
            schoolName={schoolName}
            address={address}
            email={email}
            phone={phone}
            username={username}
            password={password}
            selectedModules={selectedModules}
            onSchoolNameChange={setSchoolName}
            onAddressChange={setAddress}
            onEmailChange={setEmail}
            onPhoneChange={setPhone}
            onUsernameChange={setUsername}
            onPasswordChange={setPassword}
            onModulesChange={setSelectedModules}
            hideCredentials={false}
          />
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-8 py-6">
          <h2 className="text-2xl font-semibold text-slate-800">
            Demo Settings
          </h2>
        </div>
        <div className="p-8 space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-[#234A91]"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Demo Duration
              </label>
              <select
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-[#234A91]"
              >
                {DURATIONS.map((d) => (
                  <option key={d.value} value={d.value}>
                    {d.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm text-slate-600">
              Expiry Date:{" "}
              <span className="font-medium">
                {expiryDate || "Select start date and duration"}
              </span>
            </p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Remarks
            </label>
            <textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              rows={2}
              placeholder="Optional notes..."
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#234A91]"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="rounded-xl bg-[#234A91] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#1a3a7a] disabled:opacity-50"
        >
          {submitting ? "Creating..." : "Create Demo Account"}
        </button>
      </div>
    </div>
  );
}
