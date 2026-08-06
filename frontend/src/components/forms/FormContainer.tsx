import type { ReactNode } from "react";
import { Card } from "../ui/card";

interface FormContainerProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  className?: string;
}

const FormContainer = ({ children, title, subtitle, className = "" }: FormContainerProps) => (
  <Card className={`rounded-2xl border border-gray-200 bg-white shadow-soft ${className}`}>
    {(title || subtitle) && (
      <div className="border-b border-gray-100 px-6 py-5">
        {title && <h2 className="text-lg font-semibold text-gray-800">{title}</h2>}
        {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
      </div>
    )}
    <div className="p-6">{children}</div>
  </Card>
);

export default FormContainer;
