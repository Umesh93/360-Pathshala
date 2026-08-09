import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Activity,
  BookOpen,
  ClipboardCheck,
  FileText,
  GraduationCap,
  UserCheck,
  UserPlus,
  Users,
} from "lucide-react";
import AdminLayout from "../../layouts/AdminLayout";
import QuickActions from "../../components/QuickActions";
import Skeleton from "../../components/Skeleton";
import ErrorState from "../../components/feedback/ErrorState";
import { loadSchoolLogoUrl } from "../../services/schoolService";
import { getAdminDashboard } from "../../services/adminDashboardService";
import type { AdminDashboardResponse } from "../../types/dashboard";

const enabled = (modules: string[], code: string) => modules.includes(code);
const date = (value: string) =>
  value ? new Date(`${value.slice(0, 10)}T00:00:00`).toLocaleDateString() : "-";
const Card = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <section className={`rounded-xl bg-white p-5 shadow-sm ${className}`}>
    {children}
  </section>
);
const Stat = ({
  label,
  value,
  icon,
  href,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  href?: string;
}) => {
  const content = (
    <div className="flex min-w-0 items-center gap-3">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-50 text-[#234A91]">
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
  return href ? (
    <a
      href={href}
      className="rounded-xl bg-white p-5 shadow-sm transition hover:shadow-md"
    >
      {content}
    </a>
  ) : (
    <Card>{content}</Card>
  );
};

export default function SchoolDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState<AdminDashboardResponse | null>(null);
  const [sessionId, setSessionId] = useState<number>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [logoUrl, setLogoUrl] = useState<string>();
  const requestSequence = useRef(0);

  const fetchData = async (selected = sessionId) => {
    const requestId = ++requestSequence.current;
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    try {
      const result = await getAdminDashboard(selected, controller.signal);
      if (requestId !== requestSequence.current) return;
      setData(result);
      setSessionId(result.session?.id);
    } catch (reason) {
      if (
        requestId !== requestSequence.current ||
        (reason instanceof DOMException && reason.name === "AbortError")
      )
        return;
      setError("Failed to load dashboard data.");
      setSessionId(data?.session?.id);
    } finally {
      if (requestId === requestSequence.current) setLoading(false);
    }
  };
  useEffect(() => {
    void Promise.resolve().then(() => fetchData());
    // Initial request intentionally runs once; session changes use the selector handler.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    if (!data?.school.logoUrl) return;
    let active = true;
    let objectUrl: string | undefined;
    void loadSchoolLogoUrl(data.school.logoUrl)
      .then((url) => {
        objectUrl = url;
        if (active) setLogoUrl(url);
        else URL.revokeObjectURL(url);
      })
      .catch(() => undefined);
    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [data?.school.logoUrl]);

  if (loading && !data)
    return (
      <AdminLayout>
        <div className="space-y-6">
          <Skeleton className="h-28" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-28" />
            ))}
          </div>
          <Skeleton className="h-80" />
          <Skeleton className="h-64" />
        </div>
      </AdminLayout>
    );
  if (error && !data)
    return (
      <AdminLayout>
        <ErrorState
          title="Dashboard unavailable"
          description={error}
          onRetry={() => void fetchData()}
        />
      </AdminLayout>
    );
  if (!data) return null;
  const modules = data.enabledModules || [];
  const attendance = enabled(modules, "ATTENDANCE") ? data.attendance : null;
  const exams = enabled(modules, "EXAMINATION") ? data.examinations : null;
  const assignments = enabled(modules, "ASSIGNMENT") ? data.assignments : null;
  const teachers = enabled(modules, "TEACHER_MANAGEMENT")
    ? data.teacherOverview
    : null;
  const overview = data.overview;
  const classesEnabled = [
    "SUBJECT_MANAGEMENT",
    "STUDENT_MANAGEMENT",
    "TEACHER_MANAGEMENT",
    "EXAMINATION",
  ].some((module) => enabled(modules, module));
  const actions = [
    ...(enabled(modules, "STUDENT_MANAGEMENT")
      ? [
          {
            label: "Add Student",
            icon: <UserPlus size={20} />,
            onClick: () => navigate("/admin/students/add"),
          },
        ]
      : []),
    ...(enabled(modules, "TEACHER_MANAGEMENT")
      ? [
          {
            label: "Add Teacher",
            icon: <UserCheck size={20} />,
            onClick: () => navigate("/admin/teachers/add"),
          },
        ]
      : []),
    ...(attendance
      ? [
          {
            label: "Take Attendance",
            icon: <ClipboardCheck size={20} />,
            onClick: () => navigate("/admin/attendance?view=students"),
          },
        ]
      : []),
    ...(exams
      ? [
          {
            label: "Create Examination",
            icon: <FileText size={20} />,
            onClick: () => navigate("/admin/examinations?view=examinations"),
          },
          {
            label: "Enter Marks",
            icon: <GraduationCap size={20} />,
            onClick: () => navigate("/admin/examinations?view=marks"),
          },
        ]
      : []),
    ...(assignments
      ? [
          {
            label: "View Assignments",
            icon: <BookOpen size={20} />,
            onClick: () => navigate("/admin/assignments"),
          },
        ]
      : []),
    ...(enabled(modules, "SUBJECT_MANAGEMENT") &&
    enabled(modules, "TEACHER_MANAGEMENT")
      ? [
          {
            label: "Teacher Assignments",
            icon: <Users size={20} />,
            onClick: () => navigate("/admin/subjects?view=teacher-assignments"),
          },
        ]
      : []),
    ...(exams
      ? [
          {
            label: "View Results",
            icon: <Activity size={20} />,
            onClick: () => navigate("/admin/examinations?view=results"),
          },
        ]
      : []),
  ];
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="relative">
          <Card>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex min-w-0 items-center gap-4">
                {logoUrl ? (
                  <img
                    src={logoUrl}
                    alt={`${data.school.name} logo`}
                    className="h-16 w-16 rounded-lg object-contain"
                  />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-blue-50 text-xl font-bold text-[#234A91]">
                    {data.school.name.slice(0, 1)}
                  </div>
                )}
                <div className="min-w-0">
                  <h1 className="truncate text-2xl font-bold text-gray-900">
                    {data.school.name}
                  </h1>
                  <p className="text-sm text-gray-500">
                    {[data.school.address, data.school.phone, data.school.email]
                      .filter(Boolean)
                      .join(" · ") || "School administration"}
                  </p>
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-600">
                Academic session
                <select
                  value={sessionId ?? ""}
                  onChange={(e) => {
                    const selected = Number(e.target.value);
                    setSessionId(selected);
                    void fetchData(selected);
                  }}
                  disabled={loading}
                  className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-800"
                >
                  <option value="" disabled>
                    Select session
                  </option>
                  {data.availableSessions.map((session) => (
                    <option key={session.id} value={session.id}>
                      {session.name}
                      {session.active ? " (Active)" : ""}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </Card>
          {loading && (
            <div
              className="absolute inset-0 rounded-xl bg-white/55"
              aria-label="Loading selected session"
            />
          )}
        </div>
        {error && (
          <div
            role="alert"
            className="flex flex-wrap items-center justify-between gap-3 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
          >
            <span>
              {error} Showing {data.session?.name ?? "previous session"} data.
            </span>
            <button
              type="button"
              className="font-semibold"
              onClick={() => void fetchData(sessionId)}
            >
              Retry
            </button>
          </div>
        )}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {enabled(modules, "STUDENT_MANAGEMENT") && (
            <Stat
              label="Active / Total Students"
              value={`${overview.activeStudents} / ${overview.totalStudents}`}
              icon={<GraduationCap />}
              href="/admin/students"
            />
          )}
          {enabled(modules, "TEACHER_MANAGEMENT") && (
            <Stat
              label="Active / Total Teachers"
              value={`${overview.activeTeachers} / ${overview.totalTeachers}`}
              icon={<UserCheck />}
              href="/admin/teachers"
            />
          )}
          {classesEnabled && (
            <Stat
              label="Classes"
              value={overview.totalClasses}
              icon={<Users />}
            />
          )}
          {classesEnabled && (
            <Stat
              label="Sections"
              value={overview.totalSections}
              icon={<BookOpen />}
            />
          )}
          {attendance && (
            <>
              <Stat
                label="Present Today"
                value={attendance.present}
                icon={<ClipboardCheck />}
                href="/admin/attendance?view=students"
              />
              <Stat
                label="Absent Today"
                value={attendance.absent}
                icon={<Users />}
              />
            </>
          )}
          {enabled(modules, "LEAVE_MANAGEMENT") && (
            <Stat
              label="Pending Teacher Leaves"
              value={data.attention.pendingTeacherLeaves}
              icon={<Activity />}
            />
          )}
          {exams && (
            <Stat
              label="Upcoming Exams"
              value={exams.upcomingCount}
              icon={<FileText />}
              href="/admin/examinations?view=examinations"
            />
          )}
        </div>
        <QuickActions actions={actions} />
        {attendance && (
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Attendance Today
                </h2>
                <p className="text-sm text-gray-500">
                  {date(attendance.date)} · {attendance.percentage}% present
                </p>
              </div>
              <a
                href="/admin/attendance?view=students"
                className="text-sm font-semibold text-[#234A91]"
              >
                View Attendance
              </a>
            </div>
            <div className="mt-5 h-3 overflow-hidden rounded-full bg-gray-100">
              <div
                className="h-full bg-emerald-500"
                style={{
                  width: `${Math.min(100, Math.max(0, attendance.percentage))}%`,
                }}
              />
            </div>
            <div className="mt-3 flex flex-wrap gap-4 text-sm text-gray-600">
              <span>Present {attendance.present}</span>
              <span>Absent {attendance.absent}</span>
              <span>Late {attendance.late}</span>
              <span>Leave {attendance.leave}</span>
              <span>Unmarked {attendance.unmarked}</span>
            </div>
            <div className="mt-5 overflow-x-auto">
              {attendance.todayAbsences.length ? (
                <table className="w-full min-w-[560px] text-left text-sm">
                  <thead className="text-gray-500">
                    <tr>
                      <th className="py-2">Student</th>
                      <th>Class</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {attendance.todayAbsences.slice(0, 8).map((absence) => (
                      <tr key={absence.attendanceId}>
                        <td className="py-2 font-medium">
                          {absence.studentName}
                        </td>
                        <td>
                          {[absence.className, absence.sectionName]
                            .filter(Boolean)
                            .join(" - ") || "-"}
                        </td>
                        <td>{absence.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="py-6 text-center text-sm text-gray-500">
                  No absences recorded for this date.
                </p>
              )}
            </div>
          </Card>
        )}
        {teachers && (
          <Card>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Teacher Overview</h2>
              <a
                href="/admin/teachers"
                className="text-sm font-semibold text-[#234A91]"
              >
                View Teachers
              </a>
            </div>
            {enabled(modules, "ATTENDANCE") && (
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                <span>
                  Present <b>{teachers.present}</b>
                </span>
                <span>
                  Absent <b>{teachers.absent}</b>
                </span>
                <span>
                  On leave <b>{teachers.onLeave}</b>
                </span>
                <span>
                  Unmarked <b>{teachers.unmarked}</b>
                </span>
              </div>
            )}
            {enabled(modules, "LEAVE_MANAGEMENT") && (
              <div className="mt-5 space-y-2">
                {teachers.recentPendingLeaves.length ? (
                  teachers.recentPendingLeaves.map((leave) => (
                    <div
                      key={leave.id}
                      className="flex flex-wrap justify-between gap-2 border-t py-2 text-sm"
                    >
                      <span className="font-medium">{leave.teacherName}</span>
                      <span>
                        {date(leave.startsOn)} - {date(leave.endsOn)}
                      </span>
                      <span className="text-amber-600">{leave.status}</span>
                    </div>
                  ))
                ) : (
                  <p className="mt-4 text-sm text-gray-500">
                    No pending teacher leave requests.
                  </p>
                )}
              </div>
            )}
          </Card>
        )}
        {exams && (
          <Card>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Examinations</h2>
              <a
                href="/admin/examinations?view=examinations"
                className="text-sm font-semibold text-[#234A91]"
              >
                Open Examinations
              </a>
            </div>
            <div className="mt-4 flex flex-wrap gap-5 text-sm">
              <span>
                Upcoming <b>{exams.upcomingCount}</b>
              </span>
              <span>
                Awaiting publication <b>{exams.awaitingPublicationCount}</b>
              </span>
              <span>
                Recently published <b>{exams.recentlyPublishedCount}</b>
              </span>
            </div>
            <div className="mt-4 grid gap-2 md:grid-cols-2">
              {exams.upcoming.slice(0, 6).map((exam) => (
                <div key={exam.id} className="border-t py-2 text-sm">
                  <b>{exam.name}</b>
                  <span className="ml-2 text-gray-500">
                    {date(exam.startsOn)} - {date(exam.endsOn)}
                  </span>
                  <p className="text-gray-500">
                    {exam.classNames.join(", ") || "All classes"}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        )}
        {assignments && (
          <Card>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Assignments</h2>
              <a
                href="/admin/assignments"
                className="text-sm font-semibold text-[#234A91]"
              >
                Open Assignments
              </a>
            </div>
            <div className="mt-4 flex flex-wrap gap-5 text-sm">
              <span>
                Active <b>{assignments.active}</b>
              </span>
              <span>
                Due this week <b>{assignments.dueThisWeek}</b>
              </span>
              <span>
                Pending submissions <b>{assignments.pendingSubmissions}</b>
              </span>
            </div>
            <div className="mt-4 space-y-2">
              {assignments.recent.slice(0, 6).map((assignment) => (
                <div key={assignment.id} className="border-t py-2 text-sm">
                  <b>{assignment.title}</b>
                  <span className="ml-2 text-gray-500">
                    {date(assignment.dueAt)}
                  </span>
                  <p className="text-gray-500">
                    {[assignment.className, assignment.subjectName]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        )}
        <Card>
          <h2 className="text-lg font-semibold">Needs Attention</h2>
          {[
            ...(attendance
              ? [
                  [
                    data.attention.absentStudents,
                    "students absent today",
                    undefined,
                  ],
                ]
              : []),
            ...(enabled(modules, "LEAVE_MANAGEMENT")
              ? [
                  [
                    data.attention.pendingTeacherLeaves,
                    "teacher leave requests",
                    undefined,
                  ],
                ]
              : []),
            ...(exams
              ? [
                  [
                    data.attention.resultsAwaitingPublication,
                    "results awaiting publication",
                    "/admin/examinations?view=results",
                  ],
                ]
              : []),
            ...(assignments
              ? [
                  [
                    data.attention.assignmentsDueThisWeek,
                    "assignments due this week",
                    "/admin/assignments",
                  ],
                ]
              : []),
          ].filter(([count]) => Number(count) > 0).length ? (
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {[
                ...(attendance
                  ? [
                      [
                        data.attention.absentStudents,
                        "students absent today",
                        undefined,
                      ],
                    ]
                  : []),
                ...(enabled(modules, "LEAVE_MANAGEMENT")
                  ? [
                      [
                        data.attention.pendingTeacherLeaves,
                        "teacher leave requests",
                        undefined,
                      ],
                    ]
                  : []),
                ...(exams
                  ? [
                      [
                        data.attention.resultsAwaitingPublication,
                        "results awaiting publication",
                        "/admin/examinations?view=results",
                      ],
                    ]
                  : []),
                ...(assignments
                  ? [
                      [
                        data.attention.assignmentsDueThisWeek,
                        "assignments due this week",
                        "/admin/assignments",
                      ],
                    ]
                  : []),
              ]
                .filter(([count]) => Number(count) > 0)
                .map(([count, label, href]) => {
                  const content = (
                    <>
                      <b>{count}</b> {label}
                    </>
                  );
                  const className =
                    "rounded-lg border border-amber-100 bg-amber-50 p-3 text-sm text-amber-900";
                  return href ? (
                    <a key={label} href={String(href)} className={className}>
                      {content}
                    </a>
                  ) : (
                    <div key={label} className={className}>
                      {content}
                    </div>
                  );
                })}
            </div>
          ) : (
            <p className="mt-3 text-sm text-gray-500">
              Nothing requires attention right now.
            </p>
          )}
        </Card>
      </div>
    </AdminLayout>
  );
}
