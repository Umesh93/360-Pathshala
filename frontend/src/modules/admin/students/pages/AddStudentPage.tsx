import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../../../layouts/AdminLayout";
import StudentForm from "../components/StudentForm";

const AddStudentPage = () => {
  const navigate = useNavigate();
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
    { label: "Students", href: "/admin/students" },
    { label: "Add Student", href: "/admin/students/add" },
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
              Add New Student
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Fill in the student details below
            </p>
          </div>
          <button
            onClick={() => navigate("/admin/students")}
            className="px-6 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors whitespace-nowrap"
          >
            Cancel
          </button>
        </div>

        <StudentForm />
      </div>
    </AdminLayout>
  );
};

export default AddStudentPage;
