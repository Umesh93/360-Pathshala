import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AdminLayout from "../../../../layouts/AdminLayout";
import AddressForm from "../../../../components/common/address/AddressForm";
import RequiredLabel from "../../../../components/forms/RequiredLabel";
import { useToast } from "../../students/components/Toast";
import { createGuardian, decodeGuardianAddress, encodeGuardianAddress, encodeGuardianMetadata, getGuardian, updateGuardian } from "../services/guardian.service";
import type { GuardianAddress, GuardianRequest } from "../types/guardian.types";

const emptyAddress: GuardianAddress = { currentProvince: "", currentDistrict: "", currentMunicipality: "", currentWard: "", currentStreet: "", permanentSameAsCurrent: false, permanentProvince: "", permanentDistrict: "", permanentMunicipality: "", permanentWard: "", permanentStreet: "" };
const emptyForm = { guardianCode: "Generating...", firstName: "", middleName: "", lastName: "", gender: "", relationship: "", mobile: "", alternatePhone: "", email: "", dateOfBirth: "", nationality: "Nepali", citizenshipNumber: "", occupation: "", education: "", employer: "", annualIncome: "", communicationPreference: "", preferredLanguage: "", emergencyContactPerson: "", emergencyContactNumber: "", emergencyContactRelationship: "", photo: "", documentType: "", documentNumber: "", documentIssuedDate: "", documentExpiryDate: "", notes: "", fatherName: "", motherName: "", fatherOccupation: "", fatherPhone: "", fatherEmail: "", motherOccupation: "", motherPhone: "", motherEmail: "", address: emptyAddress };
type FormState = typeof emptyForm;

const inputClass = (error?: string) => `h-10 w-full rounded-xl border px-3 text-sm outline-none focus:border-[#234A91] focus:ring-2 focus:ring-blue-100 ${error ? "border-red-500" : "border-gray-200"}`;
const Field = ({ label, required, error, children }: { label: string; required?: boolean; error?: string; children: React.ReactNode }) => <div><RequiredLabel required={required}>{label}</RequiredLabel>{children}{error && <p className="mt-1 text-xs text-red-600">{error}</p>}</div>;

