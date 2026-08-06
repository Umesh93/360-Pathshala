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
  admissionNumber: string;
  rollNumber: string;
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
  subjectName: string;
  fullMarks: number;
  passMarks: number;
  obtainedMarks?: number;
  absent: boolean;
  grade: string;
  gpa?: number;
  status: string;
  remarks: string;
}

export interface ExamResult {
  examId: number;
  examName: string;
  studentId: number;
  studentName: string;
  schoolName: string;
  studentPhoto?: string;
  admissionNumber: string;
  rollNumber: string;
  className: string;
  sectionName: string;
  total: number;
  fullMarks: number;
  percentage: number;
  gpa?: number;
  grade: string;
  status: string;
  remarks: string;
  classRank?: number;
  sectionRank?: number;
  schoolRank?: number;
  published: boolean;
  subjects: SubjectResult[];
}

export interface ChildResults {
  studentId: number;
  studentName: string;
  admissionNumber: string;
  className: string;
  sectionName: string;
  results: ExamResult[];
}
