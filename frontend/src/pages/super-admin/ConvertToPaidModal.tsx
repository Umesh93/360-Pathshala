import { useState } from "react";
import { X } from "lucide-react";
import { useToast } from "@/modules/admin/students/components/Toast";
import type { DemoSchool } from "@/types/DemoSchool";

interface Props {
  account: DemoSchool;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export default function ConvertToPaidModal({
  account,
  onClose,
  onConfirm,
}: Props) {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    if (
      !confirm(
        "Convert this demo school to a paid school? Its existing school data will be preserved.",
      )
    ) {
      return;
    }
    setLoading(true);
    try {
      await onConfirm();
    } catch {
      showToast("Failed to convert to paid school", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-800">
            Convert To Paid School
          </h3>
          <button
            onClick={onClose}
            className="rounded-lg p-1 hover:bg-slate-100"
          >
            <X size={20} className="text-slate-500" />
          </button>
        </div>

        <p className="text-sm text-slate-600 mb-4">
          You are about to convert{" "}
          <span className="font-semibold">{account.schoolName}</span> from demo
          to a paid school.
        </p>

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 mb-6 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-600">Demo Code</span>
            <span className="font-medium text-slate-800">
              {account.demoCode}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">Username</span>
            <span className="font-medium text-slate-800">
              {account.username}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">Expiry Date</span>
            <span className="font-medium text-slate-800">
              {account.expiryDate}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">Remaining Days</span>
            <span className="font-medium text-slate-800">
              {account.remainingDays}
            </span>
          </div>
        </div>

        <p className="text-xs text-slate-500 mb-6">
          This promotes the existing school and preserves its data and enabled
          modules. The demo login will be replaced by the paid account.
        </p>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            className="rounded-xl bg-green-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
          >
            {loading && (
              <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            {loading ? "Converting..." : "Convert To Paid"}
          </button>
        </div>
      </div>
    </div>
  );
}
