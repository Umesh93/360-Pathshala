import type { Student, PaginatedResponse, AttendanceSummary, FeeRecord, ExamResult } from "../types/student.types";
import api from "../../../../services/api";

const mockStudents: Student[] = [
  {
    id: 1,
    admissionNo: "ADM-2024-001",
    firstName: "Aarav",
    lastName: "Khadka",
    rollNumber: "10A-01",
    class: "Grade 10",
    section: "A",
    gender: "male",
    dob: "2008-05-15",
    bloodGroup: "A+",
    phone: "9800000001",
    email: "aarav.k@example.com",
    address: "Kathmandu, Nepal",
    category: "General",
    religion: "Hindu",
    nationality: "Nepali",
    status: "active",
    admissionDate: "2024-01-10",
    house: "Red",
    previousSchool: "ABC School",
    transport: "Bus",
    hostel: "No",
    guardian: {
      fatherName: "Rajesh Khadka",
      motherName: "Sita Khadka",
      guardianName: "Rajesh Khadka",
      relationship: "Father",
      occupation: "Business",
      phone: "9800000001",
      email: "rajesh.k@example.com",
      address: "Kathmandu, Nepal",
    },
    classTeacher: "John Doe",
    subjects: ["Math", "Science", "English"],
  },
  {
    id: 2,
    admissionNo: "ADM-2024-002",
    firstName: "Sita",
    lastName: "Gurung",
    rollNumber: "10A-02",
    class: "Grade 10",
    section: "A",
    gender: "female",
    dob: "2008-08-22",
    bloodGroup: "B+",
    phone: "9800000002",
    email: "sita.g@example.com",
    address: "Pokhara, Nepal",
    category: "General",
    religion: "Buddhist",
    nationality: "Nepali",
    status: "active",
    admissionDate: "2024-01-12",
    house: "Blue",
    previousSchool: "XYZ School",
    transport: "Bus",
    hostel: "No",
    guardian: {
      fatherName: "Mohan Gurung",
      motherName: "Kamala Gurung",
      guardianName: "Mohan Gurung",
      relationship: "Father",
      occupation: "Teacher",
      phone: "9800000002",
      email: "mohan.g@example.com",
      address: "Pokhara, Nepal",
    },
    classTeacher: "Jane Smith",
    subjects: ["Math", "Science", "English"],
  },
  {
    id: 3,
    admissionNo: "ADM-2024-003",
    firstName: "Ram",
    lastName: "Sharma",
    rollNumber: "9B-03",
    class: "Grade 9",
    section: "B",
    gender: "male",
    dob: "2009-03-10",
    bloodGroup: "O+",
    phone: "9800000003",
    email: "ram.s@example.com",
    address: "Lalitpur, Nepal",
    category: "OBC",
    religion: "Hindu",
    nationality: "Nepali",
    status: "inactive",
    admissionDate: "2024-01-15",
    house: "Green",
    previousSchool: "LM School",
    transport: "None",
    hostel: "No",
    guardian: {
      fatherName: "Krishna Sharma",
      motherName: "Radha Sharma",
      guardianName: "Krishna Sharma",
      relationship: "Father",
      occupation: "Engineer",
      phone: "9800000003",
      email: "krishna.s@example.com",
      address: "Lalitpur, Nepal",
    },
    classTeacher: "Robert Brown",
    subjects: ["Math", "Science", "Social"],
  },
  {
    id: 4,
    admissionNo: "ADM-2024-004",
    firstName: "Maya",
    lastName: "Tamang",
    rollNumber: "8C-01",
    class: "Grade 8",
    section: "C",
    gender: "female",
    dob: "2010-11-05",
    bloodGroup: "AB+",
    phone: "9800000004",
    email: "maya.t@example.com",
    address: "Bhaktapur, Nepal",
    category: "ST",
    religion: "Buddhist",
    nationality: "Nepali",
    status: "active",
    admissionDate: "2024-01-20",
    house: "Yellow",
    previousSchool: "Sunshine School",
    transport: "Bus",
    hostel: "Yes",
    guardian: {
      fatherName: "Nima Tamang",
      motherName: "Pemba Tamang",
      guardianName: "Nima Tamang",
      relationship: "Father",
      occupation: "Farmer",
      phone: "9800000004",
      email: "nima.t@example.com",
      address: "Bhaktapur, Nepal",
    },
    classTeacher: "Emily Davis",
    subjects: ["Math", "English", "Science"],
  },
  {
    id: 5,
    admissionNo: "ADM-2024-005",
    firstName: "Kiran",
    lastName: "Thapa",
    rollNumber: "9A-05",
    class: "Grade 9",
    section: "A",
    gender: "male",
    dob: "2009-07-18",
    bloodGroup: "A-",
    phone: "9800000005",
    email: "kiran.t@example.com",
    address: "Kathmandu, Nepal",
    category: "General",
    religion: "Hindu",
    nationality: "Nepali",
    status: "active",
    admissionDate: "2024-02-01",
    house: "Red",
    previousSchool: "Everest School",
    transport: "Van",
    hostel: "No",
    guardian: {
      fatherName: "Bikash Thapa",
      motherName: "Sunita Thapa",
      guardianName: "Bikash Thapa",
      relationship: "Father",
      occupation: "Doctor",
      phone: "9800000005",
      email: "bikash.t@example.com",
      address: "Kathmandu, Nepal",
    },
    classTeacher: "John Doe",
    subjects: ["Math", "Science", "English"],
  },
];

