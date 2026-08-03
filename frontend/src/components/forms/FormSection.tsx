import { ReactNode } from "react";

interface FormSectionProps {
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

const FormSection = ({ title, description, children, className = "" }: FormSectionProps) => (
  <div className={`space-y-4 ${className}`}>
    {(title || description) && (
      <div className="mb-4">
        {title && <h3 className="text-sm font-semibold text-gray-700">{title}</h3>}
        {description && <p className="text-xs text-gray-500 mt-0.5">{description}</p>}
      </div>
    )}
    {children}
  </div>
);

export default FormSection;
