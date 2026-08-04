import React, { useCallback, useState } from "react";
import type { DocumentsData } from "../schemas/student.schema";

interface DocumentsSectionProps {
  data: DocumentsData;
  onChange: (data: DocumentsData) => void;
}

interface FileItem {
  file: File;
  preview: string;
  name: string;
  category: string;
}

const documentCategories = [
  "Student Photo",
  "Birth Certificate",
  "Previous Report Card",
  "Transfer Certificate",
  "Immunization Card",
  "Citizenship",
  "Medical Certificate",
  "Character Certificate",
  "Other Documents",
];

const DocumentsSection: React.FC<DocumentsSectionProps> = ({
  data,
  onChange,
}) => {
  const [activeCategory, setActiveCategory] = useState("Student Photo");

  const handleFiles = (files: File[]) => {
    const newFiles: FileItem[] = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      name: file.name,
      category: activeCategory,
    }));
    const existing = (data.documents as FileItem[]) || [];
    const existingCategories = data.documentCategories || [];
    const updatedCategories = [
      ...new Set([...existingCategories, activeCategory]),
    ];
    onChange({
      documents: [...existing, ...newFiles],
      documentCategories: updatedCategories,
    });
  };

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const files = Array.from(e.dataTransfer.files);
      handleFiles(files);
    },
    [activeCategory]
  );

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    handleFiles(files);
  };

  const removeFile = (index: number) => {
    const existing = (data.documents as FileItem[]) || [];
    const updated = existing.filter((_, i) => i !== index);
    const remainingCategories = updated.map((f) => f.category);
    onChange({
      documents: updated,
      documentCategories: remainingCategories,
    });
  };

  const documents = (data.documents as FileItem[]) || [];

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Documents</h2>

      <div className="flex flex-wrap gap-2 mb-4">
        {documentCategories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              activeCategory === cat
                ? "bg-[#234A91] text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

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
          id={`document-upload-${activeCategory}`}
        />
        <label
          htmlFor={`document-upload-${activeCategory}`}
          className="cursor-pointer"
        >
          <p className="text-sm text-gray-600">
            Drag & Drop files here, or{" "}
            <span className="text-[#234A91] font-medium">browse</span>
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Category: {activeCategory}
          </p>
        </label>
      </div>

      {documents.length > 0 && (
        <div className="mt-4 space-y-3">
          {documentCategories.map((cat) => {
            const catDocs = documents.filter((d) => d.category === cat);
            if (catDocs.length === 0) return null;
            return (
              <div key={cat}>
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  {cat}
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
                  {catDocs.map((doc) => {
                    const globalIndex = documents.indexOf(doc);
                    return (
                      <div key={globalIndex} className="relative group">
                        <div className="h-20 rounded-lg border border-gray-200 overflow-hidden bg-gray-50 flex items-center justify-center">
                          {doc.file.type.startsWith("image/") ? (
                            <img
                              src={doc.preview}
                              alt={doc.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <span className="text-xs text-gray-500 text-center px-1 truncate">
                              {doc.name}
                            </span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile(globalIndex)}
                          className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ×
                        </button>
                        <p className="mt-1 text-xs text-gray-500 truncate">
                          {doc.name}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DocumentsSection;
