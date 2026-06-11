"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useI18n } from "@/lib/i18n";

const EXPORT_CMD = "npm run garmin:export-tokens";

export function GarminConnectForm() {
  const { t } = useI18n();
  const router = useRouter();
  const [garminEmail, setGarminEmail] = useState("");
  const [tokenBlob, setTokenBlob] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/garmin/connect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tokenBlob: tokenBlob.trim(),
        garminEmail: garminEmail.trim() || undefined,
      }),
    });

    const body = (await res.json()) as { error?: string };
    setLoading(false);

    if (!res.ok) {
      setError(body.error ?? t.connect.error);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">{t.connect.title}</h1>
        <p className="mt-3 text-sm leading-relaxed text-zinc-400">{t.connect.subtitle}</p>
      </div>

      <div className="rounded-2xl border border-emerald-500/25 bg-emerald-950/20 p-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-emerald-400/90">
          {t.connect.safeTitle}
        </p>
        <p className="mt-2 text-sm leading-relaxed text-zinc-300">{t.connect.safeBody}</p>
      </div>

      <ol className="space-y-4 text-sm text-zinc-300">
        <li className="flex gap-3">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-xs font-semibold text-white">
            1
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-medium text-white">{t.connect.step1Title}</p>
            <p className="mt-1 text-zinc-500">{t.connect.step1Body}</p>
            <pre className="mt-3 overflow-x-auto rounded-xl border border-zinc-800 bg-black/60 p-3 text-xs text-emerald-300/90">
              {`git clone https://github.com/marfa77/garmin.git\ncd garmin\npip install garminconnect python-dotenv\n${EXPORT_CMD}`}
            </pre>
          </div>
        </li>
        <li className="flex gap-3">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-xs font-semibold text-white">
            2
          </span>
          <div>
            <p className="font-medium text-white">{t.connect.step2Title}</p>
            <p className="mt-1 text-zinc-500">{t.connect.step2Body}</p>
          </div>
        </li>
        <li className="flex gap-3">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-xs font-semibold text-white">
            3
          </span>
          <div>
            <p className="font-medium text-white">{t.connect.step3Title}</p>
            <p className="mt-1 text-zinc-500">{t.connect.step3Body}</p>
          </div>
        </li>
      </ol>

      <form onSubmit={handleSubmit} className="space-y-4 border-t border-zinc-800 pt-6">
        <div>
          <label className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
            {t.connect.tokenLabel}
          </label>
          <textarea
            required
            rows={5}
            value={tokenBlob}
            onChange={(e) => setTokenBlob(e.target.value)}
            placeholder='{"v":1,"files":{...}}'
            className="mt-2 w-full resize-y rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 font-mono text-xs text-white outline-none focus:ring-2 focus:ring-sky-500/40"
          />
        </div>
        <div>
          <label className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
            {t.connect.garminEmailOptional}
          </label>
          <input
            type="email"
            value={garminEmail}
            onChange={(e) => setGarminEmail(e.target.value)}
            placeholder="you@email.com"
            className="mt-2 w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-white outline-none focus:ring-2 focus:ring-sky-500/40"
          />
        </div>
        {error && <p className="text-sm text-rose-400">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-sky-500 px-4 py-3 text-sm font-semibold text-black hover:bg-sky-400 disabled:opacity-60"
        >
          {loading ? t.connect.connecting : t.connect.connect}
        </button>
      </form>

      <p className="text-center text-xs text-zinc-600">
        <Link href="/dashboard" className="text-zinc-500 hover:text-zinc-300">
          {t.connect.skipLater}
        </Link>
      </p>
    </div>
  );
}
