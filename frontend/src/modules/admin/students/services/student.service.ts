import type {
  Student,
  StudentEditLookups,
  StudentRequest,
  StudentResponse,
  PaginatedResponse,
  AttendanceSummary,
  FeeRecord,
  ExamResult,
} from "../types/student.types";
import type { StudentFormData } from "../schemas/student.schema";
import api from "../../../../services/api";

const mapStudent = (item: StudentResponse | Record<string, unknown>): Student => {
  const record = item as Record<string, unknown>;
  const guardian = (record.guardian as Record<string, unknown>) || {};
  const details = (record.details as Record<string, unknown>) || {};
  return {
    id: (record.id as number),
    admissionNo: (record.admissionNo as string) ?? "",
    firstName: (record.firstName as string),
    lastName: (record.lastName as string),
    rollNumber: (record.rollNumber as string) ?? "",
    class: (record.className as string) ?? "",
    className: (record.className as string) ?? "",
    section: (record.sectionName as string) ?? "",
    sectionName: (record.sectionName as string) ?? "",
    classId: (record.classId as number) ?? undefined,
    sectionId: (record.sectionId as number) ?? undefined,
    guardianId: (record.guardianId as number) ?? undefined,
    guardianName: (record.guardianName as string) ?? (guardian.guardianName as string) ?? "",
    gender: (record.gender as Student["gender"]) || "other",
    dob: (record.dob as string) ?? "",
    phone: ((details.studentPhone as string) ?? (guardian.phone as string) ?? (record.phone as string) ?? ""),
    email: ((details.studentEmail as string) ?? (guardian.email as string) ?? (record.email as string) ?? ""),
    address: ((guardian.address as string) ?? (record.address as string) ?? ""),
    status: ["active", "inactive", "transferred", "graduated", "suspended", "dropped"].includes(record.status as string)
      ? (record.status as Student["status"])
      : "inactive",
    photo: (details.photo as string) ?? (record.photo as string) ?? "",
    admissionDate: (details.admissionDate as string) ?? (record.admissionDate as string) ?? "",
    guardian: {
      fatherName: (guardian.fatherName as string) ?? "",
      motherName: (guardian.motherName as string) ?? "",
      guardianName: (guardian.guardianName as string) ?? "",
      relationship: (guardian.relationship as string) ?? "",
      occupation: (guardian.occupation as string) ?? "",
      phone: (guardian.phone as string) ?? "",
      email: (guardian.email as string) ?? "",
      address: (guardian.address as string) ?? "",
      fatherOccupation: (guardian.fatherOccupation as string) ?? "",
      fatherPhone: (guardian.fatherPhone as string) ?? "",
      fatherEmail: (guardian.fatherEmail as string) ?? "",
      motherOccupation: (guardian.motherOccupation as string) ?? "",
      motherPhone: (guardian.motherPhone as string) ?? "",
      motherEmail: (guardian.motherEmail as string) ?? "",
    },
    classTeacher: (record.classTeacher as string) ?? "",
    subjects: (record.subjects as string[]) ?? [],
    province: (record.province as string) ?? "",
    provinceId: (record.provinceId as number) ?? undefined,
    district: (record.district as string) ?? "",
    districtId: (record.districtId as number) ?? undefined,
    municipality: (record.municipality as string) ?? "",
    municipalityId: (record.municipalityId as number) ?? undefined,
    ward: (record.ward as number) ?? undefined,
    wardId: (record.wardId as number) ?? undefined,
    street: (record.street as string) ?? "",
    academicYear: (details.academicYear as string) ?? "",
    medium: (details.medium as string) ?? "",
    house: (details.house as string) ?? "",
    scholarship: (details.scholarship as string) ?? "",
    middleName: (details.middleName as string) ?? "",
    bloodGroup: (details.bloodGroup as string) ?? "",
    religion: (details.religion as string) ?? "",
    caste: (details.caste as string) ?? "",
    nationality: (details.nationality as string) ?? "",
    motherTongue: (details.motherTongue as string) ?? "",
    citizenshipNumber: (details.citizenshipNumber as string) ?? "",
    emisId: (details.emisId as string) ?? "",
    studentIdBarcode: (details.studentIdBarcode as string) ?? "",
    medicalBloodGroup: (details.medicalBloodGroup as string) ?? "",
    height: (details.height as string) ?? "",
    weight: (details.weight as string) ?? "",
    medicalConditions: (details.medicalConditions as string) ?? "",
    medicalConditionsOther: (details.medicalConditionsOther as string) ?? "",
    allergies: (details.allergies as string) ?? "",
    disability: (details.disability as string) ?? "",
    emergencyContactPerson: (details.emergencyContactPerson as string) ?? "",
    emergencyContactNumber: (details.emergencyContactNumber as string) ?? "",
    previousSchool: (details.previousSchool as string) ?? "",
    previousAddress: (details.previousAddress as string) ?? "",
    previousClass: (details.previousClass as string) ?? "",
    transferCertificateNumber: (details.transferCertificateNumber as string) ?? "",
    reasonForLeaving: (details.reasonForLeaving as string) ?? "",
    hasHostel: (details.hasHostel as boolean) ?? false,
    hostel: (details.hostel as string) ?? "",
    roomNumber: (details.roomNumber as string) ?? "",
    bedNumber: (details.bedNumber as string) ?? "",
    usesTransport: (details.usesTransport as boolean) ?? false,
    route: (details.route as string) ?? "",
    transport: (details.route as string) ?? "",
    pickupPoint: (details.pickupPoint as string) ?? "",
    vehicle: (details.vehicle as string) ?? "",
    documents: (details.documents as string) ?? "",
    documentCategories: (details.documentCategories as string) ?? "",
    notes: (details.notes as string) ?? "",
  };
};

