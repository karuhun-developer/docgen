import { useEffect, useRef, useState } from "react";
import { PencilSimple, Eraser } from "@phosphor-icons/react";
import type { Signature, SignatureMode } from "../../types";
import { Field, Input } from "../ui";
import ImageUpload from "./ImageUpload";

interface Props {
  signature: Signature;
  onChange: (patch: Partial<Signature>) => void;
}

const MODES: { id: SignatureMode; label: string }[] = [
  { id: "draw", label: "Gambar" },
  { id: "upload", label: "Unggah" },
  { id: "text", label: "Ketik Nama" },
];

function DrawCanvas({
  value,
  onChange,
}: {
  value: string;
  onChange: (dataUrl: string) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const [hasInk, setHasInk] = useState(false);

  // Restore an existing drawing onto the canvas when mounted
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.lineWidth = 2.2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#0f172a";
    if (value) {
      const img = new Image();
      img.onload = () => ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      img.src = value;
      setHasInk(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function pos(e: React.PointerEvent<HTMLCanvasElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * e.currentTarget.width,
      y: ((e.clientY - rect.top) / rect.height) * e.currentTarget.height,
    };
  }

  function start(e: React.PointerEvent<HTMLCanvasElement>) {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawing.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    const { x, y } = pos(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  }

  function move(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawing.current) return;
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const { x, y } = pos(e);
    ctx.lineTo(x, y);
    ctx.stroke();
    setHasInk(true);
  }

  function end() {
    if (!drawing.current) return;
    drawing.current = false;
    const canvas = canvasRef.current;
    if (canvas) onChange(canvas.toDataURL("image/png"));
  }

  function clear() {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasInk(false);
    onChange("");
  }

  return (
    <div>
      <div className="relative overflow-hidden rounded-lg border border-border bg-white">
        <canvas
          ref={canvasRef}
          width={480}
          height={180}
          className="h-40 w-full touch-none"
          style={{ cursor: "crosshair" }}
          onPointerDown={start}
          onPointerMove={move}
          onPointerUp={end}
          onPointerLeave={end}
        />
        {!hasInk && (
          <span className="pointer-events-none absolute inset-0 flex items-center justify-center gap-1.5 text-xs text-slate-300">
            <PencilSimple size={16} /> Gambar tanda tangan di sini
          </span>
        )}
      </div>
      <button
        type="button"
        onClick={clear}
        className="mt-2 inline-flex cursor-pointer items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium text-slate-500 transition-colors duration-200 hover:bg-muted"
      >
        <Eraser size={14} weight="bold" /> Bersihkan
      </button>
    </div>
  );
}

export default function SignaturePad({ signature, onChange }: Props) {
  return (
    <div className="space-y-3">
      <div className="inline-flex rounded-lg border border-border bg-muted p-0.5">
        {MODES.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => onChange({ mode: m.id })}
            className={`cursor-pointer rounded-md px-3 py-1.5 text-xs font-medium transition-colors duration-200 ${
              signature.mode === m.id
                ? "bg-white text-primary shadow-sm"
                : "text-slate-500 hover:text-foreground"
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      {signature.mode === "draw" && (
        <DrawCanvas
          value={signature.value}
          onChange={(v) => onChange({ value: v })}
        />
      )}
      {signature.mode === "upload" && (
        <ImageUpload
          value={signature.value}
          onChange={(v) => onChange({ value: v })}
          label="Unggah gambar tanda tangan"
          hint="PNG transparan lebih rapi"
          previewClass="h-28"
        />
      )}
      {signature.mode === "text" && (
        <p className="text-xs text-slate-400">
          Mode ketik: nama penandatangan di bawah akan ditampilkan sebagai tanda
          tangan.
        </p>
      )}

      <div className="grid grid-cols-2 gap-3">
        <Field label="Nama Penandatangan">
          <Input
            value={signature.label}
            onChange={(e) => onChange({ label: e.target.value })}
            placeholder="Nama lengkap"
          />
        </Field>
        <Field label="Tempat">
          <Input
            value={signature.place}
            onChange={(e) => onChange({ place: e.target.value })}
            placeholder="Kota"
          />
        </Field>
      </div>
    </div>
  );
}
