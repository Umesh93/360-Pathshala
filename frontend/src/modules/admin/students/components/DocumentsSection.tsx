import React, { useCallback } from "react";
import type { DocumentsData } from "../schemas/student.schema";

interface DocumentsSectionProps {
  data: DocumentsData;
  onChange: (data: DocumentsData) => void;
}

interface FileItem {
  file: File;
  preview: string;
  name: string;
}

const DocumentsSection: React.FC<DocumentsSectionProps> = ({ data, onChange }) => {
  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const files = Array.from(e.dataTransfer.files);
      handleFiles(files);
    },
    [data]
  );

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    handleFiles(files);
  };

  const handleFiles = (files: File[]) => {
    const newFiles: FileItem[] = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      name: file.name,
    }));
    const existing = (data.documents as FileItem[]) || [];
    onChange({ documents: [...existing, ...newFiles] });
  };

  const removeFile = (index: number) => {
    const existing = (data.documents as FileItem[]) || [];
    const updated = existing.filter((_, i) => i !== index);
    onChange({ documents: updated });
  };

  const documents = (data.documents as FileItem[]) || [];

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Documents</h2>

      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-[#234A91] transition-colors cursor-pointer"
      >
        <input
          type="file"
          multiple
          onChange={handleFileInput}
          className="hidden"
          id="document-upload"
        />
        <label htmlFor="document-upload" className="cursor-pointer">
          <p className="text-sm text-gray-600">
            Drag & Drop files here, or <span className="text-[#234A91] font-medium">browse</span>
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Student Photo, Birth Certificate, Transfer Certificate, Citizenship, Medical Certificate, Character Certificate
          </p>
        </label>
      </div>

      {documents.length > 0 && (
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
          {documents.map((doc, index) => (
            <div key={index} className="relative group">
              <div className="h-24 rounded-lg border border-gray-200 overflow-hidden bg-gray-50 flex items-center justify-center">
                {doc.file.type.startsWith("image/") ? (
                  <img src={doc.preview} alt={doc.name} className="h-full w-full object-cover" />
                ) : (
                  <span className="text-xs text-gray-500 text-center px-2 truncate">{doc.name}</span>
                )}
              </div>
              <button
                type="button"
                onClick={() => removeFile(index)}
                className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                ×
              </button>
              <p className="mt-1 text-xs text-gray-500 truncate">{doc.name}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DocumentsSection;
