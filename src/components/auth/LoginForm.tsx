"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useI18n } from "@/lib/i18n";

type LoginMode = "password" | "magic";

export function LoginForm({ next = "/dashboard" }: { next?: string }) {
  const { t } = useI18n();
  const router = useRouter();
  const [mode, setMode] = useState<LoginMode>("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handlePasswordLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error: signError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    setLoading(false);

    if (signError) {
      const msg = signError.message.toLowerCase();
      if (msg.includes("invalid login") || msg.includes("invalid credentials")) {
        setError(t.landing.loginInvalidCredentials);
      } else {
        setError(t.landing.loginErrorGeneric);
      }
      return;
    }

    router.push(next);
    router.refresh();
  }

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const origin = window.location.origin;
    const { error: signError } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });

    setLoading(false);
    if (signError) {
      const msg = signError.message.toLowerCase();
      if (msg.includes("rate limit")) {
        setError(t.landing.loginRateLimit);
      } else {
        setError(t.landing.loginErrorGeneric);
      }
      return;
    }
    setSent(true);
  }

  if (sent && mode === "magic") {
    return (
      <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-6 text-center">
        <p className="text-lg font-semibold text-white">{t.landing.loginSentTitle}</p>
        <p className="mt-2 text-sm text-zinc-400">{t.landing.loginSentBody.replace("{email}", email)}</p>
        <button
          type="button"
          onClick={() => {
            setSent(false);
            setMode("password");
          }}
          className="mt-4 text-sm text-sky-400 hover:text-sky-300"
        >
          {t.landing.usePasswordInstead}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex rounded-xl border border-zinc-800 bg-zinc-950 p-1">
        <button
          type="button"
          onClick={() => {
            setMode("password");
            setError(null);
          }}
          className={`flex-1 rounded-lg px-3 py-2 text-xs font-semibold uppercase tracking-wider transition ${
            mode === "password" ? "bg-zinc-800 text-white" : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          {t.landing.loginModePassword}
        </button>
        <button
          type="button"
          onClick={() => {
            setMode("magic");
            setError(null);
          }}
          className={`flex-1 rounded-lg px-3 py-2 text-xs font-semibold uppercase tracking-wider transition ${
            mode === "magic" ? "bg-zinc-800 text-white" : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          {t.landing.loginModeMagic}
        </button>
      </div>

      <form onSubmit={mode === "password" ? handlePasswordLogin : handleMagicLink} className="space-y-4">
        <div>
          <label htmlFor="email" className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
            {t.landing.emailLabel}
          </label>
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@email.com"
            className="mt-2 w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-white outline-none ring-emerald-500/40 focus:ring-2"
          />
        </div>

        {mode === "password" && (
          <div>
            <label htmlFor="password" className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
              {t.landing.passwordLabel}
            </label>
            <input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-2 w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-white outline-none ring-emerald-500/40 focus:ring-2"
            />
          </div>
        )}

        {error && <p className="text-sm text-rose-400">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-black transition hover:bg-emerald-400 disabled:opacity-60"
        >
          {loading
            ? t.landing.signingIn
            : mode === "password"
              ? t.landing.loginSignIn
              : t.landing.sendMagicLink}
        </button>
      </form>

      {mode === "password" && (
        <p className="text-center text-xs leading-relaxed text-zinc-600">{t.landing.passwordHint}</p>
      )}
    </div>
  );
}
