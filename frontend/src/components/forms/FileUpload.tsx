import { useCallback } from "react";
import { Upload } from "lucide-react";
import { Button } from "../ui/button";

interface FileUploadProps {
  onChange: (file: File | null) => void;
  accept?: string;
  preview?: string;
  label?: string;
}

const FileUpload = ({ onChange, accept = "image/*", preview, label = "Upload file" }: FileUploadProps) => {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0] || null;
      onChange(file);
    },
    [onChange],
  );

  return (
    <div className="flex flex-col items-center gap-3">
      <input type="file" accept={accept} onChange={handleChange} className="hidden" id="file-upload" />
      <label htmlFor="file-upload" className="cursor-pointer">
        <div className="h-24 w-24 rounded-full bg-gray-50 border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden hover:border-[#223D5D] transition-colors">
          {preview ? (
            <img src={preview} alt="Preview" className="h-full w-full object-cover" />
          ) : (
            <Upload className="h-8 w-8 text-gray-400" />
          )}
        </div>
      </label>
      <Button variant="outline" size="sm" onClick={() => document.getElementById("file-upload")?.click()}>
        {label}
      </Button>
    </div>
  );
};

export default FileUpload;
