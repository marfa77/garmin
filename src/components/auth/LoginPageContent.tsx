"use client";

import Link from "next/link";
import { LoginForm } from "@/components/auth/LoginForm";
import { LocaleToggle } from "@/components/LocaleToggle";
import { useI18n } from "@/lib/i18n";

export function LoginPageContent({ next }: { next?: string }) {
  const { t } = useI18n();

  return (
    <div className="mesh-bg flex min-h-screen flex-col items-center justify-center px-4">
      <div className="absolute right-4 top-4">
        <LocaleToggle />
      </div>
      <div className="w-full max-w-md">
        <Link href="/" className="text-xs text-zinc-500 hover:text-zinc-300">
          ← {t.landing.brand}
        </Link>
        <h1 className="mt-6 text-2xl font-semibold text-white">{t.landing.loginTitle}</h1>
        <p className="mt-2 text-sm text-zinc-500">{t.landing.loginSubtitle}</p>
        <div className="mt-8">
          <LoginForm next={next} />
        </div>
      </div>
    </div>
  );
}
