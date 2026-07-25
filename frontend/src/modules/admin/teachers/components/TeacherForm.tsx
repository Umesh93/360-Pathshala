import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import TeacherEmploymentSection from "./TeacherEmploymentSection";
import TeacherAcademicAssignmentSection from "./TeacherAcademicAssignmentSection";
import TeacherPersonalSection from "./TeacherPersonalSection";
import TeacherEmergencySection from "./TeacherEmergencySection";
import TeacherAddressSection from "./TeacherAddressSection";
import TeacherEducationSection from "./TeacherEducationSection";
import TeacherMedicalSection from "./TeacherMedicalSection";
import TeacherBankSection from "./TeacherBankSection";
import TeacherSocialSection from "./TeacherSocialSection";
import TeacherDocumentsSection from "./TeacherDocumentsSection";
import TeacherLoginSection from "./TeacherLoginSection";
import TeacherNotesSection from "./TeacherNotesSection";
import TeacherFormFooter from "./TeacherFormFooter";
import { useTeacherForm } from "../hooks/useTeacherForm";
import { createTeacher } from "../services/teacher.service";
import { useToast } from "../../students/components/Toast";
import type { TeacherFormData } from "../schemas/teacher.schema";

type SectionKey = keyof TeacherFormData;

const steps: { title: string; section: SectionKey }[] = [
  { title: "Employment & Academic", section: "employment" },
  { title: "Personal", section: "personal" },
  { title: "Education", section: "education" },
  { title: "Medical & Address", section: "medical" },
  { title: "Bank, Docs & Social", section: "bank" },
  { title: "Login & Notes", section: "login" },
];

const TeacherForm: React.FC = () => {
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
  } = useTeacherForm();
  const hasLoadedDraft = useRef(false);

  useEffect(() => {
    if (!hasLoadedDraft.current) {
      loadDraft();
      hasLoadedDraft.current = true;
    }
  }, [loadDraft]);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await createTeacher(formData as any);
      showToast("Teacher saved successfully!", "success");
      clearDraft();
      navigate("/admin/teachers");
    } catch {
      showToast("Failed to save teacher", "error");
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
          <div className="space-y-4">
            <TeacherEmploymentSection
              data={formData.employment}
              onChange={(data) => updateSection("employment", data)}
            />
            <TeacherAcademicAssignmentSection
              data={formData.academicAssignment}
              onChange={(data) => updateSection("academicAssignment", data)}
            />
          </div>
        )}

        {currentStep === 1 && (
          <TeacherPersonalSection
            data={formData.personal}
            onChange={(data) => updateSection("personal", data)}
          />
        )}

        {currentStep === 2 && (
          <TeacherEducationSection
            data={formData.education}
            onChange={(data) => updateSection("education", data)}
          />
        )}

        {currentStep === 3 && (
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

        {currentStep === 4 && (
          <div className="space-y-4">
            <TeacherBankSection
              data={formData.bank}
              onChange={(data) => updateSection("bank", data)}
            />
            <TeacherDocumentsSection
              data={formData.documents}
              onChange={(data) => updateSection("documents", data)}
            />
            <TeacherSocialSection
              data={formData.social}
              onChange={(data) => updateSection("social", data)}
            />
          </div>
        )}

        {currentStep === 5 && (
          <div className="space-y-4">
            <TeacherLoginSection
              data={formData.login}
              onChange={(data) => updateSection("login", data)}
            />
            <TeacherNotesSection
              data={formData.notes}
              onChange={(data) => updateSection("notes", data)}
            />
            <TeacherEmergencySection
              data={formData.emergency}
              onChange={(data) => updateSection("emergency", data)}
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
      />
    </div>
  );
};

export default TeacherForm;
