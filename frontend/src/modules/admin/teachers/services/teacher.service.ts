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
  { id: 1, name: "2025/2026", startDate: "2025-04-01", endDate: "2026-03-31", isCurrent: true },
  { id: 2, name: "2024/2025", startDate: "2024-04-01", endDate: "2025-03-31", isCurrent: false },
];

const mockTeachers: Teacher[] = [
  {
    id: 1,
    teacherId: "TCH-2024-001",
    firstName: "John",
    lastName: "Doe",
    fullName: "John Doe",
    gender: "male",
    dob: "1985-03-15",
    phone: "9800000001",
    email: "john.doe@example.com",
    address: "Kathmandu, Nepal",
    qualification: "M.Ed",
    subject: "Mathematics",
    joiningDate: "2020-01-10",
    experience: "8 years",
    status: "active",
  },
  {
    id: 2,
    teacherId: "TCH-2024-002",
    firstName: "Jane",
    lastName: "Smith",
    fullName: "Jane Smith",
    gender: "female",
    dob: "1988-07-22",
    phone: "9800000002",
    email: "jane.smith@example.com",
    address: "Pokhara, Nepal",
    qualification: "M.Sc Physics",
    subject: "Physics",
    joiningDate: "2021-02-15",
    experience: "6 years",
    status: "active",
  },
  {
    id: 3,
    teacherId: "TCH-2024-003",
    firstName: "Robert",
    lastName: "Brown",
    fullName: "Robert Brown",
    gender: "male",
    dob: "1990-11-05",
    phone: "9800000003",
    email: "robert.brown@example.com",
    address: "Lalitpur, Nepal",
    qualification: "M.A English",
    subject: "English",
    joiningDate: "2019-06-01",
    experience: "10 years",
    status: "active",
  },
  {
    id: 4,
    teacherId: "TCH-2024-004",
    firstName: "Emily",
    lastName: "Davis",
    fullName: "Emily Davis",
    gender: "female",
    dob: "1987-09-12",
    phone: "9800000004",
    email: "emily.davis@example.com",
    address: "Bhaktapur, Nepal",
    qualification: "M.Sc Chemistry",
    subject: "Chemistry",
    joiningDate: "2022-03-20",
    experience: "4 years",
    status: "inactive",
  },
  {
    id: 5,
    teacherId: "TCH-2024-005",
    firstName: "Michael",
    lastName: "Wilson",
    fullName: "Michael Wilson",
    gender: "male",
    dob: "1983-05-30",
    phone: "9800000005",
    email: "michael.wilson@example.com",
    address: "Kathmandu, Nepal",
    qualification: "M.A History",
    subject: "History",
    joiningDate: "2018-08-15",
    experience: "12 years",
    status: "active",
  },
  {
    id: 6,
    teacherId: "TCH-2024-006",
    firstName: "Sarah",
    lastName: "Johnson",
    fullName: "Sarah Johnson",
    gender: "female",
    dob: "1992-01-18",
    phone: "9800000006",
    email: "sarah.johnson@example.com",
    address: "Pokhara, Nepal",
    qualification: "M.Com",
    subject: "Economics",
    joiningDate: "2023-01-05",
    experience: "2 years",
    status: "active",
  },
];

export const getTeachers = async (
  page = 1,
  limit = 10,
  search = "",
  subjectFilter = "",
  statusFilter = ""
): Promise<PaginatedResponse<Teacher>> => {
  await new Promise((resolve) => setTimeout(resolve, 500));

  let filtered = [...mockTeachers];

  if (search) {
    const lower = search.toLowerCase();
    filtered = filtered.filter(
      (t) =>
        t.firstName.toLowerCase().includes(lower) ||
        t.lastName.toLowerCase().includes(lower) ||
        t.teacherId.toLowerCase().includes(lower) ||
        t.phone.includes(search) ||
        t.email?.toLowerCase().includes(lower)
    );
  }

  if (subjectFilter) {
    filtered = filtered.filter((t) => t.subject === subjectFilter);
  }

  if (statusFilter) {
    filtered = filtered.filter((t) => t.status === statusFilter);
  }

  const total = filtered.length;
  const totalPages = Math.ceil(total / limit);
  const start = (page - 1) * limit;
  const data = filtered.slice(start, start + limit);

  return {
    data,
    total,
    page,
    limit,
    totalPages,
  };
};

export const getTeacherById = async (id: number): Promise<Teacher | undefined> => {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return mockTeachers.find((t) => t.id === id);
};

export const createTeacher = async (
  teacher: Omit<Teacher, "id">
): Promise<Teacher> => {
  await new Promise((resolve) => setTimeout(resolve, 500));
  const newTeacher = { ...teacher, id: Date.now() } as Teacher;
  mockTeachers.push(newTeacher);
  return newTeacher;
};

export const updateTeacher = async (
  id: number,
  teacher: Partial<Teacher>
): Promise<Teacher | undefined> => {
  await new Promise((resolve) => setTimeout(resolve, 500));
  const index = mockTeachers.findIndex((t) => t.id === id);
  if (index === -1) return undefined;
  mockTeachers[index] = { ...mockTeachers[index], ...teacher };
  return mockTeachers[index];
};

export const deleteTeacher = async (id: number): Promise<boolean> => {
  await new Promise((resolve) => setTimeout(resolve, 500));
  const index = mockTeachers.findIndex((t) => t.id === id);
  if (index === -1) return false;
  mockTeachers.splice(index, 1);
  return true;
};

export const generateTeacherId = async (): Promise<string> => {
  await new Promise((resolve) => setTimeout(resolve, 300));
  const year = new Date().getFullYear();
  const count = mockTeachers.length + 1;
  return `TCH-${year}-${String(count).padStart(3, "0")}`;
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

export const uploadDocuments = async (files: File[]): Promise<string[]> => {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return files.map((file) => URL.createObjectURL(file));
};

