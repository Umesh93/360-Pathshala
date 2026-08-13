import type { LucideIcon } from "lucide-react";
import { Card } from "../ui/card";

interface QuickActionCardProps {
  label: string;
  icon: LucideIcon;
  onClick?: () => void;
  href?: string;
}

const QuickActionCard = ({
  label,
  icon: Icon,
  onClick,
  href,
}: QuickActionCardProps) => {
  const content = (
    <Card className="rounded-2xl border border-gray-200 bg-white shadow-soft p-5 flex items-center gap-4 cursor-pointer hover:shadow-elevated transition-shadow">
      <div className="p-2.5 rounded-xl bg-[#223D5D]/10 text-[#223D5D]">
        <Icon className="h-5 w-5" />
      </div>
      <span className="text-sm font-medium text-gray-800">{label}</span>
    </Card>
  );

  if (href) {
    return (
      <a href={href} className="block">
        {content}
      </a>
    );
  }

  return (
    <div onClick={onClick} className="block">
      {content}
    </div>
  );
};

export default QuickActionCard;
