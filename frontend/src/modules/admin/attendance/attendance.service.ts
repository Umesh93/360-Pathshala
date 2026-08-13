import api from "../../../services/api";
import type {
  AttendanceFilters,
  AttendanceSettings,
  AttendanceStatus,
  BulkRecord,
  Correction,
  DashboardData,
  Holiday,
  MonthlyRow,
  Option,
  PageResult,
  StudentAttendanceRow,
  TeacherAttendanceRow,
} from "./attendance.types";

type Json = Record<string, unknown>;
const object = (value: unknown): Json =>
  value && typeof value === "object" ? (value as Json) : {};
const text = (value: unknown, fallback = "") =>
  typeof value === "string" ? value : value == null ? fallback : String(value);
const number = (value: unknown, fallback = 0) =>
  Number.isFinite(Number(value)) ? Number(value) : fallback;
const bool = (value: unknown, fallback = false) =>
  typeof value === "boolean" ? value : fallback;
const array = (value: unknown): unknown[] =>
  Array.isArray(value) ? value : [];
const status = (value: unknown): AttendanceStatus => {
  const normalized = text(value, "ABSENT").toUpperCase();
  return normalized === "PRESENT" ||
    normalized === "LATE" ||
    normalized === "LEAVE"
    ? normalized
    : "ABSENT";
};
const payloadItems = (value: unknown) => {
  const data = object(value);
  return array(data.content ?? data.items ?? data.data ?? value);
};
const page = <T>(value: unknown, mapper: (item: Json) => T): PageResult<T> => {
  const data = object(value);
  return {
    items: payloadItems(value).map((item) => mapper(object(item))),
    page: number(data.number ?? data.page),
    totalPages: Math.max(number(data.totalPages, 1), 1),
    total: number(
      data.totalElements ?? data.total ?? payloadItems(value).length,
    ),
  };
};
const fullName = (item: Json) =>
  text(
    item.name ?? item.fullName ?? item.studentName ?? item.teacherName,
    `${text(item.firstName)} ${text(item.lastName)}`.trim() || "Unknown",
  );

export const errorMessage = (error: unknown) => {
  const value = object(error);
  const response = object(value.response);
  const data = object(response.data);
  return text(
    data.message ?? value.message,
    "Request failed. Please try again.",
  );
};

export const getAttendanceLookups = async () => {
  const [sessions, classes, sections] = await Promise.allSettled([
    api.get("/academic/years", { params: { page: 0, size: 100 } }),
    api.get("/academic/classes", { params: { page: 0, size: 100 } }),
    api.get("/academic/sections", { params: { page: 0, size: 200 } }),
  ]);
  const options = (
    result: PromiseSettledResult<{ data: unknown }>,
    withClass = false,
  ): Option[] =>
    result.status === "fulfilled"
      ? payloadItems(result.value.data)
          .map((entry) => {
            const item = object(entry);
            return {
              id: number(item.id),
              name: text(item.name ?? item.title ?? item.academicYear),
              ...(withClass ? { classId: number(item.classId) } : {}),
            };
          })
          .filter((item) => item.id > 0)
      : [];
  return {
    sessions: options(sessions),
    classes: options(classes),
    sections: options(sections, true),
  };
};

export const getDashboard = async (date?: string): Promise<DashboardData> => {
  const { data } = await api.get("/attendance/dashboard", { params: { date } });
  const value = object(data);
  const summary = object(value.summary ?? value);
  const present = number(summary.present);
  const absent = number(summary.absent);
  const late = number(summary.late);
  const leave = number(summary.leave);
  const total = number(summary.total, present + absent + late + leave);
  const trends = array(
    value.trend ?? value.weeklyTrend ?? value.dailyTrend,
  ).map((entry) => {
    const item = object(entry);
    return {
      label: text(item.label ?? item.date ?? item.day),
      present: number(item.present),
      absent: number(item.absent),
    };
  });
  return {
    total,
    present,
    absent,
    late,
    leave,
    teachersPresent: number(summary.teachersPresent),
    teachersAbsent: number(summary.teachersAbsent),
    approvedLeaves: number(summary.approvedLeaves),
    rate: number(
      summary.rate ?? summary.percentage,
      total ? Math.round((present / total) * 1000) / 10 : 0,
    ),
    trend: trends,
    distribution: [
      { name: "Present", value: present },
      { name: "Absent", value: absent },
      { name: "Late", value: late },
      { name: "Leave", value: leave },
    ],
  };
};

