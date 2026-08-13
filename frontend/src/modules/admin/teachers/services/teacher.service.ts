import type {
  Teacher,
  PaginatedResponse,
  Department,
  Designation,
  Subject,
  ClassItem,
  SectionItem,
  AcademicYear,
} from "../types/teacher.types";
import api from "../../../../services/api";
import type { TeacherFormData } from "../schemas/teacher.schema";
import { buildTeacherPayload } from "../utils/teacherFormHelpers";

const mockDepartments: Department[] = [
  { id: 1, name: "Mathematics" },
  { id: 2, name: "Science" },
  { id: 3, name: "English" },
  { id: 4, name: "Social Studies" },
  { id: 5, name: "Computer Science" },
  { id: 6, name: "Physical Education" },
];

const mockDesignations: Designation[] = [
  { id: 1, name: "Teacher", title: "Teacher" },
  { id: 2, name: "Senior Teacher", title: "Senior Teacher" },
  { id: 3, name: "HOD", title: "Head of Department" },
  { id: 4, name: "Vice Principal", title: "Vice Principal" },
];

const mockSubjects: Subject[] = [
  { id: 1, name: "Mathematics", code: "MATH" },
  { id: 2, name: "Physics", code: "PHY" },
  { id: 3, name: "Chemistry", code: "CHEM" },
  { id: 4, name: "English", code: "ENG" },
  { id: 5, name: "Nepali", code: "NEP" },
  { id: 6, name: "Computer Science", code: "CS" },
  { id: 7, name: "Social Studies", code: "SOC" },
  { id: 8, name: "Health", code: "HEA" },
];

const mockClasses: ClassItem[] = [
  { id: 1, name: "Grade 1", section: "A" },
  { id: 2, name: "Grade 1", section: "B" },
  { id: 3, name: "Grade 2", section: "A" },
  { id: 4, name: "Grade 3", section: "A" },
  { id: 5, name: "Grade 4", section: "A" },
  { id: 6, name: "Grade 5", section: "A" },
  { id: 7, name: "Grade 6", section: "A" },
  { id: 8, name: "Grade 7", section: "A" },
  { id: 9, name: "Grade 8", section: "A" },
  { id: 10, name: "Grade 9", section: "A" },
  { id: 11, name: "Grade 10", section: "A" },
];

const mockSections: SectionItem[] = [
  { id: 1, name: "A", classId: 1 },
  { id: 2, name: "B", classId: 1 },
  { id: 3, name: "A", classId: 2 },
  { id: 4, name: "B", classId: 2 },
  { id: 5, name: "A", classId: 3 },
  { id: 6, name: "A", classId: 4 },
  { id: 7, name: "A", classId: 5 },
];

const mockAcademicYears: AcademicYear[] = [
  {
    id: 1,
    name: "2025/2026",
    startDate: "2025-04-01",
    endDate: "2026-03-31",
    isCurrent: true,
  },
  {
    id: 2,
    name: "2024/2025",
    startDate: "2024-04-01",
    endDate: "2025-03-31",
    isCurrent: false,
  },
];

export const getTeachers = async (
  page = 1,
  limit = 10,
  search = "",
  subjectFilter = "",
  statusFilter = "",
): Promise<PaginatedResponse<Teacher>> => {
  const response = await api.get("/people/teachers", {
    params: {
      page: page - 1,
      size: limit,
      search: search || undefined,
      status: statusFilter || undefined,
      subject: subjectFilter || undefined,
    },
  });
  const value = response.data;
  return {
    data: value.content.map(mapTeacher),
    total: value.totalElements,
    page: value.number + 1,
    limit: value.size,
    totalPages: Math.max(value.totalPages, 1),
  };
};

const mapTeacher = (record: Record<string, unknown>): Teacher => ({
  ...(() => {
    try {
      return record.details ? JSON.parse(record.details as string) : {};
    } catch {
      return {};
    }
  })(),
  ...(record as unknown as Teacher),
  id: record.id as number,
  teacherId: record.employeeNumber as string,
  employeeCode: (() => {
    try {
      return (
        (JSON.parse((record.details as string) || "{}")
          .employeeCode as string) || (record.employeeNumber as string)
      );
    } catch {
      return record.employeeNumber as string;
    }
  })(),
  gender: (record.gender as Teacher["gender"]) || "other",
  dob: (record.dateOfBirth as string) || "",
  email: (record.email as string) || "",
  address: "",
  joiningDate: (record.joiningDate as string) || "",
  status: String(record.status || "ACTIVE").toLowerCase() as Teacher["status"],
  subject: (record.department as string) || "",
});

export const getTeacherAssignments = async (id: number) =>
  (await api.get(`/people/teachers/${id}/assignments`)).data;
export const getTeacherLeaves = async (id: number) =>
  (await api.get(`/people/teachers/${id}/leaves`)).data;
