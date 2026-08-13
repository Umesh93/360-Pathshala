import { Trash2 } from "lucide-react";
import { Button } from "../ui/button";

interface DeleteDialogProps {
  open: boolean;
  title?: string;
  description?: string;
  itemName?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const DeleteDialog = ({
  open,
  title = "Delete item",
  description = "This action cannot be undone.",
  itemName,
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
}: DeleteDialogProps) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl shadow-elevated p-6 max-w-sm w-full mx-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 rounded-full bg-red-50 text-red-600">
            <Trash2 className="h-5 w-5" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        </div>
        <p className="text-sm text-gray-600 mb-1">{description}</p>
        {itemName && (
          <p className="text-sm font-medium text-gray-800 mb-6">"{itemName}"</p>
        )}
        {!itemName && <div className="mb-6" />}
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button
            onClick={onConfirm}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DeleteDialog;
