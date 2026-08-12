import api from "../config/axios";
import type { School, ModuleOption } from "../types/School";

interface SchoolSummaryResponse {
  id: number;
  code: string;
  name: string;
  address?: string;
  email: string;
  phone?: string;
  contactPerson?: string;
  designation?: string;
  status?: School["status"];
  modules?: string[];
  adminUsername?: string;
  adminPassword?: string;
  logoUrl?: string | null;
}

export interface SchoolPayload {
  name: string;
  address: string;
  email: string;
  phone: string;
  contactPerson: string;
  designation: string;
  modules: string[];
  status: string;
  password?: string;
}

interface PlatformModuleResponse {
  code: string;
  name: string;
  description?: string;
  active?: boolean;
  selectable?: boolean;
  comingSoon?: boolean;
  category?: string;
  required?: boolean;
}

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
      contactPerson: school.contactPerson || "",
      designation: school.designation || "",
      status: school.status || "DEMO",
      modules: school.modules || [],
      adminUsername: school.adminUsername || "",
      adminPassword: school.adminPassword || "",
      totalAmount: 0,
      paymentStatus: "",
      referenceNumber: "",
      logoUrl: school.logoUrl ?? null,
    }));
  } catch (error) {
    console.error("[schoolService] getSchools error", error);
    throw error;
  }
};

export const createSchool = async (
  payload: SchoolPayload,
): Promise<CreateSchoolResponse> => {
  const response = await api.post("/saas/schools", payload);
  return response.data;
};

export const updateSchool = async (
  id: number,
  payload: SchoolPayload,
): Promise<SchoolSummaryResponse> => {
  const response = await api.put(`/saas/schools/${id}`, payload);
  return response.data;
};

export const deleteSchool = async (id: number): Promise<void> => {
  await api.delete(`/saas/schools/${id}`);
};

export const toggleSchoolStatus = async (
  id: number,
  status: string,
): Promise<SchoolSummaryResponse> => {
  const response = await api.patch(`/saas/schools/${id}/status`, { status });
  return response.data;
};

export const getNextSchoolId = async (): Promise<string> => {
  const response = await api.get("/saas/schools/next-id");
  return response.data;
};

export const getModules = async (): Promise<ModuleOption[]> => {
  const response = await api.get("/saas/modules");
  return (
    response.data as (PlatformModuleResponse & Partial<ModuleOption>)[]
  ).map((item) => ({
    code: item.code,
    name: item.name,
    description: item.description,
    active: item.active ?? true,
    selectable: item.selectable ?? true,
    comingSoon: item.comingSoon ?? false,
    category: item.category === "FUTURE" ? "FUTURE" : "CORE",
    required:
      item.required ??
      (item.code === "STUDENT_MANAGEMENT" || item.code === "EXAMINATION"),
  }));
};

export const uploadSchoolLogo = async (
  id: number,
  file: File,
): Promise<void> => {
  const formData = new FormData();
  formData.append("file", file);
  await api.put(`/saas/schools/${id}/logo`, formData);
};

export const removeSchoolLogo = async (id: number): Promise<void> => {
  await api.delete(`/saas/schools/${id}/logo`);
};

export const loadSchoolLogoUrl = async (
  source: number | "current" | string,
): Promise<string> => {
  const url =
    typeof source === "number"
      ? `/saas/schools/${source}/logo`
      : source === "current"
        ? "/saas/schools/current/logo"
        : source.replace(/^\/api/, "");
  const response = await api.get<Blob>(url, { responseType: "blob" });
  return URL.createObjectURL(response.data);
};

export const getCurrentSchoolModuleCodes = async (): Promise<string[]> => {
  const response = await api.get<
    Array<{ moduleCode: string; active: boolean }>
  >("/saas/school-modules/current");
  return response.data
    .filter((module) => module.active)
    .map((module) => module.moduleCode);
};
