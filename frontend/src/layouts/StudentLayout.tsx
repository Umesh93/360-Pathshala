import type { ReactNode } from "react";
import { useEffect, useState } from "react";

import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { getCurrentSchoolModuleCodes } from "../services/schoolService";

interface Props {
  children: ReactNode;
}

export default function StudentLayout({ children }: Props) {
  const [collapsed, setCollapsed] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(max-width: 767px)").matches,
  );
  const [enabledModules, setEnabledModules] = useState<string[]>();

  useEffect(() => {
    let active = true;
    getCurrentSchoolModuleCodes()
      .then((modules) => active && setEnabledModules(modules))
      .catch(() => active && setEnabledModules([]));
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="flex bg-[#EEF3F8] min-h-screen">
      <Sidebar
        collapsed={collapsed}
        role="STUDENT"
        enabledModules={enabledModules}
        modulesLoaded={enabledModules !== undefined}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          enabledModules={enabledModules}
          modulesLoaded={enabledModules !== undefined}
          role="STUDENT"
        />

        <main className="min-w-0 flex-1 p-4 md:p-6 lg:p-10">{children}</main>

        <Footer />
      </div>
    </div>
  );
}