const mapStudent = (item: Json): StudentAttendanceRow => {
  const student = object(item.student);
  const attendance = object(item.attendance);
  const source = Object.keys(attendance).length ? attendance : item;
  return {
    id: number(source.id ?? item.attendanceId) || undefined,
    studentId: number(item.studentId ?? student.id),
    admissionNumber: text(
      item.admissionNumber ?? student.admissionNumber ?? student.admissionNo,
    ),
    rollNumber: text(item.rollNumber ?? student.rollNumber),
    name: fullName(Object.keys(student).length ? student : item),
    status: status(source.status),
    remarks: text(source.remarks),
    existing: bool(item.existing, Boolean(source.id ?? item.attendanceId)),
    date: text(source.date ?? source.attendanceDate) || undefined,
    checkIn: text(source.checkIn) || undefined,
    checkOut: text(source.checkOut) || undefined,
    className:
      text(item.className ?? object(item.academicClass).name) || undefined,
    sectionName:
      text(item.sectionName ?? object(item.section).name) || undefined,
  };
};
const mapTeacher = (item: Json): TeacherAttendanceRow => {
  const teacher = object(item.teacher);
  const attendance = object(item.attendance);
  const source = Object.keys(attendance).length ? attendance : item;
  return {
    id: number(source.id) || undefined,
    teacherId: number(item.teacherId ?? teacher.id),
    employeeNumber: text(
      item.employeeNumber ?? teacher.employeeNumber ?? teacher.teacherId,
    ),
    name: fullName(Object.keys(teacher).length ? teacher : item),
    department: text(item.department ?? teacher.department),
    status: status(source.status),
    remarks: text(source.remarks),
    existing: bool(item.existing, Boolean(source.id)),
    date: text(source.date ?? source.attendanceDate) || undefined,
  };
};

export const getStudentRoster = async (filters: AttendanceFilters) =>
  page(
    (await api.get("/attendance/students/roster", { params: filters })).data,
    mapStudent,
  );
export const saveStudentAttendance = async (
  filters: AttendanceFilters,
  records: BulkRecord[],
  update: boolean,
) =>
  (
    await api.post("/attendance/students/bulk", {
      academicSessionId: filters.academicSessionId,
      date: filters.date,
      classId: filters.classId,
      sectionId: filters.sectionId,
      upsert: update,
      records,
    })
  ).data;
export const getStudentHistory = async (filters: AttendanceFilters) =>
  page(
    (
      await api.get("/attendance/students/history", {
        params: {
          studentId: filters.search
            ? Number(filters.search) || undefined
            : undefined,
          classId: filters.classId,
          sectionId: filters.sectionId,
          status: filters.status,
          start: filters.startDate,
          end: filters.endDate,
        },
      })
    ).data,
    mapStudent,
  );
export const getMonthlySummary = async (
  filters: AttendanceFilters,
): Promise<MonthlyRow[]> => {
  const date = filters.date || `${new Date().toISOString().slice(0, 7)}-01`;
  return payloadItems(
    (
      await api.get("/attendance/students/monthly-summary", {
        params: {
          classId: filters.classId,
          sectionId: filters.sectionId,
          year: Number(date.slice(0, 4)),
          month: Number(date.slice(5, 7)),
        },
      })
    ).data,
  ).map((entry) => {
    const item = object(entry);
    const present = number(item.present);
    const marked = number(item.marked ?? item.workingDays ?? item.totalDays);
    return {
      id: number(item.studentId ?? item.id),
      name: fullName(item),
      code: text(item.admissionNumber ?? item.employeeNumber ?? item.code),
      present,
      absent: number(item.absent),
      late: number(item.late),
      leave: number(item.leave),
      workingDays: marked,
      percentage: number(
        item.attendancePercentage ?? item.percentage,
        marked ? (present / marked) * 100 : 0,
      ),
    };
  });
};
export const getTeacherRoster = async (filters: AttendanceFilters) =>
  page(
    (
      await api.get("/attendance/teachers", {
        params: {
          start: filters.date || filters.startDate,
          end: filters.date || filters.endDate,
          status: filters.status,
        },
      })
    ).data,
    mapTeacher,
  );
export const saveTeacherAttendance = async (
  date: string,
  records: BulkRecord[],
) =>
  Promise.all(
    records.map(async (record) => {
      const payload = {
        teacherId: record.teacherId,
        date,
        status: record.status,
        remarks: record.remarks || "",
        checkIn: null,
        checkOut: null,
      };
      return record.id
        ? (await api.put(`/attendance/teachers/${record.id}`, payload)).data
        : (await api.post("/attendance/teachers", payload)).data;
    }),
  );

const mapHoliday = (item: Json): Holiday => ({
  id: number(item.id),
  name: text(item.name ?? item.title),
  date: text(item.date ?? item.startDate ?? item.startsOn),
  endDate: text(item.endDate ?? item.endsOn) || undefined,
  description: text(item.description) || undefined,
  recurring: bool(item.recurring),
});
export const getHolidays = async (year: number) =>
  payloadItems(
    (await api.get("/attendance/holidays", { params: { year } })).data,
  ).map((entry) => mapHoliday(object(entry)));
