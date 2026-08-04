export interface Subject {
  id: number; schoolId: number; classId: number; className: string; subjectCode: string; subjectName: string;
  subjectType: "THEORY" | "PRACTICAL" | "THEORY_PRACTICAL"; creditHours: number; fullMarks: number;
  passMarks: number; optional: boolean; status: "ACTIVE" | "INACTIVE"; description: string;
  assignedTeacherCount: number; deleted: boolean; createdAt: string; updatedAt: string; createdBy: number; updatedBy: number;
}
export interface SubjectRequest { classId: number; subjectCode: string; subjectName: string; subjectType: string; creditHours: number; fullMarks: number; passMarks: number; optional: boolean; status: string; description: string; }
export interface Page<T> { content: T[]; totalElements: number; totalPages: number; number: number; size: number; }
export interface SubjectFilters { search?: string; classId?: number; teacherId?: number; subjectType?: string; optional?: boolean; status?: string; deleted?: boolean; page?: number; size?: number; sort?: string; }
export interface TeacherAssignment { id: number; teacherId: number; subjectId: number; classId: number; sectionId: number; }
