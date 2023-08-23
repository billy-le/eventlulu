import { DefaultLayout } from "~/layouts/default";
import { DashboardTile } from "~/ui/DashboardTile";
export default function Dashboard() {
  return (
    <DefaultLayout>
      <div className="flex flex-wrap gap-8">
        <DashboardTile />
        <DashboardTile />
        <DashboardTile />
        <DashboardTile />
        <DashboardTile />
        <DashboardTile />
        <DashboardTile />
      </div>
    </DefaultLayout>
  );
}