const buildStudentPayload = (formData: StudentFormData): StudentRequest => {
  const flat: Record<string, unknown> = {
    ...formData.academicInfo, ...formData.personalInfo, ...formData.guardian, ...formData.address,
    ...formData.medical, ...formData.academicHistory, ...formData.hostel, ...formData.transport,
    ...formData.documents, ...formData.login, notes: formData.notes?.notes,
  };
  const guardianSelection = flat.guardianSelection as string;
  const selectedPhone = guardianSelection === "father" ? flat.fatherPhone : guardianSelection === "mother" ? flat.motherPhone : flat.guardianPhone;
  const selectedName = guardianSelection === "father" ? flat.fatherName : guardianSelection === "mother" ? flat.motherName : flat.guardianName;
  return {
    admissionNumber: flat.admissionNo, rollNumber: flat.rollNumber, firstName: flat.firstName, lastName: flat.lastName,
    dateOfBirth: flat.dob, gender: flat.gender, parentId: typeof flat.guardianId === "number" ? flat.guardianId : null,
    classId: flat.class ? Number(flat.class) : null, sectionId: flat.section ? Number(flat.section) : null,
    province: flat.currentProvinceName || undefined, district: flat.currentDistrictName || undefined,
    municipality: flat.currentMunicipalityName || flat.currentMunicipality || undefined, ward: flat.currentWardNumber || flat.currentWard ? Number(flat.currentWardNumber || flat.currentWard) : null,
    street: flat.currentStreet || undefined, fatherName: flat.fatherName || undefined, motherName: flat.motherName || undefined,
    guardianName: selectedName && selectedName !== flat.fatherName ? selectedName : undefined, relationship: flat.guardianRelationship || undefined,
    occupation: flat.guardianOccupation || undefined, guardianPhone: selectedPhone || undefined, guardianEmail: flat.guardianEmail || undefined,
    guardianAddress: flat.guardianAddress || undefined, academicYear: flat.academicYear, medium: flat.medium, admissionDate: flat.admissionDate,
    house: flat.house, status: flat.status, scholarship: flat.scholarship, middleName: flat.middleName, bloodGroup: flat.bloodGroup,
    religion: flat.religion, caste: flat.caste, nationality: flat.nationality, motherTongue: flat.motherTongue, studentPhone: flat.phone,
    studentEmail: flat.email, citizenshipNumber: flat.citizenshipNumber, emisId: flat.emisId, studentIdBarcode: flat.studentIdBarcode, photo: flat.photo,
    fatherOccupation: flat.fatherOccupation, fatherPhone: flat.fatherPhone, fatherEmail: flat.fatherEmail, motherOccupation: flat.motherOccupation,
    motherPhone: flat.motherPhone, motherEmail: flat.motherEmail, medicalBloodGroup: flat.bloodGroup, height: flat.height, weight: flat.weight,
    medicalConditions: flat.medicalConditions, medicalConditionsOther: flat.medicalConditionsOther, allergies: flat.allergies, disability: flat.disability,
    emergencyContactPerson: flat.emergencyContactPerson, emergencyContactNumber: flat.emergencyContactNumber, previousSchool: flat.previousSchool,
    previousAddress: flat.previousAddress, previousClass: flat.previousClass, transferCertificateNumber: flat.transferCertificateNumber,
    reasonForLeaving: flat.reasonForLeaving, hasHostel: flat.hasHostel, hostel: flat.hostel, roomNumber: flat.roomNumber, bedNumber: flat.bedNumber,
    usesTransport: flat.usesTransport, route: flat.route, pickupPoint: flat.pickupPoint, vehicle: flat.vehicle,
    documents: typeof flat.documents === "string" ? flat.documents : undefined,
    documentCategories: Array.isArray(flat.documentCategories) ? flat.documentCategories.join(",") : flat.documentCategories,
    notes: flat.notes,
  };
};

