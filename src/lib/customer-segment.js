export const VIP_SPEND_THRESHOLD = 50000;
export const REGULAR_ORDER_COUNT = 3;
export const NEW_DAYS = 30;
export const INACTIVE_DAYS = 90;

export function computeSegment({ createdAt, total_orders = 0, total_spent = 0, last_order_at = null }) {
  const daysSince = (d) => (Date.now() - new Date(d).getTime()) / 86400000;

  if (Number(total_spent) >= VIP_SPEND_THRESHOLD) return "vip";
  if (last_order_at && daysSince(last_order_at) > INACTIVE_DAYS) return "inactive";
  if (Number(total_orders) >= REGULAR_ORDER_COUNT) return "regular";
  if (createdAt && daysSince(createdAt) < NEW_DAYS) return "new";
  return null;
}
