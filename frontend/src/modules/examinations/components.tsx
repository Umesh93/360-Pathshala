import { Printer } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import type { ExamResult } from "./types";

const value = (number: number | undefined, suffix = "") => number == null ? "-" : `${number.toFixed(2).replace(/\.00$/, "")}${suffix}`;
const rank = (number: number | undefined) => number == null ? "-" : `#${number}`;

export function ResultCard({ result, compare }: { result: ExamResult; compare?: ExamResult }) {
  const status = typeof result.status === "string" ? result.status.toUpperCase() : "PENDING";
  const passed = status === "PASS";
  return (
    <article className="print-result overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="flex flex-col gap-4 border-b border-gray-200 p-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-4">
          {result.studentPhoto ? <img src={result.studentPhoto} alt={result.studentName} className="h-20 w-16 rounded-md border border-gray-200 object-cover" /> : <div className="flex h-20 w-16 items-center justify-center rounded-md border border-gray-200 bg-gray-50 text-xs text-gray-400">Photo</div>}
          <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-[#234A91]">{result.schoolName || "School examination transcript"}</p>
          <h2 className="mt-1 text-xl font-bold text-gray-900">{result.examName}</h2>
          <p className="mt-1 font-semibold text-gray-800">{result.studentName}</p>
          <p className="text-sm text-gray-500">{[result.admissionNumber && `Admission ${result.admissionNumber}`, result.rollNumber && `Roll ${result.rollNumber}`, result.className, result.sectionName].filter(Boolean).join(" | ")}</p>
          </div>
        </div>
        <button type="button" onClick={() => window.print()} className="no-print flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50">
          <Printer className="h-4 w-4" /> Print / Save PDF
        </button>
      </div>

      <div className="grid grid-cols-2 gap-px bg-gray-200 sm:grid-cols-4 lg:grid-cols-8">
        {[
          ["Total", `${value(result.total)} / ${value(result.fullMarks)}`],
          ["Percentage", value(result.percentage, "%")],
          ["GPA", value(result.gpa)],
          ["Grade", result.grade || "-"],
            ["Result", status],
          ["Class rank", rank(result.classRank)],
          ["Section rank", rank(result.sectionRank)],
          ["School rank", rank(result.schoolRank)],
        ].map(([label, content]) => <div key={label} className="bg-white p-4"><p className="text-xs font-medium uppercase text-gray-500">{label}</p><p className={`mt-1 font-bold ${label === "Result" ? passed ? "text-emerald-600" : "text-red-600" : "text-gray-900"}`}>{content}</p></div>)}
      </div>

      {compare && <div className="border-t border-blue-100 bg-blue-50 px-5 py-3 text-sm text-blue-900">Compared with <strong>{compare.examName}</strong>: {result.percentage - compare.percentage >= 0 ? "+" : ""}{value(result.percentage - compare.percentage, "%")} percentage, {result.total - compare.total >= 0 ? "+" : ""}{value(result.total - compare.total)} marks.</div>}

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-600"><tr><th className="px-4 py-3">Subject</th><th className="px-4 py-3">Marks</th><th className="px-4 py-3">Pass mark</th><th className="px-4 py-3">Grade</th><th className="px-4 py-3">GPA</th><th className="px-4 py-3">Result</th><th className="px-4 py-3">Remarks</th></tr></thead>
          <tbody className="divide-y divide-gray-100">{result.subjects.map((subject) => { const subjectStatus = typeof subject.status === "string" ? subject.status.toUpperCase() : "PENDING"; return <tr key={subject.examSubjectId || subject.subjectId}><td className="px-4 py-3 font-medium text-gray-900">{subject.subjectName}</td><td className="px-4 py-3">{subject.absent ? "Absent" : `${value(subject.obtainedMarks)} / ${value(subject.fullMarks)}`}</td><td className="px-4 py-3">{value(subject.passMarks)}</td><td className="px-4 py-3">{subject.grade || "-"}</td><td className="px-4 py-3">{value(subject.gpa)}</td><td className={`px-4 py-3 font-semibold ${subjectStatus === "PASS" ? "text-emerald-600" : subjectStatus === "FAIL" ? "text-red-600" : "text-gray-500"}`}>{subjectStatus}</td><td className="px-4 py-3 text-gray-600">{subject.remarks || "-"}</td></tr>; })}</tbody>
        </table>
      </div>
      <div className="border-t border-gray-200 px-5 py-4 text-sm"><span className="font-semibold text-gray-800">Overall remarks:</span> <span className="text-gray-600">{result.remarks || "-"}</span></div>
      <div className="grid grid-cols-2 items-end gap-8 border-t border-gray-200 p-6 sm:grid-cols-3">
        <div className="pt-10 text-center"><div className="border-t border-gray-400 pt-2 text-xs font-semibold text-gray-600">Class Teacher Signature</div></div>
        <div className="pt-10 text-center"><div className="border-t border-gray-400 pt-2 text-xs font-semibold text-gray-600">Principal Signature</div></div>
        <div className="col-span-2 flex flex-col items-center sm:col-span-1"><QRCodeSVG value={`EXAM:${result.examId}:STUDENT:${result.studentId}`} size={72} /><span className="mt-2 text-center text-[10px] uppercase tracking-wide text-gray-500">Verification QR</span></div>
      </div>
      <style>{`@media print { body * { visibility: hidden !important; } .print-result, .print-result * { visibility: visible !important; } .print-result { position: absolute; inset: 0; width: 100%; border: 0; box-shadow: none; } .no-print { display: none !important; } }`}</style>
    </article>
  );
}
