import { useEffect, useState } from "react";
import StudentLayout from "../../layouts/StudentLayout";
import PageHeader from "../../components/layout/PageHeader";
import ErrorState from "../../components/feedback/ErrorState";
import Skeleton from "../../components/Skeleton";
import { ResultCard } from "../../modules/examinations/components";
import {
  examinationError,
  getMyPublishedResults,
} from "../../modules/examinations/service";
import type { ExamResult } from "../../modules/examinations/types";
import { Eye } from "lucide-react";

export default function StudentExams() {
  const [results, setResults] = useState<ExamResult[]>([]);
  const [selectedId, setSelectedId] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [gradesheetOpen, setGradesheetOpen] = useState(false);
  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const records = await getMyPublishedResults();
      setResults(records);
      setSelectedId((current) =>
        records.some((item) => item.examId === current)
          ? current
          : (records[0]?.examId ?? 0),
      );
      setGradesheetOpen(false);
    } catch (requestError) {
      setResults([]);
      setError(examinationError(requestError));
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    let active = true;
    getMyPublishedResults()
      .then((records) => {
        if (active) {
          setResults(records);
          setSelectedId(records[0]?.examId ?? 0);
          setGradesheetOpen(false);
        }
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
  const selected = results.find((item) => item.examId === selectedId);

  return (
    <StudentLayout>
      <PageHeader
        title="My Results"
        subtitle="Published examination results, grades, ranks, and subject performance."
      />
      {loading ? (
        <Skeleton className="h-72" />
      ) : error ? (
        <div className="rounded-xl bg-white">
          <ErrorState
            title="Results unavailable"
            description={error}
            onRetry={load}
          />
        </div>
      ) : !results.length ? (
        <div className="rounded-xl bg-white">
          <ErrorState
            title="No published results"
            description="Your school has not published any examination results yet."
          />
        </div>
      ) : (
        <div className="space-y-5">
          <div className="flex flex-wrap gap-2">
            {results.map((item) => (
              <button
                type="button"
                key={item.examId}
                onClick={() => {
                  setSelectedId(item.examId);
                  setGradesheetOpen(false);
                }}
                className={`rounded-lg border px-4 py-2 text-sm font-semibold ${item.examId === selectedId ? "border-[#234A91] bg-[#234A91] text-white" : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"}`}
              >
                {item.examName}
              </button>
            ))}
          </div>
          {selected && (
            <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="font-semibold text-gray-900">{selected.examName}</h2>
                  <p className="mt-1 text-sm text-gray-500">
                    {selected.academicSessionName} · {selected.className} · {selected.sectionName}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setGradesheetOpen((open) => !open)}
                  className="flex items-center justify-center gap-2 rounded-lg bg-[#234A91] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#1b3a72]"
                >
                  <Eye className="h-4 w-4" />
                  {gradesheetOpen ? "Hide Gradesheet" : "View Gradesheet"}
                </button>
              </div>
            </section>
          )}
          {selected && gradesheetOpen && <ResultCard result={selected} />}
        </div>
      )}
    </StudentLayout>
  );
}
