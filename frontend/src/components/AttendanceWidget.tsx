import type { AttendanceData } from "../types/dashboard";

interface AttendanceWidgetProps {
  attendance: AttendanceData;
}

const AttendanceWidget: React.FC<AttendanceWidgetProps> = ({ attendance }) => {
  const items = [
    { label: "Present", value: attendance.present, color: "bg-green-500" },
    { label: "Absent", value: attendance.absent, color: "bg-red-500" },
    { label: "Late", value: attendance.late, color: "bg-orange-500" },
    { label: "Leave", value: attendance.leave, color: "bg-yellow-500" },
    { label: "Half Day", value: attendance.halfDay, color: "bg-blue-500" },
  ];

  const maxValue = Math.max(...items.map((i) => i.value), 1);

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Attendance Summary
      </h3>

      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.label}>
            <div className="flex justify-between mb-1">
              <span className="text-sm text-gray-600">{item.label}</span>
              <span className="text-sm font-medium text-gray-800">
                {item.value}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className={`${item.color} h-2.5 rounded-full transition-all duration-500`}
                style={{ width: `${(item.value / maxValue) * 100}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-100">
        <h4 className="text-sm font-medium text-gray-700 mb-3">
          Attendance Trend (7 Days)
        </h4>
        <div className="flex items-end justify-between gap-2 h-24">
          {attendance.trend.map((dayItem) => {
            const maxPresent = Math.max(
              ...attendance.trend.map((d) => d.present),
              1,
            );
            const heightPercent = (dayItem.present / maxPresent) * 100;
            return (
              <div
                key={dayItem.day}
                className="flex flex-col items-center gap-1 flex-1"
              >
                <div className="w-full bg-gray-200 rounded-t-md relative h-20">
                  <div
                    className="absolute bottom-0 w-full bg-[#234A91] rounded-t-md transition-all duration-500"
                    style={{ height: `${heightPercent}%` }}
                  ></div>
                </div>
                <span className="text-xs text-gray-500">{dayItem.day}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AttendanceWidget;
