export type RequestStatus = "PENDING" | "CONTACTED" | "APPROVED" | "REJECTED" | "CANCELLED";

export interface DemoRequest {
  id: number;
  requestCode: string;
  schoolName: string;
  contactPerson: string;
  email: string;
  phone: string;
  address?: string;
  studentCount?: number;
  interestedModules?: string;
  message?: string;
  status: RequestStatus;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateDemoRequestPayload {
  schoolName: string;
  contactPerson: string;
  email: string;
  phone: string;
  address?: string;
  studentCount?: number;
  interestedModules?: string[];
  message?: string;
}

export interface UpdateDemoRequestPayload {
  status?: RequestStatus;
  message?: string;
}
