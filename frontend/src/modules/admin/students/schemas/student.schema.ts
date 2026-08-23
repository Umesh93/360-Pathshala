import { z } from "zod";

export const academicInfoSchema = z.object({
  academicYear: z.string().min(1, "Academic year is required"),
  medium: z.enum(["English", "Nepali"]).optional(),
  admissionNo: z.string().min(1, "Admission number is required"),
  admissionDate: z.string().min(1, "Admission date is required"),
  class: z.string().min(1, "Class is required"),
  className: z.string().optional(),
  section: z.string().min(1, "Section is required"),
  sectionName: z.string().optional(),
  rollNumber: z.string().min(1, "Roll number is required"),
  house: z.string().optional(),
  status: z.enum(["active", "inactive", "transfer"]),
  scholarship: z.string().optional(),
});

export const personalInfoSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  middleName: z.string().optional(),
  lastName: z.string().min(1, "Last name is required"),
  dob: z.string().min(1, "Date of birth is required"),
  gender: z.enum(["male", "female", "other"]),
  bloodGroup: z.string().optional(),
  religion: z.string().min(1, "Religion is required"),
  caste: z.string().min(1, "Caste is required"),
  nationality: z.string().default("Nepalese"),
  motherTongue: z.string().optional(),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  citizenshipNumber: z.string().optional(),
  studentIdBarcode: z.string().optional(),
  photo: z.any().optional(),
});

export const guardianSchema = z
  .object({
    fatherFirstName: z.string().optional(),
    fatherMiddleName: z.string().optional(),
    fatherLastName: z.string().optional(),
    fatherOccupation: z.string().optional(),
    fatherPhone: z.string().optional(),
    fatherEmail: z.string().email("Invalid email").optional().or(z.literal("")),
    fatherPhoto: z.any().optional(),
    fatherCitizenship: z.string().optional(),
    motherFirstName: z.string().optional(),
    motherMiddleName: z.string().optional(),
    motherLastName: z.string().optional(),
    motherOccupation: z.string().optional(),
    motherPhone: z.string().optional(),
    motherEmail: z.string().email("Invalid email").optional().or(z.literal("")),
    motherPhoto: z.any().optional(),
    motherCitizenship: z.string().optional(),
    guardianSelection: z.enum(["father", "mother", "other"]).optional(),
    guardianName: z.string().optional(),
    guardianRelationship: z.string().optional(),
    guardianOccupation: z.string().optional(),
    guardianPhone: z.string().optional(),
    guardianEmail: z
      .string()
      .email("Invalid email")
      .optional()
      .or(z.literal("")),
    guardianAddress: z.string().optional(),
    guardianCitizenship: z.string().optional(),
  })
  .superRefine((value, context) => {
    const required: [keyof typeof value, string][] = [
      ["fatherFirstName", "Father first name is required"],
      ["fatherLastName", "Father last name is required"],
      ["fatherPhone", "Father phone is required"],
      ["guardianSelection", "Guardian selection is required"],
    ];
    if (value.guardianSelection === "other")
      required.push(
        ["guardianName", "Guardian name is required"],
        ["guardianRelationship", "Guardian relationship is required"],
        ["guardianPhone", "Guardian phone is required"],
      );
    required.forEach(([field, message]) => {
      if (!String(value[field] ?? "").trim())
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: [field],
          message,
        });
    });
  });

export const addressSchema = z.object({
  currentProvince: z.string().min(1, "Province is required"),
  currentProvinceName: z.string().optional(),
  currentDistrict: z.string().min(1, "District is required"),
  currentDistrictName: z.string().optional(),
  currentMunicipality: z.string().min(1, "Municipality is required"),
  currentMunicipalityName: z.string().optional(),
  currentWard: z
    .string()
    .min(1, "Ward number is required")
    .refine((value) => {
      const ward = Number(value);
      return Number.isInteger(ward) && ward >= 1 && ward <= 35;
    }, "Ward number must be between 1 and 35"),
  currentWardNumber: z.string().optional(),
  currentStreet: z.string().optional(),
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
  medicalConditionsOther: z.string().optional(),
  allergies: z.string().optional(),
  disability: z.string().optional(),
  emergencyContactPerson: z
    .string()
    .min(1, "Emergency contact person is required"),
  emergencyContactNumber: z
    .string()
    .min(10, "Emergency contact number is required"),
});

export const academicHistorySchema = z.object({
  previousSchool: z.string().optional(),
  previousAddress: z.string().optional(),
  previousClass: z.string().optional(),
  transferCertificateNumber: z.string().optional(),
  reasonForLeaving: z.string().optional(),
  emisId: z.string().optional(),
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

export const documentsSchema = z.object({
  documents: z.any().optional(),
  documentCategories: z.array(z.string()).optional(),
});

export const loginSchema = z
  .object({
    createLogin: z.boolean().default(false),
    email: z.string().email("Invalid email").optional().or(z.literal("")),
    username: z.string().optional(),
    password: z.string().optional(),
    confirmPassword: z.string().optional(),
  })
  .superRefine((value, context) => {
    if (!value.createLogin) return;
    if (!value.email?.trim()) context.addIssue({ code: z.ZodIssueCode.custom, path: ["email"], message: "Login email is required" });
    if (!value.username?.trim()) context.addIssue({ code: z.ZodIssueCode.custom, path: ["username"], message: "Username is required" });
    if (!value.password || value.password.length < 8 || value.password.length > 128)
      context.addIssue({ code: z.ZodIssueCode.custom, path: ["password"], message: "Password must be between 8 and 128 characters" });
    if (value.password !== value.confirmPassword)
      context.addIssue({ code: z.ZodIssueCode.custom, path: ["confirmPassword"], message: "Passwords do not match" });
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
export type DocumentsData = z.infer<typeof documentsSchema>;
export type LoginData = z.infer<typeof loginSchema>;
export type NotesData = z.infer<typeof notesSchema>;
