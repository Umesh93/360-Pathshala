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
  const [collapsed, setCollapsed] = useState(false);
  const [enabledModules, setEnabledModules] = useState<string[]>();

  useEffect(() => {
    let active = true;
    getCurrentSchoolModuleCodes()
      .then((modules) => { if (active) setEnabledModules(modules); })
      .catch(() => { if (active) setEnabledModules([]); });
    return () => { active = false; };
  }, []);

  return (
    <div className="flex bg-[#EEF3F8] min-h-screen">
      <Sidebar collapsed={collapsed} role="ADMIN" enabledModules={enabledModules} />

      <div className="flex-1 flex flex-col min-w-0">
        <Header collapsed={collapsed} setCollapsed={setCollapsed} />

        <main className="flex-1 p-4 md:p-6 lg:p-10">{children}</main>

        <Footer />
      </div>
    </div>
  );
}
