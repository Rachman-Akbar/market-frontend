import { memo, useMemo, useRef, useState } from "react";
import { cn } from "@/shared/utils/utils";
import { getMediaUploadError, uploadMarketplaceImage } from "@/shared/services/mediaUploadService";
import { resolveMediaUrl } from "@/core/utils/mediaUrl";

export const ImageFilePicker = memo(function ImageFilePicker({
  value = "",
  onChange,
  scope = "general",
  label = "Pilih gambar",
  accept = "image/png,image/jpeg,image/webp",
  maxSizeMb = 5,
  aspectClassName = "aspect-[3/1]",
  disabled = false,
}) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const previewUrl = useMemo(() => resolveMediaUrl(value), [value]);

  const selectFile = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (file.size > maxSizeMb * 1024 * 1024) {
      setError(`Ukuran gambar maksimal ${maxSizeMb} MB.`);
      return;
    }

    setUploading(true);
    setError("");

    try {
      const uploaded = await uploadMarketplaceImage(file, scope);
      onChange?.(uploaded.url, uploaded);
    } catch (uploadError) {
      setError(getMediaUploadError(uploadError));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <input ref={inputRef} type="file" accept={accept} onChange={selectFile} className="hidden" />
      <button
        type="button"
        disabled={disabled || uploading}
        onClick={() => inputRef.current?.click()}
        className="flex h-10 items-center gap-2 border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
      >
        <span className={`material-symbols-outlined text-[18px] ${uploading ? "animate-spin" : ""}`}>{uploading ? "progress_activity" : "upload"}</span>
        {uploading ? "Mengunggah..." : label}
      </button>
      <div className={cn("relative overflow-hidden bg-slate-100", aspectClassName)}>
        {previewUrl ? <img src={previewUrl} alt="Preview" className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-slate-400"><span className="material-symbols-outlined text-4xl">image</span></div>}
        {previewUrl ? (
          <button type="button" onClick={() => onChange?.("", null)} className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center bg-white/90 text-red-600" aria-label="Hapus gambar">
            <span className="material-symbols-outlined text-[18px]">delete</span>
          </button>
        ) : null}
      </div>
      {error ? <p className="text-xs font-semibold text-red-600">{error}</p> : null}
    </div>
  );
});
