import type { ReactNode } from "react";
import { Card } from "../ui/card";

interface ChartCardProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  action?: ReactNode;
  className?: string;
}

const ChartCard = ({
  title,
  subtitle,
  children,
  action,
  className = "",
}: ChartCardProps) => (
  <Card
    className={`rounded-2xl border border-gray-200 bg-white shadow-soft ${className}`}
  >
    <div className="flex items-center justify-between p-5 border-b border-gray-100">
      <div>
        <h3 className="font-semibold text-gray-800">{title}</h3>
        {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
    <div className="p-5">{children}</div>
  </Card>
);

export default ChartCard;
