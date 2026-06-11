"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { LocaleToggle } from "@/components/LocaleToggle";
import { useI18n } from "@/lib/i18n";
import { gumroadCheckoutUrl } from "@/lib/gumroad";

export function SubscribePanel({ email }: { email: string }) {
  const { t } = useI18n();
  const router = useRouter();
  const [checking, setChecking] = useState(false);
  const gumroadUrl = gumroadCheckoutUrl(email);

  async function recheckAccess() {
    setChecking(true);
    const res = await fetch("/api/subscription/check", { method: "POST" });
    const body = (await res.json().catch(() => ({}))) as { active?: boolean };
    setChecking(false);
    if (body.active) {
      router.push("/connect/garmin");
      return;
    }
    router.refresh();
  }

  return (
    <div className="relative mx-auto max-w-lg text-center">
      <div className="absolute -top-12 right-0">
        <LocaleToggle />
      </div>
      <h1 className="text-2xl font-semibold text-white">{t.subscribe.title}</h1>
      <p className="mt-3 text-zinc-400">{t.subscribe.subtitle}</p>
      <p className="mt-8 text-4xl font-semibold text-white">{t.landing.price}</p>
      <a
        href={gumroadUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-6 inline-block rounded-xl bg-emerald-500 px-8 py-3 text-sm font-semibold text-black hover:bg-emerald-400"
      >
        {t.subscribe.payGumroad}
      </a>
      <p className="mt-6 text-xs text-zinc-600">{t.subscribe.emailHint.replace("{email}", email)}</p>
      <button
        type="button"
        onClick={recheckAccess}
        disabled={checking}
        className="mt-4 text-sm text-sky-400 hover:text-sky-300 disabled:opacity-50"
      >
        {checking ? t.subscribe.checking : t.subscribe.alreadyPaid}
      </button>
      <p className="mt-8">
        <Link href="/login" className="text-sm text-zinc-500 hover:text-zinc-300">
          {t.subscribe.backLogin}
        </Link>
      </p>
    </div>
  );
}
