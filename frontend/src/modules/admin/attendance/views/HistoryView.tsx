import { useState } from "react";
import { LoaderCircle, Search } from "lucide-react";
import type { Lookups } from "../AttendanceWorkspace";
import {
  errorMessage,
  getMonthlySummary,
  getStudentHistory,
} from "../attendance.service";
import type {
  AttendanceFilters,
  MonthlyRow,
  StudentAttendanceRow,
} from "../attendance.types";
import {
  cardClass,
  Empty,
  ErrorBanner,
  fieldClass,
  FilterField,
  MiniPagination,
  OptionSelect,
  primaryButton,
  StatusSelect,
  statuses,
  today,
} from "../components/AttendanceUi";

export default function HistoryView({ lookups }: { lookups: Lookups }) {
  const monthNow = today().slice(0, 7);
  const [mode, setMode] = useState<"daily" | "monthly">("daily");
  const [filters, setFilters] = useState<AttendanceFilters>({
    startDate: `${monthNow}-01`,
    endDate: today(),
    page: 0,
    size: 15,
  });
  const [month, setMonth] = useState(monthNow);
  const [rows, setRows] = useState<StudentAttendanceRow[]>([]);
  const [monthly, setMonthly] = useState<MonthlyRow[]>([]);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const load = async (page = 0) => {
    setLoading(true);
    setError("");
    try {
      if (mode === "monthly") {
        setMonthly(
          await getMonthlySummary({ ...filters, date: `${month}-01` }),
        );
      } else {
        const result = await getStudentHistory({ ...filters, page });
        setRows(result.items);
        setPages(result.totalPages);
        setFilters((value) => ({ ...value, page }));
      }
    } catch (value) {
      setError(errorMessage(value));
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button
          className={
            mode === "daily"
              ? primaryButton
              : "h-10 rounded-lg bg-white px-4 text-sm"
          }
          onClick={() => setMode("daily")}
        >
          Daily History
        </button>
        <button
          className={
            mode === "monthly"
              ? primaryButton
              : "h-10 rounded-lg bg-white px-4 text-sm"
          }
          onClick={() => setMode("monthly")}
        >
          Monthly Summary
        </button>
      </div>
      <section className={`${cardClass} p-4`}>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-6">
          {mode === "monthly" ? (
            <FilterField label="Month">
              <input
                type="month"
                className={fieldClass}
                value={month}
                onChange={(event) => setMonth(event.target.value)}
              />
            </FilterField>
          ) : (
            <>
              <FilterField label="From">
                <input
                  type="date"
                  className={fieldClass}
                  value={filters.startDate}
                  onChange={(event) =>
                    setFilters({ ...filters, startDate: event.target.value })
                  }
                />
              </FilterField>
              <FilterField label="To">
                <input
                  type="date"
                  className={fieldClass}
                  value={filters.endDate}
                  onChange={(event) =>
                    setFilters({ ...filters, endDate: event.target.value })
                  }
                />
              </FilterField>
            </>
          )}
          <FilterField label="Class">
            <OptionSelect
              value={filters.classId}
              onChange={(classId) =>
                setFilters({ ...filters, classId, sectionId: undefined })
              }
              options={lookups.classes}
              placeholder="All classes"
            />
          </FilterField>
          <FilterField label="Section">
            <OptionSelect
              value={filters.sectionId}
              onChange={(sectionId) => setFilters({ ...filters, sectionId })}
              options={lookups.sections.filter(
                (item) =>
                  !filters.classId ||
                  !item.classId ||
                  item.classId === filters.classId,
              )}
              placeholder="All sections"
            />
          </FilterField>
          {mode === "daily" && (
            <FilterField label="Status">
              <select
                className={fieldClass}
                value={filters.status || ""}
                onChange={(event) =>
                  setFilters({
                    ...filters,
                    status:
                      (event.target.value as AttendanceFilters["status"]) ||
                      undefined,
                  })
                }
              >
                <option value="">All statuses</option>
                {statuses.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </FilterField>
          )}
          <div className="flex items-end">
            <button
              className={`${primaryButton} w-full`}
              onClick={() => load(0)}
              disabled={loading}
            >
              {loading ? (
                <LoaderCircle className="animate-spin" size={17} />
              ) : (
                <Search size={17} />
              )}
              View
            </button>
          </div>
        </div>
      </section>
      {error && (
        <ErrorBanner message={error} onRetry={() => load(filters.page)} />
      )}
      <section className={`${cardClass} overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[750px] text-sm">
            <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
              {mode === "daily" ? (
                <tr>
                  <th className="p-4">Date</th>
                  <th className="p-4">Student</th>
                  <th className="p-4">Class</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Remarks</th>
                </tr>
              ) : (
                <tr>
                  <th className="p-4">Student</th>
                  <th className="p-4">Working Days</th>
                  <th className="p-4">Present</th>
                  <th className="p-4">Absent</th>
                  <th className="p-4">Late / Leave</th>
                  <th className="p-4">Percentage</th>
                </tr>
              )}
            </thead>
            <tbody>
              {mode === "daily"
                ? rows.map((row, index) => (
                    <tr
                      key={`${row.studentId}-${row.date}-${index}`}
                      className="border-t"
                    >
                      <td className="p-4">{row.date || "-"}</td>
                      <td className="p-4">
                        <b>{row.name}</b>
                        <p className="text-xs text-gray-500">
                          {row.admissionNumber}
                        </p>
                      </td>
                      <td className="p-4">
                        {[row.className, row.sectionName]
                          .filter(Boolean)
                          .join(" - ") || "-"}
                      </td>
                      <td className="p-4">
                        <StatusSelect
                          value={row.status}
                          onChange={() => undefined}
                          disabled
                        />
                      </td>
                      <td className="p-4 text-gray-600">
                        {row.remarks || "-"}
                      </td>
                    </tr>
                  ))
                : monthly.map((row) => (
                    <tr key={row.id} className="border-t">
                      <td className="p-4">
                        <b>{row.name}</b>
                        <p className="text-xs text-gray-500">{row.code}</p>
                      </td>
                      <td className="p-4">{row.workingDays}</td>
                      <td className="p-4 text-emerald-700">{row.present}</td>
                      <td className="p-4 text-red-700">{row.absent}</td>
                      <td className="p-4">
                        {row.late} / {row.leave}
                      </td>
                      <td className="p-4 font-semibold">
                        {row.percentage.toFixed(1)}%
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
          {(mode === "daily" ? !rows.length : !monthly.length) && (
            <Empty>
              Choose filters and select View to load attendance history.
            </Empty>
          )}
        </div>
        {mode === "daily" && (
          <MiniPagination
            page={filters.page || 0}
            totalPages={pages}
            onChange={load}
          />
        )}
      </section>
    </div>
  );
}
