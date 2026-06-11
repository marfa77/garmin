"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useI18n } from "@/lib/i18n";

export function GarminConnectForm({ oauthReady }: { oauthReady: boolean }) {
  const { t } = useI18n();
  const searchParams = useSearchParams();
  const errorCode = searchParams.get("error");

  const errorMessage =
    errorCode === "denied"
      ? t.connect.oauthDenied
      : errorCode === "exchange" || errorCode === "save"
        ? t.connect.oauthFailed
        : errorCode === "session" || errorCode === "state"
          ? t.connect.oauthSession
          : errorCode === "not_configured"
            ? t.connect.oauthNotConfigured
            : null;

  return (
    <div className="mx-auto max-w-md space-y-8 text-center">
      <div>
        <h1 className="text-2xl font-semibold text-white">{t.connect.title}</h1>
        <p className="mt-3 text-sm leading-relaxed text-zinc-400">{t.connect.subtitle}</p>
      </div>

      <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-8">
        {oauthReady ? (
          <>
            <a
              href="/api/garmin/oauth/start"
              className="inline-flex w-full items-center justify-center gap-3 rounded-xl bg-[#007cc3] px-6 py-4 text-base font-semibold text-white transition hover:bg-[#006aaa]"
            >
              <GarminMark />
              {t.connect.connectGarmin}
            </a>
            <p className="mt-4 text-xs leading-relaxed text-zinc-500">{t.connect.oauthHint}</p>
          </>
        ) : (
          <p className="text-sm text-amber-200/90">{t.connect.oauthNotConfigured}</p>
        )}
      </div>

      {errorMessage && (
        <p className="rounded-xl border border-rose-500/30 bg-rose-950/30 px-4 py-3 text-sm text-rose-300">
          {errorMessage}
        </p>
      )}

      <p className="text-xs text-zinc-600">
        <Link href="/dashboard" className="text-zinc-500 hover:text-zinc-300">
          {t.connect.skipLater}
        </Link>
      </p>
    </div>
  );
}

function GarminMark() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15v-4H8v-2h3V9h2v4h3v2h-3v4h-2z" />
    </svg>
  );
}
