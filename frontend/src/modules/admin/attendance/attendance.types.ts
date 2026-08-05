export type AttendanceStatus = "PRESENT" | "ABSENT" | "LATE" | "LEAVE";

export interface Option { id: number; name: string; classId?: number }
export interface PageResult<T> { items: T[]; page: number; totalPages: number; total: number }
export interface AttendanceFilters {
  academicSessionId?: number;
  date?: string;
  classId?: number;
  sectionId?: number;
  startDate?: string;
  endDate?: string;
  status?: AttendanceStatus;
  search?: string;
  page?: number;
  size?: number;
}
export interface StudentAttendanceRow {
  id?: number;
  studentId: number;
  admissionNumber: string;
  rollNumber: string;
  name: string;
  status: AttendanceStatus;
  remarks: string;
  existing: boolean;
  date?: string;
  className?: string;
  sectionName?: string;
}
export interface TeacherAttendanceRow {
  id?: number;
  teacherId: number;
  employeeNumber: string;
  name: string;
  department: string;
  status: AttendanceStatus;
  remarks: string;
  existing: boolean;
  date?: string;
  checkIn?: string;
  checkOut?: string;
}
export interface DashboardData {
  total: number;
  present: number;
  absent: number;
  late: number;
  leave: number;
  teachersPresent: number;
  teachersAbsent: number;
  approvedLeaves: number;
  rate: number;
  trend: Array<{ label: string; present: number; absent: number }>;
  distribution: Array<{ name: string; value: number }>;
}
export interface MonthlyRow {
  id: number;
  name: string;
  code: string;
  present: number;
  absent: number;
  late: number;
  leave: number;
  workingDays: number;
  percentage: number;
}
export interface Holiday {
  id: number;
  name: string;
  date: string;
  endDate?: string;
  description?: string;
  recurring?: boolean;
}
export interface Correction {
  id: number;
  attendanceId?: number;
  personId?: number;
  personName: string;
  personType: "STUDENT" | "TEACHER";
  date: string;
  previousStatus: AttendanceStatus;
  requestedStatus: AttendanceStatus;
  reason: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  requestedAt?: string;
}
export interface AttendanceSettings {
  studentCutoffTime: string;
  teacherCutoffTime: string;
  lateAfterMinutes: number;
  allowTeacherEdits: boolean;
  notifyGuardians: boolean;
  excludeWeekends: boolean;
}
export interface BulkRecord {
  id?: number;
  studentId?: number;
  teacherId?: number;
  status: AttendanceStatus;
  remarks?: string;
}
