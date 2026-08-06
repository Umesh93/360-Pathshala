import api from "../../services/api";
import type {
  Assignment,
  AssignmentDashboard,
  AssignmentFilters,
  AssignmentLookups,
  AssignmentPayload,
  Attachment,
  ChildAssignments,
  Option,
  Page,
  ReportFilters,
  ReportRow,
  Review,
  RosterRow,
  StudentAssignment,
  Submission,
  TeacherAssignmentScope,
} from "./types";

type Json = Record<string, unknown>;
const object = (value: unknown): Json =>
  value && typeof value === "object" ? (value as Json) : {};
const array = (value: unknown): unknown[] =>
  Array.isArray(value) ? value : [];
const text = (value: unknown, fallback = "") =>
  value == null ? fallback : String(value);
const number = (value: unknown, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};
const optionalNumber = (value: unknown) =>
  value == null || value === "" ? undefined : number(value);
const optionalText = (value: unknown) =>
  value == null || value === "" ? undefined : text(value);
const list = (value: unknown) => {
  const item = object(value);
  return array(item.content ?? item.items ?? item.data ?? value);
};

export const ASSIGNMENT_FILE_ACCEPT = ".pdf,.doc,.docx,.jpg,.jpeg,.png,.zip";
const supportedAssignmentExtensions = new Set([
  "pdf",
  "doc",
  "docx",
  "jpg",
  "jpeg",
  "png",
  "zip",
]);

export const unsupportedAssignmentFiles = (files: File[]) =>
  files.filter((file) => {
    const extension = file.name.split(".").pop()?.toLowerCase();
    return !extension || !supportedAssignmentExtensions.has(extension);
  });

const requireSupportedAssignmentFiles = (files: File[]) => {
  const unsupported = unsupportedAssignmentFiles(files);
  if (unsupported.length)
    throw new Error(
      `Unsupported file type: ${unsupported.map((file) => file.name).join(", ")}. Allowed: PDF, DOC, DOCX, JPG, JPEG, PNG, ZIP.`,
    );
};

export function assignmentError(error: unknown) {
  const request = object(error);
  const data = object(object(request.response).data);
  const fieldErrors = object(data.errors);
  const details = Object.values(fieldErrors)
    .map(String)
    .filter(Boolean)
    .join(" ");
  return text(
    data.message ?? details ?? request.message,
    "Assignment request failed. Please try again.",
  );
}

const mapAttachment = (value: unknown): Attachment => {
  const item = object(value);
  return {
    key: text(item.key),
    originalName: text(item.originalName, "Attachment"),
    contentType: text(item.contentType, "application/octet-stream"),
    size: number(item.size),
  };
};

export const mapAssignment = (value: unknown): Assignment => {
  const item = object(value);
  return {
    id: number(item.id),
    academicSessionId: number(item.academicSessionId),
    teacherId: optionalNumber(item.teacherId),
    classId: number(item.classId),
    sectionIds: array(item.sectionIds)
      .map((id) => number(id))
      .filter(Boolean),
    subjectId: number(item.subjectId),
    title: text(item.title),
    category: text(
      item.category,
      "HOMEWORK",
    ).toUpperCase() as Assignment["category"],
    description: text(item.description),
    instructions: text(item.instructions),
    publishAt: optionalText(item.publishAt),
    dueAt: text(item.dueAt),
    maximumMarks: optionalNumber(item.maximumMarks),
    allowLateSubmission: Boolean(item.allowLateSubmission),
    lateSubmissionDeadline: optionalText(item.lateSubmissionDeadline),
    status: text(item.status, "DRAFT").toUpperCase() as Assignment["status"],
    attachments: array(item.attachments).map(mapAttachment),
    reminderSentAt: optionalText(item.reminderSentAt),
  };
};

export const mapSubmission = (value: unknown): Submission => {
  const item = object(value);
  return {
    id: optionalNumber(item.id),
    assignmentId: number(item.assignmentId),
    studentId: number(item.studentId),
    attachments: array(item.attachments).map(mapAttachment),
    fileUrl: optionalText(item.fileUrl),
    answerText: optionalText(item.answerText),
    comments: optionalText(item.comments),
    submittedAt: optionalText(item.submittedAt),
    status: text(item.status, "PENDING").toUpperCase() as Submission["status"],
    marks: optionalNumber(item.marks),
    percentage: optionalNumber(item.percentage),
    feedback: optionalText(item.feedback),
    reviewedBy: optionalNumber(item.reviewedBy),
    reviewedAt: optionalText(item.reviewedAt),
  };
};

const mapStudentAssignment = (value: unknown): StudentAssignment => {
  const item = object(value);
  return {
    assignment: mapAssignment(item.assignment),
    submission: item.submission ? mapSubmission(item.submission) : undefined,
  };
};

