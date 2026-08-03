import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: { label: string; href?: string }[];
  action?: ReactNode;
}

const PageHeader = ({ title, subtitle, breadcrumbs, action }: PageHeaderProps) => (
  <div className="mb-6 md:mb-8">
    {breadcrumbs && breadcrumbs.length > 0 && (
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-3">
        {breadcrumbs.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            {index > 0 && <span className="text-gray-400">/</span>}
            {item.href ? (
              <a href={item.href} className="hover:text-[#223D5D] transition-colors">
                {item.label}
              </a>
            ) : (
              <span className="font-medium text-gray-800">{item.label}</span>
            )}
          </div>
        ))}
      </nav>
    )}
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">{title}</h1>
        {subtitle && <p className="text-gray-600 mt-1 text-sm md:text-base">{subtitle}</p>}
      </div>
      {action && <div className="flex items-center gap-3">{action}</div>}
    </div>
  </div>
);

export default PageHeader;
