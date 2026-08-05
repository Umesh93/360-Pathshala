import { useEffect, useState } from "react";
import { Area, AreaChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { CalendarCheck, Clock3, UserCheck, UserX } from "lucide-react";
import { errorMessage, getDashboard } from "../attendance.service";
import type { DashboardData } from "../attendance.types";
import { cardClass, ErrorBanner, Loading, today } from "../components/AttendanceUi";

const colors = ["#16a34a", "#dc2626", "#d97706", "#2563eb"];
export default function DashboardView() {
  const [date, setDate] = useState(today()); const [data, setData] = useState<DashboardData>(); const [error, setError] = useState(""); const [loading, setLoading] = useState(true); const [reload, setReload] = useState(0);
  useEffect(() => { let active = true; getDashboard(date).then((value) => active && setData(value)).catch((value) => active && setError(errorMessage(value))).finally(() => active && setLoading(false)); return () => { active = false; }; }, [date, reload]);
  if (loading) return <Loading label="Loading attendance dashboard..." />;
  if (error) return <ErrorBanner message={error} onRetry={() => { setError(""); setLoading(true); setReload((value) => value + 1); }} />;
  if (!data) return null;
  const stats = [["Students Present Today", data.present, UserCheck, "text-emerald-600 bg-emerald-50"], ["Students Absent Today", data.absent, UserX, "text-red-600 bg-red-50"], ["Teachers Present Today", data.teachersPresent, UserCheck, "text-emerald-600 bg-emerald-50"], ["Teachers Absent Today", data.teachersAbsent, UserX, "text-red-600 bg-red-50"], ["Late Arrivals", data.late, Clock3, "text-amber-600 bg-amber-50"], ["Approved Leaves", data.approvedLeaves, CalendarCheck, "text-blue-600 bg-blue-50"], ["Attendance Percentage", `${data.rate}%`, CalendarCheck, "text-blue-600 bg-blue-50"]] as const;
  return <div className="space-y-5">
    <div className="flex justify-end"><label className="flex items-center gap-2 text-sm text-gray-600">Reporting date<input aria-label="Dashboard date" type="date" value={date} max={today()} onChange={(event) => { setLoading(true); setError(""); setDate(event.target.value); }} className="h-10 rounded-lg border border-gray-200 bg-white px-3" /></label></div>
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">{stats.map(([label, value, Icon, style]) => <div className={`${cardClass} p-5`} key={label}><div className="flex items-center justify-between"><div><p className="text-sm text-gray-500">{label}</p><p className="mt-2 text-2xl font-bold text-gray-900">{value}</p></div><span className={`rounded-xl p-3 ${style}`}><Icon size={22} /></span></div></div>)}</div>
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
      <section className={`${cardClass} p-5 xl:col-span-2`}><h2 className="font-semibold text-gray-900">Attendance Trend</h2><p className="mb-4 text-sm text-gray-500">Present and absent students over time</p><div className="h-72"><ResponsiveContainer width="100%" height="100%"><AreaChart data={data.trend}><defs><linearGradient id="presentFill" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#234A91" stopOpacity={0.25}/><stop offset="95%" stopColor="#234A91" stopOpacity={0}/></linearGradient></defs><CartesianGrid strokeDasharray="3 3" vertical={false}/><XAxis dataKey="label" fontSize={12}/><YAxis fontSize={12}/><Tooltip/><Area type="monotone" dataKey="present" stroke="#234A91" fill="url(#presentFill)" strokeWidth={2}/><Area type="monotone" dataKey="absent" stroke="#dc2626" fill="transparent" strokeWidth={2}/></AreaChart></ResponsiveContainer></div></section>
      <section className={`${cardClass} p-5`}><h2 className="font-semibold text-gray-900">Today&apos;s Distribution</h2><p className="mb-4 text-sm text-gray-500">{data.total} recorded students</p><div className="h-56"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={data.distribution} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={3}>{data.distribution.map((item, index) => <Cell key={item.name} fill={colors[index]} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer></div><div className="grid grid-cols-2 gap-2">{data.distribution.map((item, index) => <div key={item.name} className="flex items-center justify-between text-sm"><span className="flex items-center gap-2 text-gray-600"><span className="h-2.5 w-2.5 rounded-full" style={{ background: colors[index] }}/>{item.name}</span><b>{item.value}</b></div>)}</div></section>
    </div>
  </div>;
}
