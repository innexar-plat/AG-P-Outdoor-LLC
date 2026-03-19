"use client";

import { useState, useRef, useCallback, type DragEvent } from "react";
import { useI18n } from "@/lib/i18n";

interface FileUploadProps {
  onUpload: (url: string) => void;
  folder?: string;
  accept?: string;
  maxSizeMb?: number;
  className?: string;
}

/** Drag-and-drop file upload component with R2 integration */
export function FileUpload({ onUpload, folder = "uploads", accept = "image/*", maxSizeMb = 5, className = "" }: FileUploadProps) {
  const { t } = useI18n();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFile = useCallback(async (file: File) => {
    setError(null);
    if (file.size > maxSizeMb * 1024 * 1024) {
      setError(`${t("maxFileSize")}: ${maxSizeMb}MB`);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);

    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", folder);
      const res = await fetch("/admin/api/admin/upload", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok || !json.data?.url) {
        setError(json.error ?? t("uploadError"));
        return;
      }
      onUpload(json.data.url);
    } catch {
      setError(t("uploadError"));
    } finally {
      setUploading(false);
    }
  }, [folder, maxSizeMb, onUpload, t]);

  function handleDrop(e: DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }

  return (
    <div className={className}>
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`
          relative cursor-pointer rounded-xl border-2 border-dashed p-6 text-center transition-all
          ${dragging ? "border-brand-500 bg-brand-50" : "border-slate-300 hover:border-brand-400 hover:bg-slate-50"}
          ${uploading ? "opacity-60 pointer-events-none" : ""}
        `.trim()}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleChange}
          className="hidden"
        />
        {preview ? (
          <div className="flex flex-col items-center gap-2">
            {preview.startsWith("data:video") || /\.(mp4|webm|mov)(\?|$)/i.test(preview) ? (
              <video src={preview} className="h-20 w-20 object-cover rounded-lg" muted playsInline />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={preview} alt="Preview" className="h-20 w-20 object-cover rounded-lg" />
            )}
            {uploading && <p className="text-xs text-brand-600 animate-pulse">{t("uploading")}</p>}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 text-slate-400">
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
            <p className="text-sm font-medium">{t("dropOrClick")}</p>
            <p className="text-xs">{t("maxFileSize")}</p>
          </div>
        )}
      </div>
      {error && <p className="text-xs text-red-600 mt-1.5">{error}</p>}
    </div>
  );
}
