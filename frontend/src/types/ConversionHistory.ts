export interface ConversionHistory {
  id: number;
  conversionCode: string;
  demoRequestId: number;
  demoSchoolId: number;
  paidSchoolId: number;
  schoolName: string;
  convertedBy: number;
  convertedByName: string;
  conversionDate: string;
  initialSubscriptionPlan?: string;
  subscriptionDuration?: number;
  enabledModules: string;
  paymentReference?: string;
  paymentMethod?: string;
  paymentAmount?: string;
  currency: string;
  remarks?: string;
  createdAt: string;
}

export interface ConversionDetail {
  conversion: ConversionHistory;
  demoRequest: {
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
    status: string;
    createdAt: string;
  };
  demoSchool: {
    id: number;
    demoCode: string;
    username: string;
    enabledModules: string;
    startDate?: string;
    expiryDate?: string;
    remarks?: string;
    status: string;
    createdAt: string;
  };
  paidSchool: {
    id: number;
    code: string;
    name: string;
    address?: string;
    phone?: string;
    email?: string;
    status: string;
    active: boolean;
  };
}

export interface DashboardStats {
  totalDemoRequests: number;
  approvedDemos: number;
  activeDemoAccounts: number;
  expiredDemoAccounts: number;
  convertedSchools: number;
  conversionRate: number;
}
