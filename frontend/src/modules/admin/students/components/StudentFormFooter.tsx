import React from "react";

interface StudentFormFooterProps {
  onCancel: () => void;
  onSaveDraft?: () => void;
  onSubmit: () => void;
  submitting: boolean;
  currentStep: number;
  totalSteps: number;
  onPrev?: () => void;
  onNext?: () => void;
}

const StudentFormFooter: React.FC<StudentFormFooterProps> = ({
  onCancel,
  onSaveDraft,
  onSubmit,
  submitting,
  currentStep,
  totalSteps,
  onPrev,
  onNext,
}) => {
  return (
    <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 mt-6 rounded-b-xl">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">
            Step {currentStep + 1} of {totalSteps}
          </span>
          <div className="flex gap-1">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div
                key={i}
                className={`h-2 w-8 rounded-full transition-colors ${
                  i <= currentStep ? "bg-[#234A91]" : "bg-gray-200"
                }`}
              />
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {onPrev && currentStep > 0 && (
            <button
              type="button"
              onClick={onPrev}
              className="px-6 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Previous
            </button>
          )}

          {onNext && currentStep < totalSteps - 1 && (
            <button
              type="button"
              onClick={onNext}
              className="px-6 py-2.5 rounded-xl bg-[#234A91] text-white text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Next
            </button>
          )}

          {onSaveDraft && (
            <button
              type="button"
              onClick={onSaveDraft}
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Save Draft
            </button>
          )}

          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2.5 rounded-xl border border-red-300 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onSubmit}
            disabled={submitting}
            className="px-6 py-2.5 rounded-xl bg-[#234A91] text-white text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {submitting && (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            {submitting ? "Saving..." : "Save Student"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentFormFooter;
