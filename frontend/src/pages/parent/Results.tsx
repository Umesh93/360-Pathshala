import { useEffect, useState } from "react";
import ParentLayout from "../../layouts/ParentLayout";
import PageHeader from "../../components/layout/PageHeader";
import ErrorState from "../../components/feedback/ErrorState";
import Skeleton from "../../components/Skeleton";
import { ResultCard } from "../../modules/examinations/components";
import {
  examinationError,
  getMyChildrenPublishedResults,
} from "../../modules/examinations/service";
import type { ChildResults } from "../../modules/examinations/types";

export default function ParentResults() {
  const [children, setChildren] = useState<ChildResults[]>([]);
  const [studentId, setStudentId] = useState(0);
  const [examId, setExamId] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const records = await getMyChildrenPublishedResults();
      setChildren(records);
      const nextStudent = records.some((item) => item.studentId === studentId)
        ? studentId
        : (records[0]?.studentId ?? 0);
      const child = records.find((item) => item.studentId === nextStudent);
      setStudentId(nextStudent);
      setExamId(child?.results[0]?.examId ?? 0);
    } catch (requestError) {
      setChildren([]);
      setStudentId(0);
      setExamId(0);
      const message = examinationError(requestError);
      setError(
        message.toLowerCase().includes("forbidden") ||
          message.toLowerCase().includes("not linked")
          ? "Your guardian account is not linked to a student, or you do not have permission to view child results."
          : message,
      );
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    let active = true;
    getMyChildrenPublishedResults()
      .then((records) => {
        if (!active) return;
        setChildren(records);
        setStudentId(records[0]?.studentId ?? 0);
        setExamId(records[0]?.results[0]?.examId ?? 0);
      })
      .catch((requestError) => {
        if (!active) return;
        const message = examinationError(requestError);
        setError(
          message.toLowerCase().includes("forbidden") ||
            message.toLowerCase().includes("not linked")
            ? "Your guardian account is not linked to a student, or you do not have permission to view child results."
            : message,
        );
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);
  const child = children.find((item) => item.studentId === studentId);
  const selected = child?.results.find((item) => item.examId === examId);
  const selectChild = (id: number) => {
    const next = children.find((item) => item.studentId === id);
    setStudentId(id);
    setExamId(next?.results[0]?.examId ?? 0);
  };

  return (
    <ParentLayout>
      <PageHeader
        title="Child Results"
        subtitle="Published results for students linked to your guardian account."
      />
      {loading ? (
        <Skeleton className="h-72" />
      ) : error ? (
        <div className="rounded-xl bg-white">
          <ErrorState
            title="Child results unavailable"
            description={error}
            onRetry={load}
          />
        </div>
      ) : !children.length ? (
        <div className="rounded-xl bg-white">
          <ErrorState
            title="No linked students"
            description="No students with published results are linked to this guardian account."
          />
        </div>
      ) : (
        <div className="space-y-5">
          <div className="flex flex-wrap gap-2">
            {children.map((item) => (
              <button
                type="button"
                key={item.studentId}
                onClick={() => selectChild(item.studentId)}
                className={`rounded-lg border px-4 py-2 text-sm font-semibold ${item.studentId === studentId ? "border-[#234A91] bg-[#234A91] text-white" : "border-gray-300 bg-white text-gray-700"}`}
              >
                {item.studentName}
              </button>
            ))}
          </div>
          {child && (
            <section className="no-print rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="mb-4">
                <h2 className="font-semibold text-gray-900">
                  {child.studentName}
                </h2>
                <p className="text-sm text-gray-500">
                  {[child.admissionNumber, child.className, child.sectionName]
                    .filter(Boolean)
                    .join(" | ")}
                </p>
              </div>
              {child.results.length ? (
                <label className="block max-w-md text-sm font-medium text-gray-700">
                  Result to view
                  <select
                    value={examId}
                    onChange={(event) => setExamId(Number(event.target.value))}
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2"
                  >
                    <option value={0}>Select result</option>
                    {child.results.map((item) => (
                      <option key={item.examId} value={item.examId}>
                        {item.examName}
                      </option>
                    ))}
                  </select>
                </label>
              ) : (
                <p className="text-sm text-gray-500">
                  No published results are available for this student.
                </p>
              )}
            </section>
          )}
          {selected && <ResultCard result={selected} />}
        </div>
      )}
    </ParentLayout>
  );
}
