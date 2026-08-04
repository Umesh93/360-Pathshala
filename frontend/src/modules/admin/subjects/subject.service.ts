import api from "../../../services/api";
import type { Page, Subject, SubjectFilters, SubjectRequest, TeacherAssignment } from "./subject.types";

export const getSubjects = async (filters: SubjectFilters = {}) => (await api.get<Page<Subject>>("/academic/subjects", { params: filters })).data;
export const getSubject = async (id: number) => (await api.get<Subject>(`/academic/subjects/${id}`)).data;
export const createSubject = async (payload: SubjectRequest) => (await api.post<Subject>("/academic/subjects", payload)).data;
export const updateSubject = async (id: number, payload: SubjectRequest) => (await api.put<Subject>(`/academic/subjects/${id}`, payload)).data;
export const deleteSubject = async (id: number) => api.delete(`/academic/subjects/${id}`);
export const restoreSubject = async (id: number) => (await api.put<Subject>(`/academic/subjects/${id}/restore`)).data;
export const getSubjectTeachers = async (id: number) => (await api.get<TeacherAssignment[]>(`/academic/subjects/${id}/teachers`)).data;
export const assignSubjectTeacher = async (id: number, payload: { teacherId: number; sectionId: number }) => (await api.post<TeacherAssignment>(`/academic/subjects/${id}/teachers`, payload)).data;
export const unassignSubjectTeacher = async (id: number, teacherId: number) => api.delete(`/academic/subjects/${id}/teachers/${teacherId}`);
export const exportSubjectsCsv = async (filters: SubjectFilters = {}) => {
  const page = await getSubjects({ ...filters, page: 0, size: 1000 });
  const rows = [["Subject Code", "Subject Name", "Class", "Teacher Count", "Full Marks", "Pass Marks", "Credit Hours", "Status"], ...page.content.map((item) => [item.subjectCode, item.subjectName, item.className, item.assignedTeacherCount, item.fullMarks, item.passMarks, item.creditHours, item.status])];
  return new Blob([rows.map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(",")).join("\n")], { type: "text/csv" });
};
