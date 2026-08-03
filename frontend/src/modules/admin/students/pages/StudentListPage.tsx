import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../../../layouts/AdminLayout";
import StudentToolbar from "../components/StudentToolbar";
import StudentTable from "../components/StudentTable";
import StudentSkeleton from "../components/StudentSkeleton";
import EmptyState from "../components/EmptyState";
import Pagination from "../components/Pagination";
import { getStudents, deleteStudent, bulkDeleteStudents, exportStudentsCSV, exportStudentsPDF, importStudents } from "../services/student.service";
import type { Student } from "../types/student.types";
import { useToast } from "../components/Toast";
import ConfirmDialog from "../../../../components/feedback/ConfirmDialog";
import PageHeader from "../../../../components/layout/PageHeader";
import { GraduationCap, UserCheck, UserX, Users } from "lucide-react";
import StatCard from "../../../../components/StatCard";

const StudentListPage = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [classFilter, setClassFilter] = useState("");
  const [sectionFilter, setSectionFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<number | null>(null);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getStudents(
        page,
        10,
        searchQuery,
        classFilter,
        sectionFilter,
        statusFilter
      );
      setStudents(response.data);
      setTotalPages(response.totalPages);
      setTotal(response.total);
    } catch {
      setError("Failed to load students");
    } finally {
      setLoading(false);
    }
  }, [page, searchQuery, classFilter, sectionFilter, statusFilter]);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      await fetchStudents();
      if (!isMounted) return;
    };

    load();

    return () => {
      isMounted = false;
    };
  }, [fetchStudents]);

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setPage(1);
  };

  const handleRefresh = () => {
    fetchStudents();
  };

  const handleView = (id: number) => {
    navigate(`/admin/students/${id}`);
  };

  const handleEdit = (id: number) => {
    navigate(`/admin/students/${id}/edit`);
  };

  const handleDeleteClick = (id: number) => {
    setStudentToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!studentToDelete) return;
    try {
      const deleted = await deleteStudent(studentToDelete);
      if (!deleted) throw new Error("Delete failed");
      showToast("Student deleted successfully", "success");
      await fetchStudents();
    } catch {
      showToast("Failed to delete student", "error");
    } finally {
      setDeleteDialogOpen(false);
      setStudentToDelete(null);
    }
  };

  const handleBulkDelete = async (ids: number[]) => {
    try {
      const deleted = await bulkDeleteStudents(ids);
      if (!deleted) throw new Error("Delete failed");
      showToast(`${ids.length} students deleted successfully`, "success");
      setSelectedRows(new Set());
      await fetchStudents();
    } catch {
      showToast("Failed to delete students", "error");
    } finally {
      setBulkDeleteDialogOpen(false);
    }
  };

  const handleAddStudent = () => {
    navigate("/admin/students/add");
  };

  const handleExportCSV = async () => {
    try {
      const blob = await exportStudentsCSV();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `students-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      showToast("CSV exported successfully", "success");
    } catch {
      showToast("Failed to export CSV", "error");
    }
  };

  const handleExportPDF = async () => {
    try {
      const blob = await exportStudentsPDF();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `students-${new Date().toISOString().split("T")[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      showToast("PDF exported successfully", "success");
    } catch {
      showToast("Failed to export PDF", "error");
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const result = await importStudents(file);
      showToast(`Imported ${result.imported} students successfully`, "success");
      fetchStudents();
    } catch {
      showToast("Failed to import students", "error");
    } finally {
      e.target.value = "";
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-4 md:space-y-6">
        <PageHeader
          title="Student List"
          subtitle="Manage and view all students"
          breadcrumbs={[
            { label: "Dashboard", href: "/admin/dashboard" },
            { label: "Students" },
          ]}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Students"
            value={String(total)}
            icon={<GraduationCap />}
            iconBg="bg-blue-500"
          />
          <StatCard
            title="Active Students"
            value="—"
            icon={<UserCheck />}
            iconBg="bg-green-500"
          />
          <StatCard
            title="Inactive Students"
            value="—"
            icon={<UserX />}
            iconBg="bg-gray-500"
          />
          <StatCard
            title="Classes"
            value="—"
            icon={<Users />}
            iconBg="bg-purple-500"
          />
        </div>

        <StudentToolbar
          onSearch={handleSearch}
          onRefresh={handleRefresh}
          onAddStudent={handleAddStudent}
          onExportCSV={handleExportCSV}
          onExportPDF={handleExportPDF}
          onImport={handleImport}
        />

        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Class
              </label>
              <select
                value={classFilter}
                onChange={(e) => {
                  setClassFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full h-10 border border-gray-200 rounded-xl px-3 text-sm outline-none focus:border-[#234A91] focus:ring-2 focus:ring-blue-100"
              >
                <option value="">All Classes</option>
                <option value="Grade 8">Grade 8</option>
                <option value="Grade 9">Grade 9</option>
                <option value="Grade 10">Grade 10</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Section
              </label>
              <select
                value={sectionFilter}
                onChange={(e) => {
                  setSectionFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full h-10 border border-gray-200 rounded-xl px-3 text-sm outline-none focus:border-[#234A91] focus:ring-2 focus:ring-blue-100"
              >
                <option value="">All Sections</option>
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full h-10 border border-gray-200 rounded-xl px-3 text-sm outline-none focus:border-[#234A91] focus:ring-2 focus:ring-blue-100"
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="transferred">Transferred</option>
                <option value="graduated">Graduated</option>
                <option value="suspended">Suspended</option>
                <option value="dropped">Dropped</option>
              </select>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
            <p className="text-red-600 text-sm">{error}</p>
            <button
              onClick={fetchStudents}
              className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        )}

        {loading ? (
          <StudentSkeleton rows={10} />
        ) : students.length === 0 && !error ? (
          <EmptyState
            title="No students found"
            description="Get started by adding a new student."
            actionLabel="Add Student"
            onAction={handleAddStudent}
          />
        ) : (
          <>
            <StudentTable
              students={students}
              loading={loading}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDeleteClick}
              onBulkDelete={handleBulkDelete}
              selectedRows={selectedRows}
              onSelectionChange={setSelectedRows}
            />
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </>
        )}

        <ConfirmDialog
          open={deleteDialogOpen}
          title="Delete Student"
          description={`Are you sure you want to delete this student? This action cannot be undone.`}
          confirmLabel="Delete"
          variant="destructive"
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteDialogOpen(false)}
        />

        <ConfirmDialog
          open={bulkDeleteDialogOpen}
          title="Delete Selected Students"
          description={`Are you sure you want to delete ${selectedRows.size} selected students? This action cannot be undone.`}
          confirmLabel="Delete All"
          variant="destructive"
          onConfirm={() => handleBulkDelete(Array.from(selectedRows))}
          onCancel={() => setBulkDeleteDialogOpen(false)}
        />
      </div>
    </AdminLayout>
  );
};

export default StudentListPage;
