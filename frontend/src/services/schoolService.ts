import api from "../config/axios";
import type { School, ModuleOption } from "../types/School";

interface SchoolSummaryResponse {
  id: number; code: string; name: string; address?: string; email: string; phone?: string;
  status?: School["status"]; modules?: string[]; adminUsername?: string; adminPassword?: string;
}

export interface SchoolPayload {
  name: string; address: string; email: string; phone: string; modules: string[]; status: string; password?: string;
}

interface PlatformModuleResponse { code: string; name: string }

export interface CreateSchoolResponse {
  id: number;
  schoolCode: string;
  adminUsername: string;
  adminPassword: string;
  totalAmount: number;
  paymentReference: string;
  selectedModules: string[];
}

export const getSchools = async (): Promise<School[]> => {
  console.log("[schoolService] getSchools called");
  try {
    const response = await api.get("/saas/schools");
    console.log("[schoolService] getSchools response", response.data);
    return (response.data as SchoolSummaryResponse[]).map((school) => ({
      id: school.id,
      schoolId: school.code,
      schoolName: school.name,
      address: school.address || "",
      email: school.email,
      phoneNumber: school.phone || "",
      status: school.status || "DEMO",
      modules: school.modules || [],
      adminUsername: school.adminUsername || "",
      adminPassword: school.adminPassword || "",
      totalAmount: 0,
      paymentStatus: "",
      referenceNumber: "",
    }));
  } catch (error) {
    console.error("[schoolService] getSchools error", error);
    throw error;
  }
};

export const createSchool = async (payload: SchoolPayload): Promise<CreateSchoolResponse> => {
  const response = await api.post("/saas/schools", payload);
  return response.data;
};

export const updateSchool = async (id: number, payload: SchoolPayload): Promise<SchoolSummaryResponse> => {
  const response = await api.put(`/saas/schools/${id}`, payload);
  return response.data;
};

export const deleteSchool = async (id: number): Promise<void> => {
  await api.delete(`/saas/schools/${id}`);
};

export const toggleSchoolStatus = async (id: number, status: string): Promise<SchoolSummaryResponse> => {
  const response = await api.patch(`/saas/schools/${id}/status`, { status });
  return response.data;
};

export const getNextSchoolId = async (): Promise<string> => {
  const response = await api.get("/saas/schools/next-id");
  return response.data;
};

export const getModules = async (): Promise<ModuleOption[]> => {
  const response = await api.get("/saas/modules");
  const moduleMap: Record<string, ModuleOption> = {
    STUDENT_MANAGEMENT: { code: "STUDENT_MANAGEMENT", name: "Student Registration", price: 0, isBase: true },
    EXAMINATION: { code: "EXAMINATION", name: "Examination & Result Publishing", price: 0, isBase: true },
    ATTENDANCE: { code: "ATTENDANCE", name: "Attendance", price: 3000, isBase: false },
    TEACHER_DASHBOARD: { code: "TEACHER_DASHBOARD", name: "Teacher Dashboard", price: 3000, isBase: false },
    STUDENT_DASHBOARD: { code: "STUDENT_DASHBOARD", name: "Student Dashboard", price: 3000, isBase: false },
    PARENT_DASHBOARD: { code: "PARENT_DASHBOARD", name: "Parent / Guardian Dashboard", price: 3000, isBase: false },
    ACCOUNTS: { code: "ACCOUNTS", name: "Accounts", price: 3000, isBase: false },
    LIBRARY: { code: "LIBRARY", name: "Library", price: 3000, isBase: false },
    TRANSPORT: { code: "TRANSPORT", name: "Transport", price: 3000, isBase: false },
    HOSTEL: { code: "HOSTEL", name: "Hostel", price: 3000, isBase: false },
    INVENTORY: { code: "INVENTORY", name: "Inventory", price: 3000, isBase: false },
    PAYROLL: { code: "PAYROLL", name: "Payroll", price: 3000, isBase: false },
    HR_MANAGEMENT: { code: "HR_MANAGEMENT", name: "HR Management", price: 3000, isBase: false },
    LEAVE_MANAGEMENT: { code: "LEAVE_MANAGEMENT", name: "Leave Management", price: 3000, isBase: false },
    ASSIGNMENT: { code: "ASSIGNMENT", name: "Assignments", price: 3000, isBase: false },
    ACADEMIC_CALENDAR: { code: "ACADEMIC_CALENDAR", name: "Academic Calendar", price: 3000, isBase: false },
    NOTIFICATIONS: { code: "NOTIFICATIONS", name: "Notifications", price: 3000, isBase: false },
  };

  return (response.data as PlatformModuleResponse[]).map((item) => moduleMap[item.code] || {
    code: item.code,
    name: item.name,
    price: 0,
    isBase: false,
  });
};

export const getCurrentSchoolModuleCodes = async (): Promise<string[]> => {
  const response = await api.get<Array<{ moduleCode: string; active: boolean }>>("/saas/school-modules/current");
  return response.data.filter((module) => module.active).map((module) => module.moduleCode);
};
