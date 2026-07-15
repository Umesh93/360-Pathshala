export interface Student {
  id: number;
  admissionNo: string;
  firstName: string;
  lastName: string;
  rollNumber: string;
  class: string;
  section: string;
  gender: "male" | "female" | "other";
  dob: string;
  bloodGroup?: string;
  phone: string;
  email?: string;
  address: string;
  category: string;
  religion?: string;
  nationality?: string;
  status: "active" | "inactive";
  photo?: string;
  admissionDate: string;
  house?: string;
  previousSchool?: string;
  transport?: string;
  hostel?: string;
  medicalConditions?: string;
  allergies?: string;
  disability?: string;
  doctor?: string;
  emergencyContact?: string;
  guardian: Guardian;
  classTeacher?: string;
  subjects?: string[];
}

export interface Guardian {
  fatherName?: string;
  motherName?: string;
  guardianName?: string;
  relationship: string;
  occupation?: string;
  phone: string;
  email?: string;
  address: string;
}

export interface AttendanceRecord {
  id: number;
  date: string;
  status: "present" | "absent" | "late" | "leave" | "half_day";
  studentId: number;
}

export interface AttendanceSummary {
  total: number;
  present: number;
  absent: number;
  late: number;
  leave: number;
  halfDay: number;
  percentage: number;
  monthlyData: { month: string; present: number; absent: number }[];
}

export interface FeeRecord {
  id: number;
  studentId: number;
  feeType: string;
  amount: number;
  paidAmount: number;
  dueDate: string;
  status: "paid" | "pending" | "overdue";
  paymentHistory: Payment[];
}

export interface Payment {
  id: number;
  date: string;
  amount: number;
  method: string;
  receiptNo: string;
}

export interface ExamResult {
  id: number;
  examId: number;
  examName: string;
  studentId: number;
  subjects: SubjectMark[];
  totalMarks: number;
  obtainedMarks: number;
  percentage: number;
  grade: string;
  division?: string;
  rank?: number;
}

export interface SubjectMark {
  subject: string;
  marks: number;
  fullMarks: number;
  grade: string;
}

export interface Document {
  id: number;
  name: string;
  type: string;
  url: string;
  uploadedAt: string;
}

export interface ActivityLog {
  id: number;
  action: string;
  description: string;
  date: string;
  user: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
