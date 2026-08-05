import React from "react";
import { MoreVertical, Eye, Pencil, Trash2, Printer, Download, RotateCcw } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

interface ActionMenuProps {
  id: number;
  onView?: (id: number) => void;
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
  onPrint?: (id: number) => void;
  onDownload?: (id: number) => void;
  onRestore?: (id: number) => void;
}

const ActionMenu: React.FC<ActionMenuProps> = ({
  id,
  onView,
  onEdit,
  onDelete,
  onPrint,
  onDownload,
  onRestore,
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-xl p-2 text-slate-500 transition-colors hover:bg-[var(--primary-soft)] hover:text-[var(--primary)]"
        >
          <MoreVertical size={18} />
          <span className="sr-only">Open menu</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="z-50 w-48 rounded-xl border border-slate-200 bg-white shadow-elevated">
        {onView && (
          <DropdownMenuItem
            onSelect={() => onView(id)}
            className="cursor-pointer gap-2 text-sm text-slate-700 focus:bg-[var(--primary-soft)] focus:text-[var(--primary)]"
          >
            <Eye size={16} />
            View
          </DropdownMenuItem>
        )}
        {onEdit && (
          <DropdownMenuItem
            onSelect={() => onEdit(id)}
            className="cursor-pointer gap-2 text-sm text-slate-700 focus:bg-[var(--primary-soft)] focus:text-[var(--primary)]"
          >
            <Pencil size={16} />
            Edit
          </DropdownMenuItem>
        )}
        {onDelete && (
          <DropdownMenuItem
            onSelect={() => onDelete(id)}
            className="cursor-pointer gap-2 text-sm text-red-600 focus:bg-red-50 focus:text-red-600"
          >
            <Trash2 size={16} />
            Delete
          </DropdownMenuItem>
        )}
        {onRestore && (
          <DropdownMenuItem
            onSelect={() => onRestore(id)}
            className="cursor-pointer gap-2 text-sm text-green-700 focus:bg-green-50 focus:text-green-700"
          >
            <RotateCcw size={16} />
            Restore
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={() => onPrint?.(id)}
          className="cursor-pointer gap-2 text-sm text-slate-700 focus:bg-[var(--primary-soft)] focus:text-[var(--primary)]"
        >
          <Printer size={16} />
          Print ID Card
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={() => onDownload?.(id)}
          className="cursor-pointer gap-2 text-sm text-slate-700 focus:bg-[var(--primary-soft)] focus:text-[var(--primary)]"
        >
          <Download size={16} />
          Download PDF
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ActionMenu;
