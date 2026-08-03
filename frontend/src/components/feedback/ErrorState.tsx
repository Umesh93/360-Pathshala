import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "../ui/button";

interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  retryLabel?: string;
}

const ErrorState = ({
  title = "Something went wrong",
  description = "We couldn't load this section. Please try again.",
  onRetry,
  retryLabel = "Retry",
}: ErrorStateProps) => (
  <div className="flex flex-col items-center justify-center py-12 text-center">
    <div className="p-3 rounded-full bg-red-50 text-red-600 mb-4">
      <AlertCircle className="h-6 w-6" />
    </div>
    <h3 className="text-lg font-semibold text-gray-800 mb-1">{title}</h3>
    <p className="text-sm text-gray-500 max-w-sm mb-4">{description}</p>
    {onRetry && (
      <Button onClick={onRetry} variant="outline" className="gap-2">
        <RefreshCw className="h-4 w-4" />
        {retryLabel}
      </Button>
    )}
  </div>
);

export default ErrorState;
