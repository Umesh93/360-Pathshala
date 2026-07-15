import React from "react";
import { MoreVertical, Eye, Pencil, Trash2, Printer, Download } from "lucide-react";

interface StudentActionMenuProps {
  studentId: number;
  onView: (id: number) => void;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}

const StudentActionMenu: React.FC<StudentActionMenuProps> = ({
  studentId,
  onView,
  onEdit,
  onDelete,
}) => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
      >
        <MoreVertical size={18} />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          ></div>
          <div className="absolute right-0 z-20 mt-1 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-1">
            <button
              onClick={() => {
                onView(studentId);
                setIsOpen(false);
              }}
              className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              <Eye size={16} />
              View
            </button>
            <button
              onClick={() => {
                onEdit(studentId);
                setIsOpen(false);
              }}
              className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              <Pencil size={16} />
              Edit
            </button>
            <button
              onClick={() => {
                onDelete(studentId);
                setIsOpen(false);
              }}
              className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
            >
              <Trash2 size={16} />
              Delete
            </button>
            <hr className="my-1" />
            <button
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              <Printer size={16} />
              Print ID Card
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              <Download size={16} />
              Download PDF
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default StudentActionMenu;
