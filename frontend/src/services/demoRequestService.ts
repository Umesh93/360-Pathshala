import api from "../config/axios";
import type {
  DemoRequest,
  CreateDemoRequestPayload,
  UpdateDemoRequestPayload,
} from "../types/DemoRequest";

export interface PublicModule {
  code: string;
  name: string;
  description: string;
  active: boolean;
}

export const submitDemoRequest = async (
  payload: CreateDemoRequestPayload,
): Promise<{ id: number; requestCode: string; schoolName: string; status: string; createdAt: string }> => {
  const response = await api.post("/public/demo-request", {
    schoolName: payload.schoolName,
    contactPerson: payload.contactPerson,
    email: payload.email,
    phone: payload.phone,
    address: payload.address,
    studentCount: payload.studentCount,
    interestedModules: payload.interestedModules,
    message: payload.message,
  });
  return response.data;
};

export const getPublicModules = async (): Promise<PublicModule[]> => {
  const response = await api.get("/public/modules");
  return response.data;
};

export const getAdminDemoRequests = async (): Promise<DemoRequest[]> => {
  const response = await api.get("/super-admin/demo-requests");
  return response.data;
};

export const getAdminDemoRequest = async (id: number): Promise<DemoRequest> => {
  const response = await api.get(`/super-admin/demo-requests/${id}`);
  return response.data;
};

export const updateAdminDemoRequest = async (
  id: number,
  payload: UpdateDemoRequestPayload,
): Promise<DemoRequest> => {
  const response = await api.put(`/super-admin/demo-requests/${id}`, payload);
  return response.data;
};

export const deleteAdminDemoRequest = async (id: number): Promise<void> => {
  await api.delete(`/super-admin/demo-requests/${id}`);
};

export const approveDemoRequest = async (id: number): Promise<DemoRequest> => {
  const response = await api.post(`/super-admin/demo-requests/${id}/approve`);
  return response.data;
};

export const rejectDemoRequest = async (id: number): Promise<DemoRequest> => {
  const response = await api.post(`/super-admin/demo-requests/${id}/reject`);
  return response.data;
};
