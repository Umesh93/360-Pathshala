export interface School {
  id: number;
  schoolId: string;
  schoolName: string;
  address: string;
  email: string;
  phoneNumber: string;
  status: "ACTIVE" | "INACTIVE" | "DEMO";
  modules: string[];
  adminUsername: string;
  adminPassword: string;
  totalAmount: number;
  paymentStatus: string;
  referenceNumber: string;
}

export interface ModuleOption {
  code: string;
  name: string;
  price: number;
  isBase: boolean;
}
