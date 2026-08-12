import { useCallback, useEffect, useState, type ReactNode } from "react";
import { Copy, Eye, Mail, RefreshCw, X } from "lucide-react";
import SuperAdminLayout from "@/layouts/SuperAdminLayout";
import { useToast } from "@/modules/admin/students/components/Toast";
import {
  acceptDemoRequest,
  getDemoUsername,
  getAdminDemoRequests,
  loadDemoRequestLogoUrl,
  moduleLabel,
  parseModuleCodes,
  rejectDemoRequest,
  resendDemoCredentials,
} from "@/services/demoRequestService";
import {
  convertToPaid,
  extendDemo,
  getDemoAccounts,
  resetDemoPassword,
} from "@/services/demoAccountService";
import { loadSchoolLogoUrl } from "@/services/schoolService";
import type { AcceptDemoResponse, DemoRequest } from "@/types/DemoRequest";
import type {
  ConvertToPaidResult,
  DemoSchool,
  DemoStatus,
} from "@/types/DemoSchool";
import ConvertToPaidModal from "./ConvertToPaidModal";

type Tab = "requests" | "accounts";

const errorMessage = (error: unknown, fallback: string): string => {
  const data = (
    error as {
      response?: {
        data?: {
          message?: string;
          errors?: Record<string, string>;
          fieldErrors?: Record<string, string>;
        };
      };
    }
  ).response?.data;
  const fields = data?.errors ?? data?.fieldErrors;
  return fields && Object.keys(fields).length
    ? Object.entries(fields)
        .map(([field, message]) => `${field}: ${message}`)
        .join("; ")
    : (data?.message ?? (error instanceof Error ? error.message : fallback));
};

const formatDate = (value?: string | null) =>
  value ? new Date(value).toLocaleDateString() : "-";

const effectiveStatus = (account: DemoSchool): DemoStatus =>
  account.status === "ACTIVE" &&
  new Date(`${account.expiryDate}T23:59:59`) < new Date()
    ? "EXPIRED"
    : account.status;

