// import type { ReactNode } from "react";
// import Sidebar from "../components/Sidebar";
// import Header from "../components/Header";
// import Footer from "../components/Footer";

// interface Props {
//   children: ReactNode;
// }

// export default function SuperAdminLayout({ children }: Props) {
//   return (
//     <div className="flex bg-slate-100 min-h-screen">
//       <Sidebar />

//       <div className="flex-1 flex flex-col">
//         <Header />

//         <main className="flex-1 p-8">{children}</main>

//         <Footer />
//       </div>
//     </div>
//   );
// }

import type { ReactNode } from "react";
import { useState } from "react";

import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import Footer from "../components/Footer";

interface Props {
  children: ReactNode;
}

export default function SuperAdminLayout({ children }: Props) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex bg-[#EEF3F8] min-h-screen">
      <Sidebar collapsed={collapsed} />

      <div className="flex-1 flex flex-col">
        <Header collapsed={collapsed} setCollapsed={setCollapsed} />

        <main className="flex-1 p-10">{children}</main>

        <Footer />
      </div>
    </div>
  );
}
