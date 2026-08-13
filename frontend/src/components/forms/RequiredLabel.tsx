import type { ReactNode } from "react";

interface RequiredLabelProps {
  children: ReactNode;
  required?: boolean;
  className?: string;
}

export default function RequiredLabel({
  children,
  required = false,
  className = "mb-1 block text-sm font-medium text-gray-700",
}: RequiredLabelProps) {
  return (
    <label className={className}>
      {children}
      {required && <span className="text-red-500"> *</span>}
    </label>
  );
}
