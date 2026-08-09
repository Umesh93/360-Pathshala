import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  BarChart3,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  FileDown,
  FileSpreadsheet,
  FileText,
  GraduationCap,
  Eye,
  Pencil,
  Plus,
  Save,
  SlidersHorizontal,
  Tags,
  Trash2,
  Users,
  X,
} from "lucide-react";
import AdminLayout from "../../../layouts/AdminLayout";
import ConfirmDialog from "../../../components/feedback/ConfirmDialog";
import PageHeader from "../../../components/layout/PageHeader";
import { useToast } from "../students/components/Toast";
import { ResultCard } from "../../examinations/components";
import type { ExamResult } from "../../examinations/types";
import * as service from "./examination.service";
import type {
  ExamDashboard,
  ExamType,
  Examination,
  ExaminationLookups,
  GradeRuleItem,
  GradingSystem,
  MarkRow,
  MeritRow,
  Option,
  PublicationScope,
  RoutineItem,
  SubjectAcademicConfigRow,
} from "./examination.types";

const card = "rounded-lg border border-gray-100 bg-white shadow-sm";
const input =
  "h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm outline-none focus:border-[#234A91] disabled:bg-gray-100";
const primary =
  "inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#234A91] px-4 text-sm font-medium text-white hover:bg-[#1b3a72] disabled:cursor-not-allowed disabled:opacity-50";
const secondary =
  "inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50";
const field = (name: string, required = false) => (
  <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-gray-500">
    {name}
    {required && <span className="ml-1 text-red-600">*</span>}
  </span>
);
const display = (options: Option[], id: number) =>
  options.find((item) => item.id === id)?.name || `#${id}`;
const saveBlob = (blob: Blob, name: string) => {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = name;
  anchor.click();
  URL.revokeObjectURL(url);
};

