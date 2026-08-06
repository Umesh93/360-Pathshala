import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import AdminLayout from "../../../layouts/AdminLayout";
import { useToast } from "../students/components/Toast";
import SubjectListPage from "./SubjectListPage";
import {
  getActiveTeacherOptions,
  getSubjectSections,
  getSubjectWorkspaceLookups,
  getTeacherSubjectAssignments,
  saveTeacherSubjectAssignments,
} from "./subject.service";
import type {
  SubjectOption,
  TeacherOption,
  TeacherSubjectRow,
} from "./subject.types";

type SubjectView = "list" | "teacher-assignments";

const views: Array<{ value: SubjectView; label: string }> = [
  { value: "list", label: "Subject List" },
  { value: "teacher-assignments", label: "Teacher Assignments" },
];

const fieldClass =
  "mt-1 h-10 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm disabled:bg-gray-100 disabled:text-gray-400";
const errorMessage = (error: unknown) => {
  const value = error as {
    message?: string;
    response?: { data?: { message?: string; error?: string } };
  };
  return (
    value.response?.data?.message ||
    value.response?.data?.error ||
    value.message ||
    "Request failed. Please try again."
  );
};

export default function SubjectsWorkspace() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedView = searchParams.get("view");
  const view: SubjectView = views.some((item) => item.value === requestedView)
    ? (requestedView as SubjectView)
    : "list";
  const [sessions, setSessions] = useState<SubjectOption[]>([]);
  const [classes, setClasses] = useState<SubjectOption[]>([]);
  const [lookupLoading, setLookupLoading] = useState(true);
  const [lookupError, setLookupError] = useState("");

  useEffect(() => {
    let active = true;
    getSubjectWorkspaceLookups()
      .then((lookups) => {
        if (!active) return;
        setSessions(lookups.sessions);
        setClasses(lookups.classes);
      })
      .catch((error) => {
        if (active) setLookupError(errorMessage(error));
      })
      .finally(() => {
        if (active) setLookupLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const changeView = (nextView: SubjectView) => {
    const next = new URLSearchParams(searchParams);
    next.set("view", nextView);
    setSearchParams(next, { replace: true });
  };

  return (
    <AdminLayout>
      <div className="space-y-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 md:text-3xl">
              Subject Management
            </h1>
            <p className="text-gray-500">
              Manage class subjects and teacher assignments
            </p>
          </div>
          <button
            onClick={() => navigate("/admin/subjects/add")}
            className="rounded-xl bg-[#234A91] px-5 py-2.5 text-white"
          >
            Add Subject
          </button>
        </div>

        <div className="overflow-x-auto border-b border-gray-200">
          <div
            className="flex min-w-max gap-6"
            role="tablist"
            aria-label="Subject views"
          >
            {views.map((item) => (
              <button
                key={item.value}
                role="tab"
                aria-selected={view === item.value}
                onClick={() => changeView(item.value)}
                className={`border-b-2 px-1 pb-3 text-sm font-medium transition-colors ${
                  view === item.value
                    ? "border-[#234A91] text-[#234A91]"
                    : "border-transparent text-gray-500 hover:text-gray-800"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {view === "list" && <SubjectListPage embedded />}
        {view === "teacher-assignments" && (
          <TeacherAssignments
            sessions={sessions}
            classes={classes}
            lookupLoading={lookupLoading}
            lookupError={lookupError}
            showToast={showToast}
          />
        )}
      </div>
    </AdminLayout>
  );
}

function TeacherAssignments({
  sessions,
  classes,
  lookupLoading,
  lookupError,
  showToast,
}: {
  sessions: SubjectOption[];
  classes: SubjectOption[];
  lookupLoading: boolean;
  lookupError: string;
  showToast: (
    message: string,
    type?: "success" | "error" | "validation" | "server",
  ) => void;
}) {
  const [sessionId, setSessionId] = useState(0);
  const [classId, setClassId] = useState(0);
  const [sectionId, setSectionId] = useState(0);
  const [sections, setSections] = useState<SubjectOption[]>([]);
  const [rows, setRows] = useState<TeacherSubjectRow[]>([]);
  const [teachers, setTeachers] = useState<TeacherOption[]>([]);
  const [sectionsLoading, setSectionsLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const selectedSessionId =
    sessionId ||
    sessions.find((item) => item.isCurrent)?.id ||
    sessions[0]?.id ||
    0;

  const changeClass = async (nextClassId: number) => {
    setClassId(nextClassId);
    setSectionId(0);
    setSections([]);
    setRows([]);
    setLoaded(false);
    if (!nextClassId) return;
    setSectionsLoading(true);
    try {
      const items = await getSubjectSections(nextClassId);
      setSections(
        items.filter((item) => !item.classId || item.classId === nextClassId),
      );
    } catch (error) {
      showToast(errorMessage(error), "error");
    } finally {
      setSectionsLoading(false);
    }
  };

  const clearLoadedRows = () => {
    setRows([]);
    setLoaded(false);
  };

  const load = async () => {
    if (!selectedSessionId || !classId || !sectionId) {
      showToast(
        "Academic session, class, and section are required",
        "validation",
      );
      return;
    }
    setLoading(true);
    setRows([]);
    setLoaded(false);
    try {
      const [assignments, activeTeachers] = await Promise.all([
        getTeacherSubjectAssignments({
          academicSessionId: selectedSessionId,
          classId,
          sectionId,
        }),
        getActiveTeacherOptions(),
      ]);
      setRows(assignments);
      setTeachers(activeTeachers);
      setLoaded(true);
    } catch (error) {
      showToast(errorMessage(error), "error");
    } finally {
      setLoading(false);
    }
  };

  const save = async () => {
    if (!selectedSessionId || !classId || !sectionId || !loaded) {
      showToast("Load teacher assignments before saving", "validation");
      return;
    }
    setSaving(true);
    try {
      const saved = await saveTeacherSubjectAssignments({
        academicSessionId: selectedSessionId,
        classId,
        sectionId,
        mappings: rows.map((row) => ({
          subjectId: row.subjectId,
          teacherId: row.teacherId,
        })),
      });
      setRows(saved.length || rows.length === 0 ? saved : rows);
      showToast("Teacher assignments saved successfully", "success");
    } catch (error) {
      showToast(errorMessage(error), "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <section className="rounded-xl bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <RequiredSelect
            label="Academic Session"
            value={selectedSessionId}
            options={sessions}
            disabled={lookupLoading || loading || saving}
            placeholder="Select Academic Session"
            onChange={(value) => {
              setSessionId(value);
              clearLoadedRows();
            }}
          />
          <RequiredSelect
            label="Class"
            value={classId}
            options={classes}
            disabled={lookupLoading || loading || saving}
            placeholder="Select Class"
            onChange={(value) => void changeClass(value)}
          />
          <RequiredSelect
            label="Section"
            value={sectionId}
            options={sections}
            disabled={!classId || sectionsLoading || loading || saving}
            placeholder={
              sectionsLoading ? "Loading Sections..." : "Select Section"
            }
            onChange={(value) => {
              setSectionId(value);
              clearLoadedRows();
            }}
          />
          <div className="flex items-end">
            <button
              onClick={load}
              disabled={loading || saving || lookupLoading || sectionsLoading}
              className="h-10 w-full rounded-xl bg-[#234A91] px-5 text-sm font-medium text-white disabled:opacity-50"
            >
              {loading ? "Loading..." : "Load"}
            </button>
          </div>
        </div>
        {lookupError && (
          <p className="mt-3 text-sm text-red-600">{lookupError}</p>
        )}
      </section>

      <section className="overflow-hidden rounded-xl bg-white shadow-sm">
        <div className="flex items-center justify-between gap-3 border-b border-gray-100 p-4">
          <h2 className="font-semibold text-gray-800">Teacher Assignments</h2>
          <button
            onClick={save}
            disabled={!loaded || loading || saving}
            className="rounded-xl bg-[#234A91] px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save All"}
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="bg-gray-50 text-left text-gray-600">
              <tr>
                <th className="p-3 font-medium">Subject</th>
                <th className="p-3 font-medium">Assigned Teacher</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <StateRow colSpan={2}>Loading teacher assignments...</StateRow>
              )}
              {!loading && !loaded && (
                <StateRow colSpan={2}>
                  Select the required fields and load assignments
                </StateRow>
              )}
              {!loading && loaded && rows.length === 0 && (
                <StateRow colSpan={2}>No subjects found</StateRow>
              )}
              {!loading &&
                rows.map((row) => (
                  <tr key={row.subjectId} className="border-t border-gray-100">
                    <td className="p-3">
                      <p className="font-medium text-gray-800">
                        {row.subjectName}
                      </p>
                      <p className="text-xs text-gray-500">{row.subjectCode}</p>
                    </td>
                    <td className="p-3">
                      <select
                        aria-label={`Assigned teacher for ${row.subjectName}`}
                        value={row.teacherId ?? ""}
                        disabled={saving}
                        onChange={(event) => {
                          const teacherId = Number(event.target.value) || null;
                          setRows((current) =>
                            current.map((item) =>
                              item.subjectId === row.subjectId
                                ? { ...item, teacherId }
                                : item,
                            ),
                          );
                        }}
                        className="h-10 w-full min-w-[280px] rounded-xl border border-gray-200 bg-white px-3"
                      >
                        <option value="">Unassigned</option>
                        {teachers.map((teacher) => (
                          <option key={teacher.id} value={teacher.id}>
                            {teacher.name}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function RequiredSelect({
  label,
  value,
  options,
  disabled,
  placeholder,
  onChange,
}: {
  label: string;
  value: number;
  options: SubjectOption[];
  disabled: boolean;
  placeholder: string;
  onChange: (value: number) => void;
}) {
  return (
    <label className="text-sm font-medium text-gray-700">
      {label} <span className="text-red-600">*</span>
      <select
        value={value || ""}
        onChange={(event) => onChange(Number(event.target.value))}
        disabled={disabled}
        className={fieldClass}
      >
        <option value="">{placeholder}</option>
        {options.map((item) => (
          <option key={item.id} value={item.id}>
            {item.name}
          </option>
        ))}
      </select>
    </label>
  );
}

function StateRow({
  children,
  colSpan,
  error = false,
}: {
  children: string;
  colSpan: number;
  error?: boolean;
}) {
  return (
    <tr>
      <td
        colSpan={colSpan}
        className={`p-10 text-center ${error ? "text-red-600" : "text-gray-500"}`}
      >
        {children}
      </td>
    </tr>
  );
}
