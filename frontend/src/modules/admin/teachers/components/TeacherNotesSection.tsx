import React from "react";
import type { NotesData } from "../schemas/teacher.schema";

interface TeacherNotesSectionProps {
  data: NotesData;
  onChange: (data: NotesData) => void;
}

const TeacherNotesSection: React.FC<TeacherNotesSectionProps> = ({
  data,
  onChange,
}) => {
  const update = (field: keyof NotesData, value: string) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Additional Notes</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="mb-1 block text-sm font-medium text-gray-700">Bio</label>
          <textarea
            value={data.bio}
            onChange={(e) => update("bio", e.target.value)}
            rows={3}
            className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#234A91] focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="mb-1 block text-sm font-medium text-gray-700">Teaching Philosophy</label>
          <textarea
            value={data.teachingPhilosophy}
            onChange={(e) => update("teachingPhilosophy", e.target.value)}
            rows={3}
            className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#234A91] focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="mb-1 block text-sm font-medium text-gray-700">Achievements</label>
          <textarea
            value={data.achievements}
            onChange={(e) => update("achievements", e.target.value)}
            rows={3}
            className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#234A91] focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="mb-1 block text-sm font-medium text-gray-700">Awards</label>
          <textarea
            value={data.awards}
            onChange={(e) => update("awards", e.target.value)}
            rows={3}
            className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#234A91] focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="mb-1 block text-sm font-medium text-gray-700">Remarks</label>
          <textarea
            value={data.remarks}
            onChange={(e) => update("remarks", e.target.value)}
            rows={3}
            className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#234A91] focus:ring-2 focus:ring-blue-100"
          />
        </div>
      </div>
    </div>
  );
};

export default TeacherNotesSection;
