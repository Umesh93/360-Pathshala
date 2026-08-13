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
    gender: "male",
    dob: "",
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
    emergencyContactName: "",
    relationship: "",
    emergencyContactNumber: "",
    alternativePhone: "",
    email: "",
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
  },
  medical: {
    bloodGroup: "",
    height: "",
    weight: "",
    medicalConditions: "",
    allergies: "",
    disability: "",
    emergencyContactName: "",
    emergencyContactNumber: "",
  },
  bank: {
    bankName: "",
    accountNumber: "",
    accountHolderName: "",
    panNumber: "",
    documents: undefined,
    photo: undefined,
    notes: "",
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

  const updateSection = useCallback(
    <T extends SectionKey>(section: T, value: TeacherFormData[T]) => {
      if (import.meta.env.DEV)
        console.debug("[TeacherWizard] section update", section);
      setFormData((prev) => ({ ...prev, [section]: value }));
    },
    [],
  );

  const nextStep = useCallback(() => {
    setCurrentStep((prev) => {
      const next = Math.min(prev + 1, 5);
      if (import.meta.env.DEV)
        console.debug("[TeacherWizard] step state", {
          before: prev,
          after: next,
        });
      return next;
    });
  }, []);

  const prevStep = useCallback(() => {
    setCurrentStep((prev) => {
      const next = Math.max(prev - 1, 0);
      if (import.meta.env.DEV)
        console.debug("[TeacherWizard] step state", {
          before: prev,
          after: next,
        });
      return next;
    });
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
  const loadTeacher = useCallback(
    (teacher: TeacherFormData) => setFormData(teacher),
    [],
  );

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
