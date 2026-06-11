import { Dashboard } from "@/components/Dashboard";
import { loadDashboard } from "@/lib/data";
import { requireOnboardedUser } from "@/lib/auth-guard";
import { getLatestDashboardSnapshot } from "@/lib/supabase/queries";

export default async function DashboardPage() {
  const { user } = await requireOnboardedUser();

  let data = await getLatestDashboardSnapshot(user.id);
  if (!data) {
    data = loadDashboard();
  }

  return <Dashboard data={data} />;
}
