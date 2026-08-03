import { useState } from "react";
import { Search, SlidersHorizontal, Download, Upload, RefreshCw } from "lucide-react";

interface StudentToolbarProps {
  onSearch: (value: string) => void;
  onRefresh: () => void;
  onAddStudent: () => void;
  onExportCSV?: () => void;
  onExportPDF?: () => void;
  onImport?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  searchPlaceholder?: string;
}

const StudentToolbar: React.FC<StudentToolbarProps> = ({
  onSearch,
  onRefresh,
  onAddStudent,
  onExportCSV,
  onExportPDF,
  onImport,
  searchPlaceholder = "Search students...",
}) => {
  const [localSearch, setLocalSearch] = useState("");
  const [showExportMenu, setShowExportMenu] = useState(false);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalSearch(value);
    onSearch(value);
  };

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={localSearch}
              onChange={handleSearchChange}
              className="w-full h-10 pl-10 pr-4 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#234A91] focus:ring-2 focus:ring-blue-100 transition-all"
            />
          </div>

          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
              <SlidersHorizontal size={16} />
              Filter
            </button>

            <div className="relative">
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Download size={16} />
                Export
              </button>
              {showExportMenu && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowExportMenu(false)}
                  />
                  <div className="absolute right-0 z-20 mt-1 w-40 bg-white rounded-xl shadow-lg border border-gray-200 py-1">
                    <button
                      onClick={() => {
                        onExportCSV?.();
                        setShowExportMenu(false);
                      }}
                      className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      Export CSV
                    </button>
                    <button
                      onClick={() => {
                        onExportPDF?.();
                        setShowExportMenu(false);
                      }}
                      className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      Export PDF
                    </button>
                  </div>
                </>
              )}
            </div>

            <label className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer">
              <Upload size={16} />
              Import
              <input
                type="file"
                accept=".csv,.xlsx"
                onChange={onImport}
                className="hidden"
              />
            </label>

            <button
              onClick={onRefresh}
              className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <RefreshCw size={16} />
              Refresh
            </button>
          </div>
        </div>

        <button
          onClick={onAddStudent}
          className="flex items-center gap-2 px-6 py-2.5 bg-[#234A91] text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors whitespace-nowrap"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 5v14M5 12h14" />
          </svg>
          Add Student
        </button>
      </div>
    </div>
  );
};

export default StudentToolbar;
