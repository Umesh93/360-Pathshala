import type { AttendanceStatus, AttendanceSummary } from "./types";

const statusClasses: Record<AttendanceStatus, string> = {
  PRESENT: "bg-emerald-50 text-emerald-700",
  ABSENT: "bg-red-50 text-red-700",
  LATE: "bg-amber-50 text-amber-700",
  LEAVE: "bg-blue-50 text-blue-700",
};

export const StatusBadge = ({ status }: { status: AttendanceStatus }) => (
  <span
    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusClasses[status]}`}
  >
    {status.charAt(0) + status.slice(1).toLowerCase()}
  </span>
);

export const SummaryCards = ({ summary }: { summary: AttendanceSummary }) => {
  const items = [
    ["Attendance rate", `${summary.percentage}%`],
    ["Present", summary.present],
    ["Absent", summary.absent],
    ["Late", summary.late],
    ["Leave", summary.leave],
  ];
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
      {items.map(([label, value]) => (
        <div
          key={label}
          className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
        >
          <p className="text-sm text-gray-500">{label}</p>
          <p className="mt-1 text-2xl font-bold text-gray-800">{value}</p>
        </div>
      ))}
    </div>
  );
};
