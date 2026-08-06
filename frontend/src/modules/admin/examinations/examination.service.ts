import api from "../../../services/api";
import type {
  ExamDashboard,
  ExamType,
  ExamTypePayload,
  Examination,
  ExaminationLookups,
  GradeRuleItem,
  GradingSystem,
  MarkRow,
  MeritRow,
  ReportRow,
  RoutineItem,
} from "./examination.types";

type Json = Record<string, unknown>;
const object = (value: unknown): Json =>
  value && typeof value === "object" ? (value as Json) : {};
const array = (value: unknown): unknown[] =>
  Array.isArray(value) ? value : [];
const text = (value: unknown, fallback = "") =>
  value == null ? fallback : String(value);
const number = (value: unknown, fallback = 0) =>
  Number.isFinite(Number(value)) ? Number(value) : fallback;
const items = (value: unknown) => {
  const data = object(value);
  return array(data.content ?? data.items ?? data.data ?? value);
};
const option = (value: unknown) => {
  const item = object(value);
  return {
    id: number(item.id),
    name: text(item.name ?? item.title ?? item.subjectName ?? item.code),
    ...(item.classId ? { classId: number(item.classId) } : {}),
    ...(item.academicSessionId
      ? { academicSessionId: number(item.academicSessionId) }
      : {}),
    ...(item.examTypeId ? { examTypeId: number(item.examTypeId) } : {}),
    ...(item.published != null ? { published: Boolean(item.published) } : {}),
    ...(item.startsOn ? { startsOn: text(item.startsOn) } : {}),
    ...(item.endsOn ? { endsOn: text(item.endsOn) } : {}),
    ...(item.active != null ? { active: Boolean(item.active) } : {}),
  };
};

export const errorMessage = (error: unknown) => {
  const value = object(error);
  const response = object(value.response);
  const data = object(response.data);
  return text(
    data.message ?? value.message,
    "Request failed. Please try again.",
  );
};

const mapExam = (value: unknown): Examination => {
  const item = object(value);
  return {
    id: number(item.id),
    academicSessionId: number(item.academicSessionId),
    examTypeId: number(item.examTypeId) || undefined,
    name: text(item.name),
    startsOn: text(item.startsOn),
    endsOn: text(item.endsOn),
    resultPublishDate:
      text(item.resultPublishDate ?? item.publishDate) || undefined,
    description: text(item.description),
    status: text(item.status, "UPCOMING").toUpperCase(),
    published: Boolean(item.published),
  };
};

const mapExamType = (value: unknown): ExamType => {
  const item = object(value);
  return {
    id: number(item.id),
    name: text(item.name),
    description: text(item.description),
    weightage: number(item.weightage),
    active: item.active == null ? true : Boolean(item.active),
  };
};

const mapRoutine = (value: unknown): RoutineItem => {
  const item = object(value);
  return {
    id: number(item.id),
    examId: number(item.examId),
    classId: number(item.classId),
    sectionId: number(item.sectionId),
    subjectId: number(item.subjectId),
    examDate: text(item.examDate),
    startTime: text(item.startTime),
    endTime: text(item.endTime),
    room: text(item.room),
    invigilatorId: number(item.invigilatorId) || undefined,
    fullMarks: number(item.fullMarks),
    passMarks: number(item.passMarks),
  };
};

const mapRule = (value: unknown): GradeRuleItem => {
  const item = object(value);
  return {
    id: number(item.id) || undefined,
    grade: text(item.grade),
    minPercentage: number(item.minPercentage),
    maxPercentage: number(item.maxPercentage),
    gpa: number(item.gpa),
    passing: Boolean(item.passing),
    remarks: text(item.remarks),
  };
};

const mapSystem = (value: unknown): GradingSystem => {
  const item = object(value);
  return {
    id: number(item.id),
    academicSessionId: number(item.academicSessionId),
    name: text(item.name),
    active: Boolean(item.active),
    rules: [],
  };
};

const mapMark = (value: unknown): MarkRow => {
  const item = object(value);
  return {
    studentId: number(item.studentId),
    admissionNumber: text(item.admissionNumber),
    rollNumber: text(item.rollNumber),
    studentName: text(item.studentName),
    obtainedMarks:
      item.obtainedMarks == null ? undefined : number(item.obtainedMarks),
    absent: Boolean(item.absent),
    grade: text(item.grade),
    gpa: item.gpa == null ? undefined : number(item.gpa),
    status: text(item.status),
  };
};

