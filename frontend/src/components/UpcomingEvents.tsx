import React from "react";
import { CalendarDays, FileText, Users, Megaphone } from "lucide-react";
import type { UpcomingEvent } from "../types/dashboard";

interface UpcomingEventsProps {
  events: UpcomingEvent[];
}

const EVENT_ICONS: Record<string, React.ReactNode> = {
  school: <CalendarDays size={18} />,
  exam: <FileText size={18} />,
  meeting: <Users size={18} />,
  announcement: <Megaphone size={18} />,
};

const EVENT_COLORS: Record<string, string> = {
  school: "bg-blue-100 text-blue-700",
  exam: "bg-orange-100 text-orange-700",
  meeting: "bg-green-100 text-green-700",
  announcement: "bg-purple-100 text-purple-700",
};

const UpcomingEvents: React.FC<UpcomingEventsProps> = ({ events }) => {
  if (events.length === 0) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Upcoming Events
        </h3>
        <p className="text-sm text-gray-400 text-center py-8">
          No upcoming events
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Upcoming Events
      </h3>

      <div className="space-y-3">
        {events.map((event) => (
          <div
            key={event.id}
            className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer"
          >
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center ${EVENT_COLORS[event.type] || "bg-gray-100 text-gray-700"}`}
            >
              {EVENT_ICONS[event.type] || <CalendarDays size={18} />}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium text-gray-800 truncate">
                {event.title}
              </h4>
              <span className="text-xs text-gray-500">{event.date}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UpcomingEvents;
