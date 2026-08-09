import { useEffect, useState } from "react";
import { CalendarDays, Clock3, MapPin, UserRound } from "lucide-react";
import { Button } from "../../components/ui/button";
import type {
  DayOfWeek,
  GridSelection,
  Option,
  Period,
  ScheduleResponse,
  TimetableEntry,
  TimetableGridData,
} from "./types";
import { DAYS, dayLabel, isSubjectAllocatable } from "./types";
import { getLookups, getSections, timetableError } from "./service";

const inputClass =
  "mt-1 block h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-800 focus:border-[#234A91] focus:outline-none focus:ring-1 focus:ring-[#234A91] disabled:bg-gray-100";

export const Notice = ({
  message,
  error = false,
}: {
  message: string;
  error?: boolean;
}) => (
  <div
    role={error ? "alert" : "status"}
    className={`rounded-md border px-4 py-3 text-sm ${error ? "border-red-200 bg-red-50 text-red-700" : "border-emerald-200 bg-emerald-50 text-emerald-700"}`}
  >
    {message}
  </div>
);

export const EmptyState = ({
  title,
  description,
}: {
  title: string;
  description: string;
}) => (
  <div className="border border-dashed border-gray-300 bg-gray-50 px-5 py-12 text-center">
    <CalendarDays className="mx-auto mb-3 h-7 w-7 text-gray-400" />
    <h3 className="font-semibold text-gray-800">{title}</h3>
    <p className="mx-auto mt-1 max-w-lg text-sm text-gray-500">{description}</p>
  </div>
);

interface LookupSelectorsProps {
  value: GridSelection;
  onChange: (value: GridSelection) => void;
  includeSection?: boolean;
  prefix?: string;
  disabled?: boolean;
}

