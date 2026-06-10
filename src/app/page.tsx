import { Dashboard } from "@/components/Dashboard";
import { loadDashboard } from "@/lib/data";

export default function Home() {
  const data = loadDashboard();
  return <Dashboard data={data} />;
}