export const getStudents = async (
  page = 1,
  limit = 10,
  search = "",
  classFilter = "",
  sectionFilter = "",
  statusFilter = ""
): Promise<PaginatedResponse<Student>> => {
  const response = await api.get("/people/students", {
    params: {
      page: page - 1,
      size: limit,
      search: search || undefined,
      class: classFilter || undefined,
      section: sectionFilter || undefined,
      status: statusFilter || undefined,
    },
  });

  const data = response.data;

  return {
    data: data.content.map(mapStudent),
    total: data.totalElements,
    page: data.number + 1,
    limit: data.size,
    totalPages: data.totalPages,
  };
};

export const getStudentById = async (id: number): Promise<Student> => {
  const response = await api.get<StudentResponse>(`/people/students/${id}`);
  return mapStudent(response.data);
};

export const createStudent = async (formData: StudentFormData): Promise<Student> => {
  const payload = buildStudentPayload(formData);
  const response = await api.post("/people/students", payload);
  return mapStudent(response.data);
};

export const updateStudent = async (
  id: number,
  formData: StudentFormData
): Promise<Student> => {
  const payload = buildStudentPayload(formData);

  const response = await api.put(`/people/students/${id}`, payload);
  return mapStudent(response.data);
};

export const deleteStudent = async (id: number): Promise<boolean> => {
  await api.delete(`/people/students/${id}`);
  return true;
};

export const bulkDeleteStudents = async (ids: number[]): Promise<boolean> => {
  await Promise.all(ids.map((id) => deleteStudent(id)));
  return true;
};

export const getStudentAttendance = async (): Promise<AttendanceSummary> => {
  try {
    const response = await api.get("/people/students/attendance/summary");
    return response.data as AttendanceSummary;
  } catch {
    return {
      total: 0,
      present: 0,
      absent: 0,
      late: 0,
      leave: 0,
      halfDay: 0,
      percentage: 0,
      monthlyData: [],
    };
  }
};

