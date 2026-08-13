import { useParams } from "react-router-dom";
import AdminLayout from "../../../../layouts/AdminLayout";
import StudentForm from "../components/StudentForm";

const EditStudentPage = () => {
  const { id } = useParams<{ id: string }>();

  const breadcrumbs = [
    { label: "Dashboard", href: "/admin/dashboard" },
    { label: "Students", href: "/admin/students" },
    { label: "Edit Student" },
  ];

  return (
    <AdminLayout>
      <div className="space-y-4 md:space-y-6">
        <nav className="flex text-sm text-gray-500">
          {breadcrumbs.map((crumb, index) => (
            <span key={index} className="flex items-center gap-2">
              {index > 0 && <span className="mx-2 text-gray-400">/</span>}
              {index === breadcrumbs.length - 1 ? (
                <span className="font-medium text-gray-800">{crumb.label}</span>
              ) : (
                <a
                  href={crumb.href}
                  className="hover:text-[#234A91] transition-colors"
                >
                  {crumb.label}
                </a>
              )}
            </span>
          ))}
        </nav>

        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
            Edit Student
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Update student information
          </p>
        </div>

        <StudentForm studentId={Number(id)} />
      </div>
    </AdminLayout>
  );
};

export default EditStudentPage;
