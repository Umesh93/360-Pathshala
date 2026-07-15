import { useState, useCallback } from "react";
import type { StudentFormData } from "../schemas/student.schema";

const STORAGE_KEY = "student_form_draft";

const initialFormData: StudentFormData = {
  academicInfo: {
    academicYear: "",
    admissionNo: "",
    admissionDate: new Date().toISOString().split("T")[0],
    class: "",
    section: "",
    rollNumber: "",
    house: "",
    status: "active",
    category: "General",
    scholarship: "",
  },
  personalInfo: {
    firstName: "",
    middleName: "",
    lastName: "",
    fullName: "",
    dob: "",
    gender: "male",
    bloodGroup: "",
    religion: "",
    nationality: "",
    motherTongue: "",
    phone: "",
    email: "",
    citizenshipNumber: "",
    studentIdBarcode: "",
    photo: undefined,
  },
  guardian: {
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
  medical: {
    bloodGroup: "",
    height: "",
    weight: "",
    medicalConditions: "",
    allergies: "",
    disability: "",
    doctorName: "",
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
  bank: {
    bankName: "",
    accountNumber: "",
    branch: "",
    ifsc: "",
    nationalId: "",
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
  };
};
