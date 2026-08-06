import { useEffect, useEffectEvent, useState } from "react";
import {
  BarChart3,
  ChevronLeft,
  ChevronRight,
  FileDown,
  Pencil,
  Plus,
  Send,
  Trash2,
  X,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import ConfirmDialog from "../../components/feedback/ConfirmDialog";
import ErrorState from "../../components/feedback/ErrorState";
import Skeleton from "../../components/Skeleton";
import { useToast } from "../admin/students/components/Toast";
import { AttachmentLinks, Empty, FieldLabel, StatusBadge } from "./components";
import * as service from "./service";
import type {
  Assignment,
  AssignmentDashboard,
  AssignmentFilters,
  AssignmentLookups,
  AssignmentPayload,
  Option,
  ReportFilters,
  ReportRow,
  Review,
  RosterRow,
} from "./types";
import { ASSIGNMENT_CATEGORIES } from "./types";
import { card, formatDate, input, primary, secondary, titleCase } from "./ui";

const emptyLookups: AssignmentLookups = {
  sessions: [],
  classes: [],
  sections: [],
  subjects: [],
  teachers: [],
  teacherScopes: [],
};
const display = (options: Option[], id: number) =>
  options.find((item) => item.id === id)?.name || `#${id}`;
const localDate = (value?: string) => (value ? value.slice(0, 16) : "");
const initialForm = (): AssignmentPayload => ({
  academicSessionId: 0,
  classId: 0,
  sectionIds: [],
  subjectId: 0,
  title: "",
  category: "HOMEWORK",
  description: "",
  instructions: "",
  publishAt: "",
  dueAt: "",
  maximumMarks: undefined,
  allowLateSubmission: false,
  lateSubmissionDeadline: "",
});

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
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/45 p-3">
      <section
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`max-h-[94vh] w-full overflow-y-auto rounded-xl bg-white p-5 shadow-2xl ${wide ? "max-w-5xl" : "max-w-3xl"}`}
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">{title}</h2>
          <button type="button" aria-label="Close" onClick={close}>
            <X className="h-5 w-5" />
          </button>
        </div>
        {children}
      </section>
    </div>
  );
}

