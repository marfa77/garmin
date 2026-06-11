import { redirect } from "next/navigation";
import { GarminConnectForm } from "@/components/connect/GarminConnectForm";
import { requireUser } from "@/lib/auth-guard";
import { LocaleProvider } from "@/lib/i18n";
import {
  getGarminConnectionStatus,
  hasActiveSubscription,
} from "@/lib/supabase/queries";

export default async function ConnectGarminPage() {
  const { user } = await requireUser();

  const active = await hasActiveSubscription(user.id);
  if (!active) redirect("/subscribe");

  const garmin = await getGarminConnectionStatus(user.id);
  if (garmin) redirect("/dashboard");

  return (
    <LocaleProvider>
      <div className="mesh-bg flex min-h-screen flex-col items-center justify-center px-4 py-12">
        <GarminConnectForm />
      </div>
    </LocaleProvider>
  );
}
