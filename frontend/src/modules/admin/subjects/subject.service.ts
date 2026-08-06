import api from "../../../services/api";
import type {
  Page,
  Subject,
  SubjectFilters,
  SubjectOption,
  SubjectRequest,
  TeacherAssignment,
  TeacherOption,
  TeacherSubjectBulkRequest,
  TeacherSubjectRow,
} from "./subject.types";

type Json = Record<string, unknown>;

const object = (value: unknown): Json =>
  value && typeof value === "object" ? (value as Json) : {};
const array = (value: unknown): unknown[] => {
  if (Array.isArray(value)) return value;
  const data = object(value);
  const nested = data.content ?? data.items ?? data.data;
  return Array.isArray(nested) ? nested : [];
};
const number = (value: unknown) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};
const text = (value: unknown, fallback = "") =>
  typeof value === "string" ? value : value == null ? fallback : String(value);

const mapOption = (value: unknown, includeClass = false): SubjectOption => {
  const item = object(value);
  return {
    id: number(item.id),
    name: text(
      item.name ?? item.title ?? item.academicYear ?? item.code,
      `#${item.id}`,
    ),
    ...(includeClass ? { classId: number(item.classId) } : {}),
    ...(typeof item.isCurrent === "boolean"
      ? { isCurrent: item.isCurrent }
      : {}),
  };
};

const mapTeacher = (value: unknown): TeacherOption => {
  const item = object(value);
  const composedName = [item.firstName, item.middleName, item.lastName]
    .map((part) => text(part).trim())
    .filter(Boolean)
    .join(" ");
  const providedName = text(item.fullName ?? item.name).trim();
  return {
    id: number(item.id),
    name: providedName || composedName || `Teacher #${item.id}`,
  };
};

const mapTeacherSubject = (value: unknown): TeacherSubjectRow => {
  const item = object(value);
  const teacherId = number(item.teacherId);
  return {
    subjectId: number(item.subjectId),
    subjectCode: text(item.subjectCode),
    subjectName: text(item.subjectName),
    teacherId: teacherId || null,
    teacherName: text(item.teacherName) || undefined,
  };
};

const uniqueById = <T extends { id: number }>(items: T[]) =>
  Array.from(
    new Map(
      items.filter((item) => item.id > 0).map((item) => [item.id, item]),
    ).values(),
  );

const uniqueTeacherSubjects = (value: unknown) =>
  Array.from(
    new Map(
      array(value)
        .map(mapTeacherSubject)
        .filter((item) => item.subjectId > 0)
        .map((item) => [item.subjectId, item]),
    ).values(),
  );

export const getSubjects = async (filters: SubjectFilters = {}) =>
  (await api.get<Page<Subject>>("/academic/subjects", { params: filters }))
    .data;
export const getSubject = async (id: number) =>
  (await api.get<Subject>(`/academic/subjects/${id}`)).data;
export const createSubject = async (payload: SubjectRequest) =>
  (await api.post<Subject>("/academic/subjects", payload)).data;
export const updateSubject = async (id: number, payload: SubjectRequest) =>
  (await api.put<Subject>(`/academic/subjects/${id}`, payload)).data;
export const deleteSubject = async (id: number) =>
  api.delete(`/academic/subjects/${id}`);
export const restoreSubject = async (id: number) =>
  (await api.put<Subject>(`/academic/subjects/${id}/restore`)).data;
export const getSubjectTeachers = async (id: number) =>
  (await api.get<TeacherAssignment[]>(`/academic/subjects/${id}/teachers`))
    .data;
export const assignSubjectTeacher = async (
  id: number,
  payload: { teacherId: number; sectionId: number },
) =>
  (
    await api.post<TeacherAssignment>(
      `/academic/subjects/${id}/teachers`,
      payload,
    )
  ).data;
export const unassignSubjectTeacher = async (id: number, teacherId: number) =>
  api.delete(`/academic/subjects/${id}/teachers/${teacherId}`);

export const getSubjectWorkspaceLookups = async () => {
  const [sessionsResponse, classesResponse] = await Promise.all([
    api.get("/academic/years", { params: { page: 0, size: 200 } }),
    api.get("/academic/classes", { params: { page: 0, size: 200 } }),
  ]);
  return {
    sessions: uniqueById(
      array(sessionsResponse.data).map((item) => mapOption(item)),
    ),
    classes: uniqueById(
      array(classesResponse.data).map((item) => mapOption(item)),
    ),
  };
};

export const getSubjectSections = async (classId: number) => {
  const response = await api.get("/academic/sections", {
    params: { classId, page: 0, size: 200 },
  });
  return uniqueById(array(response.data).map((item) => mapOption(item, true)));
};

export const getTeacherSubjectAssignments = async (params: {
  academicSessionId: number;
  classId: number;
  sectionId: number;
}) => {
  const response = await api.get("/academic/teacher-subjects", { params });
  return uniqueTeacherSubjects(response.data);
};

export const getActiveTeacherOptions = async () => {
  const response = await api.get("/people/teachers", {
    params: { status: "ACTIVE", page: 0, size: 200 },
  });
  return uniqueById(array(response.data).map(mapTeacher));
};

export const saveTeacherSubjectAssignments = async (
  payload: TeacherSubjectBulkRequest,
) => {
  const response = await api.put("/academic/teacher-subjects/bulk", payload);
  return uniqueTeacherSubjects(response.data);
};
export const exportSubjectsCsv = async (filters: SubjectFilters = {}) => {
  const page = await getSubjects({ ...filters, page: 0, size: 1000 });
  const rows = [
    [
      "Subject Code",
      "Subject Name",
      "Class",
      "Teacher Count",
      "Full Marks",
      "Pass Marks",
      "Credit Hours",
      "Status",
    ],
    ...page.content.map((item) => [
      item.subjectCode,
      item.subjectName,
      item.className,
      item.assignedTeacherCount,
      item.fullMarks,
      item.passMarks,
      item.creditHours,
      item.status,
    ]),
  ];
  return new Blob(
    [
      rows
        .map((row) =>
          row
            .map((value) => `"${String(value).replaceAll('"', '""')}"`)
            .join(","),
        )
        .join("\n"),
    ],
    { type: "text/csv" },
  );
};
