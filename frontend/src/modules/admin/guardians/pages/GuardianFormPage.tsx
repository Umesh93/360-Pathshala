import { useState, useEffect } from "react";
import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import AdminLayout from "../../../../layouts/AdminLayout";
import AddressForm from "../../../../components/common/address/AddressForm";
import { useToast } from "../../students/components/Toast";
import { createGuardian, decodeGuardianAddress, encodeGuardianAddress, updateGuardian } from "../services/guardian.service";
import type { GuardianAddress } from "../types/guardian.types";

const emptyForm = {
  fullName: "",
  phone: "",
  email: "",
  address: { currentProvince: "", currentDistrict: "", currentMunicipality: "", currentWard: "", currentStreet: "", permanentSameAsCurrent: false, permanentProvince: "", permanentDistrict: "", permanentMunicipality: "", permanentWard: "", permanentStreet: "" } as GuardianAddress,
  relationship: "",
  occupation: "",
  communicationPreference: "",
  emergencyContactPerson: "",
  emergencyContactNumber: "",
  emergencyContactRelationship: "",
  photo: "",
  documents: "",
  notes: "",
  fatherName: "",
  motherName: "",
  fatherOccupation: "",
  fatherPhone: "",
  fatherEmail: "",
  motherOccupation: "",
  motherPhone: "",
  motherEmail: "",
};