export const assignTeacher = async (payload: {
  teacherId: number;
  subjectId: number;
  classId: number;
  sectionId: number;
}) => (await api.post("/academic/teacher-subjects", payload)).data;
export const exportTeachersCsv = async (): Promise<Blob> => {
  const response = await getTeachers(1, 1000);
  const rows = [
    ["Teacher ID", "Name", "Phone", "Email", "Qualification", "Status"],
    ...response.data.map((item) => [
      item.teacherId,
      `${item.firstName} ${item.lastName}`.trim(),
      item.phone,
      item.email,
      item.qualification || "",
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

export const getTeacherById = async (
  id: number,
): Promise<Teacher | undefined> => {
  const response = await api.get(`/people/teachers/${id}`);
  return mapTeacher(response.data);
};

export const createTeacher = async (
  teacher: TeacherFormData,
): Promise<Teacher> => {
  console.log("Teacher Form Data", teacher);
  const payload = buildTeacherPayload(teacher);
  console.log("Teacher Payload:", payload);
  const response = await api.post("/people/teachers", payload);
  return mapTeacher(response.data);
};

export const updateTeacher = async (
  id: number,
  teacher: TeacherFormData,
): Promise<Teacher | undefined> => {
  console.log("Teacher Form Data", teacher);
  const payload = buildTeacherPayload(teacher);
  console.log("Teacher Payload:", payload);
  const response = await api.put(`/people/teachers/${id}`, payload);
  return mapTeacher(response.data);
};

export const deleteTeacher = async (id: number): Promise<boolean> => {
  await api.delete(`/people/teachers/${id}`);
  return true;
};

export const generateTeacherId = async (): Promise<string> => {
  const response = await api.get("/people/teachers/next-teacher-id");
  return response.data.teacherId as string;
};

export const generateEmployeeCode = async (): Promise<string> => {
  const response = await api.get("/people/teachers/next-employee-code");
  return response.data.employeeCode as string;
};

export const getDepartments = async (): Promise<Department[]> => {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return mockDepartments;
};

export const getDesignations = async (): Promise<Designation[]> => {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return mockDesignations;
};

export const getSubjects = async (): Promise<Subject[]> => {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return mockSubjects;
};

export const getClasses = async (): Promise<ClassItem[]> => {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return mockClasses;
};

export const getSections = async (): Promise<SectionItem[]> => {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return mockSections;
};

export const getAcademicYears = async (): Promise<AcademicYear[]> => {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return mockAcademicYears;
};

export const getDistricts = async (
  provinceId: number,
): Promise<{ id: number; name: string }[]> => {
  await new Promise((resolve) => setTimeout(resolve, 300));
  const districtMap: Record<number, { id: number; name: string }[]> = {
    1: [
      { id: 1, name: "Taplejung" },
      { id: 2, name: "Panchthar" },
      { id: 3, name: "Ilam" },
      { id: 4, name: "Jhapa" },
      { id: 5, name: "Morang" },
      { id: 6, name: "Sunsari" },
      { id: 7, name: "Dhankuta" },
      { id: 8, name: "Terhathum" },
      { id: 9, name: "Sankhuwasabha" },
      { id: 10, name: "Bhojpur" },
      { id: 11, name: "Khotang" },
      { id: 12, name: "Okhaldhunga" },
      { id: 13, name: "Udayapur" },
    ],
    2: [
      { id: 14, name: "Siraha" },
      { id: 15, name: "Saptari" },
      { id: 16, name: "Udayapur" },
      { id: 17, name: "Mahottari" },
      { id: 18, name: "Dhanusha" },
      { id: 19, name: "Sarlahi" },
      { id: 20, name: "Rautahat" },
      { id: 21, name: "Bara" },
      { id: 22, name: "Parsa" },
    ],
    3: [
      { id: 23, name: "Kathmandu" },
      { id: 24, name: "Lalitpur" },
      { id: 25, name: "Bhaktapur" },
      { id: 26, name: "Rasuwa" },
      { id: 27, name: "Nuwakot" },
      { id: 28, name: "Dhading" },
      { id: 29, name: "Makwanpur" },
      { id: 30, name: "Chitwan" },
      { id: 31, name: "Nawalparasi" },
      { id: 32, name: "Rupandehi" },
    ],
    4: [
      { id: 33, name: "Gorkha" },
      { id: 34, name: "Tanahun" },
      { id: 35, name: "Syangja" },
      { id: 36, name: "Kaski" },
      { id: 37, name: "Lamjung" },
      { id: 38, name: "Nuwakot" },
      { id: 39, name: "Dhading" },
    ],
    5: [
      { id: 40, name: "Palpa" },
      { id: 41, name: "Nawalparasi" },
      { id: 42, name: "Arghakhanchi" },
      { id: 43, name: " Gulmi" },
      { id: 44, name: "Pyuthan" },
      { id: 45, name: "Rolpa" },
      { id: 46, name: "Rukum" },
      { id: 47, name: "Salyan" },
    ],
    6: [
      { id: 48, name: "Jumla" },
      { id: 49, name: "Kalikot" },
      { id: 50, name: "Dailekh" },
      { id: 51, name: "Jajarkot" },
      { id: 52, name: "Rukum" },
      { id: 53, name: "Salyan" },
      { id: 54, name: "Surkhet" },
    ],
    7: [
      { id: 55, name: "Darchula" },
      { id: 56, name: "Bajhang" },
      { id: 57, name: "Bajura" },
      { id: 58, name: "Doti" },
      { id: 59, name: "Achham" },
      { id: 60, name: "Baitadi" },
      { id: 61, name: "Dadeldhura" },
    ],
  };
  return districtMap[provinceId] || [];
};

export const uploadDocuments = async (files: File[]): Promise<string[]> => {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return files.map((file) => URL.createObjectURL(file));
};
