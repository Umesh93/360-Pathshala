import { useCallback, useEffect, useState } from "react";
import { useToast } from "@/modules/admin/students/components/Toast";
import {
  getAdminDemoRequests,
  rejectDemoRequest,
  deleteAdminDemoRequest,
} from "@/services/demoRequestService";
import {
  getDemoAccounts,
  extendDemo,
  resetDemoPassword,
  convertToPaid,
  deleteDemoAccount,
  createDemoAccount,
} from "@/services/demoAccountService";
import type { DemoRequest } from "@/types/DemoRequest";
import type { CreateDemoAccountPayload, ConvertToPaidResult, DemoSchool } from "@/types/DemoSchool";
import SuperAdminLayout from "@/layouts/SuperAdminLayout";
import CreateDemoAccountForm from "./CreateDemoAccountForm";
import ConvertToPaidModal from "./ConvertToPaidModal";

type Tab = "requests" | "accounts";

export default function DemoRequests() {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<Tab>("requests");
  const [requests, setRequests] = useState<DemoRequest[]>([]);
  const [accounts, setAccounts] = useState<DemoSchool[]>([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<DemoRequest | null>(
    null,
  );
  const [convertingAccount, setConvertingAccount] = useState<DemoSchool | null>(
    null,
  );

  const [requestFilter, setRequestFilter] = useState<string>("ALL");
  const [accountFilter, setAccountFilter] = useState<string>("ALL");
  const [requestSearch, setRequestSearch] = useState("");
  const [accountSearch, setAccountSearch] = useState("");

  const loadRequests = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAdminDemoRequests();
      setRequests(data);
    } catch {
      showToast("Failed to load demo requests", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  const loadAccounts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getDemoAccounts();
      setAccounts(data);
    } catch {
      showToast("Failed to load demo accounts", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    if (activeTab === "requests") {
      queueMicrotask(loadRequests);
    } else {
      queueMicrotask(loadAccounts);
    }
  }, [activeTab, loadAccounts, loadRequests]);

  const handleApprove = (request: DemoRequest) => {
    setSelectedRequest(request);
    setShowForm(true);
  };

  const handleCreateManual = () => {
    setSelectedRequest(null);
    setShowForm(true);
  };

  const handleBackToList = () => {
    setShowForm(false);
    setSelectedRequest(null);
  };

  const handleReject = async (id: number) => {
    if (!confirm("Are you sure you want to reject this demo request?")) return;
    try {
      await rejectDemoRequest(id);
      showToast("Demo request rejected", "success");
      loadRequests();
    } catch {
      showToast("Failed to reject demo request", "error");
    }
  };

  const handleDeleteRequest = async (id: number) => {
    if (!confirm("Are you sure you want to delete this demo request?")) return;
    try {
      await deleteAdminDemoRequest(id);
      showToast("Demo request deleted", "success");
      loadRequests();
    } catch {
      showToast("Failed to delete demo request", "error");
    }
  };

  const handleCreateDemoAccount = async (payload: CreateDemoAccountPayload) => {
    try {
      await createDemoAccount(payload);
      if (selectedRequest) {
        showToast("Demo account created successfully", "success");
        setShowForm(false);
        setSelectedRequest(null);
        loadRequests();
      } else {
        showToast("Demo account created successfully", "success");
        setShowForm(false);
        loadAccounts();
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } }; message?: string };
      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to create demo account";
      showToast(message, "error");
      throw err;
    }
  };

  const handleExtend = async (id: number, days: number) => {
    try {
      await extendDemo(id, { days });
      showToast(`Demo extended by ${days} days`, "success");
      loadAccounts();
    } catch {
      showToast("Failed to extend demo", "error");
    }
  };

  const handleResetPassword = async (id: number) => {
    try {
      const res = await resetDemoPassword(id);
      showToast("Password reset successfully", "success");
      navigator.clipboard.writeText(res.password);
      alert(`New password: ${res.password}\n(Copied to clipboard)`);
    } catch {
      showToast("Failed to reset password", "error");
    }
  };

  const handleConvert = async (id: number) => {
    try {
      const result: ConvertToPaidResult = await convertToPaid(id, {});
      showToast("Converted to paid school successfully", "success");
      setConvertingAccount(null);
      loadAccounts();
      alert(
        `School Code: ${result.schoolCode}\nUsername: ${result.adminUsername}\nPassword: ${result.adminPassword}\nTotal: NPR ${result.totalAmount.toLocaleString()}`,
      );
    } catch {
      showToast("Failed to convert to paid school", "error");
    }
  };

  const handleDeleteAccount = async (id: number) => {
    if (!confirm("Are you sure you want to delete this demo account?")) return;
    try {
      await deleteDemoAccount(id);
      showToast("Demo account deleted", "success");
      loadAccounts();
    } catch {
      showToast("Failed to delete demo account", "error");
    }
  };

  const filteredRequests = requests.filter((r) => {
    if (requestFilter !== "ALL" && r.status !== requestFilter) return false;
    if (
      requestSearch &&
      !r.schoolName.toLowerCase().includes(requestSearch.toLowerCase()) &&
      !r.email.toLowerCase().includes(requestSearch.toLowerCase())
    )
      return false;
    return true;
  });

  const filteredAccounts = accounts.filter((a) => {
    if (accountFilter !== "ALL" && a.status !== accountFilter) return false;
    if (
      accountSearch &&
      !a.schoolName.toLowerCase().includes(requestSearch.toLowerCase()) &&
      !a.username.toLowerCase().includes(requestSearch.toLowerCase())
    )
      return false;
    return true;
  });

  return (
    <SuperAdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Demo Requests</h1>
            <p className="text-gray-500">
              Manage demo enquiries and demo schools
            </p>
          </div>
          {/* <button
            onClick={handleCreateManual}
            className="rounded-xl bg-[#234A91] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#1a3a7a]"
          >
            + Create Demo Account
          </button> */}
          <button
            onClick={showForm ? handleBackToList : handleCreateManual}
            className="rounded-xl bg-[#234A91] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#1a3a7a] transition-colors"
          >
            {showForm ? "Back to List" : "+ Create Demo Account"}
          </button>
        </div>

        {showForm ? (
          <CreateDemoAccountForm
            demoRequest={selectedRequest || undefined}
            onSuccess={handleCreateDemoAccount}
            onCancel={handleBackToList}
          />
        ) : (
          <div className="rounded-3xl border border-slate-200 bg-white">
            <div className="border-b border-slate-200">
              <nav className="flex gap-0">
                <button
                  onClick={() => setActiveTab("requests")}
                  className={`px-6 py-4 text-sm font-medium transition-colors border-b-2 ${
                    activeTab === "requests"
                      ? "border-[#234A91] text-[#234A91]"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Demo Requests
                </button>
                <button
                  onClick={() => setActiveTab("accounts")}
                  className={`px-6 py-4 text-sm font-medium transition-colors border-b-2 ${
                    activeTab === "accounts"
                      ? "border-[#234A91] text-[#234A91]"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Demo Accounts
                </button>
              </nav>
            </div>

            <div className="p-6">
              {activeTab === "requests" ? (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <input
                      type="text"
                      placeholder="Search by school name or email..."
                      value={requestSearch}
                      onChange={(e) => setRequestSearch(e.target.value)}
                      className="h-10 w-full sm:w-80 rounded-xl border border-slate-300 px-4 text-sm outline-none focus:border-[#234A91] focus:ring-2 focus:ring-[#234A91]/10"
                    />
                    <select
                      value={requestFilter}
                      onChange={(e) => setRequestFilter(e.target.value)}
                      className="h-10 rounded-xl border border-slate-300 px-4 text-sm outline-none focus:border-[#234A91] focus:ring-2 focus:ring-[#234A91]/10"
                    >
                      <option value="ALL">All Status</option>
                      <option value="PENDING">Pending</option>
                      <option value="CONTACTED">Contacted</option>
                      <option value="APPROVED">Approved</option>
                      <option value="REJECTED">Rejected</option>
                      <option value="CANCELLED">Cancelled</option>
                    </select>
                  </div>

                  {loading ? (
                    <div className="text-center text-gray-500 py-12">
                      Loading...
                    </div>
                  ) : filteredRequests.length === 0 ? (
                    <div className="text-center text-gray-500 py-12">
                      No demo requests found.
                    </div>
                  ) : (
                    <div className="overflow-x-auto rounded-3xl border border-slate-200">
                      <table className="w-full">
                        <thead className="bg-slate-50">
                          <tr>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                              Request ID
                            </th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                              School Name
                            </th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                              Contact Person
                            </th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                              Email
                            </th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                              Phone
                            </th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                              Status
                            </th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                              Created Date
                            </th>
                            <th className="px-6 py-4 text-right text-sm font-semibold text-slate-700">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredRequests.map((req) => (
                            <tr
                              key={req.id}
                              className="border-t border-slate-200 hover:bg-slate-50"
                            >
                              <td className="px-6 py-4 text-sm font-medium text-slate-800">
                                {req.requestCode}
                              </td>
                              <td className="px-6 py-4 text-sm text-slate-600">
                                {req.schoolName}
                              </td>
                              <td className="px-6 py-4 text-sm text-slate-600">
                                {req.contactPerson}
                              </td>
                              <td className="px-6 py-4 text-sm text-slate-600">
                                {req.email}
                              </td>
                              <td className="px-6 py-4 text-sm text-slate-600">
                                {req.phone}
                              </td>
                              <td className="px-6 py-4">
                                <span
                                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                                    req.status === "APPROVED"
                                      ? "bg-green-50 text-green-700"
                                      : req.status === "REJECTED"
                                        ? "bg-red-50 text-red-700"
                                        : req.status === "PENDING"
                                          ? "bg-yellow-50 text-yellow-700"
                                          : req.status === "CONTACTED"
                                            ? "bg-blue-50 text-blue-700"
                                            : "bg-gray-50 text-gray-700"
                                  }`}
                                >
                                  {req.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-sm text-slate-600">
                                {new Date(req.createdAt).toLocaleDateString()}
                              </td>
                              <td className="px-6 py-4 text-right">
                                <div className="relative inline-block">
                                  <select
                                    onChange={(e) => {
                                      if (e.target.value === "approve")
                                        handleApprove(req);
                                      else if (e.target.value === "reject")
                                        handleReject(req.id);
                                      else if (e.target.value === "delete")
                                        handleDeleteRequest(req.id);
                                      e.target.value = "";
                                    }}
                                    className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 outline-none focus:border-[#234A91]"
                                  >
                                    <option value="">Actions</option>
                                    {req.status === "PENDING" && (
                                      <option value="approve">Approve</option>
                                    )}
                                    {req.status === "PENDING" && (
                                      <option value="reject">Reject</option>
                                    )}
                                    <option value="delete">Delete</option>
                                  </select>
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
                  <div className="flex flex-col sm:flex-row gap-4">
                    <input
                      type="text"
                      placeholder="Search by school name or username..."
                      value={accountSearch}
                      onChange={(e) => setAccountSearch(e.target.value)}
                      className="h-10 w-full sm:w-80 rounded-xl border border-slate-300 px-4 text-sm outline-none focus:border-[#234A91] focus:ring-2 focus:ring-[#234A91]/10"
                    />
                    <select
                      value={accountFilter}
                      onChange={(e) => setAccountFilter(e.target.value)}
                      className="h-10 rounded-xl border border-slate-300 px-4 text-sm outline-none focus:border-[#234A91] focus:ring-2 focus:ring-[#234A91]/10"
                    >
                      <option value="ALL">All Status</option>
                      <option value="ACTIVE">Active</option>
                      <option value="EXPIRED">Expired</option>
                      <option value="EXTENDED">Extended</option>
                      <option value="CONVERTED">Converted</option>
                    </select>
                  </div>

                  {loading ? (
                    <div className="text-center text-gray-500 py-12">
                      Loading...
                    </div>
                  ) : filteredAccounts.length === 0 ? (
                    <div className="text-center text-gray-500 py-12">
                      No demo accounts found.
                    </div>
                  ) : (
                    <div className="overflow-x-auto rounded-3xl border border-slate-200">
                      <table className="w-full">
                        <thead className="bg-slate-50">
                          <tr>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                              Demo ID
                            </th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                              School Name
                            </th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                              Username
                            </th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                              Expiry Date
                            </th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                              Remaining Days
                            </th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                              Status
                            </th>
                            <th className="px-6 py-4 text-right text-sm font-semibold text-slate-700">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredAccounts.map((acc) => (
                            <tr
                              key={acc.id}
                              className="border-t border-slate-200 hover:bg-slate-50"
                            >
                              <td className="px-6 py-4 text-sm font-medium text-slate-800">
                                {acc.demoCode}
                              </td>
                              <td className="px-6 py-4 text-sm text-slate-600">
                                {acc.schoolName}
                              </td>
                              <td className="px-6 py-4 text-sm text-slate-600">
                                {acc.username}
                              </td>
                              <td className="px-6 py-4 text-sm text-slate-600">
                                {acc.expiryDate}
                              </td>
                              <td className="px-6 py-4 text-sm text-slate-600">
                                {acc.remainingDays}
                              </td>
                              <td className="px-6 py-4">
                                <span
                                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                                    acc.status === "ACTIVE"
                                      ? "bg-green-50 text-green-700"
                                      : acc.status === "EXPIRED"
                                        ? "bg-red-50 text-red-700"
                                        : acc.status === "EXTENDED"
                                          ? "bg-blue-50 text-blue-700"
                                          : "bg-purple-50 text-purple-700"
                                  }`}
                                >
                                  {acc.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-right">
                                <div className="relative inline-block">
                                  <select
                                    onChange={(e) => {
                                      if (e.target.value === "extend") {
                                        const days = prompt(
                                          "Enter days to extend:",
                                        );
                                        if (days)
                                          handleExtend(
                                            acc.id,
                                            parseInt(days, 10),
                                          );
                                      } else if (e.target.value === "reset")
                                        handleResetPassword(acc.id);
                                      else if (e.target.value === "convert")
                                        setConvertingAccount(acc);
                                      else if (e.target.value === "delete")
                                        handleDeleteAccount(acc.id);
                                      e.target.value = "";
                                    }}
                                    className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 outline-none focus:border-[#234A91]"
                                  >
                                    <option value="">Actions</option>
                                    <option value="extend">Extend Demo</option>
                                    <option value="reset">
                                      Reset Password
                                    </option>
                                    <option value="convert">
                                      Convert To Paid
                                    </option>
                                    <option value="delete">Delete</option>
                                  </select>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {convertingAccount && (
        <ConvertToPaidModal
          account={convertingAccount}
          onClose={() => setConvertingAccount(null)}
          onConfirm={() => handleConvert(convertingAccount.id)}
        />
      )}
    </SuperAdminLayout>
  );
}
