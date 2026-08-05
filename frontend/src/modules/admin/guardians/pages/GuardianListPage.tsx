import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../../../layouts/AdminLayout";
import GuardianToolbar from "../components/GuardianToolbar";
import GuardianTable from "../components/GuardianTable";
import GuardianSkeleton from "../components/GuardianSkeleton";
import EmptyState from "../../students/components/EmptyState";
import Pagination from "../../students/components/Pagination";
import ConfirmDialog from "../../../../components/feedback/ConfirmDialog";
import { useToast } from "../../students/components/Toast";
import { getGuardians, deleteGuardian, restoreGuardian, exportGuardiansCsv, getGuardianSummary } from "../services/guardian.service";
import type { Guardian, GuardianFilters } from "../types/guardian.types";

export default function GuardianListPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [deleteId, setDeleteId] = useState<number>();
  const [guardians, setGuardians] = useState<Guardian[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [relationshipFilter, setRelationshipFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [provinceFilter, setProvinceFilter] = useState("");
  const [districtFilter, setDistrictFilter] = useState("");
  const [studentFilter, setStudentFilter] = useState("");
  const [deleted, setDeleted] = useState(false);
  const [summary, setSummary] = useState({ total: 0, active: 0, inactive: 0 });

  const filters = useMemo<GuardianFilters>(() => ({
    search: searchQuery || undefined,
    relationship: relationshipFilter || undefined,
    status: statusFilter || undefined,
    deleted,
    page: page - 1,
    size: 10,
    province: provinceFilter || undefined,
    district: districtFilter || undefined,
    hasStudents: studentFilter === "" ? undefined : studentFilter === "with",
  }), [searchQuery, relationshipFilter, statusFilter, deleted, page, provinceFilter, districtFilter, studentFilter]);

  const fetchGuardians = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [response, summaryData] = await Promise.all([
        getGuardians(filters),
        getGuardianSummary(),
      ]);
      setGuardians(response.content);
      setTotalPages(Math.max(response.totalPages, 1));
      setSummary(summaryData);
    } catch {
      setError("Failed to load guardians");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    void Promise.resolve().then(fetchGuardians);
  }, [fetchGuardians]);

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setPage(1);
  };

  const handleRefresh = () => {
    fetchGuardians();
  };

  const placeholderAction = () => showToast("This action is not available yet", "validation");

  const handleView = (id: number) => {
    navigate(`/admin/guardians/${id}`);
  };

  const handleEdit = (id: number) => {
    navigate(`/admin/guardians/${id}/edit`);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteGuardian(deleteId);
      setDeleteId(undefined);
      showToast("Guardian deleted successfully", "success");
      await fetchGuardians();
    } catch (error) {
      showToast((error as { response?: { data?: { message?: string } } }).response?.data?.message || "Failed to delete guardian", "error");
    }
  };

  const handleRestore = async (id: number) => {
    try {
      await restoreGuardian(id);
      showToast("Guardian restored successfully", "success");
      await fetchGuardians();
    } catch (error) {
      showToast((error as { response?: { data?: { message?: string } } }).response?.data?.message || "Failed to restore guardian", "error");
    }
  };

  const handleExport = async () => {
    const blob = await exportGuardiansCsv(filters);
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "guardians.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleAddGuardian = () => {
    navigate("/admin/guardians/add");
  };

  const breadcrumbs = [
    { label: "Dashboard", href: "/admin/dashboard" },
    { label: "Guardians", href: "/admin/guardians" },
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
                <a href={crumb.href} className="hover:text-[#234A91] transition-colors">
                  {crumb.label}
                </a>
              )}
            </React.Fragment>
          ))}
        </nav>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Guardian Management</h1>
            <p className="text-gray-500 text-sm mt-1">
              Manage guardians and link students. Total: {summary.total} | Active: {summary.active}
            </p>
          </div>
        </div>

        <GuardianToolbar
          searchQuery={searchQuery}
          onSearch={handleSearch}
          onRefresh={handleRefresh}
          onAddGuardian={handleAddGuardian}
          onExport={handleExport}
           relationshipFilter={relationshipFilter}
          onRelationshipChange={(value) => { setRelationshipFilter(value); setPage(1); }}
          statusFilter={statusFilter}
          onStatusChange={(value) => { setStatusFilter(value); setPage(1); }}
           provinceFilter={provinceFilter}
           onProvinceChange={(value) => { setProvinceFilter(value); setPage(1); }}
           districtFilter={districtFilter}
           onDistrictChange={(value) => { setDistrictFilter(value); setPage(1); }}
           studentFilter={studentFilter}
           onStudentChange={(value) => { setStudentFilter(value); setPage(1); }}
           deleted={deleted}
           onDeletedChange={(value) => { setDeleted(value); setPage(1); }}
         />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[{ label: "Total Guardians", value: summary.total, color: "text-[#234A91]" }, { label: "Active Guardians", value: summary.active, color: "text-green-700" }, { label: "Inactive Guardians", value: summary.inactive, color: "text-gray-700" }].map((item) => (
            <div key={item.label} className="bg-white rounded-xl p-5 shadow-sm">
              <p className="text-sm text-gray-500">{item.label}</p>
              <p className={`mt-2 text-2xl font-bold ${item.color}`}>{item.value}</p>
            </div>
          ))}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
            <p className="text-red-600 text-sm">{error}</p>
            <button onClick={fetchGuardians} className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700">
              Retry
            </button>
          </div>
        )}

        {loading ? (
          <GuardianSkeleton rows={8} />
        ) : guardians.length === 0 && !error ? (
          <EmptyState
            title="No guardians found"
            description="Get started by adding a new guardian."
            actionLabel="Add Guardian"
            onAction={handleAddGuardian}
          />
        ) : (
          <>
            <GuardianTable
              guardians={guardians}
               page={page}
               pageSize={10}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={setDeleteId}
               onRestore={handleRestore}
               onPrint={placeholderAction}
               onDownload={placeholderAction}
            />
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
          </>
        )}

        <ConfirmDialog
          open={deleteId !== undefined}
          title="Delete Guardian"
          description="This guardian will be soft deleted. Active students must be unlinked first."
          confirmLabel="Delete"
          variant="destructive"
          onConfirm={handleDelete}
          onCancel={() => setDeleteId(undefined)}
        />
      </div>
    </AdminLayout>
  );
}