export function LookupSelectors({
  value,
  onChange,
  includeSection = true,
  prefix = "",
  disabled = false,
}: LookupSelectorsProps) {
  const [sessions, setSessions] = useState<Option[]>([]);
  const [classes, setClasses] = useState<Option[]>([]);
  const [sections, setSections] = useState<Option[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    getLookups()
      .then((result) => {
        if (!active) return;
        setSessions(result.sessions);
        setClasses(result.classes);
      })
      .catch(
        (requestError) => active && setError(timetableError(requestError)),
      );
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!includeSection || !value.classId) return;
    let active = true;
    getSections(value.classId)
      .then((records) => active && setSections(records))
      .catch(
        (requestError) => active && setError(timetableError(requestError)),
      );
    return () => {
      active = false;
    };
  }, [includeSection, value.classId]);

  return (
    <div
      className={`grid gap-4 ${includeSection ? "md:grid-cols-3" : "md:grid-cols-1"}`}
    >
      <label className="text-sm font-medium text-gray-700">
        {prefix} Academic Session
        <select
          className={inputClass}
          value={value.academicSessionId ?? ""}
          disabled={disabled}
          onChange={(event) =>
            onChange({
              ...value,
              academicSessionId: Number(event.target.value) || undefined,
            })
          }
        >
          <option value="">Select session</option>
          {sessions.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
      </label>
      {includeSection && (
        <label className="text-sm font-medium text-gray-700">
          {prefix} Class
          <select
            className={inputClass}
            value={value.classId ?? ""}
            disabled={disabled}
            onChange={(event) =>
              onChange({
                ...value,
                classId: Number(event.target.value) || undefined,
                sectionId: undefined,
              })
            }
          >
            <option value="">Select class</option>
            {classes.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </label>
      )}
      {includeSection && (
        <label className="text-sm font-medium text-gray-700">
          {prefix} Section
          <select
            className={inputClass}
            value={value.sectionId ?? ""}
            disabled={disabled || !value.classId}
            onChange={(event) =>
              onChange({
                ...value,
                sectionId: Number(event.target.value) || undefined,
              })
            }
          >
            <option value="">Select section</option>
            {sections.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </label>
      )}
      {error && (
        <div className="md:col-span-3">
          <Notice error message={error} />
        </div>
      )}
    </div>
  );
}

const entryFor = (
  entries: TimetableEntry[],
  day: DayOfWeek,
  periodId: number,
) =>
  entries.find(
    (entry) => entry.dayOfWeek === day && entry.periodId === periodId,
  );

export function EntryCard({
  entry,
  period,
}: {
  entry?: TimetableEntry;
  period?: Period;
}) {
  if (!isSubjectAllocatable(entry?.type ?? period?.type)) {
    return (
      <div className="flex min-h-20 items-center justify-center bg-gray-100 px-3 text-center text-xs font-semibold uppercase text-gray-500">
        {entry?.periodName ?? period?.name ?? "Non-teaching"}
      </div>
    );
  }
  return (
    <div className="min-h-20 bg-white p-3">
      <p className="font-semibold text-gray-900">
        {entry?.subjectName ?? "Unassigned"}
      </p>
      {entry?.teacherName && (
        <p className="mt-1 flex items-center gap-1 text-xs text-gray-600">
          <UserRound className="h-3.5 w-3.5" /> {entry.teacherName}
        </p>
      )}
      {entry?.room && (
        <p className="mt-1 flex items-center gap-1 text-xs text-gray-500">
          <MapPin className="h-3.5 w-3.5" /> {entry.room}
        </p>
      )}
      {entry?.remarks && (
        <p className="mt-1 text-xs text-gray-500">{entry.remarks}</p>
      )}
    </div>
  );
}

interface TimetableGridProps {
  grid?: TimetableGridData;
  entries?: TimetableEntry[];
  editable?: boolean;
  onCellClick?: (
    day: DayOfWeek,
    period: Period,
    entry?: TimetableEntry,
  ) => void;
}

export function TimetableGrid({
  grid,
  entries = grid?.entries ?? [],
  editable,
  onCellClick,
}: TimetableGridProps) {
  const inferredDays = DAYS.filter((day) =>
    entries.some((entry) => entry.dayOfWeek === day),
  );
  const days = grid?.workingDays.length ? grid.workingDays : inferredDays;
  const inferredPeriods = entries
    .filter(
      (entry, index) =>
        entries.findIndex((item) => item.periodId === entry.periodId) === index,
    )
    .map((entry): Period => ({
      id: entry.periodId,
      academicSessionId: grid?.academicSessionId ?? 0,
      name: entry.periodName,
      periodNumber: entry.periodNumber,
      startTime: entry.startTime,
      endTime: entry.endTime,
      type: entry.type ?? "TEACHING_PERIOD",
      active: true,
    }))
    .sort((a, b) => a.startTime.localeCompare(b.startTime));
  const periods = grid?.periods.length ? grid.periods : inferredPeriods;
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>(
    days[0] ?? "MONDAY",
  );
  const visibleDay = days.includes(selectedDay)
    ? selectedDay
    : (days[0] ?? "MONDAY");

  if (!days.length || !periods.length) {
    return (
      <EmptyState
        title="No schedule configured"
        description="There are no timetable days or periods to display."
      />
    );
  }

  return (
    <div>
      <div className="mb-3 flex gap-2 overflow-x-auto md:hidden">
        {days.map((day) => (
          <Button
            key={day}
            size="sm"
            variant={visibleDay === day ? "default" : "outline"}
            onClick={() => setSelectedDay(day)}
          >
            {dayLabel(day)}
          </Button>
        ))}
      </div>
      <div className="space-y-2 md:hidden">
        {periods.map((period) => {
          const entry = entryFor(entries, visibleDay, period.id);
          return (
            <button
              type="button"
              key={period.id}
              disabled={!editable || !isSubjectAllocatable(period.type)}
              onClick={() => onCellClick?.(visibleDay, period, entry)}
              className="grid w-full grid-cols-[7rem_1fr] overflow-hidden border border-gray-200 text-left disabled:cursor-default"
            >
              <div className="bg-gray-50 p-3 text-xs text-gray-600">
                <p className="font-semibold text-gray-800">{period.name}</p>
                <p className="mt-1 flex items-center gap-1">
                  <Clock3 className="h-3 w-3" /> {period.startTime}
                </p>
              </div>
              <EntryCard entry={entry} period={period} />
            </button>
          );
        })}
      </div>
      <div className="hidden overflow-x-auto border border-gray-200 md:block">
        <table className="w-full min-w-[900px] table-fixed border-collapse text-left text-sm">
          <thead>
            <tr className="bg-gray-50">
              <th className="w-40 border-b border-r border-gray-200 p-3 text-gray-600">
                Period
              </th>
              {days.map((day) => (
                <th
                  key={day}
                  className="border-b border-r border-gray-200 p-3 text-gray-700"
                >
                  {dayLabel(day)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {periods.map((period) => (
              <tr key={period.id}>
                <th className="border-b border-r border-gray-200 bg-gray-50 p-3 align-top">
                  <p className="font-semibold text-gray-800">{period.name}</p>
                  <p className="mt-1 text-xs font-normal text-gray-500">
                    {period.startTime} - {period.endTime}
                  </p>
                </th>
                {days.map((day) => {
                  const entry = entryFor(entries, day, period.id);
                  const canEdit = Boolean(
                    editable && isSubjectAllocatable(period.type),
                  );
                  return (
                    <td
                      key={day}
                      className="border-b border-r border-gray-200 p-0 align-top"
                    >
                      <button
                        type="button"
                        className={`block w-full text-left ${canEdit ? "hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#234A91]" : "cursor-default"}`}
                        disabled={!canEdit}
                        onClick={() => onCellClick?.(day, period, entry)}
                      >
                        <EntryCard entry={entry} period={period} />
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export const ScheduleSummary = ({
  schedule,
}: {
  schedule: ScheduleResponse;
}) => {
  const cards = [
    { label: "Today", value: schedule.todayEntries.length },
    { label: "Tomorrow", value: schedule.tomorrowEntries.length },
    { label: "Free periods", value: schedule.freePeriods.length },
  ];
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {cards.map((card) => (
        <div
          key={card.label}
          className="border border-gray-200 bg-white p-4 shadow-sm"
        >
          <p className="text-sm text-gray-500">{card.label}</p>
          <p className="mt-1 text-2xl font-bold text-gray-800">{card.value}</p>
        </div>
      ))}
    </div>
  );
};
