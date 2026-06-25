import { Search, Sun, Bell, PanelLeftClose, PanelLeftOpen } from "lucide-react";

interface HeaderProps {
  collapsed: boolean;
  setCollapsed: (value: boolean) => void;
}

export default function Header({ collapsed, setCollapsed }: HeaderProps) {
  return (
    <header className="h-20 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      <div className="flex items-center gap-6">
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

        <div className="relative">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <input
            type="text"
            placeholder="Search"
            className="w-[420px] h-12 pl-12 border border-gray-200 rounded-xl outline-none"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="w-11 h-11 rounded-full bg-gray-100 flex items-center justify-center">
          <Sun size={20} />
        </button>

        <button className="relative w-11 h-11 rounded-full bg-gray-100 flex items-center justify-center">
          <Bell size={20} />

          <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full"></span>
        </button>
      </div>
    </header>
  );
}