const mockAttendance: AttendanceSummary = {
  total: 120,
  present: 108,
  absent: 5,
  late: 4,
  leave: 2,
  halfDay: 1,
  percentage: 90,
  monthlyData: [
    { month: "Jan", present: 20, absent: 2 },
    { month: "Feb", present: 22, absent: 1 },
    { month: "Mar", present: 21, absent: 3 },
    { month: "Apr", present: 23, absent: 2 },
    { month: "May", present: 22, absent: 1 },
    { month: "Jun", present: 20, absent: 2 },
  ],
};

const mockFees: FeeRecord[] = [
  {
    id: 1,
    studentId: 1,
    feeType: "Tuition Fee",
    amount: 15000,
    paidAmount: 15000,
    dueDate: "2026-07-10",
    status: "paid",
    paymentHistory: [
      {
        id: 1,
        date: "2026-07-01",
        amount: 15000,
        method: "Cash",
        receiptNo: "RCP-001",
      },
    ],
  },
  {
    id: 2,
    studentId: 1,
    feeType: "Transport Fee",
    amount: 2000,
    paidAmount: 1000,
    dueDate: "2026-07-15",
    status: "pending",
    paymentHistory: [
      {
        id: 2,
        date: "2026-07-01",
        amount: 1000,
        method: "Cash",
        receiptNo: "RCP-002",
      },
    ],
  },
];

const mockResults: ExamResult[] = [
  {
    id: 1,
    examId: 1,
    examName: "Mid-Term Exam",
    studentId: 1,
    subjects: [
      { subject: "Math", marks: 92, fullMarks: 100, grade: "A+" },
      { subject: "Science", marks: 88, fullMarks: 100, grade: "A" },
      { subject: "English", marks: 85, fullMarks: 100, grade: "A" },
    ],
    totalMarks: 300,
    obtainedMarks: 265,
    percentage: 88.33,
    grade: "A+",
    division: "First",
    rank: 2,
  },
];

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
    },
  });

  const data = response.data;
  const mapStudent = (item: any): Student => ({
    id: item.id,
    admissionNo: item.admissionNo ?? "",
    firstName: item.firstName,
    lastName: item.lastName,
    rollNumber: item.rollNumber ?? "",
    class: item.className ?? "",
    section: item.sectionName ?? "",
    gender: (item.gender as Student["gender"]) || "other",
    dob: item.dob ?? "",
    bloodGroup: "",
    phone: item.guardian?.phone ?? "",
    email: item.guardian?.email ?? "",
    address: item.guardian?.address ?? "",
    category: "",
    religion: "",
    nationality: "",
    status: (item.status === "active" || item.status === "inactive") ? item.status : "inactive",
    photo: "",
    admissionDate: "",
    house: "",
    previousSchool: "",
    transport: "",
    hostel: "",
    medicalConditions: "",
    allergies: "",
    disability: "",
    doctor: "",
    emergencyContact: "",
    guardian: {
      fatherName: item.guardian?.fatherName ?? "",
      motherName: item.guardian?.motherName ?? "",
      guardianName: item.guardian?.guardianName ?? "",
      relationship: item.guardian?.relationship ?? "",
      occupation: item.guardian?.occupation ?? "",
      phone: item.guardian?.phone ?? "",
      email: item.guardian?.email ?? "",
      address: item.guardian?.address ?? "",
    },
    classTeacher: "",
    subjects: [],
  });

  return {
    data: data.content.map(mapStudent),
    total: data.totalElements,
    page: data.number + 1,
    limit: data.size,
    totalPages: data.totalPages,
  };
};

