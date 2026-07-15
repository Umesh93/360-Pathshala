import type { Student, PaginatedResponse, AttendanceSummary, FeeRecord, ExamResult, ActivityLog } from "../types/student.types";

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

const mockActivities: ActivityLog[] = [
  {
    id: 1,
    action: "Admission",
    description: "Student admitted to Grade 10",
    date: "2024-01-10",
    user: "Admin",
  },
  {
    id: 2,
    action: "Attendance",
    description: "Attendance marked present",
    date: "2026-07-01",
    user: "Class Teacher",
  },
  {
    id: 3,
    action: "Exam",
    description: "Mid-term exam result published",
    date: "2026-07-05",
    user: "Exam Coordinator",
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
  await new Promise((resolve) => setTimeout(resolve, 500));

  let filtered = [...mockStudents];

  if (search) {
    const lower = search.toLowerCase();
    filtered = filtered.filter(
      (s) =>
        s.firstName.toLowerCase().includes(lower) ||
        s.lastName.toLowerCase().includes(lower) ||
        s.admissionNo.toLowerCase().includes(lower) ||
        s.rollNumber.toLowerCase().includes(lower) ||
        s.phone.includes(search)
    );
  }

  if (classFilter) {
    filtered = filtered.filter((s) => s.class === classFilter);
  }

  if (sectionFilter) {
    filtered = filtered.filter((s) => s.section === sectionFilter);
  }

  if (statusFilter) {
    filtered = filtered.filter((s) => s.status === statusFilter);
  }

  const total = filtered.length;
  const totalPages = Math.ceil(total / limit);
  const start = (page - 1) * limit;
  const data = filtered.slice(start, start + limit);

  return {
    data,
    total,
    page,
    limit,
    totalPages,
  };
};

export const getStudentById = async (id: number): Promise<Student | undefined> => {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return mockStudents.find((s) => s.id === id);
};

export const createStudent = async (student: Omit<Student, "id">): Promise<Student> => {
  await new Promise((resolve) => setTimeout(resolve, 500));
  const newStudent = { ...student, id: Date.now() } as Student;
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

export const getStudentActivities = async (): Promise<ActivityLog[]> => {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return mockActivities;
};
