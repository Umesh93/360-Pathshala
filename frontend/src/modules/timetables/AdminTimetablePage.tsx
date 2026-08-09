import { useEffect, useState } from "react";
import {
  BarChart3,
  Copy,
  Download,
  FileSpreadsheet,
  Loader2,
  Pencil,
  Plus,
  Save,
  Trash2,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import AdminLayout from "../../layouts/AdminLayout";
import PageHeader from "../../components/layout/PageHeader";
import ConfirmDialog from "../../components/feedback/ConfirmDialog";
import { Button } from "../../components/ui/button";
import { Checkbox } from "../../components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import { Textarea } from "../../components/ui/textarea";
import {
  EmptyState,
  LookupSelectors,
  Notice,
  TimetableGrid,
} from "./components";
import {
  copyGrid,
  deleteGrid,
  deletePeriod,
  downloadReport,
  getDashboard,
  getGrid,
  getLookups,
  getPeriods,
  getReport,
  getTeacherScopes,
  getWorkingDays,
  saveGrid,
  savePeriod,
  saveWorkingDays,
  setGridStatus,
  setPeriodActive,
  timetableError,
} from "./service";
import type {
  DashboardData,
  DayOfWeek,
  GridCellInput,
  GridSelection,
  Period,
  ReportFilters,
  ReportRow,
  TeacherScope,
  TimetableEntry,
  TimetableGridData,
} from "./types";
import {
  DAYS,
  isSubjectAllocatable,
  PERIOD_TYPES,
  periodTypeLabel,
} from "./types";

const fieldClass =
  "mt-1 block h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm focus:border-[#234A91] focus:outline-none focus:ring-1 focus:ring-[#234A91]";
const sectionClass = "border border-gray-200 bg-white p-4 shadow-sm md:p-6";
const complete = (value: GridSelection): value is Required<GridSelection> =>
  Boolean(value.academicSessionId && value.classId && value.sectionId);
const emptyPeriod = (
  academicSessionId = 0,
): Omit<Period, "id" | "active"> & { id?: number } => ({
  academicSessionId,
  name: "",
  startTime: "",
  endTime: "",
  type: "TEACHING_PERIOD",
});

function DashboardSection() {
  const [data, setData] = useState<DashboardData>();
  const [selection, setSelection] = useState<GridSelection>({});
  const [error, setError] = useState("");
  const load = async (id: number) => {
    try {
      setData(await getDashboard(id));
    } catch (requestError) {
      setError(timetableError(requestError));
    }
  };
  useEffect(() => {
    let active = true;
    getLookups()
      .then(({ sessions }) => {
        if (!active) return;
        const id =
          sessions.find((session) => session.active)?.id ?? sessions[0]?.id;
        setSelection({ academicSessionId: id });
        if (id) void load(id);
      })
      .catch(
        (requestError) => active && setError(timetableError(requestError)),
      );
    return () => {
      active = false;
    };
  }, []);
  if (error) return <Notice error message={error} />;
  if (!data)
    return (
      <div className="space-y-4">
        <LookupSelectors
          value={selection}
          onChange={(next) => {
            setSelection(next);
            if (next.academicSessionId) void load(next.academicSessionId);
          }}
          includeSection={false}
        />
        <div className="flex h-48 items-center justify-center">
          <Loader2 className="animate-spin text-[#234A91]" />
        </div>
      </div>
    );
  const metrics: Array<[string, number]> = [
    ["Total timetables", data.totalTimetables],
    ["Active timetables", data.activeTimetables],
    ["Classes today", data.classesScheduledToday],
    ["Teachers today", data.teachersScheduledToday],
    ["Free periods", data.freePeriods],
    ["Upcoming changes", data.upcomingChanges],
  ];
  return (
    <div className="space-y-5">
      <LookupSelectors
        value={selection}
        onChange={(next) => {
          setSelection(next);
          if (next.academicSessionId) void load(next.academicSessionId);
        }}
        includeSection={false}
      />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-6">
        {metrics.map(([label, value]) => (
          <div
            key={label}
            className="border border-gray-200 bg-white p-4 shadow-sm"
          >
            <p className="text-xs font-medium text-gray-500">{label}</p>
            <p className="mt-2 text-2xl font-bold text-gray-900">{value}</p>
          </div>
        ))}
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        <Chart
          title="Classes per day"
          data={data.classesPerDay}
          color="#234A91"
        />
        <Chart
          title="Teacher workload"
          data={data.teacherWorkload}
          color="#0F766E"
          horizontal
        />
        <Chart
          title="Weekly period distribution"
          data={data.weeklyPeriodDistribution}
          color="#D97706"
        />
        <section className={sectionClass}>
          <h2 className="mb-4 font-semibold">Subject distribution</h2>
          {data.subjectDistribution.length ? (
            <div className="h-72">
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={data.subjectDistribution}
                    dataKey="value"
                    nameKey="name"
                    outerRadius={95}
                    label
                  >
                    {data.subjectDistribution.map((entry, index) => (
                      <Cell
                        key={entry.name}
                        fill={
                          [
                            "#234A91",
                            "#0F766E",
                            "#D97706",
                            "#7C3AED",
                            "#DC2626",
                          ][index % 5]
                        }
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyState
              title="No subject data"
              description="Subject allocation will appear here."
            />
          )}
        </section>
      </div>
    </div>
  );
}

function Chart({
  title,
  data,
  color,
  horizontal = false,
}: {
  title: string;
  data: Array<{ name: string; value: number }>;
  color: string;
  horizontal?: boolean;
}) {
  return (
    <section className={sectionClass}>
      <h2 className="mb-4 font-semibold">{title}</h2>
      {data.length ? (
        <div className="h-72">
          <ResponsiveContainer>
            <BarChart
              data={data}
              layout={horizontal ? "vertical" : "horizontal"}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={!horizontal}
                horizontal={horizontal}
              />
              <XAxis
                dataKey={horizontal ? "value" : "name"}
                type={horizontal ? "number" : "category"}
                allowDecimals={false}
                fontSize={11}
              />
              <YAxis
                dataKey={horizontal ? "name" : "value"}
                type={horizontal ? "category" : "number"}
                allowDecimals={false}
                fontSize={11}
                width={horizontal ? 105 : undefined}
              />
              <Tooltip />
              <Bar dataKey="value" fill={color} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <EmptyState
          title="No activity data"
          description="Scheduled activity will appear here."
        />
      )}
    </section>
  );
}

function PeriodSection() {
  const [selection, setSelection] = useState<GridSelection>({});
  const [periods, setPeriods] = useState<Period[]>([]);
  const [form, setForm] = useState(emptyPeriod());
  const [open, setOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number>();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const sessionId = selection.academicSessionId;
  const load = async (id: number) => {
    setBusy(true);
    try {
      setPeriods(await getPeriods(id, true));
    } catch (requestError) {
      setError(timetableError(requestError));
    } finally {
      setBusy(false);
    }
  };
  useEffect(() => {
    if (!sessionId) return;
    let active = true;
    getPeriods(sessionId, true)
      .then((records) => {
        if (active) setPeriods(records);
      })
      .catch((requestError) => {
        if (active) setError(timetableError(requestError));
      });
    return () => {
      active = false;
    };
  }, [sessionId]);
  const submit = async () => {
    setError("");
    if (!sessionId || !form.name.trim() || !form.startTime || !form.endTime)
      return setError("Name, start time, and end time are required.");
    if (form.startTime >= form.endTime)
      return setError("Start time must be earlier than end time.");
    if (isSubjectAllocatable(form.type) && !form.periodNumber)
      return setError(
        "Teaching and extra-class periods require a period number.",
      );
    setBusy(true);
    try {
      await savePeriod({
        ...form,
        academicSessionId: sessionId,
        name: form.name.trim(),
      });
      setOpen(false);
      setMessage(form.id ? "Period updated." : "Period created.");
      await load(sessionId);
    } catch (requestError) {
      setError(timetableError(requestError));
    } finally {
      setBusy(false);
    }
  };
  const confirmDelete = async () => {
    if (!deleteId || !sessionId) return;
    setBusy(true);
    try {
      await deletePeriod(deleteId);
      setDeleteId(undefined);
      setMessage("Period deleted.");
      await load(sessionId);
    } catch (requestError) {
      setError(timetableError(requestError));
    } finally {
      setBusy(false);
    }
  };
  return (
    <section className={sectionClass}>
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="w-full max-w-sm">
          <LookupSelectors
            value={selection}
            onChange={setSelection}
            includeSection={false}
          />
        </div>
        <Button
          disabled={!sessionId}
          onClick={() => {
            setForm(emptyPeriod(sessionId));
            setOpen(true);
          }}
        >
          <Plus /> Add period
        </Button>
      </div>
      {message && <Notice message={message} />}
      {error && (
        <div className="mt-4">
          <Notice error message={error} />
        </div>
      )}
      {!sessionId ? (
        <EmptyState
          title="Select an academic session"
          description="Periods are configured independently for each academic session."
        />
      ) : busy && !periods.length ? (
        <div className="flex h-40 items-center justify-center">
          <Loader2 className="animate-spin" />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead className="bg-gray-50">
              <tr>
                {["Number", "Name", "Time", "Type", "Status", "Actions"].map(
                  (heading) => (
                    <th key={heading} className="p-3">
                      {heading}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {periods.map((period) => (
                <tr key={period.id}>
                  <td className="p-3">{period.periodNumber ?? "-"}</td>
                  <td className="p-3 font-medium">{period.name}</td>
                  <td className="p-3">
                    {period.startTime} - {period.endTime}
                  </td>
                  <td className="p-3">{periodTypeLabel(period.type)}</td>
                  <td className="p-3">
                    <button
                      type="button"
                      className="text-sm font-semibold text-[#234A91]"
                      onClick={async () => {
                        try {
                          await setPeriodActive(period.id, !period.active);
                          await load(sessionId);
                        } catch (requestError) {
                          setError(timetableError(requestError));
                        }
                      }}
                    >
                      {period.active ? "Active" : "Inactive"}
                    </button>
                  </td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      <Button
                        size="icon"
                        variant="outline"
                        title="Edit period"
                        onClick={() => {
                          setForm(period);
                          setOpen(true);
                        }}
                      >
                        <Pencil />
                      </Button>
                      <Button
                        size="icon"
                        variant="outline"
                        title="Delete period"
                        onClick={() => setDeleteId(period.id)}
                      >
                        <Trash2 />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{form.id ? "Edit period" : "Add period"}</DialogTitle>
            <DialogDescription>
              Period numbers are required for teaching and extra-class periods.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-medium">
              Name
              <input
                className={fieldClass}
                value={form.name}
                onChange={(event) =>
                  setForm({ ...form, name: event.target.value })
                }
              />
            </label>
            <label className="text-sm font-medium">
              Period number
              <input
                className={fieldClass}
                type="number"
                min="1"
                value={form.periodNumber ?? ""}
                onChange={(event) =>
                  setForm({
                    ...form,
                    periodNumber: Number(event.target.value) || undefined,
                  })
                }
              />
            </label>
            <label className="text-sm font-medium">
              Start time
              <input
                className={fieldClass}
                type="time"
                value={form.startTime}
                onChange={(event) =>
                  setForm({ ...form, startTime: event.target.value })
                }
              />
            </label>
            <label className="text-sm font-medium">
              End time
              <input
                className={fieldClass}
                type="time"
                value={form.endTime}
                onChange={(event) =>
                  setForm({ ...form, endTime: event.target.value })
                }
              />
            </label>
            <label className="text-sm font-medium sm:col-span-2">
              Type
              <select
                className={fieldClass}
                value={form.type}
                onChange={(event) =>
                  setForm({
                    ...form,
                    type: event.target.value as Period["type"],
                  })
                }
              >
                {PERIOD_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {periodTypeLabel(type)}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button disabled={busy} onClick={submit}>
              {busy && <Loader2 className="animate-spin" />} Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <ConfirmDialog
        open={deleteId !== undefined}
        title="Delete period"
        description="This period will be soft deleted. Existing timetable entries can block deletion."
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={() => void confirmDelete()}
        onCancel={() => setDeleteId(undefined)}
      />
    </section>
  );
}

function WorkingDaysSection() {
  const [selection, setSelection] = useState<GridSelection>({});
  const [days, setDays] = useState<DayOfWeek[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const sessionId = selection.academicSessionId;
  useEffect(() => {
    if (!sessionId) return;
    let active = true;
    getWorkingDays(sessionId)
      .then((records) => {
        if (active) setDays(records);
      })
      .catch((requestError) => {
        if (active) setError(timetableError(requestError));
      });
    return () => {
      active = false;
    };
  }, [sessionId]);
  const save = async () => {
    if (!sessionId) return;
    if (!days.length) return setError("Select at least one working day.");
    setBusy(true);
    try {
      await saveWorkingDays(sessionId, days);
      setMessage("Working days saved.");
    } catch (requestError) {
      setError(timetableError(requestError));
    } finally {
      setBusy(false);
    }
  };
  return (
    <section className={sectionClass}>
      <div className="max-w-sm">
        <LookupSelectors
          value={selection}
          onChange={setSelection}
          includeSection={false}
        />
      </div>
      {error && (
        <div className="mt-4">
          <Notice error message={error} />
        </div>
      )}
      {message && (
        <div className="mt-4">
          <Notice message={message} />
        </div>
      )}
      {sessionId ? (
        busy ? (
          <Loader2 className="mt-6 animate-spin" />
        ) : (
          <>
            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {DAYS.map((day) => (
                <label
                  key={day}
                  className="flex items-center gap-3 border border-gray-200 bg-gray-50 p-3 text-sm font-medium"
                >
                  <Checkbox
                    checked={days.includes(day)}
                    onCheckedChange={(checked) =>
                      setDays(
                        checked
                          ? [...days, day]
                          : days.filter((item) => item !== day),
                      )
                    }
                  />
                  {day}
                </label>
              ))}
            </div>
            <Button className="mt-5" disabled={busy} onClick={save}>
              <Save /> Save working days
            </Button>
          </>
        )
      ) : (
        <EmptyState
          title="Select an academic session"
          description="Working days are loaded from the server."
        />
      )}
    </section>
  );
}

interface CellDraft {
  day: DayOfWeek;
  period: Period;
  subjectId?: number;
  room: string;
  remarks: string;
}
function WeeklySection({ initial }: { initial?: TimetableGridData }) {
  const [selection, setSelection] = useState<GridSelection>(
    initial
      ? {
          academicSessionId: initial.academicSessionId,
          classId: initial.classId,
          sectionId: initial.sectionId,
        }
      : {},
  );
  const [grid, setGrid] = useState<TimetableGridData | undefined>(initial);
  const [entries, setEntries] = useState<TimetableEntry[]>(
    initial?.entries ?? [],
  );
  const [scopes, setScopes] = useState<TeacherScope[]>([]);
  const [cell, setCell] = useState<CellDraft>();
  const [busy, setBusy] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [deleteOpen, setDeleteOpen] = useState(false);
  const load = async () => {
    if (!complete(selection))
      return setError("Select an academic session, class, and section.");
    setBusy(true);
    try {
      const [loadedGrid, loadedScopes] = await Promise.all([
        getGrid(selection),
        getTeacherScopes(selection),
      ]);
      setGrid(loadedGrid);
      setEntries(loadedGrid.entries);
      setScopes(loadedScopes);
      setDirty(false);
    } catch (requestError) {
      setError(timetableError(requestError));
    } finally {
      setBusy(false);
    }
  };
  const apply = () => {
    if (!cell) return;
    const scope = scopes.find((item) => item.subjectId === cell.subjectId);
    if (!cell.subjectId)
      return setError("A subject is required for this period.");
    if (!scope?.teacherId)
      return setError("No teacher is assigned to this subject.");
    const without = entries.filter(
      (entry) =>
        !(entry.dayOfWeek === cell.day && entry.periodId === cell.period.id),
    );
    setEntries([
      ...without,
      {
        dayOfWeek: cell.day,
        periodId: cell.period.id,
        periodName: cell.period.name,
        periodNumber: cell.period.periodNumber,
        startTime: cell.period.startTime,
        endTime: cell.period.endTime,
        type: cell.period.type,
        subjectId: scope.subjectId,
        subjectName: scope.subjectName,
        teacherId: scope.teacherId,
        teacherName: scope.teacherName,
        room: cell.room.trim() || undefined,
        remarks: cell.remarks.trim() || undefined,
      },
    ]);
    setCell(undefined);
    setDirty(true);
    setError("");
  };
  const save = async () => {
    if (!grid || !complete(selection)) return;
    const cells: GridCellInput[] = grid.workingDays.flatMap((day) =>
      grid.periods.flatMap((period) => {
        const entry = entries.find(
          (candidate) =>
            candidate.dayOfWeek === day && candidate.periodId === period.id,
        );
        if (isSubjectAllocatable(period.type) && !entry?.subjectId) return [];
        return [
          {
            dayOfWeek: day,
            periodId: period.id,
            subjectId: entry?.subjectId,
            room: entry?.room,
            remarks: entry?.remarks,
          },
        ];
      }),
    );
    setBusy(true);
    try {
      const saved = await saveGrid(selection, cells);
      setGrid(saved);
      setEntries(saved.entries);
      setDirty(false);
      setMessage("Weekly timetable saved.");
    } catch (requestError) {
      setError(timetableError(requestError));
    } finally {
      setBusy(false);
    }
  };
  const remove = async () => {
    if (!complete(selection)) return;
    setBusy(true);
    try {
      await deleteGrid(selection);
      setGrid(undefined);
      setEntries([]);
      setDeleteOpen(false);
      setMessage("Timetable deleted.");
    } catch (requestError) {
      setError(timetableError(requestError));
    } finally {
      setBusy(false);
    }
  };
  const selectedScope = scopes.find(
    (scope) => scope.subjectId === cell?.subjectId,
  );
  return (
    <div className="space-y-5">
      <section className={sectionClass}>
        <LookupSelectors
          value={selection}
          onChange={(next) => {
            setSelection(next);
            setGrid(undefined);
            setEntries([]);
            setDirty(false);
          }}
        />
        <Button
          className="mt-4"
          disabled={busy || !complete(selection)}
          onClick={() => void load()}
        >
          {busy ? <Loader2 className="animate-spin" /> : <FileSpreadsheet />}{" "}
          Load grid
        </Button>
      </section>
      {error && <Notice error message={error} />}
      {message && <Notice message={message} />}
      {grid && (
        <section className={sectionClass}>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-semibold">
                {grid.className} - {grid.sectionName}
              </h2>
              <p className="text-sm text-gray-500">
                {grid.name} | {grid.status}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {grid.timetableId > 0 && (
                <Button
                  variant="outline"
                  onClick={async () => {
                    try {
                      const next =
                        grid.status === "ACTIVE" ? "DRAFT" : "ACTIVE";
                      setGrid(await setGridStatus(grid.timetableId, next));
                    } catch (requestError) {
                      setError(timetableError(requestError));
                    }
                  }}
                >
                  {grid.status === "ACTIVE" ? "Move to draft" : "Activate"}
                </Button>
              )}
              <Button disabled={!dirty || busy} onClick={() => void save()}>
                <Save /> Save grid
              </Button>
              <Button variant="outline" onClick={() => setDeleteOpen(true)}>
                <Trash2 /> Delete
              </Button>
            </div>
          </div>
          <TimetableGrid
            grid={grid}
            editable
            onCellClick={(day, period, entry) =>
              setCell({
                day,
                period,
                subjectId: entry?.subjectId,
                room: entry?.room ?? "",
                remarks: entry?.remarks ?? "",
              })
            }
          />
        </section>
      )}
      {cell && (
        <Dialog open onOpenChange={(open) => !open && setCell(undefined)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit {cell.period.name}</DialogTitle>
              <DialogDescription>
                Subjects are limited to active teacher mappings in this class
                and section.
              </DialogDescription>
            </DialogHeader>
            <label className="text-sm font-medium">
              Subject
              <select
                className={fieldClass}
                value={cell.subjectId ?? ""}
                onChange={(event) =>
                  setCell({
                    ...cell,
                    subjectId: Number(event.target.value) || undefined,
                  })
                }
              >
                <option value="">Select subject</option>
                {scopes.map((scope) => (
                  <option key={scope.subjectId} value={scope.subjectId}>
                    {scope.subjectName}
                  </option>
                ))}
              </select>
            </label>
            {cell.subjectId && (
              <p className="bg-gray-50 p-3 text-sm">
                Teacher: {selectedScope?.teacherName ?? "Not assigned"}
              </p>
            )}
            <label className="text-sm font-medium">
              Room
              <input
                className={fieldClass}
                value={cell.room}
                onChange={(event) =>
                  setCell({ ...cell, room: event.target.value })
                }
              />
            </label>
            <label className="text-sm font-medium">
              Remarks
              <Textarea
                value={cell.remarks}
                onChange={(event) =>
                  setCell({ ...cell, remarks: event.target.value })
                }
              />
            </label>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCell(undefined)}>
                Cancel
              </Button>
              <Button
                disabled={!cell.subjectId || !selectedScope?.teacherId}
                onClick={apply}
              >
                Apply
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      <ConfirmDialog
        open={deleteOpen}
        title="Delete timetable"
        description="This archives the selected timetable and removes it from the grid."
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={() => void remove()}
        onCancel={() => setDeleteOpen(false)}
      />
    </div>
  );
}

function CopySection({
  onCopied,
}: {
  onCopied: (grid: TimetableGridData) => void;
}) {
  const [source, setSource] = useState<GridSelection>({});
  const [target, setTarget] = useState<GridSelection>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const copy = async () => {
    if (!complete(source) || !complete(target))
      return setError("Complete both source and target selections.");
    setBusy(true);
    try {
      onCopied(await copyGrid({ source, target }));
    } catch (requestError) {
      setError(timetableError(requestError));
    } finally {
      setBusy(false);
    }
  };
  return (
    <section className={sectionClass}>
      {error && <Notice error message={error} />}
      <div className="grid gap-8 lg:grid-cols-2">
        <div>
          <h2 className="mb-4 font-semibold">Source timetable</h2>
          <LookupSelectors
            prefix="Source"
            value={source}
            onChange={setSource}
          />
        </div>
        <div>
          <h2 className="mb-4 font-semibold">Target timetable</h2>
          <LookupSelectors
            prefix="Target"
            value={target}
            onChange={setTarget}
          />
        </div>
      </div>
      <Button
        className="mt-6"
        disabled={busy || !complete(source) || !complete(target)}
        onClick={() => void copy()}
      >
        {busy ? <Loader2 className="animate-spin" /> : <Copy />} Copy timetable
      </Button>
    </section>
  );
}

function ReportsSection() {
  const [selection, setSelection] = useState<GridSelection>({});
  const [type, setType] = useState<ReportFilters["type"]>("weekly");
  const [room, setRoom] = useState("");
  const [rows, setRows] = useState<ReportRow[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const filters: ReportFilters = {
    ...selection,
    type: type === "teacher" ? "weekly" : type,
    room: room || undefined,
  };
  const ready = Boolean(
    selection.academicSessionId &&
    (type !== "class" || selection.classId) &&
    (type !== "section" || selection.sectionId) &&
    (type !== "room" || room.trim()),
  );
  const run = async () => {
    if (!ready) return;
    setBusy(true);
    try {
      setRows(await getReport(filters));
    } catch (requestError) {
      setError(timetableError(requestError));
    } finally {
      setBusy(false);
    }
  };
  const exportFile = async (format: "csv" | "xlsx" | "pdf") => {
    try {
      await downloadReport(format, filters);
    } catch (requestError) {
      setError(timetableError(requestError));
    }
  };
  return (
    <div className="space-y-5">
      <section className={sectionClass}>
        {error && <Notice error message={error} />}
        <div className="grid gap-4 md:grid-cols-2">
          <label className="text-sm font-medium">
            Report type
            <select
              className={fieldClass}
              value={type}
              onChange={(event) =>
                setType(event.target.value as ReportFilters["type"])
              }
            >
              <option value="weekly">Weekly</option>
              <option value="teacher">Teacher</option>
              <option value="class">Class</option>
              <option value="section">Section</option>
              <option value="room">Room</option>
            </select>
          </label>
          {type === "room" && (
            <label className="text-sm font-medium">
              Room
              <input
                className={fieldClass}
                value={room}
                onChange={(event) => setRoom(event.target.value)}
              />
            </label>
          )}
        </div>
        <div className="mt-4">
          <LookupSelectors value={selection} onChange={setSelection} />
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          <Button disabled={busy || !ready} onClick={() => void run()}>
            {busy ? <Loader2 className="animate-spin" /> : <BarChart3 />}{" "}
            Generate
          </Button>
          {(["csv", "xlsx", "pdf"] as const).map((format) => (
            <Button
              key={format}
              variant="outline"
              disabled={!ready}
              onClick={() => void exportFile(format)}
            >
              <Download /> {format.toUpperCase()}
            </Button>
          ))}
        </div>
      </section>
      {rows.length > 0 && (
        <section className={`${sectionClass} overflow-x-auto`}>
          <h2 className="mb-4 font-semibold">Report preview</h2>
          <table className="w-full min-w-[1000px] text-left text-sm">
            <thead className="bg-gray-50">
              <tr>
                {[
                  "Day",
                  "Period",
                  "Class",
                  "Section",
                  "Subject",
                  "Teacher",
                  "Room",
                  "Remarks",
                ].map((heading) => (
                  <th key={heading} className="p-3">
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.map((row, index) => (
                <tr
                  key={`${row.timetableId}-${row.dayOfWeek}-${row.periodId}-${index}`}
                >
                  <td className="p-3">{row.dayOfWeek}</td>
                  <td className="p-3">
                    {row.periodName}
                    <br />
                    <span className="text-xs text-gray-500">
                      {row.startTime} - {row.endTime}
                    </span>
                  </td>
                  <td className="p-3">{row.className}</td>
                  <td className="p-3">{row.sectionName}</td>
                  <td className="p-3">{row.subjectName ?? row.periodName}</td>
                  <td className="p-3">{row.teacherName ?? "-"}</td>
                  <td className="p-3">{row.room ?? "-"}</td>
                  <td className="p-3">{row.remarks ?? "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </div>
  );
}

export default function AdminTimetablePage() {
  const [tab, setTab] = useState("dashboard");
  const [copied, setCopied] = useState<TimetableGridData>();
  return (
    <AdminLayout>
      <PageHeader
        title="Timetable"
        subtitle="Build weekly schedules, configure periods, and review reports."
      />
      <Tabs value={tab} onValueChange={setTab}>
        <div className="mb-5 overflow-x-auto">
          <TabsList className="h-auto min-w-max justify-start bg-white p-1 shadow-sm">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="weekly">Weekly Timetable</TabsTrigger>
            <TabsTrigger value="periods">Period Management</TabsTrigger>
            <TabsTrigger value="days">Working Days</TabsTrigger>
            <TabsTrigger value="copy">Copy</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="dashboard">
          <DashboardSection />
        </TabsContent>
        <TabsContent value="weekly">
          <WeeklySection
            key={copied?.timetableId ?? "weekly"}
            initial={copied}
          />
        </TabsContent>
        <TabsContent value="periods">
          <PeriodSection />
        </TabsContent>
        <TabsContent value="days">
          <WorkingDaysSection />
        </TabsContent>
        <TabsContent value="copy">
          <CopySection
            onCopied={(grid) => {
              setCopied(grid);
              setTab("weekly");
            }}
          />
        </TabsContent>
        <TabsContent value="reports">
          <ReportsSection />
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
}
