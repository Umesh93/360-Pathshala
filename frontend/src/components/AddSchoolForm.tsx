import { useState } from "react";
import { Copy, Check } from "lucide-react";
import SchoolFormFields, { generatePassword } from "./SchoolFormFields";
import { useToast } from "../modules/admin/students/components/Toast";
import { createSchool, updateSchool } from "../services/schoolService";
import { removeSchoolLogo, uploadSchoolLogo } from "../services/schoolService";
import type { SchoolPayload } from "../services/schoolService";
import type { CreateSchoolResponse } from "../services/schoolService";
import SchoolLogoField from "./SchoolLogoField";
import type { School } from "../types/School";

interface AddSchoolFormProps {
  onSuccess?: () => void;
  editSchool?: School | null;
}

export default function AddSchoolForm({
  onSuccess,
  editSchool,
}: AddSchoolFormProps) {
  const { showToast } = useToast();
  const isEdit = !!editSchool;
  const [schoolName, setSchoolName] = useState(editSchool?.schoolName || "");
  const [address, setAddress] = useState(editSchool?.address || "");
  const [email, setEmail] = useState(editSchool?.email || "");
  const [phoneNumber, setPhoneNumber] = useState(editSchool?.phoneNumber || "");
  const [contactPerson, setContactPerson] = useState(
    editSchool?.contactPerson || "",
  );
  const [designation, setDesignation] = useState(editSchool?.designation || "");
  const [selectedModules, setSelectedModules] = useState<string[]>(
    editSchool?.modules && editSchool.modules.length > 0
      ? editSchool.modules
      : ["STUDENT_MANAGEMENT", "EXAMINATION"],
  );
  const [username, setUsername] = useState(editSchool?.adminUsername || "");
  const [password, setPassword] = useState(() => {
    if (isEdit) {
      return editSchool?.adminPassword || "";
    }
    return generatePassword();
  });
  const [passwordRegenerated, setPasswordRegenerated] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<CreateSchoolResponse | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File>();
  const [removeLogo, setRemoveLogo] = useState(false);

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleRegeneratePassword = () => {
    const newPassword = generatePassword();
    setPassword(newPassword);
    setPasswordRegenerated(true);
  };

  const errorMessage = (error: unknown) => {
    const requestError = error as {
      response?: { data?: { message?: string } };
      message?: string;
    };
    return (
      requestError.response?.data?.message ||
      requestError.message ||
      "Logo upload failed. Please try again."
    );
  };

  const handleSubmit = async () => {
    if (!schoolName.trim()) {
      showToast("School Name is required", "error");
      return;
    }
    if (!address.trim()) {
      showToast("Address is required", "error");
      return;
    }
    if (!contactPerson.trim()) {
      showToast("Contact Person is required", "error");
      return;
    }
    if (!designation.trim()) {
      showToast("Designation is required", "error");
      return;
    }
    if (!email.trim()) {
      showToast("Email is required", "error");
      return;
    }
    if (!phoneNumber.trim()) {
      showToast("Phone Number is required", "error");
      return;
    }
    if (selectedModules.length === 0) {
      showToast("Please select at least one module", "error");
      return;
    }

    setSubmitting(true);
    try {
      let response;
      if (isEdit && editSchool) {
        const updatePayload: SchoolPayload = {
          name: schoolName,
          address,
          email,
          phone: phoneNumber,
          contactPerson: contactPerson.trim(),
          designation: designation.trim(),
          modules: selectedModules,
          status: editSchool.status,
        };
        if (passwordRegenerated) {
          updatePayload.password = password;
        }
        response = await updateSchool(editSchool.id, updatePayload);
        try {
          if (logoFile) {
            await uploadSchoolLogo(editSchool.id, logoFile);
          } else if (removeLogo) {
            await removeSchoolLogo(editSchool.id);
          }
          showToast("School and logo updated successfully!", "success");
        } catch (logoError) {
          showToast(
            `School updated successfully, but logo upload failed: ${errorMessage(logoError)}`,
            "validation",
          );
        }
        onSuccess?.();
      } else {
        const createPayload = {
          name: schoolName,
          address,
          email,
          phone: phoneNumber,
          contactPerson: contactPerson.trim(),
          designation: designation.trim(),
          modules: selectedModules,
          status: "ACTIVE",
        };
        response = await createSchool(createPayload);
        setSuccess(response);
        setPassword(response.adminPassword);
        if (logoFile) {
          try {
            await uploadSchoolLogo(response.id, logoFile);
            showToast("School and logo created successfully!", "success");
          } catch (logoError) {
            showToast(
              `School created successfully, but logo upload failed: ${errorMessage(logoError)}`,
              "validation",
            );
          }
        } else {
          showToast("School Registered Successfully", "success");
        }
      }
    } catch (error: unknown) {
      const requestError = error as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      const message =
        requestError.response?.data?.message ||
        requestError.message ||
        "Failed to save school";
      showToast(message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    setSchoolName("");
    setAddress("");
    setEmail("");
    setPhoneNumber("");
    setSelectedModules(["STUDENT_MANAGEMENT", "EXAMINATION"]);
    setPassword("");
    setPasswordRegenerated(false);
    setSuccess(null);
    setLogoFile(undefined);
    setRemoveLogo(false);
    onSuccess?.();
  };

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-8 py-6">
          <h2 className="text-2xl font-semibold text-slate-800">
            {isEdit ? "Edit School" : "School Information"}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {isEdit
              ? "Update school details and modules."
              : "Enter the school's basic information and enable required modules."}
          </p>
        </div>

        <div className="p-8">
          <SchoolFormFields
            schoolName={schoolName}
            address={address}
            email={email}
            phone={phoneNumber}
            contactPerson={contactPerson}
            designation={designation}
            username={username}
            password={password}
            selectedModules={selectedModules}
            onSchoolNameChange={setSchoolName}
            onAddressChange={setAddress}
            onEmailChange={setEmail}
            onPhoneChange={setPhoneNumber}
            onContactPersonChange={setContactPerson}
            onDesignationChange={setDesignation}
            onUsernameChange={setUsername}
            onPasswordChange={setPassword}
            onModulesChange={setSelectedModules}
            onRegeneratePassword={handleRegeneratePassword}
            isEdit={isEdit}
          />
          <div className="mt-8">
            <SchoolLogoField
              schoolId={editSchool?.id}
              currentLogoUrl={editSchool?.logoUrl}
              file={logoFile}
              remove={removeLogo}
              onFileChange={setLogoFile}
              onRemoveChange={setRemoveLogo}
              onError={(message) => showToast(message, "validation")}
            />
          </div>
        </div>
      </div>

      {success && (
        <div className="rounded-3xl border border-green-200 bg-green-50 p-6">
          <h3 className="text-lg font-semibold text-green-800 mb-4">
            School Registered Successfully
          </h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-green-700">
                School Code
              </label>
              <div className="flex items-center gap-2">
                <input
                  value={success.schoolCode}
                  readOnly
                  className="h-10 flex-1 rounded-lg border border-green-200 bg-white px-3 text-sm text-green-800"
                />
                <button
                  type="button"
                  onClick={() => handleCopy(success.schoolCode, "schoolCode")}
                  className="rounded-lg border border-green-200 p-2 hover:bg-green-100"
                >
                  {copiedField === "schoolCode" ? (
                    <Check size={16} className="text-green-700" />
                  ) : (
                    <Copy size={16} className="text-green-700" />
                  )}
                </button>
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-green-700">
                Username
              </label>
              <div className="flex items-center gap-2">
                <input
                  value={success.adminUsername}
                  readOnly
                  className="h-10 flex-1 rounded-lg border border-green-200 bg-white px-3 text-sm text-green-800"
                />
                <button
                  type="button"
                  onClick={() =>
                    handleCopy(success.adminUsername, "adminUsername")
                  }
                  className="rounded-lg border border-green-200 p-2 hover:bg-green-100"
                >
                  {copiedField === "adminUsername" ? (
                    <Check size={16} className="text-green-700" />
                  ) : (
                    <Copy size={16} className="text-green-700" />
                  )}
                </button>
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-green-700">
                Temporary Password
              </label>
              <div className="flex items-center gap-2">
                <input
                  value={success.adminPassword}
                  readOnly
                  className="h-10 flex-1 rounded-lg border border-green-200 bg-white px-3 text-sm text-green-800 font-mono"
                />
                <button
                  type="button"
                  onClick={() =>
                    handleCopy(success.adminPassword, "adminPassword")
                  }
                  className="rounded-lg border border-green-200 p-2 hover:bg-green-100"
                >
                  {copiedField === "adminPassword" ? (
                    <Check size={16} className="text-green-700" />
                  ) : (
                    <Copy size={16} className="text-green-700" />
                  )}
                </button>
              </div>
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <button
              onClick={() => onSuccess?.()}
              className="rounded-xl bg-green-600 px-6 py-2.5 font-medium text-white transition hover:bg-green-700"
            >
              Back to Schools List
            </button>
          </div>
        </div>
      )}

      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={handleCancel}
          disabled={submitting}
          className="rounded-xl border border-slate-300 px-6 py-3 font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="rounded-xl bg-teal-600 px-8 py-3 font-medium text-white transition hover:bg-teal-700 disabled:opacity-50 flex items-center gap-2"
        >
          {submitting && (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          )}
          {submitting
            ? isEdit
              ? "Updating..."
              : "Saving..."
            : isEdit
              ? "Update School"
              : "Save School"}
        </button>
      </div>
    </div>
  );
}
