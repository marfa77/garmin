import { redirect } from "next/navigation";
import { isFreeBeta } from "@/lib/access";
import { SubscribePanel } from "@/components/subscribe/SubscribePanel";
import { requireUser } from "@/lib/auth-guard";
import { LocaleProvider } from "@/lib/i18n";
import { linkSubscriptionsByEmail } from "@/lib/subscription-link";
import {
  getGarminConnectionStatus,
  hasActiveSubscription,
} from "@/lib/supabase/queries";

export default async function SubscribePage() {
  const { user } = await requireUser();

  if (isFreeBeta()) {
    redirect("/connect/garmin");
  }

  if (user.email) {
    await linkSubscriptionsByEmail(user.id, user.email);
  }

  const active = await hasActiveSubscription(user.id);
  if (active) {
    const garmin = await getGarminConnectionStatus(user.id);
    redirect(garmin ? "/dashboard" : "/connect/garmin");
  }

  return (
    <LocaleProvider>
      <div className="mesh-bg flex min-h-screen items-center justify-center px-4">
        <SubscribePanel email={user.email ?? ""} />
      </div>
    </LocaleProvider>
  );
}
