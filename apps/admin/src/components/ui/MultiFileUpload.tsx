"use client";

import { useState, useRef, useCallback, useEffect, type DragEvent } from "react";
import { useI18n } from "@/lib/i18n";
import { X } from "lucide-react";

interface MultiFileUploadProps {
  onUpload: (urls: string[]) => void;
  folder?: string;
  accept?: string;
  maxSizeMb?: number;
  maxFiles?: number;
  className?: string;
}

interface FileWithPreview {
  file: File;
  preview: string;
  url?: string;
  error?: string;
  uploading?: boolean;
}

/** Drag-and-drop multi-file upload component with R2 integration */
export function MultiFileUpload({
  onUpload,
  folder = "uploads",
  accept = "image/*",
  maxSizeMb = 5,
  maxFiles = 10,
  className = "",
}: MultiFileUploadProps) {
  const { t } = useI18n();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [uploading, setUploading] = useState(false);

  const handleFiles = useCallback(
    async (newFiles: FileList | null) => {
      if (!newFiles) return;

      const fileArray = Array.from(newFiles);
      const remaining = maxFiles - files.length;
      const filesToAdd = fileArray.slice(0, remaining);

      const filesWithPreview: FileWithPreview[] = [];

      for (const file of filesToAdd) {
        if (file.size > maxSizeMb * 1024 * 1024) {
          filesWithPreview.push({
            file,
            preview: "",
            error: `File too large: ${file.name}`,
          });
          continue;
        }

        const reader = new FileReader();
        const preview = await new Promise<string>((resolve) => {
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.readAsDataURL(file);
        });

        filesWithPreview.push({
          file,
          preview,
          uploading: false,
        });
      }

      setFiles((prev) => [...prev, ...filesWithPreview]);
    },
    [files.length, maxFiles, maxSizeMb]
  );

  const uploadFile = useCallback(
    async (index: number) => {
      const item = files[index];
      if (!item || item.url || item.error) return;

      setFiles((prev) =>
        prev.map((f, i) =>
          i === index ? { ...f, uploading: true } : f
        )
      );

      try {
        const fd = new FormData();
        fd.append("file", item.file);
        fd.append("folder", folder);
        const res = await fetch("/admin/api/admin/upload", {
          method: "POST",
          body: fd,
        });
        const json = await res.json();

        if (!res.ok || !json.data?.url) {
          setFiles((prev) =>
            prev.map((f, i) =>
              i === index
                ? { ...f, error: json.error ?? "Upload failed", uploading: false }
                : f
            )
          );
          return;
        }

        setFiles((prev) => {
          const updated = prev.map((f, i) =>
            i === index
              ? { ...f, url: json.data.url, uploading: false }
              : f
          );

          // Auto-trigger upload for next file
          const nextIndex = updated.findIndex(
            (f) => !f.url && !f.error && !f.uploading
          );
          if (nextIndex !== -1) {
            setTimeout(() => uploadFile(nextIndex), 200);
          }

          return updated;
        });
      } catch {
        setFiles((prev) =>
          prev.map((f, i) =>
            i === index
              ? { ...f, error: "Upload error", uploading: false }
              : f
          )
        );
      }
    },
    [files, folder]
  );

  const handleUploadAll = useCallback(() => {
    setUploading(true);
    const pendingIndex = files.findIndex(
      (f) => !f.url && !f.error && !f.uploading
    );
    if (pendingIndex !== -1) {
      uploadFile(pendingIndex);
    } else {
      setUploading(false);
      const urls = files.filter((f) => f.url).map((f) => f.url!);
      if (urls.length > 0) {
        onUpload(urls);
      }
    }
  }, [files, uploadFile, onUpload]);

  const removeFile = useCallback((index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  function handleDrop(e: DragEvent) {
    e.preventDefault();
    setDragging(false);
    handleFiles(e.dataTransfer.files);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    handleFiles(e.target.files);
  }

  const uploadedCount = files.filter((f) => f.url).length;
  const errorCount = files.filter((f) => f.error).length;
  const allUploaded = files.length > 0 && uploadedCount + errorCount === files.length;

  useEffect(() => {
    if (!uploading || !allUploaded) return;
    setUploading(false);
    const urls = files.filter((f) => f.url).map((f) => f.url!);
    onUpload(urls);
  }, [uploading, allUploaded, files, onUpload]);

  return (
    <div className={className}>
      {/* Upload Area */}
      {files.length < maxFiles && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`
            relative cursor-pointer rounded-xl border-2 border-dashed p-6 text-center transition-all
            ${dragging ? "border-brand-500 bg-brand-50" : "border-slate-300 hover:border-brand-400 hover:bg-slate-50"}
          `.trim()}
        >
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            multiple
            onChange={handleChange}
            className="hidden"
          />
          <div className="flex flex-col items-center gap-2 text-slate-400">
            <svg
              className="h-8 w-8"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
              />
            </svg>
            <p className="text-sm font-medium">Upload multiple images</p>
            <p className="text-xs">
              Max {maxFiles - files.length} more file(s), {maxSizeMb}MB each
            </p>
          </div>
        </div>
      )}

      {/* File List */}
      {files.length > 0 && (
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-slate-700">
              Files ({uploadedCount}/{files.length})
            </h4>
            {!uploading && allUploaded && uploadedCount > 0 && (
              <button
                onClick={handleUploadAll}
                className="text-xs font-medium text-brand-600 hover:text-brand-700"
              >
                Complete Upload
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {files.map((item, idx) => (
              <div key={idx} className="relative group">
                {/* Preview */}
                <div className="relative overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                  {item.preview && (
                    <img
                      src={item.preview}
                      alt={item.file.name}
                      className="h-24 sm:h-28 w-full object-cover"
                    />
                  )}

                  {/* Error Overlay */}
                  {item.error && (
                    <div className="absolute inset-0 bg-red-900/70 flex items-center justify-center">
                      <p className="text-xs text-white text-center px-1">
                        {item.error}
                      </p>
                    </div>
                  )}

                  {/* Uploading Overlay */}
                  {item.uploading && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-brand-500" />
                    </div>
                  )}

                  {/* Success Overlay */}
                  {item.url && (
                    <div className="absolute inset-0 bg-green-900/50 flex items-center justify-center">
                      <svg
                        className="h-6 w-6 text-green-100"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  )}

                  {/* Remove Button */}
                  <button
                    onClick={() => removeFile(idx)}
                    className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-red-500 hover:bg-red-600 text-white rounded-full p-1 shadow-lg"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Filename */}
                <p className="text-xs text-slate-600 mt-1 truncate">
                  {item.file.name}
                </p>
              </div>
            ))}
          </div>

          {/* Upload Button */}
          {!allUploaded && (
            <button
              onClick={() => {
                setUploading(true);
                const firstPending = files.findIndex(
                  (f) => !f.url && !f.error && !f.uploading
                );
                if (firstPending !== -1) {
                  uploadFile(firstPending);
                }
              }}
              disabled={uploading}
              className="w-full mt-3 px-4 py-2 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
            >
              {uploading ? "Uploading..." : "Upload All"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
