import { z } from "zod";

export const employmentSchema = z.object({
  teacherId: z.string().min(1, "Teacher ID is required"),
  employeeCode: z.string().min(1, "Employee Code is required"),
  joiningDate: z.string().min(1, "Joining date is required"),
  employmentType: z.enum([
    "permanent",
    "contract",
    "part-time",
    "visiting",
    "intern",
  ]),
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
  gender: z.enum(["male", "female", "other"]),
  dob: z.string().min(1, "Date of birth is required"),
  nationality: z.string().optional(),
  religion: z.string().optional(),
  maritalStatus: z.string().optional(),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  alternativePhone: z.string().optional(),
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  citizenshipNumber: z.string().optional(),
  passportNumber: z.string().optional(),
});

export const emergencySchema = z.object({
  emergencyContactName: z.string().min(1, "Emergency contact name is required"),
  relationship: z.string().min(1, "Relationship is required"),
  emergencyContactNumber: z
    .string()
    .min(10, "Phone number must be at least 10 digits"),
  alternativePhone: z.string().optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
});

export const addressSchema = z.object({
  currentProvince: z.string().min(1, "Province is required"),
  currentDistrict: z.string().min(1, "District is required"),
  currentMunicipality: z.string().min(1, "Municipality is required"),
  currentWard: z
    .string()
    .min(1, "Ward number is required")
    .refine((value) => {
      const ward = Number(value);
      return Number.isInteger(ward) && ward >= 1 && ward <= 35;
    }, "Ward number must be between 1 and 35"),
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
});

export const medicalSchema = z.object({
  bloodGroup: z.string().optional(),
  height: z.string().optional(),
  weight: z.string().optional(),
  medicalConditions: z.string().optional(),
  allergies: z.string().optional(),
  disability: z.string().optional(),
  emergencyContactName: z.string().optional(),
  emergencyContactNumber: z.string().optional(),
});

export const bankSchema = z.object({
  bankName: z.string().optional(),
  accountNumber: z.string().optional(),
  accountHolderName: z.string().optional(),
  panNumber: z.string().optional(),
  documents: z.any().optional(),
  photo: z.any().optional(),
  notes: z.string().optional(),
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
}).superRefine((value, context) => {
  if (!value.createLogin) return;
  if (!value.username?.trim()) context.addIssue({ code: z.ZodIssueCode.custom, path: ["username"], message: "Username is required" });
  if (!value.email?.trim()) context.addIssue({ code: z.ZodIssueCode.custom, path: ["email"], message: "Email is required" });
  if (!value.password || value.password.length < 8 || value.password.length > 128)
    context.addIssue({ code: z.ZodIssueCode.custom, path: ["password"], message: "Password must be between 8 and 128 characters" });
  if (value.password !== value.confirmPassword)
    context.addIssue({ code: z.ZodIssueCode.custom, path: ["confirmPassword"], message: "Passwords do not match" });
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
