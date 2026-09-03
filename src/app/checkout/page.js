import { getCart } from "@/lib/data/cart";
import { requireUser } from "@/lib/auth/dal";
import CheckoutForm from "./checkout-form";

export const metadata = { title: "Checkout — SNAR" };

export default async function CheckoutPage() {
  await requireUser("/checkout");
  const items = await getCart();
  const total = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);

  return (
    <div className="shop-page">
      <div className="shop-header">
        <div className="shop-eyebrow">Almost there</div>
        <h1 className="shop-title">Checkout</h1>
      </div>

      {items.length === 0 ? (
        <p className="empty-state">Your cart is empty.</p>
      ) : (
        <div className="cart-layout">
          <CheckoutForm />
          <div className="cart-summary">
            <div className="order-shipping-title">Order Summary</div>
            {items.map((item) => (
              <div key={item.id} className="cart-summary-row">
                <span>{item.product.name} × {item.quantity}</span>
                <span>₹{(item.product.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
            <div className="cart-summary-row cart-summary-total">
              <span>Total</span>
              <span>₹{total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