const mapReport = (value: unknown): ReportRow => {
  const item = object(value);
  return {
    subjectId: number(item.subjectId),
    subjectName: text(item.subjectName),
    classId: number(item.classId),
    sectionId: number(item.sectionId),
    grade: text(item.grade),
    total: number(item.total),
    passed: number(item.passed),
    failed: number(item.failed),
    passPercentage: number(item.passPercentage),
    average: number(item.average),
    highest: number(item.highest),
    lowest: number(item.lowest),
  };
};

export async function getDashboard(sessionId: number): Promise<ExamDashboard> {
  const value = object(
    (await api.get("/examinations/dashboard", { params: { sessionId } })).data,
  );
  const metrics = object(value.metrics);
  const charts = object(value.charts);
  const chartRows = (source: unknown) =>
    Object.entries(object(source)).map(([name, entry]) => ({
      name,
      value: number(entry),
    }));
  return {
    metrics: Object.entries(metrics).map(([name, value]) => ({
      name,
      value: number(value),
    })),
    resultDistribution: chartRows(charts.resultDistribution),
    gradeDistribution: chartRows(charts.gradeDistribution),
    gpaDistribution: chartRows(charts.gpaDistribution),
    subjectPerformance: chartRows(charts.subjectPerformance),
    passVsFail: chartRows(charts.passVsFail),
    examAverages: chartRows(charts.examAverages),
    examWiseComparison: chartRows(charts.examWiseComparison),
  };
}

export async function getExaminations(params: Record<string, unknown> = {}) {
  return items((await api.get("/examinations", { params })).data).map(mapExam);
}

export async function saveExamination(
  payload: Partial<Examination>,
): Promise<Examination> {
  const body = {
    academicSessionId: payload.academicSessionId,
    examTypeId: payload.examTypeId,
    name: payload.name,
    startsOn: payload.startsOn,
    endsOn: payload.endsOn,
    resultPublishDate: payload.resultPublishDate || null,
    description: payload.description,
    status: payload.status,
  };
  return mapExam(
    (
      await (payload.id
        ? api.put(`/examinations/${payload.id}`, body)
        : api.post("/examinations", body))
    ).data,
  );
}

export const getExamTypes = async (): Promise<ExamType[]> =>
  items(
    (
      await api.get("/examinations/types", {
        params: { includeInactive: true },
      })
    ).data,
  ).map(mapExamType);

export async function saveExamType(
  payload: ExamTypePayload & { id?: number },
): Promise<ExamType> {
  const body: ExamTypePayload = {
    name: payload.name,
    description: payload.description,
    weightage: payload.weightage,
    active: payload.active,
  };
  return mapExamType(
    (
      await (payload.id
        ? api.put(`/examinations/types/${payload.id}`, body)
        : api.post("/examinations/types", body))
    ).data,
  );
}

export const updateExamTypeStatus = (id: number, active: boolean) =>
  api.patch(`/examinations/types/${id}/status`, undefined, {
    params: { active },
  });

export const getExamClasses = async (examId: number) =>
  items((await api.get(`/examinations/${examId}/classes`)).data).map(option);
export const saveExamClasses = async (examId: number, classIds: number[]) =>
  api.put(`/examinations/${examId}/classes`, { classIds });

export const updateExamStatus = (id: number, value: string) =>
  api.patch(`/examinations/${id}/status`, undefined, { params: { value } });
export const deleteExamination = (id: number) =>
  api.delete(`/examinations/${id}`);

export const getRoutine = async (examId: number) =>
  items((await api.get(`/examinations/${examId}/routine`)).data).map(
    mapRoutine,
  );
export const saveRoutine = async (payload: Partial<RoutineItem>) => {
  const body = {
    examId: payload.examId,
    classId: payload.classId,
    sectionId: payload.sectionId,
    subjectId: payload.subjectId,
    examDate: payload.examDate,
    startTime: payload.startTime,
    endTime: payload.endTime,
    room: payload.room,
    invigilatorId: payload.invigilatorId,
    fullMarks: payload.fullMarks,
    passMarks: payload.passMarks,
  };
  return (
    await (payload.id
      ? api.put(`/examinations/routine/${payload.id}`, body)
      : api.post("/examinations/routine", body))
  ).data;
};
export const deleteRoutine = (id: number) =>
  api.delete(`/examinations/routine/${id}`);
export const exportRoutinePdf = (examId: number) =>
  api
    .get(`/examinations/${examId}/routine/export.pdf`, { responseType: "blob" })
    .then((response) => response.data as Blob);

export const getGrading = async (sessionId: number) => {
  const systems = items(
    (await api.get("/examinations/grading-systems", { params: { sessionId } }))
      .data,
  ).map(mapSystem);
  return Promise.all(
    systems.map(async (system) => ({
      ...system,
      rules: items(
        (await api.get(`/examinations/grading-systems/${system.id}/rules`))
          .data,
      ).map(mapRule),
    })),
  );
};