export const getStudentFees = async (): Promise<FeeRecord[]> => {
  try {
    const response = await api.get("/people/students/fees");
    return response.data as FeeRecord[];
  } catch {
    return [];
  }
};

export const getStudentResults = async (): Promise<ExamResult[]> => {
  try {
    const response = await api.get("/people/students/results");
    return response.data as ExamResult[];
  } catch {
    return [];
  }
};

export const generateAdmissionNo = async (): Promise<string> => {
  const response = await api.get("/people/students/next-admission-no");
  return response.data.admissionNo as string;
};

export const getNextRollNumber = async (
  classId: string,
  sectionId: string
): Promise<{ nextRollNumber: number }> => {
  const response = await api.get(`/people/students/next-roll-number`, {
    params: { classId, sectionId },
  });
  return response.data as { nextRollNumber: number };
};

export const getClasses = async (): Promise<{ id: number; name: string }[]> => {
  try {
    const response = await api.get("/academic/classes", {
      params: { page: 0, size: 100 },
    });
    return (response.data.content as Record<string, unknown>[]).map((c) => ({
      id: (c.id as number) ?? 0,
      name: (c.name as string) ?? "",
    }));
  } catch {
    return [];
  }
};

export const getGuardians = async (): Promise<{ id: number; name: string }[]> => {
  try {
    const response = await api.get("/people/students/guardians", { params: { page: 0, size: 1000 } });
    return (response.data.content as Record<string, unknown>[]).map((guardian) => ({
      id: guardian.id as number,
      name: (guardian.fullName as string) ?? "",
    }));
  } catch {
    return [];
  }
};

export const getSections = async (classId?: number): Promise<{ id: number; name: string; classId: number }[]> => {
  try {
    const response = await api.get("/academic/sections", {
      params: { page: 0, size: 100, classId },
    });
    return (response.data.content as Record<string, unknown>[]).map((s) => ({
      id: (s.id as number) ?? 0,
      name: (s.name as string) ?? "",
      classId: (s.classId as number) ?? 0,
    }));
  } catch {
    return [];
  }
};

export const getProvinces = async (): Promise<{ id: number; name: string }[]> => {
  try {
    const response = await api.get("/people/students/locations/provinces");
    return response.data as { id: number; name: string }[];
  } catch {
    return [];
  }
};

export const getDistricts = async (
  provinceId?: number
): Promise<{ id: number; name: string; provinceId: number }[]> => {
  try {
    const response = await api.get("/people/students/locations/districts", {
      params: provinceId ? { provinceId } : undefined,
    });
    return response.data as { id: number; name: string; provinceId: number }[];
  } catch {
    return [];
  }
};

export const loadStudentEditData = async (
  id: number
): Promise<{ student: Student; lookups: StudentEditLookups }> => {
  const classes = await getClasses();
  const guardians = await getGuardians();
  const provinces = await getProvinces();
  const districts = await getDistricts();
  const student = await getStudentById(id);
  const sections = student.classId ? await getSections(student.classId) : [];

  return {
    student,
    lookups: { classes, sections, guardians, provinces, districts },
  };
};

export const uploadDocuments = async (files: File[]): Promise<string[]> => {
  try {
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));
    const response = await api.post("/people/students/documents/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return (response.data.urls as string[]) || [];
  } catch {
    return files.map((file) => URL.createObjectURL(file));
  }
};

export const exportStudentsCSV = async (): Promise<Blob> => {
  const response = await api.get("/people/students/export/csv", {
    responseType: "blob",
  });
  return response.data as Blob;
};

export const exportStudentsPDF = async (): Promise<Blob> => {
  const response = await api.get("/people/students/export/pdf", {
    responseType: "blob",
  });
  return response.data as Blob;
};

export const importStudents = async (file: File): Promise<{ imported: number; failed: number }> => {
  const formData = new FormData();
  formData.append("file", file);
  const response = await api.post("/people/students/import", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data as { imported: number; failed: number };
};
