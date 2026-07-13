import React from "react";
import type { RecentActivity } from "../types/dashboard";

interface RecentActivitiesProps {
  activities: RecentActivity[];
}

const RecentActivities: React.FC<RecentActivitiesProps> = ({ activities }) => {
  if (activities.length === 0) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Recent Activities
        </h3>
        <p className="text-sm text-gray-400 text-center py-8">
          No recent activities
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Recent Activities
      </h3>

      <div className="space-y-4">
        {activities.map((activity, index) => (
          <div key={activity.id} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-[#234A91] text-white flex items-center justify-center text-xs font-medium shrink-0">
                {index + 1}
              </div>
              {index < activities.length - 1 && (
                <div className="w-0.5 h-full bg-gray-200 mt-1"></div>
              )}
            </div>
            <div className="flex-1 pb-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-gray-800">
                  {activity.action}
                </h4>
                <span className="text-xs text-gray-400">{activity.time}</span>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {activity.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentActivities;
