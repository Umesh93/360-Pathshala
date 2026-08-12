import { useEffect, useState } from "react";
import {
  CalendarDays,
  ClipboardCheck,
  FileText,
  GraduationCap,
} from "lucide-react";
import { Link } from "react-router-dom";

import ErrorState from "../../components/feedback/ErrorState";
import Skeleton from "../../components/Skeleton";
import StudentLayout from "../../layouts/StudentLayout";
import { getStudentDashboard } from "../../services/dashboardService";
import type { StudentDashboardResponse } from "../../types/dashboard";

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

  useEffect(() => {
    let active = true;
    getStudentDashboard()
      .then((response) => active && setData(response))
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
          <div className="rounded-lg bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-500">
                Class / Section
              </p>
              <GraduationCap className="text-[#234A91]" size={21} />
            </div>
            <p className="mt-3 break-words text-xl font-bold text-gray-900">
              {classLabel || "Not assigned"}
            </p>
          </div>
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
          {modules.has("ASSIGNMENT") && data.assignments && (
            <div className="rounded-lg bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-500">
                  Pending Assignments
                </p>
                <FileText className="text-[#234A91]" size={21} />
              </div>
              <p className="mt-3 text-2xl font-bold text-gray-900">
                {data.assignments.pending}
              </p>
              <p className="mt-1 text-sm text-gray-500">
                of {data.assignments.count} total
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
        </section>

        <section className="rounded-lg bg-white p-5 shadow-sm">
          <h2 className="font-semibold text-gray-900">My Class</h2>
          <p className="mt-2 text-sm text-gray-600">
            {classLabel || "Class and section information is not available."}
          </p>
        </section>

        <div className="grid min-w-0 gap-6 xl:grid-cols-2">
          {modules.has("ASSIGNMENT") && data.assignments && (
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
              {data.assignments.recent.length ? (
                <div className="divide-y divide-gray-100">
                  {data.assignments.recent.map((assignment) => (
                    <div key={assignment.id} className="py-3 first:pt-0">
                      <div className="flex items-start justify-between gap-3">
                        <p className="min-w-0 font-medium text-gray-900">
                          {assignment.title}
                        </p>
                        <span className="shrink-0 rounded bg-gray-100 px-2 py-1 text-xs text-gray-600">
                          {assignment.submissionStatus || assignment.status}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-gray-500">
                        Due {formatDate(assignment.dueAt)}
                      </p>
                    </div>
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

        <section className="rounded-lg bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <CalendarDays size={20} className="text-[#234A91]" />
            <h2 className="font-semibold text-gray-900">Timetable</h2>
          </div>
          {!data.timetableAvailable || data.timetableEntries.length === 0 ? (
            <div className="py-8 text-center">
              <p className="font-medium text-gray-700">
                No timetable available yet
              </p>
              <p className="mt-1 text-sm text-gray-500">
                Timetable scheduling is coming soon.
              </p>
            </div>
          ) : (
            <p className="py-8 text-center text-sm text-gray-500">
              Timetable entries are available in the timetable page.
            </p>
          )}
        </section>
      </div>
    </StudentLayout>
  );
};

export default StudentDashboard;
