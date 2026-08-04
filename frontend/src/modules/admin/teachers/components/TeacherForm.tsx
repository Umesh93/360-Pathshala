import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import TeacherEmploymentSection from "./TeacherEmploymentSection";
import TeacherPersonalSection from "./TeacherPersonalSection";
import TeacherEmergencySection from "./TeacherEmergencySection";
import TeacherEducationSection from "./TeacherEducationSection";
import TeacherMedicalSection from "./TeacherMedicalSection";
import TeacherAddressSection from "./TeacherAddressSection";
import TeacherBankSection from "./TeacherBankSection";
import TeacherDocumentsSection from "./TeacherDocumentsSection";
import TeacherLoginSection from "./TeacherLoginSection";
import TeacherFormFooter from "./TeacherFormFooter";
import { useTeacherForm } from "../hooks/useTeacherForm";
import { createTeacher, getTeacherById, updateTeacher } from "../services/teacher.service";
import { useToast } from "../../students/components/Toast";
import type { TeacherFormData } from "../schemas/teacher.schema";

type SectionKey = keyof TeacherFormData;

const steps: { title: string; section: SectionKey }[] = [
  { title: "Employment", section: "employment" },
  { title: "Personal", section: "personal" },
  { title: "Family & Emergency", section: "emergency" },
  { title: "Education", section: "education" },
  { title: "Medical & Address", section: "medical" },
  { title: "Bank, Docs & Login", section: "bank" },
];

const TeacherForm: React.FC<{ teacherId?: number }> = ({ teacherId }) => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const {
    currentStep,
    formData,
    updateSection,
    submitting,
    setSubmitting,
    nextStep,
    prevStep,
    saveDraft,
    loadDraft,
    clearDraft,
    loadTeacher,
  } = useTeacherForm();
  const hasLoadedDraft = useRef(false);

  useEffect(() => {
    if (!teacherId && !hasLoadedDraft.current) {
      loadDraft();
      hasLoadedDraft.current = true;
    }
  }, [loadDraft, teacherId]);

  useEffect(() => {
    if (!teacherId) return;
    getTeacherById(teacherId).then((teacher) => {
      if (!teacher) return;
      let details: Partial<TeacherFormData> = {};
      try { details = teacher as unknown as Partial<TeacherFormData>; } catch { details = {}; }
      loadTeacher({
        ...formData,
        ...details,
        employment: { ...formData.employment, ...(details.employment || {}), teacherId: teacher.teacherId, employeeCode: teacher.employeeCode || "", joiningDate: teacher.joiningDate || "", employmentType: teacher.employmentType || "permanent", department: teacher.department || "", designation: teacher.designation || "", status: teacher.status, reportingManager: teacher.reportingManager || "" },
        personal: { ...formData.personal, ...(details.personal || {}), firstName: teacher.firstName, middleName: teacher.middleName || "", lastName: teacher.lastName, fullName: teacher.fullName, gender: teacher.gender, dob: teacher.dob, phone: teacher.phone, email: teacher.email, photo: teacher.photo },
        education: { ...formData.education, ...(details.education || {}), highestQualification: teacher.qualification || "", experience: teacher.experience || "" },
      });
    }).catch(() => showToast("Failed to load teacher", "error"));
  }, [teacherId]);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      if (teacherId) await updateTeacher(teacherId, formData); else await createTeacher(formData);
      showToast(`Teacher ${teacherId ? "updated" : "saved"} successfully!`, "success");
      clearDraft();
      navigate("/admin/teachers");
    } catch (error) {
      showToast((error as { response?: { data?: { message?: string } } }).response?.data?.message || "Failed to save teacher", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate("/admin/teachers");
  };

  const handleSaveDraft = () => {
    saveDraft();
    showToast("Draft saved", "success");
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <div className="flex items-center gap-4 overflow-x-auto pb-2">
          {steps.map((step, index) => (
            <div key={step.section} className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  index <= currentStep
                    ? "bg-[#234A91] text-white"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                {index + 1}
              </div>
              <span
                className={`text-sm whitespace-nowrap ${
                  index <= currentStep ? "text-gray-900 font-medium" : "text-gray-500"
                }`}
              >
                {step.title}
              </span>
              {index < steps.length - 1 && (
                <div className="w-8 h-px bg-gray-300 mx-2" />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {currentStep === 0 && (
          <TeacherEmploymentSection
            data={formData.employment}
            onChange={(data) => updateSection("employment", data)}
          />
        )}

        {currentStep === 1 && (
          <TeacherPersonalSection
            data={formData.personal}
            onChange={(data) => updateSection("personal", data)}
          />
        )}

        {currentStep === 2 && (
          <TeacherEmergencySection
            data={formData.emergency}
            onChange={(data) => updateSection("emergency", data)}
          />
        )}

        {currentStep === 3 && (
          <TeacherEducationSection
            data={formData.education}
            onChange={(data) => updateSection("education", data)}
          />
        )}

        {currentStep === 4 && (
          <div className="space-y-4">
            <TeacherMedicalSection
              data={formData.medical}
              onChange={(data) => updateSection("medical", data)}
            />
            <TeacherAddressSection
              data={formData.address}
              onChange={(data) => updateSection("address", data)}
            />
          </div>
        )}

        {currentStep === 5 && (
          <div className="space-y-4">
            <TeacherBankSection
              data={formData.bank}
              onChange={(data) => updateSection("bank", data)}
            />
            <TeacherDocumentsSection
              data={formData.documents}
              onChange={(data) => updateSection("documents", data)}
            />
            <TeacherLoginSection
              data={formData.login}
              onChange={(data) => updateSection("login", data)}
            />
          </div>
        )}
      </div>

      <TeacherFormFooter
        onCancel={handleCancel}
        onSaveDraft={handleSaveDraft}
        onSubmit={handleSubmit}
        submitting={submitting}
        currentStep={currentStep}
        totalSteps={steps.length}
        onPrev={prevStep}
        onNext={nextStep}
        submitLabel={teacherId ? "Update Teacher" : "Save Teacher"}
      />
    </div>
  );
};

export default TeacherForm;
