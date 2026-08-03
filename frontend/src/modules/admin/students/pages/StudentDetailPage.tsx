import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AdminLayout from "../../../../layouts/AdminLayout";
import StudentAvatar from "../components/StudentAvatar";
import StudentStatusBadge from "../components/StudentStatusBadge";
import { getStudentById, deleteStudent } from "../services/student.service";
import type { Student } from "../types/student.types";
import { useToast } from "../components/Toast";
import ConfirmDialog from "../../../../components/feedback/ConfirmDialog";
import PageHeader from "../../../../components/layout/PageHeader";
import {
  Mail,
  Phone,
  MapPin,
  Calendar,
  User,
  Users,
  FileText,
  Download,
  Printer,
  Edit,
  Trash2,
  History,
  ClipboardList,
} from "lucide-react";

const StudentDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        const data = await getStudentById(Number(id));
        if (isMounted) {
          if (data) {
            setStudent(data);
          } else {
            setError("Student not found");
          }
        }
      } catch {
        if (isMounted) {
          setError("Failed to load student details");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleDelete = async () => {
    if (!id) return;
    try {
      const deleted = await deleteStudent(Number(id));
      if (!deleted) throw new Error("Delete failed");
      showToast("Student deleted successfully", "success");
      navigate("/admin/students");
    } catch {
      showToast("Failed to delete student", "error");
    }
  };

  const handlePrintID = () => {
    showToast("Preparing ID card for print...", "success");
  };

  const handleDownloadPDF = () => {
    showToast("Preparing ID card PDF...", "success");
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gray-200 rounded-full animate-pulse" />
            <div className="space-y-2">
              <div className="h-6 w-48 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error || !student) {
    return (
      <AdminLayout>
        <PageHeader title="Student Profile" subtitle="View student details" />
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <p className="text-red-600">{error || "Student not found"}</p>
          <button
            onClick={() => navigate("/admin/students")}
            className="mt-4 px-4 py-2 bg-[#223D5D] text-white rounded-lg hover:bg-[#1a2f47] transition-colors"
          >
            Back to Students
          </button>
        </div>
      </AdminLayout>
    );
  }

  const admissionHistory = [
    { year: "2024", class: "Grade 10", section: "A", status: "Active" },
    { year: "2023", class: "Grade 9", section: "A", status: "Active" },
  ];

  const activityLog = [
    { action: "Profile Updated", date: "2024-01-15", user: "Admin" },
    { action: "Fee Payment", date: "2024-01-10", user: "Accountant" },
    { action: "Attendance Marked", date: "2024-01-08", user: "Teacher" },
  ];

  return (
    <AdminLayout>
      <PageHeader
        title="Student Profile"
        subtitle="View and manage student details"
        breadcrumbs={[
          { label: "Dashboard", href: "/admin/dashboard" },
          { label: "Students", href: "/admin/students" },
          { label: student.firstName + " " + student.lastName },
        ]}
        action={
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate(`/admin/students/${student.id}/edit`)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Edit size={16} />
              Edit
            </button>
            <button
              onClick={() => setDeleteDialogOpen(true)}
              className="flex items-center gap-2 px-4 py-2 border border-red-200 text-red-600 rounded-xl text-sm font-medium hover:bg-red-50 transition-colors"
            >
              <Trash2 size={16} />
              Delete
            </button>
          </div>
        }
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        title="Delete Student"
        description={`Are you sure you want to delete ${student.firstName} ${student.lastName}? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleDelete}
        onCancel={() => setDeleteDialogOpen(false)}
      />

      <div className="space-y-6">
        {/* Profile Header */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-soft p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <StudentAvatar
              firstName={student.firstName}
              lastName={student.lastName}
              photo={student.photo}
              size="lg"
            />
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h2 className="text-2xl font-bold text-gray-800">
                  {student.firstName} {student.lastName}
                </h2>
                <StudentStatusBadge status={student.status} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <Mail size={16} className="text-gray-400" />
                  {student.email || "No email"}
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Phone size={16} className="text-gray-400" />
                  {student.phone}
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin size={16} className="text-gray-400" />
                  {student.address || "No address"}
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar size={16} className="text-gray-400" />
                  DOB: {student.dob}
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={handlePrintID} className="p-2 border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-600">
                <Printer size={18} />
              </button>
              <button onClick={handleDownloadPDF} className="p-2 border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-600">
                <Download size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Academic Information */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-soft p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <User size={20} className="text-[#223D5D]" />
            Academic Information
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-500">Admission No</p>
              <p className="text-sm font-medium text-gray-800">{student.admissionNo}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Roll Number</p>
              <p className="text-sm font-medium text-gray-800">{student.rollNumber}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Class</p>
              <p className="text-sm font-medium text-gray-800">{student.class}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Section</p>
              <p className="text-sm font-medium text-gray-800">{student.section}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Admission Date</p>
              <p className="text-sm font-medium text-gray-800">{student.admissionDate}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">House</p>
              <p className="text-sm font-medium text-gray-800">{student.house || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Class Teacher</p>
              <p className="text-sm font-medium text-gray-800">{student.classTeacher || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Gender</p>
              <p className="text-sm font-medium text-gray-800 capitalize">{student.gender}</p>
            </div>
          </div>
        </div>

        {/* Guardian Information */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-soft p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Users size={20} className="text-[#223D5D]" />
            Guardian Information
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-500">Father Name</p>
              <p className="text-sm font-medium text-gray-800">{student.guardian.fatherName || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Mother Name</p>
              <p className="text-sm font-medium text-gray-800">{student.guardian.motherName || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Guardian Name</p>
              <p className="text-sm font-medium text-gray-800">{student.guardian.guardianName || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Relationship</p>
              <p className="text-sm font-medium text-gray-800">{student.guardian.relationship}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Phone</p>
              <p className="text-sm font-medium text-gray-800">{student.guardian.phone}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="text-sm font-medium text-gray-800">{student.guardian.email || "N/A"}</p>
            </div>
            <div className="sm:col-span-2">
              <p className="text-sm text-gray-500">Address</p>
              <p className="text-sm font-medium text-gray-800">{student.guardian.address}</p>
            </div>
          </div>
        </div>

        {/* Admission History */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-soft p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <History size={20} className="text-[#223D5D]" />
            Admission History
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Year</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Class</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Section</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {admissionHistory.map((record, index) => (
                  <tr key={index}>
                    <td className="px-4 py-3 text-sm text-gray-800">{record.year}</td>
                    <td className="px-4 py-3 text-sm text-gray-800">{record.class}</td>
                    <td className="px-4 py-3 text-sm text-gray-800">{record.section}</td>
                    <td className="px-4 py-3 text-sm text-gray-800">{record.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Activity Log */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-soft p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <ClipboardList size={20} className="text-[#223D5D]" />
            Activity Log
          </h3>
          <div className="space-y-4">
            {activityLog.map((activity, index) => (
              <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                <div>
                  <p className="text-sm font-medium text-gray-800">{activity.action}</p>
                  <p className="text-xs text-gray-500">By {activity.user}</p>
                </div>
                <p className="text-xs text-gray-400">{activity.date}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Additional Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-soft p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Personal Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Blood Group</p>
                <p className="text-sm font-medium text-gray-800">{student.bloodGroup || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Category</p>
                <p className="text-sm font-medium text-gray-800">{student.category}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Religion</p>
                <p className="text-sm font-medium text-gray-800">{student.religion || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Nationality</p>
                <p className="text-sm font-medium text-gray-800">{student.nationality || "N/A"}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-soft p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Additional Info</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Previous School</p>
                <p className="text-sm font-medium text-gray-800">{student.previousSchool || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Transport</p>
                <p className="text-sm font-medium text-gray-800">{student.transport || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Hostel</p>
                <p className="text-sm font-medium text-gray-800">{student.hostel || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Medical Conditions</p>
                <p className="text-sm font-medium text-gray-800">{student.medicalConditions || "N/A"}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Subjects */}
        {student.subjects && student.subjects.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-soft p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <FileText size={20} className="text-[#223D5D]" />
              Subjects
            </h3>
            <div className="flex flex-wrap gap-2">
              {student.subjects.map((subject, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium"
                >
                  {subject}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default StudentDetailPage;
