import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AdminLayout from "../../../../layouts/AdminLayout";
import { formatGuardianAddress, getGuardian, getChildren, linkStudent, unlinkStudent, getStudentsForLinking } from "../services/guardian.service";
import type { Guardian, Child } from "../types/guardian.types";
import GuardianStatusBadge from "../components/GuardianStatusBadge";
import ConfirmDialog from "../../../../components/feedback/ConfirmDialog";
import { useToast } from "../../students/components/Toast";

export default function GuardianDetailPage() {
  const { id } = useParams();
  const guardianId = Number(id);
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [guardian, setGuardian] = useState<Guardian>();
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<{ id: number; admissionNo: string; name: string }[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState(0);
  const [unlinkId, setUnlinkId] = useState<number>();

  const load = async () => {
    setLoading(true);
    try {
      const [g, c, s] = await Promise.all([getGuardian(guardianId), getChildren(guardianId), getStudentsForLinking()]);
      setGuardian(g);
      setChildren(c);
      setStudents(s);
    } catch {
      showToast("Failed to load guardian", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [guardianId]);

  const handleLink = async () => {
    if (!selectedStudentId) {
      showToast("Select a student", "error");
      return;
    }
    try {
      await linkStudent(guardianId, { studentId: selectedStudentId });
      showToast("Student linked successfully", "success");
      setSelectedStudentId(0);
      await load();
    } catch (error) {
      showToast((error as { response?: { data?: { message?: string } } }).response?.data?.message || "Failed to link student", "error");
    }
  };

  const handleUnlink = async () => {
    if (!unlinkId) return;
    try {
      await unlinkStudent(guardianId, unlinkId);
      showToast("Student unlinked successfully", "success");
      setUnlinkId(undefined);
      await load();
    } catch (error) {
      showToast((error as { response?: { data?: { message?: string } } }).response?.data?.message || "Failed to unlink student", "error");
    }
  };

  if (loading) {
    return <AdminLayout><div className="p-8">Loading guardian...</div></AdminLayout>;
  }

  if (!guardian) {
    return <AdminLayout><div className="p-8 text-red-600">Guardian not found</div></AdminLayout>;
  }

  const fields = [
    ["Guardian Name", guardian.fullName],
    ["Relationship", guardian.relationship],
    ["Occupation", guardian.occupation],
    ["Phone", guardian.phone],
    ["Email", guardian.email],
    ["Address", formatGuardianAddress(guardian.address)],
    ["Communication Preference", guardian.communicationPreference],
    ["Emergency Contact", guardian.emergencyContactPerson],
    ["Emergency Number", guardian.emergencyContactNumber],
    ["Emergency Relationship", guardian.emergencyContactRelationship],
    ["Father Name", guardian.fatherName],
    ["Mother Name", guardian.motherName],
    ["Status", guardian.status],
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Guardian Profile</h1>
            <p className="text-gray-500">{guardian.fullName}</p>
          </div>
          <button onClick={() => navigate(`/admin/guardians/${guardian.id}/edit`)} className="px-5 py-2 rounded-xl bg-[#234A91] text-white">
            Edit Guardian
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            ["Children", guardian.childrenCount],
            ["Status", guardian.status],
            ["Created", new Date(guardian.createdAt).toLocaleDateString()],
            ["Updated", new Date(guardian.updatedAt).toLocaleDateString()],
          ].map(([label, value]) => (
            <div key={String(label)} className="bg-white rounded-xl p-4 shadow-sm">
              <p className="text-xs uppercase text-gray-500">{label}</p>
              <p className="mt-1 font-medium text-gray-800">{String(value || "-")}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {fields.map(([label, value]) => (
            <div key={String(label)} className="bg-white rounded-xl p-4 shadow-sm">
              <p className="text-xs uppercase text-gray-500">{label}</p>
              <p className="mt-1 font-medium text-gray-800">{String(value || "-")}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold">Children ({children.length})</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
            <select value={selectedStudentId || ""} onChange={(event) => setSelectedStudentId(Number(event.target.value))} className="h-10 border border-gray-200 rounded-xl px-3 text-sm outline-none focus:border-[#234A91] focus:ring-2 focus:ring-blue-100">
              <option value={0}>Select Student</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>{s.admissionNo} - {s.name}</option>
              ))}
            </select>
            <button onClick={handleLink} className="h-10 rounded-xl bg-[#234A91] text-white">Link Student</button>
          </div>
          <div className="space-y-2">
            {children.map((child) => (
              <div key={child.id} className="flex justify-between border rounded-xl p-3">
                <div>
                  <p className="font-medium">{child.firstName} {child.lastName}</p>
                  <p className="text-sm text-gray-500">{child.className} - {child.sectionName} | {child.admissionNumber}</p>
                </div>
                <div className="flex items-center gap-3">
                  <GuardianStatusBadge status={child.status} />
                  <button onClick={() => setUnlinkId(child.id)} className="text-red-600 text-sm">Unlink</button>
                </div>
              </div>
            ))}
            {children.length === 0 && <p className="text-gray-500 text-sm">No children linked to this guardian.</p>}
          </div>
        </div>

        <ConfirmDialog
          open={unlinkId !== undefined}
          title="Unlink Student"
          description="This will remove the guardian link from this student."
          confirmLabel="Unlink"
          variant="destructive"
          onConfirm={handleUnlink}
          onCancel={() => setUnlinkId(undefined)}
        />
      </div>
    </AdminLayout>
  );
}
