export type DemoModuleCode = string;
export type RequestStatus = "PENDING" | "ACCEPTED" | "REJECTED";
export type EmailStatus = "SENT" | "FAILED" | "DISABLED" | string;

export interface DemoRequest {
  id: number;
  requestCode: string;
  schoolName: string;
  contactPerson: string;
  designation: string;
  email: string;
  phone: string;
  address: string;
  studentCount?: number | null;
  interestedModules: string;
  status: RequestStatus;
  logoUrl?: string | null;
  provisionedSchoolId?: number | null;
  demoSchoolId?: number | null;
  emailStatus?: EmailStatus | null;
  emailError?: string | null;
  acceptedAt?: string | null;
  createdAt: string;
  updatedAt?: string | null;
}

export interface CreateDemoRequestPayload {
  schoolName: string;
  contactPerson: string;
  designation: string;
  email: string;
  phone: string;
  address: string;
  studentCount?: number;
  interestedModules: DemoModuleCode[];
}

export interface PublicDemoRequestResponse {
  id: number;
  requestCode: string;
  schoolName: string;
  status: string;
  createdAt: string;
}

export interface AcceptDemoResponse {
  accountCreated: boolean;
  schoolId: number;
  demoSchoolId: number;
  schoolCode: string;
  schoolName: string;
  email: string;
  phone: string;
  logoUrl?: string | null;
  username: string;
  password?: string | null;
  startsOn: string;
  expiresOn: string;
  remainingDays: number;
  modules: DemoModuleCode[];
  status: string;
  emailStatus: EmailStatus;
  message: string;
}

export interface UpdateDemoRequestPayload {
  status?: RequestStatus;
  message?: string;
}
