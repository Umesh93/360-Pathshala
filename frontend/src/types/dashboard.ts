export type DashboardModule = string;
export interface DashboardSchool {
  id: number;
  code: string;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  logoUrl: string | null;
}
export interface AcademicSession {
  id: number;
  name: string;
  startsOn: string;
  endsOn: string;
  active: boolean;
}
export interface DashboardOverview {
  totalStudents: number;
  activeStudents: number;
  totalTeachers: number;
  activeTeachers: number;
  totalClasses: number;
  totalSections: number;
}
export interface TodayAbsence {
  attendanceId: number;
  studentId: number;
  studentName: string;
  className: string;
  sectionName: string;
  status: string;
}
export interface AttendanceOverview {
  date: string;
  total: number;
  present: number;
  absent: number;
  late: number;
  leave: number;
  unmarked: number;
  percentage: number;
  requiresAttention: boolean;
  todayAbsences: TodayAbsence[];
}
export interface PendingTeacherLeave {
  id: number;
  teacherId: number;
  teacherName: string;
  startsOn: string;
  endsOn: string;
  reason: string;
  status: string;
}
export interface TeacherOverview {
  present: number;
  absent: number;
  onLeave: number;
  unmarked: number;
  pendingLeaveCount: number;
  recentPendingLeaves: PendingTeacherLeave[];
}
export interface UpcomingExamination {
  id: number;
  name: string;
  startsOn: string;
  endsOn: string;
  status: string;
  classNames: string[];
}
export interface RecentExamination {
  id: number;
  name: string;
  endsOn: string;
  publicationStatus: string;
}
export interface ExaminationOverview {
  upcomingCount: number;
  awaitingPublicationCount: number;
  recentlyPublishedCount: number;
  upcoming: UpcomingExamination[];
  recent: RecentExamination[];
}
export interface RecentAssignment {
  id: number;
  title: string;
  dueAt: string;
  status: string;
  className: string;
  subjectName: string;
}
export interface AssignmentOverview {
  active: number;
  dueThisWeek: number;
  pendingSubmissions: number;
  recent: RecentAssignment[];
}
export interface DashboardAttention {
  absentStudents: number;
  pendingTeacherLeaves: number;
  resultsAwaitingPublication: number;
  assignmentsDueThisWeek: number;
}
export interface AdminDashboardResponse {
  school: DashboardSchool;
  session: AcademicSession | null;
  availableSessions: AcademicSession[];
  enabledModules: DashboardModule[];
  overview: DashboardOverview;
  attendance: AttendanceOverview | null;
  teacherOverview: TeacherOverview | null;
  examinations: ExaminationOverview | null;
  assignments: AssignmentOverview | null;
  attention: DashboardAttention;
  activityAvailable: false;
  recentActivity: never[];
}

export interface RoleDashboardContext {
  schoolId: number;
  schoolName: string | null;
  academicSessionId: number | null;
  academicSessionName: string | null;
}

export interface DashboardSelfProfile {
  role: string;
  displayName: string;
  photo: string | null;
  schoolId: number;
  personId: number;
  classId: number | null;
  className: string | null;
  sectionId: number | null;
  sectionName: string | null;
  employeeNumber: string | null;
  department: string | null;
}

export interface TeachingAssignmentScope {
  academicSessionId: number;
  academicSessionName: string;
  classId: number;
  className: string;
  sectionId: number;
  sectionName: string;
  subjectId: number;
  subjectCode: string;
  subjectName: string;
}

export interface RoleDashboardAssignment {
  id: number;
  title: string;
  dueAt: string | null;
  status: string;
  submissionStatus: string | null;
}

export interface RoleDashboardAssignmentSection {
  count: number;
  pending: number;
  recent: RoleDashboardAssignment[];
}

export interface TeacherDashboardAttendance {
  date: string;
  status: string;
  checkIn: string | null;
  checkOut: string | null;
}

export interface StudentDashboardAttendance {
  present: number;
  absent: number;
  late: number;
  leave: number;
  percentage: number;
  recent: Array<{ date: string; status: string }>;
}

