import api from "../../../services/api";

export interface AcademicClass { id: number; name: string; code: string; }
export interface AcademicSection { id: number; classId: number; name: string; capacity: number; }
export interface AcademicSubject { id: number; classId: number; name: string; code: string; }
export interface AcademicPage<T> { content: T[]; totalElements: number; totalPages: number; number: number; }

export const getAcademicClasses = async (page = 0, size = 10, search = "") =>
  (await api.get<AcademicPage<AcademicClass>>("/academic/classes", { params: { page, size, search: search || undefined } })).data;
export const createAcademicClass = async (payload: { name: string; code: string }) => (await api.post<AcademicClass>("/academic/classes", payload)).data;
export const getAcademicClass = async (id: number) => (await api.get<AcademicClass>(`/academic/classes/${id}`)).data;
export const updateAcademicClass = async (id: number, payload: { name: string; code: string }) => (await api.put<AcademicClass>(`/academic/classes/${id}`, payload)).data;
export const deleteAcademicClass = async (id: number) => api.delete(`/academic/classes/${id}`);

export const getAcademicSections = async (classId?: number, page = 0, size = 100) =>
  (await api.get<AcademicPage<AcademicSection>>("/academic/sections", { params: { classId, page, size } })).data;
export const createAcademicSection = async (payload: { classId: number; name: string; capacity: number }) => (await api.post<AcademicSection>("/academic/sections", payload)).data;
export const getAcademicSection = async (id: number) => (await api.get<AcademicSection>(`/academic/sections/${id}`)).data;
export const updateAcademicSection = async (id: number, payload: { classId: number; name: string; capacity: number }) => (await api.put<AcademicSection>(`/academic/sections/${id}`, payload)).data;
export const deleteAcademicSection = async (id: number) => api.delete(`/academic/sections/${id}`);

export const getAcademicSubjects = async (classId?: number, page = 0, size = 100) =>
  (await api.get<AcademicPage<AcademicSubject>>("/academic/subjects", { params: { classId, page, size } })).data;
export const createAcademicSubject = async (payload: { classId: number; name: string; code: string }) => (await api.post<AcademicSubject>("/academic/subjects", payload)).data;
export const updateAcademicSubject = async (id: number, payload: { classId: number; name: string; code: string }) => (await api.put<AcademicSubject>(`/academic/subjects/${id}`, payload)).data;
export const deleteAcademicSubject = async (id: number) => api.delete(`/academic/subjects/${id}`);
