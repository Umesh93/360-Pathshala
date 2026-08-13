import { useState } from "react";
import { CheckCheck, LoaderCircle, Search, UserX } from "lucide-react";
import { Switch } from "../../../../components/ui/switch";
import { useToast } from "../../students/components/Toast";
import {
  errorMessage,
  getTeacherRoster,
  saveTeacherAttendance,
} from "../attendance.service";
import type {
  AttendanceStatus,
  TeacherAttendanceRow,
} from "../attendance.types";
import {
  cardClass,
  Empty,
  ErrorBanner,
  fieldClass,
  FilterField,
  primaryButton,
  secondaryButton,
  StatusSelect,
  today,
} from "../components/AttendanceUi";

export default function TeacherAttendanceView() {
  const { showToast } = useToast();
  const [date, setDate] = useState(today());
  const [rows, setRows] = useState<TeacherAttendanceRow[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const update = (id: number, changes: Partial<TeacherAttendanceRow>) =>
    setRows((items) =>
      items.map((item) =>
        item.teacherId === id ? { ...item, ...changes } : item,
      ),
    );
  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const result = await getTeacherRoster({ date, size: 500 });
      setRows(
        result.items.map((item) => ({
          ...item,
          status: item.existing ? item.status : "ABSENT",
        })),
      );
      setLoaded(true);
    } catch (value) {
      setError(errorMessage(value));
    } finally {
      setLoading(false);
    }
  };
  const bulk = (status: AttendanceStatus) =>
    setRows((items) => items.map((item) => ({ ...item, status })));
  const save = async () => {
    setSaving(true);
    try {
      const existing = rows.some((item) => item.existing);
      await saveTeacherAttendance(
        date,
        rows.map((item) => ({
          id: item.id,
          teacherId: item.teacherId,
          status: item.status,
          remarks: item.remarks || undefined,
        })),
      );
      showToast(
        `Teacher attendance ${existing ? "updated" : "saved"} successfully`,
        "success",
      );
      await load();
    } catch (value) {
      showToast(errorMessage(value), "error");
    } finally {
      setSaving(false);
    }
  };
  return (
    <div className="space-y-4">
      <section className={`${cardClass} p-4`}>
        <div className="grid gap-3 sm:grid-cols-[minmax(220px,320px)_auto]">
          <FilterField label="Attendance date">
            <input
              className={fieldClass}
              type="date"
              max={today()}
              value={date}
              onChange={(event) => setDate(event.target.value)}
            />
          </FilterField>
          <div className="flex items-end">
            <button className={primaryButton} onClick={load} disabled={loading}>
              {loading ? (
                <LoaderCircle size={17} className="animate-spin" />
              ) : (
                <Search size={17} />
              )}
              Load Teachers
            </button>
          </div>
        </div>
      </section>
      {error && <ErrorBanner message={error} onRetry={load} />}{" "}
      {loaded && (
        <section className={`${cardClass} overflow-hidden`}>
          <div className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-semibold">Teacher Attendance</h2>
              <p className="text-sm text-gray-500">
                {rows.length} active teachers
              </p>
            </div>
            <div className="flex gap-2">
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
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-sm">
              <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
                <tr>
                  <th className="p-4">Teacher</th>
                  <th className="p-4">Department</th>
                  <th className="p-4">Present</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Remarks</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.teacherId} className="border-t">
                    <td className="p-4">
                      <b>{row.name}</b>
                      <p className="text-xs text-gray-500">
                        {row.employeeNumber || "-"}
                      </p>
                    </td>
                    <td className="p-4 text-gray-600">
                      {row.department || "-"}
                    </td>
                    <td className="p-4">
                      <Switch
                        aria-label={`Mark ${row.name} present`}
                        checked={row.status === "PRESENT"}
                        onCheckedChange={(checked) =>
                          update(row.teacherId, {
                            status: checked ? "PRESENT" : "ABSENT",
                          })
                        }
                      />
                    </td>
                    <td className="p-4">
                      <StatusSelect
                        value={row.status}
                        onChange={(status) => update(row.teacherId, { status })}
                      />
                    </td>
                    <td className="p-4">
                      <input
                        className={`${fieldClass} min-w-48`}
                        value={row.remarks}
                        placeholder="Optional remarks"
                        onChange={(event) =>
                          update(row.teacherId, { remarks: event.target.value })
                        }
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!rows.length && <Empty>No teachers found.</Empty>}
          </div>
          {rows.length > 0 && (
            <div className="flex justify-end border-t p-4">
              <button
                className={primaryButton}
                onClick={save}
                disabled={saving}
              >
                {saving && <LoaderCircle size={17} className="animate-spin" />}
                {rows.some((item) => item.existing)
                  ? "Update Attendance"
                  : "Save Attendance"}
              </button>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
