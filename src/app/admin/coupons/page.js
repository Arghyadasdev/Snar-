import { listCouponsAdmin } from "@/lib/actions/admin-coupons";
import CouponForm from "./coupon-form";
import CouponToggle from "./coupon-toggle";

export const metadata = { title: "Admin · Coupons — SNAR" };

export default async function AdminCouponsPage() {
  const coupons = await listCouponsAdmin();

  return (
    <div className="shop-page">
      <div className="shop-header">
        <div className="shop-eyebrow">Admin</div>
        <h1 className="shop-title">Coupons</h1>
      </div>

      <CouponForm />

      <div className="admin-table">
        {coupons.length === 0 && <p className="empty-state">No coupons yet.</p>}
        {coupons.map((c) => (
          <div key={c.id} className="admin-table-row admin-table-row-cat">
            <div className="admin-table-name">
              {c.code}
              {!c.is_active && <span className="order-status order-status-cancelled" style={{ marginLeft: ".5rem" }}>inactive</span>}
            </div>
            <div className="admin-table-cat">
              {c.discount_type === "percent" ? `${c.discount_value}% off` : `₹${c.discount_value} off`}
              {" · "}used {c.used_count}{c.max_uses ? `/${c.max_uses}` : ""}
              {c.expires_at ? ` · expires ${new Date(c.expires_at).toLocaleDateString()}` : ""}
            </div>
            <CouponToggle coupon={c} />
          </div>
        ))}
      </div>
    </div>
  );
}
