import React from "react";

interface TeacherSkeletonProps {
  rows?: number;
}

const TeacherSkeleton: React.FC<TeacherSkeletonProps> = ({ rows = 5 }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="animate-pulse">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-4 border-b border-gray-100 last:border-b-0">
            <div className="w-5 h-5 bg-gray-200 rounded"></div>
            <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              <div className="h-3 bg-gray-200 rounded w-1/4"></div>
            </div>
            <div className="h-4 bg-gray-200 rounded w-16"></div>
            <div className="h-4 bg-gray-200 rounded w-24"></div>
            <div className="h-4 bg-gray-200 rounded w-20"></div>
            <div className="h-4 bg-gray-200 rounded w-24"></div>
            <div className="h-4 bg-gray-200 rounded w-20"></div>
            <div className="h-4 bg-gray-200 rounded w-16"></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TeacherSkeleton;
