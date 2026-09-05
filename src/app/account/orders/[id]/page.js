import { notFound } from "next/navigation";
import { getOrder } from "@/lib/data/orders";

export const metadata = { title: "Order Details — SNAR" };

export default async function OrderDetailPage({ params }) {
  const { id } = await params;
  const order = await getOrder(id);
  if (!order) notFound();

  return (
    <div className="shop-page">
      <div className="shop-header">
        <div className="shop-eyebrow">Order #{order.id.slice(0, 8)}</div>
        <h1 className="shop-title">
          <span className={`order-status order-status-${order.status}`}>{order.status}</span>
        </h1>
        <p className="shop-sub">Placed {new Date(order.created_at).toLocaleString()}</p>
      </div>

      <div className="order-detail-grid">
        <div className="order-items-list">
          {order.items.map((item) => (
            <div key={item.id} className="order-item-row">
              <div>
                <div className="order-item-name">{item.product_name}</div>
                <div className="order-item-meta">Size {item.size || "—"} · Qty {item.quantity}</div>
              </div>
              <div className="order-item-price">₹{(item.unit_price * item.quantity).toFixed(2)}</div>
            </div>
          ))}
          {Number(order.discount_amount) > 0 && (
            <>
              <div className="order-item-row">
                <div>Subtotal</div>
                <div>₹{(Number(order.total) + Number(order.discount_amount)).toFixed(2)}</div>
              </div>
              <div className="order-item-row">
                <div>Discount {order.coupon_code ? `(${order.coupon_code})` : ""}</div>
                <div>−₹{Number(order.discount_amount).toFixed(2)}</div>
              </div>
            </>
          )}
          <div className="order-item-row order-total-row">
            <div>Total</div>
            <div>₹{Number(order.total).toFixed(2)}</div>
          </div>
        </div>

        <div className="order-shipping-card">
          <div className="order-shipping-title">Shipping To</div>
          <p>{order.shipping_name}</p>
          <p>{order.shipping_address}</p>
          <p>{order.shipping_city}, {order.shipping_state} {order.shipping_zip}</p>
          <p>{order.shipping_phone}</p>

          <div className="order-shipping-title" style={{ marginTop: "1.4rem" }}>Payment</div>
          <p>
            {order.razorpay_payment_id ? (
              <span className="order-status order-status-delivered">Paid via Razorpay</span>
            ) : (
              <span className="order-status order-status-pending">{order.payment_status || "Unpaid"}</span>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
