export interface School {
  id: number;
  schoolId: string;
  schoolName: string;
  address: string;
  email: string;
  phoneNumber: string;
  contactPerson: string;
  designation: string;
  status: "ACTIVE" | "INACTIVE" | "DEMO";
  modules: string[];
  adminUsername: string;
  adminPassword: string;
  totalAmount: number;
  paymentStatus: string;
  referenceNumber: string;
  logoUrl?: string | null;
}

export interface ModuleOption {
  code: string;
  name: string;
  description?: string;
  active: boolean;
  selectable: boolean;
  comingSoon: boolean;
  category: "CORE" | "FUTURE";
  required: boolean;
  billingType: "REQUIRED" | "INCLUDED" | "PAID";
  annualPrice: number;
  billingPeriod: string;
}
