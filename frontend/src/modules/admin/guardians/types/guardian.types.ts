export interface Guardian {
  id: number;
  schoolId: number;
  fullName: string;
  phone: string;
  email: string;
  address: string;
  relationship: string;
  occupation: string;
  communicationPreference: string;
  emergencyContactPerson: string;
  emergencyContactNumber: string;
  emergencyContactRelationship: string;
  photo: string;
  documents: string;
  notes: string;
  fatherName: string;
  motherName: string;
  fatherOccupation: string;
  fatherPhone: string;
  fatherEmail: string;
  motherOccupation: string;
  motherPhone: string;
  motherEmail: string;
  childrenCount: number;
  status: string;
  deleted: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: number;
  updatedBy: number;
}

export interface GuardianSummary {
  total: number;
  active: number;
  inactive: number;
}

export interface Child {
  id: number;
  admissionNumber: string;
  rollNumber: string;
  firstName: string;
  lastName: string;
  className: string;
  sectionName: string;
  status: string;
  photo: string;
}

export interface GuardianFilters {
  search?: string;
  relationship?: string;
  occupation?: string;
  communicationPreference?: string;
  status?: string;
  deleted?: boolean;
  page?: number;
  size?: number;
}

export interface GuardianRequest {
  fullName: string;
  phone: string;
  email: string;
  address: string;
  relationship: string;
  occupation: string;
  communicationPreference: string;
  emergencyContactPerson: string;
  emergencyContactNumber: string;
  emergencyContactRelationship: string;
  photo: string;
  documents: string;
  notes: string;
  fatherName: string;
  motherName: string;
  fatherOccupation: string;
  fatherPhone: string;
  fatherEmail: string;
  motherOccupation: string;
  motherPhone: string;
  motherEmail: string;
}

export interface GuardianAddress {
  currentProvince: string;
  currentProvinceName?: string;
  currentDistrict: string;
  currentDistrictName?: string;
  currentMunicipality: string;
  currentWard: string;
  currentStreet: string;
  permanentSameAsCurrent: boolean;
  permanentProvince: string;
  permanentDistrict: string;
  permanentMunicipality: string;
  permanentWard: string;
  permanentStreet: string;
}

export interface LinkStudentRequest {
  studentId: number;
}

export interface PaginatedGuardians {
  content: Guardian[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}
