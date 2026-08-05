import {
  LayoutDashboard,
  School,
  ClipboardList,
  ChevronRight,
  UserCircle,
  LogOut,
  Users,
  GraduationCap,
  BookOpen,
  ClipboardCheck,
  FileText,
  Wallet,
  Calendar,
  CalendarClock,
  Award,
  BarChart3,
  Settings,
  UserCheck,
  FileCheck,
  Bell,
  CheckSquare,
} from "lucide-react";

import { NavLink, useNavigate } from "react-router-dom";

import logo from "../assets/images/logo.png";
import favicon from "../assets/images/favicon.ico";

interface SidebarProps {
  collapsed: boolean;
  role?: string;
  enabledModules?: string[];
}

const SUPER_ADMIN_LINKS = [
  { to: "/super-admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/super-admin/schools", label: "Schools", icon: School },
  { to: "/super-admin/demo-requests", label: "Demo Requests", icon: ClipboardList },
  { to: "/super-admin/demo-conversions", label: "Conversion History", icon: FileCheck },
  { to: "/super-admin/payments", label: "Payments", icon: Wallet },
  { to: "/super-admin/users", label: "Users", icon: Users },
  { to: "/super-admin/settings", label: "Settings", icon: Settings },
];

const ADMIN_LINKS = [
  { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/classes", label: "Classes", icon: School },
  { to: "/admin/subjects", label: "Subjects", icon: BookOpen, moduleCode: "SUBJECT_MANAGEMENT" },
  { to: "/admin/students", label: "Students", icon: GraduationCap, moduleCode: "STUDENT_MANAGEMENT" },
  { to: "/admin/teachers", label: "Teachers", icon: UserCheck, moduleCode: "TEACHER_MANAGEMENT" },
  { to: "/admin/guardians", label: "Parents / Guardians", icon: Users, moduleCode: "PARENT_MANAGEMENT" },
  { to: "/admin/attendance", label: "Attendance", icon: ClipboardCheck, moduleCode: "ATTENDANCE" },
  { to: "/admin/examinations", label: "Examinations", icon: FileText, moduleCode: "EXAMINATION" },
  { to: "/admin/assignments", label: "Assignments", icon: BookOpen, moduleCode: "ASSIGNMENT" },
  { to: "/admin/fees", label: "Fee Management", icon: Wallet, moduleCode: "FEE_MANAGEMENT" },
  { to: "/admin/calendar", label: "Academic Calendar", icon: Calendar, moduleCode: "ACADEMIC_CALENDAR" },
  { to: "/admin/leaves", label: "Leaves", icon: CalendarClock, moduleCode: "LEAVE_MANAGEMENT" },
  { to: "/admin/certificates", label: "Certificates", icon: Award },
  { to: "/admin/reports", label: "Reports", icon: BarChart3, moduleCode: "ANALYTICS_DASHBOARD" },
  { to: "/admin/settings", label: "Settings", icon: Settings },
];

const TEACHER_LINKS = [
  { to: "/teacher/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/teacher/my-classes", label: "My Classes", icon: School },
  { to: "/teacher/attendance", label: "Attendance", icon: ClipboardCheck },
  { to: "/teacher/assignments", label: "Assignments", icon: FileText },
  { to: "/teacher/marks", label: "Marks Entry", icon: CheckSquare },
  { to: "/teacher/exams", label: "Exams", icon: FileText },
  { to: "/teacher/leaves", label: "Leave Requests", icon: CalendarClock },
  { to: "/teacher/notifications", label: "Notifications", icon: Bell },
  { to: "/teacher/settings", label: "Settings", icon: Settings },
];

const STUDENT_LINKS = [
  { to: "/student/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/student/attendance", label: "My Attendance", icon: ClipboardCheck },
  { to: "/student/assignments", label: "My Assignments", icon: FileText },
  { to: "/student/results", label: "My Results", icon: Award },
  { to: "/student/fees", label: "My Fees", icon: Wallet },
  { to: "/student/leave", label: "Leave Request", icon: CalendarClock },
  { to: "/student/timetable", label: "My Timetable", icon: Calendar },
  { to: "/student/notifications", label: "Notifications", icon: Bell },
  { to: "/student/settings", label: "Settings", icon: Settings },
];

const PARENT_LINKS = [
  { to: "/parent/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/parent/child-attendance", label: "Child Attendance", icon: ClipboardCheck },
  { to: "/parent/child-fees", label: "Child Fees", icon: Wallet },
  { to: "/parent/child-results", label: "Child Results", icon: Award },
  { to: "/parent/child-assignments", label: "Child Assignments", icon: FileText },
  { to: "/parent/leave", label: "Leave Request", icon: CalendarClock },
  { to: "/parent/timetable", label: "Child Timetable", icon: Calendar },
  { to: "/parent/notifications", label: "Notifications", icon: Bell },
  { to: "/parent/settings", label: "Settings", icon: Settings },
];

const getLinksForRole = (role: string) => {
  const normalizedRole = role === "ADMIN" ? "SCHOOL_ADMIN" : role;
  switch (normalizedRole) {
    case "SUPER_ADMIN":
      return SUPER_ADMIN_LINKS;
    case "SCHOOL_ADMIN":
      return ADMIN_LINKS;
    case "TEACHER":
      return TEACHER_LINKS;
    case "STUDENT":
      return STUDENT_LINKS;
    case "PARENT":
      return PARENT_LINKS;
    default:
      return [];
  }
};

const getUserLabel = (role: string): string => {
  const normalizedRole = role === "ADMIN" ? "SCHOOL_ADMIN" : role;
  switch (normalizedRole) {
    case "SUPER_ADMIN":
      return "Super Admin";
    case "SCHOOL_ADMIN":
      return "School Admin";
    case "TEACHER":
      return "Teacher";
    case "STUDENT":
      return "Student";
    case "PARENT":
      return "Parent / Guardian";
    default:
      return "User";
  }
};

export default function Sidebar({
  collapsed,
  role = "SUPER_ADMIN",
  enabledModules,
}: SidebarProps) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    navigate("/login");
  };

  const links = getLinksForRole(role);

  const filteredLinks =
    enabledModules && enabledModules.length > 0
      ? links.filter((link) => !("moduleCode" in link) || enabledModules.includes(link.moduleCode))
      : links;

  const userLabel = getUserLabel(role);

  return (
    <aside
      className={`
        bg-white border-r border-gray-200 transition-all duration-300 min-h-screen
        ${collapsed ? "w-20" : "w-[300px]"}
      `}
    >
      {/* Logo */}
      <div className="h-20 border-b border-slate-200 flex items-center justify-center shrink-0">
        {collapsed ? (
          <img src={favicon} alt="360 Pathshala" className="h-10 w-10" />
        ) : (
          <img src={logo} alt="360 Pathshala" className="h-12" />
        )}
      </div>

      {/* User Card */}
      <div className="m-3 bg-gray-100 rounded-2xl transition-all duration-300 shrink-0">
        {collapsed ? (
          <div className="flex justify-center py-4">
            <UserCircle size={36} className="text-gray-500" />
          </div>
        ) : (
          <div className="p-4 flex justify-between items-center">
            <div>
              <h3 className="font-semibold">{localStorage.getItem("username") || "User"}</h3>
              <p className="text-sm text-gray-500">{userLabel}</p>
            </div>
            <ChevronRight size={16} />
          </div>
        )}
      </div>

      {/* Navigation + Logout */}
      <nav className="flex-1 overflow-y-auto px-3 py-2">
        {filteredLinks.map((link) => {
          const showAcademicHeading = role === "ADMIN" && link.to === "/admin/classes";
          const showPeopleHeading = role === "ADMIN" && link.to === "/admin/students";
          return (
          <div key={link.to}>
          {(showAcademicHeading || showPeopleHeading) && !collapsed && (
            <p className="px-4 pb-2 pt-4 text-xs font-semibold uppercase text-gray-400">
              {showAcademicHeading ? "Academic" : "People"}
            </p>
          )}
          <NavLink
            to={link.to}
            className={({ isActive }) =>
              `block rounded-xl mb-2 transition-all ${
                isActive
                  ? "bg-[#234A91] text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`
            }
          >
            <div
              className={`flex items-center ${
                collapsed ? "justify-center py-4" : "justify-between p-4"
              }`}
            >
              <div className="flex items-center gap-3">
                <link.icon size={20} />
                {!collapsed && <span>{link.label}</span>}
              </div>
              {!collapsed && <ChevronRight size={16} />}
            </div>
          </NavLink>
          </div>
          );
        })}

        <button
          onClick={handleLogout}
          className="w-full rounded-xl text-[#234A91] hover:bg-blue-50 transition-all"
        >
          <div
            className={`flex items-center ${
              collapsed ? "justify-center py-4" : "justify-between p-4"
            }`}
          >
            <div className="flex items-center gap-3">
              <LogOut size={20} />
              {!collapsed && <span>Logout</span>}
            </div>
            {!collapsed && <ChevronRight size={16} />}
          </div>
        </button>
      </nav>
    </aside>
  );
}
