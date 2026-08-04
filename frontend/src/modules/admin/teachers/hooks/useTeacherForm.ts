import { useState, useCallback } from "react";
import type { TeacherFormData } from "../schemas/teacher.schema";

const STORAGE_KEY = "teacher_form_draft";

const initialFormData: TeacherFormData = {
  employment: {
    teacherId: "",
    employeeCode: "",
    joiningDate: "",
    employmentType: "permanent",
    department: "",
    designation: "",
    status: "active",
    reportingManager: "",
  },
  personal: {
    photo: undefined,
    firstName: "",
    middleName: "",
    lastName: "",
    fullName: "",
    gender: "male",
    dob: "",
    bloodGroup: "",
    nationality: "",
    religion: "",
    maritalStatus: "",
    phone: "",
    alternativePhone: "",
    email: "",
    citizenshipNumber: "",
    passportNumber: "",
  },
  emergency: {
    fatherName: "",
    fatherPhone: "",
    motherName: "",
    motherPhone: "",
    spouseName: "",
    spousePhone: "",
    emergencyContactPerson: "",
    relationship: "father",
    phone: "",
    email: "",
    address: "",
  },
  address: {
    currentProvince: "",
    currentDistrict: "",
    currentMunicipality: "",
    currentWard: "",
    currentStreet: "",
    permanentSameAsCurrent: false,
    permanentProvince: "",
    permanentDistrict: "",
    permanentMunicipality: "",
    permanentWard: "",
    permanentStreet: "",
  },
  education: {
    highestQualification: "",
    university: "",
    specialization: "",
    passingYear: "",
    experience: "",
    previousOrganization: "",
    teachingLicenseNumber: "",
    languagesKnown: [],
  },
  medical: {
    bloodGroup: "",
    height: "",
    weight: "",
    medicalConditions: "",
    allergies: "",
    disability: "",
    doctorName: "",
    emergencyContact: "",
  },
  bank: {
    panNumber: "",
  },
  documents: {
    documents: undefined,
  },
  login: {
    createLogin: false,
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  },
};

type SectionKey = keyof TeacherFormData;

export const useTeacherForm = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<TeacherFormData>(initialFormData);

  const updateSection = useCallback(<T extends SectionKey>(
    section: T,
    value: TeacherFormData[T]
  ) => {
    setFormData((prev) => ({ ...prev, [section]: value }));
  }, []);

  const nextStep = useCallback(() => {
    setCurrentStep((prev) => Math.min(prev + 1, 5));
  }, []);

  const prevStep = useCallback(() => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  }, []);

  const saveDraft = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
  }, [formData]);

  const loadDraft = useCallback(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as TeacherFormData;
        setFormData(parsed);
      } catch {
        // ignore parse error
      }
    }
  }, []);

  const clearDraft = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const resetForm = useCallback(() => {
    setFormData(initialFormData);
    setCurrentStep(0);
  }, []);
  const loadTeacher = useCallback((teacher: TeacherFormData) => setFormData(teacher), []);

  return {
    currentStep,
    setCurrentStep,
    formData,
    updateSection,
    submitting,
    setSubmitting,
    nextStep,
    prevStep,
    saveDraft,
    loadDraft,
    clearDraft,
    resetForm,
    loadTeacher,
  };
};
