import { Search, Sun, Bell, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface HeaderProps {
  collapsed: boolean;
  setCollapsed: (value: boolean) => void;
  enabledModules?: string[];
  modulesLoaded?: boolean;
}

export default function Header({
  collapsed,
  setCollapsed,
  enabledModules,
  modulesLoaded = true,
}: HeaderProps) {
  const navigate = useNavigate();
  return (
    <header className="flex h-20 items-center justify-between border-b border-gray-200 bg-white px-4 sm:px-6">
      <div className="flex min-w-0 items-center gap-3 sm:gap-6">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-gray-500 hover:text-gray-700"
        >
          {collapsed ? (
            <PanelLeftOpen size={22} />
          ) : (
            <PanelLeftClose size={22} />
          )}
        </button>

        <div className="relative hidden sm:block">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <input
            type="text"
            placeholder="Search"
            className="h-12 w-[min(420px,42vw)] rounded-xl border border-gray-200 pl-12 outline-none"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <button className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 sm:h-11 sm:w-11">
          <Sun size={20} />
        </button>

        {modulesLoaded && enabledModules?.includes("NOTIFICATIONS") && (
          <button
            onClick={() => navigate("/admin/notifications")}
            aria-label="Notifications"
            className="relative flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 sm:h-11 sm:w-11"
          >
            <Bell size={20} />
          </button>
        )}
      </div>
    </header>
  );
}
