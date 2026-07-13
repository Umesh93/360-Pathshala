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
  {
    to: "/super-admin/demo-requests",
    label: "Demo Requests",
    icon: ClipboardList,
  },
];

const ADMIN_LINKS = [
  { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/students", label: "Students", icon: GraduationCap },
  { to: "/admin/teachers", label: "Teachers", icon: UserCheck },
  { to: "/admin/guardians", label: "Parents/Guardians", icon: Users },
  { to: "/admin/classes", label: "Classes", icon: School },
  { to: "/admin/subjects", label: "Subjects", icon: BookOpen },
  { to: "/admin/attendance", label: "Attendance", icon: ClipboardCheck },
  { to: "/admin/examinations", label: "Examinations", icon: FileText },
  { to: "/admin/assignments", label: "Assignments", icon: BookOpen },
  { to: "/admin/fees", label: "Fee Management", icon: Wallet },
  { to: "/admin/calendar", label: "Academic Calendar", icon: Calendar },
  { to: "/admin/leaves", label: "Leaves", icon: CalendarClock },
  { to: "/admin/certificates", label: "Certificates", icon: Award },
  { to: "/admin/reports", label: "Reports", icon: BarChart3 },
  { to: "/admin/settings", label: "Settings", icon: Settings },
];

export default function Sidebar({
  collapsed,
  role = "SUPER_ADMIN",
  enabledModules,
}: SidebarProps) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    navigate("/");
  };

  const isAdmin = role === "ADMIN";
  const links = isAdmin ? ADMIN_LINKS : SUPER_ADMIN_LINKS;

  const filteredLinks =
    enabledModules && enabledModules.length > 0
      ? links.filter((link) => enabledModules.includes(link.label))
      : links;

  const userLabel = isAdmin ? "School Admin" : "Super Admin";

  return (
    <aside
      className={`
        relative
        bg-white
        border-r
        border-gray-200
        h-screen
        transition-all
        duration-300
        ${collapsed ? "w-20" : "w-[300px]"}
      `}
    >
      {/* Logo */}
      <div className="h-20 border-b border-slate-200 flex items-center justify-center">
        {collapsed ? (
          <img src={favicon} alt="360 Pathshala" className="h-10 w-10" />
        ) : (
          <img src={logo} alt="360 Pathshala" className="h-12" />
        )}
      </div>

      {/* User Card */}
      <div className="m-3 bg-gray-100 rounded-2xl transition-all duration-300">
        {collapsed ? (
          <div className="flex justify-center py-4">
            <UserCircle size={36} className="text-gray-500" />
          </div>
        ) : (
          <div className="p-4 flex justify-between items-center">
            <div>
              <h3 className="font-semibold">Umesh_Krafts</h3>
              <p className="text-sm text-gray-500">{userLabel}</p>
            </div>
            <ChevronRight size={16} />
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="px-3">
        {filteredLinks.map((link) => (
          <NavLink
            key={link.to}
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
        ))}
      </nav>

      {/* Logout */}
      <div className="absolute bottom-4 left-0 w-full px-3">
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
      </div>
    </aside>
  );
}
