import api from "../../../../services/api";
import type { Guardian, GuardianFilters, GuardianSummary, Child, PaginatedGuardians, GuardianRequest, LinkStudentRequest, GuardianAddress } from "../types/guardian.types";

const addressPrefix = "ADDR1|";
const legacyAddressPrefix = "ADDRESS_JSON:";

export const encodeGuardianAddress = (address: GuardianAddress) => addressPrefix + [
  address.currentProvince, address.currentDistrict, address.currentMunicipality, address.currentWard, address.currentStreet,
  address.permanentSameAsCurrent ? "1" : "0", address.permanentProvince, address.permanentDistrict,
  address.permanentMunicipality, address.permanentWard, address.permanentStreet,
].map((value) => encodeURIComponent(value || "")).join("|");

export const decodeGuardianAddress = (address?: string): GuardianAddress => {
  const empty: GuardianAddress = { currentProvince: "", currentDistrict: "", currentMunicipality: "", currentWard: "", currentStreet: "", permanentSameAsCurrent: false, permanentProvince: "", permanentDistrict: "", permanentMunicipality: "", permanentWard: "", permanentStreet: "" };
  if (!address) return empty;
  if (address.startsWith(legacyAddressPrefix)) {
    try { return { ...empty, ...JSON.parse(address.slice(legacyAddressPrefix.length)) }; } catch { return empty; }
  }
  if (!address.startsWith(addressPrefix)) return { ...empty, currentStreet: address };
  const values = address.slice(addressPrefix.length).split("|").map((value) => decodeURIComponent(value));
  return {
    currentProvince: values[0] || "", currentDistrict: values[1] || "", currentMunicipality: values[2] || "",
    currentWard: values[3] || "", currentStreet: values[4] || "", permanentSameAsCurrent: values[5] === "1",
    permanentProvince: values[6] || "", permanentDistrict: values[7] || "", permanentMunicipality: values[8] || "",
    permanentWard: values[9] || "", permanentStreet: values[10] || "",
  };
};

export const formatGuardianAddress = (address?: string) => {
  const value = decodeGuardianAddress(address);
  return [value.currentStreet, `Ward ${value.currentWard}`, value.currentMunicipality, value.currentDistrictName || value.currentDistrict, value.currentProvinceName || value.currentProvince].filter(Boolean).join(", ");
};

export const getGuardians = async (filters: GuardianFilters = {}): Promise<PaginatedGuardians> => {
  const response = await api.get<PaginatedGuardians>("/people/guardians", { params: filters });
  return response.data;
};

export const getGuardian = async (id: number): Promise<Guardian> => {
  const response = await api.get<Guardian>(`/people/guardians/${id}`);
  return response.data;
};

export const getGuardianSummary = async (): Promise<GuardianSummary> => {
  const response = await api.get<GuardianSummary>("/people/guardians/summary");
  return response.data;
};

export const createGuardian = async (payload: GuardianRequest): Promise<Guardian> => {
  const response = await api.post<Guardian>("/people/guardians", payload);
  return response.data;
};

export const updateGuardian = async (id: number, payload: GuardianRequest): Promise<Guardian> => {
  const response = await api.put<Guardian>(`/people/guardians/${id}`, payload);
  return response.data;
};

export const deleteGuardian = async (id: number): Promise<boolean> => {
  await api.delete(`/people/guardians/${id}`);
  return true;
};

export const restoreGuardian = async (id: number): Promise<Guardian> => {
  const response = await api.put<Guardian>(`/people/guardians/${id}/restore`);
  return response.data;
};

export const linkStudent = async (guardianId: number, payload: LinkStudentRequest): Promise<Guardian> => {
  const response = await api.post<Guardian>(`/people/guardians/${guardianId}/link-student`, payload);
  return response.data;
};

export const unlinkStudent = async (guardianId: number, studentId: number): Promise<Guardian> => {
  const response = await api.delete<Guardian>(`/people/guardians/${guardianId}/unlink-student/${studentId}`);
  return response.data;
};

export const getChildren = async (guardianId: number): Promise<Child[]> => {
  const response = await api.get<Child[]>(`/people/guardians/${guardianId}/children`);
  return response.data;
};

export const getStudentsForLinking = async (): Promise<{ id: number; admissionNo: string; name: string }[]> => {
  try {
    const response = await api.get("/people/students", { params: { page: 0, size: 1000 } });
    return (response.data.content as Record<string, unknown>[]).map((s) => ({
      id: s.id as number,
      admissionNo: (s.admissionNo as string) ?? "",
      name: `${s.firstName as string} ${s.lastName as string}`,
    }));
  } catch {
    return [];
  }
};

export const getClasses = async (): Promise<{ id: number; name: string }[]> => {
  try {
    const response = await api.get("/academic/classes", { params: { page: 0, size: 100 } });
    return (response.data.content as Record<string, unknown>[]).map((c) => ({
      id: (c.id as number) ?? 0,
      name: (c.name as string) ?? "",
    }));
  } catch {
    return [];
  }
};

export const getSections = async (classId?: number): Promise<{ id: number; name: string; classId: number }[]> => {
  try {
    const response = await api.get("/academic/sections", { params: { page: 0, size: 100, classId } });
    return (response.data.content as Record<string, unknown>[]).map((s) => ({
      id: (s.id as number) ?? 0,
      name: (s.name as string) ?? "",
      classId: (s.classId as number) ?? 0,
    }));
  } catch {
    return [];
  }
};

export const exportGuardiansCsv = async (filters: GuardianFilters = {}): Promise<Blob> => {
  const response = await api.get("/people/guardians/export", { params: filters, responseType: "blob" });
  return response.data as Blob;
};
