import api from "../config/axios";
import type {
  ConversionHistory,
  ConversionDetail,
  DashboardStats,
} from "../types/ConversionHistory";

export const getConversionHistory = async (): Promise<ConversionHistory[]> => {
  const response = await api.get("/super-admin/demo-conversions");
  return response.data;
};

export const getConversionByCode = async (
  conversionCode: string,
): Promise<ConversionHistory> => {
  const response = await api.get(
    `/super-admin/demo-conversions/code/${conversionCode}`,
  );
  return response.data;
};

export const getConversionByDemoSchool = async (
  demoSchoolId: number,
): Promise<ConversionHistory> => {
  const response = await api.get(
    `/super-admin/demo-conversions/demo/${demoSchoolId}`,
  );
  return response.data;
};

export const getConversionByPaidSchool = async (
  paidSchoolId: number,
): Promise<ConversionHistory> => {
  const response = await api.get(
    `/super-admin/demo-conversions/school/${paidSchoolId}`,
  );
  return response.data;
};

export const getConversionDetail = async (
  id: number,
): Promise<ConversionDetail> => {
  const response = await api.get(`/super-admin/demo-conversions/${id}`);
  return response.data;
};

export const getDashboardStats = async (): Promise<DashboardStats> => {
  const response = await api.get("/super-admin/demo-conversions/stats");
  return response.data;
};

export const exportConversionsCSV = async (): Promise<Blob> => {
  const response = await api.get("/super-admin/demo-conversions/export/csv", {
    responseType: "blob",
  });
  return response.data;
};

export const exportConversionsExcel = async (): Promise<Blob> => {
  const response = await api.get("/super-admin/demo-conversions/export/excel", {
    responseType: "blob",
  });
  return response.data;
};

export const exportConversionsPDF = async (): Promise<Blob> => {
  const response = await api.get("/super-admin/demo-conversions/export/pdf", {
    responseType: "blob",
  });
  return response.data;
};
