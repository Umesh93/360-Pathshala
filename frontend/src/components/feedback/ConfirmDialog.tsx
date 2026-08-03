import { AlertTriangle } from "lucide-react";
import { Button } from "../ui/button";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "default" | "destructive";
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmDialog = ({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "default",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl shadow-elevated p-6 max-w-sm w-full mx-4">
        <div className="flex items-center gap-3 mb-3">
          <div className={`p-2 rounded-full ${variant === "destructive" ? "bg-red-50 text-red-600" : "bg-blue-50 text-[#223D5D]"}`}>
            <AlertTriangle className="h-5 w-5" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        </div>
        {description && <p className="text-sm text-gray-600 mb-6">{description}</p>}
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onCancel}>{cancelLabel}</Button>
          <Button
            onClick={onConfirm}
            className={variant === "destructive" ? "bg-red-600 hover:bg-red-700 text-white" : "bg-[#223D5D] hover:bg-[#1a2f47] text-white"}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
