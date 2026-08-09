import api from "../../services/api";
import type {
  ChildSchedule,
  DashboardData,
  DayOfWeek,
  GridCellInput,
  GridSelection,
  Option,
  Period,
  PeriodType,
  ReportFilters,
  ReportRow,
  ScheduleResponse,
  TeacherScope,
  TimetableEntry,
  TimetableGridData,
  TimetableStatus,
} from "./types";

type Json = Record<string, unknown>;

const object = (value: unknown): Json =>
  value && typeof value === "object" && !Array.isArray(value)
    ? (value as Json)
    : {};
const array = (value: unknown): unknown[] =>
  Array.isArray(value) ? value : [];
const text = (value: unknown, fallback = "") =>
  typeof value === "string" ? value : value == null ? fallback : String(value);
const number = (value: unknown, fallback = 0) =>
  Number.isFinite(Number(value)) ? Number(value) : fallback;
const bool = (value: unknown, fallback = false) =>
  typeof value === "boolean" ? value : fallback;
const items = (value: unknown) => {
  const data = object(value);
  return array(data.content ?? data.items ?? data.data ?? value);
};
const params = (values: Record<string, unknown>) =>
  Object.fromEntries(
    Object.entries(values).filter(
      ([, value]) => value !== undefined && value !== null && value !== "",
    ),
  );
const metricRows = (value: unknown): Array<{ name: string; value: number }> =>
  Object.entries(object(value)).map(([name, count]) => ({
    name,
    value: number(count),
  }));

export const timetableError = (error: unknown) => {
  const value = object(error);
  const response = object(value.response);
  const data = object(response.data);
  const errors = array(data.errors)
    .map((entry) => text(object(entry).message ?? entry))
    .filter(Boolean);
  return (
    errors.join(" ") ||
    text(
      data.message ?? data.error ?? value.message,
      "Request failed. Please try again.",
    )
  );
};

const mapPeriod = (value: unknown): Period => {
  const item = object(value);
  return {
    id: number(item.id),
    academicSessionId: number(item.academicSessionId),
    name: text(item.name, "Unknown period"),
    periodNumber: number(item.periodNumber) || undefined,
    startTime: text(item.startTime),
    endTime: text(item.endTime),
    type: text(item.type, "TEACHING_PERIOD") as PeriodType,
    active: bool(item.active, true),
  };
};

const mapEntry = (
  value: unknown,
  period?: Period,
  scope?: {
    timetableId?: number;
    timetableName?: string;
    classId?: number;
    className?: string;
    sectionId?: number;
    sectionName?: string;
  },
): TimetableEntry => {
  const item = object(value);
  return {
    id: number(item.id) || undefined,
    timetableId: number(item.timetableId, scope?.timetableId) || undefined,
    timetableName: text(item.timetableName, scope?.timetableName) || undefined,
    dayOfWeek: text(item.dayOfWeek, "MONDAY") as DayOfWeek,
    periodId: number(item.periodId),
    periodName: text(item.periodName, period?.name ?? "Unknown period"),
    periodNumber: number(item.periodNumber, period?.periodNumber) || undefined,
    startTime: text(item.startTime, period?.startTime),
    endTime: text(item.endTime, period?.endTime),
    type: period?.type,
    subjectId: number(item.subjectId) || undefined,
    subjectName: text(item.subjectName) || undefined,
    teacherId: number(item.teacherId) || undefined,
    teacherName: text(item.teacherName) || undefined,
    room: text(item.room) || undefined,
    remarks: text(item.remarks) || undefined,
    classId: number(item.classId, scope?.classId) || undefined,
    className: text(item.className, scope?.className) || undefined,
    sectionId: number(item.sectionId, scope?.sectionId) || undefined,
    sectionName: text(item.sectionName, scope?.sectionName) || undefined,
  };
};

const mapReportRow = (value: unknown): ReportRow => {
  const item = object(value);
  return {
    ...mapEntry(item),
    timetableId: number(item.timetableId),
    timetableName: text(item.timetableName),
    classId: number(item.classId),
    className: text(item.className),
    sectionId: number(item.sectionId),
    sectionName: text(item.sectionName),
  };
};