export default function GuardianFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (id) {
      import("../services/guardian.service").then(({ getGuardian }) => getGuardian(Number(id)))
        .then((data) => setForm({
          fullName: data.fullName,
          phone: data.phone,
          email: data.email,
          address: decodeGuardianAddress(data.address),
          relationship: data.relationship,
          occupation: data.occupation,
          communicationPreference: data.communicationPreference,
          emergencyContactPerson: data.emergencyContactPerson,
          emergencyContactNumber: data.emergencyContactNumber,
          emergencyContactRelationship: data.emergencyContactRelationship,
          photo: data.photo,
          documents: data.documents,
          notes: data.notes,
          fatherName: data.fatherName,
          motherName: data.motherName,
          fatherOccupation: data.fatherOccupation,
          fatherPhone: data.fatherPhone,
          fatherEmail: data.fatherEmail,
          motherOccupation: data.motherOccupation,
          motherPhone: data.motherPhone,
          motherEmail: data.motherEmail,
        }))
        .catch(() => showToast("Failed to load guardian", "error"));
    }
  }, [id, showToast]);

  const update = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const updateAddress = (address: GuardianAddress) => setForm((previous) => ({ ...previous, address }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fullName.trim()) {
      showToast("Guardian name is required", "error");
      return;
    }
    if (!form.phone.trim()) {
      showToast("Phone number is required", "error");
      return;
    }
    const ward = Number(form.address.currentWard);
    if (!form.address.currentProvince || !form.address.currentDistrict || !form.address.currentMunicipality.trim() || !Number.isInteger(ward) || ward < 1 || ward > 35) {
      showToast("Province, district, municipality, and a ward number between 1 and 35 are required", "error");
      return;
    }
    try {
      const payload = { ...form, address: encodeGuardianAddress(form.address) };
      if (id) {
        await updateGuardian(Number(id), payload);
        showToast("Guardian updated successfully", "success");
      } else {
        await createGuardian(payload);
        showToast("Guardian created successfully", "success");
      }
      navigate("/admin/guardians");
    } catch (error) {
      showToast((error as { response?: { data?: { message?: string } } }).response?.data?.message || "Operation failed", "error");
    }
  };

  const breadcrumbs = [
    { label: "Dashboard", href: "/admin/dashboard" },
    { label: "Guardians", href: "/admin/guardians" },
    { label: id ? "Edit Guardian" : "Add Guardian" },
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

        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
          {id ? "Edit Guardian" : "Add Guardian"}
        </h1>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 shadow-sm space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Guardian Information</h3>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Guardian Name</label>
                <input type="text" value={form.fullName} onChange={(e) => update("fullName", e.target.value)} className="h-10 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-[#234A91] focus:ring-2 focus:ring-blue-100" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Relationship</label>
                <input type="text" value={form.relationship} onChange={(e) => update("relationship", e.target.value)} className="h-10 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-[#234A91] focus:ring-2 focus:ring-blue-100" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Occupation</label>
                <input type="text" value={form.occupation} onChange={(e) => update("occupation", e.target.value)} className="h-10 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-[#234A91] focus:ring-2 focus:ring-blue-100" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Phone</label>
                <input type="tel" value={form.phone} onChange={(e) => update("phone", e.target.value)} className="h-10 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-[#234A91] focus:ring-2 focus:ring-blue-100" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Email</label>
                <input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} className="h-10 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-[#234A91] focus:ring-2 focus:ring-blue-100" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Communication Preference</label>
                <select value={form.communicationPreference} onChange={(e) => update("communicationPreference", e.target.value)} className="h-10 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-[#234A91] focus:ring-2 focus:ring-blue-100">
                  <option value="">Select Preference</option>
                  <option value="SMS">SMS</option>
                  <option value="EMAIL">Email</option>
                  <option value="PHONE">Phone</option>
                  <option value="WHATSAPP">WhatsApp</option>
                </select>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Emergency Contact</h3>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Emergency Contact Person</label>
                <input type="text" value={form.emergencyContactPerson} onChange={(e) => update("emergencyContactPerson", e.target.value)} className="h-10 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-[#234A91] focus:ring-2 focus:ring-blue-100" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Emergency Contact Number</label>
                <input type="tel" value={form.emergencyContactNumber} onChange={(e) => update("emergencyContactNumber", e.target.value)} className="h-10 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-[#234A91] focus:ring-2 focus:ring-blue-100" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Emergency Relationship</label>
                <input type="text" value={form.emergencyContactRelationship} onChange={(e) => update("emergencyContactRelationship", e.target.value)} className="h-10 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-[#234A91] focus:ring-2 focus:ring-blue-100" />
              </div>

              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide pt-4">Father Information</h3>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Father Name</label>
                <input type="text" value={form.fatherName} onChange={(e) => update("fatherName", e.target.value)} className="h-10 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-[#234A91] focus:ring-2 focus:ring-blue-100" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Father Occupation</label>
                <input type="text" value={form.fatherOccupation} onChange={(e) => update("fatherOccupation", e.target.value)} className="h-10 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-[#234A91] focus:ring-2 focus:ring-blue-100" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Father Phone</label>
                <input type="tel" value={form.fatherPhone} onChange={(e) => update("fatherPhone", e.target.value)} className="h-10 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-[#234A91] focus:ring-2 focus:ring-blue-100" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Father Email</label>
                <input type="email" value={form.fatherEmail} onChange={(e) => update("fatherEmail", e.target.value)} className="h-10 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-[#234A91] focus:ring-2 focus:ring-blue-100" />
              </div>

              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide pt-4">Mother Information</h3>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Mother Name</label>
                <input type="text" value={form.motherName} onChange={(e) => update("motherName", e.target.value)} className="h-10 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-[#234A91] focus:ring-2 focus:ring-blue-100" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Mother Occupation</label>
                <input type="text" value={form.motherOccupation} onChange={(e) => update("motherOccupation", e.target.value)} className="h-10 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-[#234A91] focus:ring-2 focus:ring-blue-100" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Mother Phone</label>
                <input type="tel" value={form.motherPhone} onChange={(e) => update("motherPhone", e.target.value)} className="h-10 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-[#234A91] focus:ring-2 focus:ring-blue-100" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Mother Email</label>
                <input type="email" value={form.motherEmail} onChange={(e) => update("motherEmail", e.target.value)} className="h-10 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-[#234A91] focus:ring-2 focus:ring-blue-100" />
              </div>
            </div>
          </div>

          <AddressForm data={form.address} onChange={updateAddress} />

          <div className="flex gap-3">
            <button type="submit" className="px-5 py-2 bg-[#234A91] text-white rounded-xl">
              {id ? "Update Guardian" : "Create Guardian"}
            </button>
            <button type="button" onClick={() => navigate("/admin/guardians")} className="px-5 py-2 border border-gray-200 rounded-xl">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
