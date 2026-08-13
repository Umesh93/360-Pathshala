import api from "../../services/api";
import {
  getAttendanceLookups,
  getMonthlySummary,
  getStudentRoster,
  saveStudentAttendance,
} from "../admin/attendance/attendance.service";
import type {
  AttendanceFilters,
  AttendanceStatus,
  BulkRecord,
  StudentAttendanceRow,
} from "../admin/attendance/attendance.types";
import type { AttendanceRecord, AttendanceSummary, Child } from "./types";

export const getDateRange = (month: string) => {
  const [year, monthNumber] = month.split("-").map(Number);
  const end = new Date(Date.UTC(year, monthNumber, 0)).getUTCDate();
  return {
    startDate: `${month}-01`,
    endDate: `${month}-${String(end).padStart(2, "0")}`,
  };
};

export const getMyAttendance = async (month: string) => {
  const dates = getDateRange(month);
  const response = await api.get("/attendance/students/self/history", {
    params: { start: dates.startDate, end: dates.endDate },
  });
  return {
    items: (
      response.data as Array<{
        id: number;
        studentId: number;
        studentName: string;
        date: string;
        status: AttendanceStatus;
        remarks?: string;
      }>
    ).map((record): StudentAttendanceRow => ({
      id: record.id,
      studentId: record.studentId,
      admissionNumber: "",
      rollNumber: "",
      name: record.studentName,
      date: record.date,
      status: record.status,
      remarks: record.remarks || "",
      existing: true,
    })),
  };
};
export const getMyMonthlySummary = async (month: string) =>
  getMonthlySummary(getDateRange(month));
export const getTeacherLookups = async () => {
  const [lookups, assignments] = await Promise.all([
    getAttendanceLookups(),
    api.get("/attendance/teachers/self/assignments"),
  ]);
  const assigned = assignments.data as { classId: number; sectionId: number }[];
  return {
    ...lookups,
    classes: lookups.classes.filter((item) =>
      assigned.some((entry) => entry.classId === item.id),
    ),
    sections: lookups.sections.filter((item) =>
      assigned.some((entry) => entry.sectionId === item.id),
    ),
  };
};
export const getAssignedRoster = async (filters: AttendanceFilters) =>
  getStudentRoster({
    ...filters,
    academicSessionId: filters.academicSessionId || undefined,
    page: 0,
    size: 200,
  });
export const saveAssignedRoster = (
  filters: AttendanceFilters,
  records: BulkRecord[],
  update: boolean,
) => saveStudentAttendance(filters, records, update);
export const getTeacherToday = async () =>
  (await api.get("/attendance/teachers/self/today")).data;
export const teacherCheckIn = async () =>
  (await api.post("/attendance/teachers/self/check-in")).data;
export const teacherCheckOut = async () =>
  (await api.post("/attendance/teachers/self/check-out")).data;

export const summarizeAttendance = (
  records: AttendanceRecord[],
): AttendanceSummary => {
  const summary = records.reduce(
    (result, record) => {
      result.total += 1;
      if (record.status === "PRESENT") result.present += 1;
      if (record.status === "ABSENT") result.absent += 1;
      if (record.status === "LATE") result.late += 1;
      if (record.status === "LEAVE") result.leave += 1;
      return result;
    },
    { total: 0, present: 0, absent: 0, late: 0, leave: 0, percentage: 0 },
  );
  summary.percentage = summary.total
    ? Math.round((summary.present / summary.total) * 100)
    : 0;
  return summary;
};

export const getMyChildrenAttendance = async (
  month: string,
): Promise<Child[]> => {
  const dates = getDateRange(month);
  const response = await api.get("/attendance/parents/self/children", {
    params: { start: dates.startDate, end: dates.endDate },
  });
  return (
    response.data as {
      studentId: number;
      admissionNumber?: string;
      studentName: string;
      className?: string;
      sectionName?: string;
      attendance: Array<{
        id: number;
        studentId: number;
        date: string;
        status: AttendanceStatus;
        remarks?: string;
      }>;
    }[]
  ).map((child) => ({
    id: child.studentId,
    admissionNumber: child.admissionNumber,
    firstName: child.studentName.split(" ")[0],
    lastName: child.studentName.split(" ").slice(1).join(" "),
    className: child.className,
    sectionName: child.sectionName,
    attendance: child.attendance.map((record) => ({
      id: record.id,
      studentId: record.studentId,
      attendanceDate: record.date,
      status: record.status,
      remarks: record.remarks,
    })),
  }));
};
