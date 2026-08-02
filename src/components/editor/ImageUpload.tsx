import { useRef } from "react";
import { UploadSimple, Trash } from "@phosphor-icons/react";

function fileToDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

interface Props {
  value: string;
  onChange: (dataUrl: string) => void;
  label?: string;
  /** height of the preview box */
  previewClass?: string;
  hint?: string;
}

export default function ImageUpload({
  value,
  onChange,
  label = "Unggah gambar",
  previewClass = "h-24",
  hint,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/")) return;
    const url = await fileToDataURL(file);
    onChange(url);
  }

  return (
    <div>
      {value ? (
        <div className="flex items-start gap-3">
          <div
            className={`flex ${previewClass} items-center justify-center overflow-hidden rounded-lg border border-border bg-muted p-2`}
          >
            <img
              src={value}
              alt="preview"
              className="max-h-full max-w-[160px] object-contain"
            />
          </div>
          <button
            type="button"
            onClick={() => onChange("")}
            className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium text-destructive transition-colors duration-200 hover:bg-red-50"
          >
            <Trash size={14} weight="bold" /> Hapus
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className={`flex ${previewClass} w-full cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-border text-xs text-slate-500 transition-colors duration-200 hover:border-primary hover:text-primary`}
        >
          <UploadSimple size={20} weight="bold" />
          {label}
          {hint && <span className="text-[10px] text-slate-400">{hint}</span>}
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
    </div>
  );
}
