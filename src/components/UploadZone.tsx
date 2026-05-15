"use client";

import { useCallback, useState } from "react";
import { Upload, ImageIcon, Loader2, CheckCircle } from "lucide-react";
import type { OcrResult } from "@/types";

interface UploadZoneProps {
  onArtistsDetected?: (artistNames: string[]) => void;
}

export function UploadZone({ onArtistsDetected }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [ocrResult, setOcrResult] = useState<OcrResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFile = useCallback(
    async (file: File) => {
      if (!file.type.startsWith("image/")) return;

      setIsUploading(true);
      setError(null);
      setOcrResult(null);
      setPreview(URL.createObjectURL(file));

      try {
        const formData = new FormData();
        formData.append("image", file);

        const res = await fetch("/api/ocr", { method: "POST", body: formData });
        const data = await res.json();

        if (data.error) {
          setError(data.error);
          return;
        }

        if (data.artists && Array.isArray(data.artists)) {
          const result = data as OcrResult;
          setOcrResult(result);
          const names = result.artists.map((a) => a.name);
          onArtistsDetected?.(names);
        }
      } catch {
        setError("Failed to process image. Try again.");
      } finally {
        setIsUploading(false);
      }
    },
    [onArtistsDetected]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  return (
    <div
      className={`
        relative rounded-lg border-2 border-dashed transition-all duration-300
        ${isDragging
          ? "border-neon-cyan neon-pulse-cyan bg-neon-cyan/5"
          : "border-neon-cyan/30 hover:border-neon-cyan/60 bg-card"
        }
      `}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
    >
      <label className="flex flex-col items-center justify-center gap-2 p-6 cursor-pointer">
        {isUploading ? (
          <>
            <Loader2 className="h-8 w-8 text-neon-cyan animate-spin" />
            <span className="text-sm text-neon-cyan/80">Scanning schedule...</span>
          </>
        ) : ocrResult ? (
          <>
            <CheckCircle className="h-6 w-6 text-neon-green drop-shadow-[0_0_8px_rgba(57,255,20,0.6)]" />
            <span className="text-sm font-bold text-neon-green">
              {ocrResult.artists.length} artist{ocrResult.artists.length !== 1 ? "s" : ""} detected
            </span>
            <span className="text-xs text-muted-foreground">
              Drop another image to re-scan
            </span>
          </>
        ) : preview ? (
          <>
            <img
              src={preview}
              alt="Uploaded schedule"
              className="max-h-32 rounded-md object-contain"
            />
            <span className="text-xs text-muted-foreground">
              Drop another image to re-scan
            </span>
          </>
        ) : (
          <>
            <div className="rounded-full bg-neon-cyan/10 p-3 border border-neon-cyan/30">
              <Upload className="h-6 w-6 text-neon-cyan" />
            </div>
            <div className="text-center">
              <p className="font-[family-name:var(--font-display)] text-sm tracking-wider neon-text-cyan">
                DROP YOUR SCHEDULE
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                or click to browse &middot; PNG, JPG, WEBP
              </p>
            </div>
          </>
        )}
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={handleInputChange}
        />
      </label>

      {ocrResult && ocrResult.artists.length > 0 && (
        <div className="border-t border-neon-cyan/20 px-4 py-3">
          <p className="text-xs font-bold text-neon-cyan/70 mb-1.5 tracking-wider">
            DETECTED ARTISTS
          </p>
          <div className="flex flex-wrap gap-1.5">
            {ocrResult.artists.map((a, i) => (
              <span
                key={i}
                className="inline-flex items-center rounded-md border border-neon-pink/30 bg-neon-pink/10 px-2.5 py-0.5 text-xs font-bold text-neon-pink"
              >
                {a.name}
                {a.time && (
                  <span className="ml-1 text-neon-pink/60">{a.time}</span>
                )}
              </span>
            ))}
          </div>
        </div>
      )}

      {error && (
        <div className="border-t border-neon-red/30 px-4 py-3">
          <p className="text-sm text-neon-red drop-shadow-[0_0_6px_rgba(255,51,51,0.4)]">{error}</p>
        </div>
      )}
    </div>
  );
}
