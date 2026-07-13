import React from "react";
import { Bell } from "lucide-react";
import type { DashboardData } from "../types/dashboard";

interface RecentNotificationsProps {
  notifications: DashboardData["recentNotifications"];
}

const RecentNotifications: React.FC<RecentNotificationsProps> = ({
  notifications,
}) => {
  if (notifications.length === 0) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Recent Notifications
        </h3>
        <p className="text-sm text-gray-400 text-center py-8">
          No notifications
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Recent Notifications
      </h3>

      <div className="space-y-3">
        {notifications.map((notificationItem) => (
          <div
            key={notificationItem.id}
            className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-blue-100 text-[#234A91] flex items-center justify-center shrink-0 mt-0.5">
              <Bell size={16} />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium text-gray-800">
                {notificationItem.title}
              </h4>
              <p className="text-xs text-gray-500 mt-1">
                {notificationItem.message}
              </p>
              <span className="text-xs text-gray-400 mt-1 block">
                {notificationItem.time}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentNotifications;
