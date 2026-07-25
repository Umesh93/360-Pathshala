import React, { useEffect, useRef } from "react";
import AdminLayout from "../../../../layouts/AdminLayout";
import TeacherForm from "../components/TeacherForm";

const AddTeacherPage = () => {
  const hasShownWarning = useRef(false);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!hasShownWarning.current) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  const breadcrumbs = [
    { label: "Dashboard", href: "/admin/dashboard" },
    { label: "Teachers", href: "/admin/teachers" },
    { label: "Add Teacher", href: "/admin/teachers/add" },
  ];

  return (
    <AdminLayout>
      <div className="space-y-4 md:space-y-6">
        <nav className="flex text-sm text-gray-500">
          {breadcrumbs.map((crumb, index) => (
            <React.Fragment key={index}>
              {index > 0 && <span className="mx-2">/</span>}
              {index === breadcrumbs.length - 1 ? (
                <span className="text-gray-900 font-medium">{crumb.label}</span>
              ) : (
                <a
                  href={crumb.href}
                  className="hover:text-[#234A91] transition-colors"
                >
                  {crumb.label}
                </a>
              )}
            </React.Fragment>
          ))}
        </nav>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
              Add New Teacher
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Fill in the teacher details below
            </p>
          </div>
        </div>

        <TeacherForm />
      </div>
    </AdminLayout>
  );
};

export default AddTeacherPage;
