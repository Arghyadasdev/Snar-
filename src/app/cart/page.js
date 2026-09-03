import Link from "next/link";
import { getCart, updateCartItem, removeCartItem } from "@/lib/data/cart";
import { getSiteSettings } from "@/lib/data/site-settings";
import { buildWhatsappOrderLink } from "@/lib/whatsapp";

export const metadata = { title: "Your Cart — SNAR" };

export default async function CartPage() {
  const [items, settings] = await Promise.all([getCart(), getSiteSettings()]);
  const total = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  const whatsappUrl = buildWhatsappOrderLink(
    settings.whatsapp_number,
    items.map((i) => ({ name: i.product.name, size: i.size, quantity: i.quantity, price: i.product.price })),
    total
  );

  return (
    <div className="shop-page">
      <div className="shop-header">
        <div className="shop-eyebrow">Your Bag</div>
        <h1 className="shop-title">Cart</h1>
      </div>

      {items.length === 0 ? (
        <p className="empty-state">Your cart is empty. <Link href="/collections">Browse products</Link>.</p>
      ) : (
        <div className="cart-layout">
          <div className="cart-items">
            {items.map((item) => (
              <div key={item.id} className="cart-item-row">
                <img src={item.product.image_url} alt={item.product.name} className="cart-item-img" />
                <div className="cart-item-info">
                  <Link href={`/product/${item.product.slug}`} className="cart-item-name">{item.product.name}</Link>
                  <div className="cart-item-meta">Size {item.size || "—"}</div>
                  <div className="cart-item-price">₹{Number(item.product.price).toFixed(2)}</div>
                </div>
                <form action={updateCartItem} className="cart-item-qty">
                  <input type="hidden" name="id" value={item.id} />
                  <button type="submit" name="quantity" value={item.quantity - 1} aria-label="Decrease quantity">−</button>
                  <span>{item.quantity}</span>
                  <button type="submit" name="quantity" value={item.quantity + 1} aria-label="Increase quantity">+</button>
                </form>
                <form action={removeCartItem}>
                  <input type="hidden" name="id" value={item.id} />
                  <button type="submit" className="cart-item-remove" aria-label="Remove item">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                </form>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <div className="cart-summary-row">
              <span>Subtotal</span>
              <span>₹{total.toFixed(2)}</span>
            </div>
            <div className="cart-summary-row cart-summary-total">
              <span>Total</span>
              <span>₹{total.toFixed(2)}</span>
            </div>
            <Link href="/checkout" className="btn-primary" style={{ justifyContent: "center", width: "100%" }}>
              CHECKOUT
            </Link>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline"
              style={{ justifyContent: "center", width: "100%", marginTop: ".8rem", borderColor: "#25D366", color: "#25D366" }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: ".5rem" }}>
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347"/>
              </svg>
              ORDER VIA WHATSAPP
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
