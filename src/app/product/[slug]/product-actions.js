"use client";

import { useState } from "react";
import { addToCart } from "@/lib/data/cart";
import { buildWhatsappOrderLink } from "@/lib/whatsapp";

export default function ProductActions({ product, sizes, whatsappNumber, variantId, colorName }) {
  const [size, setSize] = useState(sizes[0] || "");

  const whatsappUrl = buildWhatsappOrderLink(
    whatsappNumber,
    [{ name: product.name, size, color: colorName, quantity: 1, price: product.price }],
    product.price
  );

  return (
    <form action={addToCart} className="product-detail-form">
      <input type="hidden" name="productId" value={product.id} />
      <input type="hidden" name="variantId" value={variantId || ""} />
      <input type="hidden" name="redirectTo" value={`/product/${product.slug}`} />

      {sizes.length > 0 && (
        <div className="size-picker">
          <div className="size-picker-label">Size</div>
          <div className="size-picker-options">
            {sizes.map((s) => (
              <label key={s} className="size-option">
                <input type="radio" name="size" value={s} checked={size === s} onChange={() => setSize(s)} />
                <span>{s}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: "flex", gap: ".8rem", marginTop: "1.5rem", flexWrap: "wrap" }}>
        <button className="btn-primary" type="submit">ADD TO CART</button>
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-outline"
          style={{ borderColor: "#25D366", color: "#25D366" }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: ".5rem" }}>
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347"/>
          </svg>
          ORDER VIA WHATSAPP
        </a>
      </div>
    </form>
  );
}
