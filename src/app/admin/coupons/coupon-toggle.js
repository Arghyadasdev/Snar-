"use client";

import { toggleCoupon, deleteCoupon } from "@/lib/actions/admin-coupons";

export default function CouponToggle({ coupon }) {
  return (
    <form className="admin-table-actions">
      <input type="hidden" name="id" value={coupon.id} />
      <input type="hidden" name="isActive" value={String(coupon.is_active)} />
      <button type="submit" formAction={toggleCoupon} className="btn-outline" style={{ padding: ".4rem .9rem" }}>
        {coupon.is_active ? "Deactivate" : "Activate"}
      </button>
      <button type="submit" formAction={deleteCoupon} className="admin-delete-btn">Delete</button>
    </form>
  );
}
