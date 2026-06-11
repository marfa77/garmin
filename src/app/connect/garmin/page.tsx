import { redirect } from "next/navigation";
import { userHasAccess } from "@/lib/access";
import { GarminConnectForm } from "@/components/connect/GarminConnectForm";
import { requireUser } from "@/lib/auth-guard";
import { LocaleProvider } from "@/lib/i18n";
import { getGarminConnectionStatus } from "@/lib/supabase/queries";

export default async function ConnectGarminPage() {
  const { supabase, user } = await requireUser();

  const hasAccess = await userHasAccess(supabase, user.id);
  if (!hasAccess) redirect("/subscribe");

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