function Select({
  name,
  value,
  options,
  onChange,
  required = false,
  disabled = false,
  emptyLabel,
}: {
  name: string;
  value?: number;
  options: Option[];
  onChange: (value?: number) => void;
  required?: boolean;
  disabled?: boolean;
  emptyLabel?: string;
}) {
  return (
    <label className="min-w-[150px] flex-1">
      {field(name, required)}
      <select
        className={input}
        value={value || ""}
        disabled={disabled}
        onChange={(event) => onChange(Number(event.target.value) || undefined)}
      >
        <option value="">{emptyLabel || `Select ${name.toLowerCase()}`}</option>
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.name}
          </option>
        ))}
      </select>
    </label>
  );
}
function Dialog({
  title,
  close,
  children,
  wide = false,
}: {
  title: string;
  close: () => void;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/40 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`max-h-[90vh] w-full overflow-y-auto rounded-xl bg-white p-5 shadow-2xl ${wide ? "max-w-6xl" : "max-w-2xl"}`}
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button type="button" aria-label="Close dialog" onClick={close}>
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
function Empty({ text }: { text: string }) {
  return <div className="p-10 text-center text-sm text-gray-500">{text}</div>;
}
function Notice({ text, error = false }: { text: string; error?: boolean }) {
  return (
    <p
      className={`rounded-lg p-3 text-sm ${error ? "bg-red-50 text-red-700" : "bg-blue-50 text-blue-800"}`}
    >
      {text}
    </p>
  );
}

function Dashboard({ sessions }: { sessions: Option[] }) {
  const [sessionId, setSessionId] = useState<number>();
  const [data, setData] = useState<ExamDashboard>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const load = async () => {
    if (!sessionId) return;
    setLoading(true);
    setError("");
    try {
      setData(await service.getDashboard(sessionId));
    } catch (e) {
      setError(service.errorMessage(e));
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="space-y-5">
      <div className={`${card} flex flex-wrap items-end gap-3 p-4`}>
        <Select
          name="Academic session"
          value={sessionId}
          options={sessions}
          onChange={setSessionId}
          required
        />
        <button
          className={primary}
          disabled={!sessionId || loading}
          onClick={load}
        >
          <BarChart3 size={16} />
          {loading ? "Loading..." : "Load dashboard"}
        </button>
      </div>
      {error && <Notice text={error} error />}
      {data && (
        <>
          <div className="grid grid-cols-2 gap-4 xl:grid-cols-5">
            {data.metrics.map((metric) => (
              <div className={`${card} p-5`} key={metric.name}>
                <p className="text-sm capitalize text-gray-500">
                  {metric.name}
                </p>
                <p className="mt-2 text-2xl font-bold">{metric.value}</p>
              </div>
            ))}
          </div>
          <div className="grid gap-5 lg:grid-cols-2">
            {[
              ["Result distribution", data.resultDistribution],
              ["Grade distribution", data.gradeDistribution],
              ["GPA distribution", data.gpaDistribution],
              ["Subject performance", data.subjectPerformance],
              ["Pass vs fail", data.passVsFail],
              ["Published exam averages", data.examAverages],
              ["Exam-wise comparison", data.examWiseComparison],
            ].map(([title, rows]) => (
              <Chart
                key={title as string}
                title={title as string}
                rows={rows as Array<{ name: string; value: number }>}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
function Chart({
  title,
  rows,
}: {
  title: string;
  rows: Array<{ name: string; value: number }>;
}) {
  return (
    <section className={`${card} p-5`}>
      <h2 className="font-semibold">{title}</h2>
      <div className="mt-4 space-y-3">
        {rows.length ? (
          rows.map((row) => (
            <div key={row.name}>
              <div className="mb-1 flex justify-between text-sm">
                <span>{row.name}</span>
                <b>{row.value}</b>
              </div>
              <div className="h-2 rounded bg-gray-100">
                <div
                  className="h-2 rounded bg-[#234A91]"
                  style={{ width: `${Math.min(100, Math.max(0, row.value))}%` }}
                />
              </div>
            </div>
          ))
        ) : (
          <Empty text="No chart data returned." />
        )}
      </div>
    </section>
  );
}

function Examinations({
  lookups,
  examTypesLoading,
  openExamTypes,
  refreshLookups,
}: {
  lookups: ExaminationLookups;
  examTypesLoading: boolean;
  openExamTypes: () => void;
  refreshLookups: () => Promise<void>;
}) {
  const { showToast } = useToast();
  const [rows, setRows] = useState<Examination[]>([]);
  const [editing, setEditing] = useState<Partial<Examination>>();
  const [assigning, setAssigning] = useState<Examination>();
  const [selectedClasses, setSelectedClasses] = useState<number[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [assignmentLoading, setAssignmentLoading] = useState(false);
  const [deleteId, setDeleteId] = useState<number>();
  const load = async () => {
    setLoading(true);
    try {
      setRows(await service.getExaminations({ search: search || undefined }));
    } catch (e) {
      showToast(service.errorMessage(e), "error");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    let active = true;
    service
      .getExaminations()
      .then((items) => {
        if (active) setRows(items);
      })
      .catch((e) => {
        if (active) showToast(service.errorMessage(e), "error");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [showToast]);
  const openAssignments = async (exam: Examination) => {
    setAssigning(exam);
    setSelectedClasses([]);
    setAssignmentLoading(true);
    try {
      setSelectedClasses(
        (await service.getExamClasses(exam.id)).map((item) => item.id),
      );
    } catch (e) {
      showToast(service.errorMessage(e), "error");
    } finally {
      setAssignmentLoading(false);
    }
  };
  const saveExam = async () => {
    if (
      !editing?.name?.trim() ||
      !editing.academicSessionId ||
      !editing.startsOn ||
      !editing.endsOn ||
      !editing.status
    )
      return showToast(
        "Complete all required examination fields.",
        "validation",
      );
    if (editing.endsOn <= editing.startsOn)
      return showToast("End date must be after start date.", "validation");
    if (!editing.examTypeId)
      return showToast("Exam type is required.", "validation");
    if (!editing.resultPublishDate)
      return showToast("Result publish date is required.", "validation");
    if (editing.resultPublishDate < editing.endsOn)
      return showToast(
        "Publish date cannot be before the examination ends.",
        "validation",
      );
    setSaving(true);
    try {
      const saved = await service.saveExamination(editing);
      showToast(
        editing.id
          ? "Examination updated."
          : "Examination created. Assign classes to continue.",
      );
      setEditing(undefined);
      await Promise.all([load(), refreshLookups()]);
      if (!editing.id) await openAssignments(saved);
    } catch (e) {
      showToast(service.errorMessage(e), "error");
    } finally {
      setSaving(false);
    }
  };
  const saveAssignments = async () => {
    if (!assigning) return;
    if (!selectedClasses.length)
      return showToast("Select at least one class.", "validation");
    setSaving(true);
    try {
      await service.saveExamClasses(assigning.id, selectedClasses);
      showToast("Class assignments saved.");
      setAssigning(undefined);
    } catch (e) {
      showToast(service.errorMessage(e), "error");
    } finally {
      setSaving(false);
    }
  };
  const remove = async () => {
    if (!deleteId) return;
    setSaving(true);
    try {
      await service.deleteExamination(deleteId);
      setDeleteId(undefined);
      await Promise.all([load(), refreshLookups()]);
      showToast("Examination deleted.");
    } catch (e) {
      showToast(service.errorMessage(e), "error");
    } finally {
      setSaving(false);
    }
  };
  return (
    <div className="space-y-4">
      <div className={`${card} flex flex-col gap-3 p-4 sm:flex-row`}>
        <input
          className={input}
          placeholder="Search examinations"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button className={secondary} disabled={loading} onClick={load}>
          Search
        </button>
        <button
          className={primary}
          onClick={() =>
            setEditing({
              status: "UPCOMING",
              description: "",
              includeInCgpa: false,
            })
          }
        >
          <Plus size={16} />
          New exam
        </button>
      </div>
      <div className={`${card} overflow-x-auto`}>
        <table className="w-full min-w-[850px] text-left text-sm">
          <thead className="border-b bg-gray-50 text-xs uppercase text-gray-500">
            <tr>
              <th className="p-4">Name</th>
              <th>Session</th>
              <th>Dates</th>
              <th>Status</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {!loading &&
              rows.map((row) => (
                <tr className="border-b last:border-0" key={row.id}>
                  <td className="p-4 font-semibold">{row.name}</td>
                  <td>{display(lookups.sessions, row.academicSessionId)}</td>
                  <td>
                    {row.startsOn} to {row.endsOn}
                  </td>
                  <td>
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-semibold ${row.published ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-600"}`}
                    >
                      {row.published ? "PUBLISHED" : row.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <button
                        className="text-[#234A91]"
                        aria-label={`Edit ${row.name}`}
                        onClick={() => setEditing(row)}
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        className="inline-flex items-center gap-1 text-sm text-indigo-700"
                        onClick={() => openAssignments(row)}
                      >
                        <Users size={16} />
                        Classes
                      </button>
                      <button
                        className="text-red-600"
                        aria-label={`Delete ${row.name}`}
                        onClick={() => setDeleteId(row.id)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
        {loading ? (
          <Empty text="Loading examinations..." />
        ) : (
          !rows.length && <Empty text="No examinations found." />
        )}
      </div>
      {editing && (
        <Dialog
          title={editing.id ? "Edit examination" : "Create examination"}
          close={() => !saving && setEditing(undefined)}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <label>
              {field("Name", true)}
              <input
                className={input}
                value={editing.name || ""}
                onChange={(e) =>
                  setEditing({ ...editing, name: e.target.value })
                }
              />
            </label>
            <Select
              name="Session"
              required
              value={editing.academicSessionId}
              options={lookups.sessions}
              onChange={(academicSessionId) =>
                setEditing({ ...editing, academicSessionId })
              }
            />
            <Select
              name="Exam type"
              required
              value={editing.examTypeId}
              options={lookups.examTypes.filter(
                (type) =>
                  type.active !== false || type.id === editing.examTypeId,
              )}
              disabled={examTypesLoading || !lookups.examTypes.length}
              onChange={(examTypeId) => setEditing({ ...editing, examTypeId })}
            />
            {examTypesLoading ? (
              <div className="flex items-end pb-2 text-sm text-gray-500">
                Loading exam types...
              </div>
            ) : (
              !lookups.examTypes.length && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 sm:col-span-2">
                  <p>No Exam Types found. Create an Exam Type first.</p>
                  <button
                    type="button"
                    className="mt-2 inline-flex items-center gap-1 font-medium text-[#234A91]"
                    onClick={() => {
                      setEditing(undefined);
                      openExamTypes();
                    }}
                  >
                    <Plus size={15} />
                    Create Exam Type
                  </button>
                </div>
              )
            )}
            <label>
              {field("Start", true)}
              <input
                type="date"
                className={input}
                value={editing.startsOn || ""}
                onChange={(e) =>
                  setEditing({ ...editing, startsOn: e.target.value })
                }
              />
            </label>
            <label>
              {field("End", true)}
              <input
                type="date"
                min={editing.startsOn}
                className={input}
                value={editing.endsOn || ""}
                onChange={(e) =>
                  setEditing({ ...editing, endsOn: e.target.value })
                }
              />
            </label>
            <label>
              {field("Result Publish Date", true)}
              <input
                type="date"
                min={editing.endsOn}
                className={input}
                value={editing.resultPublishDate || ""}
                onChange={(e) =>
                  setEditing({
                    ...editing,
                    resultPublishDate: e.target.value || undefined,
                  })
                }
              />
            </label>
            <label>
              {field("Status", true)}
              <select
                className={input}
                value={editing.status || "UPCOMING"}
                onChange={(e) =>
                  setEditing({ ...editing, status: e.target.value })
                }
              >
                <option value="UPCOMING">Upcoming</option>
                <option value="ACTIVE">Active</option>
                <option value="COMPLETED">Completed</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </label>
            <label className="sm:col-span-2">
              {field("Description")}
              <textarea
                className="min-h-20 w-full rounded-lg border border-gray-200 p-3 text-sm"
                value={editing.description || ""}
                onChange={(e) =>
                  setEditing({ ...editing, description: e.target.value })
                }
              />
            </label>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 sm:col-span-2">
              <input
                type="checkbox"
                checked={editing.includeInCgpa ?? false}
                onChange={(e) =>
                  setEditing({ ...editing, includeInCgpa: e.target.checked })
                }
              />
              Include in CGPA
            </label>
          </div>
          <div className="mt-5 flex justify-end">
            <button
              className={primary}
              disabled={saving || examTypesLoading || !lookups.examTypes.length}
              onClick={saveExam}
            >
              <Save size={16} />
              {saving ? "Saving..." : "Save examination"}
            </button>
          </div>
        </Dialog>
      )}
      {assigning && (
        <Dialog
          title={`Assign classes: ${assigning.name}`}
          close={() => !saving && setAssigning(undefined)}
        >
          {assignmentLoading ? (
            <Empty text="Loading current class assignments..." />
          ) : lookups.classes.length ? (
            <div className="grid gap-2 sm:grid-cols-2">
              {lookups.classes.map((item) => (
                <label
                  key={item.id}
                  className="flex items-center gap-3 rounded-lg border border-gray-200 p-3 text-sm"
                >
                  <input
                    type="checkbox"
                    checked={selectedClasses.includes(item.id)}
                    onChange={(e) =>
                      setSelectedClasses(
                        e.target.checked
                          ? [...selectedClasses, item.id]
                          : selectedClasses.filter((id) => id !== item.id),
                      )
                    }
                  />
                  {item.name}
                </label>
              ))}
            </div>
          ) : (
            <Empty text="No classes are available to assign." />
          )}
          <Notice text="Routine and marks options are limited to these assigned classes." />
          <div className="mt-5 flex justify-end">
            <button
              className={primary}
              disabled={saving || assignmentLoading || !lookups.classes.length}
              onClick={saveAssignments}
            >
              <Save size={16} />
              {saving ? "Saving..." : "Save class assignments"}
            </button>
          </div>
        </Dialog>
      )}
      <ConfirmDialog
        open={deleteId !== undefined}
        title="Delete examination"
        description="This removes the examination and its configured data."
        confirmLabel={saving ? "Deleting..." : "Delete"}
        variant="destructive"
        onConfirm={remove}
        onCancel={() => !saving && setDeleteId(undefined)}
      />
    </div>
  );
}

function ExamTypes({
  refreshLookups,
}: {
  refreshLookups: () => Promise<void>;
}) {
  const { showToast } = useToast();
  const [rows, setRows] = useState<ExamType[]>([]);
  const [form, setForm] = useState<Partial<ExamType>>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [updatingId, setUpdatingId] = useState<number>();
  const load = async () => {
    setLoading(true);
    try {
      setRows(await service.getExamTypes());
    } catch (e) {
      showToast(service.errorMessage(e), "error");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    let active = true;
    service
      .getExamTypes()
      .then((items) => {
        if (active) setRows(items);
      })
      .catch((e) => {
        if (active) showToast(service.errorMessage(e), "error");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [showToast]);
  const save = async () => {
    if (!form?.name?.trim())
      return showToast("Exam type name is required.", "validation");
    if (
      form.weightage == null ||
      !Number.isFinite(form.weightage) ||
      form.weightage < 0 ||
      form.weightage > 100
    )
      return showToast("Weightage must be between 0 and 100.", "validation");
    setSaving(true);
    try {
      await service.saveExamType({
        id: form.id,
        name: form.name.trim(),
        description: form.description?.trim() || "",
        weightage: form.weightage,
        active: form.active ?? true,
      });
      showToast(form.id ? "Exam type updated." : "Exam type created.");
      setForm(undefined);
      await Promise.all([load(), refreshLookups()]);
    } catch (e) {
      showToast(service.errorMessage(e), "error");
    } finally {
      setSaving(false);
    }
  };
  const toggleStatus = async (examType: ExamType) => {
    setUpdatingId(examType.id);
    try {
      const active = !examType.active;
      await service.updateExamTypeStatus(examType.id, active);
      setRows(
        rows.map((item) =>
          item.id === examType.id ? { ...item, active } : item,
        ),
      );
      await refreshLookups();
      showToast(active ? "Exam type enabled." : "Exam type disabled.");
    } catch (e) {
      showToast(service.errorMessage(e), "error");
    } finally {
      setUpdatingId(undefined);
    }
  };
  return (
    <div className="space-y-4">
      <div
        className={`${card} flex flex-wrap items-center justify-between gap-3 p-4`}
      >
        <div>
          <h2 className="font-semibold text-gray-900">Exam Types</h2>
          <p className="text-sm text-gray-500">
            Configure the types available when creating examinations.
          </p>
        </div>
        <button
          className={primary}
          onClick={() =>
            setForm({ name: "", description: "", weightage: 0, active: true })
          }
        >
          <Plus size={16} />
          Create Exam Type
        </button>
      </div>
      {loading ? (
        <div className={card}>
          <Empty text="Loading exam types..." />
        </div>
      ) : rows.length ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {rows.map((examType) => (
            <section className={`${card} p-5`} key={examType.id}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900">
                      {examType.name}
                    </h3>
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-semibold ${examType.active ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-600"}`}
                    >
                      {examType.active ? "ACTIVE" : "DISABLED"}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-gray-500">
                    {examType.description || "No description"}
                  </p>
                </div>
                <span className="shrink-0 rounded-lg bg-blue-50 px-3 py-2 text-sm font-semibold text-[#234A91]">
                  {examType.weightage}%
                </span>
              </div>
              <div className="mt-5 flex justify-end gap-4">
                <button
                  className="inline-flex items-center gap-1 text-sm text-[#234A91]"
                  onClick={() => setForm(examType)}
                >
                  <Pencil size={16} />
                  Edit
                </button>
                <button
                  className={
                    examType.active
                      ? "text-sm font-medium text-red-600"
                      : "text-sm font-medium text-emerald-700"
                  }
                  disabled={updatingId === examType.id}
                  onClick={() => toggleStatus(examType)}
                >
                  {updatingId === examType.id
                    ? "Updating..."
                    : examType.active
                      ? "Disable"
                      : "Enable"}
                </button>
              </div>
            </section>
          ))}
        </div>
      ) : (
        <div className={card}>
          <Empty text="No exam types found. Create one to begin." />
        </div>
      )}
      {form && (
        <Dialog
          title={form.id ? "Edit Exam Type" : "Create Exam Type"}
          close={() => !saving && setForm(undefined)}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <label>
              {field("Name", true)}
              <input
                className={input}
                value={form.name || ""}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </label>
            <label>
              {field("Weightage", true)}
              <input
                type="number"
                min="0"
                max="100"
                step="0.01"
                className={input}
                value={form.weightage ?? ""}
                onChange={(e) =>
                  setForm({
                    ...form,
                    weightage:
                      e.target.value === ""
                        ? undefined
                        : Number(e.target.value),
                  })
                }
              />
            </label>
            <label className="sm:col-span-2">
              {field("Description")}
              <textarea
                className="min-h-24 w-full rounded-lg border border-gray-200 p-3 text-sm outline-none focus:border-[#234A91]"
                value={form.description || ""}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-700 sm:col-span-2">
              <input
                type="checkbox"
                checked={form.active ?? true}
                onChange={(e) => setForm({ ...form, active: e.target.checked })}
              />
              Active
            </label>
          </div>
          <div className="mt-5 flex justify-end">
            <button className={primary} disabled={saving} onClick={save}>
              <Save size={16} />
              {saving ? "Saving..." : "Save Exam Type"}
            </button>
          </div>
        </Dialog>
      )}
    </div>
  );
}

function Routine({ lookups }: { lookups: ExaminationLookups }) {
  const { showToast } = useToast();
  const [examId, setExamId] = useState<number>();
  const [rows, setRows] = useState<RoutineItem[]>([]);
  const [assigned, setAssigned] = useState<Option[]>([]);
  const [form, setForm] = useState<Partial<RoutineItem>>();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const exam = lookups.exams.find((item) => item.id === examId);
  const load = async (id?: number) => {
    setRows([]);
    setAssigned([]);
    if (!id) return;
    setLoading(true);
    try {
      const [routine, classes] = await Promise.all([
        service.getRoutine(id),
        service.getExamClasses(id),
      ]);
      setRows(routine);
      setAssigned(classes);
    } catch (e) {
      showToast(service.errorMessage(e), "error");
    } finally {
      setLoading(false);
    }
  };
  const chooseExam = (id?: number) => {
    setExamId(id);
    setForm(undefined);
    void load(id);
  };
  const save = async () => {
    if (
      !form?.classId ||
      !form.sectionId ||
      !form.subjectId ||
      !form.examDate ||
      !form.startTime ||
      !form.endTime ||
      form.fullMarks == null ||
      form.passMarks == null
    )
      return showToast("Complete all required routine fields.", "validation");
    if (
      (exam?.startsOn && form.examDate < exam.startsOn) ||
      (exam?.endsOn && form.examDate > exam.endsOn)
    )
      return showToast(
        "Exam date must be within the examination date range.",
        "validation",
      );
    if (form.endTime <= form.startTime)
      return showToast("End time must be after start time.", "validation");
    if (
      form.fullMarks <= 0 ||
      form.passMarks < 0 ||
      form.passMarks > form.fullMarks
    )
      return showToast(
        "Full marks must be positive and pass marks cannot exceed full marks.",
        "validation",
      );
    setSaving(true);
    try {
      await service.saveRoutine({ ...form, examId });
      showToast("Routine entry saved.");
      setForm(undefined);
      await load(examId);
    } catch (e) {
      showToast(service.errorMessage(e), "error");
    } finally {
      setSaving(false);
    }
  };
  const pdf = async () => {
    if (!examId) return;
    setDownloading(true);
    try {
      saveBlob(
        await service.exportRoutinePdf(examId),
        `exam-routine-${examId}.pdf`,
      );
    } catch (e) {
      showToast(service.errorMessage(e), "error");
    } finally {
      setDownloading(false);
    }
  };
  return (
    <div className="space-y-4">
      <div className={`${card} flex flex-wrap items-end gap-3 p-4`}>
        <Select
          name="Examination"
          value={examId}
          options={lookups.exams}
          onChange={chooseExam}
          required
        />
        <button
          className={primary}
          disabled={!examId || loading || !assigned.length}
          onClick={() => setForm({ examId })}
        >
          <Plus size={16} />
          Add schedule
        </button>
        <button
          className={secondary}
          disabled={!examId || downloading}
          onClick={pdf}
        >
          <FileText size={16} />
          {downloading ? "Preparing PDF..." : "Routine PDF"}
        </button>
      </div>
      {examId && !loading && !assigned.length && (
        <Notice text="Assign at least one class to this examination before creating its routine." />
      )}
      <div className={`${card} overflow-x-auto`}>
        <table className="w-full min-w-[800px] text-left text-sm">
          <thead className="border-b bg-gray-50 text-xs uppercase text-gray-500">
            <tr>
              <th className="p-4">Date</th>
              <th>Time</th>
              <th>Class / section</th>
              <th>Subject</th>
              <th>Pass / full</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {!loading &&
              rows.map((row) => (
                <tr className="border-b" key={row.id}>
                  <td className="p-4">{row.examDate}</td>
                  <td>
                    {row.startTime} - {row.endTime}
                  </td>
                  <td>
                    {display(lookups.classes, row.classId)} /{" "}
                    {display(lookups.sections, row.sectionId)}
                  </td>
                  <td>{display(lookups.subjects, row.subjectId)}</td>
                  <td>
                    {row.passMarks} / {row.fullMarks}
                  </td>
                  <td>
                    <button
                      className="mr-3 text-[#234A91]"
                      onClick={() => setForm(row)}
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      className="text-red-600"
                      onClick={async () => {
                        try {
                          await service.deleteRoutine(row.id);
                          await load(examId);
                        } catch (e) {
                          showToast(service.errorMessage(e), "error");
                        }
                      }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
        {loading ? (
          <Empty text="Loading routine..." />
        ) : (
          !rows.length && (
            <Empty
              text={
                examId ? "No routine entries found." : "Select an examination."
              }
            />
          )
        )}
      </div>
      {form && (
        <RoutineDialog
          form={form}
          setForm={setForm}
          lookups={lookups}
          assigned={assigned}
          saving={saving}
          close={() => setForm(undefined)}
          save={save}
        />
      )}
    </div>
  );
}
function RoutineDialog({
  form,
  setForm,
  lookups,
  assigned,
  saving,
  close,
  save,
}: {
  form: Partial<RoutineItem>;
  setForm: (value: Partial<RoutineItem>) => void;
  lookups: ExaminationLookups;
  assigned: Option[];
  saving: boolean;
  close: () => void;
  save: () => void;
}) {
  const sections = lookups.sections.filter(
    (item) => item.classId === form.classId,
  );
  const subjects = lookups.subjects.filter(
    (item) => item.classId === form.classId,
  );
  const update = (key: keyof RoutineItem, value: string | number | undefined) =>
    setForm({ ...form, [key]: value });
  return (
    <Dialog title="Routine entry" close={close}>
      <div className="grid gap-4 sm:grid-cols-2">
        <Select
          name="Class"
          required
          value={form.classId}
          options={assigned}
          onChange={(classId) =>
            setForm({
              ...form,
              classId,
              sectionId: undefined,
              subjectId: undefined,
            })
          }
        />
        <Select
          name="Section"
          required
          value={form.sectionId}
          options={sections}
          disabled={!form.classId}
          onChange={(sectionId) => update("sectionId", sectionId)}
        />
        <Select
          name="Subject"
          required
          value={form.subjectId}
          options={subjects}
          disabled={!form.classId}
          onChange={(subjectId) => update("subjectId", subjectId)}
        />
        <Select
          name="Invigilator"
          value={form.invigilatorId}
          options={lookups.teachers}
          onChange={(value) => update("invigilatorId", value)}
        />
        <label>
          {field("Exam date", true)}
          <input
            type="date"
            className={input}
            value={form.examDate || ""}
            onChange={(e) => update("examDate", e.target.value)}
          />
        </label>
        <label>
          {field("Room")}
          <input
            className={input}
            value={form.room || ""}
            onChange={(e) => update("room", e.target.value)}
          />
        </label>
        <label>
          {field("Start time", true)}
          <input
            type="time"
            className={input}
            value={form.startTime || ""}
            onChange={(e) => update("startTime", e.target.value)}
          />
        </label>
        <label>
          {field("End time", true)}
          <input
            type="time"
            className={input}
            value={form.endTime || ""}
            onChange={(e) => update("endTime", e.target.value)}
          />
        </label>
        <label>
          {field("Full marks", true)}
          <input
            type="number"
            min="0.01"
            step="0.01"
            className={input}
            value={form.fullMarks ?? ""}
            onChange={(e) =>
              update(
                "fullMarks",
                e.target.value === "" ? undefined : Number(e.target.value),
              )
            }
          />
        </label>
        <label>
          {field("Pass marks", true)}
          <input
            type="number"
            min="0"
            step="0.01"
            className={input}
            value={form.passMarks ?? ""}
            onChange={(e) =>
              update(
                "passMarks",
                e.target.value === "" ? undefined : Number(e.target.value),
              )
            }
          />
        </label>
      </div>
      <div className="mt-5 flex justify-end">
        <button className={primary} disabled={saving} onClick={save}>
          <Save size={16} />
          {saving ? "Saving..." : "Save routine"}
        </button>
      </div>
    </Dialog>
  );
}

const newRule = (): GradeRuleItem => ({
  grade: "",
  minPercentage: 0,
  maxPercentage: 0,
  gpa: 0,
  passing: true,
  remarks: "",
});
function validateGrading(form: GradingSystem) {
  if (!form.name.trim()) return "Grading system name is required.";
  if (!form.rules.length) return "Add at least one grading rule.";
  if (form.rules.some((rule) => !rule.grade.trim()))
    return "Every rule requires a grade name.";
  if (
    form.rules.some(
      (rule) =>
        rule.minPercentage < 0 ||
        rule.maxPercentage > 100 ||
        rule.minPercentage >= rule.maxPercentage,
    )
  )
    return "Each range must be within 0-100 and minimum must be less than maximum.";
  if (form.rules.some((rule) => rule.gpa < 0)) return "GPA cannot be negative.";
  const sorted = [...form.rules].sort(
    (a, b) => a.minPercentage - b.minPercentage,
  );
  if (sorted[0].minPercentage !== 0 || sorted.at(-1)?.maxPercentage !== 100)
    return "Grade rules must cover exactly 0 through 100.";
  for (let index = 1; index < sorted.length; index += 1)
    if (sorted[index].minPercentage !== sorted[index - 1].maxPercentage)
      return "Grade ranges must be continuous with no gaps or overlaps.";
  return "";
}
function Grading({ sessions }: { sessions: Option[] }) {
  const { showToast } = useToast();
  const [sessionId, setSessionId] = useState<number>();
  const [rows, setRows] = useState<GradingSystem[]>([]);
  const [form, setForm] = useState<GradingSystem>();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const load = async (id?: number) => {
    setRows([]);
    if (!id) return;
    setLoading(true);
    try {
      setRows(await service.getGrading(id));
    } catch (e) {
      showToast(service.errorMessage(e), "error");
    } finally {
      setLoading(false);
    }
  };
  const chooseSession = (id?: number) => {
    setSessionId(id);
    void load(id);
  };
  const save = async () => {
    if (!form) return;
    const message = validateGrading(form);
    if (message) return showToast(message, "validation");
    setSaving(true);
    try {
      await service.saveGrading(form);
      showToast("Grading system and rules saved.");
      setForm(undefined);
      await load(sessionId);
    } catch (e) {
      showToast(service.errorMessage(e), "error");
    } finally {
      setSaving(false);
    }
  };
  return (
    <div className="space-y-4">
      <div className={`${card} flex flex-wrap items-end gap-3 p-4`}>
        <Select
          name="Academic session"
          value={sessionId}
          options={sessions}
          onChange={chooseSession}
          required
        />
        <button
          className={primary}
          disabled={!sessionId}
          onClick={() =>
            setForm({
              id: 0,
              academicSessionId: sessionId || 0,
              name: "",
              active: false,
              rules: [newRule()],
            })
          }
        >
          <Plus size={16} />
          Add system
        </button>
      </div>
      {loading ? (
        <div className={card}>
          <Empty text="Loading grading systems..." />
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {rows.map((system) => (
            <section className={`${card} p-5`} key={system.id}>
              <div className="flex justify-between">
                <div>
                  <h2 className="font-semibold">{system.name}</h2>
                  <p className="text-sm text-gray-500">
                    {display(sessions, system.academicSessionId)}
                  </p>
                </div>
                <b
                  className={
                    system.active ? "text-emerald-700" : "text-gray-500"
                  }
                >
                  {system.active ? "ACTIVE" : "DRAFT"}
                </b>
              </div>
              <div className="mt-4 space-y-2 text-sm">
                {system.rules.map((rule) => (
                  <div key={rule.id || rule.grade}>
                    {rule.grade}: {rule.minPercentage}-{rule.maxPercentage}% /
                    GPA {rule.gpa}
                  </div>
                ))}
              </div>
              <div className="mt-4 flex justify-end gap-3">
                <button
                  className="text-[#234A91]"
                  onClick={() => setForm(system)}
                >
                  <Pencil size={16} />
                </button>
                <button
                  className="text-emerald-700"
                  onClick={async () => {
                    try {
                      if (system.active)
                        await service.deactivateGrading(system.id);
                      else await service.activateGrading(system.id);
                      await load(sessionId);
                      showToast(
                        system.active
                          ? "Grading system deactivated."
                          : "Grading system activated.",
                      );
                    } catch (e) {
                      showToast(service.errorMessage(e), "error");
                    }
                  }}
                >
                  {system.active ? "Deactivate" : "Activate"}
                </button>
              </div>
            </section>
          ))}
        </div>
      )}
      {!loading && sessionId && !rows.length && (
        <div className={card}>
          <Empty text="No grading systems found for this session." />
        </div>
      )}
      {form && (
        <GradingDialog
          form={form}
          setForm={setForm}
          saving={saving}
          close={() => setForm(undefined)}
          save={save}
        />
      )}
    </div>
  );
}
function GradingDialog({
  form,
  setForm,
  saving,
  close,
  save,
}: {
  form: GradingSystem;
  setForm: (value: GradingSystem) => void;
  saving: boolean;
  close: () => void;
  save: () => void;
}) {
  const updateRule = (index: number, patch: Partial<GradeRuleItem>) =>
    setForm({
      ...form,
      rules: form.rules.map((rule, itemIndex) =>
        itemIndex === index ? { ...rule, ...patch } : rule,
      ),
    });
  return (
    <Dialog title="Grading system" close={close}>
      <label>
        {field("Name", true)}
        <input
          className={input}
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
      </label>
      <p className="mt-4 text-xs text-gray-500">
        Rules must continuously cover 0-100 with touching boundaries and no gaps
        or overlaps.
      </p>
      <div className="mt-2 space-y-3">
        {form.rules.map((rule, index) => (
          <div
            className="grid grid-cols-2 gap-2 rounded-lg border border-gray-100 p-3 sm:grid-cols-6"
            key={rule.id || index}
          >
            <input
              className={input}
              aria-label="Grade"
              placeholder="Grade *"
              value={rule.grade}
              onChange={(e) => updateRule(index, { grade: e.target.value })}
            />
            <input
              type="number"
              min="0"
              max="100"
              className={input}
              aria-label="Minimum percentage"
              placeholder="Min %"
              value={rule.minPercentage}
              onChange={(e) =>
                updateRule(index, { minPercentage: Number(e.target.value) })
              }
            />
            <input
              type="number"
              min="0"
              max="100"
              className={input}
              aria-label="Maximum percentage"
              placeholder="Max %"
              value={rule.maxPercentage}
              onChange={(e) =>
                updateRule(index, { maxPercentage: Number(e.target.value) })
              }
            />
            <input
              type="number"
              min="0"
              step="0.01"
              className={input}
              aria-label="GPA"
              placeholder="GPA"
              value={rule.gpa}
              onChange={(e) =>
                updateRule(index, { gpa: Number(e.target.value) })
              }
            />
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={rule.passing}
                onChange={(e) =>
                  updateRule(index, { passing: e.target.checked })
                }
              />
              Pass
            </label>
            <button
              className="text-red-600"
              aria-label="Remove rule"
              onClick={() =>
                setForm({
                  ...form,
                  rules: form.rules.filter(
                    (_, itemIndex) => itemIndex !== index,
                  ),
                })
              }
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
      <button
        className="mt-3 text-sm text-[#234A91]"
        onClick={() => setForm({ ...form, rules: [...form.rules, newRule()] })}
      >
        Add rule
      </button>
      <div className="mt-5 flex justify-end">
        <button className={primary} disabled={saving} onClick={save}>
          <Save size={16} />
          {saving ? "Saving..." : "Save grading system"}
        </button>
      </div>
    </Dialog>
  );
}

function Marks({ lookups }: { lookups: ExaminationLookups }) {
  const { showToast } = useToast();
  const [filters, setFilters] = useState<{
    sessionId?: number;
    examId?: number;
    classId?: number;
    sectionId?: number;
    subjectId?: number;
  }>({});
  const [assigned, setAssigned] = useState<Option[]>([]);
  const [routine, setRoutine] = useState<RoutineItem[]>([]);
  const [rows, setRows] = useState<MarkRow[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const selectedExam = lookups.exams.find((item) => item.id === filters.examId);
  const published = Boolean(selectedExam?.published);
  const exams = lookups.exams.filter(
    (item) => item.academicSessionId === filters.sessionId,
  );
  const sections = lookups.sections.filter(
    (item) =>
      item.classId === filters.classId &&
      routine.some(
        (entry) =>
          entry.classId === filters.classId && entry.sectionId === item.id,
      ),
  );
  const subjects = lookups.subjects.filter(
    (item) =>
      item.classId === filters.classId &&
      routine.some(
        (entry) =>
          entry.classId === filters.classId &&
          entry.sectionId === filters.sectionId &&
          entry.subjectId === item.id,
      ),
  );
  const examSubject = routine.find(
    (entry) =>
      entry.classId === filters.classId &&
      entry.sectionId === filters.sectionId &&
      entry.subjectId === filters.subjectId,
  );
  const chooseSession = (sessionId?: number) => {
    setFilters({ sessionId });
    setAssigned([]);
    setRoutine([]);
    setRows([]);
    setLoaded(false);
  };
  const chooseExam = async (examId?: number) => {
    setFilters({ sessionId: filters.sessionId, examId });
    setAssigned([]);
    setRoutine([]);
    setRows([]);
    setLoaded(false);
    if (!examId) return;
    setLoading(true);
    try {
      const [classes, entries] = await Promise.all([
        service.getExamClasses(examId),
        service.getRoutine(examId),
      ]);
      setAssigned(
        classes.filter((item) =>
          entries.some((entry) => entry.classId === item.id),
        ),
      );
      setRoutine(entries);
    } catch (e) {
      showToast(service.errorMessage(e), "error");
    } finally {
      setLoading(false);
    }
  };
  const load = async () => {
    if (
      !filters.examId ||
      !filters.classId ||
      !filters.sectionId ||
      !filters.subjectId ||
      !examSubject
    )
      return showToast(
        "Complete the session, exam, class, section, and subject selection.",
        "validation",
      );
    setLoading(true);
    setLoaded(false);
    try {
      setRows(
        await service.getMarks(filters.examId, {
          classId: filters.classId,
          sectionId: filters.sectionId,
          subjectId: filters.subjectId,
        }),
      );
      setLoaded(true);
    } catch (e) {
      showToast(service.errorMessage(e), "error");
    } finally {
      setLoading(false);
    }
  };
  const save = async () => {
    if (!examSubject) return;
    const invalid = rows.find(
      (row) =>
        !row.absent &&
        (row.obtainedMarks == null ||
          row.obtainedMarks < 0 ||
          row.obtainedMarks > examSubject.fullMarks),
    );
    if (invalid)
      return showToast(
        `Enter marks from 0 to ${examSubject.fullMarks} for ${invalid.studentName}.`,
        "validation",
      );
    setSaving(true);
    try {
      await service.saveMarks(
        examSubject.id,
        rows.map((row) => ({
          studentId: row.studentId,
          obtainedMarks: row.absent ? undefined : row.obtainedMarks,
          absent: row.absent,
        })),
      );
      showToast("All marks saved.");
      await load();
    } catch (e) {
      showToast(service.errorMessage(e), "error");
    } finally {
      setSaving(false);
    }
  };
  return (
    <div className="space-y-4">
      <div
        className={`${card} grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6`}
      >
        <Select
          name="Academic session"
          value={filters.sessionId}
          options={lookups.sessions}
          onChange={chooseSession}
          required
        />
        <Select
          name="Exam"
          value={filters.examId}
          options={exams}
          disabled={!filters.sessionId}
          onChange={chooseExam}
          required
        />
        <Select
          name="Class"
          value={filters.classId}
          options={assigned}
          disabled={!filters.examId || loading}
          onChange={(classId) => {
            setFilters({
              ...filters,
              classId,
              sectionId: undefined,
              subjectId: undefined,
            });
            setLoaded(false);
          }}
          required
        />
        <Select
          name="Section"
          value={filters.sectionId}
          options={sections}
          disabled={!filters.classId}
          onChange={(sectionId) => {
            setFilters({ ...filters, sectionId, subjectId: undefined });
            setLoaded(false);
          }}
          required
        />
        <Select
          name="Subject"
          value={filters.subjectId}
          options={subjects}
          disabled={!filters.sectionId}
          onChange={(subjectId) => {
            setFilters({ ...filters, subjectId });
            setLoaded(false);
          }}
          required
        />
        <button
          className={`${primary} mt-5`}
          disabled={loading || !examSubject}
          onClick={load}
        >
          <ClipboardList size={16} />
          {loading ? "Loading..." : "Load students"}
        </button>
      </div>
      {published && (
        <Notice text="This examination is published. Marks are read-only until it is unpublished." />
      )}{" "}
      {loaded && (
        <div className={`${card} overflow-x-auto`}>
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="border-b bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="p-4">Roll</th>
                <th>Admission No</th>
                <th>Student Name</th>
                <th>Full Marks</th>
                <th>Pass Marks</th>
                <th>Obtained Marks</th>
                <th>Absent</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr className="border-b" key={row.studentId}>
                  <td className="p-4">{row.rollNumber || "-"}</td>
                  <td>{row.admissionNumber || "-"}</td>
                  <td className="font-medium">{row.studentName}</td>
                  <td>{examSubject?.fullMarks}</td>
                  <td>{examSubject?.passMarks}</td>
                  <td>
                    <input
                      className="h-9 w-28 rounded border px-2 disabled:bg-gray-100"
                      type="number"
                      min="0"
                      max={examSubject?.fullMarks}
                      step="0.01"
                      disabled={published || row.absent}
                      value={row.obtainedMarks ?? ""}
                      onChange={(e) =>
                        setRows(
                          rows.map((item, itemIndex) =>
                            itemIndex === index
                              ? {
                                  ...item,
                                  obtainedMarks:
                                    e.target.value === ""
                                      ? undefined
                                      : Number(e.target.value),
                                }
                              : item,
                          ),
                        )
                      }
                    />
                  </td>
                  <td>
                    <input
                      type="checkbox"
                      disabled={published}
                      checked={row.absent}
                      onChange={(e) =>
                        setRows(
                          rows.map((item, itemIndex) =>
                            itemIndex === index
                              ? {
                                  ...item,
                                  absent: e.target.checked,
                                  obtainedMarks: e.target.checked
                                    ? undefined
                                    : item.obtainedMarks,
                                }
                              : item,
                          ),
                        )
                      }
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {rows.length ? (
            <button
              className={`${primary} m-4`}
              disabled={saving || published}
              onClick={save}
            >
              <Save size={16} />
              {saving ? "Saving all marks..." : "Save all marks"}
            </button>
          ) : (
            <Empty text="No students are available for this selection." />
          )}
        </div>
      )}
    </div>
  );
}

function Results({
  lookups,
  refreshLookups,
}: {
  lookups: ExaminationLookups;
  refreshLookups: () => Promise<void>;
}) {
  const { showToast } = useToast();
  const [sessionId, setSessionId] = useState<number>();
  const [examId, setExamId] = useState<number>();
  const [classId, setClassId] = useState<number>();
  const [sectionId, setSectionId] = useState<number>();
  const [scopes, setScopes] = useState<PublicationScope[]>([]);
  const [examClasses, setExamClasses] = useState<Option[]>([]);
  const [classSections, setClassSections] = useState<Option[]>([]);
  const [rows, setRows] = useState<ExamResult[]>([]);
  const [detail, setDetail] = useState<ExamResult>();
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [scopesLoading, setScopesLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState<number>();
  const [error, setError] = useState("");
  const [scopeError, setScopeError] = useState("");
  const [mutation, setMutation] = useState<string>();
  const scopeRequest = useRef(0);
  const [confirm, setConfirm] = useState<{
    action: "publish" | "unpublish";
    scope: PublicationScope;
  }>();
  const exams = lookups.exams.filter(
    (item) => item.academicSessionId === sessionId,
  );
  const uniqueOptions = (
    values: Array<{ id: number; name: string }>,
  ): Option[] =>
    Array.from(new Map(values.map((item) => [item.id, item])).values());
  const sections = uniqueOptions(
    scopes
      .filter((scope) => !classId || scope.classId === classId)
      .map((scope) => ({ id: scope.sectionId, name: scope.sectionName })),
  );
  const filteredScopes = scopes.filter(
    (scope) =>
      (!classId || scope.classId === classId) &&
      (!sectionId || scope.sectionId === sectionId),
  );

  const chooseExam = async (id?: number) => {
    const request = ++scopeRequest.current;
    setExamId(id);
    setClassId(undefined);
    setSectionId(undefined);
    setScopes([]);
    setExamClasses([]);
    setClassSections([]);
    setRows([]);
    setLoaded(false);
    setError("");
    setScopeError("");
    setDetail(undefined);
    if (!id) return;
    setScopesLoading(true);
    try {
      const [items, assignedClasses] = await Promise.all([
        service.getPublicationScopes(id),
        service.getExamClasses(id),
      ]);
      if (request === scopeRequest.current) {
        setScopes(items);
        setExamClasses(assignedClasses);
      }
    } catch (requestError) {
      if (request === scopeRequest.current) {
        const message = service.errorMessage(requestError);
        setScopes([]);
        setScopeError(message);
        showToast(message, "error");
      }
    } finally {
      if (request === scopeRequest.current) setScopesLoading(false);
    }
  };

  const resultParams = () => ({
    classId,
    sectionId,
  });
  const load = async () => {
    if (!examId) return;
    setLoading(true);
    setError("");
    try {
      setRows(await service.getStudentResults(examId, resultParams()));
      setLoaded(true);
    } catch (e) {
      const message = service.errorMessage(e);
      setRows([]);
      setLoaded(false);
      setError(message);
      showToast(message, "error");
    } finally {
      setLoading(false);
    }
  };

  const refreshScopes = async () => {
    if (!examId) return;
    setScopes(await service.getPublicationScopes(examId));
  };

  const selectClass = async (id?: number) => {
    setClassId(id);
    setSectionId(undefined);
    setClassSections([]);
    setRows([]);
    setLoaded(false);
    setError("");
    setDetail(undefined);
    if (!id) return;
    try {
      setClassSections(await service.getClassSections(id));
    } catch (requestError) {
      showToast(service.errorMessage(requestError), "error");
    }
  };

  const sectionOptions = classId
    ? uniqueOptions([
        ...classSections,
        ...scopes
          .filter((scope) => scope.classId === classId)
          .map((scope) => ({ id: scope.sectionId, name: scope.sectionName })),
      ])
    : sections;

  const mutate = async () => {
    if (!examId || !confirm) return;
    const { action, scope } = confirm;
    const mutationKey = `${scope.classId}-${scope.sectionId}`;
    setMutation(mutationKey);
    try {
      await service.publishScope(
        examId,
        scope.classId,
        scope.sectionId,
        action === "publish",
      );
      await Promise.all([
        refreshScopes(),
        loaded
          ? service.getStudentResults(examId, resultParams()).then(setRows)
          : Promise.resolve(),
        refreshLookups(),
      ]);
      showToast(
        `${scope.className} - ${scope.sectionName} results ${action === "publish" ? "published" : "unpublished"}.`,
      );
      setConfirm(undefined);
    } catch (e) {
      showToast(service.errorMessage(e), "error");
    } finally {
      setMutation(undefined);
    }
  };

  const viewResult = async (studentId: number) => {
    if (!examId) return;
    setDetailLoading(studentId);
    try {
      setDetail(await service.getStudentResult(examId, studentId));
    } catch (requestError) {
      showToast(service.errorMessage(requestError), "error");
    } finally {
      setDetailLoading(undefined);
    }
  };

  const meritTitle = classId
    ? sectionId
      ? `Merit list: ${examClasses.find((item) => item.id === classId)?.name || "Class"} - ${sectionOptions.find((item) => item.id === sectionId)?.name || "Section"}`
      : `Merit list: ${examClasses.find((item) => item.id === classId)?.name || "Class"}`
    : "Merit list: All classes and sections";

  return (
    <div className="space-y-4">
      <div className={`${card} grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-5`}>
        <Select
          name="Academic session"
          value={sessionId}
          options={lookups.sessions}
          onChange={(id) => {
            scopeRequest.current += 1;
            setSessionId(id);
            setExamId(undefined);
            setClassId(undefined);
            setSectionId(undefined);
            setScopes([]);
            setRows([]);
            setLoaded(false);
            setError("");
            setScopeError("");
            setScopesLoading(false);
            setDetail(undefined);
          }}
          required
        />
        <Select
          name="Examination"
          value={examId}
          options={exams}
          disabled={!sessionId}
          onChange={(id) => void chooseExam(id)}
          required
        />
        <Select
          name="Class"
          value={classId}
          options={examClasses}
          disabled={!examId || scopesLoading}
          emptyLabel="All Classes"
          onChange={(id) => void selectClass(id)}
        />
        <Select
          name="Section"
          value={sectionId}
          options={sectionOptions}
          disabled={!examId || scopesLoading}
          emptyLabel="All Sections"
          onChange={(id) => {
            setSectionId(id);
            setRows([]);
            setLoaded(false);
            setError("");
            setDetail(undefined);
          }}
        />
        <button
          className={`${primary} mt-5`}
          disabled={!sessionId || !examId || loading || scopesLoading}
          onClick={load}
        >
          {loading ? "Loading..." : "Load results"}
        </button>
      </div>
      {scopeError && <Notice text={scopeError} error />}
      {error && <Notice text={error} error />}
      {examId && (
        <section className={`${card} overflow-hidden`}>
          <div className="border-b p-4">
            <h2 className="font-semibold">Publication status</h2>
            <p className="mt-1 text-sm text-gray-500">
              Results are published independently for each class and section.
            </p>
          </div>
          {scopesLoading ? (
            <Empty text="Loading publication scopes..." />
          ) : filteredScopes.length ? (
            <div className="grid gap-3 p-4 md:grid-cols-2 xl:grid-cols-3">
              {filteredScopes.map((scope) => {
                const mutationKey = `${scope.classId}-${scope.sectionId}`;
                const mutating = mutation === mutationKey;
                return (
                  <article
                    className="rounded-lg border border-gray-200 p-4"
                    key={mutationKey}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {scope.className} - {scope.sectionName}
                        </h3>
                        <span
                          className={`mt-2 inline-flex rounded px-2 py-1 text-xs font-semibold ${scope.published ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-700"}`}
                        >
                          {scope.published ? "Published" : "Not Published"}
                        </span>
                      </div>
                      <span
                        className={`text-xs font-semibold ${scope.complete ? "text-green-700" : "text-amber-700"}`}
                      >
                        {scope.complete ? "Complete" : "Incomplete"}
                      </span>
                    </div>
                    <dl className="mt-4 grid grid-cols-3 gap-2 text-sm">
                      <div>
                        <dt className="text-xs text-gray-500">Students</dt>
                        <dd className="font-semibold">{scope.studentCount}</dd>
                      </div>
                      <div>
                        <dt className="text-xs text-gray-500">Routines</dt>
                        <dd className="font-semibold">{scope.routineCount}</dd>
                      </div>
                      <div>
                        <dt className="text-xs text-gray-500">Missing marks</dt>
                        <dd className="font-semibold">
                          {scope.missingMarksCount}
                        </dd>
                      </div>
                    </dl>
                    <div className="mt-4 flex justify-end">
                      <button
                        type="button"
                        className={scope.published ? secondary : primary}
                        disabled={
                          Boolean(mutation) ||
                          (!scope.published && !scope.complete)
                        }
                        onClick={() =>
                          setConfirm({
                            action: scope.published ? "unpublish" : "publish",
                            scope,
                          })
                        }
                      >
                        {mutating
                          ? "Updating..."
                          : scope.published
                            ? "Unpublish"
                            : "Publish"}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <Empty text="No publication scopes match this selection." />
          )}
        </section>
      )}
      {loaded && (
        <>
          <StudentResultsTable
            rows={rows}
            detailLoading={detailLoading}
            onView={viewResult}
          />
          <MeritTable rows={rows} title={meritTitle} />
        </>
      )}
      <ConfirmDialog
        open={Boolean(confirm)}
        title={
          confirm?.action === "publish"
            ? "Publish scoped results"
            : "Unpublish scoped results"
        }
        description={
          confirm
            ? `${confirm.scope.className} - ${confirm.scope.sectionName}: ${confirm.action === "publish" ? "results become visible to students and parents, and marks become read-only." : "results will no longer be visible to students and parents, and marks become editable."}`
            : undefined
        }
        confirmLabel={
          mutation
            ? "Updating..."
            : confirm?.action === "publish"
              ? "Publish"
              : "Unpublish"
        }
        variant={confirm?.action === "unpublish" ? "destructive" : "default"}
        onConfirm={mutate}
        onCancel={() => !mutation && setConfirm(undefined)}
      />
      {detail && (
        <Dialog title="Student result" close={() => setDetail(undefined)} wide>
          <div className="max-h-[78vh] overflow-auto">
            <ResultCard result={detail} />
          </div>
        </Dialog>
      )}
    </div>
  );
}

const resultNumber = (value: number | null | undefined, suffix = "") =>
  value == null ? "-" : `${value}${suffix}`;
const resultRank = (value: number | null | undefined) =>
  value == null ? "-" : `#${value}`;

function StudentResultsTable({
  rows,
  detailLoading,
  onView,
}: {
  rows: ExamResult[];
  detailLoading?: number;
  onView: (studentId: number) => void;
}) {
  return (
    <div className={`${card} overflow-x-auto`}>
      <div className="border-b p-4">
        <h2 className="font-semibold">Student results</h2>
      </div>
      <table className="w-full min-w-[1350px] text-left text-sm">
        <thead className="border-b bg-gray-50 text-xs uppercase text-gray-500">
          <tr>
            <th className="p-4">Student Name</th>
            <th>Admission No.</th>
            <th>Roll</th>
            <th>Class</th>
            <th>Section</th>
            <th>Total</th>
            <th>Full Marks</th>
            <th>Percentage</th>
            <th>Grade</th>
            <th>GPA</th>
            <th>Result</th>
            <th>Rank</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr className="border-b" key={row.studentId}>
              <td className="p-4 font-medium">{row.studentName}</td>
              <td>{row.admissionNumber ?? "-"}</td>
              <td>{row.rollNumber ?? "-"}</td>
              <td>{row.className}</td>
              <td>{row.sectionName}</td>
              <td>{resultNumber(row.total)}</td>
              <td>{resultNumber(row.fullMarks)}</td>
              <td>{resultNumber(row.percentage, "%")}</td>
              <td>{row.grade || "-"}</td>
              <td>{resultNumber(row.gpa)}</td>
              <td>{row.status || "-"}</td>
              <td className="whitespace-nowrap text-xs">
                Sec {resultRank(row.sectionRank)} / Class{" "}
                {resultRank(row.classRank)} / School{" "}
                {resultRank(row.schoolRank)}
              </td>
              <td>
                <button
                  type="button"
                  className={secondary}
                  disabled={detailLoading != null}
                  onClick={() => onView(row.studentId)}
                >
                  <Eye size={16} />
                  {detailLoading === row.studentId
                    ? "Loading..."
                    : "View Result"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {!rows.length && (
        <Empty text="No student results found for this selection." />
      )}
    </div>
  );
}
function MeritTable({ rows, title }: { rows: MeritRow[]; title: string }) {
  return (
    <div className={`${card} overflow-x-auto`}>
      <div className="border-b p-4">
        <h2 className="font-semibold">{title}</h2>
        <p className="text-sm text-gray-500">
          School, class, and section ranks are supplied by the examination
          results service.
        </p>
      </div>
      <table className="w-full min-w-[900px] text-left text-sm">
        <thead className="border-b bg-gray-50 text-xs uppercase text-gray-500">
          <tr>
            <th className="p-4">School Rank</th>
            <th>Student</th>
            <th>Admission / Roll</th>
            <th>Class / Section</th>
            <th>Total</th>
            <th>Percentage</th>
            <th>Grade</th>
            <th>GPA</th>
            <th>Class Rank</th>
            <th>Section Rank</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr className="border-b" key={row.studentId}>
              <td className="p-4 font-bold">{resultRank(row.schoolRank)}</td>
              <td>{row.studentName}</td>
              <td>
                {row.admissionNumber || "-"} / {row.rollNumber || "-"}
              </td>
              <td>
                {row.className} / {row.sectionName}
              </td>
              <td>
                {resultNumber(row.total)} / {resultNumber(row.fullMarks)}
              </td>
              <td>{resultNumber(row.percentage, "%")}</td>
              <td>{row.grade || "-"}</td>
              <td>{resultNumber(row.gpa)}</td>
              <td>{resultRank(row.classRank)}</td>
              <td>{resultRank(row.sectionRank)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {!rows.length && <Empty text="No merit rows found." />}
    </div>
  );
}
function Reports({ lookups }: { lookups: ExaminationLookups }) {
  const { showToast } = useToast();
  const [examId, setExamId] = useState<number>();
  const [pending, setPending] = useState<"csv" | "pdf" | "xlsx">();
  const download = async (format: "csv" | "pdf" | "xlsx") => {
    if (!examId) return;
    setPending(format);
    try {
      saveBlob(
        await service.exportExaminationReport(examId, format),
        `exam-results-${examId}.${format}`,
      );
      showToast(
        `${format === "xlsx" ? "Excel" : format.toUpperCase()} downloaded.`,
      );
    } catch (e) {
      showToast(service.errorMessage(e), "error");
    } finally {
      setPending(undefined);
    }
  };
  return (
    <div className={`${card} p-5`}>
      <h2 className="font-semibold">Examination exports</h2>
      <p className="mt-1 text-sm text-gray-500">
        Download the selected examination report in the required format.
      </p>
      <div className="mt-5 flex flex-wrap items-end gap-3">
        <Select
          name="Examination"
          value={examId}
          options={lookups.exams}
          onChange={setExamId}
        />
        <button
          className={primary}
          disabled={!examId || Boolean(pending)}
          onClick={() => download("csv")}
        >
          <FileDown size={16} />
          {pending === "csv" ? "Preparing..." : "CSV"}
        </button>
        <button
          className={secondary}
          disabled={!examId || Boolean(pending)}
          onClick={() => download("pdf")}
        >
          <FileText size={16} />
          {pending === "pdf" ? "Preparing..." : "PDF"}
        </button>
        <button
          className={secondary}
          disabled={!examId || Boolean(pending)}
          onClick={() => download("xlsx")}
        >
          <FileSpreadsheet size={16} />
          {pending === "xlsx" ? "Preparing..." : "Excel"}
        </button>
      </div>
    </div>
  );
}

function CreditGpaConfiguration({ lookups }: { lookups: ExaminationLookups }) {
  const { showToast } = useToast();
  const [sessionId, setSessionId] = useState<number>();
  const [classId, setClassId] = useState<number>();
  const [rows, setRows] = useState<SubjectAcademicConfigRow[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    if (!sessionId || !classId) return;
    setLoading(true);
    setError("");
    try {
      setRows(await service.getSubjectAcademicConfig(sessionId, classId));
      setLoaded(true);
    } catch (requestError) {
      setRows([]);
      setLoaded(false);
      setError(service.errorMessage(requestError));
    } finally {
      setLoading(false);
    }
  };

  const save = async () => {
    if (!sessionId || !classId) return;
    if (
      rows.some(
        (row) =>
          row.creditHours != null &&
          (!Number.isFinite(row.creditHours) || row.creditHours <= 0),
      )
    ) {
      showToast(
        "Credit hours must be greater than zero when supplied.",
        "validation",
      );
      return;
    }
    setSaving(true);
    try {
      setRows(
        await service.saveSubjectAcademicConfig(sessionId, classId, rows),
      );
      showToast("Credit and GPA configuration saved.");
    } catch (requestError) {
      showToast(service.errorMessage(requestError), "error");
    } finally {
      setSaving(false);
    }
  };

  const update = (index: number, values: Partial<SubjectAcademicConfigRow>) =>
    setRows(
      rows.map((row, rowIndex) =>
        rowIndex === index ? { ...row, ...values } : row,
      ),
    );

  return (
    <div className="space-y-4">
      <div className={`${card} flex flex-wrap items-end gap-3 p-4`}>
        <Select
          name="Academic session"
          value={sessionId}
          options={lookups.sessions}
          onChange={(value) => {
            setSessionId(value);
            setRows([]);
            setLoaded(false);
          }}
          required
        />
        <Select
          name="Class"
          value={classId}
          options={lookups.classes}
          onChange={(value) => {
            setClassId(value);
            setRows([]);
            setLoaded(false);
          }}
          required
        />
        <button
          type="button"
          className={primary}
          disabled={!sessionId || !classId || loading}
          onClick={load}
        >
          {loading ? "Loading..." : "Load subjects"}
        </button>
      </div>
      {error && <Notice text={error} error />}
      {loaded && (
        <div className={`${card} overflow-x-auto`}>
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead className="border-b bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="p-4">Subject</th>
                <th>Credit Hours</th>
                <th>Include in GPA</th>
                <th>Include in CGPA</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr className="border-b last:border-0" key={row.subjectId}>
                  <td className="p-4 font-medium">
                    {row.subjectName}
                    {row.subjectCode && (
                      <span className="ml-2 text-xs font-normal text-gray-500">
                        {row.subjectCode}
                      </span>
                    )}
                  </td>
                  <td>
                    <input
                      type="number"
                      min="0.01"
                      step="0.01"
                      className="h-9 w-32 rounded border border-gray-200 px-2"
                      value={row.creditHours ?? ""}
                      onChange={(event) =>
                        update(index, {
                          creditHours:
                            event.target.value === ""
                              ? null
                              : Number(event.target.value),
                        })
                      }
                    />
                  </td>
                  <td>
                    <input
                      type="checkbox"
                      checked={row.includeInGpa}
                      onChange={(event) =>
                        update(index, { includeInGpa: event.target.checked })
                      }
                    />
                  </td>
                  <td>
                    <input
                      type="checkbox"
                      checked={row.includeInCgpa}
                      onChange={(event) =>
                        update(index, { includeInCgpa: event.target.checked })
                      }
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {rows.length ? (
            <div className="flex justify-end p-4">
              <button
                type="button"
                className={primary}
                disabled={saving}
                onClick={save}
              >
                <Save size={16} /> {saving ? "Saving..." : "Save All"}
              </button>
            </div>
          ) : (
            <Empty text="No active subjects are available for this session and class." />
          )}
        </div>
      )}
    </div>
  );
}

const tabs = [
  ["dashboard", "Dashboard", BarChart3],
  ["examinations", "Examinations", FileText],
  ["exam-types", "Exam Types", Tags],
  ["routine", "Routine", CalendarDays],
  ["grading", "Grading", GraduationCap],
  ["credit-gpa", "Credit/GPA Configuration", SlidersHorizontal],
  ["marks", "Marks entry", ClipboardList],
  ["results", "Results", CheckCircle2],
  ["reports", "Reports", FileDown],
] as const;
type Tab = (typeof tabs)[number][0];
const emptyLookups: ExaminationLookups = {
  sessions: [],
  classes: [],
  sections: [],
  subjects: [],
  teachers: [],
  exams: [],
  examTypes: [],
};
export default function ExaminationWorkspace() {
  const [params, setParams] = useSearchParams();
  const requested = params.get("view");
  const active: Tab = tabs.some(([key]) => key === requested)
    ? (requested as Tab)
    : "dashboard";
  const [lookups, setLookups] = useState<ExaminationLookups>(emptyLookups);
  const [lookupsLoading, setLookupsLoading] = useState(true);
  const refreshLookups = async () => {
    setLookupsLoading(true);
    try {
      setLookups(await service.getLookups());
    } finally {
      setLookupsLoading(false);
    }
  };
  useEffect(() => {
    let active = true;
    service
      .getLookups()
      .then((items) => {
        if (active) setLookups(items);
      })
      .catch(() => undefined)
      .finally(() => {
        if (active) setLookupsLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);
  const select = (view: Tab) => {
    const next = new URLSearchParams(params);
    next.set("view", view);
    setParams(next, { replace: true });
  };
  return (
    <AdminLayout>
      <PageHeader
        title="Examinations"
        subtitle="Plan examinations, enter marks, and publish results"
        breadcrumbs={[
          { label: "Dashboard", href: "/admin/dashboard" },
          { label: "Examinations" },
        ]}
        action={<GraduationCap size={22} />}
      />
      <div className="mb-5 overflow-x-auto rounded-lg border border-gray-200 bg-white p-1.5">
        <nav className="flex min-w-max gap-1">
          {tabs.map(([key, name, Icon]) => (
            <button
              key={key}
              type="button"
              onClick={() => select(key)}
              className={`flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium ${active === key ? "bg-[#234A91] text-white" : "text-gray-600 hover:bg-gray-100"}`}
            >
              <Icon size={16} />
              {name}
            </button>
          ))}
        </nav>
      </div>
      {active === "dashboard" && <Dashboard sessions={lookups.sessions} />}
      {active === "examinations" && (
        <Examinations
          lookups={lookups}
          examTypesLoading={lookupsLoading}
          openExamTypes={() => select("exam-types")}
          refreshLookups={refreshLookups}
        />
      )}
      {active === "exam-types" && <ExamTypes refreshLookups={refreshLookups} />}
      {active === "routine" && <Routine lookups={lookups} />}
      {active === "grading" && <Grading sessions={lookups.sessions} />}
      {active === "credit-gpa" && <CreditGpaConfiguration lookups={lookups} />}
      {active === "marks" && <Marks lookups={lookups} />}
      {active === "results" && (
        <Results lookups={lookups} refreshLookups={refreshLookups} />
      )}
      {active === "reports" && <Reports lookups={lookups} />}
    </AdminLayout>
  );
}
