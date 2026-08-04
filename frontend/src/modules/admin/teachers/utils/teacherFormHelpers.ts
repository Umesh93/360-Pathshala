import type { TeacherFormData } from "../schemas/teacher.schema";

export const buildTeacherPayload = (formData: TeacherFormData) => {
  const fullName = `${formData.personal.firstName} ${formData.personal.middleName || ""} ${formData.personal.lastName}`.trim();

  const payload: Record<string, unknown> = {
    ...formData.employment,
    ...formData.personal,
    fullName,
    ...formData.emergency,
    ...formData.address,
    ...formData.education,
    ...formData.medical,
    ...formData.bank,
    ...formData.login,
  };

  const relationshipMap: Record<string, string> = {
    Father: "father",
    Mother: "mother",
    Spouse: "spouse",
    Sibling: "sibling",
    Relative: "relative",
    Friend: "friend",
    Other: "other",
  };

  return {
    employeeNumber: payload.teacherId || payload.employeeCode,
    employeeCode: payload.employeeCode,
    firstName: payload.firstName,
    lastName: payload.lastName,
    middleName: payload.middleName,
    fullName: payload.fullName,
    phone: payload.phone,
    alternativePhone: payload.alternativePhone,
    email: formData.personal.email,
    gender: payload.gender,
    dateOfBirth: payload.dob || undefined,
    photo: typeof payload.photo === "string" ? payload.photo : undefined,
    joiningDate: payload.joiningDate || undefined,
    employmentType: payload.employmentType,
    department: payload.department,
    designation: payload.designation,
    status: payload.status,
    reportingManager: payload.reportingManager,
    qualification: formData.education.highestQualification,
    university: payload.university,
    specialization: payload.specialization,
    passingYear: payload.passingYear,
    experience: payload.experience,
    nationality: payload.nationality,
    religion: payload.religion,
    maritalStatus: payload.maritalStatus,
    citizenshipNumber: payload.citizenshipNumber,
    passportNumber: payload.passportNumber,
    relationship: relationshipMap[payload.relationship as string] || payload.relationship,
    emergencyContactName: payload.emergencyContactName,
    emergencyContactNumber: payload.emergencyContactNumber,
    currentProvince: payload.currentProvince,
    currentDistrict: payload.currentDistrict,
    currentMunicipality: payload.currentMunicipality,
    currentWard: payload.currentWard,
    currentStreet: payload.currentStreet,
    permanentSameAsCurrent: payload.permanentSameAsCurrent,
    permanentProvince: payload.permanentProvince,
    permanentDistrict: payload.permanentDistrict,
    permanentMunicipality: payload.permanentMunicipality,
    permanentWard: payload.permanentWard,
    permanentStreet: payload.permanentStreet,
    bloodGroup: payload.bloodGroup,
    height: payload.height,
    weight: payload.weight,
    medicalConditions: payload.medicalConditions,
    allergies: payload.allergies,
    disability: payload.disability,
    bankName: payload.bankName,
    accountNumber: payload.accountNumber,
    accountHolderName: payload.accountHolderName,
    panNumber: payload.panNumber,
    documents: payload.documents,
    notes: payload.notes,
    createLogin: payload.createLogin,
    username: payload.username,
    password: payload.password,
    details: JSON.stringify(payload),
    assignments: [],
  };
};

export const validateSection = <T>(
  schema: { parse: (data: unknown) => T },
  data: unknown
): { success: true; data: T } | { success: false; errors: string[] } => {
  try {
    const parsed = schema.parse(data);
    return { success: true, data: parsed };
  } catch (error: unknown) {
    if (error instanceof Error && error.message) {
      return { success: false, errors: [error.message] };
    }
    return { success: false, errors: ["Validation failed"] };
  }
};

export const getInitials = (firstName: string, lastName: string) => {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
};

export const formatFileSize = (bytes: number) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

export const generatePassword = (length = 12) => {
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
  let password = "";
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
};
