"use client";

import { useState } from "react";
import ProductGalleryView from "./product-gallery-view";
import ProductActions from "./product-actions";

const TRUST_ITEMS = [
  {
    title: "Free Shipping",
    icon: <path d="M5 12h14M12 5l7 7-7 7" />,
  },
  {
    title: "Easy Returns",
    desc: "7-day hassle free",
    icon: <><polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" /></>,
  },
  {
    title: "Secure Payments",
    desc: "100% safe & encrypted",
    icon: <><rect x="1" y="4" width="22" height="16" rx="2" /><line x1="1" y1="10" x2="23" y2="10" /></>,
  },
];

export default function ProductDetailClient({
  product,
  variants,
  baseImages,
  imagesByVariant,
  sizes,
  whatsappNumber,
  rating,
  specs,
  freeShippingThreshold,
}) {
  const [variantId, setVariantId] = useState(variants[0]?.id || null);
  const [wishlisted, setWishlisted] = useState(false);
  const [tab, setTab] = useState("description");
  const currentVariant = variants.find((v) => v.id === variantId) || null;

  const images = currentVariant
    ? [currentVariant.image_url, ...(imagesByVariant[currentVariant.id] || [])]
    : [product.image_url, ...baseImages];
  const lifestyleImage = baseImages[0] || product.image_url;

  const effectiveStock = currentVariant ? currentVariant.stock : product.stock;
  const discountPct =
    product.compare_at_price > product.price
      ? Math.round((1 - product.price / product.compare_at_price) * 100)
      : 0;

  return (
    <>
      <div className="product-detail-grid pd2-layout">
        <ProductGalleryView images={images} productName={product.name} />

        <div className="product-detail-info">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div className="shop-eyebrow">{product.category?.name}</div>
            <button
              type="button"
              className={`pd2-wishlist${wishlisted ? " active" : ""}`}
              style={{ position: "static" }}
              onClick={() => setWishlisted((w) => !w)}
              aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
            >
              <svg viewBox="0 0 24 24" fill={wishlisted ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </button>
          </div>

          <h1 className="product-detail-name">{product.name}</h1>
          {product.description && <p className="pd2-subtitle">{product.description}</p>}

          {rating.count > 0 && (
            <div className="pd2-rating">
              <span className="pd2-rating-stars">
                {"★".repeat(Math.round(rating.average))}
                {"☆".repeat(5 - Math.round(rating.average))}
              </span>
              <span className="pd2-rating-count">{rating.average.toFixed(1)} ({rating.count} reviews)</span>
            </div>
          )}

          <div className="product-detail-price">
            <span>₹{Number(product.price).toFixed(2)}</span>
            {discountPct > 0 && (
              <>
                <span className="product-card-strike">₹{Number(product.compare_at_price).toFixed(2)}</span>
                <span className="pd2-off-pill">{discountPct}% OFF</span>
              </>
            )}
          </div>
          <div className="pd2-tax-note">Inclusive of all taxes</div>

          {variants.length > 0 && (
            <div style={{ marginTop: "1rem" }}>
              <div className="size-picker-label">Color: {currentVariant?.color_name}</div>
              <div className="pd2-color-row">
                {variants.map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    className={`pd2-color-swatch${v.id === variantId ? " active" : ""}`}
                    onClick={() => setVariantId(v.id)}
                    aria-label={v.color_name}
                  >
                    <img src={v.image_url} alt={v.color_name} />
                  </button>
                ))}
              </div>
            </div>
          )}

          <ProductActions
            product={product}
            sizes={sizes}
            whatsappNumber={whatsappNumber}
            variantId={variantId}
            colorName={currentVariant?.color_name}
            stock={effectiveStock}
          />
        </div>

        <div className="pd2-trust">
          {TRUST_ITEMS.map((t) => (
            <div key={t.title} className="pd2-trust-item">
              <div className="pd2-trust-icon">
                <svg viewBox="0 0 24 24">{t.icon}</svg>
              </div>
              <div>
                <div className="pd2-trust-title">{t.title}</div>
                <div className="pd2-trust-desc">
                  {t.title === "Free Shipping" ? `on orders above ₹${freeShippingThreshold}` : t.desc}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {specs.length > 0 && (
        <div className="pd2-highlights">
          {specs.slice(0, 5).map((s, i) => (
            <div key={i} className="pd2-highlight">
              <div className="pd2-highlight-icon">✓</div>
              <div>
                <div className="pd2-highlight-label">{s.label}</div>
                <div className="pd2-highlight-sub">{s.value}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="pd2-lifestyle-grid">
        <div className="pd2-lifestyle-banner">
          <img src={lifestyleImage} alt={product.name} />
        </div>

        <div>
          <div className="pd2-tabs">
            {["description", "features", "size guide", "reviews"].map((t) => (
              <button
                key={t}
                type="button"
                className={`pd2-tab${tab === t ? " active" : ""}`}
                onClick={() => (t === "reviews" ? document.getElementById("reviews")?.scrollIntoView({ behavior: "smooth" }) : setTab(t))}
                style={{ textTransform: "capitalize" }}
              >
                {t}
              </button>
            ))}
          </div>

          {tab === "description" && (
            <div>
              <h3 className="pd2-tab-heading">Product Description</h3>
              <p className="pd2-tab-body">{product.description}</p>
              {specs.length > 0 && (
                <ul className="pd2-checklist">
                  {specs.map((s, i) => (
                    <li key={i}>
                      <span className="pd2-check-icon">✓</span>
                      {s.label}: {s.value}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {tab === "features" && (
            <ul className="pd2-checklist">
              {specs.length > 0 ? (
                specs.map((s, i) => (
                  <li key={i}>
                    <span className="pd2-check-icon">✓</span>
                    {s.label}: {s.value}
                  </li>
                ))
              ) : (
                <li>No feature details added yet.</li>
              )}
            </ul>
          )}

          {tab === "size guide" && (
            <p className="pd2-tab-body">
              Standard sizing — true to size. If you're between sizes, we recommend sizing up for a more relaxed fit.
            </p>
          )}
        </div>
      </div>
    </>
  );
}
