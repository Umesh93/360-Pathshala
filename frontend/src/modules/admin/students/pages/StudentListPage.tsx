import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../../../layouts/AdminLayout";
import StudentToolbar from "../components/StudentToolbar";
import StudentTable from "../components/StudentTable";
import StudentSkeleton from "../components/StudentSkeleton";
import EmptyState from "../components/EmptyState";
import Pagination from "../components/Pagination";
import { getStudents, deleteStudent } from "../services/student.service";
import type { Student } from "../types/student.types";

const StudentListPage = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [classFilter, setClassFilter] = useState("");
  const [sectionFilter, setSectionFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

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

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this student?")) return;
    try {
      await deleteStudent(id);
      fetchStudents();
    } catch {
      alert("Failed to delete student");
    }
  };

  const handleAddStudent = () => {
    navigate("/admin/students/add");
  };

  const breadcrumbs = [
    { label: "Dashboard", href: "/admin/dashboard" },
    { label: "Students", href: "/admin/students" },
  ];

  return (
    <AdminLayout>
      <div className="space-y-4 md:space-y-6">
        {/* Breadcrumb */}
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

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
              Student List
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Manage and view all students
            </p>
          </div>
        </div>

        {/* Toolbar */}
        <StudentToolbar
          onSearch={handleSearch}
          onRefresh={handleRefresh}
          onAddStudent={handleAddStudent}
        />

        {/* Filters */}
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
              </select>
            </div>
          </div>
        </div>

        {/* Error State */}
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

        {/* Table */}
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
              onDelete={handleDelete}
            />
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default StudentListPage;
