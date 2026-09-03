"use client";

import { useState } from "react";

export default function ProductGalleryView({ images, productName }) {
  const [active, setActive] = useState(0);

  return (
    <div>
      <div className="product-detail-img-wrap">
        <img src={images[active]} alt={productName} className="product-detail-img" />
      </div>

      {images.length > 1 && (
        <div style={{ display: "flex", gap: ".6rem", marginTop: ".8rem" }}>
          {images.map((src, i) => (
            <button
              key={src + i}
              type="button"
              onClick={() => setActive(i)}
              style={{
                width: "64px", height: "64px", borderRadius: "8px", overflow: "hidden",
                border: i === active ? "2px solid var(--ac)" : "2px solid transparent",
                padding: 0, cursor: "pointer", flexShrink: 0, background: "var(--bg2)",
              }}
              aria-label={`View photo ${i + 1}`}
            >
              <img src={src} alt="" loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
