import React from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import StudentAvatar from "./StudentAvatar";
import StudentStatusBadge from "./StudentStatusBadge";
import ActionMenu from "@/components/common/ActionMenu";
import type { Student } from "../types/student.types";

interface StudentTableProps {
  students: Student[];
  loading: boolean;
  onView: (id: number) => void;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  onBulkDelete?: (ids: number[]) => void;
  selectedRows?: Set<number>;
  onSelectionChange?: (ids: Set<number>) => void;
}

type SortKey = keyof Student;
type SortDirection = "asc" | "desc";

const StudentTable: React.FC<StudentTableProps> = ({
  students,
  loading,
  onView,
  onEdit,
  onDelete,
  onBulkDelete,
  selectedRows: externalSelectedRows,
  onSelectionChange,
}) => {
  const [sortKey, setSortKey] = React.useState<SortKey>("firstName");
  const [sortDirection, setSortDirection] =
    React.useState<SortDirection>("asc");
  const [internalSelectedRows, setInternalSelectedRows] = React.useState<
    Set<number>
  >(new Set());

  const selectedRows = externalSelectedRows ?? internalSelectedRows;
  const setSelectedRows = onSelectionChange ?? setInternalSelectedRows;

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
  };

  const sortedStudents = React.useMemo(() => {
    const sorted = [...students];
    sorted.sort((a, b) => {
      const aValue = a[sortKey];
      const bValue = b[sortKey];
      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortDirection === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      return 0;
    });
    return sorted;
  }, [students, sortKey, sortDirection]);

  const toggleSelectAll = () => {
    if (selectedRows.size === students.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(students.map((s) => s.id)));
    }
  };

  const toggleSelectRow = (id: number) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedRows(newSelected);
  };

  const SortIcon = ({ column }: { column: SortKey }) => {
    if (sortKey !== column) return null;
    return sortDirection === "asc" ? (
      <ChevronUp size={14} className="inline ml-1" />
    ) : (
      <ChevronDown size={14} className="inline ml-1" />
    );
  };

  const columns = [
    { key: "admissionNo", label: "Admission No" },
    { key: "firstName", label: "Student Name" },
    { key: "rollNumber", label: "Roll Number" },
    { key: "class", label: "Class" },
    { key: "section", label: "Section" },
    { key: "gender", label: "Gender" },
    { key: "dob", label: "DOB" },
    { key: "phone", label: "Phone" },
    { key: "category", label: "Category" },
    { key: "status", label: "Status" },
  ];

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="animate-pulse">
          <div className="h-12 bg-gray-100 border-b border-gray-200"></div>
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-16 border-b border-gray-100 last:border-b-0"
            ></div>
          ))}
        </div>
      </div>
    );
  }

  if (students.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-12 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-8 h-8 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">
          No students found
        </h3>
        <p className="text-sm text-gray-500">
          Get started by adding a new student.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      {selectedRows.size > 0 && onBulkDelete && (
        <div className="px-4 py-2 bg-blue-50 border-b border-blue-100 flex items-center justify-between">
          <span className="text-sm text-blue-700">
            {selectedRows.size} student{selectedRows.size > 1 ? "s" : ""}{" "}
            selected
          </span>
          <button
            onClick={() => onBulkDelete(Array.from(selectedRows))}
            className="text-sm text-red-600 hover:text-red-700 font-medium"
          >
            Delete Selected
          </button>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1200px]">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-4 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedRows.size === students.length}
                  onChange={toggleSelectAll}
                  className="w-4 h-4 rounded border-gray-300 text-[#234A91] focus:ring-[#234A91]"
                />
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                SN
              </th>
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => handleSort(col.key as SortKey)}
                  className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700 select-none"
                >
                  {col.label}
                  <SortIcon column={col.key as SortKey} />
                </th>
              ))}
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {sortedStudents.map((student, index) => (
              <tr
                key={student.id}
                className="hover:bg-gray-50 transition-colors"
              >
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedRows.has(student.id)}
                    onChange={() => toggleSelectRow(student.id)}
                    className="w-4 h-4 rounded border-gray-300 text-[#234A91] focus:ring-[#234A91]"
                  />
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">{index + 1}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <StudentAvatar
                      firstName={student.firstName}
                      lastName={student.lastName}
                      photo={student.photo}
                      size="sm"
                    />
                    <span className="text-sm font-medium text-gray-900">
                      {student.admissionNo}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => onView(student.id)}
                    className="text-sm font-medium text-[#234A91] hover:underline"
                  >
                    {student.firstName} {student.lastName}
                  </button>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {student.rollNumber}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {student.class}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {student.section}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600 capitalize">
                  {student.gender}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {student.dob}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {student.guardian.fatherName || student.phone}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {student.phone}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {student.category}
                </td>
                <td className="px-4 py-3">
                  <StudentStatusBadge status={student.status} />
                </td>
                <td className="px-4 py-3 text-right">
                  <ActionMenu
                    id={student.id}
                    onView={onView}
                    onEdit={onEdit}
                    onDelete={onDelete}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StudentTable;
