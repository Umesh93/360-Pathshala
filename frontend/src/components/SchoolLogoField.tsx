import { useEffect, useRef, useState } from "react";
import { ImagePlus, Trash2 } from "lucide-react";
import { loadSchoolLogoUrl } from "../services/schoolService";

const allowedTypes = ["image/png", "image/jpeg", "image/webp"];
const maxSize = 2 * 1024 * 1024;

interface SchoolLogoFieldProps {
  schoolId?: number;
  currentLogoUrl?: string | null;
  file?: File;
  remove: boolean;
  onFileChange: (file?: File) => void;
  onRemoveChange: (remove: boolean) => void;
  onError: (message: string) => void;
}

export default function SchoolLogoField({
  schoolId,
  currentLogoUrl,
  file,
  remove,
  onFileChange,
  onRemoveChange,
  onError,
}: SchoolLogoFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [currentLogo, setCurrentLogo] = useState<{
    schoolId: number;
    url: string;
  }>();
  const [preview, setPreview] = useState<{ file: File; url: string }>();

  useEffect(() => {
    if (!file) return;
    let active = true;
    const url = URL.createObjectURL(file);
    Promise.resolve().then(() => {
      if (active) setPreview({ file, url });
    });
    return () => {
      active = false;
      URL.revokeObjectURL(url);
    };
  }, [file]);

  useEffect(() => {
    let active = true;
    let url: string | undefined;
    if (!schoolId || !currentLogoUrl || remove) return;
    loadSchoolLogoUrl(schoolId)
      .then((loaded) => {
        url = loaded;
        if (active) {
          setCurrentLogo({ schoolId, url: loaded });
        } else {
          URL.revokeObjectURL(loaded);
        }
      })
      .catch(() => undefined);
    return () => {
      active = false;
      if (url) URL.revokeObjectURL(url);
    };
  }, [currentLogoUrl, remove, schoolId]);

  const choose = (selected?: File) => {
    if (!selected) return;
    if (!allowedTypes.includes(selected.type)) {
      onError("Logo must be PNG, JPG, JPEG, or WebP.");
      return;
    }
    if (selected.size > maxSize) {
      onError("Logo must be 2 MiB or smaller.");
      return;
    }
    onRemoveChange(false);
    onFileChange(selected);
  };

  const previewUrl = file && preview?.file === file ? preview.url : undefined;
  const currentUrl =
    schoolId && currentLogo?.schoolId === schoolId
      ? currentLogo.url
      : undefined;
  const visibleUrl = previewUrl || (!remove ? currentUrl : undefined);
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700">
        School Logo
      </label>
      <div className="flex items-center gap-4">
        <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-lg border border-slate-300 bg-slate-50 text-xs text-slate-400">
          {visibleUrl ? (
            <img
              src={visibleUrl}
              alt="School logo preview"
              className="h-full w-full object-contain"
            />
          ) : (
            "No logo"
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <input
            ref={inputRef}
            type="file"
            accept=".png,.jpg,.jpeg,.webp,image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={(event) => choose(event.target.files?.[0])}
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <ImagePlus size={16} /> {visibleUrl ? "Replace" : "Choose logo"}
          </button>
          {(visibleUrl || currentLogoUrl) && (
            <button
              type="button"
              onClick={() => {
                onFileChange(undefined);
                onRemoveChange(Boolean(currentLogoUrl));
              }}
              className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50"
            >
              <Trash2 size={16} /> Remove
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
