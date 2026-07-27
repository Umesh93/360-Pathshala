import { useEffect, useState } from "react";

import AddSchoolForm from "../../components/AddSchoolForm";
import SchoolTable from "../../components/SchoolTable";
import DeleteConfirmationModal from "../../components/DeleteConfirmationModal";
import SuperAdminLayout from "../../layouts/SuperAdminLayout";
import { getSchools, deleteSchool, toggleSchoolStatus } from "../../services/schoolService";
import type { School } from "../../types/School";

export default function Schools() {
  const [schools, setSchools] = useState<School[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingSchool, setEditingSchool] = useState<School | null>(null);
  const [deletingSchool, setDeletingSchool] = useState<School | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadSchools = () => {
    return getSchools()
      .then((data) => {
        setSchools(data);
        setError("");
      })
      .catch((err) => {
        console.error("Failed to load schools", err);
        setError("Failed to load schools. Please try again.");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    console.log("[Schools] component mounted, loading schools...");
    loadSchools();
  }, []);

  const handleAddNew = () => {
    setEditingSchool(null);
    setShowForm(true);
  };

  const handleEdit = (school: School) => {
    setEditingSchool(school);
    setShowForm(true);
  };

  const handleDeleteClick = (school: School) => {
    setDeletingSchool(school);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingSchool) return;
    setDeleting(true);
    try {
      await deleteSchool(deletingSchool.id);
      await loadSchools();
      setDeletingSchool(null);
    } catch (err) {
      console.error("Failed to delete school", err);
      alert("Failed to delete school. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  const handleToggleStatus = async (school: School) => {
    const newStatus = school.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    try {
      await toggleSchoolStatus(school.id, newStatus);
      await loadSchools();
    } catch (err) {
      console.error("Failed to update status", err);
      alert("Failed to update school status. Please try again.");
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingSchool(null);
    loadSchools();
  };

  return (
    <SuperAdminLayout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Schools</h1>
          <p className="text-gray-500">Manage schools</p>
        </div>

        <button
          onClick={handleAddNew}
          className="bg-[#234A91] text-white px-5 py-3 rounded-lg"
        >
          {showForm ? "Back to List" : "Add New School"}
        </button>
      </div>

      {showForm ? (
        <AddSchoolForm
          editSchool={editingSchool}
          onSuccess={handleFormSuccess}
        />
      ) : (
        <>
          {error && <p className="text-red-600 mb-4">{error}</p>}
          {loading ? (
            <div className="text-center text-gray-500 py-12">Loading schools...</div>
          ) : (
            <SchoolTable
              schools={schools}
              onEdit={handleEdit}
              onDelete={handleDeleteClick}
              onToggleStatus={handleToggleStatus}
            />
          )}
        </>
      )}

      <DeleteConfirmationModal
        isOpen={!!deletingSchool}
        schoolName={deletingSchool?.schoolName || ""}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeletingSchool(null)}
      />
    </SuperAdminLayout>
  );
}
