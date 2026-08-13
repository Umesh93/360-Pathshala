export interface Teacher {
  id: number;
  teacherId: string;
  employeeCode?: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  gender: "male" | "female" | "other";
  dob: string;
  nationality?: string;
  religion?: string;
  maritalStatus?: string;
  phone: string;
  alternativePhone?: string;
  email: string;
  citizenshipNumber?: string;
  passportNumber?: string;
  photo?: string;
  joiningDate: string;
  employmentType?:
    "permanent" | "contract" | "part-time" | "visiting" | "intern";
  department?: string;
  designation?: string;
  status: "active" | "inactive" | "resigned" | "suspended";
  reportingManager?: string;
  primarySubject?: string;
  secondarySubjects?: string[];
  assignedClasses?: string[];
  assignedSections?: string[];
  classTeacher?: boolean;
  academicYear?: string;
  shift?: "morning" | "day" | "evening";
  subject?: string;
  qualification?: string;
  university?: string;
  specialization?: string;
  passingYear?: string;
  experience?: string;
  previousEmployer?: string;
  previousSchool?: string;
  teachingLicenseNumber?: string;
  licenseExpiryDate?: string;
  languagesKnown?: string[];
  address: string;
  fatherName?: string;
  motherName?: string;
  spouseName?: string;
  emergencyContactPerson?: string;
  emergencyContactName?: string;
  emergencyContactNumber?: string;
  relationship?: string;
  emergencyRelationship?: string;
  emergencyPhone?: string;
  emergencyEmail?: string;
  currentAddress?: string;
  currentProvince?: string;
  currentDistrict?: string;
  currentMunicipality?: string;
  currentWard?: string;
  currentStreet?: string;
  permanentSameAsCurrent?: boolean;
  permanentAddress?: string;
  permanentProvince?: string;
  permanentDistrict?: string;
  permanentMunicipality?: string;
  permanentWard?: string;
  permanentStreet?: string;
  bloodGroup?: string;
  height?: string;
  weight?: string;
  medicalConditions?: string;
  allergies?: string;
  disability?: string;
  bankName?: string;
  branch?: string;
  accountNumber?: string;
  accountHolderName?: string;
  ifsc?: string;
  panNumber?: string;
  taxNumber?: string;
  salaryType?: "monthly" | "hourly" | "contract";
  basicSalary?: string;
  allowances?: string;
  facebook?: string;
  linkedin?: string;
  instagram?: string;
  twitter?: string;
  youtube?: string;
  personalWebsite?: string;
  documents?: TeacherDocument[];
  createLogin?: boolean;
  username?: string;
  password?: string;
  role?: string;
  bio?: string;
  teachingPhilosophy?: string;
  achievements?: string;
  awards?: string;
  remarks?: string;
}

export interface TeacherDocument {
  id: string;
  name: string;
  type: string;
  url: string;
  size: number;
  uploadedAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface Department {
  id: number;
  name: string;
}

export interface Designation {
  id: number;
  name: string;
  title: string;
}

export interface Subject {
  id: number;
  name: string;
  code: string;
}

export interface ClassItem {
  id: number;
  name: string;
  section: string;
}

export interface SectionItem {
  id: number;
  name: string;
  classId: number;
}

export interface AcademicYear {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
}

export type TeacherStatus = "active" | "inactive" | "resigned" | "suspended";
