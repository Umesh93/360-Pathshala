import React, { useEffect, useRef, useState } from "react";
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
import { createTeacher, generateEmployeeCode, generateTeacherId, getTeacherById, updateTeacher } from "../services/teacher.service";
import { useToast } from "../../students/components/Toast";
import { teacherFormSchema, type TeacherFormData } from "../schemas/teacher.schema";

type SectionKey = keyof TeacherFormData;

const steps: { title: string; section: SectionKey }[] = [
  { title: "Employment", section: "employment" },
  { title: "Personal", section: "personal" },
  { title: "Emergency Contact", section: "emergency" },
  { title: "Education", section: "education" },
  { title: "Medical & Address", section: "medical" },
  { title: "Bank, Docs & Login", section: "bank" },
];

const sectionErrors = (errors: Record<string, string>, section: SectionKey) =>
  Object.fromEntries(
    Object.entries(errors)
      .filter(([path]) => path.startsWith(`${section}.`))
      .map(([path, message]) => [path.slice(section.length + 1), message]),
  );

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
    setCurrentStep,
  } = useTeacherForm();
  if (import.meta.env.DEV) console.debug("[TeacherWizard] render", { currentStep });
  const hasLoadedDraft = useRef(false);

  const hasLoadedTeacher = useRef(false);
  const hasLoadedGeneratedIds = useRef(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (teacherId || hasLoadedGeneratedIds.current) return;
    hasLoadedGeneratedIds.current = true;
    Promise.all([generateTeacherId(), generateEmployeeCode()])
      .then(([generatedTeacherId, employeeCode]) => updateSection("employment", { ...formData.employment, teacherId: generatedTeacherId, employeeCode }))
      .catch(() => {
        hasLoadedGeneratedIds.current = false;
        showToast("Failed to generate Teacher ID and Employee Code", "error");
      });
  }, [formData.employment, showToast, teacherId, updateSection]);

  useEffect(() => {
    if (import.meta.env.DEV) console.debug("[TeacherWizard] draft effect", { teacherId });
    if (!teacherId && !hasLoadedDraft.current) {
      loadDraft();
      hasLoadedDraft.current = true;
    }
  }, [loadDraft, teacherId]);

  useEffect(() => {
    if (import.meta.env.DEV) console.debug("[TeacherWizard] teacher effect", { teacherId });
    if (!teacherId) return;
    const hasLoaded = hasLoadedTeacher.current;
    if (hasLoaded) return;
    hasLoadedTeacher.current = true;
    getTeacherById(teacherId).then((teacher) => {
      if (!teacher) return;
      loadTeacher({
        employment: { teacherId: teacher.teacherId, employeeCode: teacher.employeeCode || "", joiningDate: teacher.joiningDate || "", employmentType: teacher.employmentType || "permanent", department: teacher.department || "", designation: teacher.designation || "", status: teacher.status, reportingManager: teacher.reportingManager || "" },
        personal: { photo: teacher.photo, firstName: teacher.firstName, middleName: teacher.middleName || "", lastName: teacher.lastName, gender: teacher.gender, dob: teacher.dob, nationality: teacher.nationality || "", religion: teacher.religion || "", maritalStatus: teacher.maritalStatus || "", phone: teacher.phone, alternativePhone: teacher.alternativePhone || "", email: teacher.email, citizenshipNumber: teacher.citizenshipNumber || "", passportNumber: teacher.passportNumber || "" },
        emergency: { relationship: teacher.relationship || teacher.emergencyRelationship || "", emergencyContactName: teacher.emergencyContactName || teacher.emergencyContactPerson || "", emergencyContactNumber: teacher.emergencyContactNumber || teacher.emergencyPhone || "", alternativePhone: teacher.alternativePhone || "", email: teacher.emergencyEmail || "" },
        education: { highestQualification: teacher.qualification || "", university: teacher.university || "", specialization: teacher.specialization || "", passingYear: teacher.passingYear || "", experience: teacher.experience || "" },
        medical: { bloodGroup: teacher.bloodGroup || "", height: teacher.height || "", weight: teacher.weight || "", medicalConditions: teacher.medicalConditions || "", allergies: teacher.allergies || "", disability: teacher.disability || "", emergencyContactName: teacher.emergencyContactName || teacher.emergencyContactPerson || "", emergencyContactNumber: teacher.emergencyContactNumber || teacher.emergencyPhone || "" },
        address: { currentProvince: teacher.currentProvince || "", currentDistrict: teacher.currentDistrict || "", currentMunicipality: teacher.currentMunicipality || "", currentWard: teacher.currentWard || "", currentStreet: teacher.currentStreet || "", permanentSameAsCurrent: teacher.permanentSameAsCurrent || false, permanentProvince: teacher.permanentProvince || "", permanentDistrict: teacher.permanentDistrict || "", permanentMunicipality: teacher.permanentMunicipality || "", permanentWard: teacher.permanentWard || "", permanentStreet: teacher.permanentStreet || "" },
        bank: { bankName: "", accountNumber: "", accountHolderName: "", panNumber: "", documents: undefined, photo: undefined, notes: "" },
        documents: { documents: undefined },
        login: { createLogin: false, username: "", email: "", password: "", confirmPassword: "" },
      });
    }).catch(() => showToast("Failed to load teacher", "error"));
  }, [teacherId, loadTeacher, showToast]);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      console.log(formData);
      const parsed = teacherFormSchema.safeParse(formData);
      if (!parsed.success) {
        const errors = Object.fromEntries(parsed.error.issues.map((issue) => [issue.path.join("."), issue.message]));
        setFieldErrors(errors);
        const firstStep = steps.findIndex((step) => Object.keys(errors).some((path) => path.startsWith(`${step.section}.`)));
        if (firstStep >= 0) setCurrentStep(firstStep);
        return;
      }
      setFieldErrors({});
      if (teacherId) await updateTeacher(teacherId, parsed.data); else await createTeacher(parsed.data);
      showToast(`Teacher ${teacherId ? "updated" : "saved"} successfully!`, "success");
      clearDraft();
      navigate("/admin/teachers");
    } catch (error) {
      const response = (error as { response?: { data?: { message?: string; errors?: Record<string, string> } } }).response?.data;
      if (response?.errors) {
        const fieldMap: Record<string, string> = {
          employeeNumber: "employment.teacherId",
          firstName: "personal.firstName",
          lastName: "personal.lastName",
          phone: "personal.phone",
          email: "personal.email",
          qualification: "education.highestQualification",
          employeeCode: "employment.employeeCode",
        };
        const errors = Object.fromEntries(Object.entries(response.errors).map(([field, message]) => [fieldMap[field] || field, message]));
        setFieldErrors(errors);
        const firstStep = steps.findIndex((step) => Object.keys(errors).some((path) => path.startsWith(`${step.section}.`)));
        if (firstStep >= 0) setCurrentStep(firstStep);
      } else {
        showToast(response?.message || "Failed to save teacher", "error");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleNext = () => {
    if (import.meta.env.DEV) console.debug("[TeacherWizard] next click", { currentStep });
    if (import.meta.env.DEV) console.debug("[TeacherWizard] validation start", { currentStep });
    // Step transitions currently have no validation gate.
    if (import.meta.env.DEV) console.debug("[TeacherWizard] validation end", { currentStep, valid: true });
    nextStep();
  };

  const handlePrevious = () => {
    if (import.meta.env.DEV) console.debug("[TeacherWizard] previous click", { currentStep });
    prevStep();
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
            errors={sectionErrors(fieldErrors, "employment")}
          />
        )}

        {currentStep === 1 && (
          <TeacherPersonalSection
            data={formData.personal}
            onChange={(data) => updateSection("personal", data)}
            errors={sectionErrors(fieldErrors, "personal")}
          />
        )}

        {currentStep === 2 && (
          <TeacherEmergencySection
            data={formData.emergency}
            onChange={(data) => updateSection("emergency", data)}
            errors={sectionErrors(fieldErrors, "emergency")}
          />
        )}

        {currentStep === 3 && (
          <TeacherEducationSection
            data={formData.education}
            onChange={(data) => updateSection("education", data)}
            errors={sectionErrors(fieldErrors, "education")}
          />
        )}

        {currentStep === 4 && (
          <div className="space-y-4">
            <TeacherMedicalSection
              data={formData.medical}
              onChange={(data) => updateSection("medical", data)}
              errors={sectionErrors(fieldErrors, "medical")}
            />
            <TeacherAddressSection
              data={formData.address}
              onChange={(data) => updateSection("address", data)}
              errors={sectionErrors(fieldErrors, "address")}
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
        onPrev={handlePrevious}
        onNext={handleNext}
        submitLabel={teacherId ? "Update Teacher" : "Save Teacher"}
      />
    </div>
  );
};

export default TeacherForm;