export const saveHoliday = async (
  holiday: Omit<Holiday, "id"> & { id?: number },
) => {
  const payload = {
    name: holiday.name,
    type: "SCHOOL_HOLIDAY",
    startsOn: holiday.date,
    endsOn: holiday.endDate || holiday.date,
    description: holiday.description,
  };
  return holiday.id
    ? (await api.put(`/attendance/holidays/${holiday.id}`, payload)).data
    : (await api.post("/attendance/holidays", payload)).data;
};
export const deleteHoliday = async (id: number) =>
  api.delete(`/attendance/holidays/${id}`);

const mapCorrection = (item: Json): Correction => ({
  id: number(item.id),
  attendanceId: number(item.attendanceId) || undefined,
  personId:
    number(item.personId ?? item.studentId ?? item.teacherId) || undefined,
  personName: text(item.personName ?? item.name),
  personType:
    text(item.personType ?? item.attendanceType, "STUDENT").toUpperCase() ===
    "TEACHER"
      ? "TEACHER"
      : "STUDENT",
  date: text(item.date ?? item.attendanceDate),
  previousStatus: status(item.previousStatus ?? item.currentStatus),
  requestedStatus: status(item.requestedStatus ?? item.newStatus),
  reason: text(item.reason),
  status: text(
    item.requestStatus ?? item.status,
    "PENDING",
  ).toUpperCase() as Correction["status"],
  requestedAt: text(item.requestedAt ?? item.createdAt) || undefined,
});
export const getCorrections = async (filters: AttendanceFilters) =>
  page(
    (await api.get("/attendance/corrections", { params: filters })).data,
    mapCorrection,
  );
export const requestCorrection = async (
  payload: Omit<Correction, "id" | "status" | "previousStatus" | "personName">,
) =>
  (
    await api.post("/attendance/corrections", {
      ...payload,
      attendanceType: payload.personType,
      newStatus: payload.requestedStatus,
    })
  ).data;
export const reviewCorrection = async (
  id: number,
  decision: "APPROVED" | "REJECTED",
) =>
  (
    await api.put(`/attendance/corrections/${id}/review`, undefined, {
      params: { approve: decision === "APPROVED" },
    })
  ).data;

export const exportReport = async (
  format: "csv" | "pdf",
  filters: AttendanceFilters & { reportType?: string },
) => {
  const reportMap: Record<string, string> = {
    "student-summary": "student",
    "student-detailed": "daily",
    "teacher-summary": "teacher",
    absence: "daily",
    "late-arrival": "daily",
  };
  const report = reportMap[filters.reportType || ""] || "daily";
  return (
    await api.get(`/attendance/reports/${report}`, {
      params: {
        format,
        start: filters.startDate,
        end: filters.endDate,
        classId: filters.classId,
        sectionId: filters.sectionId,
      },
      responseType: "blob",
    })
  ).data as Blob;
};
export const getSettings = async (): Promise<AttendanceSettings> => {
  const item = object((await api.get("/attendance/settings")).data);
  const schoolStartTime = text(item.schoolStartTime, "09:00");
  const lateAfter = text(item.lateAfter, "09:15");
  const lateMinutes = Math.max(
    0,
    Number(lateAfter.slice(0, 2)) * 60 +
      Number(lateAfter.slice(3, 5)) -
      (Number(schoolStartTime.slice(0, 2)) * 60 +
        Number(schoolStartTime.slice(3, 5))),
  );
  return {
    studentCutoffTime: text(item.studentCutoffTime, schoolStartTime),
    teacherCutoffTime: text(item.teacherCutoffTime, schoolStartTime),
    lateAfterMinutes: number(item.lateAfterMinutes, lateMinutes),
    allowTeacherEdits: bool(
      item.allowTeacherEdits ?? item.allowTeacherSelfCheckin,
    ),
    notifyGuardians: bool(item.notifyGuardians, true),
    excludeWeekends: bool(item.excludeWeekends, true),
  };
};
export const updateSettings = async (settings: AttendanceSettings) => {
  const [hours, minutes] = settings.studentCutoffTime.split(":").map(Number);
  const late = hours * 60 + minutes + settings.lateAfterMinutes;
  return (
    await api.put("/attendance/settings", {
      ...settings,
      schoolStartTime: settings.studentCutoffTime,
      lateAfter: `${String(Math.floor(late / 60) % 24).padStart(2, "0")}:${String(late % 60).padStart(2, "0")}`,
      allowTeacherSelfCheckin: settings.allowTeacherEdits,
      allowFutureAttendance: false,
    })
  ).data;
};