export async function getDashboard(): Promise<AssignmentDashboard> {
  const item = object((await api.get("/assignments/dashboard")).data);
  const mapValues = (value: unknown) =>
    Object.fromEntries(
      Object.entries(object(value)).map(([key, entry]) => [key, number(entry)]),
    );
  return {
    totalAssignments: number(item.totalAssignments),
    activeAssignments: number(item.activeAssignments),
    dueToday: number(item.dueToday),
    overdueAssignments: number(item.overdueAssignments),
    pendingSubmissions: number(item.pendingSubmissions),
    submittedAssignments: number(item.submittedAssignments),
    reviewedAssignments: number(item.reviewedAssignments),
    averageSubmissionPercentage: number(item.averageSubmissionPercentage),
    submissionStatus: mapValues(item.submissionStatus),
    subjectWiseAssignments: mapValues(item.subjectWiseAssignments),
    classWiseAssignments: mapValues(item.classWiseAssignments),
    monthlyTrend: mapValues(item.monthlyTrend),
  };
}

export async function getAssignments(
  filters: AssignmentFilters = {},
): Promise<Page<Assignment>> {
  const data = (await api.get("/assignments", { params: filters })).data;
  const page = object(data);
  const content = list(data).map(mapAssignment);
  const size = number(page.size, filters.size ?? Math.max(content.length, 1));
  const totalElements = number(page.totalElements, content.length);
  return {
    content,
    number: number(page.number, filters.page ?? 0),
    size,
    totalElements,
    totalPages: number(
      page.totalPages,
      Math.ceil(totalElements / Math.max(size, 1)),
    ),
  };
}

export const getAssignment = async (id: number) =>
  mapAssignment((await api.get(`/assignments/${id}`)).data);

const payloadBody = (payload: AssignmentPayload) => ({
  ...payload,
  publishAt: payload.publishAt || null,
  maximumMarks: payload.maximumMarks ?? null,
  lateSubmissionDeadline: payload.allowLateSubmission
    ? payload.lateSubmissionDeadline || null
    : null,
});

export const saveAssignment = async (payload: AssignmentPayload, id?: number) =>
  mapAssignment(
    (
      await (id
        ? api.put(`/assignments/${id}`, payloadBody(payload))
        : api.post("/assignments", payloadBody(payload)))
    ).data,
  );
export const deleteAssignment = (id: number) =>
  api.delete(`/assignments/${id}`);
export const publishAssignment = async (id: number) =>
  mapAssignment((await api.post(`/assignments/${id}/publish`)).data);
export const reopenAssignment = async (id: number, dueAt: string) =>
  mapAssignment(
    (
      await api.put(`/assignments/${id}/reopen`, undefined, {
        params: { dueAt },
      })
    ).data,
  );
export const getTeacherAssignments = async () =>
  list((await api.get("/assignments/teachers/self")).data).map(mapAssignment);

export const getRoster = async (assignmentId: number): Promise<RosterRow[]> =>
  list((await api.get(`/assignments/${assignmentId}/submissions`)).data).map(
    (value) => {
      const item = object(value);
      return {
        studentId: number(item.studentId),
        studentName: text(item.studentName),
        admissionNumber: text(item.admissionNumber),
        rollNumber: text(item.rollNumber),
        submission: item.submission
          ? mapSubmission(item.submission)
          : undefined,
      };
    },
  );
export const reviewSubmission = async (
  assignmentId: number,
  submissionId: number,
  review: Review,
) =>
  mapSubmission(
    (
      await api.put(
        `/assignments/${assignmentId}/submissions/${submissionId}/review`,
        review,
      )
    ).data,
  );
export const reviewSubmissions = async (
  assignmentId: number,
  reviews: Array<{ submissionId: number; review: Review }>,
) =>
  list(
    (
      await api.put(`/assignments/${assignmentId}/submissions/review`, {
        reviews,
      })
    ).data,
  ).map(mapSubmission);

export const getStudentAssignments = async () =>
  list((await api.get("/assignments/students/self")).data).map(
    mapStudentAssignment,
  );
export const getStudentAssignment = async (id: number) =>
  mapStudentAssignment(
    (await api.get(`/assignments/${id}/students/self`)).data,
  );
export const submitAnswer = async (
  id: number,
  answerText: string,
  comments: string,
) =>
  mapSubmission(
    (
      await api.put(`/assignments/${id}/students/self/submission`, {
        answerText,
        comments,
      })
    ).data,
  );
export async function submitFiles(
  id: number,
  answerText: string,
  comments: string,
  files: File[],
) {
  requireSupportedAssignmentFiles(files);
  const form = new FormData();
  form.append(
    "request",
    new Blob([JSON.stringify({ answerText, comments })], {
      type: "application/json",
    }),
  );
  files.forEach((file) => form.append("files", file));
  return mapSubmission(
    (await api.post(`/assignments/${id}/students/self/submission/files`, form))
      .data,
  );
}

export const getParentAssignments = async (): Promise<ChildAssignments[]> =>
  list((await api.get("/assignments/parents/self/children")).data).map(
    (value) => {
      const item = object(value);
      return {
        studentId: number(item.studentId),
        studentName: text(item.studentName),
        assignments: array(item.assignments).map(mapStudentAssignment),
      };
    },
  );

