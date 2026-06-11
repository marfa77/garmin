"use client";

import Link from "next/link";
import { LoginForm } from "@/components/auth/LoginForm";
import { WhoopRing } from "@/components/WhoopRing";
import { useI18n } from "@/lib/i18n";
import { gumroadCheckoutUrl } from "@/lib/gumroad";

const COLORS = { sleep: "#8ecae6", recovery: "#3ecf8e", strain: "#5b9bd5" };
const freeBeta = process.env.NEXT_PUBLIC_FREE_BETA === "true";

export function LandingPage() {
  const { t } = useI18n();
  const gumroadUrl = gumroadCheckoutUrl();

  return (
    <div className="mesh-bg min-h-screen">
      <header className="border-b border-zinc-800/80 bg-black/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <p className="text-sm font-semibold tracking-wide text-white">{t.landing.brand}</p>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-zinc-400 hover:text-white">
              {t.landing.signIn}
            </Link>
            {freeBeta ? (
              <Link
                href="/login"
                className="rounded-lg bg-emerald-500 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-black hover:bg-emerald-400"
              >
                {t.landing.betaBadge}
              </Link>
            ) : (
              <a
                href={gumroadUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg bg-emerald-500 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-black hover:bg-emerald-400"
              >
                {t.landing.subscribe}
              </a>
            )}
          </div>
        </div>
      </header>

      <main>
        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              {freeBeta && (
                <p className="mb-3 inline-block rounded-full border border-emerald-500/40 bg-emerald-950/40 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-emerald-400">
                  {t.landing.betaBadge}
                </p>
              )}
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-emerald-400/80">
                {t.landing.eyebrow}
              </p>
              <h1 className="mt-4 text-4xl font-semibold leading-tight text-white sm:text-5xl">
                {t.landing.heroTitle}
              </h1>
              <p className="mt-5 text-lg leading-relaxed text-zinc-400">{t.landing.heroSubtitle}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/login"
                  className="rounded-xl bg-white px-6 py-3 text-sm font-semibold text-black hover:bg-zinc-200"
                >
                  {freeBeta ? t.landing.ctaBeta : t.landing.ctaStart}
                </Link>
                {!freeBeta && (
                  <a
                    href={gumroadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-xl border border-zinc-600 px-6 py-3 text-sm font-semibold text-white hover:border-zinc-400"
                  >
                    {t.landing.ctaPricing}
                  </a>
                )}
              </div>
            </div>

            <div className="rounded-3xl border border-zinc-800 bg-zinc-950/80 p-6 shadow-2xl">
              <p className="text-[10px] uppercase tracking-widest text-zinc-500">{t.landing.previewLabel}</p>
              <div className="mt-6 flex items-end justify-center gap-3">
                <WhoopRing value="77%" label={t.rings.sleep} pct={77} color={COLORS.sleep} />
                <WhoopRing value="89%" label={t.rings.recovery} pct={89} color={COLORS.recovery} size="lg" />
                <WhoopRing value="14.6" label={t.rings.strain} pct={70} color={COLORS.strain} />
              </div>
              <div className="mt-6 rounded-2xl border border-emerald-500/20 bg-emerald-950/20 p-4">
                <p className="text-xs uppercase tracking-widest text-emerald-400/80">{t.landing.coachPreview}</p>
                <p className="mt-2 text-base font-semibold text-white">{t.landing.coachHeadline}</p>
                <p className="mt-2 text-sm leading-relaxed text-zinc-400">{t.landing.coachBody}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-zinc-800/60 bg-zinc-950/40 py-16">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <h2 className="text-2xl font-semibold text-white">{t.landing.forWhoTitle}</h2>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {t.landing.audiences.map((item) => (
                <div key={item.title} className="rounded-2xl border border-zinc-800 bg-black/40 p-5">
                  <p className="font-semibold text-white">{item.title}</p>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-400">{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <h2 className="text-2xl font-semibold text-white">{t.landing.featuresTitle}</h2>
            <div className="mt-8 grid gap-6 md:grid-cols-2">
              {t.landing.features.map((f) => (
                <div
                  key={f.title}
                  className="rounded-2xl border border-zinc-800 bg-gradient-to-br from-zinc-900/60 to-zinc-950 p-6"
                >
                  <p className="text-lg font-semibold text-white">{f.title}</p>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-400">{f.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="pricing" className="border-t border-zinc-800/60 bg-zinc-950/50 py-16">
          <div className="mx-auto max-w-lg px-4 text-center sm:px-6">
            <h2 className="text-2xl font-semibold text-white">
              {freeBeta ? t.landing.betaPricingTitle : t.landing.pricingTitle}
            </h2>
            <p className="mt-3 text-zinc-400">
              {freeBeta ? t.landing.betaPricingSubtitle : t.landing.pricingSubtitle}
            </p>
            <p className="mt-8 text-5xl font-semibold text-white">
              {freeBeta ? t.landing.betaPrice : t.landing.price}
            </p>
            <p className="mt-2 text-sm text-zinc-500">
              {freeBeta ? t.landing.betaPriceNote : t.landing.priceNote}
            </p>
            {freeBeta ? (
              <Link
                href="/login"
                className="mt-8 inline-block rounded-xl bg-emerald-500 px-8 py-3 text-sm font-semibold text-black hover:bg-emerald-400"
              >
                {t.landing.ctaBeta}
              </Link>
            ) : (
              <a
                href={gumroadUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-8 inline-block rounded-xl bg-emerald-500 px-8 py-3 text-sm font-semibold text-black hover:bg-emerald-400"
              >
                {t.landing.subscribeGumroad}
              </a>
            )}
          </div>
        </section>

        <section className="py-16">
          <div className="mx-auto max-w-md px-4 sm:px-6">
            <h2 className="text-center text-xl font-semibold text-white">
              {freeBeta ? t.landing.ctaBeta : t.landing.loginTitle}
            </h2>
            <p className="mt-2 text-center text-sm text-zinc-500">{t.landing.loginSubtitle}</p>
            <div className="mt-6">
              <LoginForm />
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-zinc-800 py-8 text-center text-xs text-zinc-600">
        {t.landing.footer}
      </footer>
    </div>
  );
}
