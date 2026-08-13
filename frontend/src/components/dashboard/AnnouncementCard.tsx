import type { ReactNode } from "react";
import { Card } from "../ui/card";
import { Megaphone } from "lucide-react";

interface AnnouncementCardProps {
  title: string;
  content: string;
  date?: string;
  author?: string;
  badge?: ReactNode;
}

const AnnouncementCard = ({
  title,
  content,
  date,
  author,
  badge,
}: AnnouncementCardProps) => (
  <Card className="rounded-2xl border border-gray-200 bg-white shadow-soft p-5">
    <div className="flex items-start gap-3">
      <div className="p-2 rounded-xl bg-orange-50 text-orange-600 mt-0.5">
        <Megaphone className="h-4 w-4" />
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <h4 className="text-sm font-semibold text-gray-800">{title}</h4>
          {badge}
        </div>
        <p className="text-sm text-gray-600 mb-2">{content}</p>
        {(date || author) && (
          <p className="text-xs text-gray-400">
            {author && `${author}`}
            {author && date && " · "}
            {date}
          </p>
        )}
      </div>
    </div>
  </Card>
);

export default AnnouncementCard;
