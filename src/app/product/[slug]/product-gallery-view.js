"use client";

import { useState } from "react";

const GRID_LIMIT = 5;

export default function ProductGalleryView({ images, productName }) {
  const [lightbox, setLightbox] = useState(null); // index or null

  const visible = images.slice(0, GRID_LIMIT);
  const extraCount = images.length - GRID_LIMIT;

  function next(e) {
    e.stopPropagation();
    setLightbox((i) => (i + 1) % images.length);
  }
  function prev(e) {
    e.stopPropagation();
    setLightbox((i) => (i - 1 + images.length) % images.length);
  }

  return (
    <>
      <div className="pg-grid">
        {visible.map((src, i) => {
          const isLastVisible = i === GRID_LIMIT - 1 && extraCount > 0;
          return (
            <button
              key={src + i}
              type="button"
              className="pg-tile"
              onClick={() => setLightbox(i)}
              aria-label={`View photo ${i + 1}`}
            >
              <img src={src} alt={i === 0 ? productName : ""} loading={i < 2 ? "eager" : "lazy"} />
              {isLastVisible && <span className="pg-more">+{extraCount}</span>}
            </button>
          );
        })}
      </div>

      {lightbox !== null && (
        <div className="pg-lightbox" onClick={() => setLightbox(null)}>
          <button type="button" className="pg-lightbox-close" onClick={() => setLightbox(null)} aria-label="Close">×</button>
          {images.length > 1 && (
            <button type="button" className="pg-lightbox-arrow pg-lightbox-prev" onClick={prev} aria-label="Previous photo">‹</button>
          )}
          <img src={images[lightbox]} alt={productName} className="pg-lightbox-img" onClick={(e) => e.stopPropagation()} />
          {images.length > 1 && (
            <button type="button" className="pg-lightbox-arrow pg-lightbox-next" onClick={next} aria-label="Next photo">›</button>
          )}
        </div>
      )}
    </>
  );
}
