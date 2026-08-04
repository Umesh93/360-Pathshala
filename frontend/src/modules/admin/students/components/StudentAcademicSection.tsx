import React, { useEffect, useState, useCallback, useRef } from "react";
import type { AcademicInfoData } from "../schemas/student.schema";
import { getNextRollNumber, getClasses, getSections } from "../services/student.service";
import RequiredLabel from "../../../../components/forms/RequiredLabel";

interface StudentAcademicSectionProps {
  data: AcademicInfoData;
  onChange: (data: AcademicInfoData) => void;
  errors?: Record<string, string>;
  lookupData?: {
    classes: { id: number; name: string }[];
    sections: { id: number; name: string; classId: number }[];
  };
  autoGenerateRollNumber?: boolean;
}

const StudentAcademicSection: React.FC<StudentAcademicSectionProps> = ({
  data,
  onChange,
  errors = {},
  lookupData,
  autoGenerateRollNumber = true,
}) => {
  const update = useCallback((field: keyof AcademicInfoData, value: string) => {
    onChange({ ...data, [field]: value });
  }, [data, onChange]);

  const [rollNumberLoading, setRollNumberLoading] = useState(false);
  const [classes, setClasses] = useState<{ id: number; name: string }[]>([]);
  const [sections, setSections] = useState<{ id: number; name: string; classId: number }[]>([]);
  const rollRequestRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (lookupData) {
      Promise.resolve().then(() => {
        setClasses(lookupData.classes);
        setSections(lookupData.sections);
      });
      return;
    }
    getClasses().then(setClasses);
  }, [lookupData]);

  useEffect(() => {
    if (lookupData || !data.class) {
      if (!lookupData) Promise.resolve().then(() => setSections([]));
      return;
    }
    getSections(Number(data.class)).then(setSections);
  }, [data.class, lookupData]);

  const availableSections = data.class
    ? sections.filter((s) => s.classId === Number(data.class))
    : sections;

  useEffect(() => {
    if (autoGenerateRollNumber && data.class && data.section) {
      const requestKey = `${data.class}:${data.section}`;
      if (rollRequestRef.current === requestKey) return;
      rollRequestRef.current = requestKey;
      Promise.resolve().then(() => setRollNumberLoading(true));
      getNextRollNumber(data.class, data.section).then((result) => {
        update("rollNumber", String(result.nextRollNumber));
        setRollNumberLoading(false);
      }).catch(() => {
        rollRequestRef.current = undefined;
        setRollNumberLoading(false);
      });
    } else if (!data.class || !data.section) {
      rollRequestRef.current = undefined;
    }
  }, [autoGenerateRollNumber, data.class, data.section, update]);

  const fieldClass = (error?: string) => `h-10 w-full rounded-xl border px-3 text-sm outline-none focus:border-[#234A91] focus:ring-2 focus:ring-blue-100 ${error ? "border-red-500" : "border-gray-200"}`;
  const errorText = (error?: string) => error ? <p className="mt-1 text-xs text-red-600">{error}</p> : null;

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">
        Academic Information
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <RequiredLabel required>Academic Year</RequiredLabel>
          <select
            data-field="academicYear"
            value={data.academicYear}
            onChange={(e) => update("academicYear", e.target.value)}
            className={fieldClass(errors.academicYear)}
            aria-required="true"
            aria-invalid={!!errors.academicYear}
          >
            <option value="">Select Year</option>
            <option value="2081/2082 BS">2081/2082 BS</option>
            <option value="2082/2083 BS">2082/2083 BS</option>
            <option value="2083/2084 BS">2083/2084 BS</option>
            <option value="2084/2085 BS">2084/2085 BS</option>
            <option value="2085/2086 BS">2085/2086 BS</option>
          </select>
          {errorText(errors.academicYear)}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Medium (Optional)</label>
          <select
            data-field="medium"
            value={data.medium}
            onChange={(e) => update("medium", e.target.value)}
            className={fieldClass()}
          >
            <option value="English">English</option>
            <option value="Nepali">Nepali</option>
          </select>
        </div>

        <div>
          <RequiredLabel required>Admission Number</RequiredLabel>
          <input
            data-field="admissionNo"
            type="text"
            value={data.admissionNo}
            readOnly
            placeholder="Auto Generated"
            className={fieldClass(errors.admissionNo)}
            aria-required="true"
            aria-invalid={!!errors.admissionNo}
          />
          {errorText(errors.admissionNo)}
        </div>

        <div>
          <RequiredLabel required>Admission Date</RequiredLabel>
          <input
            data-field="admissionDate"
            type="date"
            value={data.admissionDate}
            onChange={(e) => update("admissionDate", e.target.value)}
            className={fieldClass(errors.admissionDate)}
            aria-required="true"
            aria-invalid={!!errors.admissionDate}
          />
          {errorText(errors.admissionDate)}
        </div>

        <div>
          <RequiredLabel required>Class</RequiredLabel>
          <select
            data-field="class"
            value={data.class}
            onChange={(e) => {
              const classId = e.target.value;
              onChange({
                ...data,
                class: classId,
                className: classes.find((item) => String(item.id) === classId)?.name ?? "",
                section: "",
                sectionName: "",
                rollNumber: "",
              });
            }}
            className={fieldClass(errors.class)}
            aria-required="true"
            aria-invalid={!!errors.class}
          >
            <option value="">Select Class</option>
            {classes.map((c) => (
              <option key={c.id} value={String(c.id)}>{c.name}</option>
            ))}
          </select>
          {errorText(errors.class)}
        </div>

        <div>
          <RequiredLabel required>Section</RequiredLabel>
          <select
            data-field="section"
            value={data.section}
            onChange={(e) => {
              const sectionId = e.target.value;
              onChange({
                ...data,
                section: sectionId,
                sectionName: sections.find((item) => String(item.id) === sectionId)?.name ?? "",
                rollNumber: "",
              });
            }}
            className={fieldClass(errors.section)}
            aria-required="true"
            aria-invalid={!!errors.section}
          >
            <option value="">Select Section</option>
            {availableSections.map((s) => (
              <option key={s.id} value={String(s.id)}>{s.name}</option>
            ))}
          </select>
          {errorText(errors.section)}
        </div>

        <div>
          <RequiredLabel required>Roll Number</RequiredLabel>
          <input
            data-field="rollNumber"
            type="text"
            value={data.rollNumber}
            onChange={(e) => update("rollNumber", e.target.value)}
            className={fieldClass(errors.rollNumber)}
            readOnly
            aria-required="true"
            aria-invalid={!!errors.rollNumber}
          />
          {rollNumberLoading && (
            <p className="mt-1 text-xs text-gray-400">Generating...</p>
          )}
          {errorText(errors.rollNumber)}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">House (Optional)</label>
          <select
            data-field="house"
            value={data.house}
            onChange={(e) => update("house", e.target.value)}
            className={fieldClass()}
          >
            <option value="">Select House</option>
            <option value="Red">Red</option>
            <option value="Blue">Blue</option>
            <option value="Green">Green</option>
            <option value="Yellow">Yellow</option>
          </select>
        </div>

        <div>
          <RequiredLabel required>Student Status</RequiredLabel>
          <select
            data-field="status"
            value={data.status}
            onChange={(e) => update("status", e.target.value)}
            className={fieldClass(errors.status)}
            aria-required="true"
            aria-invalid={!!errors.status}
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="transfer">Transfer</option>
          </select>
          {errorText(errors.status)}
        </div>

        {/* <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Scholarship
          </label>
          <input
            type="text"
            value={data.scholarship}
            onChange={(e) => update("scholarship", e.target.value)}
            className="h-10 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-[#234A91] focus:ring-2 focus:ring-blue-100"
          />
        </div> */}
      </div>
    </div>
  );
};

export default StudentAcademicSection;
