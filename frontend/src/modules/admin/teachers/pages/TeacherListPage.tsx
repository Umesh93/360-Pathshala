import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../../../layouts/AdminLayout";
import TeacherToolbar from "../components/TeacherToolbar";
import TeacherTable from "../components/TeacherTable";
import TeacherSkeleton from "../components/TeacherSkeleton";
import EmptyState from "../../students/components/EmptyState";
import Pagination from "../../students/components/Pagination";
import { getTeachers, deleteTeacher, exportTeachersCsv } from "../services/teacher.service";
import ConfirmDialog from "../../../../components/feedback/ConfirmDialog";
import { useToast } from "../../students/components/Toast";
import type { Teacher } from "../types/teacher.types";

const TeacherListPage = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [deleteId, setDeleteId] = useState<number>();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const fetchTeachers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getTeachers(
        page,
        10,
        searchQuery,
        subjectFilter,
        statusFilter
      );
      setTeachers(response.data);
      setTotalPages(response.totalPages);
    } catch {
      setError("Failed to load teachers");
    } finally {
      setLoading(false);
    }
  }, [page, searchQuery, subjectFilter, statusFilter]);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      await fetchTeachers();
      if (!isMounted) return;
    };

    load();

    return () => {
      isMounted = false;
    };
  }, [fetchTeachers]);

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setPage(1);
  };

  const handleRefresh = () => {
    fetchTeachers();
  };

  const handleView = (id: number) => {
    navigate(`/admin/teachers/${id}`);
  };

  const handleEdit = (id: number) => {
    navigate(`/admin/teachers/${id}/edit`);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteTeacher(deleteId);
      setDeleteId(undefined); await fetchTeachers(); showToast("Teacher deleted successfully", "success");
    } catch (error) {
      showToast((error as { response?: { data?: { message?: string } } }).response?.data?.message || "Failed to delete teacher", "error");
    }
  };
  const handleExport = async () => { const blob = await exportTeachersCsv(); const url = URL.createObjectURL(blob); const link = document.createElement("a"); link.href = url; link.download = "teachers.csv"; link.click(); URL.revokeObjectURL(url); };

  const handleAddTeacher = () => {
    navigate("/admin/teachers/add");
  };

  const breadcrumbs = [
    { label: "Dashboard", href: "/admin/dashboard" },
    { label: "Teachers", href: "/admin/teachers" },
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
              Teacher List
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Manage and view all teachers
            </p>
          </div>
        </div>

        <TeacherToolbar
          onSearch={handleSearch}
          onRefresh={handleRefresh}
          onAddTeacher={handleAddTeacher}
          onExport={handleExport}
        />

        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subject
              </label>
              <select
                value={subjectFilter}
                onChange={(e) => {
                  setSubjectFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full h-10 border border-gray-200 rounded-xl px-3 text-sm outline-none focus:border-[#234A91] focus:ring-2 focus:ring-blue-100"
              >
                <option value="">All Subjects</option>
                <option value="Mathematics">Mathematics</option>
                <option value="Physics">Physics</option>
                <option value="Chemistry">Chemistry</option>
                <option value="English">English</option>
                <option value="History">History</option>
                <option value="Economics">Economics</option>
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

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
            <p className="text-red-600 text-sm">{error}</p>
            <button
              onClick={fetchTeachers}
              className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        )}

        {loading ? (
          <TeacherSkeleton rows={10} />
        ) : teachers.length === 0 && !error ? (
          <EmptyState
            title="No teachers found"
            description="Get started by adding a new teacher."
            actionLabel="Add Teacher"
            onAction={handleAddTeacher}
          />
        ) : (
          <>
            <TeacherTable
              teachers={teachers}
              loading={loading}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={setDeleteId}
            />
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </>
        )}
      </div>
      <ConfirmDialog open={deleteId !== undefined} title="Delete Teacher" description="This teacher will be soft deleted." confirmLabel="Delete" variant="destructive" onConfirm={handleDelete} onCancel={() => setDeleteId(undefined)} />
    </AdminLayout>
  );
};

export default TeacherListPage;
