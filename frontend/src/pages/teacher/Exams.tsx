import { useEffect, useState } from "react";
import { LockKeyhole, Save } from "lucide-react";
import TeacherLayout from "../../layouts/TeacherLayout";
import PageHeader from "../../components/layout/PageHeader";
import ErrorState from "../../components/feedback/ErrorState";
import Skeleton from "../../components/Skeleton";
import { useToast } from "../../modules/admin/students/components/Toast";
import {
  examinationError,
  getTeacherExamAssignments,
  getTeacherMarkRoster,
  saveTeacherMarks,
} from "../../modules/examinations/service";
import type {
  MarkEntryRow,
  TeacherExamAssignment,
} from "../../modules/examinations/types";

export default function TeacherExams() {
  const { showToast } = useToast();
  const [assignments, setAssignments] = useState<TeacherExamAssignment[]>([]);
  const [selectedId, setSelectedId] = useState(0);
  const [rows, setRows] = useState<MarkEntryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [rosterLoading, setRosterLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const selected = assignments.find(
    (item) => item.examSubjectId === selectedId,
  );

  const loadAssignments = async () => {
    setLoading(true);
    setError("");
    try {
      const records = await getTeacherExamAssignments();
      setAssignments(records);
      setSelectedId((current) =>
        records.some((item) => item.examSubjectId === current)
          ? current
          : (records[0]?.examSubjectId ?? 0),
      );
    } catch (requestError) {
      setAssignments([]);
      setSelectedId(0);
      setError(examinationError(requestError));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    getTeacherExamAssignments()
      .then((records) => {
        if (!active) return;
        setAssignments(records);
        setSelectedId(records[0]?.examSubjectId ?? 0);
        setRosterLoading(Boolean(records[0]));
      })
      .catch((requestError) => {
        if (active) setError(examinationError(requestError));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);
  useEffect(() => {
    if (!selectedId) return;
    let active = true;
    getTeacherMarkRoster(selectedId)
      .then((records) => {
        if (active) setRows(records);
      })
      .catch((requestError) => {
        if (active) {
          setRows([]);
          setError(examinationError(requestError));
        }
      })
      .finally(() => {
        if (active) setRosterLoading(false);
      });
    return () => {
      active = false;
    };
  }, [selectedId]);

  const update = (studentId: number, changes: Partial<MarkEntryRow>) =>
    setRows((current) =>
      current.map((row) =>
        row.studentId === studentId ? { ...row, ...changes } : row,
      ),
    );
  const save = async () => {
    if (!selected || selected.published) return;
    const invalid = rows.find(
      (row) =>
        !row.absent &&
        (row.obtainedMarks == null ||
          row.obtainedMarks < 0 ||
          row.obtainedMarks > selected.fullMarks),
    );
    if (invalid) {
      showToast(
        `Enter marks from 0 to ${selected.fullMarks} for ${invalid.studentName}.`,
        "validation",
      );
      return;
    }
    setSaving(true);
    try {
      await saveTeacherMarks(selected.examSubjectId, rows);
      showToast("Marks saved successfully.");
      setRows(await getTeacherMarkRoster(selected.examSubjectId));
    } catch (requestError) {
      showToast(examinationError(requestError), "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <TeacherLayout>
      <PageHeader
        title="Marks Entry"
        subtitle="Enter marks only for subjects, classes, and sections assigned to you."
      />
      {loading ? (
        <Skeleton className="h-72" />
      ) : error && !assignments.length ? (
        <div className="rounded-xl bg-white">
          <ErrorState
            title="Marks entry unavailable"
            description={error}
            onRetry={loadAssignments}
          />
        </div>
      ) : !assignments.length ? (
        <div className="rounded-xl bg-white">
          <ErrorState
            title="No examination assignments"
            description="No examination subjects are assigned to your account."
          />
        </div>
      ) : (
        <div className="space-y-5">
          <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <label className="block max-w-xl text-sm font-medium text-gray-700">
              Assigned examination subject
              <select
                value={selectedId}
                onChange={(event) => {
                  setRows([]);
                  setError("");
                  setRosterLoading(true);
                  setSelectedId(Number(event.target.value));
                }}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2.5"
              >
                <option value={0}>Select an assignment</option>
                {assignments.map((item) => (
                  <option key={item.examSubjectId} value={item.examSubjectId}>
                    {item.examName} | {item.subjectName} | {item.className}
                    {item.sectionName ? ` - ${item.sectionName}` : ""}
                  </option>
                ))}
              </select>
            </label>
          </section>
          {selected && (
            <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
              <div className="flex flex-col gap-3 border-b border-gray-200 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="font-semibold text-gray-900">
                    {selected.examName}: {selected.subjectName}
                  </h2>
                  <p className="text-sm text-gray-500">
                    {selected.className}
                    {selected.sectionName ? ` - ${selected.sectionName}` : ""} |
                    Full marks {selected.fullMarks} | Pass marks{" "}
                    {selected.passMarks}
                    {selected.examDate
                      ? ` | ${new Date(`${selected.examDate}T00:00:00`).toLocaleDateString()}`
                      : ""}
                  </p>
                </div>
                {selected.published ? (
                  <span className="flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-600">
                    <LockKeyhole className="h-4 w-4" /> Published and read-only
                  </span>
                ) : (
                  <button
                    type="button"
                    disabled={saving || rosterLoading || !rows.length}
                    onClick={save}
                    className="flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                  >
                    <Save className="h-4 w-4" />
                    {saving ? "Saving..." : "Save marks"}
                  </button>
                )}
              </div>
              {rosterLoading ? (
                <div className="p-5">
                  <Skeleton className="h-52" />
                </div>
              ) : error ? (
                <ErrorState
                  title="Student roster unavailable"
                  description={error}
                />
              ) : rows.length ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 text-gray-600">
                      <tr>
                        <th className="px-4 py-3">Student</th>
                        <th className="px-4 py-3">Obtained marks</th>
                        <th className="px-4 py-3">Absent</th>
                        <th className="px-4 py-3">Grade</th>
                        <th className="px-4 py-3">GPA</th>
                        <th className="px-4 py-3">Result</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {rows.map((row) => (
                        <tr key={row.studentId}>
                          <td className="px-4 py-3">
                            <p className="font-medium text-gray-900">
                              {row.studentName}
                            </p>
                            <p className="text-xs text-gray-500">
                              {row.admissionNumber ||
                                row.rollNumber ||
                                `Student #${row.studentId}`}
                            </p>
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="number"
                              min={0}
                              max={selected.fullMarks}
                              step="0.01"
                              value={row.obtainedMarks ?? ""}
                              disabled={selected.published || row.absent}
                              onChange={(event) =>
                                update(row.studentId, {
                                  obtainedMarks:
                                    event.target.value === ""
                                      ? undefined
                                      : Number(event.target.value),
                                })
                              }
                              className="w-28 rounded-lg border border-gray-300 px-3 py-2 disabled:bg-gray-100"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="checkbox"
                              checked={row.absent}
                              disabled={selected.published}
                              onChange={(event) =>
                                update(row.studentId, {
                                  absent: event.target.checked,
                                  obtainedMarks: event.target.checked
                                    ? undefined
                                    : row.obtainedMarks,
                                })
                              }
                              className="h-4 w-4 rounded border-gray-300"
                            />
                          </td>
                          <td className="px-4 py-3">{row.grade || "-"}</td>
                          <td className="px-4 py-3">{row.gpa ?? "-"}</td>
                          <td
                            className={`px-4 py-3 font-semibold ${row.status === "PASS" ? "text-emerald-600" : row.status === "FAIL" ? "text-red-600" : "text-gray-500"}`}
                          >
                            {row.status || "Pending"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="p-10 text-center text-sm text-gray-500">
                  No students are available for this assigned class and section.
                </p>
              )}
            </section>
          )}
        </div>
      )}
    </TeacherLayout>
  );
}
