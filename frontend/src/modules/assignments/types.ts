export const ASSIGNMENT_CATEGORIES = [
  "HOMEWORK",
  "CLASSWORK",
  "PROJECT",
  "PRACTICAL",
  "PRESENTATION",
  "INTERNAL_ASSESSMENT",
  "HOLIDAY_HOMEWORK",
] as const;

export type AssignmentCategory = (typeof ASSIGNMENT_CATEGORIES)[number];
export type AssignmentStatus = "DRAFT" | "PUBLISHED" | "ACTIVE" | "CLOSED" | "ARCHIVED";
export type SubmissionStatus =
  "PENDING" | "SUBMITTED" | "LATE" | "REVIEWED" | "RETURNED" | "GRADED";

export interface Attachment {
  key: string;
  originalName: string;
  contentType: string;
  size: number;
}

export interface Assignment {
  id: number;
  academicSessionId: number;
  teacherId: number;
  classId: number;
  sectionIds: number[];
  subjectId: number;
  title: string;
  category: AssignmentCategory;
  description: string;
  instructions: string;
  publishAt?: string;
  dueAt: string;
  maximumMarks?: number;
  allowLateSubmission: boolean;
  lateSubmissionDeadline?: string;
  status: AssignmentStatus;
  attachments: Attachment[];
  reminderSentAt?: string;
}

export type AssignmentPayload = Omit<
  Assignment,
  "id" | "status" | "attachments" | "reminderSentAt" | "teacherId"
> & { teacherId?: number };

export interface Submission {
  id?: number;
  assignmentId: number;
  studentId: number;
  attachments: Attachment[];
  fileUrl?: string;
  answerText?: string;
  comments?: string;
  submittedAt?: string;
  status: SubmissionStatus;
  marks?: number;
  percentage?: number;
  feedback?: string;
  reviewedBy?: number;
  reviewedAt?: string;
}

export interface StudentAssignment {
  assignment: Assignment;
  submission?: Submission;
}

export interface RosterRow {
  studentId: number;
  studentName: string;
  admissionNumber: string;
  rollNumber: string;
  submission?: Submission;
}

export interface ChildAssignments {
  studentId: number;
  studentName: string;
  assignments: StudentAssignment[];
}

export interface AssignmentDashboard {
  totalAssignments: number;
  activeAssignments: number;
  dueToday: number;
  overdueAssignments: number;
  pendingSubmissions: number;
  submittedAssignments: number;
  reviewedAssignments: number;
  averageSubmissionPercentage: number;
  submissionStatus: Record<string, number>;
  subjectWiseAssignments: Record<string, number>;
  classWiseAssignments: Record<string, number>;
  monthlyTrend: Record<string, number>;
}

export interface ReportRow {
  assignmentId: number;
  assignmentTitle: string;
  teacherId: number;
  subjectId: number;
  studentId: number;
  studentName: string;
  status: SubmissionStatus;
  submittedAt?: string;
  marks?: number;
  percentage?: number;
}

export interface Option {
  id: number;
  name: string;
  classId?: number;
}

export interface AssignmentLookups {
  sessions: Option[];
  classes: Option[];
  sections: Option[];
  subjects: Option[];
  teachers: Option[];
  teacherScopes: TeacherAssignmentScope[];
}

export interface TeacherAssignmentScope {
  classId: number;
  className: string;
  sectionId: number;
  sectionName: string;
  subjectId: number;
  subjectName: string;
}

export interface AssignmentFilters {
  sessionId?: number;
  classId?: number;
  sectionId?: number;
  subjectId?: number;
  teacherId?: number;
  status?: AssignmentStatus;
  search?: string;
  page?: number;
  size?: number;
  sort?: string;
}

export interface Page<T> {
  content: T[];
  number: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface Review {
  marks?: number;
  feedback: string;
  status: "REVIEWED" | "RETURNED" | "GRADED";
}

export interface ReportFilters {
  type?: string;
  sessionId?: number;
  studentId?: number;
  teacherId?: number;
  subjectId?: number;
}