function ProtectedLogo({
  requestId,
  schoolId,
  alt,
}: {
  requestId?: number;
  schoolId?: number;
  alt: string;
}) {
  const [url, setUrl] = useState<string>();
  useEffect(() => {
    let active = true;
    let objectUrl: string | undefined;
    if (!requestId && !schoolId) return;
    const loading = requestId
      ? loadDemoRequestLogoUrl(requestId)
      : loadSchoolLogoUrl(schoolId!);
    loading
      .then((loaded) => {
        objectUrl = loaded;
        if (active) setUrl(loaded);
        else URL.revokeObjectURL(loaded);
      })
      .catch(() => undefined);
    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [requestId, schoolId]);
  return url ? (
    <img
      src={url}
      alt={alt}
      className="h-10 w-10 shrink-0 rounded-lg border border-slate-200 bg-white object-contain"
    />
  ) : (
    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-sm font-semibold text-slate-500">
      {alt.charAt(0).toUpperCase()}
    </span>
  );
}

function Modal({
  title,
  onClose,
  children,
  width = "max-w-2xl",
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
  width?: string;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 bg-slate-950/45"
        onClick={onClose}
      />
      <div
        className={`relative max-h-[90vh] w-full ${width} overflow-y-auto rounded-xl bg-white shadow-2xl`}
      >
        <header className="sticky top-0 flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4">
          <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            title="Close"
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
          >
            <X size={18} />
          </button>
        </header>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

function ModuleChips({
  value,
  limit,
}: {
  value?: string | string[] | null;
  limit?: number;
}) {
  const modules = Array.isArray(value) ? value : parseModuleCodes(value);
  const visible = limit ? modules.slice(0, limit) : modules;
  return (
    <div className="flex flex-wrap gap-1.5">
      {visible.map((code) => (
        <span
          key={code}
          className="rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700"
        >
          {moduleLabel(code)}
        </span>
      ))}
      {limit && modules.length > limit && (
        <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
          +{modules.length - limit}
        </span>
      )}
      {!modules.length && <span className="text-sm text-slate-400">-</span>}
    </div>
  );
}

function Detail({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase text-slate-500">{label}</dt>
      <dd className="mt-1 break-words text-sm text-slate-800">
        {children || "-"}
      </dd>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const style =
    status === "ACCEPTED" || status === "ACTIVE"
      ? "bg-green-50 text-green-700"
      : status === "REJECTED" || status === "EXPIRED" || status === "FAILED"
        ? "bg-red-50 text-red-700"
        : status === "CONVERTED"
          ? "bg-purple-50 text-purple-700"
          : status === "EXTENDED" || status === "SENT"
            ? "bg-blue-50 text-blue-700"
            : "bg-amber-50 text-amber-700";
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${style}`}
    >
      {status}
    </span>
  );
}

function RequestDetailModal({
  request,
  account,
  onClose,
  onResend,
}: {
  request: DemoRequest;
  account?: DemoSchool;
  onClose: () => void;
  onResend: () => void;
}) {
  return (
    <Modal title={`Request ${request.requestCode}`} onClose={onClose}>
      <div className="mb-5 flex items-center gap-4">
        <ProtectedLogo
          requestId={request.logoUrl ? request.id : undefined}
          alt={request.schoolName}
        />
        <div>
          <h3 className="font-semibold text-slate-900">{request.schoolName}</h3>
          <StatusBadge status={request.status} />
        </div>
      </div>
      <dl className="grid gap-5 sm:grid-cols-2">
        <Detail label="Contact Person">{request.contactPerson}</Detail>
        <Detail label="Designation">{request.designation}</Detail>
        <Detail label="Email">{request.email}</Detail>
        <Detail label="Phone">{request.phone}</Detail>
        <Detail label="Address">{request.address}</Detail>
        <Detail label="Submitted">{formatDate(request.createdAt)}</Detail>
        <Detail label="Accepted">{formatDate(request.acceptedAt)}</Detail>
        <Detail label="Email Status">
          {request.emailStatus ? (
            <StatusBadge status={request.emailStatus} />
          ) : (
            "Not sent"
          )}
        </Detail>
        <Detail label="Account">
          {account
            ? `${account.demoCode} / ${account.username}`
            : request.demoSchoolId
              ? `Demo #${request.demoSchoolId}`
              : "Not provisioned"}
        </Detail>
        <div className="sm:col-span-2">
          <Detail label="Modules">
            <ModuleChips value={request.interestedModules} />
          </Detail>
        </div>
        <div className="sm:col-span-2"></div>
        {request.emailError && (
          <div className="sm:col-span-2">
            <Detail label="Email Error">
              <span className="text-red-700">{request.emailError}</span>
            </Detail>
          </div>
        )}
        {request.provisionedSchoolId && (
          <Detail label="School ID">{request.provisionedSchoolId}</Detail>
        )}
        {request.demoSchoolId && (
          <Detail label="Demo ID">{request.demoSchoolId}</Detail>
        )}
      </dl>
      {request.status === "ACCEPTED" && (
        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={onResend}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-50"
          >
            <Mail size={16} /> Resend credentials
          </button>
        </div>
      )}
    </Modal>
  );
}

function AccountDetailModal({
  account,
  onClose,
}: {
  account: DemoSchool;
  onClose: () => void;
}) {
  return (
    <Modal title={`Demo account ${account.demoCode}`} onClose={onClose}>
      <div className="mb-5 flex items-center gap-4">
        <ProtectedLogo
          schoolId={account.schoolId || undefined}
          alt={account.schoolName}
        />
        <div>
          <h3 className="font-semibold">{account.schoolName}</h3>
          <StatusBadge status={effectiveStatus(account)} />
        </div>
      </div>
      <dl className="grid gap-5 sm:grid-cols-2">
        <Detail label="School ID">{account.schoolId}</Detail>
        <Detail label="Request ID">{account.demoRequestId || "-"}</Detail>
        <Detail label="Email">{account.email}</Detail>
        <Detail label="Phone">{account.phone}</Detail>
        <Detail label="Username">{account.username}</Detail>
        <Detail label="Remaining Days">
          {Math.max(0, Number(account.remainingDays))}
        </Detail>
        <Detail label="Starts On">{formatDate(account.startDate)}</Detail>
        <Detail label="Expires On">{formatDate(account.expiryDate)}</Detail>
        <Detail label="Created">{formatDate(account.createdAt)}</Detail>
        <Detail label="Remarks">{account.remarks || "-"}</Detail>
        <div className="sm:col-span-2">
          <Detail label="Enabled Modules">
            <ModuleChips value={account.enabledModules} />
          </Detail>
        </div>
      </dl>
    </Modal>
  );
}

function AcceptResultModal({
  result,
  onClose,
  onCopy,
}: {
  result: AcceptDemoResponse;
  onClose: () => void;
  onCopy: (text: string) => void;
}) {
  const sent = result.emailStatus === "SENT";
  return (
    <Modal
      title={
        result.accountCreated
          ? "Demo account created"
          : "Credential delivery result"
      }
      onClose={onClose}
      width="max-w-lg"
    >
      <div
        className={`rounded-lg border p-4 ${sent ? "border-green-200 bg-green-50" : "border-amber-200 bg-amber-50"}`}
      >
        <div className="flex items-center justify-between gap-3">
          <strong className={sent ? "text-green-800" : "text-amber-900"}>
            {sent
              ? "Credentials sent"
              : result.emailStatus === "DISABLED"
                ? "Email delivery disabled"
                : result.emailStatus === "MISCONFIGURED"
                  ? "Email configuration incomplete"
                  : "Email delivery failed"}
          </strong>
          <StatusBadge status={result.emailStatus} />
        </div>
        <p className="mt-2 text-sm text-slate-700">{result.message}</p>
      </div>
      <dl className="mt-5 grid gap-4 sm:grid-cols-2">
        <Detail label="School">{result.schoolName}</Detail>
        <Detail label="School Code">{result.schoolCode}</Detail>
        <Detail label="Email">{result.email}</Detail>
        <Detail label="Phone">{result.phone}</Detail>
        <Detail label="Username">{result.username}</Detail>
        <Detail label="Period">
          {formatDate(result.startsOn)} - {formatDate(result.expiresOn)}
        </Detail>
        <Detail label="Remaining Days">{result.remainingDays}</Detail>
        <Detail label="Status">{result.status}</Detail>
        <div className="sm:col-span-2">
          <Detail label="Modules">
            <ModuleChips value={result.modules} />
          </Detail>
        </div>
      </dl>
      {result.password && (
        <div className="mt-5 rounded-lg border border-amber-300 bg-amber-50 p-4">
          <p className="text-xs font-semibold uppercase text-amber-800">
            One-time password
          </p>
          <div className="mt-2 flex items-center justify-between gap-3">
            <code className="break-all text-sm text-slate-900">
              {result.password}
            </code>
            <button
              type="button"
              title="Copy password"
              onClick={() => onCopy(result.password!)}
              className="shrink-0 rounded-lg border border-amber-300 p-2 text-amber-900 hover:bg-amber-100"
            >
              <Copy size={16} />
            </button>
          </div>
          <p className="mt-2 text-xs text-amber-800">
            Store this securely. It will not be available after this dialog
            closes.
          </p>
        </div>
      )}
    </Modal>
  );
}

function AcceptDemoModal({
  request,
  onClose,
  onAccept,
}: {
  request: DemoRequest;
  onClose: () => void;
  onAccept: (username: string) => Promise<void>;
}) {
  const [username, setUsername] = useState("");
  const [available, setAvailable] = useState<boolean>();
  const [checking, setChecking] = useState(true);
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    getDemoUsername(request.id)
      .then((value) => {
        setUsername(value.username);
        setAvailable(value.available);
      })
      .finally(() => setChecking(false));
  }, [request.id]);
  const check = async (value: string) => {
    setUsername(value);
    if (!value.trim()) {
      setAvailable(false);
      return;
    }
    setChecking(true);
    try {
      setAvailable((await getDemoUsername(request.id, value.trim())).available);
    } finally {
      setChecking(false);
    }
  };
  return (
    <Modal title="Create demo account" onClose={onClose} width="max-w-lg">
      <p className="text-sm text-slate-600">
        Confirm the username for {request.schoolName}. The password will be
        generated securely when the account is created.
      </p>
      <label className="mt-5 block text-sm font-semibold text-slate-700">
        Username
        <input
          value={username}
          onChange={(event) => void check(event.target.value)}
          className="mt-2 h-12 w-full rounded-xl border border-slate-300 px-4 outline-none focus:border-blue-600"
        />
      </label>
      <p
        className={`mt-2 text-xs ${available ? "text-green-700" : "text-red-600"}`}
      >
        {checking
          ? "Checking availability..."
          : available
            ? "Username is available."
            : "Username is unavailable."}
      </p>
      <div className="mt-6 flex justify-end gap-3">
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold"
        >
          Cancel
        </button>
        <button
          type="button"
          disabled={!available || checking || saving}
          onClick={async () => {
            setSaving(true);
            try {
              await onAccept(username.trim());
            } finally {
              setSaving(false);
            }
          }}
          className="rounded-lg bg-[#234A91] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          {saving ? "Creating..." : "Create Demo Account"}
        </button>
      </div>
    </Modal>
  );
}

