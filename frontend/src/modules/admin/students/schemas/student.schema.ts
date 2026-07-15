import { z } from "zod";

export const academicInfoSchema = z.object({
  academicYear: z.string().min(1, "Academic year is required"),
  admissionNo: z.string().min(1, "Admission number is required"),
  admissionDate: z.string().min(1, "Admission date is required"),
  class: z.string().min(1, "Class is required"),
  section: z.string().min(1, "Section is required"),
  rollNumber: z.string().min(1, "Roll number is required"),
  house: z.string().optional(),
  status: z.enum(["active", "inactive", "transfer"]),
  category: z.enum(["General", "OBC", "SC", "ST"]),
  scholarship: z.string().optional(),
});

export const personalInfoSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  middleName: z.string().optional(),
  lastName: z.string().min(1, "Last name is required"),
  fullName: z.string().optional(),
  dob: z.string().min(1, "Date of birth is required"),
  gender: z.enum(["male", "female", "other"]),
  bloodGroup: z.string().optional(),
  religion: z.string().optional(),
  nationality: z.string().optional(),
  motherTongue: z.string().optional(),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  citizenshipNumber: z.string().optional(),
  studentIdBarcode: z.string().optional(),
  photo: z.any().optional(),
});

export const guardianSchema = z.object({
  fatherName: z.string().min(1, "Father name is required"),
  fatherOccupation: z.string().optional(),
  fatherPhone: z.string().min(10, "Father phone is required"),
  fatherEmail: z.string().email("Invalid email").optional().or(z.literal("")),
  fatherPhoto: z.any().optional(),
  motherName: z.string().optional(),
  motherOccupation: z.string().optional(),
  motherPhone: z.string().optional(),
  motherEmail: z.string().email("Invalid email").optional().or(z.literal("")),
  motherPhoto: z.any().optional(),
  guardianSelection: z.enum(["father", "mother", "other"]),
  guardianName: z.string().optional(),
  guardianRelationship: z.string().optional(),
  guardianOccupation: z.string().optional(),
  guardianPhone: z.string().optional(),
  guardianEmail: z.string().email("Invalid email").optional().or(z.literal("")),
  guardianAddress: z.string().optional(),
  guardianPhoto: z.any().optional(),
});

export const addressSchema = z.object({
  currentProvince: z.string().min(1, "Province is required"),
  currentDistrict: z.string().min(1, "District is required"),
  currentMunicipality: z.string().min(1, "Municipality is required"),
  currentWard: z.string().min(1, "Ward is required"),
  currentStreet: z.string().min(1, "Street is required"),
  permanentSameAsCurrent: z.boolean().default(false),
  permanentProvince: z.string().optional(),
  permanentDistrict: z.string().optional(),
  permanentMunicipality: z.string().optional(),
  permanentWard: z.string().optional(),
  permanentStreet: z.string().optional(),
});

export const medicalSchema = z.object({
  bloodGroup: z.string().optional(),
  height: z.string().optional(),
  weight: z.string().optional(),
  medicalConditions: z.string().optional(),
  allergies: z.string().optional(),
  disability: z.string().optional(),
  doctorName: z.string().optional(),
  emergencyContactPerson: z.string().min(1, "Emergency contact person is required"),
  emergencyContactNumber: z.string().min(10, "Emergency contact number is required"),
});

export const academicHistorySchema = z.object({
  previousSchool: z.string().optional(),
  previousAddress: z.string().optional(),
  previousClass: z.string().optional(),
  transferCertificateNumber: z.string().optional(),
  reasonForLeaving: z.string().optional(),
});

export const hostelSchema = z.object({
  hasHostel: z.boolean().default(false),
  hostel: z.string().optional(),
  roomNumber: z.string().optional(),
  bedNumber: z.string().optional(),
});

export const transportSchema = z.object({
  usesTransport: z.boolean().default(false),
  route: z.string().optional(),
  pickupPoint: z.string().optional(),
  vehicle: z.string().optional(),
});

export const bankSchema = z.object({
  bankName: z.string().optional(),
  accountNumber: z.string().optional(),
  branch: z.string().optional(),
  ifsc: z.string().optional(),
  nationalId: z.string().optional(),
});

export const documentsSchema = z.object({
  documents: z.any().optional(),
});

export const loginSchema = z.object({
  createLogin: z.boolean().default(false),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  username: z.string().optional(),
  password: z.string().optional(),
  confirmPassword: z.string().optional(),
});

export const notesSchema = z.object({
  notes: z.string().optional(),
});

export const studentFormSchema = z.object({
  academicInfo: academicInfoSchema,
  personalInfo: personalInfoSchema,
  guardian: guardianSchema,
  address: addressSchema,
  medical: medicalSchema,
  academicHistory: academicHistorySchema,
  hostel: hostelSchema,
  transport: transportSchema,
  bank: bankSchema,
  documents: documentsSchema,
  login: loginSchema,
  notes: notesSchema,
});

export type StudentFormData = z.infer<typeof studentFormSchema>;
export type AcademicInfoData = z.infer<typeof academicInfoSchema>;
export type PersonalInfoData = z.infer<typeof personalInfoSchema>;
export type GuardianData = z.infer<typeof guardianSchema>;
export type AddressData = z.infer<typeof addressSchema>;
export type MedicalData = z.infer<typeof medicalSchema>;
export type AcademicHistoryData = z.infer<typeof academicHistorySchema>;
export type HostelData = z.infer<typeof hostelSchema>;
export type TransportData = z.infer<typeof transportSchema>;
export type BankData = z.infer<typeof bankSchema>;
export type DocumentsData = z.infer<typeof documentsSchema>;
export type LoginData = z.infer<typeof loginSchema>;
export type NotesData = z.infer<typeof notesSchema>;
