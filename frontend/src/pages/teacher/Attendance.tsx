import { useEffect, useState } from "react";
import { Clock3, LogIn, LogOut, Save } from "lucide-react";
import TeacherLayout from "../../layouts/TeacherLayout";
import PageHeader from "../../components/layout/PageHeader";
import ErrorState from "../../components/feedback/ErrorState";
import Skeleton from "../../components/Skeleton";
import { useToast } from "../../modules/admin/students/components/Toast";
import { errorMessage } from "../../modules/admin/attendance/attendance.service";
import type {
  AttendanceStatus,
  Option,
  StudentAttendanceRow,
} from "../../modules/admin/attendance/attendance.types";
import {
  getAssignedRoster,
  getTeacherLookups,
  getTeacherToday,
  saveAssignedRoster,
  teacherCheckIn,
  teacherCheckOut,
} from "../../modules/attendance/service";
import { StatusBadge } from "../../modules/attendance/components";

const statuses: AttendanceStatus[] = ["PRESENT", "ABSENT", "LATE", "LEAVE"];
const today = new Date().toISOString().slice(0, 10);

export default function TeacherAttendance() {
  const { showToast } = useToast();
  const [classes, setClasses] = useState<Option[]>([]);
  const [sections, setSections] = useState<Option[]>([]);
  const [sessions, setSessions] = useState<Option[]>([]);
  const [academicSessionId, setAcademicSessionId] = useState(0);
  const [classId, setClassId] = useState(0);
  const [sectionId, setSectionId] = useState(0);
  const [date, setDate] = useState(today);
  const [rows, setRows] = useState<StudentAttendanceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [selfAttendance, setSelfAttendance] = useState<{
    checkIn?: string;
    checkOut?: string;
    status?: AttendanceStatus;
  }>();

  useEffect(() => {
    Promise.all([getTeacherLookups(), getTeacherToday()])
      .then(([lookups, todayAttendance]) => {
        setClasses(lookups.classes);
        setSections(lookups.sections);
        setSessions(lookups.sessions);
        setAcademicSessionId(lookups.sessions[0]?.id || 0);
        setSelfAttendance(todayAttendance);
      })
      .catch((requestError) => setError(errorMessage(requestError)))
      .finally(() => setLoading(false));
  }, []);

  const selfCheck = async (checkout: boolean) => {
    try {
      setSelfAttendance(
        await (checkout ? teacherCheckOut() : teacherCheckIn()),
      );
      showToast(
        checkout ? "Checked out successfully" : "Checked in successfully",
        "success",
      );
    } catch (requestError) {
      showToast(errorMessage(requestError), "error");
    }
  };

  const visibleSections = sections.filter(
    (section) => !section.classId || section.classId === classId,
  );

  const loadRoster = async () => {
    if (!academicSessionId || !classId || !sectionId) {
      showToast(
        "Select academic session, assigned class and section.",
        "validation",
      );
      return;
    }
    setLoading(true);
    setError("");
    try {
      const result = await getAssignedRoster({
        academicSessionId,
        classId,
        sectionId,
        date,
      });
      setRows(result.items);
    } catch (requestError) {
      setRows([]);
      setError(errorMessage(requestError));
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = (studentId: number, status: AttendanceStatus) => {
    setRows((current) =>
      current.map((row) =>
        row.studentId === studentId ? { ...row, status } : row,
      ),
    );
  };

  const save = async () => {
    setSaving(true);
    try {
      await saveAssignedRoster(
        { academicSessionId, classId, sectionId, date },
        rows.map(({ id, studentId, status, remarks }) => ({
          id,
          studentId,
          status,
          remarks,
        })),
        rows.some((row) => row.existing),
      );
      showToast("Student attendance saved.");
      await loadRoster();
    } catch (requestError) {
      showToast(errorMessage(requestError), "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <TeacherLayout>
      <PageHeader
        title="Attendance"
        subtitle="Mark attendance only for your assigned classes and sections."
      />
      <div className="space-y-5">
        <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-slate-100 p-2 text-slate-600">
              <Clock3 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-800">
                Today: {new Date().toLocaleDateString()}
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Status: {selfAttendance?.status || "Not Checked In"}
                {selfAttendance?.checkIn
                  ? ` | Checked in at ${selfAttendance.checkIn}`
                  : ""}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={!!selfAttendance?.checkIn}
                  onClick={() => selfCheck(false)}
                  className="flex items-center gap-2 rounded-lg bg-[#234A91] px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
                >
                  <LogIn size={15} />
                  Check In
                </button>
                <button
                  type="button"
                  disabled={
                    !selfAttendance?.checkIn || !!selfAttendance?.checkOut
                  }
                  onClick={() => selfCheck(true)}
                  className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 disabled:opacity-50"
                >
                  <LogOut size={15} />
                  Check Out
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="grid gap-4 md:grid-cols-5">
            <label className="text-sm font-medium text-gray-700">
              Academic session
              <select
                value={academicSessionId}
                onChange={(event) =>
                  setAcademicSessionId(Number(event.target.value))
                }
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2"
              >
                <option value={0}>Select session</option>
                {sessions.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm font-medium text-gray-700">
              Date
              <input
                type="date"
                value={date}
                max={today}
                onChange={(event) => setDate(event.target.value)}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2"
              />
            </label>
            <label className="text-sm font-medium text-gray-700">
              Assigned class
              <select
                value={classId}
                onChange={(event) => {
                  setClassId(Number(event.target.value));
                  setSectionId(0);
                }}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2"
              >
                <option value={0}>Select class</option>
                {classes.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm font-medium text-gray-700">
              Section
              <select
                value={sectionId}
                onChange={(event) => setSectionId(Number(event.target.value))}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2"
              >
                <option value={0}>Select section</option>
                {visibleSections.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="button"
              onClick={loadRoster}
              className="self-end rounded-lg bg-[#234A91] px-4 py-2 text-sm font-semibold text-white hover:bg-[#19386f]"
            >
              Load students
            </button>
          </div>
        </section>

        {loading ? (
          <Skeleton className="h-64" />
        ) : error ? (
          <div className="rounded-xl bg-white">
            <ErrorState
              title="Attendance unavailable"
              description={error}
              onRetry={classId && sectionId ? loadRoster : undefined}
            />
          </div>
        ) : rows.length ? (
          <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-200 p-4">
              <div>
                <h2 className="font-semibold text-gray-800">Student roster</h2>
                <p className="text-sm text-gray-500">{rows.length} students</p>
              </div>
              <button
                type="button"
                disabled={saving}
                onClick={save}
                className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
              >
                <Save className="h-4 w-4" />
                {saving ? "Saving..." : "Save attendance"}
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <th className="px-4 py-3">Student</th>
                    <th className="px-4 py-3">Current</th>
                    <th className="px-4 py-3">Mark status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {rows.map((row) => (
                    <tr key={row.studentId}>
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-800">{row.name}</p>
                        <p className="text-xs text-gray-500">
                          {row.admissionNumber || row.rollNumber}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={row.status} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-2">
                          {statuses.map((status) => (
                            <button
                              key={status}
                              type="button"
                              onClick={() =>
                                updateStatus(row.studentId, status)
                              }
                              className={`rounded-md border px-2.5 py-1 text-xs font-medium ${row.status === status ? "border-[#234A91] bg-blue-50 text-[#234A91]" : "border-gray-200 text-gray-600"}`}
                            >
                              {status.replace("_", " ")}
                            </button>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ) : (
          <div className="rounded-xl border border-dashed border-gray-300 bg-white py-12 text-center text-sm text-gray-500">
            Select an assigned class and section to load the roster.
          </div>
        )}
      </div>
    </TeacherLayout>
  );
}
