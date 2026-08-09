import type { ExamResult } from "../../examinations/types";

export interface Option {
  id: number;
  name: string;
  classId?: number;
  academicSessionId?: number;
  examTypeId?: number;
  published?: boolean;
  startsOn?: string;
  endsOn?: string;
  active?: boolean;
}

export interface Examination {
  id: number;
  academicSessionId: number;
  examTypeId?: number;
  name: string;
  startsOn: string;
  endsOn: string;
  resultPublishDate?: string;
  description: string;
  status: string;
  published: boolean;
  includeInCgpa: boolean;
}

export interface SubjectAcademicConfigRow {
  academicSessionId: number;
  classId: number;
  subjectId: number;
  subjectCode: string;
  subjectName: string;
  creditHours?: number | null;
  includeInGpa: boolean;
  includeInCgpa: boolean;
  configured: boolean;
  usingLegacyCreditHours: boolean;
}

export interface ExamType {
  id: number;
  name: string;
  description: string;
  weightage: number;
  active: boolean;
}

export type ExamTypePayload = Omit<ExamType, "id">;

export interface RoutineItem {
  id: number;
  examId: number;
  classId: number;
  sectionId: number;
  subjectId: number;
  examDate: string;
  startTime: string;
  endTime: string;
  room: string;
  invigilatorId?: number;
  fullMarks: number;
  passMarks: number;
}

export interface GradeRuleItem {
  id?: number;
  grade: string;
  minPercentage: number;
  maxPercentage: number;
  gpa: number;
  passing: boolean;
  remarks: string;
}

export interface GradingSystem {
  id: number;
  academicSessionId: number;
  name: string;
  active: boolean;
  rules: GradeRuleItem[];
}

export interface MarkRow {
  studentId: number;
  admissionNumber: string;
  rollNumber: string;
  studentName: string;
  obtainedMarks?: number;
  absent: boolean;
  grade: string;
  gpa?: number;
  status: string;
}

export interface ReportRow {
  subjectId: number;
  subjectName: string;
  classId: number;
  sectionId: number;
  grade: string;
  total: number;
  passed: number;
  failed: number;
  passPercentage: number;
  average: number;
  highest: number;
  lowest: number;
}

export type MeritRow = ExamResult;

export interface PublicationScope {
  examId: number;
  classId: number;
  className: string;
  sectionId: number;
  sectionName: string;
  routineCount: number;
  studentCount: number;
  missingMarksCount: number;
  complete: boolean;
  published: boolean;
  publishedAt: string | null;
}

export interface ExamDashboard {
  metrics: Array<{ name: string; value: number }>;
  resultDistribution: Array<{ name: string; value: number }>;
  gradeDistribution: Array<{ name: string; value: number }>;
  gpaDistribution: Array<{ name: string; value: number }>;
  subjectPerformance: Array<{ name: string; value: number }>;
  passVsFail: Array<{ name: string; value: number }>;
  examAverages: Array<{ name: string; value: number }>;
  examWiseComparison: Array<{ name: string; value: number }>;
}

export interface ExaminationLookups {
  sessions: Option[];
  classes: Option[];
  sections: Option[];
  subjects: Option[];
  teachers: Option[];
  exams: Option[];
  examTypes: Option[];
}
