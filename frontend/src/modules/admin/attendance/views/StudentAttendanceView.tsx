import { useState } from "react";
import { CheckCheck, Eraser, LoaderCircle, Search, UserX } from "lucide-react";
import { Switch } from "../../../../components/ui/switch";
import { useToast } from "../../students/components/Toast";
import {
  errorMessage,
  getStudentRoster,
  saveStudentAttendance,
} from "../attendance.service";
import type {
  AttendanceFilters,
  AttendanceStatus,
  StudentAttendanceRow,
} from "../attendance.types";
import type { Lookups } from "../AttendanceWorkspace";
import {
  cardClass,
  Empty,
  ErrorBanner,
  fieldClass,
  FilterField,
  OptionSelect,
  primaryButton,
  secondaryButton,
  StatusSelect,
  today,
} from "../components/AttendanceUi";

export default function StudentAttendanceView({
  lookups,
}: {
  lookups: Lookups;
}) {
  const { showToast } = useToast();
  const [filters, setFilters] = useState<AttendanceFilters>({ date: today() });
  const [rows, setRows] = useState<StudentAttendanceRow[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const sections = lookups.sections.filter(
    (item) =>
      !filters.classId || !item.classId || item.classId === filters.classId,
  );
  const update = (studentId: number, changes: Partial<StudentAttendanceRow>) =>
    setRows((items) =>
      items.map((item) =>
        item.studentId === studentId ? { ...item, ...changes } : item,
      ),
    );
  const load = async () => {
    if (!filters.date || !filters.classId || !filters.sectionId) {
      showToast("Date, class, and section are required", "validation");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const result = await getStudentRoster({ ...filters, size: 500 });
      setRows(
        result.items.map((item) => ({
          ...item,
          status: item.existing ? item.status : "ABSENT",
        })),
      );
      setLoaded(true);
    } catch (value) {
      setError(errorMessage(value));
      setLoaded(false);
    } finally {
      setLoading(false);
    }
  };
  const bulk = (value?: AttendanceStatus) =>
    setRows((items) =>
      items.map((item) => ({
        ...item,
        status: value ?? (item.existing ? item.status : "ABSENT"),
        remarks: value ? item.remarks : "",
      })),
    );
  const save = async () => {
    if (!rows.length || saving) return;
    setSaving(true);
    try {
      const existing = rows.some((item) => item.existing);
      await saveStudentAttendance(
        filters,
        rows.map((item) => ({
          id: item.id,
          studentId: item.studentId,
          status: item.status,
          remarks: item.remarks.trim() || undefined,
        })),
        existing,
      );
      showToast(
        `Attendance ${existing ? "updated" : "saved"} successfully`,
        "success",
      );
      await load();
    } catch (value) {
      showToast(errorMessage(value), "error");
    } finally {
      setSaving(false);
    }
  };
  const existing = rows.some((item) => item.existing);
  return (
    <div className="space-y-4">
      <section className={`${cardClass} p-4`}>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
          <FilterField label="Academic session">
            <OptionSelect
              value={filters.academicSessionId}
              onChange={(academicSessionId) =>
                setFilters({ ...filters, academicSessionId })
              }
              options={lookups.sessions}
              placeholder="All sessions"
            />
          </FilterField>
          <FilterField label="Date">
            <input
              className={fieldClass}
              type="date"
              max={today()}
              value={filters.date}
              onChange={(event) =>
                setFilters({ ...filters, date: event.target.value })
              }
            />
          </FilterField>
          <FilterField label="Class">
            <OptionSelect
              value={filters.classId}
              onChange={(classId) =>
                setFilters({ ...filters, classId, sectionId: undefined })
              }
              options={lookups.classes}
              placeholder="Select class"
            />
          </FilterField>
          <FilterField label="Section">
            <OptionSelect
              value={filters.sectionId}
              onChange={(sectionId) => setFilters({ ...filters, sectionId })}
              options={sections}
              placeholder="Select section"
              disabled={!filters.classId}
            />
          </FilterField>
          <div className="flex items-end">
            <button
              className={`${primaryButton} w-full`}
              disabled={loading}
              onClick={load}
            >
              {loading ? (
                <LoaderCircle className="animate-spin" size={17} />
              ) : (
                <Search size={17} />
              )}
              Load Students
            </button>
          </div>
        </div>
      </section>
      {error && <ErrorBanner message={error} onRetry={load} />}{" "}
      {loaded && (
        <section className={`${cardClass} overflow-hidden`}>
          <div className="flex flex-col gap-3 border-b p-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="font-semibold text-gray-900">Student Roster</h2>
              <p className="text-sm text-gray-500">
                {rows.length} students. Toggle on for present, off for absent.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                className={secondaryButton}
                onClick={() => bulk("PRESENT")}
              >
                <CheckCheck size={16} />
                All Present
              </button>
              <button
                className={secondaryButton}
                onClick={() => bulk("ABSENT")}
              >
                <UserX size={16} />
                All Absent
              </button>
              <button className={secondaryButton} onClick={() => bulk()}>
                <Eraser size={16} />
                Reset
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-sm">
              <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
                <tr>
                  <th className="p-4">Student</th>
                  <th className="p-4">Roll no.</th>
                  <th className="p-4">Present</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Remarks</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.studentId} className="border-t border-gray-100">
                    <td className="p-4">
                      <p className="font-medium text-gray-900">{row.name}</p>
                      <p className="text-xs text-gray-500">
                        {row.admissionNumber || "No admission number"}
                      </p>
                    </td>
                    <td className="p-4 text-gray-600">
                      {row.rollNumber || "-"}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Switch
                          aria-label={`Mark ${row.name} present`}
                          checked={row.status === "PRESENT"}
                          onCheckedChange={(checked) =>
                            update(row.studentId, {
                              status: checked ? "PRESENT" : "ABSENT",
                            })
                          }
                        />
                        <span className="text-xs text-gray-500">
                          {row.status === "PRESENT" ? "On" : "Off"}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <StatusSelect
                        value={row.status}
                        onChange={(status) => update(row.studentId, { status })}
                      />
                    </td>
                    <td className="p-4">
                      <input
                        aria-label={`Remarks for ${row.name}`}
                        value={row.remarks}
                        maxLength={250}
                        onChange={(event) =>
                          update(row.studentId, { remarks: event.target.value })
                        }
                        placeholder="Optional remarks"
                        className={`${fieldClass} min-w-52`}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {rows.length === 0 && (
              <Empty>No students were found for this class and section.</Empty>
            )}
          </div>
          {rows.length > 0 && (
            <div className="flex justify-end border-t p-4">
              <button
                className={primaryButton}
                disabled={saving}
                onClick={save}
              >
                {saving && <LoaderCircle size={17} className="animate-spin" />}
                {existing ? "Update Attendance" : "Save Attendance"}
              </button>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
