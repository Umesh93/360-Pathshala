export interface Student {
  id: number;
  admissionNo: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  rollNumber: string;
  class: string;
  section: string;
  classId?: number;
  className: string;
  sectionId?: number;
  sectionName: string;
  guardianId?: number;
  guardianName: string;
  gender: "male" | "female" | "other";
  dob: string;
  phone: string;
  email?: string;
  address: string;
  status: "active" | "inactive" | "transferred" | "graduated" | "suspended" | "dropped";
  category?: string;
  bloodGroup?: string;
  religion?: string;
  nationality?: string;
  house?: string;
  previousSchool?: string;
  transport?: string;
  hostel?: string;
  medicalConditions?: string;
  allergies?: string;
  disability?: string;
  doctor?: string;
  emergencyContact?: string;
  admissionDate: string;
  province?: string;
  provinceId?: number;
  district?: string;
  districtId?: number;
  municipality?: string;
  municipalityId?: number;
  ward?: number;
  wardId?: number;
  street?: string;
  photo?: string;
  guardian: Guardian;
  classTeacher?: string;
  subjects?: string[];
  academicYear?: string; medium?: string; scholarship?: string; caste?: string; motherTongue?: string;
  citizenshipNumber?: string; emisId?: string; studentIdBarcode?: string; medicalBloodGroup?: string;
  height?: string; weight?: string; medicalConditionsOther?: string; emergencyContactPerson?: string;
  emergencyContactNumber?: string; previousAddress?: string; previousClass?: string;
  transferCertificateNumber?: string; reasonForLeaving?: string; hasHostel?: boolean;
  roomNumber?: string; bedNumber?: string; usesTransport?: boolean; route?: string;
  pickupPoint?: string; vehicle?: string; documents?: string; documentCategories?: string; notes?: string;
}

export interface StudentResponse {
  id: number;
  admissionNo: string | null;
  rollNumber: string | null;
  firstName: string;
  lastName: string;
  dob: string | null;
  gender: string | null;
  status: string | null;
  classId: number | null;
  sectionId: number | null;
  guardianId: number | null;
  className: string | null;
  sectionName: string | null;
  guardianName: string | null;
  guardian: Guardian | null;
  provinceId: number | null;
  province: string | null;
  districtId: number | null;
  district: string | null;
  municipalityId: number | null;
  municipality: string | null;
  wardId: number | null;
  ward: number | null;
  street: string | null;
  details: StudentDetailsResponse | null;
}

export interface StudentDetailsResponse {
  academicYear: string | null; medium: string | null; admissionDate: string | null; house: string | null; scholarship: string | null;
  middleName: string | null; bloodGroup: string | null; religion: string | null; caste: string | null; nationality: string | null; motherTongue: string | null;
  studentPhone: string | null; studentEmail: string | null; citizenshipNumber: string | null; emisId: string | null; studentIdBarcode: string | null; photo: string | null;
  medicalBloodGroup: string | null; height: string | null; weight: string | null; medicalConditions: string | null; medicalConditionsOther: string | null; allergies: string | null; disability: string | null;
  emergencyContactPerson: string | null; emergencyContactNumber: string | null; previousSchool: string | null; previousAddress: string | null; previousClass: string | null;
  transferCertificateNumber: string | null; reasonForLeaving: string | null; hasHostel: boolean | null; hostel: string | null; roomNumber: string | null; bedNumber: string | null;
  usesTransport: boolean | null; route: string | null; pickupPoint: string | null; vehicle: string | null; documents: string | null; documentCategories: string | null; notes: string | null;
}

export interface StudentRequest {
  admissionNumber: unknown;
  rollNumber: unknown;
  firstName: unknown;
  lastName: unknown;
  dateOfBirth: unknown;
  gender: unknown;
  parentId: number | null;
  classId: number | null;
  sectionId: number | null;
  province?: unknown;
  district?: unknown;
  municipality?: unknown;
  ward: number | null;
  street?: unknown;
  fatherName?: unknown;
  motherName?: unknown;
  guardianName?: unknown;
  relationship?: unknown;
  occupation?: unknown;
  guardianPhone?: unknown;
  guardianEmail?: unknown;
  guardianAddress?: unknown;
  academicYear?: unknown; medium?: unknown; admissionDate?: unknown; house?: unknown; status?: unknown; scholarship?: unknown; middleName?: unknown;
  bloodGroup?: unknown; religion?: unknown; caste?: unknown; nationality?: unknown; motherTongue?: unknown; studentPhone?: unknown; studentEmail?: unknown;
  citizenshipNumber?: unknown; emisId?: unknown; studentIdBarcode?: unknown; photo?: unknown; fatherOccupation?: unknown; fatherPhone?: unknown; fatherEmail?: unknown;
  motherOccupation?: unknown; motherPhone?: unknown; motherEmail?: unknown; medicalBloodGroup?: unknown; height?: unknown; weight?: unknown; medicalConditions?: unknown;
  medicalConditionsOther?: unknown; allergies?: unknown; disability?: unknown; emergencyContactPerson?: unknown; emergencyContactNumber?: unknown; previousSchool?: unknown;
  previousAddress?: unknown; previousClass?: unknown; transferCertificateNumber?: unknown; reasonForLeaving?: unknown; hasHostel?: unknown; hostel?: unknown; roomNumber?: unknown;
  bedNumber?: unknown; usesTransport?: unknown; route?: unknown; pickupPoint?: unknown; vehicle?: unknown; documents?: unknown; documentCategories?: unknown; notes?: unknown;
}

export interface StudentEditLookups {
  classes: { id: number; name: string }[];
  sections: { id: number; name: string; classId: number }[];
  guardians: { id: number; name: string }[];
  provinces: { id: number; name: string }[];
  districts: { id: number; name: string; provinceId: number }[];
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
  fatherOccupation?: string; fatherPhone?: string; fatherEmail?: string;
  motherOccupation?: string; motherPhone?: string; motherEmail?: string;
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
