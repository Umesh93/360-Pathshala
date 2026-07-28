import { useState } from "react";
import { MoreVertical, Edit, Trash2, Power, PowerOff } from "lucide-react";
import type { School } from "../types/School";
import { MODULE_OPTIONS } from "./SchoolFormFields";

const MODULE_CODE_TO_NAME = Object.fromEntries(
  MODULE_OPTIONS.map((m) => [m.code, m.name]),
);

interface Props {
  schools: School[];
  onEdit?: (school: School) => void;
  onDelete?: (school: School) => void;
  onToggleStatus?: (school: School) => void;
}

export default function SchoolTable({
  schools,
  onEdit,
  onDelete,
  onToggleStatus,
}: Props) {
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  return (
    <div className="overflow-visible rounded-3xl border border-slate-200 bg-white">
      <table className="w-full">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-6 py-5 text-left text-sm font-semibold text-slate-700">
              School
            </th>
            <th className="px-6 py-5 text-left text-sm font-semibold text-slate-700">
              Address
            </th>
            <th className="px-6 py-5 text-left text-sm font-semibold text-slate-700">
              Email
            </th>
            <th className="px-6 py-5 text-left text-sm font-semibold text-slate-700">
              Phone Number
            </th>
            <th className="px-6 py-5 text-left text-sm font-semibold text-slate-700">
              Status
            </th>
            <th className="px-6 py-5 text-left text-sm font-semibold text-slate-700">
              Modules
            </th>
            <th className="px-6 py-5 text-left text-sm font-semibold text-slate-700">
              Username
            </th>
            <th className="px-6 py-5 text-right text-sm font-semibold text-slate-700">
              Actions
            </th>
          </tr>
        </thead>

        <tbody>
          {schools.length === 0 ? (
            <tr>
              <td colSpan={8} className="py-12 text-center text-slate-500">
                No schools found.
              </td>
            </tr>
          ) : (
            schools.map((school) => (
              <tr
                key={school.id}
                className="border-t border-slate-200 hover:bg-slate-50 transition"
              >
                <td className="px-6 py-5 font-medium text-slate-800">
                  {school.schoolName}
                </td>
                <td className="px-6 py-5 text-slate-600">{school.address}</td>
                <td className="px-6 py-5 text-slate-600">{school.email}</td>
                <td className="px-6 py-5 text-slate-600">
                  {school.phoneNumber}
                </td>
                <td className="px-6 py-5">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      school.status === "ACTIVE"
                        ? "bg-green-50 text-green-700"
                        : school.status === "INACTIVE"
                          ? "bg-red-50 text-red-700"
                          : "bg-yellow-50 text-yellow-700"
                    }`}
                  >
                    {school.status}
                  </span>
                </td>
                <td className="px-6 py-5">
                  <div className="flex flex-wrap gap-2">
                    {school.modules.slice(0, 3).map((moduleCode) => (
                      <span
                        key={moduleCode}
                        className="rounded-full bg-teal-50 px-3 py-1 text-xs font-medium text-teal-700"
                      >
                        {MODULE_CODE_TO_NAME[moduleCode] || moduleCode}
                      </span>
                    ))}
                    {school.modules.length > 3 && (
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                        +{school.modules.length - 3} more
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-5 text-slate-600">
                  {school.adminUsername}
                </td>
                <td className="px-6 py-5 text-right">
                  <div className="relative flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => onToggleStatus?.(school)}
                      className="rounded-lg p-2 hover:bg-slate-100"
                      title={
                        school.status === "ACTIVE" ? "Deactivate" : "Activate"
                      }
                    >
                      {school.status === "ACTIVE" ? (
                        <PowerOff size={16} className="text-red-500" />
                      ) : (
                        <Power size={16} className="text-green-500" />
                      )}
                    </button>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() =>
                          setOpenMenuId(
                            openMenuId === school.id ? null : school.id,
                          )
                        }
                        className="rounded-lg p-2 hover:bg-slate-100"
                      >
                        <MoreVertical size={16} className="text-slate-600" />
                      </button>
                      {openMenuId === school.id && (
                        <div className="absolute right-0 top-full z-20 mt-1 w-44 rounded-xl border border-slate-200 bg-white shadow-xl">
                          <button
                            type="button"
                            onClick={() => {
                              onEdit?.(school);
                              setOpenMenuId(null);
                            }}
                            className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
                          >
                            <Edit size={16} />
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              onDelete?.(school);
                              setOpenMenuId(null);
                            }}
                            className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
                          >
                            <Trash2 size={16} />
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
