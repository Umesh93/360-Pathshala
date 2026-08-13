import type { ReactNode } from "react";
import { useEffect, useState } from "react";

import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { getCurrentSchoolModuleCodes } from "../services/schoolService";

interface Props {
  children: ReactNode;
}

export default function AdminLayout({ children }: Props) {
  const [collapsed, setCollapsed] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(max-width: 767px)").matches,
  );
  const [enabledModules, setEnabledModules] = useState<string[]>();
  const [modulesError, setModulesError] = useState(false);

  useEffect(() => {
    let active = true;
    const loadModules = () => {
      getCurrentSchoolModuleCodes()
        .then((modules) => {
          if (active) {
            setEnabledModules(modules);
            setModulesError(false);
          }
        })
        .catch(() => {
          if (active) {
            setEnabledModules([]);
            setModulesError(true);
          }
        });
    };
    loadModules();
    window.addEventListener("school-modules-updated", loadModules);
    return () => {
      active = false;
      window.removeEventListener("school-modules-updated", loadModules);
    };
  }, []);

  return (
    <div className="flex bg-[#EEF3F8] min-h-screen">
      <Sidebar
        collapsed={collapsed}
        role="ADMIN"
        enabledModules={enabledModules}
        modulesLoaded={enabledModules !== undefined && !modulesError}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          enabledModules={enabledModules}
          modulesLoaded={enabledModules !== undefined && !modulesError}
          role="ADMIN"
        />

        <main className="min-w-0 flex-1 p-4 md:p-6 lg:p-10">{children}</main>

        <Footer />
      </div>
    </div>
  );
}
