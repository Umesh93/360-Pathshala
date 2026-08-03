import { useState, useCallback } from "react";
import type { StudentFormData } from "../schemas/student.schema";

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
    emisId: "",
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

export const useStudentForm = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<StudentFormData>(initialFormData);

  const updateSection = useCallback(<T extends SectionKey>(
    section: T,
    value: StudentFormData[T]
  ) => {
    setFormData((prev) => ({ ...prev, [section]: value }));
  }, []);

  const nextStep = useCallback(() => {
    setCurrentStep((prev) => Math.min(prev + 1, 4));
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
  };
};