function AssignmentForm({
  role,
  lookups,
  assignment,
  close,
  saved,
}: {
  role: "admin" | "teacher";
  lookups: AssignmentLookups;
  assignment?: Assignment;
  close: () => void;
  saved: () => void;
}) {
  const { showToast } = useToast();
  const [form, setForm] = useState<AssignmentPayload>(() =>
    assignment
      ? {
          academicSessionId: assignment.academicSessionId,
          teacherId: assignment.teacherId || undefined,
          classId: assignment.classId,
          sectionIds: [...assignment.sectionIds],
          subjectId: assignment.subjectId,
          title: assignment.title,
          category: assignment.category,
          description: assignment.description,
          instructions: assignment.instructions,
          publishAt: localDate(assignment.publishAt),
          dueAt: localDate(assignment.dueAt),
          maximumMarks: assignment.maximumMarks,
          allowLateSubmission: assignment.allowLateSubmission,
          lateSubmissionDeadline: localDate(assignment.lateSubmissionDeadline),
        }
      : initialForm(),
  );
  const [files, setFiles] = useState<File[]>([]);
  const [saving, setSaving] = useState(false);
  const sections = lookups.sections.filter(
    (item) => !item.classId || item.classId === form.classId,
  );
  const subjects = lookups.subjects.filter((item) => {
    if (item.classId && item.classId !== form.classId) return false;
    if (role !== "teacher" || !form.sectionIds.length) return true;
    return form.sectionIds.every((sectionId) =>
      lookups.teacherScopes.some(
        (scope) =>
          scope.classId === form.classId &&
          scope.sectionId === sectionId &&
          scope.subjectId === item.id,
      ),
    );
  });
  const update = <K extends keyof AssignmentPayload>(
    key: K,
    value: AssignmentPayload[K],
  ) => setForm((current) => ({ ...current, [key]: value }));
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (
      !form.academicSessionId ||
      !form.classId ||
      !form.subjectId ||
      !form.title.trim() ||
      !form.dueAt ||
      !form.sectionIds.length ||
      (role === "admin" && !form.teacherId)
    )
      return showToast(
        "Complete all required assignment fields.",
        "validation",
      );
    if (new Date(form.dueAt) <= new Date())
      return showToast("Due date must be in the future.", "validation");
    if (form.publishAt && new Date(form.publishAt) >= new Date(form.dueAt))
      return showToast(
        "Publish date must be before the due date.",
        "validation",
      );
    if (form.maximumMarks != null && form.maximumMarks <= 0)
      return showToast(
        "Maximum marks must be greater than zero.",
        "validation",
      );
    if (
      form.allowLateSubmission &&
      (!form.lateSubmissionDeadline ||
        new Date(form.lateSubmissionDeadline) <= new Date(form.dueAt))
    )
      return showToast(
        "Late deadline must be after the due date.",
        "validation",
      );
    setSaving(true);
    try {
      const result = await service.saveAssignment(
        { ...form, teacherId: role === "admin" ? form.teacherId : undefined },
        assignment?.id,
      );
      if (files.length) await service.uploadAssignmentFiles(result.id, files);
      showToast(assignment ? "Assignment updated." : "Assignment created.");
      saved();
    } catch (error) {
      showToast(service.assignmentError(error), "error");
    } finally {
      setSaving(false);
    }
  };
  return (
    <Dialog
      title={assignment ? "Edit assignment" : "Create assignment"}
      close={close}
    >
      <form onSubmit={submit} className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <label>
            <FieldLabel name="Academic session" required />
            <select
              className={input}
              value={form.academicSessionId || ""}
              onChange={(e) =>
                update("academicSessionId", Number(e.target.value))
              }
            >
              <option value="">Select session</option>
              {lookups.sessions.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>
          {role === "admin" && (
            <label>
              <FieldLabel name="Teacher" required />
              <select
                className={input}
                value={form.teacherId || ""}
                onChange={(e) =>
                  update("teacherId", Number(e.target.value) || undefined)
                }
              >
                <option value="">Select teacher</option>
                {lookups.teachers.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </label>
          )}
          <label>
            <FieldLabel name="Class" required />
            <select
              className={input}
              value={form.classId || ""}
              onChange={(e) => {
                update("classId", Number(e.target.value));
                update("sectionIds", []);
                update("subjectId", 0);
              }}
            >
              <option value="">Select class</option>
              {lookups.classes.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            <FieldLabel name="Subject" required />
            <select
              className={input}
              value={form.subjectId || ""}
              onChange={(e) => update("subjectId", Number(e.target.value))}
            >
              <option value="">Select subject</option>
               {subjects.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>
          <label className="sm:col-span-2">
            <FieldLabel name="Title" required />
            <input
              className={input}
              maxLength={255}
              value={form.title}
              onChange={(e) => update("title", e.target.value)}
            />
          </label>
          <label>
            <FieldLabel name="Category" required />
            <select
              className={input}
              value={form.category}
              onChange={(e) =>
                update(
                  "category",
                  e.target.value as AssignmentPayload["category"],
                )
              }
            >
              {ASSIGNMENT_CATEGORIES.map((value) => (
                <option key={value} value={value}>
                  {titleCase(value)}
                </option>
              ))}
            </select>
          </label>
          <label>
            <FieldLabel name="Maximum marks" />
            <input
              className={input}
              type="number"
              min="0.01"
              step="0.01"
              value={form.maximumMarks ?? ""}
              onChange={(e) =>
                update(
                  "maximumMarks",
                  e.target.value ? Number(e.target.value) : undefined,
                )
              }
            />
          </label>
          <label>
            <FieldLabel name="Publish at" />
            <input
              className={input}
              type="datetime-local"
              value={form.publishAt || ""}
              onChange={(e) => update("publishAt", e.target.value)}
            />
          </label>
          <label>
            <FieldLabel name="Due at" required />
            <input
              className={input}
              type="datetime-local"
              value={form.dueAt}
              onChange={(e) => update("dueAt", e.target.value)}
            />
          </label>
          <label className="sm:col-span-2">
            <FieldLabel name="Description" />
            <textarea
              className={`${input} min-h-24`}
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
            />
          </label>
          <label className="sm:col-span-2">
            <FieldLabel name="Instructions" />
            <textarea
              className={`${input} min-h-28`}
              value={form.instructions}
              onChange={(e) => update("instructions", e.target.value)}
            />
          </label>
        </div>
        <fieldset>
          <legend className="text-sm font-medium text-gray-700">
            Sections <span className="text-red-600">*</span>
          </legend>
          <div className="mt-2 grid max-h-40 grid-cols-2 gap-2 overflow-y-auto rounded-lg border p-3 sm:grid-cols-3">
            {sections.length ? (
              sections.map((item) => (
                <label
                  key={item.id}
                  className="flex items-center gap-2 text-sm"
                >
                  <input
                    type="checkbox"
                    checked={form.sectionIds.includes(item.id)}
                    onChange={() =>
                      setForm((current) => ({
                        ...current,
                        sectionIds: current.sectionIds.includes(item.id)
                          ? current.sectionIds.filter((id) => id !== item.id)
                          : [...current.sectionIds, item.id],
                        subjectId: 0,
                      }))
                    }
                  />
                  {item.name}
                </label>
              ))
            ) : (
              <p className="col-span-full text-sm text-gray-500">
                Select a class with sections.
              </p>
            )}
          </div>
        </fieldset>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex items-center gap-2 pt-6 text-sm font-medium">
            <input
              type="checkbox"
              checked={form.allowLateSubmission}
              onChange={(e) => update("allowLateSubmission", e.target.checked)}
            />
            Allow late submission
          </label>
          {form.allowLateSubmission && (
            <label>
              <FieldLabel name="Late submission deadline" required />
              <input
                className={input}
                type="datetime-local"
                value={form.lateSubmissionDeadline || ""}
                onChange={(e) =>
                  update("lateSubmissionDeadline", e.target.value)
                }
              />
            </label>
          )}
        </div>
        <label>
          <FieldLabel name="Attachments" />
          <input
            className={input}
            type="file"
            multiple
            accept=".jpg,.jpeg,.png,.gif,.webp,.bmp,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip"
            onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
          />
          <span className="mt-1 block text-xs text-gray-500">
            JPG, PNG, GIF, WebP, BMP, PDF, Office documents, or ZIP. Multiple files allowed.
          </span>
        </label>
        {assignment?.attachments.length ? (
          <div>
            <p className="mb-2 text-sm font-medium text-gray-700">
              Existing attachments
            </p>
            <AttachmentLinks
              assignmentId={assignment.id}
              attachments={assignment.attachments}
            />
          </div>
        ) : null}
        <div className="flex justify-end gap-3 border-t pt-4">
          <button type="button" className={secondary} onClick={close}>
            Cancel
          </button>
          <button className={primary} disabled={saving}>
            {saving ? "Saving..." : "Save assignment"}
          </button>
        </div>
      </form>
    </Dialog>
  );
}

function AssignmentList({
  role,
  lookups,
  refreshKey,
  changed,
}: {
  role: "admin" | "teacher";
  lookups: AssignmentLookups;
  refreshKey: number;
  changed: () => void;
}) {
  const { showToast } = useToast();
  const [page, setPage] = useState({
    content: [] as Assignment[],
    number: 0,
    size: 10,
    totalElements: 0,
    totalPages: 0,
  });
  const [filters, setFilters] = useState<AssignmentFilters>({
    page: 0,
    size: 10,
    sort: "dueAt,desc",
  });
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<Assignment>();
  const [creating, setCreating] = useState(false);
  const [confirm, setConfirm] = useState<{
    type: "delete" | "publish";
    item: Assignment;
  }>();
  const load = async (next = filters) => {
    setLoading(true);
    setError("");
    try {
      if (role === "teacher") {
        const rows = await service.getTeacherAssignments();
        setPage({
          content: rows,
          number: 0,
          size: rows.length || 10,
          totalElements: rows.length,
          totalPages: rows.length ? 1 : 0,
        });
      } else setPage(await service.getAssignments(next));
    } catch (e) {
      setError(service.assignmentError(e));
    } finally {
      setLoading(false);
    }
  };
  const loadEvent = useEffectEvent(load);
  useEffect(() => {
    const timer = window.setTimeout(() => void loadEvent(), 0);
    return () => window.clearTimeout(timer);
  }, [refreshKey]);
  const setFilter = (
    key: keyof AssignmentFilters,
    value: string | number | undefined,
  ) =>
    setFilters((current) => ({
      ...current,
      [key]: value || undefined,
      page: 0,
    }));
  const search = () => {
    const next = { ...filters, search: query.trim() || undefined, page: 0 };
    setFilters(next);
    void load(next);
  };
  const confirmAction = async () => {
    if (!confirm) return;
    try {
      if (confirm.type === "delete")
        await service.deleteAssignment(confirm.item.id);
      else await service.publishAssignment(confirm.item.id);
      showToast(
        confirm.type === "delete"
          ? "Assignment deleted."
          : "Assignment published.",
      );
      setConfirm(undefined);
      await load();
      changed();
    } catch (e) {
      showToast(service.assignmentError(e), "error");
    }
  };
  const options = (
    items: Option[],
    key: keyof AssignmentFilters,
    placeholder: string,
  ) => (
    <select
      className={input}
      value={(filters[key] as number | string) || ""}
      onChange={(e) => setFilter(key, Number(e.target.value))}
    >
      <option value="">All {placeholder}</option>
      {items.map((item) => (
        <option key={item.id} value={item.id}>
          {item.name}
        </option>
      ))}
    </select>
  );
  return (
    <div className="space-y-4">
      <div className={`${card} space-y-3 p-4`}>
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="flex flex-1">
            <input
              className={`${input} mt-0 rounded-r-none`}
              placeholder="Search title or description"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") search();
              }}
            />
            <button className={`${secondary} rounded-l-none`} onClick={search}>
              Search
            </button>
          </div>
          <button className={primary} onClick={() => setCreating(true)}>
            <Plus className="h-4 w-4" />
            New assignment
          </button>
        </div>
        {role === "admin" && (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
            {options(lookups.sessions, "sessionId", "sessions")}
            {options(lookups.classes, "classId", "classes")}
            {options(
              lookups.sections.filter(
                (item) =>
                  !filters.classId ||
                  !item.classId ||
                  item.classId === filters.classId,
              ),
              "sectionId",
              "sections",
            )}
            {options(lookups.subjects, "subjectId", "subjects")}
            {options(lookups.teachers, "teacherId", "teachers")}
            <select
              className={input}
              value={filters.status || ""}
              onChange={(e) => setFilter("status", e.target.value)}
            >
              <option value="">All statuses</option>
              <option>DRAFT</option>
              <option>PUBLISHED</option>
              <option>ACTIVE</option>
              <option>CLOSED</option>
              <option>ARCHIVED</option>
            </select>
            <select
              className={input}
              value={filters.sort}
              onChange={(e) => {
                const next = { ...filters, sort: e.target.value, page: 0 };
                setFilters(next);
                void load(next);
              }}
            >
              <option value="dueAt,desc">Due date: latest</option>
              <option value="dueAt,asc">Due date: earliest</option>
              <option value="title,asc">Title: A-Z</option>
              <option value="createdAt,desc">Newest created</option>
            </select>
          </div>
        )}
        {role === "admin" && (
          <button className={secondary} onClick={() => load(filters)}>
            Apply filters
          </button>
        )}
      </div>
      {loading ? (
        <Skeleton className="h-72" />
      ) : error ? (
        <div className={card}>
          <ErrorState
            title="Assignments unavailable"
            description={error}
            onRetry={() => load()}
          />
        </div>
      ) : !page.content.length ? (
        <div className={card}>
          <Empty text="No assignments match these filters." />
        </div>
      ) : (
        <div className={`${card} overflow-x-auto`}>
          <table className="w-full min-w-[980px] text-left text-sm">
            <thead className="border-b bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="p-4">Assignment</th>
                <th>Class / sections</th>
                <th>Teacher</th>
                <th>Schedule</th>
                <th>Status</th>
                <th>Files</th>
                <th className="pr-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {page.content.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="p-4">
                    <p className="font-semibold text-gray-900">{item.title}</p>
                    <p className="text-xs text-gray-500">
                      {display(lookups.subjects, item.subjectId)} ·{" "}
                      {titleCase(item.category)}
                    </p>
                  </td>
                  <td>
                    <p>{display(lookups.classes, item.classId)}</p>
                    <p className="text-xs text-gray-500">
                      {item.sectionIds
                        .map((id) => display(lookups.sections, id))
                        .join(", ")}
                    </p>
                  </td>
                  <td>
                    {role === "admin"
                      ? display(lookups.teachers, item.teacherId)
                      : "You"}
                  </td>
                  <td>
                    <p>Due {formatDate(item.dueAt)}</p>
                    <p className="text-xs text-gray-500">
                      Publish {formatDate(item.publishAt)}
                    </p>
                  </td>
                  <td>
                    <StatusBadge status={item.status} />
                  </td>
                  <td>
                    <AttachmentLinks
                      assignmentId={item.id}
                      attachments={item.attachments}
                    />
                  </td>
                  <td className="pr-4">
                    <div className="flex justify-end gap-1">
                      {item.status === "DRAFT" && (
                        <button
                          className="rounded p-2 text-gray-600 hover:bg-gray-100"
                          title="Edit"
                          onClick={() => setEditing(item)}
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                      )}
                      {item.status === "DRAFT" && (
                        <button
                          className="rounded p-2 text-blue-700 hover:bg-blue-50"
                          title="Publish"
                          onClick={() => setConfirm({ type: "publish", item })}
                        >
                          <Send className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        className="rounded p-2 text-red-600 hover:bg-red-50"
                        title="Delete"
                        onClick={() => setConfirm({ type: "delete", item })}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {role === "admin" && page.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span>{page.totalElements} assignments</span>
          <div className="flex items-center gap-2">
            <button
              className={secondary}
              disabled={page.number === 0}
              onClick={() => {
                const next = { ...filters, page: page.number - 1 };
                setFilters(next);
                void load(next);
              }}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span>
              Page {page.number + 1} of {page.totalPages}
            </span>
            <button
              className={secondary}
              disabled={page.number + 1 >= page.totalPages}
              onClick={() => {
                const next = { ...filters, page: page.number + 1 };
                setFilters(next);
                void load(next);
              }}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
      {(creating || editing) && (
        <AssignmentForm
          role={role}
          lookups={lookups}
          assignment={editing}
          close={() => {
            setCreating(false);
            setEditing(undefined);
          }}
          saved={() => {
            setCreating(false);
            setEditing(undefined);
            void load();
            changed();
          }}
        />
      )}
      <ConfirmDialog
        open={Boolean(confirm)}
        title={
          confirm?.type === "delete"
            ? "Delete assignment?"
            : "Publish assignment?"
        }
        description={
          confirm?.type === "delete"
            ? "This assignment and its submissions may be permanently removed."
            : "Students will be able to view this assignment."
        }
        confirmLabel={confirm?.type === "delete" ? "Delete" : "Publish"}
        variant={confirm?.type === "delete" ? "destructive" : "default"}
        onConfirm={confirmAction}
        onCancel={() => setConfirm(undefined)}
      />
    </div>
  );
}

type ReviewDraft = Review & { modified: boolean; selected: boolean };
function Reviews({ assignments }: { assignments: Assignment[] }) {
  const { showToast } = useToast();
  const [assignmentId, setAssignmentId] = useState(0);
  const [rows, setRows] = useState<RosterRow[]>([]);
  const [drafts, setDrafts] = useState<Record<number, ReviewDraft>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const assignment = assignments.find((item) => item.id === assignmentId);
  const load = async (id: number) => {
    setAssignmentId(id);
    setRows([]);
    setDrafts({});
    if (!id) return;
    setLoading(true);
    setError("");
    try {
      const roster = await service.getRoster(id);
      setRows(roster);
      setDrafts(
        Object.fromEntries(
          roster
            .filter((row) => row.submission?.id)
            .map((row) => [
              row.submission!.id!,
              {
                marks: row.submission?.marks,
                feedback: row.submission?.feedback || "",
                status:
                  row.submission?.status === "RETURNED" ||
                  row.submission?.status === "GRADED"
                    ? row.submission.status
                    : "REVIEWED",
                modified: false,
                selected: false,
              },
            ]),
        ),
      );
    } catch (e) {
      setError(service.assignmentError(e));
    } finally {
      setLoading(false);
    }
  };
  const update = (id: number, patch: Partial<ReviewDraft>) =>
    setDrafts((current) => ({
      ...current,
      [id]: { ...current[id], ...patch, modified: patch.modified ?? true },
    }));
  const valid = (draft: ReviewDraft) =>
    (draft.status !== "GRADED" || draft.marks != null) &&
    (draft.marks == null ||
      !assignment?.maximumMarks ||
      draft.marks <= assignment.maximumMarks);
  const saveOne = async (submissionId: number) => {
    const draft = drafts[submissionId];
    if (!valid(draft))
      return showToast(
        draft.status === "GRADED" && draft.marks == null
          ? "Marks are required when grading."
          : `Marks cannot exceed ${assignment?.maximumMarks}.`,
        "validation",
      );
    try {
      await service.reviewSubmission(assignmentId, submissionId, {
        marks: draft.marks,
        feedback: draft.feedback,
        status: draft.status,
      });
      showToast("Review saved.");
      await load(assignmentId);
    } catch (e) {
      showToast(service.assignmentError(e), "error");
    }
  };
  const bulk = async () => {
    const selected = Object.entries(drafts).filter(
      ([, value]) => value.selected || value.modified,
    );
    if (!selected.length)
      return showToast(
        "Select or modify at least one submitted row.",
        "validation",
      );
    if (selected.some(([, value]) => !valid(value)))
      return showToast(
        "Graded reviews require marks, and marks cannot exceed the assignment maximum.",
        "validation",
      );
    try {
      await service.reviewSubmissions(
        assignmentId,
        selected.map(([id, value]) => ({
          submissionId: Number(id),
          review: {
            marks: value.marks,
            feedback: value.feedback,
            status: value.status,
          },
        })),
      );
      showToast(`${selected.length} reviews saved.`);
      await load(assignmentId);
    } catch (e) {
      showToast(service.assignmentError(e), "error");
    }
  };
  return (
    <div className="space-y-4">
      <div
        className={`${card} flex flex-col gap-3 p-4 sm:flex-row sm:items-end`}
      >
        <label className="flex-1">
          <FieldLabel name="Assignment" required />
          <select
            className={input}
            value={assignmentId}
            onChange={(e) => void load(Number(e.target.value))}
          >
            <option value="0">Select assignment</option>
            {assignments.map((item) => (
              <option key={item.id} value={item.id}>
                {item.title} · {new Date(item.dueAt).toLocaleDateString()}
              </option>
            ))}
          </select>
        </label>
        <button
          className={primary}
          disabled={!assignmentId || loading}
          onClick={bulk}
        >
          Save selected / modified
        </button>
      </div>
      {loading ? (
        <Skeleton className="h-72" />
      ) : error ? (
        <div className={card}>
          <ErrorState
            title="Roster unavailable"
            description={error}
            onRetry={() => load(assignmentId)}
          />
        </div>
      ) : !assignmentId ? (
        <div className={card}>
          <Empty text="Select an assignment to review its submission roster." />
        </div>
      ) : !rows.length ? (
        <div className={card}>
          <Empty text="No students are assigned." />
        </div>
      ) : (
        <div className={`${card} overflow-x-auto`}>
          <table className="w-full min-w-[1100px] text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="p-3">Select</th>
                <th>Roll / admission</th>
                <th>Student</th>
                <th>Status / submitted</th>
                <th>Files</th>
                <th>
                  Marks{" "}
                  {assignment?.maximumMarks
                    ? `/ ${assignment.maximumMarks}`
                    : ""}
                </th>
                <th>Feedback</th>
                <th>Review status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {rows.map((row) => {
                const submission = row.submission;
                const id = submission?.id;
                const draft = id ? drafts[id] : undefined;
                return (
                  <tr key={row.studentId}>
                    <td className="p-3">
                      <input
                        type="checkbox"
                        disabled={!id}
                        checked={draft?.selected || false}
                        onChange={(e) =>
                          id &&
                          update(id, {
                            selected: e.target.checked,
                            modified: draft?.modified || false,
                          })
                        }
                      />
                    </td>
                    <td>
                      <p>{row.rollNumber || "-"}</p>
                      <p className="text-xs text-gray-500">
                        {row.admissionNumber || "-"}
                      </p>
                    </td>
                    <td className="font-medium">{row.studentName}</td>
                    <td>
                      <StatusBadge status={submission?.status} />
                      <p className="mt-1 text-xs text-gray-500">
                        {formatDate(submission?.submittedAt)}
                      </p>
                    </td>
                    <td>
                      {submission ? (
                        <AttachmentLinks
                          assignmentId={assignmentId}
                          submission={submission}
                          attachments={submission.attachments}
                        />
                      ) : (
                        "-"
                      )}
                    </td>
                    <td>
                      <input
                        className={`${input} mt-0 w-24 ${draft && !valid(draft) ? "border-red-500" : ""}`}
                        type="number"
                        min="0"
                        max={assignment?.maximumMarks}
                        step="0.01"
                        disabled={!id}
                        value={draft?.marks ?? ""}
                        onChange={(e) =>
                          id &&
                          update(id, {
                            marks: e.target.value
                              ? Number(e.target.value)
                              : undefined,
                          })
                        }
                      />
                    </td>
                    <td>
                      <input
                        className={`${input} mt-0 min-w-48`}
                        disabled={!id}
                        value={draft?.feedback || ""}
                        onChange={(e) =>
                          id && update(id, { feedback: e.target.value })
                        }
                      />
                    </td>
                    <td>
                      <select
                        className={`${input} mt-0`}
                        disabled={!id}
                        value={draft?.status || "REVIEWED"}
                        onChange={(e) =>
                          id &&
                          update(id, {
                            status: e.target.value as Review["status"],
                          })
                        }
                      >
                        <option value="REVIEWED">Reviewed</option>
                        <option value="RETURNED">Returned</option>
                        <option value="GRADED">Graded</option>
                      </select>
                    </td>
                    <td>
                      <button
                        className={secondary}
                        disabled={!id}
                        onClick={() => id && saveOne(id)}
                      >
                        Save
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Dashboard({
  lookups,
  refreshKey,
}: {
  lookups: AssignmentLookups;
  refreshKey: number;
}) {
  const [data, setData] = useState<AssignmentDashboard>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const load = async () => {
    setLoading(true);
    setError("");
    try {
      setData(await service.getDashboard());
    } catch (e) {
      setError(service.assignmentError(e));
    } finally {
      setLoading(false);
    }
  };
  const loadEvent = useEffectEvent(load);
  useEffect(() => {
    const timer = window.setTimeout(() => void loadEvent(), 0);
    return () => window.clearTimeout(timer);
  }, [refreshKey]);
  const chartData = (values: Record<string, number>, options?: Option[]) =>
    Object.entries(values).map(([name, value]) => ({
      name:
        options && /^\d+$/.test(name)
          ? display(options, Number(name))
          : titleCase(name),
      value,
    }));
  if (loading) return <Skeleton className="h-96" />;
  if (error || !data)
    return (
      <div className={card}>
        <ErrorState
          title="Dashboard unavailable"
          description={error}
          onRetry={load}
        />
      </div>
    );
  const metrics = [
    ["Total assignments", data.totalAssignments],
    ["Active", data.activeAssignments],
    ["Due today", data.dueToday],
    ["Overdue", data.overdueAssignments],
    ["Pending submissions", data.pendingSubmissions],
    ["Submitted", data.submittedAssignments],
    ["Reviewed", data.reviewedAssignments],
    ["Average submission", `${data.averageSubmissionPercentage.toFixed(1)}%`],
  ];
  const charts = [
    {
      title: "Submission status",
      data: chartData(data.submissionStatus),
      type: "pie",
    },
    {
      title: "Subject assignments",
      data: chartData(data.subjectWiseAssignments, lookups.subjects),
      type: "bar",
    },
    {
      title: "Class assignments",
      data: chartData(data.classWiseAssignments, lookups.classes),
      type: "bar",
    },
    {
      title: "Monthly trend",
      data: chartData(data.monthlyTrend),
      type: "line",
    },
  ];
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {metrics.map(([name, value]) => (
          <div key={name} className={`${card} p-4`}>
            <p className="text-sm text-gray-500">{name}</p>
            <p className="mt-2 text-2xl font-bold text-gray-900">{value}</p>
          </div>
        ))}
      </div>
      <div className="grid gap-5 xl:grid-cols-2">
        {charts.map((chart) => (
          <section key={chart.title} className={`${card} p-4`}>
            <h2 className="mb-4 font-semibold">{chart.title}</h2>
            <div className="h-72">
              {chart.data.length ? (
                <ResponsiveContainer width="100%" height="100%">
                  {chart.type === "pie" ? (
                    <PieChart>
                      <Pie
                        data={chart.data}
                        dataKey="value"
                        nameKey="name"
                        outerRadius={90}
                        fill="#234A91"
                        label
                      />
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  ) : chart.type === "line" ? (
                    <LineChart data={chart.data}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke="#234A91"
                        strokeWidth={3}
                      />
                    </LineChart>
                  ) : (
                    <BarChart data={chart.data}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Bar
                        dataKey="value"
                        fill="#234A91"
                        radius={[5, 5, 0, 0]}
                      />
                    </BarChart>
                  )}
                </ResponsiveContainer>
              ) : (
                <Empty text="No chart data available." />
              )}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

function Reports({ lookups }: { lookups: AssignmentLookups }) {
  const { showToast } = useToast();
  const [filters, setFilters] = useState<ReportFilters>({ type: "completion" });
  const [rows, setRows] = useState<ReportRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const load = async () => {
    setLoading(true);
    setError("");
    try {
      setRows(await service.getReports(filters));
    } catch (e) {
      setError(service.assignmentError(e));
    } finally {
      setLoading(false);
    }
  };
  const loadEvent = useEffectEvent(load);
  const download = async (format: "csv" | "xlsx" | "pdf") => {
    try {
      service.downloadBlob(
        await service.exportReport(format, filters),
        `assignment-report.${format}`,
      );
    } catch (e) {
      showToast(service.assignmentError(e), "error");
    }
  };
  useEffect(() => {
    const timer = window.setTimeout(() => void loadEvent(), 0);
    return () => window.clearTimeout(timer);
  }, []);
  return (
    <div className="space-y-4">
      <div className={`${card} grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-5`}>
        <label>
          <FieldLabel name="Report type" />
          <select
            className={input}
            value={filters.type}
            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
          >
            <option value="completion">Completion</option>
            <option value="student-performance">Student performance (graded)</option>
            <option value="teacher-workload">Teacher workload</option>
            <option value="subject-performance">Subject performance (graded)</option>
            <option value="late">Late submissions</option>
          </select>
        </label>
        <label>
          <FieldLabel name="Session" />
          <select
            className={input}
            value={filters.sessionId || ""}
            onChange={(e) =>
              setFilters({
                ...filters,
                sessionId: Number(e.target.value) || undefined,
              })
            }
          >
            <option value="">All sessions</option>
            {lookups.sessions.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          <FieldLabel name="Teacher" />
          <select
            className={input}
            value={filters.teacherId || ""}
            onChange={(e) =>
              setFilters({
                ...filters,
                teacherId: Number(e.target.value) || undefined,
              })
            }
          >
            <option value="">All teachers</option>
            {lookups.teachers.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          <FieldLabel name="Subject" />
          <select
            className={input}
            value={filters.subjectId || ""}
            onChange={(e) =>
              setFilters({
                ...filters,
                subjectId: Number(e.target.value) || undefined,
              })
            }
          >
            <option value="">All subjects</option>
            {lookups.subjects.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </label>
        <div className="flex items-end">
          <button className={`${primary} w-full`} onClick={load}>
            Run report
          </button>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {(["csv", "xlsx", "pdf"] as const).map((format) => (
          <button
            key={format}
            className={secondary}
            onClick={() => download(format)}
          >
            <FileDown className="h-4 w-4" />
            Export {format === "xlsx" ? "Excel" : format.toUpperCase()}
          </button>
        ))}
      </div>
      {loading ? (
        <Skeleton className="h-64" />
      ) : error ? (
        <div className={card}>
          <ErrorState
            title="Report unavailable"
            description={error}
            onRetry={load}
          />
        </div>
      ) : !rows.length ? (
        <div className={card}>
          <Empty text="No report rows match these filters." />
        </div>
      ) : (
        <div className={`${card} overflow-x-auto`}>
          <table className="w-full min-w-[850px] text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="p-4">Assignment</th>
                <th>Student</th>
                <th>Teacher</th>
                <th>Subject</th>
                <th>Status</th>
                <th>Submitted</th>
                <th>Marks</th>
                <th>Percentage</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {rows.map((row, index) => (
                <tr key={`${row.assignmentId}-${row.studentId}-${index}`}>
                  <td className="p-4 font-medium">{row.assignmentTitle}</td>
                  <td>{row.studentName}</td>
                  <td>{display(lookups.teachers, row.teacherId)}</td>
                  <td>{display(lookups.subjects, row.subjectId)}</td>
                  <td>
                    <StatusBadge status={row.status} />
                  </td>
                  <td>{formatDate(row.submittedAt)}</td>
                  <td>{row.marks ?? "-"}</td>
                  <td>
                    {row.percentage == null
                      ? "-"
                      : `${row.percentage.toFixed(1)}%`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function ManagementWorkspace({
  role,
}: {
  role: "admin" | "teacher";
}) {
  const [tab, setTab] = useState(
    role === "admin" ? "dashboard" : "assignments",
  );
  const [lookups, setLookups] = useState(emptyLookups);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const loadBase = async () => {
    setLoading(true);
    setError("");
    try {
      const [options, rows] = await Promise.all([
        role === "teacher" ? service.getTeacherLookups() : service.getLookups(),
        role === "teacher"
          ? service.getTeacherAssignments()
          : service
              .getAssignments({ page: 0, size: 500, sort: "dueAt,desc" })
              .then((page) => page.content),
      ]);
      setLookups(options);
      setAssignments(rows);
    } catch (e) {
      setError(service.assignmentError(e));
    } finally {
      setLoading(false);
    }
  };
  const loadBaseEvent = useEffectEvent(loadBase);
  useEffect(() => {
    const timer = window.setTimeout(() => void loadBaseEvent(), 0);
    return () => window.clearTimeout(timer);
  }, [role, refreshKey]);
  const tabs =
    role === "admin"
      ? ([
          ["dashboard", "Dashboard", BarChart3],
          ["assignments", "Assignments", Plus],
          ["reviews", "Submissions / Review", Send],
          ["reports", "Reports", FileDown],
        ] as const)
      : ([
          ["assignments", "Assignments", Plus],
          ["reviews", "Submissions / Review", Send],
        ] as const);
  if (loading && !assignments.length) return <Skeleton className="h-[32rem]" />;
  if (error && !assignments.length)
    return (
      <div className={card}>
        <ErrorState
          title="Assignment workspace unavailable"
          description={error}
          onRetry={loadBase}
        />
      </div>
    );
  return (
    <div className="space-y-5">
      <nav className={`${card} flex gap-1 overflow-x-auto p-1.5`}>
        {tabs.map(([id, name, Icon]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`flex min-w-max items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold ${tab === id ? "bg-[#234A91] text-white" : "text-gray-600 hover:bg-gray-50"}`}
          >
            <Icon className="h-4 w-4" />
            {name}
          </button>
        ))}
      </nav>
      {tab === "dashboard" && (
        <Dashboard lookups={lookups} refreshKey={refreshKey} />
      )}
      {tab === "assignments" && (
        <AssignmentList
          role={role}
          lookups={lookups}
          refreshKey={refreshKey}
          changed={() => setRefreshKey((value) => value + 1)}
        />
      )}
      {tab === "reviews" && <Reviews assignments={assignments} />}
      {tab === "reports" && <Reports lookups={lookups} />}
    </div>
  );
}
