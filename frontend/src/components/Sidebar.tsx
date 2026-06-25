import {
  LayoutDashboard,
  School,
  ClipboardList,
  ChevronRight,
  UserCircle,
} from "lucide-react";
import logo from "../assets/images/logo.png";
import favicon from "../assets/images/favicon.ico";
interface SidebarProps {
  collapsed: boolean;
}

export default function Sidebar({ collapsed }: SidebarProps) {
  return (
    <aside
      className={`
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

      <div
        className={`
          m-3
          bg-gray-100
          rounded-2xl
          transition-all
          duration-300
        `}
      >
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

      <nav className="px-3">
        {/* Dashboard */}

        <div
          className={`
            bg-[#234A91]
            text-white
            rounded-xl
            mb-2
            cursor-pointer
            transition-all
          `}
        >
          <div
            className={`
              flex items-center
              ${collapsed ? "justify-center py-4" : "justify-between p-4"}
            `}
          >
            <div className="flex items-center gap-3">
              <LayoutDashboard size={20} />

              {!collapsed && <span>Dashboard</span>}
            </div>

            {!collapsed && <ChevronRight size={16} />}
          </div>
        </div>

        {/* Schools */}

        <div
          className={`
            rounded-xl
            hover:bg-gray-100
            cursor-pointer
          `}
        >
          <div
            className={`
              flex items-center
              ${collapsed ? "justify-center py-4" : "justify-between p-4"}
            `}
          >
            <div className="flex items-center gap-3">
              <School size={20} />

              {!collapsed && <span>Schools</span>}
            </div>

            {!collapsed && <ChevronRight size={16} />}
          </div>
        </div>

        {/* Demo */}

        <div
          className={`
            rounded-xl
            hover:bg-gray-100
            cursor-pointer
          `}
        >
          <div
            className={`
              flex items-center
              ${collapsed ? "justify-center py-4" : "justify-between p-4"}
            `}
          >
            <div className="flex items-center gap-3">
              <ClipboardList size={20} />

              {!collapsed && <span>Demo Requests</span>}
            </div>

            {!collapsed && <ChevronRight size={16} />}
          </div>
        </div>
      </nav>
    </aside>
  );
}
