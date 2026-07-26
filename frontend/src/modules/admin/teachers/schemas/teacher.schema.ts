import { z } from "zod";

export const employmentSchema = z.object({
  teacherId: z.string().min(1, "Teacher ID is required"),
  employeeCode: z.string().optional(),
  joiningDate: z.string().min(1, "Joining date is required"),
  employmentType: z.enum(["permanent", "contract", "part-time", "visiting", "intern"]),
  department: z.string().min(1, "Department is required"),
  designation: z.string().min(1, "Designation is required"),
  status: z.enum(["active", "inactive", "resigned", "suspended"]),
  reportingManager: z.string().optional(),
});

export const personalSchema = z.object({
  photo: z.any().optional(),
  firstName: z.string().min(1, "First name is required"),
  middleName: z.string().optional(),
  lastName: z.string().min(1, "Last name is required"),
  fullName: z.string().optional(),
  gender: z.enum(["male", "female", "other"]),
  dob: z.string().min(1, "Date of birth is required"),
  bloodGroup: z.string().optional(),
  nationality: z.string().optional(),
  religion: z.string().optional(),
  maritalStatus: z.string().optional(),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  alternativePhone: z.string().optional(),
  email: z.string().email("Invalid email address"),
  citizenshipNumber: z.string().optional(),
  passportNumber: z.string().optional(),
});

export const emergencySchema = z.object({
  fatherName: z.string().optional(),
  fatherPhone: z.string().optional(),
  motherName: z.string().optional(),
  motherPhone: z.string().optional(),
  spouseName: z.string().optional(),
  spousePhone: z.string().optional(),
  emergencyContactPerson: z.string().min(1, "Emergency contact person is required"),
  relationship: z.enum(["father", "mother", "spouse", "sibling", "relative", "friend", "other"]),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  address: z.string().optional(),
});

export const addressSchema = z.object({
  currentProvince: z.string().min(1, "Province is required"),
  currentDistrict: z.string().min(1, "District is required"),
  currentMunicipality: z.string().min(1, "Municipality is required"),
  currentWard: z.string().min(1, "Ward is required"),
  currentStreet: z.string().optional(),
  permanentSameAsCurrent: z.boolean().default(false),
  permanentProvince: z.string().optional(),
  permanentDistrict: z.string().optional(),
  permanentMunicipality: z.string().optional(),
  permanentWard: z.string().optional(),
  permanentStreet: z.string().optional(),
});

export const educationSchema = z.object({
  highestQualification: z.string().min(1, "Highest qualification is required"),
  university: z.string().optional(),
  specialization: z.string().optional(),
  passingYear: z.string().optional(),
  experience: z.string().optional(),
  previousOrganization: z.string().optional(),
  teachingLicenseNumber: z.string().optional(),
  languagesKnown: z.array(z.string()).default([]),
});

export const medicalSchema = z.object({
  bloodGroup: z.string().optional(),
  height: z.string().optional(),
  weight: z.string().optional(),
  medicalConditions: z.string().optional(),
  allergies: z.string().optional(),
  disability: z.string().optional(),
  doctorName: z.string().optional(),
  emergencyContact: z.string().optional(),
});

export const bankSchema = z.object({
  panNumber: z.string().optional(),
});

export const documentsSchema = z.object({
  documents: z.any().optional(),
});

export const loginSchema = z.object({
  createLogin: z.boolean().default(false),
  username: z.string().optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  password: z.string().optional(),
  confirmPassword: z.string().optional(),
});

export const teacherFormSchema = z.object({
  employment: employmentSchema,
  personal: personalSchema,
  emergency: emergencySchema,
  address: addressSchema,
  education: educationSchema,
  medical: medicalSchema,
  bank: bankSchema,
  documents: documentsSchema,
  login: loginSchema,
});

export type TeacherFormData = z.infer<typeof teacherFormSchema>;
export type EmploymentData = z.infer<typeof employmentSchema>;
export type PersonalData = z.infer<typeof personalSchema>;
export type EmergencyData = z.infer<typeof emergencySchema>;
export type AddressData = z.infer<typeof addressSchema>;
export type EducationData = z.infer<typeof educationSchema>;
export type MedicalData = z.infer<typeof medicalSchema>;
export type BankData = z.infer<typeof bankSchema>;
export type DocumentsData = z.infer<typeof documentsSchema>;
export type LoginData = z.infer<typeof loginSchema>;
