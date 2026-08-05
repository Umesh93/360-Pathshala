import type { AttendanceStatus } from "../admin/attendance/attendance.types";

export type { AttendanceStatus };

export interface AttendanceRecord {
  id: number;
  studentId: number;
  classId?: number | null;
  sectionId?: number | null;
  attendanceDate: string;
  status: AttendanceStatus;
  remarks?: string | null;
}

export interface Child {
  id: number;
  admissionNumber?: string | null;
  rollNumber?: string | null;
  firstName: string;
  lastName: string;
  className?: string | null;
  sectionName?: string | null;
  status?: string | null;
  attendance?: AttendanceRecord[];
}

export interface AttendanceSummary {
  total: number;
  present: number;
  absent: number;
  late: number;
  leave: number;
  percentage: number;
}
