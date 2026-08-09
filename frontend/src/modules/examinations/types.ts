export interface TeacherExamAssignment {
  examSubjectId: number;
  examId: number;
  examName: string;
  examDate: string;
  className: string;
  sectionName: string;
  subjectName: string;
  fullMarks: number;
  passMarks: number;
  published: boolean;
}

export interface MarkEntryRow {
  id?: number;
  studentId: number;
  admissionNumber: string | null;
  rollNumber: string | null;
  studentName: string;
  obtainedMarks?: number;
  absent: boolean;
  grade: string;
  gpa?: number;
  status: string;
}

export interface SubjectResult {
  examSubjectId: number;
  subjectId: number;
  subjectCode: string | null;
  subjectName: string;
  fullMarks: number;
  passMarks: number;
  obtainedMarks?: number | null;
  percentage?: number | null;
  absent: boolean;
  grade: string | null;
  gradePoint?: number | null;
  gpa?: number | null;
  creditHours?: number | null;
  qualityPoints?: number | null;
  status: string | null;
  remarks: string | null;
}

export interface ExamResult {
  examId: number;
  examName: string;
  studentId: number;
  studentName: string;
  schoolName: string;
  schoolAddress: string | null;
  schoolPhone: string | null;
  schoolEmail: string | null;
  schoolLogoUrl?: string | null;
  studentPhoto?: string | null;
  admissionNumber: string | null;
  rollNumber: string | null;
  academicSessionId: number;
  academicSessionName: string;
  examStartsOn: string | null;
  examEndsOn: string | null;
  resultPublishDate: string | null;
  classId: number;
  className: string;
  sectionId: number;
  sectionName: string;
  total?: number | null;
  fullMarks?: number | null;
  percentage?: number | null;
  totalCreditHours?: number | null;
  gpa?: number | null;
  cgpa?: number | null;
  cgpaPeriods?: number | null;
  grade: string | null;
  status: string | null;
  remarks: string | null;
  classRank?: number | null;
  sectionRank?: number | null;
  schoolRank?: number | null;
  published: boolean;
  subjects: SubjectResult[];
}

export interface ChildResults {
  studentId: number;
  studentName: string;
  admissionNumber: string | null;
  className: string;
  sectionName: string;
  results: ExamResult[];
}
