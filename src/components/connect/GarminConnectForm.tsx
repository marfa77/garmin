"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useI18n } from "@/lib/i18n";

export function GarminConnectForm() {
  const { t } = useI18n();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/garmin/connect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const body = (await res.json()) as { error?: string; mfaRequired?: boolean };
    setLoading(false);

    if (!res.ok) {
      setError(
        body.mfaRequired ? t.connect.mfaHint : body.error ?? t.connect.error
      );
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-md space-y-4">
      <h1 className="text-2xl font-semibold text-white">{t.connect.title}</h1>
      <p className="text-sm text-zinc-400">{t.connect.subtitle}</p>
      <div>
        <label className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
          {t.connect.garminEmail}
        </label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-2 w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-white outline-none focus:ring-2 focus:ring-sky-500/40"
        />
      </div>
      <div>
        <label className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
          {t.connect.garminPassword}
        </label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-2 w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-white outline-none focus:ring-2 focus:ring-sky-500/40"
        />
      </div>
      <p className="text-xs text-zinc-600">{t.connect.securityNote}</p>
      {error && <p className="text-sm text-rose-400">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-sky-500 px-4 py-3 text-sm font-semibold text-black hover:bg-sky-400 disabled:opacity-60"
      >
        {loading ? t.connect.connecting : t.connect.connect}
      </button>
    </form>
  );
}
