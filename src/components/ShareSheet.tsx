"use client";

import { useRef, useState } from "react";
import { ShareCard } from "./ShareCard";
import { useI18n } from "@/lib/i18n";
import type { DashboardData } from "@/lib/types";

export function ShareSheet({ data, onClose }: { data: DashboardData; onClose: () => void }) {
  const { t } = useI18n();
  const [backgroundUrl, setBackgroundUrl] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function exportPng() {
    const node = document.getElementById("share-card-export");
    if (!node) return;
    setExporting(true);
    try {
      const { toPng } = await import("html-to-image");
      const dataUrl = await toPng(node, {
        pixelRatio: 3,
        cacheBust: true,
        backgroundColor: "#000000",
      });
      const link = document.createElement("a");
      link.download = `wellness-${data.today.date}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error(err);
      alert(t.share.exportFailed);
    } finally {
      setExporting(false);
    }
  }

  function onPhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (backgroundUrl) URL.revokeObjectURL(backgroundUrl);
    setBackgroundUrl(URL.createObjectURL(file));
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/95 backdrop-blur-md">
      <header className="flex items-center justify-between border-b border-zinc-800 px-4 py-3">
        <button type="button" onClick={onClose} className="text-sm text-zinc-400">
          {t.common.close}
        </button>
        <p className="text-xs font-semibold uppercase tracking-widest text-zinc-300">{t.share.title}</p>
        <button
          type="button"
          onClick={exportPng}
          disabled={exporting}
          className="rounded-full bg-emerald-500 px-3 py-1 text-xs font-semibold text-black disabled:opacity-50"
        >
          {exporting ? t.common.saving : t.common.savePng}
        </button>
      </header>

      <div className="flex flex-1 flex-col items-center gap-4 overflow-y-auto px-4 py-6">
        <ShareCard data={data} backgroundUrl={backgroundUrl} />

        <div className="flex w-full max-w-[360px] gap-2">
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onPhotoChange} />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="flex-1 rounded-xl border border-zinc-700 py-3 text-xs font-medium text-zinc-300"
          >
            {t.share.addPhoto}
          </button>
          {backgroundUrl && (
            <button
              type="button"
              onClick={() => {
                URL.revokeObjectURL(backgroundUrl);
                setBackgroundUrl(null);
              }}
              className="rounded-xl border border-zinc-700 px-4 py-3 text-xs text-zinc-500"
            >
              {t.share.clearPhoto}
            </button>
          )}
        </div>
        <p className="max-w-[360px] text-center text-[10px] leading-relaxed text-zinc-600">{t.share.hint}</p>
      </div>
    </div>
  );
}