export interface DashboardExamAssignment {
  examSubjectId: number;
  examId: number;
  examName: string;
  examDate: string;
  subjectName: string;
  className: string;
  sectionName: string;
  published: boolean;
}

export interface DashboardExamSection {
  count: number;
  recent: DashboardExamAssignment[];
}

export interface DashboardExamResult {
  examId: number;
  examName: string;
  studentId: number;
  studentName: string;
  schoolName: string;
  schoolAddress: string | null;
  schoolPhone: string | null;
  schoolEmail: string | null;
  schoolLogoUrl: string | null;
  studentPhoto: string | null;
  admissionNumber: string | null;
  rollNumber: string | null;
  academicSessionId: number;
  academicSessionName: string;
  examStartsOn: string | null;
  examEndsOn: string | null;
  resultPublishDate: string | null;
  classId: number;
  className: string;
  sectionId: number;
  sectionName: string;
  published: boolean;
  total: number | null;
  fullMarks: number | null;
  percentage: number | null;
  totalCreditHours: number | null;
  gpa: number | null;
  cgpa: number | null;
  cgpaPeriods: number | null;
  grade: string | null;
  status: string | null;
  remarks: string | null;
  classRank: number | null;
  sectionRank: number | null;
  schoolRank: number | null;
  subjects: DashboardSubjectResult[];
}

export interface DashboardSubjectResult {
  examSubjectId: number;
  subjectId: number;
  subjectCode: string | null;
  subjectName: string;
  fullMarks: number;
  passMarks: number;
  obtainedMarks: number | null;
  percentage: number | null;
  absent: boolean;
  grade: string | null;
  gradePoint: number | null;
  gpa: number | null;
  creditHours: number | null;
  qualityPoints: number | null;
  status: string | null;
  remarks: string | null;
}

export interface TeacherDashboardResponse {
  context: RoleDashboardContext;
  profile: DashboardSelfProfile;
  modules: string[];
  teachingAssignments: TeachingAssignmentScope[];
  assignments: RoleDashboardAssignmentSection | null;
  teacherAttendance: TeacherDashboardAttendance | null;
  examinations: DashboardExamSection | null;
  timetableAvailable: boolean;
  timetableEntries: unknown[];
}

export interface StudentDashboardResponse {
  context: RoleDashboardContext;
  profile: DashboardSelfProfile;
  modules: string[];
  classId: number | null;
  className: string | null;
  sectionId: number | null;
  sectionName: string | null;
  academicSessionId: number | null;
  academicSessionName: string | null;
  assignments: RoleDashboardAssignmentSection | null;
  attendance: StudentDashboardAttendance | null;
  results: {
    publishedCount: number;
    latestResult: DashboardExamResult | null;
  } | null;
  timetableAvailable: boolean;
  timetableEntries: unknown[];
}

export interface ParentDashboardResponse {
  status: string;
  enabled: boolean;
}