export default function GuardianFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [form, setForm] = useState<FormState>(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(Boolean(id));
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;
    getGuardian(Number(id)).then((guardian) => setForm({
      ...emptyForm, ...guardian, guardianCode: guardian.guardianCode || `GDN-${String(guardian.id).padStart(5, "0")}`,
      firstName: guardian.firstName || "", middleName: guardian.middleName || "", lastName: guardian.lastName || "",
      mobile: guardian.mobile || guardian.phone || "", address: decodeGuardianAddress(guardian.address),
    })).catch(() => showToast("Failed to load guardian", "error")).finally(() => setLoading(false));
  }, [id, showToast]);

  const update = (field: keyof FormState, value: string) => {
    setForm((previous) => ({ ...previous, [field]: value }));
    setErrors((previous) => ({ ...previous, [field]: "" }));
  };

  const validate = () => {
    const next: Record<string, string> = {};
    if (!form.firstName.trim()) next.firstName = "First name is required";
    if (!form.lastName.trim()) next.lastName = "Last name is required";
    if (!form.gender) next.gender = "Gender is required";
    if (!form.relationship) next.relationship = "Relationship is required";
    if (!/^\+?[0-9 -]{7,15}$/.test(form.mobile.trim())) next.mobile = "Enter a valid mobile number";
    if (!form.email.trim()) next.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = "Enter a valid email address";
    if (!form.address.currentProvince) next.currentProvince = "Province is required";
    if (!form.address.currentDistrict) next.currentDistrict = "District is required";
    if (!form.address.currentMunicipality.trim()) next.currentMunicipality = "Municipality is required";
    const ward = Number(form.address.currentWard);
    if (!Number.isInteger(ward) || ward < 1 || ward > 35) next.currentWard = "Enter a ward from 1 to 35";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (submitting || !validate()) return;
    setSubmitting(true);
    try {
      const { address, ...metadata } = form;
      const payload: GuardianRequest = {
        ...metadata, fullName: [form.firstName, form.middleName, form.lastName].filter(Boolean).join(" "), phone: form.mobile,
        mobile: form.mobile, alternativeMobile: form.alternatePhone, organization: form.employer,
        address: encodeGuardianAddress(address), documents: "", documentMetadata: encodeGuardianMetadata(metadata),
      };
      if (id) await updateGuardian(Number(id), payload); else await createGuardian(payload);
      showToast(`Guardian ${id ? "updated" : "created"} successfully`, "success");
      navigate("/admin/guardians");
    } catch (error) {
      showToast((error as { response?: { data?: { message?: string } } }).response?.data?.message || "Failed to save guardian", "error");
    } finally { setSubmitting(false); }
  };

  if (loading) return <AdminLayout><div className="p-8 text-gray-600">Loading guardian...</div></AdminLayout>;
  const textField = (field: keyof FormState, label: string, required = false, type = "text") => <Field label={label} required={required} error={errors[field]}><input type={type} value={String(form[field] || "")} onChange={(event) => update(field, event.target.value)} className={inputClass(errors[field])} aria-invalid={!!errors[field]} /></Field>;

  return <AdminLayout><div className="space-y-6">
    <div><h1 className="text-2xl md:text-3xl font-bold text-gray-800">{id ? "Edit Guardian" : "Add Guardian"}</h1><p className="text-sm text-gray-500 mt-1">Fields marked with * are required.</p></div>
    <form onSubmit={handleSubmit} className="space-y-4">
      <section className="bg-white rounded-xl p-6 shadow-sm"><h2 className="text-lg font-semibold mb-4">Personal & Contact Information</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Field label="Guardian ID" required><input readOnly value={id ? form.guardianCode : "Auto-generated on save"} className={`${inputClass()} bg-gray-100`} /></Field>
          {textField("firstName", "First Name", true)}{textField("middleName", "Middle Name")}{textField("lastName", "Last Name", true)}
          <Field label="Gender" required error={errors.gender}><select value={form.gender} onChange={(event) => update("gender", event.target.value)} className={inputClass(errors.gender)}><option value="">Select Gender</option><option value="MALE">Male</option><option value="FEMALE">Female</option><option value="OTHER">Other</option></select></Field>
          <Field label="Relationship" required error={errors.relationship}><select value={form.relationship} onChange={(event) => update("relationship", event.target.value)} className={inputClass(errors.relationship)}><option value="">Select Relationship</option>{["Father", "Mother", "Guardian", "Grandparent", "Sibling", "Other"].map((value) => <option key={value}>{value}</option>)}</select></Field>
          {textField("mobile", "Mobile", true, "tel")}{textField("alternatePhone", "Alternate Phone", false, "tel")}{textField("email", "Email", true, "email")}{textField("dateOfBirth", "Date of Birth", false, "date")}{textField("nationality", "Nationality")}{textField("citizenshipNumber", "Citizenship Number")}
          <Field label="Photo"><input type="file" accept="image/*" onChange={(event) => { const file = event.target.files?.[0]; if (file && file.size <= 2_000_000) { const reader = new FileReader(); reader.onload = () => update("photo", String(reader.result)); reader.readAsDataURL(file); } else if (file) showToast("Photo must be smaller than 2 MB", "validation"); }} className="w-full text-sm" /></Field>
        </div>
      </section>
      <section className="bg-white rounded-xl p-6 shadow-sm"><h2 className="text-lg font-semibold mb-4">Occupation & Preferences</h2><div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">{textField("occupation", "Occupation")}{textField("education", "Education")}{textField("employer", "Employer")}{textField("annualIncome", "Annual Income")}<Field label="Communication Preference"><select value={form.communicationPreference} onChange={(event) => update("communicationPreference", event.target.value)} className={inputClass()}><option value="">Select Preference</option>{["SMS", "EMAIL", "PHONE", "WHATSAPP"].map((value) => <option key={value}>{value}</option>)}</select></Field>{textField("preferredLanguage", "Preferred Language")}</div></section>
      <AddressForm data={form.address} onChange={(address) => setForm((previous) => ({ ...previous, address }))} errors={errors} />
      <section className="bg-white rounded-xl p-6 shadow-sm"><h2 className="text-lg font-semibold mb-4">Emergency Contact</h2><div className="grid grid-cols-1 sm:grid-cols-3 gap-4">{textField("emergencyContactPerson", "Contact Person")}{textField("emergencyContactNumber", "Contact Number", false, "tel")}{textField("emergencyContactRelationship", "Relationship")}</div></section>
      <section className="bg-white rounded-xl p-6 shadow-sm"><h2 className="text-lg font-semibold mb-4">Documents & Notes</h2><div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">{textField("documentType", "Document Type")}{textField("documentNumber", "Document Number")}{textField("documentIssuedDate", "Issued Date", false, "date")}{textField("documentExpiryDate", "Expiry Date", false, "date")}</div><div className="mt-4"><label className="mb-1 block text-sm font-medium text-gray-700">Notes</label><textarea value={form.notes} onChange={(event) => update("notes", event.target.value)} rows={3} className="w-full rounded-xl border border-gray-200 p-3 text-sm outline-none focus:border-[#234A91]" /></div></section>
      <div className="flex gap-3"><button disabled={submitting} type="submit" className="px-5 py-2 bg-[#234A91] text-white rounded-xl disabled:opacity-60">{submitting ? "Saving..." : id ? "Update Guardian" : "Create Guardian"}</button><button disabled={submitting} type="button" onClick={() => navigate("/admin/guardians")} className="px-5 py-2 border border-gray-200 rounded-xl">Cancel</button></div>
    </form>
  </div></AdminLayout>;
}