export async function saveGrading(payload: GradingSystem) {
  const system = object(
    (
      await (payload.id
        ? api.put(`/examinations/grading-systems/${payload.id}`, {
            academicSessionId: payload.academicSessionId,
            name: payload.name,
          })
        : api.post("/examinations/grading-systems", {
            academicSessionId: payload.academicSessionId,
            name: payload.name,
          }))
    ).data,
  );
  const systemId = number(system.id, payload.id);
  const retainedRuleIds = new Set(
    payload.rules
      .map((rule) => rule.id)
      .filter((id): id is number => Boolean(id)),
  );
  if (payload.id) {
    const existing = items(
      (await api.get(`/examinations/grading-systems/${systemId}/rules`)).data,
    ).map(mapRule);
    await Promise.all(
      existing
        .filter((rule) => rule.id && !retainedRuleIds.has(rule.id))
        .map((rule) =>
          api.delete(
            `/examinations/grading-systems/${systemId}/rules/${rule.id}`,
          ),
        ),
    );
  }
  for (const rule of payload.rules) {
    const body = {
      minPercentage: rule.minPercentage,
      maxPercentage: rule.maxPercentage,
      grade: rule.grade,
      gpa: rule.gpa,
      passing: rule.passing,
      remarks: rule.remarks,
    };
    if (rule.id) {
      await api.put(
        `/examinations/grading-systems/${systemId}/rules/${rule.id}`,
        body,
      );
    } else {
      await api.post(`/examinations/grading-systems/${systemId}/rules`, body);
    }
  }
}

export const deleteGrading = (id: number) =>
  api.delete(`/examinations/grading-systems/${id}`);
export const activateGrading = (id: number) =>
  api.post(`/examinations/grading-systems/${id}/activate`);
export const deactivateGrading = (id: number) =>
  api.post(`/examinations/grading-systems/${id}/deactivate`);

export const getMarks = async (
  examId: number,
  params: {
    classId: number;
    sectionId: number;
    subjectId: number;
    teacherId?: number;
  },
) =>
  items(
    (await api.get(`/examinations/${examId}/marks/roster`, { params })).data,
  ).map(mapMark);
export const saveMarks = (
  examSubjectId: number,
  marks: Array<{
    studentId: number;
    obtainedMarks?: number;
    absent: boolean;
  }>,
) => api.put("/examinations/marks", { examSubjectId, marks });

export const publishResults = (examId: number, publish: boolean) =>
  api.post(`/examinations/${examId}/${publish ? "publish" : "unpublish"}`);
export const getReport = async (examId: number) =>
  items((await api.get(`/examinations/${examId}/reports`)).data).map(mapReport);
export const getMeritList = async (examId: number): Promise<MeritRow[]> =>
  items((await api.get(`/examinations/${examId}/merit`)).data).map((value) => {
    const item = object(value);
    return {
      studentId: number(item.studentId),
      studentName: text(item.studentName),
      className: text(item.className),
      sectionName: text(item.sectionName),
      admissionNumber: text(item.admissionNumber),
      rollNumber: text(item.rollNumber),
      total: number(item.total),
      fullMarks: number(item.fullMarks),
      percentage: number(item.percentage),
      grade: text(item.grade),
      gpa: number(item.gpa),
      status: text(item.status),
      classRank: number(item.classRank),
      sectionRank: number(item.sectionRank),
      schoolRank: number(item.schoolRank),
    };
  });
export const exportExaminationReport = (
  examId: number,
  format: "csv" | "pdf" | "xlsx",
) =>
  api
    .get(`/examinations/${examId}/export.${format}`, { responseType: "blob" })
    .then((response) => response.data as Blob);

export const getLookups = async (): Promise<ExaminationLookups> => {
  const requests = await Promise.allSettled(
    [
      "/academic/years",
      "/academic/classes",
      "/academic/sections",
      "/academic/subjects",
      "/people/teachers",
      "/examinations",
      "/examinations/types?includeInactive=true",
    ].map((url) => api.get(url, { params: { page: 0, size: 200 } })),
  );
  const values = requests.map((result) =>
    result.status === "fulfilled" ? result.value.data : undefined,
  );
  const options = (value: unknown) =>
    items(value)
      .map(option)
      .filter((item) => item.id > 0);
  return {
    sessions: options(values[0]),
    classes: options(values[1]),
    sections: options(values[2]),
    subjects: options(values[3]),
    teachers: options(values[4]),
    exams: options(values[5]),
    examTypes: options(values[6]),
  };
};
