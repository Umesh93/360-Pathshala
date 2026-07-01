import {
  LayoutDashboard,
  School,
  ClipboardList,
  ChevronRight,
  UserCircle,
  LogOut,
} from "lucide-react";

import { NavLink, useNavigate } from "react-router-dom";

import logo from "../assets/images/logo.png";
import favicon from "../assets/images/favicon.ico";

interface SidebarProps {
  collapsed: boolean;
}

export default function Sidebar({ collapsed }: SidebarProps) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();

    navigate("/");
  };

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

              <p className="text-sm text-gray-500">Super Admin</p>
            </div>

            <ChevronRight size={16} />
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="px-3">
        {/* Dashboard */}
        <NavLink
          to="/super-admin/dashboard"
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
              <LayoutDashboard size={20} />

              {!collapsed && <span>Dashboard</span>}
            </div>

            {!collapsed && <ChevronRight size={16} />}
          </div>
        </NavLink>

        {/* Schools */}
        <NavLink
          to="/super-admin/schools"
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
              <School size={20} />

              {!collapsed && <span>Schools</span>}
            </div>

            {!collapsed && <ChevronRight size={16} />}
          </div>
        </NavLink>

        {/* Demo Requests */}
        <NavLink
          to="/super-admin/demo-requests"
          className={({ isActive }) =>
            `block rounded-xl transition-all ${
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
              <ClipboardList size={20} />

              {!collapsed && <span>Demo Requests</span>}
            </div>

            {!collapsed && <ChevronRight size={16} />}
          </div>
        </NavLink>
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
