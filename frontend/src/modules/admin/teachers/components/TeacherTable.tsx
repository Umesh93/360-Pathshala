import React from "react";
import TeacherAvatar from "./TeacherAvatar";
import TeacherStatusBadge from "./TeacherStatusBadge";
import type { Teacher } from "../types/teacher.types";

interface TeacherTableProps {
  teachers: Teacher[];
  loading: boolean;
  onView: (id: number) => void;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}

type SortKey = keyof Teacher;
type SortDirection = "asc" | "desc";

const TeacherTable: React.FC<TeacherTableProps> = ({
  teachers,
  loading,
  onView,
  onEdit,
  onDelete,
}) => {
  const [sortKey, setSortKey] = React.useState<SortKey>("firstName");
  const [sortDirection, setSortDirection] = React.useState<SortDirection>("asc");
  const [selectedRows, setSelectedRows] = React.useState<Set<number>>(new Set());

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
  };

  const sortedTeachers = React.useMemo(() => {
    const sorted = [...teachers];
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
  }, [teachers, sortKey, sortDirection]);

  const toggleSelectAll = () => {
    if (selectedRows.size === teachers.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(teachers.map((t) => t.id)));
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
      <svg width="14" height="14" className="inline ml-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M18 15l-6-6-6 6" />
      </svg>
    ) : (
      <svg width="14" height="14" className="inline ml-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M6 9l6 6 6-6" />
      </svg>
    );
  };

  const columns = [
    { key: "teacherId", label: "Teacher ID" },
    { key: "firstName", label: "Teacher Name" },
    { key: "gender", label: "Gender" },
    { key: "subject", label: "Subject" },
    { key: "qualification", label: "Qualification" },
    { key: "joiningDate", label: "Joining Date" },
    { key: "experience", label: "Experience" },
    { key: "phone", label: "Phone" },
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

  if (teachers.length === 0) {
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
          No teachers found
        </h3>
        <p className="text-sm text-gray-500">
          Get started by adding a new teacher.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1200px]">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-4 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedRows.size === teachers.length}
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
            {sortedTeachers.map((teacher, index) => (
              <tr
                key={teacher.id}
                className="hover:bg-gray-50 transition-colors"
              >
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedRows.has(teacher.id)}
                    onChange={() => toggleSelectRow(teacher.id)}
                    className="w-4 h-4 rounded border-gray-300 text-[#234A91] focus:ring-[#234A91]"
                  />
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {index + 1}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <TeacherAvatar
                      firstName={teacher.firstName}
                      lastName={teacher.lastName}
                      photo={teacher.photo}
                      size="sm"
                    />
                    <span className="text-sm font-medium text-gray-900">
                      {teacher.teacherId}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => onView(teacher.id)}
                    className="text-sm font-medium text-[#234A91] hover:underline"
                  >
                    {teacher.firstName} {teacher.lastName}
                  </button>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600 capitalize">
                  {teacher.gender}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {teacher.subject}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {teacher.qualification}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {teacher.joiningDate}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {teacher.experience}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {teacher.phone}
                </td>
                <td className="px-4 py-3">
                  <TeacherStatusBadge status={teacher.status} />
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="space-x-3"><button onClick={() => onView(teacher.id)} className="text-[#234A91]">View</button><button onClick={() => onEdit(teacher.id)} className="text-[#234A91]">Edit</button><button onClick={() => onDelete(teacher.id)} className="text-red-600">Delete</button></div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TeacherTable;
