import { useEffect, useEffectEvent, useState } from "react";
import ErrorState from "../../components/feedback/ErrorState";
import PageHeader from "../../components/layout/PageHeader";
import Skeleton from "../../components/Skeleton";
import ParentLayout from "../../layouts/ParentLayout";
import {
  AttachmentLinks,
  Empty,
  StatusBadge,
} from "../../modules/assignments/components";
import * as service from "../../modules/assignments/service";
import type { ChildAssignments } from "../../modules/assignments/types";
import { card, formatDate, titleCase } from "../../modules/assignments/ui";

export default function ParentAssignments() {
  const [children, setChildren] = useState<ChildAssignments[]>([]);
  const [studentId, setStudentId] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const rows = await service.getParentAssignments();
      setChildren(rows);
      setStudentId((current) =>
        rows.some((child) => child.studentId === current)
          ? current
          : rows[0]?.studentId || 0,
      );
    } catch (e) {
      const message = service.assignmentError(e);
      setError(
        message.toLowerCase().includes("forbidden") ||
          message.toLowerCase().includes("linked")
          ? "Your guardian account is not linked to a student, or you do not have permission to view assignments."
          : message,
      );
    } finally {
      setLoading(false);
    }
  };
  const loadEvent = useEffectEvent(load);
  useEffect(() => {
    const timer = window.setTimeout(() => void loadEvent(), 0);
    return () => window.clearTimeout(timer);
  }, []);
  const child = children.find((item) => item.studentId === studentId);
  return (
    <ParentLayout>
      <PageHeader
        title="Child Assignments"
        subtitle="Assignment progress and feedback for students linked to your account."
      />
      {loading ? (
        <Skeleton className="h-80" />
      ) : error ? (
        <div className={card}>
          <ErrorState
            title="Child assignments unavailable"
            description={error}
            onRetry={load}
          />
        </div>
      ) : !children.length ? (
        <div className={card}>
          <ErrorState
            title="No linked students"
            description="No students are linked to this guardian account."
          />
        </div>
      ) : (
        <div className="space-y-5">
          <div className="flex flex-wrap gap-2">
            {children.map((item) => (
              <button
                type="button"
                key={item.studentId}
                onClick={() => setStudentId(item.studentId)}
                className={`rounded-lg border px-4 py-2 text-sm font-semibold ${item.studentId === studentId ? "border-[#234A91] bg-[#234A91] text-white" : "border-gray-300 bg-white text-gray-700"}`}
              >
                {item.studentName}
              </button>
            ))}
          </div>
          {child && (
            <>
              <section className={`${card} p-4`}>
                <h2 className="font-semibold text-gray-900">
                  {child.studentName}
                </h2>
                <p className="text-sm text-gray-500">
                  {child.assignments.length} assignment
                  {child.assignments.length === 1 ? "" : "s"}
                </p>
              </section>
              {!child.assignments.length ? (
                <div className={card}>
                  <Empty text="No assignments are available for this student." />
                </div>
              ) : (
                <div className="grid gap-4 lg:grid-cols-2">
                  {child.assignments.map(({ assignment, submission }) => (
                    <article key={assignment.id} className={`${card} p-5`}>
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-[#234A91]">
                            {titleCase(assignment.category)}
                          </p>
                          <h3 className="mt-1 text-lg font-bold text-gray-900">
                            {assignment.title}
                          </h3>
                        </div>
                        <StatusBadge status={submission?.status} />
                      </div>
                      <p className="mt-3 whitespace-pre-wrap text-sm text-gray-600">
                        {assignment.description ||
                          assignment.instructions ||
                          "No description provided."}
                      </p>
                      <dl className="mt-4 grid grid-cols-2 gap-3 rounded-lg bg-gray-50 p-3 text-sm">
                        <div>
                          <dt className="text-xs text-gray-500">Due</dt>
                          <dd className="font-medium">
                            {formatDate(assignment.dueAt)}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-xs text-gray-500">Submitted</dt>
                          <dd className="font-medium">
                            {formatDate(submission?.submittedAt)}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-xs text-gray-500">Marks</dt>
                          <dd className="font-medium">
                            {submission?.marks == null
                              ? "-"
                              : `${submission.marks}${assignment.maximumMarks ? ` / ${assignment.maximumMarks}` : ""}`}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-xs text-gray-500">Percentage</dt>
                          <dd className="font-medium">
                            {submission?.percentage == null
                              ? "-"
                              : `${submission.percentage.toFixed(1)}%`}
                          </dd>
                        </div>
                      </dl>
                      {submission?.feedback && (
                        <div className="mt-4 rounded-lg border border-blue-100 bg-blue-50 p-3 text-sm">
                          <strong className="text-blue-900">
                            Teacher feedback
                          </strong>
                          <p className="mt-1 whitespace-pre-wrap text-blue-800">
                            {submission.feedback}
                          </p>
                        </div>
                      )}
                      <div className="mt-4 space-y-3">
                        <div>
                          <p className="mb-2 text-xs font-semibold uppercase text-gray-500">
                            Assignment files
                          </p>
                          <AttachmentLinks
                            assignmentId={assignment.id}
                            attachments={assignment.attachments}
                          />
                        </div>
                        {submission?.attachments.length ? (
                          <div>
                            <p className="mb-2 text-xs font-semibold uppercase text-gray-500">
                              Submitted files
                            </p>
                            <AttachmentLinks
                              assignmentId={assignment.id}
                              submission={submission}
                              attachments={submission.attachments}
                            />
                          </div>
                        ) : null}
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </ParentLayout>
  );
}
