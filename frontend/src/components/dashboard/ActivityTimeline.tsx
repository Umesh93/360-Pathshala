import { ReactNode } from "react";
import { Clock } from "lucide-react";

interface ActivityTimelineProps {
  items: {
    id: string | number;
    title: string;
    description?: string;
    time?: string;
    icon?: ReactNode;
  }[];
}

const ActivityTimeline = ({ items }: ActivityTimelineProps) => (
  <div className="space-y-4">
    {items.map((item) => (
      <div key={item.id} className="flex gap-3">
        <div className="mt-1">
          <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
            {item.icon || <Clock className="h-4 w-4" />}
          </div>
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-800">{item.title}</p>
          {item.description && <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>}
          {item.time && <p className="text-xs text-gray-400 mt-1">{item.time}</p>}
        </div>
      </div>
    ))}
  </div>
);

export default ActivityTimeline;
