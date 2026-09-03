import { getSettingsAdmin, listSiteStatsAdmin } from "@/lib/actions/admin-settings";
import SettingsForm from "./settings-form";
import StatRow from "./stat-row";

export const metadata = { title: "Admin · Settings — SNAR" };

export default async function AdminSettingsPage() {
  const [settings, stats] = await Promise.all([getSettingsAdmin(), listSiteStatsAdmin()]);

  return (
    <div className="shop-page">
      <div className="shop-header">
        <div className="shop-eyebrow">Admin</div>
        <h1 className="shop-title">Site Settings</h1>
      </div>

      <SettingsForm settings={settings} />

      <div className="shop-header" style={{ marginTop: "3rem" }}>
        <h1 className="shop-title">Homepage Stats</h1>
        <p className="shop-sub">The four numbers in the stats strip on the homepage.</p>
      </div>

      <div className="admin-table" style={{ maxWidth: "560px" }}>
        {stats.map((s) => (
          <StatRow key={s.slot} stat={s} />
        ))}
      </div>
    </div>
  );
}
