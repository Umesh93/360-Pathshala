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
  academicAssignment: {
    primarySubject: "",
    secondarySubjects: [],
    assignedClasses: [],
    assignedSections: [],
    classTeacher: false,
    academicYear: "",
    shift: "morning",
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
    motherName: "",
    spouseName: "",
    emergencyContactPerson: "",
    relationship: "",
    phone: "",
    email: "",
    address: "",
  },
  address: {
    currentAddress: "",
    currentProvince: "",
    currentDistrict: "",
    currentMunicipality: "",
    currentWard: "",
    currentStreet: "",
    permanentSameAsCurrent: false,
    permanentAddress: "",
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
    previousEmployer: "",
    previousSchool: "",
    teachingLicenseNumber: "",
    licenseExpiryDate: "",
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
    bankName: "",
    branch: "",
    accountNumber: "",
    accountHolderName: "",
    ifsc: "",
    panNumber: "",
    taxNumber: "",
    salaryType: "monthly",
    basicSalary: "",
    allowances: "",
  },
  social: {
    facebook: "",
    linkedin: "",
    instagram: "",
    twitter: "",
    youtube: "",
    personalWebsite: "",
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
  notes: {
    bio: "",
    teachingPhilosophy: "",
    achievements: "",
    awards: "",
    remarks: "",
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
  };
};
