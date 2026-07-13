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
  recentNotifications: { id: number; title: string; message: string; time: string }[];
}
