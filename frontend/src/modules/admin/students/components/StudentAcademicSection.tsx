import React, { useEffect, useState, useCallback, useRef } from "react";
import type { AcademicInfoData } from "../schemas/student.schema";
import { getNextRollNumber, getClasses, getSections } from "../services/student.service";

interface StudentAcademicSectionProps {
  data: AcademicInfoData;
  onChange: (data: AcademicInfoData) => void;
  errors?: Record<string, string>;
  lookupData?: {
    classes: { id: number; name: string }[];
    sections: { id: number; name: string; classId: number }[];
  };
}

const StudentAcademicSection: React.FC<StudentAcademicSectionProps> = ({
  data,
  onChange,
  errors = {},
  lookupData,
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
      setClasses(lookupData.classes);
      setSections(lookupData.sections);
      return;
    }
    getClasses().then(setClasses);
  }, [lookupData]);

  useEffect(() => {
    if (lookupData || !data.class) {
      if (!lookupData) setSections([]);
      return;
    }
    getSections(Number(data.class)).then(setSections);
  }, [data.class, lookupData]);

  const availableSections = data.class
    ? sections.filter((s) => s.classId === Number(data.class))
    : sections;

  useEffect(() => {
    if (data.class && data.section && !data.rollNumber) {
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
  }, [data.class, data.section, data.rollNumber, update]);

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">
        Academic Information
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Academic Year
          </label>
          <select
            value={data.academicYear}
            onChange={(e) => update("academicYear", e.target.value)}
            className={`h-10 w-full rounded-xl border px-3 text-sm outline-none focus:border-[#234A91] focus:ring-2 focus:ring-blue-100 ${
              errors.academicYear ? "border-red-500" : "border-gray-200"
            }`}
          >
            <option value="">Select Year</option>
            <option value="2081/2082 BS">2081/2082 BS</option>
            <option value="2082/2083 BS">2082/2083 BS</option>
            <option value="2083/2084 BS" selected>2083/2084 BS</option>
            <option value="2084/2085 BS">2084/2085 BS</option>
            <option value="2085/2086 BS">2085/2086 BS</option>
          </select>
          {errors.academicYear && (
            <p className="mt-1 text-xs text-red-600">{errors.academicYear}</p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Medium
          </label>
          <select
            value={data.medium}
            onChange={(e) => update("medium", e.target.value)}
            className="h-10 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-[#234A91] focus:ring-2 focus:ring-blue-100"
          >
            <option value="English">English</option>
            <option value="Nepali">Nepali</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Admission Number
          </label>
          <input
            type="text"
            value={data.admissionNo}
            onChange={(e) => update("admissionNo", e.target.value)}
            placeholder="Auto Generated"
            className={`h-10 w-full rounded-xl border px-3 text-sm outline-none focus:border-[#234A91] focus:ring-2 focus:ring-blue-100 ${
              errors.admissionNo ? "border-red-500" : "border-gray-200"
            }`}
          />
          {errors.admissionNo && (
            <p className="mt-1 text-xs text-red-600">{errors.admissionNo}</p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Admission Date
          </label>
          <input
            type="date"
            value={data.admissionDate}
            onChange={(e) => update("admissionDate", e.target.value)}
            className={`h-10 w-full rounded-xl border px-3 text-sm outline-none focus:border-[#234A91] focus:ring-2 focus:ring-blue-100 ${
              errors.admissionDate ? "border-red-500" : "border-gray-200"
            }`}
          />
          {errors.admissionDate && (
            <p className="mt-1 text-xs text-red-600">{errors.admissionDate}</p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Class
          </label>
          <select
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
            className={`h-10 w-full rounded-xl border px-3 text-sm outline-none focus:border-[#234A91] focus:ring-2 focus:ring-blue-100 ${
              errors.class ? "border-red-500" : "border-gray-200"
            }`}
          >
            <option value="">Select Class</option>
            {classes.map((c) => (
              <option key={c.id} value={String(c.id)}>{c.name}</option>
            ))}
          </select>
          {errors.class && (
            <p className="mt-1 text-xs text-red-600">{errors.class}</p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Section
          </label>
          <select
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
            className={`h-10 w-full rounded-xl border px-3 text-sm outline-none focus:border-[#234A91] focus:ring-2 focus:ring-blue-100 ${
              errors.section ? "border-red-500" : "border-gray-200"
            }`}
          >
            <option value="">Select Section</option>
            {availableSections.map((s) => (
              <option key={s.id} value={String(s.id)}>{s.name}</option>
            ))}
          </select>
          {errors.section && (
            <p className="mt-1 text-xs text-red-600">{errors.section}</p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Roll Number
          </label>
          <input
            type="text"
            value={data.rollNumber}
            onChange={(e) => update("rollNumber", e.target.value)}
            className={`h-10 w-full rounded-xl border px-3 text-sm outline-none focus:border-[#234A91] focus:ring-2 focus:ring-blue-100 ${
              errors.rollNumber ? "border-red-500" : "border-gray-200"
            }`}
            readOnly
          />
          {rollNumberLoading && (
            <p className="mt-1 text-xs text-gray-400">Generating...</p>
          )}
          {errors.rollNumber && (
            <p className="mt-1 text-xs text-red-600">{errors.rollNumber}</p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            House
          </label>
          <select
            value={data.house}
            onChange={(e) => update("house", e.target.value)}
            className="h-10 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-[#234A91] focus:ring-2 focus:ring-blue-100"
          >
            <option value="">Select House</option>
            <option value="Red">Red</option>
            <option value="Blue">Blue</option>
            <option value="Green">Green</option>
            <option value="Yellow">Yellow</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Student Status
          </label>
          <select
            value={data.status}
            onChange={(e) => update("status", e.target.value)}
            className={`h-10 w-full rounded-xl border px-3 text-sm outline-none focus:border-[#234A91] focus:ring-2 focus:ring-blue-100 ${
              errors.status ? "border-red-500" : "border-gray-200"
            }`}
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="transfer">Transfer</option>
          </select>
          {errors.status && (
            <p className="mt-1 text-xs text-red-600">{errors.status}</p>
          )}
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
