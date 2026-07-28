import { X } from "lucide-react";
import type { ConversionDetail } from "@/types";

interface Props {
  detail: ConversionDetail;
  onClose: () => void;
}

export default function ConversionDetailModal({ detail, onClose }: Props) {
  const { conversion, demoRequest, demoSchool, paidSchool } = detail;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-slate-800">Conversion Detail — {conversion.conversionCode}</h3>
          <button onClick={onClose} className="rounded-lg p-1 hover:bg-slate-100">
            <X size={20} className="text-slate-500" />
          </button>
        </div>

        <div className="space-y-8">
          <div>
            <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Demo Request Information</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs text-slate-500">Request Code</p>
                <p className="text-sm font-medium text-slate-800">{demoRequest.requestCode}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs text-slate-500">School Name</p>
                <p className="text-sm font-medium text-slate-800">{demoRequest.schoolName}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs text-slate-500">Contact Person</p>
                <p className="text-sm font-medium text-slate-800">{demoRequest.contactPerson}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs text-slate-500">Email</p>
                <p className="text-sm font-medium text-slate-800">{demoRequest.email}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs text-slate-500">Phone</p>
                <p className="text-sm font-medium text-slate-800">{demoRequest.phone}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs text-slate-500">Status</p>
                <p className="text-sm font-medium text-slate-800">{demoRequest.status}</p>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Demo School Information</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs text-slate-500">Demo Code</p>
                <p className="text-sm font-medium text-slate-800">{demoSchool.demoCode}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs text-slate-500">Username</p>
                <p className="text-sm font-medium text-slate-800">{demoSchool.username}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs text-slate-500">Start Date</p>
                <p className="text-sm font-medium text-slate-800">{demoSchool.startDate || "-"}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs text-slate-500">Expiry Date</p>
                <p className="text-sm font-medium text-slate-800">{demoSchool.expiryDate || "-"}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 sm:col-span-2">
                <p className="text-xs text-slate-500">Enabled Modules</p>
                <p className="text-sm font-medium text-slate-800">{demoSchool.enabledModules || "-"}</p>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Conversion Information</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs text-slate-500">Conversion Code</p>
                <p className="text-sm font-medium text-slate-800">{conversion.conversionCode}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs text-slate-500">Conversion Date</p>
                <p className="text-sm font-medium text-slate-800">{conversion.conversionDate}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs text-slate-500">Converted By</p>
                <p className="text-sm font-medium text-slate-800">{conversion.convertedByName}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs text-slate-500">Subscription Plan</p>
                <p className="text-sm font-medium text-slate-800">{conversion.initialSubscriptionPlan || "-"}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs text-slate-500">Payment Reference</p>
                <p className="text-sm font-medium text-slate-800">{conversion.paymentReference || "-"}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs text-slate-500">Payment Amount</p>
                <p className="text-sm font-medium text-slate-800">
                  {conversion.paymentAmount ? `${conversion.currency} ${Number(conversion.paymentAmount).toLocaleString()}` : "-"}
                </p>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Paid School Information</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs text-slate-500">School Code</p>
                <p className="text-sm font-medium text-slate-800">{paidSchool.code}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs text-slate-500">School Name</p>
                <p className="text-sm font-medium text-slate-800">{paidSchool.name}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs text-slate-500">Email</p>
                <p className="text-sm font-medium text-slate-800">{paidSchool.email}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs text-slate-500">Status</p>
                <p className="text-sm font-medium text-slate-800">{paidSchool.status}</p>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Conversion Timeline</h4>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-3 h-3 rounded-full bg-[#234A91]" />
                  <div className="w-0.5 h-full bg-slate-200" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-800">Demo Request Submitted</p>
                  <p className="text-xs text-slate-500">{demoRequest.createdAt}</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <div className="w-0.5 h-full bg-slate-200" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-800">Demo Account Created</p>
                  <p className="text-xs text-slate-500">{demoSchool.createdAt}</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-3 h-3 rounded-full bg-purple-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-800">Converted To Paid School</p>
                  <p className="text-xs text-slate-500">{conversion.conversionDate}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button onClick={onClose} className="rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
