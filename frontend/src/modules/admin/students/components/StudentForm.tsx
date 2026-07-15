import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import StudentAcademicSection from "./StudentAcademicSection";
import StudentPersonalSection from "./StudentPersonalSection";
import GuardianSection from "./GuardianSection";
import AddressSection from "./AddressSection";
import MedicalSection from "./MedicalSection";
import AcademicHistorySection from "./AcademicHistorySection";
import HostelSection from "./HostelSection";
import TransportSection from "./TransportSection";
import BankSection from "./BankSection";
import DocumentsSection from "./DocumentsSection";
import LoginSection from "./LoginSection";
import NotesSection from "./NotesSection";
import StudentFormFooter from "./StudentFormFooter";
import { useStudentForm } from "../hooks/useStudentForm";
import { createStudent } from "../services/student.service";
import { useToast } from "./Toast";
import type { StudentFormData } from "../schemas/student.schema";

type SectionKey = keyof StudentFormData;

const steps: { title: string; section: SectionKey }[] = [
  { title: "Academic", section: "academicInfo" },
  { title: "Personal", section: "personalInfo" },
  { title: "Guardian", section: "guardian" },
  { title: "Address & Medical", section: "address" },
  { title: "History, Hostel, Transport, Bank, Docs, Login, Notes", section: "academicHistory" },
];

const StudentForm: React.FC = () => {
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
  } = useStudentForm();
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
      await createStudent(formData);
      showToast("Student saved successfully!", "success");
      clearDraft();
      navigate("/admin/students");
    } catch {
      showToast("Failed to save student", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate("/admin/students");
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
          <StudentAcademicSection
            data={formData.academicInfo}
            onChange={(data) => updateSection("academicInfo", data)}
          />
        )}

        {currentStep === 1 && (
          <StudentPersonalSection
            data={formData.personalInfo}
            onChange={(data) => updateSection("personalInfo", data)}
          />
        )}

        {currentStep === 2 && (
          <GuardianSection
            data={formData.guardian}
            onChange={(data) => updateSection("guardian", data)}
          />
        )}

        {currentStep === 3 && (
          <div className="space-y-4">
            <AddressSection
              data={formData.address}
              onChange={(data) => updateSection("address", data)}
            />
            <MedicalSection
              data={formData.medical}
              onChange={(data) => updateSection("medical", data)}
            />
          </div>
        )}

        {currentStep === 4 && (
          <div className="space-y-4">
            <AcademicHistorySection
              data={formData.academicHistory}
              onChange={(data) => updateSection("academicHistory", data)}
            />
            <HostelSection
              data={formData.hostel}
              onChange={(data) => updateSection("hostel", data)}
            />
            <TransportSection
              data={formData.transport}
              onChange={(data) => updateSection("transport", data)}
            />
            <BankSection
              data={formData.bank}
              onChange={(data) => updateSection("bank", data)}
            />
            <DocumentsSection
              data={formData.documents}
              onChange={(data) => updateSection("documents", data)}
            />
            <LoginSection
              data={formData.login}
              onChange={(data) => updateSection("login", data)}
            />
            <NotesSection
              data={formData.notes}
              onChange={(data) => updateSection("notes", data)}
            />
          </div>
        )}
      </div>

      <StudentFormFooter
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

export default StudentForm;