const mapGrid = (value: unknown): TimetableGridData => {
  const item = object(value);
  const periods = array(item.periods).map(mapPeriod);
  const timetableId = number(item.id);
  const scope = {
    timetableId,
    timetableName: text(item.name),
    classId: number(item.classId),
    className: text(item.className),
    sectionId: number(item.sectionId),
    sectionName: text(item.sectionName),
  };
  return {
    timetableId,
    academicSessionId: number(item.academicSessionId),
    academicSessionName: text(item.academicSessionName),
    classId: scope.classId,
    className: scope.className,
    sectionId: scope.sectionId,
    sectionName: scope.sectionName,
    name: scope.timetableName,
    status: text(item.status, "DRAFT") as TimetableStatus,
    effectiveFrom: text(item.effectiveFrom) || undefined,
    effectiveTo: text(item.effectiveTo) || undefined,
    periods,
    workingDays: array(item.workingDays).map((day) => text(day) as DayOfWeek),
    entries: array(item.entries).map((entry) => {
      const period = periods.find(
        (candidate) => candidate.id === number(object(entry).periodId),
      );
      return mapEntry(entry, period, scope);
    }),
  };
};

export const getLookups = async (): Promise<{
  sessions: Option[];
  classes: Option[];
}> => {
  const [sessions, classes] = await Promise.all([
    api.get("/academic/years", { params: { page: 0, size: 200 } }),
    api.get("/academic/classes", { params: { page: 0, size: 200 } }),
  ]);
  const mapOptions = (value: unknown): Option[] =>
    items(value)
      .map((entry) => {
        const item = object(entry);
        return {
          id: number(item.id),
          name: text(item.name, "Unknown"),
          active: typeof item.active === "boolean" ? item.active : undefined,
        };
      })
      .filter((item) => item.id > 0);
  return {
    sessions: mapOptions(sessions.data),
    classes: mapOptions(classes.data),
  };
};

export const getSections = async (classId: number): Promise<Option[]> => {
  const { data } = await api.get("/academic/sections", {
    params: { classId, page: 0, size: 200 },
  });
  return items(data)
    .map((entry) => {
      const item = object(entry);
      return {
        id: number(item.id),
        classId: number(item.classId, classId),
        name: text(item.name, "Unknown section"),
      };
    })
    .filter((item) => item.id > 0);
};

export const getDashboard = async (
  academicSessionId: number,
): Promise<DashboardData> => {
  const data = object(
    (await api.get("/timetables/dashboard", { params: { academicSessionId } }))
      .data,
  );
  return {
    totalTimetables: number(data.totalTimetables),
    activeTimetables: number(data.activeTimetables),
    classesScheduledToday: number(data.classesScheduledToday),
    teachersScheduledToday: number(data.teachersScheduledToday),
    freePeriods: number(data.freePeriods),
    upcomingChanges: number(data.upcomingChanges),
    classesPerDay: metricRows(data.classesPerDay),
    teacherWorkload: metricRows(data.teacherWorkload),
    subjectDistribution: metricRows(data.subjectDistribution),
    weeklyPeriodDistribution: metricRows(data.weeklyPeriodDistribution),
  };
};

export const getPeriods = async (
  academicSessionId: number,
  includeInactive = false,
) =>
  array(
    (
      await api.get("/timetables/periods", {
        params: { academicSessionId, includeInactive },
      })
    ).data,
  ).map(mapPeriod);

export const savePeriod = async (
  period: Omit<Period, "id" | "active"> & { id?: number },
) => {
  const payload = {
    academicSessionId: period.academicSessionId,
    name: period.name,
    periodNumber: period.periodNumber,
    startTime: period.startTime,
    endTime: period.endTime,
    type: period.type,
  };
  const response = period.id
    ? await api.put(`/timetables/periods/${period.id}`, payload)
    : await api.post("/timetables/periods", payload);
  return mapPeriod(response.data);
};

