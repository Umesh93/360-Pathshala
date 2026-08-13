import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import StudentAcademicSection from "./StudentAcademicSection";
import StudentPersonalSection from "./StudentPersonalSection";
import GuardianSection from "./GuardianSection";
import AddressSection from "./AddressSection";
import MedicalSection from "./MedicalSection";
import AcademicHistorySection from "./AcademicHistorySection";
import HostelSection from "./HostelSection";
import TransportSection from "./TransportSection";
import DocumentsSection from "./DocumentsSection";
import LoginSection from "./LoginSection";
import NotesSection from "./NotesSection";
import StudentFormFooter from "./StudentFormFooter";
import { useStudentForm } from "../hooks/useStudentForm";
import {
  createStudent,
  generateAdmissionNo,
  loadStudentEditData,
  updateStudent,
} from "../services/student.service";
import type { StudentEditLookups } from "../types/student.types";
import { useToast } from "./Toast";
import {
  studentFormSchema,
  type StudentFormData,
} from "../schemas/student.schema";

type SectionKey = keyof StudentFormData;

const steps: { title: string; section: SectionKey }[] = [
  { title: "Academic", section: "academicInfo" },
  { title: "Personal", section: "personalInfo" },
  { title: "Guardian", section: "guardian" },
  { title: "Address & Medical", section: "address" },
  {
    title: "History, Hostel, Transport, Docs, Login, Notes",
    section: "academicHistory",
  },
];

const sectionErrors = (errors: Record<string, string>, section: SectionKey) =>
  Object.fromEntries(
    Object.entries(errors)
      .filter(([path]) => path.startsWith(`${section}.`))
      .map(([path, message]) => [path.slice(section.length + 1), message]),
  );

const splitName = (name?: string) => {
  const parts = name?.trim().split(/\s+/).filter(Boolean) || [];
  return {
    firstName: parts[0] || "",
    middleName: parts.length > 2 ? parts.slice(1, -1).join(" ") : "",
    lastName: parts.length > 1 ? parts[parts.length - 1] : "",
  };
};

interface SuccessDialogProps {
  admissionNo: string;
  rollNumber: string;
  onAddAnother: () => void;
  onViewStudent: (id: number) => void;
  onClose: () => void;
  studentId?: number;
}

