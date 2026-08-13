import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import AdminLayout from "../../../layouts/AdminLayout";
import PageHeader from "../../../components/layout/PageHeader";
import {
  BarChart3,
  CalendarDays,
  CheckSquare,
  ClipboardCheck,
  FileClock,
  FileDown,
  History,
  Settings,
  Users,
} from "lucide-react";
import { getAttendanceLookups } from "./attendance.service";
import type { Option } from "./attendance.types";
import DashboardView from "./views/DashboardView";
import StudentAttendanceView from "./views/StudentAttendanceView";
import TeacherAttendanceView from "./views/TeacherAttendanceView";
import HistoryView from "./views/HistoryView";
import ReportsView from "./views/ReportsView";
import HolidayView from "./views/HolidayView";
import CorrectionsView from "./views/CorrectionsView";
import SettingsView from "./views/SettingsView";

export interface Lookups {
  sessions: Option[];
  classes: Option[];
  sections: Option[];
}
const tabs = [
  ["dashboard", "Dashboard", BarChart3],
  ["students", "Student Attendance", Users],
  ["teachers", "Teacher Attendance", ClipboardCheck],
  ["history", "History", History],
  ["reports", "Reports", FileDown],
  ["holidays", "Holiday Calendar", CalendarDays],
  ["corrections", "Corrections", FileClock],
  ["settings", "Settings", Settings],
] as const;
type Tab = (typeof tabs)[number][0];

export default function AttendanceWorkspace() {
  const [params, setParams] = useSearchParams();
  const requested = params.get("view");
  const active: Tab = tabs.some(([key]) => key === requested)
    ? (requested as Tab)
    : "dashboard";
  const [lookups, setLookups] = useState<Lookups>({
    sessions: [],
    classes: [],
    sections: [],
  });
  useEffect(() => {
    getAttendanceLookups()
      .then(setLookups)
      .catch(() => undefined);
  }, []);
  const select = (tab: Tab) => {
    const next = new URLSearchParams(params);
    next.set("view", tab);
    setParams(next, { replace: true });
  };
  return (
    <AdminLayout>
      <PageHeader
        title="Attendance"
        subtitle="Monitor, record, and report attendance across your school"
        breadcrumbs={[
          { label: "Dashboard", href: "/admin/dashboard" },
          { label: "Attendance" },
        ]}
        action={
          <div className="hidden sm:flex h-11 w-11 items-center justify-center rounded-xl bg-[#234A91] text-white">
            <CheckSquare size={22} />
          </div>
        }
      />
      <div className="mb-5 overflow-x-auto rounded-xl border border-gray-200 bg-white p-1.5 shadow-sm">
        <nav aria-label="Attendance sections" className="flex min-w-max gap-1">
          {tabs.map(([key, label, Icon]) => (
            <button
              key={key}
              type="button"
              onClick={() => select(key)}
              aria-current={active === key ? "page" : undefined}
              className={`flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition ${active === key ? "bg-[#234A91] text-white shadow-sm" : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"}`}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </nav>
      </div>
      {active === "dashboard" && <DashboardView />}
      {active === "students" && <StudentAttendanceView lookups={lookups} />}
      {active === "teachers" && <TeacherAttendanceView />}
      {active === "history" && <HistoryView lookups={lookups} />}
      {active === "reports" && <ReportsView lookups={lookups} />}
      {active === "holidays" && <HolidayView />}
      {active === "corrections" && <CorrectionsView />}
      {active === "settings" && <SettingsView />}
    </AdminLayout>
  );
}