export const getStudentById = async (id: number): Promise<Student | undefined> => {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return mockStudents.find((s) => s.id === id);
};

export const createStudent = async (formData: any): Promise<Student> => {
  await new Promise((resolve) => setTimeout(resolve, 500));
  const flat: Record<string, unknown> = {
    ...formData.academicInfo,
    ...formData.personalInfo,
    ...formData.guardian,
    ...formData.address,
    ...formData.medical,
    ...formData.academicHistory,
    ...formData.hostel,
    ...formData.transport,
    ...formData.bank,
    ...formData.login,
    notes: formData.notes.notes,
  };
  const newStudent = { ...flat, id: Date.now() } as Student;
  mockStudents.push(newStudent);
  return newStudent;
};

export const updateStudent = async (
  id: number,
  student: Partial<Student>
): Promise<Student | undefined> => {
  await new Promise((resolve) => setTimeout(resolve, 500));
  const index = mockStudents.findIndex((s) => s.id === id);
  if (index === -1) return undefined;
  mockStudents[index] = { ...mockStudents[index], ...student };
  return mockStudents[index];
};

export const deleteStudent = async (id: number): Promise<boolean> => {
  await new Promise((resolve) => setTimeout(resolve, 500));
  const index = mockStudents.findIndex((s) => s.id === id);
  if (index === -1) return false;
  mockStudents.splice(index, 1);
  return true;
};

export const getStudentAttendance = async (): Promise<AttendanceSummary> => {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return mockAttendance;
};

export const getStudentFees = async (): Promise<FeeRecord[]> => {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return mockFees;
};

export const getStudentResults = async (): Promise<ExamResult[]> => {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return mockResults;
};

export const generateAdmissionNo = async (): Promise<string> => {
  await new Promise((resolve) => setTimeout(resolve, 300));
  const year = new Date().getFullYear();
  const count = mockStudents.length + 1;
  return `ADM-${year}-${String(count).padStart(3, "0")}`;
};

export const getNextRollNumber = async (
  classId: string,
  sectionId: string
): Promise<{ nextRollNumber: number }> => {
  await new Promise((resolve) => setTimeout(resolve, 300));
  const matchingStudents = mockStudents.filter(
    (s) => s.class === classId && s.section === sectionId
  );
  const maxRoll = matchingStudents.reduce((max, s) => {
    const num = parseInt(s.rollNumber, 10);
    return num > max ? num : max;
  }, 0);
  return { nextRollNumber: maxRoll + 1 };
};

