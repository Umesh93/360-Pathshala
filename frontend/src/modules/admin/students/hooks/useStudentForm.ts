import { useState, useCallback } from "react";
import type { StudentFormData } from "../schemas/student.schema";
import { generateAdmissionNo } from "../services/student.service";

const STORAGE_KEY = "student_form_draft";

const initialFormData: StudentFormData = {
  academicInfo: {
    academicYear: "2083/2084 BS",
    medium: "English",
    admissionNo: "",
    admissionDate: new Date().toISOString().split("T")[0],
    class: "",
    className: "",
    section: "",
    sectionName: "",
    rollNumber: "",
    house: "",
    status: "active",
    scholarship: "",
  },
  personalInfo: {
    firstName: "",
    middleName: "",
    lastName: "",
    dob: "",
    gender: "male",
    bloodGroup: "",
    religion: "",
    caste: "",
    nationality: "Nepalese",
    motherTongue: "",
    phone: "",
    email: "",
    citizenshipNumber: "",
    studentIdBarcode: "",
    photo: undefined,
  },
  guardian: {
    guardianId: undefined,
    fatherName: "",
    fatherOccupation: "",
    fatherPhone: "",
    fatherEmail: "",
    fatherPhoto: undefined,
    motherName: "",
    motherOccupation: "",
    motherPhone: "",
    motherEmail: "",
    motherPhoto: undefined,
    guardianSelection: "father",
    guardianName: "",
    guardianRelationship: "",
    guardianOccupation: "",
    guardianPhone: "",
    guardianEmail: "",
    guardianAddress: "",
    guardianPhoto: undefined,
  },
  address: {
    currentProvince: "",
    currentProvinceName: "",
    currentDistrict: "",
    currentDistrictName: "",
    currentMunicipality: "",
    currentMunicipalityName: "",
    currentWard: "",
    currentWardNumber: "",
    currentStreet: "",
    permanentSameAsCurrent: false,
    permanentProvince: "",
    permanentDistrict: "",
    permanentMunicipality: "",
    permanentWard: "",
    permanentStreet: "",
  },
  medical: {
    bloodGroup: "",
    height: "",
    weight: "",
    medicalConditions: "",
    medicalConditionsOther: "",
    allergies: "",
    disability: "",
    emergencyContactPerson: "",
    emergencyContactNumber: "",
  },
  academicHistory: {
    previousSchool: "",
    previousAddress: "",
    previousClass: "",
    transferCertificateNumber: "",
    reasonForLeaving: "",
    emisId: "",
  },
  hostel: {
    hasHostel: false,
    hostel: "",
    roomNumber: "",
    bedNumber: "",
  },
  transport: {
    usesTransport: false,
    route: "",
    pickupPoint: "",
    vehicle: "",
  },
  documents: {
    documents: undefined,
  },
  login: {
    createLogin: false,
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
  },
  notes: {
    notes: "",
  },
};

type SectionKey = keyof StudentFormData;

const SECTION_FIELDS: Record<SectionKey, string[]> = {
  academicInfo: ["academicYear", "admissionNo", "admissionDate", "class", "section", "rollNumber"],
  personalInfo: ["firstName", "lastName", "dob", "gender", "religion", "caste", "phone"],
  guardian: ["guardianSelection", "fatherName", "fatherPhone"],
  address: ["currentProvince", "currentDistrict", "currentMunicipality", "currentWard"],
  medical: ["emergencyContactPerson", "emergencyContactNumber"],
  academicHistory: [],
  hostel: [],
  transport: [],
  documents: [],
  login: [],
  notes: [],
};

export const useStudentForm = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<StudentFormData>(initialFormData);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());
  const [stepErrors, setStepErrors] = useState<Set<number>>(new Set());

  const updateSection = useCallback(<T extends SectionKey>(
    section: T,
    value: StudentFormData[T]
  ) => {
    setFormData((prev) => ({ ...prev, [section]: value }));
  }, []);

  const markTouched = useCallback((field: string) => {
    setTouchedFields((prev) => {
      const next = new Set(prev);
      next.add(field);
      return next;
    });
  }, []);

  const validateStep = useCallback((stepIndex: number) => {
    const stepMap: SectionKey[] = ["academicInfo", "personalInfo", "guardian", "address", "academicHistory"];
    const section = stepMap[stepIndex];
    if (!section) return true;
    const requiredFields = SECTION_FIELDS[section] || [];
    const sectionData = formData[section];
    const newErrors: Record<string, string> = {};
    requiredFields.forEach((field) => {
      const value = (sectionData as Record<string, unknown>)[field];
      if (value === undefined || value === null || value === "") {
        newErrors[`${section}.${field}`] = "This field is required";
      }
    });
    setFieldErrors((prev) => {
      const next = { ...prev };
      requiredFields.forEach((field) => {
        delete next[`${section}.${field}`];
      });
      Object.entries(newErrors).forEach(([key, message]) => {
        next[key] = message;
      });
      return next;
    });
    const hasErrors = requiredFields.some((field) => {
      const value = (sectionData as Record<string, unknown>)[field];
      return value === undefined || value === null || value === "";
    });
    setStepErrors((prev) => {
      const next = new Set(prev);
      if (hasErrors) next.add(stepIndex); else next.delete(stepIndex);
      return next;
    });
    return !hasErrors;
  }, [formData]);

  const validateAll = useCallback(() => {
    let firstErrorStep = -1;
    const newErrors: Record<string, string> = {};
    const newStepErrors = new Set<number>();
    const stepMap: SectionKey[] = ["academicInfo", "personalInfo", "guardian", "address", "academicHistory"];
    stepMap.forEach((section, index) => {
      const requiredFields = SECTION_FIELDS[section] || [];
      const sectionData = formData[section];
      requiredFields.forEach((field) => {
        const value = (sectionData as Record<string, unknown>)[field];
        if (value === undefined || value === null || value === "") {
          newErrors[`${section}.${field}`] = "This field is required";
          if (firstErrorStep === -1) firstErrorStep = index;
        }
      });
      const hasErrors = requiredFields.some((field) => {
        const value = (sectionData as Record<string, unknown>)[field];
        return value === undefined || value === null || value === "";
      });
      if (hasErrors) newStepErrors.add(index);
    });
    setFieldErrors(newErrors);
    setStepErrors(newStepErrors);
    return { isValid: firstErrorStep === -1, firstErrorStep, errors: newErrors, errorSteps: newStepErrors };
  }, [formData]);

  const nextStep = useCallback(() => {
    const isValid = validateStep(currentStep);
    if (isValid) setCurrentStep((prev) => Math.min(prev + 1, 4));
  }, [currentStep, validateStep]);

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
        const parsed = JSON.parse(saved) as StudentFormData;
        setFormData(parsed);
      } catch {
        // ignore parse error
      }
    }
  }, []);

  const clearDraft = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const loadStudent = useCallback((student: StudentFormData) => {
    setFormData(student);
  }, []);

  const resetForm = useCallback(async () => {
    setFormData(initialFormData);
    setFieldErrors({});
    setStepErrors(new Set());
    setTouchedFields(new Set());
    try {
      const admissionNo = await generateAdmissionNo();
      setFormData((prev) => ({
        ...prev,
        academicInfo: { ...prev.academicInfo, admissionNo },
      }));
    } catch {
      // silently fail
    }
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
    loadStudent,
    clearDraft,
    resetForm,
    fieldErrors,
    setFieldErrors,
    touchedFields,
    markTouched,
    validateStep,
    validateAll,
    stepErrors,
  };
};
