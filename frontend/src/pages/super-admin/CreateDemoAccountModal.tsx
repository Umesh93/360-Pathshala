import { X } from "lucide-react";
import CreateDemoAccountForm from "./CreateDemoAccountForm";
import type { DemoRequest } from "@/types/DemoRequest";
import type { CreateDemoAccountPayload } from "@/types/DemoSchool";

interface Props {
  demoRequest?: DemoRequest | null;
  onClose: () => void;
  onSubmit: (payload: CreateDemoAccountPayload) => Promise<void>;
}

export default function CreateDemoAccountModal({
  demoRequest,
  onClose,
  onSubmit,
}: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-slate-800">
            {demoRequest ? "Create Demo Account" : "Create Demo Account"}
          </h3>
          <button
            onClick={onClose}
            className="rounded-lg p-1 hover:bg-slate-100"
          >
            <X size={20} className="text-slate-500" />
          </button>
        </div>
        <CreateDemoAccountForm
          demoRequest={demoRequest}
          onSuccess={onSubmit}
          onCancel={onClose}
        />
      </div>
    </div>
  );
}