export default function DemoRequests() {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<Tab>("requests");
  const [requests, setRequests] = useState<DemoRequest[]>([]);
  const [accounts, setAccounts] = useState<DemoSchool[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyRequest, setBusyRequest] = useState<number>();
  const [requestFilter, setRequestFilter] = useState("ALL");
  const [accountFilter, setAccountFilter] = useState("ALL");
  const [requestSearch, setRequestSearch] = useState("");
  const [accountSearch, setAccountSearch] = useState("");
  const [viewRequest, setViewRequest] = useState<DemoRequest>();
  const [viewAccount, setViewAccount] = useState<DemoSchool>();
  const [acceptResult, setAcceptResult] = useState<AcceptDemoResponse>();
  const [acceptingRequest, setAcceptingRequest] = useState<DemoRequest>();
  const [convertingAccount, setConvertingAccount] = useState<DemoSchool>();

  const refresh = useCallback(
    async (quiet = false) => {
      if (!quiet) setLoading(true);
      try {
        const [requestData, accountData] = await Promise.all([
          getAdminDemoRequests(),
          getDemoAccounts(),
        ]);
        setRequests(requestData);
        setAccounts(accountData);
      } catch (error) {
        showToast(
          errorMessage(error, "Failed to load demo workflow."),
          "error",
        );
      } finally {
        if (!quiet) setLoading(false);
      }
    },
    [showToast],
  );

  useEffect(() => {
    queueMicrotask(refresh);
  }, [refresh]);

  const handleAccept = async (request: DemoRequest) => {
    setAcceptingRequest(request);
  };

  const confirmAccept = async (request: DemoRequest, username: string) => {
    setBusyRequest(request.id);
    try {
      const result = await acceptDemoRequest(request.id, username.trim());
      setAcceptResult(result);
      setAcceptingRequest(undefined);
      await refresh(true);
    } catch (error) {
      showToast(errorMessage(error, "Failed to accept demo request."), "error");
    } finally {
      setBusyRequest(undefined);
    }
  };

  const handleResend = async (request: DemoRequest) => {
    setBusyRequest(request.id);
    try {
      const result = await resendDemoCredentials(request.id);
      setAcceptResult(result);
      setViewRequest(undefined);
      await refresh(true);
    } catch (error) {
      showToast(errorMessage(error, "Failed to resend credentials."), "error");
    } finally {
      setBusyRequest(undefined);
    }
  };

  const handleReject = async (request: DemoRequest) => {
    if (!confirm(`Reject the demo request from ${request.schoolName}?`)) return;
    setBusyRequest(request.id);
    try {
      await rejectDemoRequest(request.id);
      showToast("Demo request rejected.", "success");
      await refresh(true);
    } catch (error) {
      showToast(errorMessage(error, "Failed to reject demo request."), "error");
    } finally {
      setBusyRequest(undefined);
    }
  };

  const handleExtend = async (account: DemoSchool) => {
    const value = prompt("Enter the number of days to extend:");
    if (value === null) return;
    const days = Number(value);
    if (!Number.isInteger(days) || days <= 0) {
      showToast("Extension days must be a positive whole number.", "error");
      return;
    }
    try {
      await extendDemo(account.id, { days });
      showToast(`Demo extended by ${days} days.`, "success");
      await refresh(true);
    } catch (error) {
      showToast(errorMessage(error, "Failed to extend demo."), "error");
    }
  };

  const copySecret = async (value: string) => {
    try {
      if (!navigator.clipboard?.writeText)
        throw new Error("Clipboard unavailable");
      await navigator.clipboard.writeText(value);
      showToast("Copied to clipboard.", "success");
    } catch {
      showToast(
        "Clipboard access is unavailable. Select and copy the value manually.",
        "error",
      );
    }
  };

  const handleResetPassword = async (account: DemoSchool) => {
    if (!confirm(`Reset the password for ${account.username}?`)) return;
    try {
      const result = await resetDemoPassword(account.id);
      const copied = navigator.clipboard?.writeText
        ? await navigator.clipboard
            .writeText(result.password)
            .then(() => true)
            .catch(() => false)
        : false;
      alert(
        `New password: ${result.password}${copied ? "\nCopied to clipboard." : "\nCopy this password now."}`,
      );
    } catch (error) {
      showToast(errorMessage(error, "Failed to reset password."), "error");
    }
  };

  const handleConvert = async (id: number) => {
    try {
      const result: ConvertToPaidResult = await convertToPaid(id, {});
      setConvertingAccount(undefined);
      showToast(`Converted to paid school ${result.schoolCode}.`, "success");
      await refresh(true);
    } catch (error) {
      showToast(errorMessage(error, "Failed to convert demo."), "error");
      throw error;
    }
  };

  const requestNeedle = requestSearch.trim().toLowerCase();
  const filteredRequests = requests.filter(
    (request) =>
      (requestFilter === "ALL" || request.status === requestFilter) &&
      (!requestNeedle ||
        request.schoolName.toLowerCase().includes(requestNeedle) ||
        request.email.toLowerCase().includes(requestNeedle)),
  );
  const accountNeedle = accountSearch.trim().toLowerCase();
  const filteredAccounts = accounts.filter(
    (account) =>
      (accountFilter === "ALL" || effectiveStatus(account) === accountFilter) &&
      (!accountNeedle ||
        account.schoolName.toLowerCase().includes(accountNeedle) ||
        account.username.toLowerCase().includes(accountNeedle) ||
        account.email.toLowerCase().includes(accountNeedle)),
  );

  return (
    <SuperAdminLayout>
      <div className="space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Demo Requests</h1>
            <p className="text-gray-500">
              Review enquiries and manage provisioned demo schools.
            </p>
          </div>
          <button
            type="button"
            onClick={() => void refresh()}
            title="Refresh"
            className="rounded-lg border border-slate-300 p-2.5 text-slate-600 hover:bg-white"
          >
            <RefreshCw size={18} />
          </button>
        </div>
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <nav className="flex border-b border-slate-200">
            {(["requests", "accounts"] as Tab[]).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`border-b-2 px-6 py-4 text-sm font-medium capitalize ${activeTab === tab ? "border-[#234A91] text-[#234A91]" : "border-transparent text-slate-500"}`}
              >
                Demo {tab}
              </button>
            ))}
          </nav>
          <div className="p-4 sm:p-6">
            {activeTab === "requests" ? (
              <div className="space-y-4">
                <div className="flex flex-col gap-3 sm:flex-row">
                  <input
                    value={requestSearch}
                    onChange={(e) => setRequestSearch(e.target.value)}
                    placeholder="Search school or email"
                    className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm sm:w-80"
                  />
                  <select
                    value={requestFilter}
                    onChange={(e) => setRequestFilter(e.target.value)}
                    className="h-10 rounded-lg border border-slate-300 px-3 text-sm"
                  >
                    <option value="ALL">All statuses</option>
                    <option value="PENDING">Pending</option>
                    <option value="ACCEPTED">Accepted</option>
                    <option value="REJECTED">Rejected</option>
                  </select>
                </div>
                {loading ? (
                  <div className="py-12 text-center text-slate-500">
                    Loading...
                  </div>
                ) : !filteredRequests.length ? (
                  <div className="py-12 text-center text-slate-500">
                    No demo requests found.
                  </div>
                ) : (
                  <div className="w-full overflow-x-auto rounded-lg border border-slate-200">
                    <table className="min-w-[1180px] w-full">
                      <thead className="bg-slate-50 text-left text-xs font-semibold uppercase text-slate-600">
                        <tr>
                          {[
                            "School",
                            "Contact",
                            "Email",
                            "Phone",
                            "Address",
                            "Modules",
                            "Date",
                            "Status",
                            "Actions",
                          ].map((heading) => (
                            <th key={heading} className="px-4 py-3">
                              {heading}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {filteredRequests.map((request) => (
                          <tr
                            key={request.id}
                            className="border-t border-slate-200 align-top hover:bg-slate-50/70"
                          >
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                <ProtectedLogo
                                  requestId={
                                    request.logoUrl ? request.id : undefined
                                  }
                                  alt={request.schoolName}
                                />
                                <div>
                                  <div className="max-w-48 font-medium text-slate-900">
                                    {request.schoolName}
                                  </div>
                                  <div className="text-xs text-slate-500">
                                    {request.requestCode}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-sm text-slate-700">
                              {request.contactPerson}
                            </td>
                            <td className="px-4 py-3 text-sm text-slate-700">
                              {request.email}
                            </td>
                            <td className="px-4 py-3 text-sm text-slate-700">
                              {request.phone}
                            </td>
                            <td className="max-w-56 px-4 py-3 text-sm text-slate-700">
                              {request.address}
                            </td>
                            <td className="max-w-64 px-4 py-3">
                              <ModuleChips
                                value={request.interestedModules}
                                limit={3}
                              />
                            </td>
                            <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-600">
                              {formatDate(request.createdAt)}
                            </td>
                            <td className="px-4 py-3">
                              <StatusBadge status={request.status} />
                              {request.emailStatus && (
                                <div className="mt-1 text-xs text-slate-500">
                                  Email: {request.emailStatus}
                                </div>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  title="View details"
                                  onClick={() => setViewRequest(request)}
                                  className="rounded-lg border border-slate-300 p-2 text-slate-600 hover:bg-white"
                                >
                                  <Eye size={16} />
                                </button>
                                {request.status === "PENDING" && (
                                  <>
                                    <button
                                      type="button"
                                      disabled={busyRequest === request.id}
                                      onClick={() => void handleAccept(request)}
                                      className="rounded-lg bg-green-600 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50"
                                    >
                                      Accept
                                    </button>
                                    <button
                                      type="button"
                                      disabled={busyRequest === request.id}
                                      onClick={() => void handleReject(request)}
                                      className="rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-700 disabled:opacity-50"
                                    >
                                      Reject
                                    </button>
                                  </>
                                )}
                                {request.status === "ACCEPTED" &&
                                  (request.emailStatus === "FAILED" ||
                                    request.emailStatus === "DISABLED") && (
                                    <button
                                      type="button"
                                      disabled={busyRequest === request.id}
                                      onClick={() => void handleResend(request)}
                                      className="rounded-lg border border-amber-300 px-3 py-2 text-xs font-semibold text-amber-800 disabled:opacity-50"
                                    >
                                      Resend
                                    </button>
                                  )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex flex-col gap-3 sm:flex-row">
                  <input
                    value={accountSearch}
                    onChange={(e) => setAccountSearch(e.target.value)}
                    placeholder="Search school, email, or username"
                    className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm sm:w-80"
                  />
                  <select
                    value={accountFilter}
                    onChange={(e) => setAccountFilter(e.target.value)}
                    className="h-10 rounded-lg border border-slate-300 px-3 text-sm"
                  >
                    <option value="ALL">All statuses</option>
                    <option value="ACTIVE">Active</option>
                    <option value="EXPIRED">Expired</option>
                    <option value="EXTENDED">Extended</option>
                    <option value="CONVERTED">Converted</option>
                  </select>
                </div>
                {loading ? (
                  <div className="py-12 text-center text-slate-500">
                    Loading...
                  </div>
                ) : !filteredAccounts.length ? (
                  <div className="py-12 text-center text-slate-500">
                    No demo accounts found.
                  </div>
                ) : (
                  <div className="w-full overflow-x-auto rounded-lg border border-slate-200">
                    <table className="min-w-[1200px] w-full">
                      <thead className="bg-slate-50 text-left text-xs font-semibold uppercase text-slate-600">
                        <tr>
                          {[
                            "School",
                            "Email",
                            "Phone",
                            "Username",
                            "Period",
                            "Remaining",
                            "Status",
                            "Modules",
                            "Actions",
                          ].map((heading) => (
                            <th key={heading} className="px-4 py-3">
                              {heading}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {filteredAccounts.map((account) => {
                          const status = effectiveStatus(account);
                          const converted = status === "CONVERTED";
                          return (
                            <tr
                              key={account.id}
                              className="border-t border-slate-200 align-top hover:bg-slate-50/70"
                            >
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-3">
                                  <ProtectedLogo
                                    schoolId={account.schoolId || undefined}
                                    alt={account.schoolName}
                                  />
                                  <div>
                                    <div className="max-w-48 font-medium">
                                      {account.schoolName}
                                    </div>
                                    <div className="text-xs text-slate-500">
                                      {account.demoCode}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-sm">
                                {account.email}
                              </td>
                              <td className="px-4 py-3 text-sm">
                                {account.phone}
                              </td>
                              <td className="px-4 py-3 text-sm font-medium">
                                {account.username}
                              </td>
                              <td className="whitespace-nowrap px-4 py-3 text-sm">
                                {formatDate(account.startDate)} -{" "}
                                {formatDate(account.expiryDate)}
                              </td>
                              <td className="px-4 py-3 text-sm">
                                {Math.max(0, Number(account.remainingDays))}{" "}
                                days
                              </td>
                              <td className="px-4 py-3">
                                <StatusBadge status={status} />
                              </td>
                              <td className="max-w-64 px-4 py-3">
                                <ModuleChips
                                  value={account.enabledModules}
                                  limit={3}
                                />
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    title="View details"
                                    onClick={() => setViewAccount(account)}
                                    className="rounded-lg border border-slate-300 p-2 text-slate-600"
                                  >
                                    <Eye size={16} />
                                  </button>
                                  {!converted && (
                                    <button
                                      type="button"
                                      onClick={() => void handleExtend(account)}
                                      className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold"
                                    >
                                      Extend
                                    </button>
                                  )}
                                  {(status === "ACTIVE" ||
                                    status === "EXTENDED") && (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        void handleResetPassword(account)
                                      }
                                      className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold"
                                    >
                                      Reset
                                    </button>
                                  )}
                                  {!converted && (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setConvertingAccount(account)
                                      }
                                      className="rounded-lg bg-[#234A91] px-3 py-2 text-xs font-semibold text-white"
                                    >
                                      Convert
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      {viewRequest && (
        <RequestDetailModal
          request={viewRequest}
          account={accounts.find(
            (account) => account.demoRequestId === viewRequest.id,
          )}
          onClose={() => setViewRequest(undefined)}
          onResend={() => void handleResend(viewRequest)}
        />
      )}
      {viewAccount && (
        <AccountDetailModal
          account={viewAccount}
          onClose={() => setViewAccount(undefined)}
        />
      )}
      {acceptResult && (
        <AcceptResultModal
          result={acceptResult}
          onClose={() => setAcceptResult(undefined)}
          onCopy={(value) => void copySecret(value)}
        />
      )}
      {acceptingRequest && (
        <AcceptDemoModal
          request={acceptingRequest}
          onClose={() => setAcceptingRequest(undefined)}
          onAccept={(username) => confirmAccept(acceptingRequest, username)}
        />
      )}
      {convertingAccount && (
        <ConvertToPaidModal
          account={convertingAccount}
          onClose={() => setConvertingAccount(undefined)}
          onConfirm={() => handleConvert(convertingAccount.id)}
        />
      )}
    </SuperAdminLayout>
  );
}
