import { useEffect, useState } from "react";
import StudentLayout from "../../layouts/StudentLayout";
import PageHeader from "../../components/layout/PageHeader";
import ErrorState from "../../components/feedback/ErrorState";
import Skeleton from "../../components/Skeleton";
import { errorMessage } from "../../modules/admin/attendance/attendance.service";
import type { StudentAttendanceRow } from "../../modules/admin/attendance/attendance.types";
import { getMyAttendance, summarizeAttendance } from "../../modules/attendance/service";
import { StatusBadge, SummaryCards } from "../../modules/attendance/components";

const currentMonth = new Date().toISOString().slice(0, 7);

export default function StudentAttendance() {
  const [month, setMonth] = useState(currentMonth);
  const [rows, setRows] = useState<StudentAttendanceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    getMyAttendance(month).then((result) => {
      if (active) setRows(result.items);
    }).catch((requestError) => {
      if (!active) return;
      setRows([]);
      setError(errorMessage(requestError));
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, [month]);

  const reload = async () => {
    setLoading(true);
    setError("");
    try {
      setRows((await getMyAttendance(month)).items);
    } catch (requestError) {
      setRows([]);
      setError(errorMessage(requestError));
    } finally {
      setLoading(false);
    }
  };
  const summary = summarizeAttendance(rows.map((row, index) => ({ id: row.id ?? index, studentId: row.studentId, attendanceDate: row.date ?? "", status: row.status, remarks: row.remarks })));

  return (
    <StudentLayout>
      <PageHeader title="My Attendance" subtitle="Your monthly attendance summary and daily history." action={<label className="text-sm font-medium text-gray-700">Month<input type="month" value={month} max={currentMonth} onChange={(event) => { setLoading(true); setError(""); setMonth(event.target.value); }} className="ml-2 rounded-lg border border-gray-300 px-3 py-2" /></label>} />
      {loading ? <Skeleton className="h-72" /> : error ? <div className="rounded-xl bg-white"><ErrorState title="Attendance unavailable" description={error} onRetry={reload} /></div> : <div className="space-y-5"><SummaryCards summary={summary} /><section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"><div className="border-b border-gray-200 p-4"><h2 className="font-semibold text-gray-800">Daily history</h2></div>{rows.length ? <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-gray-50 text-gray-600"><tr><th className="px-4 py-3">Date</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Remarks</th></tr></thead><tbody className="divide-y divide-gray-100">{rows.map((row, index) => <tr key={row.id ?? `${row.date}-${index}`}><td className="px-4 py-3 font-medium text-gray-800">{row.date ? new Date(`${row.date}T00:00:00`).toLocaleDateString() : "-"}</td><td className="px-4 py-3"><StatusBadge status={row.status} /></td><td className="px-4 py-3 text-gray-600">{row.remarks || "-"}</td></tr>)}</tbody></table></div> : <p className="p-10 text-center text-sm text-gray-500">No attendance records for this month.</p>}</section></div>}
    </StudentLayout>
  );
}
