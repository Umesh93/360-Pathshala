import React from "react";
import type { NotesData } from "../schemas/student.schema";

interface NotesSectionProps {
  data: NotesData;
  onChange: (data: NotesData) => void;
}

const NotesSection: React.FC<NotesSectionProps> = ({ data, onChange }) => {
  const update = (field: keyof NotesData, value: string) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Notes</h2>
      <textarea
        value={data.notes}
        onChange={(e) => update("notes", e.target.value)}
        rows={4}
        placeholder="Additional notes..."
        className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#234A91] focus:ring-2 focus:ring-blue-100 resize-none"
      />
    </div>
  );
};

export default NotesSection;
