export type DemoStatus = "ACTIVE" | "EXPIRED" | "EXTENDED" | "CONVERTED";

export interface DemoSchool {
  id: number;
  demoCode: string;
  demoRequestId?: number | null;
  schoolId: number;
  schoolName: string;
  email: string;
  phone: string;
  logoUrl?: string | null;
  username: string;
  enabledModules: string;
  startDate: string;
  expiryDate: string;
  remainingDays: number;
  remarks?: string | null;
  status: DemoStatus;
  createdAt: string;
}

export interface CreateDemoAccountPayload {
  demoRequestId?: number;
  username: string;
  password: string;
  enabledModules: string[];
  startDate: string;
  expiryDate: string;
  remarks?: string;
}

export interface UpdateDemoAccountPayload {
  enabledModules?: string[];
  expiryDate?: string;
  remarks?: string;
}

export interface ExtendDemoPayload {
  days: number;
}

export interface ConvertToPaidPayload {
  schoolCode?: string;
  subscriptionPlan?: string;
}

export interface ConvertToPaidResult {
  schoolId: number;
  schoolCode: string;
  schoolName: string;
  adminUsername: string;
  adminPassword: string;
  totalAmount: number;
  referenceNumber: string;
  modules: string[];
}
