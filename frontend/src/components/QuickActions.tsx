import type { ReactNode } from "react";

interface QuickAction {
  label: string;
  icon: ReactNode;
  onClick: () => void;
}

interface QuickActionsProps {
  actions: QuickAction[];
}

const QuickActions: React.FC<QuickActionsProps> = ({ actions }) => {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Quick Actions
      </h3>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
        {actions.map((action, index) => (
          <button
            key={index}
            onClick={action.onClick}
            className="flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-200 hover:border-[#234A91] hover:bg-blue-50 transition-colors group"
          >
            <div className="w-10 h-10 rounded-full bg-[#234A91] text-white flex items-center justify-center group-hover:scale-110 transition-transform">
              {action.icon}
            </div>
            <span className="text-xs font-medium text-gray-700 text-center">
              {action.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;
