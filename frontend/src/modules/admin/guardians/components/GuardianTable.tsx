import type { Guardian } from "../types/guardian.types";

interface GuardianTableProps {
  guardians: Guardian[];
  loading: boolean;
  onView: (id: number) => void;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  onRestore: (id: number) => void;
}

const statusColors: Record<string, string> = {
  ACTIVE: "bg-green-100 text-green-700",
  INACTIVE: "bg-gray-100 text-gray-700",
};

export default function GuardianTable({ guardians, loading, onView, onEdit, onDelete, onRestore }: GuardianTableProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
        <table className="w-full min-w-[1100px] text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3 text-left">SN</th>
              <th className="p-3 text-left">Guardian Name</th>
              <th className="p-3 text-left">Relationship</th>
              <th className="p-3 text-left">Phone</th>
              <th className="p-3 text-left">Email</th>
              <th className="p-3 text-left">Occupation</th>
              <th className="p-3 text-left">Children</th>
              <th className="p-3 text-left">Communication</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 5 }).map((_, i) => (
              <tr key={i} className="border-t">
                <td className="p-3" colSpan={10}>
                  <div className="h-4 bg-gray-100 rounded w-full animate-pulse" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
      <table className="w-full min-w-[1100px] text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="p-3 text-left">SN</th>
            <th className="p-3 text-left">Guardian Name</th>
            <th className="p-3 text-left">Relationship</th>
            <th className="p-3 text-left">Phone</th>
            <th className="p-3 text-left">Email</th>
            <th className="p-3 text-left">Occupation</th>
            <th className="p-3 text-left">Children</th>
            <th className="p-3 text-left">Communication</th>
            <th className="p-3 text-left">Status</th>
            <th className="p-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {guardians.map((guardian, index) => (
            <tr key={guardian.id} className="border-t">
              <td className="p-3">{index + 1}</td>
              <td className="p-3">
                <button onClick={() => onView(guardian.id)} className="text-[#234A91] font-medium">
                  {guardian.fullName}
                </button>
              </td>
              <td className="p-3">{guardian.relationship}</td>
              <td className="p-3">{guardian.phone}</td>
              <td className="p-3">{guardian.email}</td>
              <td className="p-3">{guardian.occupation}</td>
              <td className="p-3">{guardian.childrenCount}</td>
              <td className="p-3">{guardian.communicationPreference}</td>
              <td className="p-3">
                <span className={`px-2 py-1 rounded-full text-xs ${statusColors[guardian.status] || statusColors.ACTIVE}`}>
                  {guardian.status}
                </span>
              </td>
              <td className="p-3 text-right space-x-3">
                {guardian.deleted ? (
                  <button onClick={() => onRestore(guardian.id)} className="text-green-700 hover:underline">
                    Restore
                  </button>
                ) : (
                  <>
                    <button onClick={() => onView(guardian.id)} className="text-[#234A91] hover:underline">
                      View
                    </button>
                    <button onClick={() => onEdit(guardian.id)} className="text-[#234A91] hover:underline">
                      Edit
                    </button>
                    <button onClick={() => onDelete(guardian.id)} className="text-red-600 hover:underline">
                      Delete
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
          {!loading && guardians.length === 0 && (
            <tr>
              <td colSpan={10} className="p-10 text-center text-gray-500">
                No guardians found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
