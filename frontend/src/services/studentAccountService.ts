import api from "./api";

export interface StudentProfile {
  id: number;
  fullName: string;
  photo: string | null;
  admissionNumber: string | null;
  rollNumber: string | null;
  className: string | null;
  sectionName: string | null;
  email: string | null;
  phone: string | null;
  dateOfBirth: string | null;
  gender: string | null;
  address: string | null;
  guardianName: string | null;
  guardianRelationship: string | null;
  guardianPhone: string | null;
  guardianEmail: string | null;
}

export interface AcademicCalendarEntry {
  id: number;
  name: string;
  type: string;
  startsOn: string;
  endsOn: string;
  description: string | null;
}

export const getStudentProfile = async (): Promise<StudentProfile> =>
  (await api.get<StudentProfile>("/people/students/self")).data;

export const getAcademicCalendar = async (): Promise<AcademicCalendarEntry[]> =>
  (await api.get<AcademicCalendarEntry[]>("/attendance/academic-calendar")).data;
