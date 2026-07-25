import type { TeacherFormData } from "../schemas/teacher.schema";

export const buildTeacherPayload = (formData: TeacherFormData) => {
  const payload: Record<string, unknown> = {
    ...formData.employment,
    ...formData.academicAssignment,
    ...formData.personal,
    fullName: formData.personal.fullName || `${formData.personal.firstName} ${formData.personal.middleName || ""} ${formData.personal.lastName}`.trim(),
    ...formData.emergency,
    ...formData.address,
    ...formData.education,
    ...formData.medical,
    ...formData.bank,
    ...formData.social,
    ...formData.login,
    bio: formData.notes.bio,
    teachingPhilosophy: formData.notes.teachingPhilosophy,
    achievements: formData.notes.achievements,
    awards: formData.notes.awards,
    remarks: formData.notes.remarks,
  };

  return payload;
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
