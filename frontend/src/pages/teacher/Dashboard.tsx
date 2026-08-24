import { useEffect, useState } from "react";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  FileText,
  MapPin,
  School,
} from "lucide-react";
import { Link } from "react-router-dom";

import ErrorState from "../../components/feedback/ErrorState";
import Skeleton from "../../components/Skeleton";
import TeacherLayout from "../../layouts/TeacherLayout";
import { getTeacherDashboard } from "../../services/dashboardService";
import type { TeacherDashboardResponse } from "../../types/dashboard";
import { getTeacherSchedule } from "../../modules/timetables/service";
import type { ScheduleResponse } from "../../modules/timetables/types";

const formatDate = (value: string | null) =>
  value
    ? new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(
        new Date(value),
      )
    : "No due date";

const TeacherDashboard = () => {
  const [data, setData] = useState<TeacherDashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [schedule, setSchedule] = useState<ScheduleResponse>();
  const [scheduleLoading, setScheduleLoading] = useState(false);

  useEffect(() => {
    let active = true;
    getTeacherDashboard()
      .then(async (response) => {
        if (!active) return;
        setData(response);
        if (response.modules.includes("TIMETABLE")) {
          setScheduleLoading(true);
          try {
            const timetable = await getTeacherSchedule();
            if (active) setSchedule(timetable);
          } catch {
            if (active) setSchedule(undefined);
          } finally {
            if (active) setScheduleLoading(false);
          }
        }
      })
      .catch(() => active && setError("Failed to load dashboard data."))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return (
      <TeacherLayout>
        <div className="space-y-6">
          <Skeleton className="h-28 w-full" />
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-28" />
            ))}
          </div>
          <Skeleton className="h-72 w-full" />
        </div>
      </TeacherLayout>
    );
  }

  if (error || !data) {
    return (
      <TeacherLayout>
        <ErrorState
          description={error || "Dashboard data is unavailable."}
          onRetry={() => window.location.reload()}
        />
      </TeacherLayout>
    );
  }

  const modules = new Set(data.modules);
  const classes = new Set(
    data.teachingAssignments.map(
      (assignment) => `${assignment.classId}:${assignment.sectionId}`,
    ),
  );
  const subjects = new Set(
    data.teachingAssignments.map((assignment) => assignment.subjectId),
  );
  const upcomingClasses = schedule?.todayEntries.length
    ? schedule.todayEntries
    : schedule?.tomorrowEntries || [];
  const scheduleLabel = schedule?.todayEntries.length
    ? "Today"
    : schedule?.tomorrowEntries.length
      ? "Tomorrow"
      : "No classes";
  const quickActions = [
    ...(modules.has("ATTENDANCE")
      ? [{ label: "Mark Attendance", to: "/teacher/attendance", icon: ClipboardCheck }]
      : []),
    ...(modules.has("ASSIGNMENT")
      ? [{ label: "Assignments", to: "/teacher/assignments", icon: FileText }]
      : []),
    ...(modules.has("EXAMINATION")
      ? [{ label: "Enter Marks", to: "/teacher/marks", icon: CheckCircle2 }]
      : []),
    ...(modules.has("TIMETABLE")
      ? [{ label: "My Timetable", to: "/teacher/timetable", icon: CalendarDays }]
      : []),
  ];
  const cards = [
    {
      label: "Classes",
      value: String(classes.size),
      detail: `${subjects.size} unique subject${subjects.size === 1 ? "" : "s"}`,
      icon: School,
      to: null,
    },
    ...(modules.has("ATTENDANCE")
      ? [
          {
            label: "Today's Attendance",
            value: data.teacherAttendance?.status || "Unavailable",
            detail: data.teacherAttendance
              ? [
                  data.teacherAttendance.checkIn,
                  data.teacherAttendance.checkOut,
                ]
                  .filter(Boolean)
                  .join(" - ") || "No check-in time recorded"
              : "No attendance record available",
            icon: ClipboardCheck,
            to: "/teacher/attendance",
          },
        ]
      : []),
    ...(modules.has("ASSIGNMENT") && data.assignments
      ? [
          {
            label: "Assignments",
            value: String(data.assignments.pending),
            detail: `${data.assignments.count} total, pending review shown`,
            icon: FileText,
            to: "/teacher/assignments",
          },
        ]
      : []),
    ...(modules.has("EXAMINATION") && data.examinations
      ? [
          {
            label: "Exam Assignments",
            value: String(data.examinations.count),
            detail: "Assigned examination subjects",
            icon: CheckCircle2,
            to: "/teacher/marks",
          },
        ]
      : []),
    ...(modules.has("TIMETABLE")
      ? [
          {
            label: "Today's Classes",
            value: scheduleLoading ? "..." : scheduleLabel,
            detail: scheduleLoading
              ? "Checking your timetable"
              : `${upcomingClasses.length} scheduled ${upcomingClasses.length === 1 ? "period" : "periods"}`,
            icon: CalendarDays,
            to: "/teacher/timetable",
          },
        ]
      : []),
  ];

  return (
    <TeacherLayout>
      <div className="min-w-0 space-y-6">
        <section className="flex flex-col gap-4 rounded-lg bg-[#234A91] p-5 text-white sm:flex-row sm:items-center sm:justify-between md:p-6">
          <div className="flex min-w-0 items-center gap-4">
            {data.profile.photo ? (
              <img
                src={data.profile.photo}
                alt=""
                className="h-16 w-16 shrink-0 rounded-full border-2 border-white/60 object-cover"
              />
            ) : (
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-white/15 text-2xl font-semibold">
                {data.profile.displayName.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="min-w-0">
              <p className="text-sm text-blue-100">Welcome back</p>
              <h1 className="truncate text-2xl font-bold md:text-3xl">
                {data.profile.displayName}
              </h1>
              <p className="mt-1 text-sm text-blue-100">
                {[data.profile.department, data.profile.employeeNumber]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            </div>
          </div>
          <div className="text-sm sm:text-right">
            <p className="font-semibold">{data.context.schoolName}</p>
            <p className="text-blue-100">
              {data.context.academicSessionName || "No active session"}
            </p>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {cards.map(({ label, value, detail, icon: Icon, to }) => (
            <div key={label} className="rounded-lg bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-gray-500">{label}</p>
                <Icon className="text-[#234A91]" size={21} />
              </div>
              <p className="mt-3 break-words text-2xl font-bold text-gray-900">
                {value}
              </p>
              <p className="mt-1 text-sm text-gray-500">{detail}</p>
              {to && (
                <Link
                  to={to}
                  className="mt-3 inline-block text-sm font-medium text-[#234A91]"
                >
                  Open {label.toLowerCase()}
                </Link>
              )}
            </div>
          ))}
        </section>

        {quickActions.length > 0 && (
          <section className="rounded-lg bg-white p-5 shadow-sm">
            <div className="mb-4">
              <h2 className="font-semibold text-gray-900">Quick Actions</h2>
              <p className="mt-1 text-sm text-gray-500">
                Open your current teaching workflows.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {quickActions.map((action) => (
                <Link
                  key={action.to}
                  to={action.to}
                  className="group flex items-center justify-between rounded-lg border border-gray-200 p-4 transition hover:border-[#234A91] hover:bg-blue-50/50"
                >
                  <span className="flex items-center gap-3 font-medium text-gray-800">
                    <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-[#234A91]">
                      <action.icon size={20} />
                    </span>
                    {action.label}
                  </span>
                  <ArrowRight className="text-gray-400 group-hover:text-[#234A91]" size={18} />
                </Link>
              ))}
            </div>
          </section>
        )}

        <section className="overflow-hidden rounded-lg bg-white shadow-sm">
          <div className="border-b border-gray-100 px-5 py-4">
            <h2 className="font-semibold text-gray-900">
              Teaching Assignments
            </h2>
            <p className="text-sm text-gray-500">
              Classes, sections, and subjects for the active session
            </p>
          </div>
          {data.teachingAssignments.length ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <th className="px-5 py-3">Class</th>
                    <th className="px-5 py-3">Section</th>
                    <th className="px-5 py-3">Subject</th>
                    <th className="px-5 py-3">Subject Code</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data.teachingAssignments.map((assignment) => (
                    <tr
                      key={`${assignment.classId}-${assignment.sectionId}-${assignment.subjectId}`}
                    >
                      <td className="px-5 py-3 font-medium text-gray-900">
                        {assignment.className}
                      </td>
                      <td className="px-5 py-3">{assignment.sectionName}</td>
                      <td className="px-5 py-3">{assignment.subjectName}</td>
                      <td className="px-5 py-3 text-gray-500">
                        {assignment.subjectCode}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="px-5 py-10 text-center text-sm text-gray-500">
              No teaching assignments are available for the active session.
            </p>
          )}
        </section>

        <div className="grid min-w-0 gap-6 xl:grid-cols-2">
          {modules.has("TIMETABLE") && <section className="min-w-0 rounded-lg bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <CalendarDays size={20} className="text-[#234A91]" />
              <h2 className="font-semibold text-gray-900">Today's Classes</h2>
            </div>
            {scheduleLoading ? (
              <Skeleton className="mt-4 h-32" />
            ) : upcomingClasses.length === 0 ? (
              <div className="py-10 text-center">
                <p className="font-medium text-gray-700">
                  No timetable available yet
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  Open My Timetable to view your complete weekly schedule.
                </p>
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                {upcomingClasses.slice(0, 4).map((entry) => (
                  <article key={`${entry.dayOfWeek}-${entry.periodId}`} className="rounded-lg border border-gray-200 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-gray-900">{entry.subjectName || entry.periodName}</p>
                        <p className="mt-1 text-sm text-gray-600">{entry.className} · {entry.sectionName}</p>
                      </div>
                      <span className="rounded bg-blue-50 px-2 py-1 text-xs font-medium text-[#234A91]">{scheduleLabel}</span>
                    </div>
                    <p className="mt-3 flex items-center gap-2 text-sm text-gray-600"><Clock3 size={15} /> {entry.startTime} - {entry.endTime}</p>
                    {entry.room && <p className="mt-2 flex items-center gap-2 text-sm text-gray-500"><MapPin size={15} /> {entry.room}</p>}
                  </article>
                ))}
              </div>
            )}
          </section>}

          {modules.has("ASSIGNMENT") && data.assignments && (
            <section className="min-w-0 rounded-lg bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="font-semibold text-gray-900">
                  Recent Assignments
                </h2>
                <Link
                  to="/teacher/assignments"
                  className="text-sm font-medium text-[#234A91]"
                >
                  View all
                </Link>
              </div>
              <div className="divide-y divide-gray-100">
                {data.assignments.recent.length ? (
                  data.assignments.recent.map((assignment) => (
                    <div key={assignment.id} className="py-3 first:pt-0">
                      <div className="flex items-start justify-between gap-3">
                        <p className="min-w-0 font-medium text-gray-900">
                          {assignment.title}
                        </p>
                        <span className="shrink-0 rounded bg-gray-100 px-2 py-1 text-xs text-gray-600">
                          {assignment.status}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-gray-500">
                        Due {formatDate(assignment.dueAt)}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="py-8 text-center text-sm text-gray-500">
                    No recent assignments.
                  </p>
                )}
              </div>
            </section>
          )}
        </div>

        {modules.has("EXAMINATION") && data.examinations && (
          <section className="rounded-lg bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="font-semibold text-gray-900">
                  Recent Exam Assignments
                </h2>
                <p className="text-sm text-gray-500">
                  Assigned subjects and publication state
                </p>
              </div>
              <Link
                to="/teacher/marks"
                className="shrink-0 text-sm font-medium text-[#234A91]"
              >
                Open marks
              </Link>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {data.examinations.recent.length ? (
                data.examinations.recent.map((exam) => (
                  <div
                    key={exam.examSubjectId}
                    className="rounded-lg border border-gray-200 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900">
                          {exam.examName}
                        </p>
                        <p className="text-sm text-gray-600">
                          {exam.subjectName}
                        </p>
                      </div>
                      <span className="shrink-0 text-xs font-medium text-gray-500">
                        {exam.published ? "Published" : "Not published"}
                      </span>
                    </div>
                    <p className="mt-3 text-sm text-gray-500">
                      {exam.className} · {exam.sectionName} ·{" "}
                      {formatDate(exam.examDate)}
                    </p>
                  </div>
                ))
              ) : (
                <p className="py-8 text-sm text-gray-500">
                  No exam assignments are available.
                </p>
              )}
            </div>
          </section>
        )}
      </div>
    </TeacherLayout>
  );
};

export default TeacherDashboard;
