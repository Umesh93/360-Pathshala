import { useEffect, useEffectEvent, useState } from "react";
import { CalendarClock, ChevronRight, Paperclip, Send, X } from "lucide-react";
import ErrorState from "../../components/feedback/ErrorState";
import PageHeader from "../../components/layout/PageHeader";
import Skeleton from "../../components/Skeleton";
import StudentLayout from "../../layouts/StudentLayout";
import {
  AttachmentLinks,
  Empty,
  FieldLabel,
  StatusBadge,
} from "../../modules/assignments/components";
import * as service from "../../modules/assignments/service";
import type { StudentAssignment } from "../../modules/assignments/types";
import {
  card,
  formatDate,
  input,
  primary,
  secondary,
  titleCase,
} from "../../modules/assignments/ui";
import { useToast } from "../../modules/admin/students/components/Toast";

const effectiveDeadline = (item: StudentAssignment) =>
  item.assignment.allowLateSubmission && item.assignment.lateSubmissionDeadline
    ? item.assignment.lateSubmissionDeadline
    : item.assignment.dueAt;

export default function StudentHomework() {
  const { showToast } = useToast();
  const [rows, setRows] = useState<StudentAssignment[]>([]);
  const [selected, setSelected] = useState<StudentAssignment>();
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [answerText, setAnswerText] = useState("");
  const [comments, setComments] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const load = async () => {
    setLoading(true);
    setError("");
    try {
      setRows(await service.getStudentAssignments());
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
  }, []);
  const open = async (id: number) => {
    setDetailLoading(true);
    try {
      const detail = await service.getStudentAssignment(id);
      setSelected(detail);
      setAnswerText(detail.submission?.answerText || "");
      setComments(detail.submission?.comments || "");
      setFiles([]);
    } catch (e) {
      showToast(service.assignmentError(e), "error");
    } finally {
      setDetailLoading(false);
    }
  };
  const close = () => {
    setSelected(undefined);
    setFiles([]);
  };
  const canSubmit =
    selected &&
    new Date() <= new Date(effectiveDeadline(selected)) &&
    (!selected.submission?.submittedAt ||
      ["SUBMITTED", "LATE", "RETURNED"].includes(selected.submission.status));
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selected || !canSubmit) return;
    if (!answerText.trim() && !files.length)
      return showToast(
        "Enter an answer or attach at least one file.",
        "validation",
      );
    if (new Date() > new Date(effectiveDeadline(selected)))
      return showToast(
        "The effective submission deadline has passed.",
        "validation",
      );
    setSaving(true);
    try {
      if (files.length)
        await service.submitFiles(
          selected.assignment.id,
          answerText.trim(),
          comments.trim(),
          files,
        );
      else
        await service.submitAnswer(
          selected.assignment.id,
          answerText.trim(),
          comments.trim(),
        );
      showToast(
        selected.submission?.status === "RETURNED"
          ? "Submission replaced."
          : "Assignment submitted.",
      );
      await load();
      await open(selected.assignment.id);
    } catch (e) {
      showToast(service.assignmentError(e), "error");
    } finally {
      setSaving(false);
    }
  };
  return (
    <StudentLayout>
      <PageHeader
        title="My Assignments"
        subtitle="View class work, submit answers, and track teacher feedback."
      />
      {loading ? (
        <Skeleton className="h-80" />
      ) : error ? (
        <div className={card}>
          <ErrorState
            title="Assignments unavailable"
            description={error}
            onRetry={load}
          />
        </div>
      ) : !rows.length ? (
        <div className={card}>
          <Empty text="No published assignments are available." />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {rows.map((item) => {
            const overdue =
              !item.submission?.submittedAt &&
              new Date() > new Date(effectiveDeadline(item));
            return (
              <article
                key={item.assignment.id}
                className={`${card} flex flex-col p-5`}
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#234A91]">
                    {titleCase(item.assignment.category)}
                  </span>
                  <StatusBadge status={item.submission?.status} />
                </div>
                <h2 className="mt-3 text-lg font-bold text-gray-900">
                  {item.assignment.title}
                </h2>
                <p className="mt-2 line-clamp-3 flex-1 text-sm text-gray-600">
                  {item.assignment.description ||
                    item.assignment.instructions ||
                    "No description provided."}
                </p>
                <div
                  className={`mt-4 flex items-center gap-2 text-sm ${overdue ? "text-red-600" : "text-gray-600"}`}
                >
                  <CalendarClock className="h-4 w-4" />
                  <span>
                    {overdue ? "Deadline passed" : "Due"}{" "}
                    {formatDate(item.assignment.dueAt)}
                  </span>
                </div>
                {item.assignment.maximumMarks != null && (
                  <p className="mt-1 text-xs text-gray-500">
                    Maximum marks: {item.assignment.maximumMarks}
                  </p>
                )}
                <button
                  className={`${secondary} mt-4 w-full`}
                  onClick={() => open(item.assignment.id)}
                >
                  View assignment <ChevronRight className="h-4 w-4" />
                </button>
              </article>
            );
          })}
        </div>
      )}
      {(selected || detailLoading) && (
        <div className="fixed inset-0 z-40 flex justify-end bg-slate-950/45">
          <section
            role="dialog"
            aria-modal="true"
            aria-label="Assignment detail"
            className="h-full w-full max-w-2xl overflow-y-auto bg-white p-5 shadow-2xl"
          >
            <div className="mb-5 flex justify-between">
              <h2 className="text-xl font-bold">Assignment details</h2>
              <button type="button" onClick={close} aria-label="Close">
                <X />
              </button>
            </div>
            {detailLoading && !selected ? (
              <Skeleton className="h-80" />
            ) : (
              selected && (
                <div className="space-y-6">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge status={selected.submission?.status} />
                      <span className="text-xs font-semibold uppercase text-[#234A91]">
                        {titleCase(selected.assignment.category)}
                      </span>
                    </div>
                    <h3 className="mt-3 text-2xl font-bold text-gray-900">
                      {selected.assignment.title}
                    </h3>
                    <p className="mt-2 text-sm text-gray-500">
                      Due {formatDate(selected.assignment.dueAt)}
                      {selected.assignment.allowLateSubmission && (
                        <>
                          {" "}
                          · Late until{" "}
                          {formatDate(
                            selected.assignment.lateSubmissionDeadline,
                          )}
                        </>
                      )}
                    </p>
                  </div>
                  <section>
                    <h4 className="font-semibold text-gray-900">Description</h4>
                    <p className="mt-2 whitespace-pre-wrap text-sm text-gray-600">
                      {selected.assignment.description ||
                        "No description provided."}
                    </p>
                  </section>
                  <section>
                    <h4 className="font-semibold text-gray-900">
                      Instructions
                    </h4>
                    <p className="mt-2 whitespace-pre-wrap text-sm text-gray-600">
                      {selected.assignment.instructions ||
                        "No additional instructions."}
                    </p>
                  </section>
                  <section>
                    <h4 className="mb-2 font-semibold text-gray-900">
                      Assignment attachments
                    </h4>
                    <AttachmentLinks
                      assignmentId={selected.assignment.id}
                      attachments={selected.assignment.attachments}
                    />
                  </section>
                  {selected.submission && (
                    <section className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                      <h4 className="font-semibold">Submission</h4>
                      <p className="mt-1 text-sm text-gray-500">
                        Submitted {formatDate(selected.submission.submittedAt)}
                      </p>
                      {selected.submission.attachments.length > 0 && (
                        <div className="mt-3">
                          <AttachmentLinks
                            assignmentId={selected.assignment.id}
                            submission={selected.submission}
                            attachments={selected.submission.attachments}
                          />
                        </div>
                      )}
                      {selected.submission.marks != null && (
                        <p className="mt-3 font-semibold text-gray-900">
                          Marks: {selected.submission.marks}
                          {selected.assignment.maximumMarks
                            ? ` / ${selected.assignment.maximumMarks}`
                            : ""}
                          {selected.submission.percentage != null
                            ? ` (${selected.submission.percentage.toFixed(1)}%)`
                            : ""}
                        </p>
                      )}
                      {selected.submission.feedback && (
                        <div className="mt-3 rounded-lg bg-white p-3 text-sm">
                          <strong>Teacher feedback:</strong>
                          <p className="mt-1 whitespace-pre-wrap text-gray-600">
                            {selected.submission.feedback}
                          </p>
                        </div>
                      )}
                    </section>
                  )}
                  <form className="space-y-4 border-t pt-5" onSubmit={submit}>
                    <h4 className="font-semibold">
                      {selected.submission?.status === "RETURNED"
                        ? "Replace returned submission"
                        : "Your response"}
                    </h4>
                    <label>
                      <FieldLabel name="Answer text" />
                      <textarea
                        className={`${input} min-h-32`}
                        disabled={!canSubmit}
                        value={answerText}
                        onChange={(e) => setAnswerText(e.target.value)}
                      />
                    </label>
                    <label>
                      <FieldLabel name="Comments" />
                      <textarea
                        className={`${input} min-h-20`}
                        disabled={!canSubmit}
                        value={comments}
                        onChange={(e) => setComments(e.target.value)}
                      />
                    </label>
                    <label>
                      <FieldLabel name="Files" />
                      <input
                        className={input}
                        type="file"
                        multiple
                        disabled={!canSubmit}
                        accept=".jpg,.jpeg,.png,.gif,.webp,.bmp,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip"
                        onChange={(e) =>
                          setFiles(Array.from(e.target.files ?? []))
                        }
                      />
                      <span className="mt-1 flex items-center gap-1 text-xs text-gray-500">
                        <Paperclip className="h-3 w-3" />
                        Multiple supported files may be uploaded.
                      </span>
                    </label>
                    {canSubmit ? (
                      <button className={`${primary} w-full`} disabled={saving}>
                        <Send className="h-4 w-4" />
                        {saving
                          ? "Submitting..."
                          : selected.submission?.status === "RETURNED"
                            ? "Replace submission"
                            : "Submit assignment"}
                      </button>
                    ) : (
                      <p className="rounded-lg bg-gray-100 p-3 text-center text-sm text-gray-600">
                        {new Date() > new Date(effectiveDeadline(selected))
                          ? "The effective submission deadline has passed."
                          : "This reviewed submission is read-only."}
                      </p>
                    )}
                  </form>
                </div>
              )
            )}
          </section>
        </div>
      )}
    </StudentLayout>
  );
}
