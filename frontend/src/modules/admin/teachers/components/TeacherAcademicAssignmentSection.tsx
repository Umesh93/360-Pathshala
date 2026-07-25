import React from "react";
import type { AcademicAssignmentData } from "../schemas/teacher.schema";
import MultiSelect from "../../../../components/MultiSelect";

interface TeacherAcademicAssignmentSectionProps {
  data: AcademicAssignmentData;
  onChange: (data: AcademicAssignmentData) => void;
  errors?: Record<string, string>;
}

const subjectsList = [
  "Mathematics",
  "Physics",
  "Chemistry",
  "English",
  "Nepali",
  "Computer Science",
  "Social Studies",
  "Health",
  "Economics",
  "History",
];

const classesList = [
  "Grade 1",
  "Grade 2",
  "Grade 3",
  "Grade 4",
  "Grade 5",
  "Grade 6",
  "Grade 7",
  "Grade 8",
  "Grade 9",
  "Grade 10",
];

const sectionsList = ["A", "B", "C", "D"];

const TeacherAcademicAssignmentSection: React.FC<TeacherAcademicAssignmentSectionProps> = ({
  data,
  onChange,
  errors = {},
}) => {
  const update = (field: keyof AcademicAssignmentData, value: string | boolean | string[]) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Academic Assignment</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Primary Subject</label>
          <select
            value={data.primarySubject}
            onChange={(e) => update("primarySubject", e.target.value)}
            className={`h-10 w-full rounded-xl border px-3 text-sm outline-none focus:border-[#234A91] focus:ring-2 focus:ring-blue-100 ${
              errors.primarySubject ? "border-red-500" : "border-gray-200"
            }`}
          >
            <option value="">Select Subject</option>
            {subjectsList.map((subject) => (
              <option key={subject} value={subject}>{subject}</option>
            ))}
          </select>
          {errors.primarySubject && <p className="mt-1 text-xs text-red-600">{errors.primarySubject}</p>}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Secondary Subjects</label>
          <MultiSelect
            options={subjectsList}
            selected={data.secondarySubjects}
            onChange={(value: string[]) => update("secondarySubjects", value)}
            placeholder="Select subjects"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Assigned Classes</label>
          <MultiSelect
            options={classesList}
            selected={data.assignedClasses}
            onChange={(value: string[]) => update("assignedClasses", value)}
            placeholder="Select classes"
          />
          {errors.assignedClasses && <p className="mt-1 text-xs text-red-600">{errors.assignedClasses}</p>}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Assigned Sections</label>
          <MultiSelect
            options={sectionsList}
            selected={data.assignedSections}
            onChange={(value: string[]) => update("assignedSections", value)}
            placeholder="Select sections"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Class Teacher</label>
          <select
            value={data.classTeacher ? "yes" : "no"}
            onChange={(e) => update("classTeacher", e.target.value === "yes")}
            className="h-10 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-[#234A91] focus:ring-2 focus:ring-blue-100"
          >
            <option value="no">No</option>
            <option value="yes">Yes</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Academic Year</label>
          <select
            value={data.academicYear}
            onChange={(e) => update("academicYear", e.target.value)}
            className={`h-10 w-full rounded-xl border px-3 text-sm outline-none focus:border-[#234A91] focus:ring-2 focus:ring-blue-100 ${
              errors.academicYear ? "border-red-500" : "border-gray-200"
            }`}
          >
            <option value="">Select Year</option>
            <option value="2025/2026">2025/2026</option>
            <option value="2024/2025">2024/2025</option>
          </select>
          {errors.academicYear && <p className="mt-1 text-xs text-red-600">{errors.academicYear}</p>}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Shift</label>
          <select
            value={data.shift}
            onChange={(e) => update("shift", e.target.value)}
            className="h-10 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-[#234A91] focus:ring-2 focus:ring-blue-100"
          >
            <option value="morning">Morning</option>
            <option value="day">Day</option>
            <option value="evening">Evening</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default TeacherAcademicAssignmentSection;
