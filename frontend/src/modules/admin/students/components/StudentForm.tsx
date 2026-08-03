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
import { createStudent, loadStudentEditData, updateStudent } from "../services/student.service";
import type { StudentEditLookups } from "../types/student.types";
import { useToast } from "./Toast";
import type { StudentFormData } from "../schemas/student.schema";

type SectionKey = keyof StudentFormData;

const steps: { title: string; section: SectionKey }[] = [
  { title: "Academic", section: "academicInfo" },
  { title: "Personal", section: "personalInfo" },
  { title: "Guardian", section: "guardian" },
  { title: "Address & Medical", section: "address" },
  { title: "History, Hostel, Transport, Docs, Login, Notes", section: "academicHistory" },
];

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
  } = useStudentForm();
  const hasLoadedDraft = useRef(false);
  const hasLoadedStudent = useRef(false);
  const [editLookups, setEditLookups] = useState<StudentEditLookups>();

  useEffect(() => {
    if (!studentId && !hasLoadedDraft.current) {
      loadDraft();
      hasLoadedDraft.current = true;
    }
  }, [loadDraft]);

  useEffect(() => {
    if (studentId && !hasLoadedStudent.current) {
      const fetchStudent = async () => {
        try {
           const { student, lookups } = await loadStudentEditData(studentId);
           if (student) {
            const formData: StudentFormData = {
              academicInfo: {
                academicYear: student.academicYear || "2083/2084 BS",
                medium: student.medium === "Nepali" ? "Nepali" : "English",
                admissionNo: student.admissionNo,
                admissionDate: student.admissionDate || new Date().toISOString().split("T")[0],
                class: student.classId ? String(student.classId) : "",
                className: student.className,
                section: student.sectionId ? String(student.sectionId) : "",
                sectionName: student.sectionName,
                rollNumber: student.rollNumber,
                house: student.house || "",
                status: student.status === "inactive"
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
                emisId: student.emisId || "",
                studentIdBarcode: student.studentIdBarcode || "",
                photo: student.photo,
              },
                guardian: {
                  guardianId: student.guardianId,
                 fatherName: student.guardian.fatherName || "",
                 fatherOccupation: student.guardian.fatherOccupation || "",
                 fatherPhone: student.guardian.fatherPhone || student.guardian.phone || "",
                 fatherEmail: student.guardian.fatherEmail || student.guardian.email || "",
                 fatherPhoto: undefined,
                 motherName: student.guardian.motherName || "",
                 motherOccupation: student.guardian.motherOccupation || "",
                 motherPhone: student.guardian.motherPhone || "",
                 motherEmail: student.guardian.motherEmail || "",
                 motherPhoto: undefined,
                 guardianSelection: student.guardian.guardianName && student.guardian.fatherName
                   ? (student.guardian.guardianName === student.guardian.fatherName ? "father"
                      : student.guardian.motherName && student.guardian.guardianName === student.guardian.motherName ? "mother"
                      : "other")
                   : "father",
                  guardianName: student.guardianName || student.guardian.guardianName || "",
                 guardianRelationship: student.guardian.relationship || "",
                 guardianOccupation: student.guardian.occupation || "",
                 guardianPhone: student.guardian.phone || "",
                 guardianEmail: student.guardian.email || "",
                 guardianAddress: student.guardian.address || "",
                 guardianPhoto: undefined,
               },
               address: {
                  currentProvince: student.provinceId ? String(student.provinceId) : "",
                  currentProvinceName: student.province || "",
                  currentDistrict: student.districtId ? String(student.districtId) : "",
                  currentDistrictName: student.district || "",
                  currentMunicipality: student.municipalityId ? String(student.municipalityId) : "",
                  currentMunicipalityName: student.municipality || "",
                  currentWard: student.wardId ? String(student.wardId) : "",
                  currentWardNumber: student.ward ? String(student.ward) : "",
                 currentStreet: student.street || (student.address as string) || "",
                 permanentSameAsCurrent: false,
                 permanentProvince: "",
                 permanentDistrict: "",
                 permanentMunicipality: "",
                 permanentWard: "",
                 permanentStreet: "",
               },
              medical: {
                bloodGroup: student.medicalBloodGroup || student.bloodGroup || "",
                height: student.height || "",
                weight: student.weight || "",
                medicalConditions: student.medicalConditions || "",
                medicalConditionsOther: student.medicalConditionsOther || "",
                allergies: student.allergies || "",
                disability: student.disability || "",
                emergencyContactPerson: student.emergencyContactPerson || "Father",
                emergencyContactNumber: student.emergencyContactNumber || student.emergencyContact || student.guardian.phone || "",
              },
              academicHistory: {
                previousSchool: student.previousSchool || "",
                previousAddress: student.previousAddress || "",
                previousClass: student.previousClass || "",
                transferCertificateNumber: student.transferCertificateNumber || "",
                reasonForLeaving: student.reasonForLeaving || "",
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
                documentCategories: student.documentCategories ? student.documentCategories.split(",") : [],
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

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      if (studentId) {
        await updateStudent(studentId, formData);
        showToast("Student updated successfully!", "success");
        clearDraft();
        navigate("/admin/students");
      } else {
        await createStudent(formData);
        showToast("Student saved successfully!", "success");
        clearDraft();
        navigate("/admin/students/add");
      }
    } catch (error) {
      const response = (error as {
        response?: { data?: { message?: string; errors?: Record<string, string> } };
      }).response?.data;
      const details = response?.errors ? Object.values(response.errors).join(", ") : response?.message;
      showToast(details || "Failed to save student", "error");
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
              lookupData={editLookups}
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
              lookupData={editLookups}
            />
            <MedicalSection
              data={formData.medical}
              onChange={(data) => updateSection("medical", data)}
              guardianData={formData.guardian}
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

      <StudentFormFooter
        onCancel={handleCancel}
        onSaveDraft={handleSaveDraft}
        onSubmit={handleSubmit}
        submitting={submitting}
        currentStep={currentStep}
        totalSteps={steps.length}
        onPrev={prevStep}
        onNext={nextStep}
        submitLabel={studentId ? "Update Student" : "Save Student"}
      />
    </div>
  );
};

export default StudentForm;
