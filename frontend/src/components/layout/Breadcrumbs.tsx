import { Link } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

const Breadcrumbs = ({ items }: BreadcrumbsProps) => (
  <nav className="flex items-center gap-2 text-sm text-gray-500 mb-4">
    <Link to="/" className="hover:text-[#223D5D] transition-colors">
      <Home className="h-4 w-4" />
    </Link>
    {items.map((item, index) => (
      <div key={index} className="flex items-center gap-2">
        <ChevronRight className="h-4 w-4 text-gray-400" />
        {item.href ? (
          <Link
            to={item.href}
            className="hover:text-[#223D5D] transition-colors"
          >
            {item.label}
          </Link>
        ) : (
          <span className="font-medium text-gray-800">{item.label}</span>
        )}
      </div>
    ))}
  </nav>
);

export default Breadcrumbs;
