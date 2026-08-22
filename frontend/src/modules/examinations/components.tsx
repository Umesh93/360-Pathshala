import { forwardRef, useEffect, useRef, useState } from "react";
import { Download, Printer } from "lucide-react";
import { loadSchoolLogoUrl } from "../../services/schoolService";
import type { ExamResult } from "./types";

const value = (number: number | null | undefined, suffix = "") =>
  number == null ? "-" : `${number.toFixed(2).replace(/\.00$/, "")}${suffix}`;
const rank = (number: number | null | undefined) =>
  number == null ? "-" : `#${number}`;
const date = (value?: string | null) => value || "-";

function useProtectedLogo(source?: string | null) {
  const [state, setState] = useState<{
    source: string;
    url?: string;
    settled: boolean;
  }>();

  useEffect(() => {
    let active = true;
    let objectUrl: string | undefined;
    if (!source) return;
    loadSchoolLogoUrl(source)
      .then((loadedUrl) => {
        objectUrl = loadedUrl;
        if (active) {
          setState({ source, url: loadedUrl, settled: true });
        } else {
          URL.revokeObjectURL(loadedUrl);
        }
      })
      .catch(() => {
        if (active) setState({ source, settled: true });
      });
    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [source]);

  return {
    url: source && state?.source === source ? state.url : undefined,
    loading: Boolean(source && (state?.source !== source || !state.settled)),
  };
}

export function ResultCard({
  result,
  bulk = false,
  resolvedLogoUrl,
}: {
  result: ExamResult;
  bulk?: boolean;
  resolvedLogoUrl?: string;
}) {
  const sheetRef = useRef<HTMLElement>(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const { url: protectedLogoUrl, loading: logoLoading } = useProtectedLogo(
    resolvedLogoUrl ? undefined : result.schoolLogoUrl,
  );
  const logoUrl = resolvedLogoUrl || protectedLogoUrl;
  const showCredits =
    result.totalCreditHours != null ||
    result.subjects.some((subject) => subject.creditHours != null);
  const showCgpa = result.cgpa != null;
  const contact = [result.schoolPhone, result.schoolEmail]
    .filter(Boolean)
    .join(" | ");
  const initials = (result.schoolName || "School")
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();

  const print = async () => {
    const source = sheetRef.current;
    if (!source) return;
    const printWindow = window.open(
      "",
      "grade-sheet-print",
      "width=1200,height=900",
    );
    if (!printWindow) return;
    const styles = Array.from(
      document.querySelectorAll<HTMLLinkElement | HTMLStyleElement>(
        'link[rel="stylesheet"], style',
      ),
    )
      .map((element) => element.outerHTML)
      .join("");
    printWindow.document.open();
    printWindow.document.write(
      `<!doctype html><html><head><title>${result.studentName} - Grade Sheet</title>${styles}<style>@page{size:A4 portrait;margin:10mm}body{background:#fff}.grade-sheet-actions{display:none!important}.grade-sheet{border:0!important;box-shadow:none!important;border-radius:0!important;overflow:visible!important}.grade-sheet .overflow-x-auto{overflow:visible!important}.grade-sheet-table{table-layout:fixed;width:100%}.grade-sheet-table thead{display:table-header-group}.grade-sheet-table tr,.grade-sheet-section{break-inside:avoid;page-break-inside:avoid}</style></head><body><div class="grade-sheet-print-root">${source.outerHTML}</div></body></html>`,
    );
    printWindow.document.close();
    const images = Array.from(printWindow.document.images);
    try {
      await Promise.all(
        images.map((image) =>
          image.complete
            ? image.decode().catch(() => undefined)
            : new Promise<void>((resolve) => {
                image.addEventListener("load", () => resolve(), { once: true });
                image.addEventListener("error", () => resolve(), {
                  once: true,
                });
              }),
        ),
      );
      await printWindow.document.fonts?.ready;
      printWindow.focus();
      printWindow.print();
      printWindow.addEventListener("afterprint", () => printWindow.close(), {
        once: true,
      });
    } catch {
      printWindow.close();
    }
  };

  const downloadPdf = async () => {
    const source = sheetRef.current;
    if (!source || pdfLoading) return;
    setPdfLoading(true);
    const host = document.createElement("div");
    host.className = "grade-sheet-pdf-host";
    const clone = source.cloneNode(true) as HTMLElement;
    host.appendChild(clone);
    document.body.appendChild(host);
    try {
      const images = Array.from(clone.querySelectorAll("img"));
      await Promise.all(
        images.map((image) =>
          image.complete
            ? image.decode().catch(() => undefined)
            : new Promise<void>((resolve) => {
                image.addEventListener("load", () => resolve(), { once: true });
                image.addEventListener("error", () => resolve(), {
                  once: true,
                });
              }),
        ),
      );
      await document.fonts?.ready;
      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
        import("html2canvas"),
        import("jspdf"),
      ]);
      const canvas = await html2canvas(clone, {
        scale: 2,
        backgroundColor: "#ffffff",
        useCORS: true,
        logging: false,
        windowWidth: 1120,
      });
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });
      const margin = 10;
      const pageWidth = pdf.internal.pageSize.getWidth() - margin * 2;
      const pageHeight = pdf.internal.pageSize.getHeight() - margin * 2;
      const imageHeight = (canvas.height * pageWidth) / canvas.width;
      const image = canvas.toDataURL("image/png");
      let offset = 0;
      do {
        if (offset > 0) pdf.addPage();
        pdf.addImage(
          image,
          "PNG",
          margin,
          margin - offset,
          pageWidth,
          imageHeight,
        );
        offset += pageHeight;
      } while (offset < imageHeight);
      pdf.save(
        `${result.studentName.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}-grade-sheet.pdf`,
      );
    } finally {
      host.remove();
      setPdfLoading(false);
    }
  };

  return (
    <div className="grade-sheet-print-root">
      {!bulk && <div className="grade-sheet-actions no-print mb-3 flex justify-end gap-2">
        <button
          type="button"
          onClick={print}
          disabled={logoLoading || pdfLoading}
          className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          <Printer className="h-4 w-4" /> Print
        </button>
        <button
          type="button"
          onClick={() => void downloadPdf()}
          disabled={logoLoading || pdfLoading}
          className="flex items-center gap-2 rounded-lg bg-[#234A91] px-3 py-2 text-sm font-semibold text-white hover:bg-[#1b3a72] disabled:opacity-50"
        >
          <Download className="h-4 w-4" />
          {pdfLoading ? "Generating PDF..." : "Download PDF"}
        </button>
      </div>}
      <article
        ref={sheetRef}
        className={`grade-sheet overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm ${bulk ? "bulk-marksheet" : ""}`}
      >
        <header className="grade-sheet-section border-b-2 border-[#234A91] px-5 py-5 text-center">
          <div className="flex items-center justify-center gap-4">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={`${result.schoolName} logo`}
                className="h-20 w-20 object-contain"
              />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-gray-300 bg-gray-50 text-xl font-bold text-gray-500">
                {initials}
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold text-gray-950">
                {result.schoolName || "School"}
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                {result.schoolAddress || "-"}
              </p>
              <p className="text-sm text-gray-600">{contact || "-"}</p>
            </div>
          </div>
          <h2 className="mt-4 text-lg font-bold uppercase text-[#234A91]">
            Grade Sheet / Marksheet
          </h2>
        </header>

        <section className={`grade-sheet-section grid gap-4 border-b border-gray-200 p-5 ${bulk ? "grid-cols-1" : "sm:grid-cols-[90px_1fr]"}`}>
          {!bulk && (result.studentPhoto ? (
            <img
              src={result.studentPhoto}
              alt={result.studentName}
              className="h-28 w-24 border border-gray-300 object-cover"
            />
          ) : (
            <div className="flex h-28 w-24 items-center justify-center border border-gray-300 bg-gray-50 text-xs text-gray-400">
              Student Photo
            </div>
          ))}
          <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-3">
            {[
              ["Student", result.studentName],
              ["Admission No.", result.admissionNumber],
              ["Roll No.", result.rollNumber],
              ["Academic Session", result.academicSessionName],
              ["Class", result.className],
              ["Section", result.sectionName],
              ["Examination", result.examName],
              ...(!bulk
                ? [[
                    "Exam Dates",
                    `${date(result.examStartsOn)} to ${date(result.examEndsOn)}`,
                  ]]
                : []),
              ["Result Published", date(result.resultPublishDate)],
            ].map(([label, content]) => (
              <div key={label}>
                <dt className="text-xs font-semibold uppercase text-gray-500">
                  {label}
                </dt>
                <dd className="mt-0.5 font-medium text-gray-900">
                  {content || "-"}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        <div className="overflow-x-auto">
          <table className="grade-sheet-table w-full table-fixed text-center text-xs">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th>S.N.</th>
                <th className="subject-column text-left">Subject</th>
                <th>Full Marks</th>
                <th>Pass Marks</th>
                {showCredits && <th>Credit Hour</th>}
                <th>Obtained Marks</th>
                <th>Percentage</th>
                <th>Grade</th>
                <th>Grade Point</th>
                <th>Result</th>
              </tr>
            </thead>
            <tbody>
              {result.subjects.map((subject, index) => (
                <tr key={subject.examSubjectId || subject.subjectId}>
                  <td>{index + 1}</td>
                  <td className="subject-column text-left font-medium">
                    {subject.subjectName}
                    {subject.subjectCode && (
                      <span className="block text-[10px] font-normal text-gray-500">
                        {subject.subjectCode}
                      </span>
                    )}
                    {subject.remarks && (
                      <span className="block text-[10px] font-normal italic text-gray-500">
                        {subject.remarks}
                      </span>
                    )}
                  </td>
                  <td>{value(subject.fullMarks)}</td>
                  <td>{value(subject.passMarks)}</td>
                  {showCredits && <td>{value(subject.creditHours)}</td>}
                  <td>
                    {subject.absent ? "Absent" : value(subject.obtainedMarks)}
                  </td>
                  <td>{value(subject.percentage, "%")}</td>
                  <td>{subject.grade || "-"}</td>
                  <td>{value(subject.gradePoint ?? subject.gpa)}</td>
                  <td className="font-semibold">{subject.status || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <section className="grade-sheet-section grid grid-cols-2 gap-px border-t bg-gray-200 sm:grid-cols-4">
          {[
            [
              "Total / Full Marks",
              `${value(result.total)} / ${value(result.fullMarks)}`,
            ],
            ["Percentage", value(result.percentage, "%")],
            ...(showCredits
              ? [["Total Credit", value(result.totalCreditHours)]]
              : []),
            ["GPA", value(result.gpa)],
            ...(showCgpa
              ? [
                  [
                    "CGPA",
                    `${value(result.cgpa)}${result.cgpaPeriods != null ? ` (${result.cgpaPeriods} periods)` : ""}`,
                  ],
                ]
              : []),
            ["Grade", result.grade || "-"],
            ["Class Rank", rank(result.classRank)],
            ["Section Rank", rank(result.sectionRank)],
            ["School Rank", rank(result.schoolRank)],
            ["Status", result.status || "-"],
          ].map(([label, content]) => (
            <div className="bg-white p-3" key={label}>
              <p className="text-[10px] font-semibold uppercase text-gray-500">
                {label}
              </p>
              <p className="mt-1 font-bold text-gray-900">{content}</p>
            </div>
          ))}
        </section>
        <section className="grade-sheet-section border-t border-gray-200 px-5 py-4 text-sm">
          <span className="font-semibold text-gray-800">Remarks:</span>{" "}
          <span className="text-gray-600">{result.remarks || "-"}</span>
        </section>
        <footer className="grade-sheet-section grid grid-cols-2 gap-16 border-t border-gray-200 px-8 pb-6 pt-16">
          <div className="border-t border-gray-500 pt-2 text-center text-xs font-semibold text-gray-700">
            Class Teacher Signature
          </div>
          <div className="border-t border-gray-500 pt-2 text-center text-xs font-semibold text-gray-700">
            Principal Signature
          </div>
        </footer>
      </article>
    </div>
  );
}

export const BulkResultSheets = forwardRef<
  HTMLDivElement,
  { results: ExamResult[]; onLogoLoadingChange?: (loading: boolean) => void }
>(({ results, onLogoLoadingChange }, ref) => {
  const logoSource = results[0]?.schoolLogoUrl;
  const { url: logoUrl, loading } = useProtectedLogo(logoSource);

  useEffect(() => {
    onLogoLoadingChange?.(loading);
  }, [loading, onLogoLoadingChange]);

  return (
    <div ref={ref} className="bulk-marksheet-print-root">
      {results.map((result) => (
        <ResultCard
          key={result.studentId}
          result={result}
          bulk
          resolvedLogoUrl={logoUrl}
        />
      ))}
    </div>
  );
});

BulkResultSheets.displayName = "BulkResultSheets";
