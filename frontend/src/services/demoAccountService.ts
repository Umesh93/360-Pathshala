import api from "../config/axios";
import type {
  DemoSchool,
  CreateDemoAccountPayload,
  UpdateDemoAccountPayload,
  ExtendDemoPayload,
  ConvertToPaidPayload,
  ConvertToPaidResult,
} from "../types/DemoSchool";

export const createDemoAccount = async (
  payload: CreateDemoAccountPayload,
): Promise<{ id: number; demoCode: string; username: string; password: string; expiryDate: string }> => {
  const response = await api.post("/super-admin/demo-accounts", {
    demoRequestId: payload.demoRequestId,
    username: payload.username,
    password: payload.password,
    enabledModules: payload.enabledModules,
    startDate: payload.startDate,
    expiryDate: payload.expiryDate,
    remarks: payload.remarks,
  });
  return response.data;
};

export const getDemoAccounts = async (): Promise<DemoSchool[]> => {
  const response = await api.get("/super-admin/demo-accounts");
  return response.data;
};

export const getDemoAccount = async (id: number): Promise<DemoSchool> => {
  const response = await api.get(`/super-admin/demo-accounts/${id}`);
  return response.data;
};

export const updateDemoAccount = async (
  id: number,
  payload: UpdateDemoAccountPayload,
): Promise<DemoSchool> => {
  const response = await api.put(`/super-admin/demo-accounts/${id}`, payload);
  return response.data;
};

export const deleteDemoAccount = async (id: number): Promise<void> => {
  await api.delete(`/super-admin/demo-accounts/${id}`);
};

export const extendDemo = async (
  id: number,
  payload: ExtendDemoPayload,
): Promise<DemoSchool> => {
  const response = await api.post(`/super-admin/demo-accounts/${id}/extend`, payload);
  return response.data;
};

export const resetDemoPassword = async (id: number): Promise<{ password: string }> => {
  const response = await api.post(`/super-admin/demo-accounts/${id}/reset-password`);
  return response.data;
};

export const convertToPaid = async (
  id: number,
  payload: ConvertToPaidPayload,
): Promise<ConvertToPaidResult> => {
  const response = await api.post(`/super-admin/demo-accounts/${id}/convert`, payload);
  return response.data;
};
