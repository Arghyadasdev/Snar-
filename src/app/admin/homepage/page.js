import Link from "next/link";
import { listBannersAdmin, listMarqueeAdmin, deleteBanner, createMarqueeItem } from "@/lib/actions/admin-homepage";
import MarqueeRow from "./marquee-row";

export const metadata = { title: "Admin · Homepage — SNAR" };

export default async function AdminHomepagePage() {
  const [banners, marqueeItems] = await Promise.all([listBannersAdmin(), listMarqueeAdmin()]);

  return (
    <div className="shop-page">
      <div className="shop-header admin-header-row">
        <div>
          <div className="shop-eyebrow">Admin</div>
          <h1 className="shop-title">Homepage — Banners</h1>
        </div>
        <Link href="/admin/homepage/banners/new" className="btn-primary">NEW BANNER</Link>
      </div>

      <div className="admin-table" style={{ marginBottom: "3rem" }}>
        {banners.length === 0 && <p className="empty-state">No banners yet.</p>}
        {banners.map((b) => (
          <div key={b.id} className="admin-table-row">
            <img
              src={b.media_type === "image" ? b.media_url : "/logo.png"}
              alt=""
              className="admin-table-img"
            />
            <div className="admin-table-name">
              {b.headline_line1} {b.headline_line2} {b.accent_word}
              {!b.is_active && <span className="order-status order-status-cancelled" style={{ marginLeft: ".5rem" }}>hidden</span>}
            </div>
            <div className="admin-table-cat">{b.media_type} · order {b.sort_order}</div>
            <div className="admin-table-price"></div>
            <div className="admin-table-actions">
              <Link href={`/admin/homepage/banners/${b.id}/edit`}>Edit</Link>
              <form action={deleteBanner}>
                <input type="hidden" name="id" value={b.id} />
                <button type="submit" className="admin-delete-btn">Delete</button>
              </form>
            </div>
          </div>
        ))}
      </div>

      <div className="shop-header">
        <h1 className="shop-title">Promo Marquee</h1>
        <p className="shop-sub">The scrolling ticker strip under the hero.</p>
      </div>

      <form action={createMarqueeItem} className="marquee-admin-row" style={{ marginBottom: "1rem" }}>
        <input className="auth-input" name="text" placeholder="New marquee text, e.g. FREE SHIPPING OVER ₹2000" style={{ flex: 1 }} required />
        <button type="submit" className="btn-primary">ADD</button>
      </form>

      <div className="admin-table">
        {marqueeItems.length === 0 && <p className="empty-state">No marquee items yet.</p>}
        {marqueeItems.map((item) => (
          <MarqueeRow key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}