export const deletePeriod = (id: number) =>
  api.delete(`/timetables/periods/${id}`);
export const setPeriodActive = (id: number, active: boolean) =>
  api.patch(`/timetables/periods/${id}/status`, undefined, {
    params: { active },
  });

export const getWorkingDays = async (academicSessionId: number) =>
  array(
    (
      await api.get("/timetables/working-days", {
        params: { academicSessionId },
      })
    ).data,
  ).map((day) => text(day) as DayOfWeek);

export const saveWorkingDays = async (
  academicSessionId: number,
  days: DayOfWeek[],
) => api.put("/timetables/working-days", { academicSessionId, days });

export const getTeacherScopes = async (
  selection: Required<GridSelection>,
): Promise<TeacherScope[]> =>
  array(
    (await api.get("/timetables/teacher-scopes", { params: selection })).data,
  ).map((entry) => {
    const item = object(entry);
    return {
      subjectId: number(item.subjectId),
      subjectName: text(item.subjectName, "Unknown subject"),
      subjectCode: text(item.subjectCode) || undefined,
      teacherId: number(item.teacherId) || undefined,
      teacherName: text(item.teacherName) || undefined,
    };
  });

export const getGrid = async (selection: Required<GridSelection>) =>
  mapGrid((await api.get("/timetables/grid", { params: selection })).data);

export const saveGrid = async (
  selection: Required<GridSelection>,
  cells: GridCellInput[],
  name?: string,
) =>
  mapGrid(
    (
      await api.put("/timetables/grid", {
        ...selection,
        name: name || undefined,
        cells,
      })
    ).data,
  );

export const deleteGrid = (selection: Required<GridSelection>) =>
  api.delete("/timetables/grid", { params: selection });

export const setGridStatus = async (
  timetableId: number,
  status: TimetableStatus,
) =>
  mapGrid(
    (await api.patch(`/timetables/${timetableId}/status`, { status })).data,
  );

export const copyGrid = async (payload: {
  source: Required<GridSelection>;
  target: Required<GridSelection>;
  name?: string;
  effectiveFrom?: string;
  effectiveTo?: string;
}) => mapGrid((await api.post("/timetables/copy", payload)).data);

export const getReport = async (filters: ReportFilters): Promise<ReportRow[]> =>
  array(
    (await api.get("/timetables/reports", { params: params({ ...filters }) }))
      .data,
  ).map(mapReportRow);

export const downloadReport = async (
  format: "csv" | "xlsx" | "pdf",
  filters: ReportFilters,
) => {
  const response = await api.get(`/timetables/reports/export.${format}`, {
    params: params({ ...filters }),
    responseType: "blob",
  });
  const url = URL.createObjectURL(response.data as Blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `timetable-${filters.type}.${format}`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
};

const mapSchedule = (value: unknown): ScheduleResponse => {
  const item = object(value);
  return {
    view: text(item.view),
    today: text(item.today),
    todayEntries: array(item.todayEntries).map(mapReportRow),
    tomorrowEntries: array(item.tomorrowEntries).map(mapReportRow),
    weeklyEntries: array(item.weeklyEntries).map(mapReportRow),
    freePeriods: array(item.freePeriods).map((entry) => text(entry)),
  };
};

export const getTeacherSchedule = async (academicSessionId?: number) =>
  mapSchedule(
    (
      await api.get("/timetables/teachers/self", {
        params: params({ academicSessionId }),
      })
    ).data,
  );

export const getStudentSchedule = async () =>
  mapSchedule((await api.get("/timetables/students/self")).data);

export const getChildrenSchedules = async (): Promise<ChildSchedule[]> =>
  array((await api.get("/timetables/parents/self/children")).data).map(
    (entry) => {
      const item = object(entry);
      return {
        studentId: number(item.studentId),
        studentName: text(item.studentName, "Unknown student"),
        className: text(item.className),
        sectionName: text(item.sectionName),
        schedule: mapSchedule(item.schedule),
      };
    },
  );
