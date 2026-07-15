import type { Teacher, PaginatedResponse } from "../types/teacher.types";

const mockTeachers: Teacher[] = [
  {
    id: 1,
    teacherId: "TCH-2024-001",
    firstName: "John",
    lastName: "Doe",
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

export const createTeacher = async (teacher: Omit<Teacher, "id">): Promise<Teacher> => {
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
