import React from "react";
import type { SocialData } from "../schemas/teacher.schema";

interface TeacherSocialSectionProps {
  data: SocialData;
  onChange: (data: SocialData) => void;
}

const TeacherSocialSection: React.FC<TeacherSocialSectionProps> = ({
  data,
  onChange,
}) => {
  const update = (field: keyof SocialData, value: string) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Social & Professional Links</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Facebook</label>
          <input
            type="text"
            value={data.facebook}
            onChange={(e) => update("facebook", e.target.value)}
            className="h-10 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-[#234A91] focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">LinkedIn</label>
          <input
            type="text"
            value={data.linkedin}
            onChange={(e) => update("linkedin", e.target.value)}
            className="h-10 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-[#234A91] focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Instagram</label>
          <input
            type="text"
            value={data.instagram}
            onChange={(e) => update("instagram", e.target.value)}
            className="h-10 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-[#234A91] focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Twitter</label>
          <input
            type="text"
            value={data.twitter}
            onChange={(e) => update("twitter", e.target.value)}
            className="h-10 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-[#234A91] focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">YouTube</label>
          <input
            type="text"
            value={data.youtube}
            onChange={(e) => update("youtube", e.target.value)}
            className="h-10 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-[#234A91] focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div className="sm:col-span-2 lg:col-span-4">
          <label className="mb-1 block text-sm font-medium text-gray-700">Personal Website</label>
          <input
            type="text"
            value={data.personalWebsite}
            onChange={(e) => update("personalWebsite", e.target.value)}
            className="h-10 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-[#234A91] focus:ring-2 focus:ring-blue-100"
          />
        </div>
      </div>
    </div>
  );
};

export default TeacherSocialSection;
