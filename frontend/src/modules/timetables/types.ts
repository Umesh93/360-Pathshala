export type DayOfWeek =
  | "SUNDAY"
  | "MONDAY"
  | "TUESDAY"
  | "WEDNESDAY"
  | "THURSDAY"
  | "FRIDAY"
  | "SATURDAY";

export type PeriodType =
  | "TEACHING_PERIOD"
  | "ASSEMBLY"
  | "TEA_BREAK"
  | "LUNCH_BREAK"
  | "ACTIVITY"
  | "EXTRA_CLASS";

export type TimetableStatus = "DRAFT" | "ACTIVE" | "ARCHIVED";

export interface Option {
  id: number;
  name: string;
  classId?: number;
  active?: boolean;
}

export interface Period {
  id: number;
  academicSessionId: number;
  name: string;
  periodNumber?: number;
  startTime: string;
  endTime: string;
  type: PeriodType;
  active: boolean;
}

export interface TeacherScope {
  subjectId: number;
  subjectName: string;
  subjectCode?: string;
  teacherId?: number;
  teacherName?: string;
}

export interface TimetableEntry {
  id?: number;
  timetableId?: number;
  timetableName?: string;
  dayOfWeek: DayOfWeek;
  periodId: number;
  periodName: string;
  periodNumber?: number;
  startTime: string;
  endTime: string;
  type?: PeriodType;
  subjectId?: number;
  subjectName?: string;
  subjectCode?: string;
  teacherId?: number;
  teacherName?: string;
  room?: string;
  remarks?: string;
  classId?: number;
  className?: string;
  sectionId?: number;
  sectionName?: string;
}

export interface TimetableGridData {
  timetableId: number;
  academicSessionId: number;
  academicSessionName: string;
  classId: number;
  className: string;
  sectionId: number;
  sectionName: string;
  name: string;
  status: TimetableStatus;
  effectiveFrom?: string;
  effectiveTo?: string;
  periods: Period[];
  workingDays: DayOfWeek[];
  entries: TimetableEntry[];
}

export interface ReportRow extends TimetableEntry {
  timetableId: number;
  timetableName: string;
  classId: number;
  className: string;
  sectionId: number;
  sectionName: string;
}

export interface ScheduleResponse {
  view: string;
  today: string;
  todayEntries: ReportRow[];
  tomorrowEntries: ReportRow[];
  weeklyEntries: ReportRow[];
  freePeriods: string[];
}

export interface ChildSchedule {
  studentId: number;
  studentName: string;
  className: string;
  sectionName: string;
  schedule: ScheduleResponse;
}

export interface DashboardData {
  totalTimetables: number;
  activeTimetables: number;
  classesScheduledToday: number;
  teachersScheduledToday: number;
  freePeriods: number;
  upcomingChanges: number;
  classesPerDay: Array<{ name: string; value: number }>;
  teacherWorkload: Array<{ name: string; value: number }>;
  subjectDistribution: Array<{ name: string; value: number }>;
  weeklyPeriodDistribution: Array<{ name: string; value: number }>;
}

export interface GridSelection {
  academicSessionId?: number;
  classId?: number;
  sectionId?: number;
}

export interface GridCellInput {
  dayOfWeek: DayOfWeek;
  periodId: number;
  subjectId?: number;
  room?: string;
  remarks?: string;
}

export interface ReportFilters extends GridSelection {
  type: "weekly" | "teacher" | "class" | "section" | "room";
  teacherId?: number;
  room?: string;
}

export const DAYS: DayOfWeek[] = [
  "SUNDAY",
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
];

export const PERIOD_TYPES: PeriodType[] = [
  "TEACHING_PERIOD",
  "ASSEMBLY",
  "TEA_BREAK",
  "LUNCH_BREAK",
  "ACTIVITY",
  "EXTRA_CLASS",
];

export const isSubjectAllocatable = (type?: PeriodType) =>
  type === "TEACHING_PERIOD" || type === "EXTRA_CLASS";

export const dayLabel = (day: DayOfWeek) =>
  day.charAt(0) + day.slice(1).toLowerCase();

export const periodTypeLabel = (type: PeriodType) =>
  type
    .split("_")
    .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
    .join(" ");
