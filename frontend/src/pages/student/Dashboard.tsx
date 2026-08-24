import { useEffect, useState } from "react";
import {
  ArrowRight,
  Award,
  CalendarDays,
  ClipboardCheck,
  Clock3,
  FileText,
  GraduationCap,
  MapPin,
} from "lucide-react";
import { Link } from "react-router-dom";

import ErrorState from "../../components/feedback/ErrorState";
import Skeleton from "../../components/Skeleton";
import StudentLayout from "../../layouts/StudentLayout";
import { getStudentDashboard } from "../../services/dashboardService";
import type { StudentDashboardResponse } from "../../types/dashboard";
import { getStudentSchedule } from "../../modules/timetables/service";
import type { ScheduleResponse } from "../../modules/timetables/types";
import { getStudentAssignments } from "../../modules/assignments/service";
import type { StudentAssignment } from "../../modules/assignments/types";

const formatDate = (value: string | null) =>
  value
    ? new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(
        new Date(value),
      )
    : "No due date";

const StudentDashboard = () => {
  const [data, setData] = useState<StudentDashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [schedule, setSchedule] = useState<ScheduleResponse>();
  const [scheduleLoading, setScheduleLoading] = useState(false);
  const [studentAssignments, setStudentAssignments] = useState<StudentAssignment[]>();
  const [assignmentsLoading, setAssignmentsLoading] = useState(false);

  useEffect(() => {
    let active = true;
    getStudentDashboard()
      .then(async (response) => {
        if (!active) return;
        setData(response);
        if (response.modules.includes("ASSIGNMENT")) {
          setAssignmentsLoading(true);
          try {
            const assignments = await getStudentAssignments();
            if (active) setStudentAssignments(assignments);
          } catch {
            if (active) setStudentAssignments(undefined);
          } finally {
            if (active) setAssignmentsLoading(false);
          }
        }
        if (response.modules.includes("TIMETABLE")) {
          setScheduleLoading(true);
          try {
            const timetable = await getStudentSchedule();
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
      <StudentLayout>
        <div className="space-y-6">
          <Skeleton className="h-28 w-full" />
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-28" />
            ))}
          </div>
        </div>
      </StudentLayout>
    );
  }

  if (error || !data) {
    return (
      <StudentLayout>
        <ErrorState
          description={error || "Dashboard data is unavailable."}
          onRetry={() => window.location.reload()}
        />
      </StudentLayout>
    );
  }

  const modules = new Set(data.modules);
  const classLabel = [data.className, data.sectionName]
    .filter(Boolean)
    .join(" · ");
  const result = data.results?.latestResult;
  const visibleAssignments = studentAssignments ?? [];
  const pendingAssignments = visibleAssignments.filter((item) =>
    ["PENDING", "RETURNED"].includes(item.submission?.status ?? "PENDING"),
  ).length;
  const upcomingClasses = schedule?.todayEntries.length
    ? schedule.todayEntries
    : schedule?.tomorrowEntries || [];
  const scheduleLabel = schedule?.todayEntries.length
    ? "Today"
    : schedule?.tomorrowEntries.length
      ? "Tomorrow"
      : "No classes";
  const quickActions = [
    ...(modules.has("ASSIGNMENT")
      ? [{ label: "My Assignments", to: "/student/assignments", icon: FileText }]
      : []),
    ...(modules.has("ATTENDANCE")
      ? [{ label: "My Attendance", to: "/student/attendance", icon: ClipboardCheck }]
      : []),
    ...(modules.has("EXAMINATION")
      ? [{ label: "My Results", to: "/student/results", icon: Award }]
      : []),
    ...(modules.has("TIMETABLE")
      ? [{ label: "My Timetable", to: "/student/timetable", icon: CalendarDays }]
      : []),
  ];

  return (
    <StudentLayout>
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
                {classLabel || "Class and section not assigned"}
              </p>
            </div>
          </div>
          <div className="text-sm sm:text-right">
            <p className="font-semibold">{data.context.schoolName}</p>
            <p className="text-blue-100">
              {data.academicSessionName ||
                data.context.academicSessionName ||
                "No active session"}
            </p>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {modules.has("ATTENDANCE") && data.attendance && (
            <div className="rounded-lg bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-500">Attendance</p>
                <ClipboardCheck className="text-[#234A91]" size={21} />
              </div>
              <p className="mt-3 text-2xl font-bold text-gray-900">
                {data.attendance.percentage}%
              </p>
              <p className="mt-1 text-sm text-gray-500">
                {data.attendance.present} present · {data.attendance.absent}{" "}
                absent
              </p>
            </div>
          )}
          {modules.has("ASSIGNMENT") && (
            <div className="rounded-lg bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-500">
                  Pending Assignments
                </p>
                <FileText className="text-[#234A91]" size={21} />
              </div>
              <p className="mt-3 text-2xl font-bold text-gray-900">
                {assignmentsLoading ? "..." : pendingAssignments}
              </p>
              <p className="mt-1 text-sm text-gray-500">
                of {assignmentsLoading ? "..." : visibleAssignments.length} total
              </p>
            </div>
          )}
          {modules.has("EXAMINATION") && data.results && (
            <div className="rounded-lg bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-500">
                  Latest Result
                </p>
                <GraduationCap className="text-[#234A91]" size={21} />
              </div>
              <p className="mt-3 text-2xl font-bold text-gray-900">
                {result?.gpa != null
                  ? `GPA ${result.gpa}`
                  : result?.grade || "Not published"}
              </p>
              <p className="mt-1 text-sm text-gray-500">
                {data.results.publishedCount} published result
                {data.results.publishedCount === 1 ? "" : "s"}
              </p>
            </div>
          )}
          {modules.has("TIMETABLE") && (
            <div className="rounded-lg bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-500">
                  Upcoming Schedule
                </p>
                <CalendarDays className="text-[#234A91]" size={21} />
              </div>
              <p className="mt-3 text-2xl font-bold text-gray-900">
                {scheduleLoading ? "Loading..." : scheduleLabel}
              </p>
              <p className="mt-1 text-sm text-gray-500">
                {scheduleLoading
                  ? "Checking your timetable"
                  : `${upcomingClasses.length} scheduled ${upcomingClasses.length === 1 ? "period" : "periods"}`}
              </p>
            </div>
          )}
        </section>

        {quickActions.length > 0 && (
          <section className="rounded-lg bg-white p-5 shadow-sm">
            <div className="mb-4">
              <h2 className="font-semibold text-gray-900">Quick Actions</h2>
              <p className="mt-1 text-sm text-gray-500">
                Open your most-used student services.
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
                  <ArrowRight
                    size={18}
                    className="text-gray-400 transition group-hover:translate-x-0.5 group-hover:text-[#234A91]"
                  />
                </Link>
              ))}
            </div>
          </section>
        )}

        <div className="grid min-w-0 gap-6 xl:grid-cols-2">
          {modules.has("ASSIGNMENT") && (
            <section className="min-w-0 rounded-lg bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="font-semibold text-gray-900">
                  Recent Assignments
                </h2>
                <Link
                  to="/student/assignments"
                  className="text-sm font-medium text-[#234A91]"
                >
                  View all
                </Link>
              </div>
              {assignmentsLoading ? (
                <Skeleton className="h-32" />
              ) : visibleAssignments.length ? (
                <div className="divide-y divide-gray-100">
                  {visibleAssignments.slice(0, 5).map(({ assignment, submission }) => (
                    <Link
                      key={assignment.id}
                      to={`/student/assignments?assignment=${assignment.id}`}
                      className="block py-3 first:pt-0 hover:bg-gray-50"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <p className="min-w-0 font-medium text-gray-900">
                          {assignment.title}
                        </p>
                        <span className="shrink-0 rounded bg-gray-100 px-2 py-1 text-xs text-gray-600">
                          {submission?.status || assignment.status}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-gray-500">
                        Due {formatDate(assignment.dueAt)}
                      </p>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="py-8 text-center text-sm text-gray-500">
                  No recent assignments.
                </p>
              )}
            </section>
          )}

          {modules.has("ATTENDANCE") && data.attendance && (
            <section className="min-w-0 rounded-lg bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="font-semibold text-gray-900">Attendance</h2>
                <Link
                  to="/student/attendance"
                  className="text-sm font-medium text-[#234A91]"
                >
                  View details
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                {[
                  ["Present", data.attendance.present],
                  ["Absent", data.attendance.absent],
                  ["Late", data.attendance.late],
                  ["Leave", data.attendance.leave],
                ].map(([label, value]) => (
                  <div
                    key={String(label)}
                    className="rounded-lg bg-gray-50 p-3"
                  >
                    <p className="text-gray-500">{String(label)}</p>
                    <p className="mt-1 text-lg font-semibold text-gray-900">
                      {String(value)}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {modules.has("EXAMINATION") && data.results && (
          <section className="rounded-lg bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="font-semibold text-gray-900">
                  Latest Published Result
                </h2>
                <p className="text-sm text-gray-500">
                  Canonical result summary
                </p>
              </div>
              <Link
                to="/student/results"
                className="text-sm font-medium text-[#234A91]"
              >
                View results
              </Link>
            </div>
            {result ? (
              <div className="grid gap-3 text-sm sm:grid-cols-4">
                {[
                  ["Exam", result.examName],
                  ["GPA", result.gpa ?? "Not provided"],
                  ["Grade", result.grade ?? "Not provided"],
                  ["Status", result.status ?? "Published"],
                ].map(([label, value]) => (
                  <div
                    key={String(label)}
                    className="rounded-lg border border-gray-200 p-3"
                  >
                    <p className="text-gray-500">{String(label)}</p>
                    <p className="mt-1 font-semibold text-gray-900">
                      {String(value)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="py-8 text-center text-sm text-gray-500">
                No published results yet.
              </p>
            )}
          </section>
        )}

        {modules.has("TIMETABLE") && (
          <section className="rounded-lg bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <CalendarDays size={20} className="text-[#234A91]" />
                  <h2 className="font-semibold text-gray-900">
                    Today&apos;s / Upcoming Timetable
                  </h2>
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  {scheduleLabel === "Tomorrow"
                    ? "No classes remain today. Showing tomorrow's schedule."
                    : "Your next scheduled class periods."}
                </p>
              </div>
              <Link
                to="/student/timetable"
                className="shrink-0 text-sm font-medium text-[#234A91]"
              >
                Full timetable
              </Link>
            </div>
            {scheduleLoading ? (
              <Skeleton className="h-28" />
            ) : upcomingClasses.length ? (
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {upcomingClasses.slice(0, 6).map((entry) => (
                  <article
                    key={`${entry.dayOfWeek}-${entry.periodId}`}
                    className="rounded-lg border border-gray-200 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-gray-900">
                          {entry.subjectName || entry.periodName}
                        </p>
                        <p className="mt-1 text-xs font-medium uppercase text-[#234A91]">
                          {scheduleLabel}
                        </p>
                      </div>
                      <span className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-600">
                        {entry.periodName}
                      </span>
                    </div>
                    <p className="mt-3 flex items-center gap-2 text-sm text-gray-600">
                      <Clock3 size={15} /> {entry.startTime} - {entry.endTime}
                    </p>
                    {entry.room && (
                      <p className="mt-2 flex items-center gap-2 text-sm text-gray-500">
                        <MapPin size={15} /> {entry.room}
                      </p>
                    )}
                  </article>
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 py-8 text-center">
                <p className="font-medium text-gray-700">
                  No upcoming classes are scheduled.
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  Open My Timetable to view the complete weekly schedule.
                </p>
              </div>
            )}
          </section>
        )}
      </div>
    </StudentLayout>
  );
};

export default StudentDashboard;
