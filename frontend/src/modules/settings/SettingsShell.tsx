import type { ReactNode } from "react";
import { CreditCard, UserRound } from "lucide-react";
import { NavLink } from "react-router-dom";

import AdminLayout from "@/layouts/AdminLayout";

const links = [
  {
    to: "/admin/settings/profile",
    label: "Profile",
    icon: UserRound,
  },
  {
    to: "/admin/settings/subscription",
    label: "Subscription",
    icon: CreditCard,
  },
];

export default function SettingsShell({ children }: { children: ReactNode }) {
  return (
    <AdminLayout>
      <div className="mx-auto min-w-0 max-w-7xl space-y-6">
        <header>
          <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">
            Settings
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage your account and school subscription.
          </p>
        </header>

        <nav
          aria-label="Settings"
          className="flex max-w-full gap-1 overflow-x-auto rounded-lg border border-slate-200 bg-white p-1 shadow-sm"
        >
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex min-w-fit flex-1 items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-semibold transition-colors ${
                  isActive
                    ? "bg-[#234A91] text-white"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`
              }
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="min-w-0">{children}</div>
      </div>
    </AdminLayout>
  );
}
