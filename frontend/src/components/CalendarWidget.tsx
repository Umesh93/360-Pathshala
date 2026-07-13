import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { CalendarEvent } from "../types/dashboard";

interface CalendarWidgetProps {
  events: CalendarEvent[];
}

const EVENT_COLORS: Record<string, string> = {
  holiday: "bg-red-100 text-red-700 border-red-200",
  event: "bg-blue-100 text-blue-700 border-blue-200",
  exam: "bg-orange-100 text-orange-700 border-orange-200",
  meeting: "bg-green-100 text-green-700 border-green-200",
};

const CalendarWidget: React.FC<CalendarWidgetProps> = ({ events }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const days: (number | null)[] = [];
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const getEventsForDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return events.filter((e) => e.date === dateStr);
  };

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          {monthNames[month]} {year}
        </h3>
        <div className="flex gap-2">
          <button
            onClick={goToPreviousMonth}
            className="p-1 rounded-lg hover:bg-gray-100 text-gray-600"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={goToNextMonth}
            className="p-1 rounded-lg hover:bg-gray-100 text-gray-600"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div
            key={day}
            className="text-center text-xs font-medium text-gray-500 py-2"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((day, index) => {
          if (day === null) {
            return <div key={`empty-${index}`} className="p-2"></div>;
          }

          const dayEvents = getEventsForDay(day);
          const hasEvent = dayEvents.length > 0;

          return (
            <div
              key={day}
              className={`
                relative p-2 text-center text-sm rounded-lg cursor-pointer
                hover:bg-gray-50 transition-colors
                ${hasEvent ? "font-medium text-[#234A91]" : "text-gray-700"}
              `}
            >
              {day}
              {hasEvent && (
                <div className="flex justify-center gap-0.5 mt-1">
                  {dayEvents.map((evt) => (
                    <span
                      key={evt.id}
                      className={`w-1.5 h-1.5 rounded-full ${evt.type === "holiday" ? "bg-red-500" : evt.type === "exam" ? "bg-orange-500" : "bg-blue-500"}`}
                    ></span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {events.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <h4 className="text-xs font-medium text-gray-500 mb-2">
            Upcoming Events
          </h4>
          <div className="space-y-2">
            {events.slice(0, 3).map((evt) => (
              <div
                key={evt.id}
                className={`flex items-center gap-2 text-xs px-2 py-1.5 rounded-lg border ${EVENT_COLORS[evt.type] || "bg-gray-100 text-gray-700 border-gray-200"}`}
              >
                <span>{evt.title}</span>
                <span className="ml-auto">{evt.date}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarWidget;