export const getReports = async (
  filters: ReportFilters = {},
): Promise<ReportRow[]> =>
  list((await api.get("/assignments/reports", { params: filters })).data).map(
    (value) => {
      const item = object(value);
      return {
        assignmentId: number(item.assignmentId),
        assignmentTitle: text(item.assignmentTitle),
        subjectId: number(item.subjectId),
        studentId: number(item.studentId),
        studentName: text(item.studentName),
        status: text(item.status, "PENDING") as ReportRow["status"],
        submittedAt: optionalText(item.submittedAt),
        marks: optionalNumber(item.marks),
        percentage: optionalNumber(item.percentage),
      };
    },
  );

export async function exportReport(
  format: "csv" | "xlsx" | "pdf",
  filters: ReportFilters = {},
) {
  return (
    await api.get(`/assignments/reports/export.${format}`, {
      params: filters,
      responseType: "blob",
    })
  ).data as Blob;
}
export async function uploadAssignmentFiles(id: number, files: File[]) {
  requireSupportedAssignmentFiles(files);
  const form = new FormData();
  files.forEach((file) => form.append("files", file));
  return mapAssignment(
    (await api.post(`/assignments/${id}/attachments`, form)).data,
  );
}

const getBlob = async (url: string, params: Record<string, unknown>) =>
  (await api.get(url, { params, responseType: "blob" })).data as Blob;
export const getAssignmentAttachment = (id: number, key: string) =>
  getBlob(`/assignments/${id}/attachments/download`, { key });
export const getSubmissionAttachment = (
  assignmentId: number,
  submissionId: number,
  key: string,
) =>
  getBlob(
    `/assignments/${assignmentId}/submissions/${submissionId}/attachments/download`,
    { key },
  );
export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
export async function previewBlob(blob: Blob) {
  const url = URL.createObjectURL(blob);
  window.open(url, "_blank", "noopener,noreferrer");
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

export async function getLookups(): Promise<AssignmentLookups> {
  const responses = await Promise.allSettled(
    [
      "/academic/years",
      "/academic/classes",
      "/academic/sections",
      "/academic/subjects",
    ].map((url) => api.get(url, { params: { page: 0, size: 500 } })),
  );
  const options = (index: number) =>
    list(
      responses[index].status === "fulfilled"
        ? responses[index].value.data
        : [],
    )
      .map((value) => {
        const item = object(value);
        return {
          id: number(item.id),
          name: text(
            item.name ??
              item.title ??
              item.subjectName ??
              item.fullName ??
              item.code,
            "Unknown",
          ),
          ...(item.classId ? { classId: number(item.classId) } : {}),
        };
      })
      .filter((item) => item.id > 0);
  return {
    sessions: options(0),
    classes: options(1),
    sections: options(2),
    subjects: options(3),
    teacherScopes: [],
  };
}

const mapAcademicOption = (value: unknown): Option => {
  const item = object(value);
  return {
    id: number(item.id),
    name: text(
      item.name ?? item.title ?? item.subjectName ?? item.code,
      "Unknown",
    ),
    ...(item.classId ? { classId: number(item.classId) } : {}),
  };
};

export async function getClassSections(classId: number): Promise<Option[]> {
  const response = await api.get("/academic/sections", {
    params: { classId, page: 0, size: 500 },
  });
  return list(response.data)
    .map(mapAcademicOption)
    .filter((item) => item.id > 0 && item.classId === classId);
}

export async function getClassSubjects(classId: number): Promise<Option[]> {
  const response = await api.get("/academic/subjects", {
    params: { classId, status: "ACTIVE", page: 0, size: 500 },
  });
  return list(response.data)
    .filter((value) => {
      const item = object(value);
      return !item.status || text(item.status).toUpperCase() === "ACTIVE";
    })
    .map(mapAcademicOption)
    .filter((item) => item.id > 0 && item.classId === classId);
}

export async function getTeacherLookups(): Promise<AssignmentLookups> {
  const response = await api.get("/assignments/teachers/self/lookups");
  const teacherScopes: TeacherAssignmentScope[] = list(response.data).map(
    (value) => {
      const item = object(value);
      return {
        academicSessionId: number(item.academicSessionId),
        academicSessionName: text(item.academicSessionName, "Unknown"),
        classId: number(item.classId),
        className: text(item.className),
        sectionId: number(item.sectionId),
        sectionName: text(item.sectionName),
        subjectId: number(item.subjectId),
        subjectName: text(item.subjectName),
      };
    },
  );
  const unique = (items: Option[]) =>
    Array.from(new Map(items.map((item) => [item.id, item])).values());
  return {
    sessions: unique(
      teacherScopes.map((scope) => ({
        id: scope.academicSessionId,
        name: scope.academicSessionName,
      })),
    ),
    classes: unique(
      teacherScopes.map((scope) => ({
        id: scope.classId,
        name: scope.className,
      })),
    ),
    sections: unique(
      teacherScopes.map((scope) => ({
        id: scope.sectionId,
        name: scope.sectionName,
        classId: scope.classId,
      })),
    ),
    subjects: unique(
      teacherScopes.map((scope) => ({
        id: scope.subjectId,
        name: scope.subjectName,
        classId: scope.classId,
      })),
    ),
    teacherScopes,
  };
}