const SuccessDialog: React.FC<SuccessDialogProps> = ({
  admissionNo,
  rollNumber,
  onAddAnother,
  onViewStudent,
  onClose,
  studentId,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl p-6 shadow-xl max-w-md w-full mx-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
            <span className="text-green-600 text-xl">✓</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-800">
            Student registered successfully
          </h3>
        </div>
        <div className="space-y-2 mb-6">
          <p className="text-sm text-gray-600">
            Admission No:{" "}
            <span className="font-medium text-gray-800">{admissionNo}</span>
          </p>
          <p className="text-sm text-gray-600">
            Roll No:{" "}
            <span className="font-medium text-gray-800">{rollNumber}</span>
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={onAddAnother}
            className="w-full px-4 py-2.5 rounded-xl bg-[#234A91] text-white text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            Add Another Student
          </button>
          {studentId && (
            <button
              type="button"
              onClick={() => onViewStudent(studentId)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              View Student
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Student List
          </button>
        </div>
      </div>
    </div>
  );
};

interface StudentFormProps {
  studentId?: number;
  submitLabel?: string;
}

const StudentForm: React.FC<StudentFormProps> = ({ studentId }) => {
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
    loadStudent,
    clearDraft,
    setCurrentStep,
    resetForm,
    fieldErrors,
    setFieldErrors,
    validateStep,
    validateAll,
    stepErrors,
  } = useStudentForm();
  const hasLoadedDraft = useRef(false);
  const hasLoadedStudent = useRef(false);
  const hasLoadedAdmissionNumber = useRef(false);
  const submissionLock = useRef(false);
  const [editLookups, setEditLookups] = useState<StudentEditLookups>();
  const [successData, setSuccessData] = useState<{
    admissionNo: string;
    rollNumber: string;
    studentId?: number;
  } | null>(null);
  const [errorSummary, setErrorSummary] = useState<
    { step: number; title: string }[]
  >([]);

  useEffect(() => {
    if (studentId || hasLoadedAdmissionNumber.current) return;
    hasLoadedAdmissionNumber.current = true;
    generateAdmissionNo()
      .then((admissionNo) =>
        updateSection("academicInfo", {
          ...formData.academicInfo,
          admissionNo,
        }),
      )
      .catch(() => {
        hasLoadedAdmissionNumber.current = false;
        showToast("Failed to generate Admission Number", "error");
      });
  }, [formData.academicInfo, showToast, studentId, updateSection]);

  useEffect(() => {
    if (!studentId && !hasLoadedDraft.current) {
      loadDraft();
      hasLoadedDraft.current = true;
    }
  }, [loadDraft, studentId]);

  useEffect(() => {
    if (studentId && !hasLoadedStudent.current) {
      const fetchStudent = async () => {
        try {
          const { student, lookups } = await loadStudentEditData(studentId);
          if (student) {
            const father = splitName(student.guardian.fatherName);
            const mother = splitName(student.guardian.motherName);
            const guardianSelection =
              student.guardian.guardianSelection ||
              (student.guardian.relationship?.toLowerCase() === "father"
                ? "father"
                : student.guardian.relationship?.toLowerCase() === "mother"
                  ? "mother"
                  : "other");
            const formData: StudentFormData = {
              academicInfo: {
                academicYear: student.academicYear || "2083/2084 BS",
                medium: student.medium === "Nepali" ? "Nepali" : "English",
                admissionNo: student.admissionNo,
                admissionDate:
                  student.admissionDate ||
                  new Date().toISOString().split("T")[0],
                class: student.classId ? String(student.classId) : "",
                className: student.className,
                section: student.sectionId ? String(student.sectionId) : "",
                sectionName: student.sectionName,
                rollNumber: student.rollNumber,
                house: student.house || "",
                status:
                  student.status === "inactive"
                    ? "inactive"
                    : student.status === "transferred"
                      ? "transfer"
                      : "active",
                scholarship: student.scholarship || "",
              },
              personalInfo: {
                firstName: student.firstName,
                middleName: student.middleName || "",
                lastName: student.lastName,
                dob: student.dob,
                gender: student.gender,
                bloodGroup: student.bloodGroup || "",
                religion: student.religion || "",
                caste: student.caste || "",
                nationality: student.nationality || "Nepalese",
                motherTongue: student.motherTongue || "",
                phone: student.phone,
                email: student.email || "",
                citizenshipNumber: student.citizenshipNumber || "",
                studentIdBarcode: student.studentIdBarcode || "",
                photo: student.photo,
              },
              guardian: {
                fatherFirstName:
                  student.guardian.fatherFirstName || father.firstName,
                fatherMiddleName:
                  student.guardian.fatherMiddleName || father.middleName,
                fatherLastName:
                  student.guardian.fatherLastName || father.lastName,
                fatherOccupation: student.guardian.fatherOccupation || "",
                fatherPhone:
                  student.guardian.fatherPhone || student.guardian.phone || "",
                fatherEmail:
                  student.guardian.fatherEmail || student.guardian.email || "",
                fatherPhoto: student.guardian.fatherPhoto,
                fatherCitizenship: student.guardian.fatherCitizenship || "",
                motherFirstName:
                  student.guardian.motherFirstName || mother.firstName,
                motherMiddleName:
                  student.guardian.motherMiddleName || mother.middleName,
                motherLastName:
                  student.guardian.motherLastName || mother.lastName,
                motherOccupation: student.guardian.motherOccupation || "",
                motherPhone: student.guardian.motherPhone || "",
                motherEmail: student.guardian.motherEmail || "",
                motherPhoto: student.guardian.motherPhoto,
                motherCitizenship: student.guardian.motherCitizenship || "",
                guardianSelection,
                guardianName:
                  student.guardianName || student.guardian.guardianName || "",
                guardianRelationship: student.guardian.relationship || "",
                guardianOccupation: student.guardian.occupation || "",
                guardianPhone: student.guardian.phone || "",
                guardianEmail: student.guardian.email || "",
                guardianAddress: student.guardian.address || "",
                guardianCitizenship: student.guardian.citizenship || "",
              },
              address: {
                currentProvince: student.provinceId
                  ? String(student.provinceId)
                  : "",
                currentProvinceName: student.province || "",
                currentDistrict: student.districtId
                  ? String(student.districtId)
                  : "",
                currentDistrictName: student.district || "",
                currentMunicipality: student.municipality || "",
                currentMunicipalityName: student.municipality || "",
                currentWard: student.ward ? String(student.ward) : "",
                currentWardNumber: student.ward ? String(student.ward) : "",
                currentStreet:
                  student.street || (student.address as string) || "",
                permanentSameAsCurrent: false,
                permanentProvince: "",
                permanentDistrict: "",
                permanentMunicipality: "",
                permanentWard: "",
                permanentStreet: "",
              },
              medical: {
                bloodGroup:
                  student.medicalBloodGroup || student.bloodGroup || "",
                height: student.height || "",
                weight: student.weight || "",
                medicalConditions: student.medicalConditions || "",
                medicalConditionsOther: student.medicalConditionsOther || "",
                allergies: student.allergies || "",
                disability: student.disability || "",
                emergencyContactPerson:
                  student.emergencyContactPerson || "Father",
                emergencyContactNumber:
                  student.emergencyContactNumber ||
                  student.emergencyContact ||
                  student.guardian.phone ||
                  "",
              },
              academicHistory: {
                previousSchool: student.previousSchool || "",
                previousAddress: student.previousAddress || "",
                previousClass: student.previousClass || "",
                transferCertificateNumber:
                  student.transferCertificateNumber || "",
                reasonForLeaving: student.reasonForLeaving || "",
                emisId: student.emisId || "",
              },
              hostel: {
                hasHostel: student.hasHostel || false,
                hostel: student.hostel || "",
                roomNumber: student.roomNumber || "",
                bedNumber: student.bedNumber || "",
              },
              transport: {
                usesTransport: student.usesTransport || false,
                route: student.route || "",
                pickupPoint: student.pickupPoint || "",
                vehicle: student.vehicle || "",
              },
              documents: {
                documents: student.documents || undefined,
                documentCategories: student.documentCategories
                  ? student.documentCategories.split(",")
                  : [],
              },
              login: {
                createLogin: false,
                email: student.email || "",
                username: "",
                password: "",
                confirmPassword: "",
              },
              notes: {
                notes: student.notes || "",
              },
            };
            loadStudent(formData);
            setEditLookups(lookups);
            hasLoadedStudent.current = true;
          }
        } catch {
          showToast("Failed to load student data", "error");
        }
      };

      fetchStudent();
    }
  }, [studentId, loadStudent, showToast]);

  const scrollToFirstError = (errors: Record<string, string>) => {
    setTimeout(() => {
      const firstErrorPath = Object.keys(errors)[0];
      if (!firstErrorPath) return;
      const field = firstErrorPath.split(".").pop();
      const element = document.querySelector(
        `[data-field="${field}"]`,
      ) as HTMLElement | null;
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
        element.focus();
        element.classList.add("ring-2", "ring-red-500");
        setTimeout(
          () => element.classList.remove("ring-2", "ring-red-500"),
          2000,
        );
      }
    }, 100);
  };

  const handleNext = () => {
    const isValid = validateStep(currentStep);
    if (!isValid) {
      showToast("Please complete all required fields.", "validation");
      setTimeout(() => {
        const element = document.querySelector(
          '[aria-invalid="true"]',
        ) as HTMLElement | null;
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
          element.focus();
        }
      }, 100);
      return;
    }
    nextStep();
  };

  const handleSubmit = async () => {
    if (submissionLock.current) return;
    submissionLock.current = true;
    setSubmitting(true);
    try {
      const { isValid, firstErrorStep, errors, errorSteps } = validateAll();
      if (!isValid) {
        setCurrentStep(firstErrorStep);
        setErrorSummary(
          Array.from(errorSteps).map((stepIndex) => ({
            step: stepIndex,
            title: steps[stepIndex].title,
          })),
        );
        scrollToFirstError(errors);
        showToast("Please complete all required fields.", "validation");
        return;
      }
      setErrorSummary([]);
      const parsed = studentFormSchema.safeParse(formData);
      if (!parsed.success) {
        const errors = Object.fromEntries(
          parsed.error.issues.map((issue) => [
            issue.path.join("."),
            issue.message,
          ]),
        );
        setFieldErrors(errors);
        const firstStep = steps.findIndex((step) =>
          Object.keys(errors).some((path) =>
            path.startsWith(`${step.section}.`),
          ),
        );
        if (firstStep >= 0) setCurrentStep(firstStep);
        scrollToFirstError(errors);
        showToast("Please complete all required fields.", "validation");
        return;
      }
      setFieldErrors({});
      let savedStudentId = studentId;
      if (studentId) {
        await updateStudent(studentId, parsed.data);
        showToast("Student updated successfully!", "success");
      } else {
        const saved = await createStudent(parsed.data);
        savedStudentId = saved.id;
        showToast("Student registered successfully!", "success");
      }
      clearDraft();
      setSuccessData({
        admissionNo: formData.academicInfo.admissionNo,
        rollNumber: formData.academicInfo.rollNumber,
        studentId: savedStudentId,
      });
    } catch (error) {
      const response = (
        error as {
          response?: {
            data?: { message?: string; errors?: Record<string, string> };
          };
        }
      ).response?.data;
      if (response?.errors) {
        const fieldMap: Record<string, string> = {
          admissionNumber: "academicInfo.admissionNo",
          rollNumber: "academicInfo.rollNumber",
          classId: "academicInfo.class",
          sectionId: "academicInfo.section",
          firstName: "personalInfo.firstName",
          lastName: "personalInfo.lastName",
          dateOfBirth: "personalInfo.dob",
          gender: "personalInfo.gender",
        };
        const errors = Object.fromEntries(
          Object.entries(response.errors).map(([field, message]) => [
            fieldMap[field] || field,
            message,
          ]),
        );
        setFieldErrors(errors);
        const firstStep = steps.findIndex((step) =>
          Object.keys(errors).some((path) =>
            path.startsWith(`${step.section}.`),
          ),
        );
        if (firstStep >= 0) setCurrentStep(firstStep);
        scrollToFirstError(errors);
      } else
        showToast(
          response?.message || "Unable to save student. Please try again.",
          "server",
        );
    } finally {
      submissionLock.current = false;
      setSubmitting(false);
    }
  };

  const handleAddAnother = async () => {
    setSuccessData(null);
    await resetForm();
    setCurrentStep(0);
    window.scrollTo({ top: 0, behavior: "smooth" });
    setTimeout(() => {
      const firstNameInput = document.querySelector(
        'input[data-field="firstName"]',
      ) as HTMLInputElement | null;
      firstNameInput?.focus();
    }, 300);
  };

  const handleViewStudent = (id: number) => {
    setSuccessData(null);
    navigate(`/admin/students/${id}`);
  };

  const handleCloseSuccess = () => {
    setSuccessData(null);
    navigate("/admin/students");
  };

  const handleCancel = () => {
    navigate("/admin/students");
  };

  const handleSaveDraft = () => {
    saveDraft();
    showToast("Draft saved", "success");
  };

  const getStepStatus = (index: number) => {
    if (stepErrors.has(index)) return "error";
    if (index < currentStep) return "completed";
    if (index === currentStep) return "current";
    return "upcoming";
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <div className="flex items-center gap-4 overflow-x-auto pb-2">
          {steps.map((step, index) => {
            const status = getStepStatus(index);
            const statusColors = {
              completed: "bg-green-500 text-white",
              current: "bg-[#234A91] text-white",
              error: "bg-red-500 text-white",
              upcoming: "bg-gray-200 text-gray-500",
            };
            return (
              <div key={step.section} className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${statusColors[status]}`}
                >
                  {status === "completed" ? "✓" : index + 1}
                </div>
                <span
                  className={`text-sm whitespace-nowrap ${status === "upcoming" ? "text-gray-500" : "text-gray-900 font-medium"}`}
                >
                  {step.title}
                </span>
                {index < steps.length - 1 && (
                  <div
                    className={`w-8 h-px mx-2 ${index < currentStep ? "bg-green-500" : "bg-gray-300"}`}
                  />
                )}
              </div>
            );
          })}
        </div>
        {errorSummary.length > 0 && (
          <div className="mt-3 p-3 bg-red-50 rounded-lg">
            <p className="text-sm text-red-700 font-medium mb-2">
              The following sections require attention:
            </p>
            <div className="flex flex-wrap gap-2">
              {errorSummary.map((item) => (
                <button
                  key={item.step}
                  type="button"
                  onClick={() => setCurrentStep(item.step)}
                  className="text-sm px-3 py-1 rounded-full bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
                >
                  {item.title}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {currentStep === 0 && (
          <StudentAcademicSection
            data={formData.academicInfo}
            onChange={(data) => updateSection("academicInfo", data)}
            lookupData={editLookups}
            autoGenerateRollNumber={!studentId}
            errors={sectionErrors(fieldErrors, "academicInfo")}
          />
        )}

        {currentStep === 1 && (
          <StudentPersonalSection
            data={formData.personalInfo}
            onChange={(data) => updateSection("personalInfo", data)}
            errors={sectionErrors(fieldErrors, "personalInfo")}
          />
        )}

        {currentStep === 2 && (
          <GuardianSection
            data={formData.guardian}
            onChange={(data) => updateSection("guardian", data)}
            errors={sectionErrors(fieldErrors, "guardian")}
          />
        )}

        {currentStep === 3 && (
          <div className="space-y-4">
            <AddressSection
              data={formData.address}
              onChange={(data) => updateSection("address", data)}
              errors={sectionErrors(fieldErrors, "address")}
            />
            <MedicalSection
              data={formData.medical}
              onChange={(data) => updateSection("medical", data)}
              guardianData={formData.guardian}
              errors={sectionErrors(fieldErrors, "medical")}
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

      {successData && (
        <SuccessDialog
          admissionNo={successData.admissionNo}
          rollNumber={successData.rollNumber}
          studentId={successData.studentId}
          onAddAnother={handleAddAnother}
          onViewStudent={handleViewStudent}
          onClose={handleCloseSuccess}
        />
      )}

      <StudentFormFooter
        onCancel={handleCancel}
        onSaveDraft={handleSaveDraft}
        onSubmit={handleSubmit}
        submitting={submitting}
        currentStep={currentStep}
        totalSteps={steps.length}
        onPrev={prevStep}
        onNext={handleNext}
        submitLabel={studentId ? "Update Student" : "Save Student"}
      />
    </div>
  );
};

export default StudentForm;