export interface DashboardStats {
  totalStudents: number;
  totalTeachers: number;
  totalParents: number;
  totalClasses: number;
  attendanceToday: number;
  feeCollectionThisMonth: number;
  pendingFees: number;
  upcomingExams: number;
  upcomingEvents: number;
}
export interface AttendanceData {
  present: number;
  absent: number;
  late: number;
  leave: number;
  halfDay: number;
  total: number;
  trend: { day: string; present: number; absent: number }[];
}
export interface RevenueData {
  monthlyFeeCollection: number;
  pendingCollection: number;
  collectedAmount: number;
  monthlyData: { month: string; amount: number }[];
}
export interface Notice {
  id: number;
  title: string;
  content: string;
  date: string;
  pinned: boolean;
  unread: boolean;
}
export interface LeaveRequest {
  id: number;
  name: string;
  type: "teacher" | "student";
  role: string;
  fromDate: string;
  toDate: string;
  reason: string;
  status: "pending" | "approved" | "rejected";
}
export interface CalendarEvent {
  id: number;
  title: string;
  date: string;
  type: "holiday" | "event" | "exam" | "meeting";
}
export interface UpcomingEvent {
  id: number;
  title: string;
  date: string;
  type: "school" | "exam" | "meeting" | "announcement";
}
export interface TopStudent {
  id: number;
  name: string;
  marks: number;
  class: string;
  profileImage?: string;
}
export interface TopTeacher {
  id: number;
  name: string;
  subject: string;
  performance: number;
}
export interface RecentAdmission {
  id: number;
  name: string;
  class: string;
  date: string;
  status: string;
}
export interface UserOverview {
  students: number;
  teachers: number;
  parents: number;
  staff: number;
}
export interface RecentActivity {
  id: number;
  action: string;
  description: string;
  time: string;
}
export interface BirthdayStudent {
  id: number;
  name: string;
  class: string;
  date: string;
}
export interface FeeDue {
  id: number;
  studentName: string;
  class: string;
  amount: number;
  dueDate: string;
  status: "pending" | "overdue";
}
export interface DashboardData {
  schoolName: string;
  statistics: DashboardStats;
  attendance: AttendanceData;
  revenue: RevenueData;
  notices: Notice[];
  leaves: LeaveRequest[];
  calendar: CalendarEvent[];
  events: UpcomingEvent[];
  topStudents: TopStudent[];
  topTeachers: TopTeacher[];
  recentActivities: RecentActivity[];
  admissions: RecentAdmission[];
  userOverview: UserOverview;
  birthdayStudents: BirthdayStudent[];
  upcomingFeeDues: FeeDue[];
  recentNotifications: {
    id: number;
    title: string;
    message: string;
    time: string;
  }[];
}
export interface DashboardStats {
  totalStudents: number;
  totalTeachers: number;
  totalParents: number;
  totalClasses: number;
  attendanceToday: number;
  feeCollectionThisMonth: number;
  pendingFees: number;
  upcomingExams: number;
  upcomingEvents: number;
}
export interface AttendanceData {
  present: number;
  absent: number;
  late: number;
  leave: number;
  halfDay: number;
  total: number;
  trend: { day: string; present: number; absent: number }[];
}
export interface RevenueData {
  monthlyFeeCollection: number;
  pendingCollection: number;
  collectedAmount: number;
  monthlyData: { month: string; amount: number }[];
}
export interface Notice {
  id: number;
  title: string;
  content: string;
  date: string;
  pinned: boolean;
  unread: boolean;
}
export interface LeaveRequest {
  id: number;
  name: string;
  type: "teacher" | "student";
  role: string;
  fromDate: string;
  toDate: string;
  reason: string;
  status: "pending" | "approved" | "rejected";
}
export interface CalendarEvent {
  id: number;
  title: string;
  date: string;
  type: "holiday" | "event" | "exam" | "meeting";
}
export interface UpcomingEvent {
  id: number;
  title: string;
  date: string;
  type: "school" | "exam" | "meeting" | "announcement";
}
export interface TopStudent {
  id: number;
  name: string;
  marks: number;
  class: string;
  profileImage?: string;
}
export interface TopTeacher {
  id: number;
  name: string;
  subject: string;
  performance: number;
}
export interface RecentAdmission {
  id: number;
  name: string;
  class: string;
  date: string;
  status: string;
}
export interface UserOverview {
  students: number;
  teachers: number;
  parents: number;
  staff: number;
}
export interface RecentActivity {
  id: number;
  action: string;
  description: string;
  time: string;
}
export interface BirthdayStudent {
  id: number;
  name: string;
  class: string;
  date: string;
}
export interface FeeDue {
  id: number;
  studentName: string;
  class: string;
  amount: number;
  dueDate: string;
  status: "pending" | "overdue";
}
export interface DashboardData {
  schoolName: string;
  statistics: DashboardStats;
  attendance: AttendanceData;
  revenue: RevenueData;
  notices: Notice[];
  leaves: LeaveRequest[];
  calendar: CalendarEvent[];
  events: UpcomingEvent[];
  topStudents: TopStudent[];
  topTeachers: TopTeacher[];
  recentActivities: RecentActivity[];
  admissions: RecentAdmission[];
  userOverview: UserOverview;
  birthdayStudents: BirthdayStudent[];
  upcomingFeeDues: FeeDue[];
  recentNotifications: {
    id: number;
    title: string;
    message: string;
    time: string;
  }[];
}
