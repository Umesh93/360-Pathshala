import React, { useRef, useState } from "react";
import type { BankData } from "../schemas/teacher.schema";
import { uploadDocuments } from "../services/teacher.service";
import { formatFileSize } from "../utils/teacherFormHelpers";

interface TeacherBankSectionProps {
  data: BankData;
  onChange: (data: BankData) => void;
}

interface UploadedFile {
  id: string;
  name: string;
  type: string;
  url: string;
  size: number;
}

const TeacherBankSection: React.FC<TeacherBankSectionProps> = ({
  data,
  onChange,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const update = (field: keyof BankData, value: string) => {
    onChange({ ...data, [field]: value });
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await handleFiles(e.dataTransfer.files);
    }
  };

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await handleFiles(e.target.files);
    }
  };

  const handleFiles = async (files: FileList) => {
    setUploading(true);
    try {
      const urls = await uploadDocuments(Array.from(files));
      const newFiles: UploadedFile[] = Array.from(files).map((file, index) => ({
        id: `${Date.now()}-${index}`,
        name: file.name,
        type: file.type,
        url: urls[index] || "",
        size: file.size,
      }));
      const allFiles = [...uploadedFiles, ...newFiles];
      setUploadedFiles(allFiles);
      onChange({ ...data, documents: allFiles });
    } catch {
      console.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const removeFile = (id: string) => {
    const filtered = uploadedFiles.filter((f) => f.id !== id);
    setUploadedFiles(filtered);
    onChange({ ...data, documents: filtered });
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Bank & Documents</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Bank Name</label>
          <input
            type="text"
            value={data.bankName}
            onChange={(e) => update("bankName", e.target.value)}
            className="h-10 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-[#234A91] focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Account Number</label>
          <input
            type="text"
            value={data.accountNumber}
            onChange={(e) => update("accountNumber", e.target.value)}
            className="h-10 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-[#234A91] focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Account Holder Name</label>
          <input
            type="text"
            value={data.accountHolderName}
            onChange={(e) => update("accountHolderName", e.target.value)}
            className="h-10 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-[#234A91] focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">PAN Number</label>
          <input
            type="text"
            value={data.panNumber}
            onChange={(e) => update("panNumber", e.target.value)}
            className="h-10 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-[#234A91] focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div className="sm:col-span-2 lg:col-span-4">
          <label className="mb-1 block text-sm font-medium text-gray-700">Notes</label>
          <textarea
            value={data.notes}
            onChange={(e) => update("notes", e.target.value)}
            rows={2}
            className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#234A91] focus:ring-2 focus:ring-blue-100"
          />
        </div>
      </div>

      <div className="mt-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Documents</h3>
        <div
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
            dragActive
              ? "border-[#234A91] bg-blue-50"
              : "border-gray-300 hover:border-[#234A91]"
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleChange}
            className="hidden"
          />
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            stroke="currentColor"
            fill="none"
            viewBox="0 0 48 48"
            aria-hidden="true"
          >
            <path
              d="M28 8H12a4 4 0 00-4 4v20m32-12v12m0 0v4m0-4H36m-4 4h8"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <p className="mt-2 text-sm text-gray-600">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="font-medium text-[#234A91] hover:text-blue-700"
            >
              Upload a file
            </button>
            {" "}or drag and drop
          </p>
          <p className="mt-1 text-xs text-gray-500">PDF, DOC, JPG, PNG up to 10MB</p>
          {uploading && (
            <div className="mt-3 flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-[#234A91] border-t-transparent rounded-full animate-spin" />
              <span className="text-sm text-gray-600">Uploading...</span>
            </div>
          )}
        </div>

        {uploadedFiles.length > 0 && (
          <div className="mt-4 space-y-2">
            {uploadedFiles.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-gray-700">{file.name}</p>
                    <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeFile(file.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherBankSection;
