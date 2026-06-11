"use client";

import { useState } from "react";
import { useI18n } from "@/lib/i18n";

export function WaitlistForm() {
  const { t, locale } = useI18n();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/waitlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim(), locale }),
    });

    setLoading(false);

    if (!res.ok) {
      const body = (await res.json().catch(() => ({}))) as { error?: string };
      setError(body.error ?? t.landing.waitlistError);
      return;
    }

    setDone(true);
  }

  if (done) {
    return (
      <div className="mt-8 rounded-2xl border border-emerald-500/30 bg-emerald-950/20 px-6 py-5">
        <p className="text-sm font-semibold text-emerald-300">{t.landing.waitlistSuccessTitle}</p>
        <p className="mt-2 text-sm text-zinc-400">{t.landing.waitlistSuccessBody.replace("{email}", email)}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-3 text-left">
      <label htmlFor="waitlist-email" className="sr-only">
        {t.landing.emailLabel}
      </label>
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          id="waitlist-email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t.landing.waitlistPlaceholder}
          className="min-w-0 flex-1 rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm text-white outline-none ring-emerald-500/40 focus:ring-2"
        />
        <button
          type="submit"
          disabled={loading}
          className="shrink-0 rounded-xl bg-emerald-500 px-6 py-3 text-sm font-semibold text-black transition hover:bg-emerald-400 disabled:opacity-60"
        >
          {loading ? t.landing.waitlistSubmitting : t.landing.waitlistCta}
        </button>
      </div>
      <p className="text-xs text-zinc-500">{t.landing.waitlistNote}</p>
      {error && <p className="text-sm text-rose-400">{error}</p>}
    </form>
  );
}
