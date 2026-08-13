import React from "react";
import { Pin } from "lucide-react";
import type { Notice } from "../types/dashboard";

interface NoticeBoardProps {
  notices: Notice[];
}

const NoticeBoard: React.FC<NoticeBoardProps> = ({ notices }) => {
  const unreadCount = notices.filter((n) => n.unread).length;
  const pinnedNotices = notices.filter((n) => n.pinned);
  const regularNotices = notices.filter((n) => !n.pinned);

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Notice Board</h3>
        {unreadCount > 0 && (
          <span className="bg-red-100 text-red-700 text-xs font-medium px-2.5 py-0.5 rounded-full">
            {unreadCount} unread
          </span>
        )}
      </div>

      <div className="space-y-3">
        {pinnedNotices.length > 0 && (
          <div className="space-y-2 mb-4">
            <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              Pinned
            </h4>
            {pinnedNotices.map((notice) => (
              <div
                key={notice.id}
                className={`p-3 rounded-lg border ${
                  notice.unread
                    ? "border-[#234A91] bg-blue-50"
                    : "border-gray-200 bg-gray-50"
                }`}
              >
                <div className="flex items-start gap-2">
                  <Pin size={14} className="text-[#234A91] mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-gray-800 truncate">
                      {notice.title}
                    </h4>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                      {notice.content}
                    </p>
                    <span className="text-xs text-gray-400 mt-1 block">
                      {notice.date}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="space-y-2">
          <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider">
            Latest
          </h4>
          {regularNotices.length === 0 && pinnedNotices.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-4">
              No notices available
            </p>
          )}
          {regularNotices.map((notice) => (
            <div
              key={notice.id}
              className={`p-3 rounded-lg border ${
                notice.unread
                  ? "border-[#234A91] bg-blue-50"
                  : "border-gray-200 bg-white"
              }`}
            >
              <h4 className="text-sm font-medium text-gray-800">
                {notice.title}
              </h4>
              <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                {notice.content}
              </p>
              <span className="text-xs text-gray-400 mt-1 block">
                {notice.date}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NoticeBoard;
