"use client";

import { useState } from "react";
import ProductGalleryView from "./product-gallery-view";
import ProductActions from "./product-actions";

export default function ProductDetailClient({ product, variants, baseImages, imagesByVariant, sizes, whatsappNumber, rating }) {
  const [variantId, setVariantId] = useState(variants[0]?.id || null);
  const currentVariant = variants.find((v) => v.id === variantId) || null;

  const images = currentVariant
    ? [currentVariant.image_url, ...(imagesByVariant[currentVariant.id] || [])]
    : [product.image_url, ...baseImages];

  const effectiveStock = currentVariant ? currentVariant.stock : product.stock;

  return (
    <div className="product-detail-grid">
      <ProductGalleryView key={variantId || "base"} images={images} productName={product.name} />

      <div className="product-detail-info">
        <div className="shop-eyebrow">{product.category?.name}</div>
        <h1 className="product-detail-name">{product.name}</h1>

        {rating.count > 0 && (
          <div className="product-rating-badge" style={{ display: "inline-flex", alignItems: "center", gap: ".4rem", margin: ".3rem 0" }}>
            <span style={{ background: "#388e3c", color: "#fff", padding: "2px 8px", borderRadius: "4px", fontSize: ".85rem", fontWeight: 700 }}>
              {rating.average.toFixed(1)} ★
            </span>
            <span style={{ color: "var(--muted, #999)", fontSize: ".85rem" }}>{rating.count} review{rating.count === 1 ? "" : "s"}</span>
          </div>
        )}

        <div className="product-detail-price">
          <span>₹{Number(product.price).toFixed(2)}</span>
          {product.compare_at_price > product.price && (
            <span className="product-card-strike">₹{Number(product.compare_at_price).toFixed(2)}</span>
          )}
        </div>
        <p className="product-detail-desc">{product.description}</p>

        {variants.length > 0 && (
          <div className="color-picker" style={{ margin: "1rem 0" }}>
            <div className="size-picker-label">Selected Color: {currentVariant?.color_name}</div>
            <div style={{ display: "flex", gap: ".6rem", marginTop: ".5rem", flexWrap: "wrap" }}>
              {variants.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setVariantId(v.id)}
                  aria-label={v.color_name}
                  style={{
                    width: "56px",
                    height: "56px",
                    borderRadius: "8px",
                    padding: 0,
                    overflow: "hidden",
                    border: v.id === variantId ? "2px solid #00c4d4" : "2px solid transparent",
                    background: "none",
                    cursor: "pointer",
                  }}
                >
                  <img src={v.image_url} alt={v.color_name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
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
        />

        <div className="product-detail-stock">{effectiveStock > 0 ? "In stock" : "Out of stock"}</div>
      </div>
    </div>
  );
}