export const getDistricts = async (
  provinceId: number
): Promise<{ id: number; name: string }[]> => {
  await new Promise((resolve) => setTimeout(resolve, 300));
  const districtMap: Record<number, { id: number; name: string }[]> = {
    1: [
      { id: 1, name: "Taplejung" },
      { id: 2, name: "Panchthar" },
      { id: 3, name: "Ilam" },
      { id: 4, name: "Jhapa" },
      { id: 5, name: "Morang" },
      { id: 6, name: "Sunsari" },
      { id: 7, name: "Dhankuta" },
      { id: 8, name: "Terhathum" },
      { id: 9, name: "Sankhuwasabha" },
      { id: 10, name: "Bhojpur" },
      { id: 11, name: "Khotang" },
      { id: 12, name: "Okhaldhunga" },
      { id: 13, name: "Udayapur" },
    ],
    2: [
      { id: 14, name: "Siraha" },
      { id: 15, name: "Saptari" },
      { id: 16, name: "Udayapur" },
      { id: 17, name: "Mahottari" },
      { id: 18, name: "Dhanusha" },
      { id: 19, name: "Sarlahi" },
      { id: 20, name: "Rautahat" },
      { id: 21, name: "Bara" },
      { id: 22, name: "Parsa" },
    ],
    3: [
      { id: 23, name: "Kathmandu" },
      { id: 24, name: "Lalitpur" },
      { id: 25, name: "Bhaktapur" },
      { id: 26, name: "Rasuwa" },
      { id: 27, name: "Nuwakot" },
      { id: 28, name: "Dhading" },
      { id: 29, name: "Makwanpur" },
      { id: 30, name: "Chitwan" },
      { id: 31, name: "Nawalparasi" },
      { id: 32, name: "Rupandehi" },
    ],
    4: [
      { id: 33, name: "Gorkha" },
      { id: 34, name: "Tanahun" },
      { id: 35, name: "Syangja" },
      { id: 36, name: "Kaski" },
      { id: 37, name: "Lamjung" },
      { id: 38, name: "Nuwakot" },
      { id: 39, name: "Dhading" },
    ],
    5: [
      { id: 40, name: "Palpa" },
      { id: 41, name: "Nawalparasi" },
      { id: 42, name: "Arghakhanchi" },
      { id: 43, name: " Gulmi" },
      { id: 44, name: "Pyuthan" },
      { id: 45, name: "Rolpa" },
      { id: 46, name: "Rukum" },
      { id: 47, name: "Salyan" },
    ],
    6: [
      { id: 48, name: "Jumla" },
      { id: 49, name: "Kalikot" },
      { id: 50, name: "Dailekh" },
      { id: 51, name: "Jajarkot" },
      { id: 52, name: "Rukum" },
      { id: 53, name: "Salyan" },
      { id: 54, name: "Surkhet" },
    ],
    7: [
      { id: 55, name: "Darchula" },
      { id: 56, name: "Bajhang" },
      { id: 57, name: "Bajura" },
      { id: 58, name: "Doti" },
      { id: 59, name: "Achham" },
      { id: 60, name: "Baitadi" },
      { id: 61, name: "Dadeldhura" },
    ],
  };
  return districtMap[provinceId] || [];
};

export const getMunicipalities = async (
  districtId: number
): Promise<{ id: number; name: string }[]> => {
  await new Promise((resolve) => setTimeout(resolve, 300));
  const municipalityMap: Record<number, { id: number; name: string }[]> = {
    1: [{ id: 101, name: "Mechi Municipality" }, { id: 102, name: "Ilam Municipality" }],
    2: [{ id: 103, name: "Bhadrapur Municipality" }, { id: 104, name: "Chandragadhi Municipality" }],
    3: [{ id: 105, name: "Kathmandu Metropolitan" }, { id: 106, name: "Lalitpur Metropolitan" }],
    4: [{ id: 107, name: "Gorkha Municipality" }, { id: 108, name: "Tanahun Municipality" }],
    5: [{ id: 109, name: "Tansen Municipality" }, { id: 110, name: "Palpa Municipality" }],
    6: [{ id: 111, name: "Jumla Municipality" }, { id: 112, name: "Surkhet Municipality" }],
    7: [{ id: 113, name: "Dhangadhi Municipality" }, { id: 114, name: "Bajhang Municipality" }],
  };
  return municipalityMap[districtId] || [];
};

export const getWards = async (
  municipalityId: number
): Promise<{ id: number; number: number }[]> => {
  await new Promise((resolve) => setTimeout(resolve, 300));
  const wardCounts: Record<number, number> = {
    101: 12,
    102: 10,
    103: 15,
    104: 11,
    105: 32,
    106: 29,
    107: 14,
    108: 13,
    109: 16,
    110: 12,
    111: 18,
    112: 10,
    113: 16,
    114: 11,
  };
  const count = wardCounts[municipalityId] || 10;
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    number: i + 1,
  }));
};

export const uploadDocuments = async (files: File[]): Promise<string[]> => {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return files.map((file) => URL.createObjectURL(file));
};
