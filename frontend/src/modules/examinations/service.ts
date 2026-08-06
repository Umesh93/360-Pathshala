import api from "../../services/api";
import type { ChildResults, ExamResult, MarkEntryRow, TeacherExamAssignment } from "./types";

type ErrorPayload = {
  message?: string;
};

type RequestError = {
  message?: string;
  response?: {
    data?: ErrorPayload;
  };
};

export const examinationError = (error: unknown) => {
  const requestError = error as RequestError;
  return requestError.response?.data?.message
    ?? requestError.message
    ?? "Examination data is unavailable. Please try again.";
};

export const getTeacherExamAssignments = async () =>
  (await api.get<TeacherExamAssignment[]>("/examinations/teachers/self/assignments")).data;

export const getTeacherMarkRoster = async (examSubjectId: number) =>
  (await api.get<MarkEntryRow[]>("/examinations/teachers/self/marks", { params: { examSubjectId } })).data;

export const saveTeacherMarks = (examSubjectId: number, marks: MarkEntryRow[]) =>
  api.post("/examinations/teachers/self/marks/bulk", {
    examSubjectId,
    marks: marks.map((item) => ({
      studentId: item.studentId,
      obtainedMarks: item.absent ? null : item.obtainedMarks,
      absent: item.absent,
    })),
  });

export const getMyPublishedResults = async () =>
  (await api.get<ExamResult[]>("/examinations/students/self/results")).data;

export const getMyChildrenPublishedResults = async () =>
  (await api.get<ChildResults[]>("/examinations/parents/self/children/results")).data;
