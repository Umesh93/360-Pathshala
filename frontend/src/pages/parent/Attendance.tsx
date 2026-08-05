import { useEffect, useState } from "react";
import ParentLayout from "../../layouts/ParentLayout";
import PageHeader from "../../components/layout/PageHeader";
import ErrorState from "../../components/feedback/ErrorState";
import Skeleton from "../../components/Skeleton";
import { errorMessage } from "../../modules/admin/attendance/attendance.service";
import { getMyChildrenAttendance, summarizeAttendance } from "../../modules/attendance/service";
import type { Child } from "../../modules/attendance/types";
import { StatusBadge, SummaryCards } from "../../modules/attendance/components";

const currentMonth = new Date().toISOString().slice(0, 7);

export default function ParentAttendance() {
  const [month, setMonth] = useState(currentMonth);
  const [children, setChildren] = useState<Child[]>([]);
  const [selected, setSelected] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const applyChildren = (records: Child[]) => {
    setChildren(records);
    setSelected((current) => records.some((child) => child.id === current) ? current : (records[0]?.id ?? 0));
  };

  useEffect(() => {
    let active = true;
    getMyChildrenAttendance(month).then((records) => {
      if (active) applyChildren(records);
    }).catch((requestError) => {
      if (!active) return;
      setChildren([]);
      const message = errorMessage(requestError);
      setError(message.toLowerCase().includes("forbidden") ? "Your account is not linked to a student, or you do not have permission to view child attendance." : message);
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, [month]);

  const reload = async () => {
    setLoading(true);
    setError("");
    try {
      const records = await getMyChildrenAttendance(month);
      applyChildren(records);
    } catch (requestError) {
      setChildren([]);
      const message = errorMessage(requestError);
      setError(message.toLowerCase().includes("forbidden") ? "Your account is not linked to a student, or you do not have permission to view child attendance." : message);
    } finally {
      setLoading(false);
    }
  };
  const child = children.find((item) => item.id === selected);
  const records = child?.attendance ?? [];
  const summary = summarizeAttendance(records);

  return (
    <ParentLayout>
      <PageHeader title="Child Attendance" subtitle="Attendance for students linked to your guardian account." action={<label className="text-sm font-medium text-gray-700">Month<input type="month" value={month} max={currentMonth} onChange={(event) => { setLoading(true); setError(""); setMonth(event.target.value); }} className="ml-2 rounded-lg border border-gray-300 px-3 py-2" /></label>} />
      {loading ? <Skeleton className="h-72" /> : error ? <div className="rounded-xl bg-white"><ErrorState title="Child attendance unavailable" description={error} onRetry={reload} /></div> : !children.length ? <div className="rounded-xl bg-white"><ErrorState title="No linked students" description="No students are linked to this guardian account." /></div> : <div className="space-y-5"><div className="flex flex-wrap gap-2">{children.map((item) => <button type="button" key={item.id} onClick={() => setSelected(item.id)} className={`rounded-lg border px-4 py-2 text-sm font-medium ${item.id === selected ? "border-[#234A91] bg-[#234A91] text-white" : "border-gray-300 bg-white text-gray-700"}`}>{item.firstName} {item.lastName}</button>)}</div>{child && <><div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"><h2 className="font-semibold text-gray-800">{child.firstName} {child.lastName}</h2><p className="text-sm text-gray-500">{[child.className, child.sectionName].filter(Boolean).join(" - ") || "Class not assigned"}</p></div><SummaryCards summary={summary} /><section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"><div className="border-b border-gray-200 p-4"><h2 className="font-semibold text-gray-800">Daily history</h2></div>{records.length ? <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-gray-50 text-gray-600"><tr><th className="px-4 py-3">Date</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Remarks</th></tr></thead><tbody className="divide-y divide-gray-100">{records.map((record) => <tr key={record.id}><td className="px-4 py-3 font-medium text-gray-800">{new Date(`${record.attendanceDate}T00:00:00`).toLocaleDateString()}</td><td className="px-4 py-3"><StatusBadge status={record.status} /></td><td className="px-4 py-3 text-gray-600">{record.remarks || "-"}</td></tr>)}</tbody></table></div> : <p className="p-10 text-center text-sm text-gray-500">No attendance records for this month.</p>}</section></>}</div>}
    </ParentLayout>
  );
}
