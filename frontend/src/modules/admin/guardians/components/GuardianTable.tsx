import ActionMenu from "@/components/common/ActionMenu";
import type { Guardian } from "../types/guardian.types";
import GuardianStatusBadge from "./GuardianStatusBadge";

interface GuardianTableProps {
  guardians: Guardian[];
  page: number;
  pageSize: number;
  onView: (id: number) => void;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  onRestore: (id: number) => void;
  onPrint: (id: number) => void;
  onDownload: (id: number) => void;
}

export default function GuardianTable({
  guardians,
  page,
  pageSize,
  onView,
  onEdit,
  onDelete,
  onRestore,
  onPrint,
  onDownload,
}: GuardianTableProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
      <table className="w-full min-w-[960px] text-sm">
        <thead className="bg-gray-50 text-gray-600">
          <tr>
            <th className="p-3 text-left">SN</th>
            <th className="p-3 text-left">Guardian ID</th>
            <th className="p-3 text-left">Name</th>
            <th className="p-3 text-left">Contact</th>
            <th className="p-3 text-left">Relationship</th>
            <th className="p-3 text-left">Occupation</th>
            <th className="p-3 text-left">Children</th>
            <th className="p-3 text-left">Status</th>
            <th className="p-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {guardians.map((guardian, index) => (
            <tr key={guardian.id} className="border-t hover:bg-gray-50">
              <td className="p-3">{(page - 1) * pageSize + index + 1}</td>
              <td className="p-3 font-medium text-gray-700">
                {guardian.guardianCode}
              </td>
              <td className="p-3">
                <button
                  onClick={() => onView(guardian.id)}
                  className="text-[#234A91] font-medium text-left"
                >
                  {guardian.fullName}
                </button>
                <p className="text-xs text-gray-500 capitalize">
                  {guardian.gender || "-"}
                </p>
              </td>
              <td className="p-3">
                <p>{guardian.mobile || guardian.phone || "-"}</p>
                <p className="text-xs text-gray-500">{guardian.email || "-"}</p>
              </td>
              <td className="p-3">{guardian.relationship || "-"}</td>
              <td className="p-3">{guardian.occupation || "-"}</td>
              <td className="p-3">{guardian.childrenCount}</td>
              <td className="p-3">
                <GuardianStatusBadge
                  status={guardian.deleted ? "DELETED" : guardian.status}
                />
              </td>
              <td className="p-3 text-right">
                <ActionMenu
                  id={guardian.id}
                  onView={guardian.deleted ? undefined : onView}
                  onEdit={guardian.deleted ? undefined : onEdit}
                  onDelete={guardian.deleted ? undefined : onDelete}
                  onRestore={guardian.deleted ? onRestore : undefined}
                  onPrint={onPrint}
                  onDownload={onDownload}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
