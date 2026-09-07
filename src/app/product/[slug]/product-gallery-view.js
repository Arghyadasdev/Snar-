"use client";

import { useState } from "react";

export default function ProductGalleryView({ images, productName }) {
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  function next(e) {
    e.stopPropagation();
    setActive((i) => (i + 1) % images.length);
  }
  function prev(e) {
    e.stopPropagation();
    setActive((i) => (i - 1 + images.length) % images.length);
  }

  return (
    <>
      <div className="pd2-gallery">
        {images.length > 1 && (
          <div className="pd2-thumbs">
            {images.map((src, i) => (
              <button
                key={src + i}
                type="button"
                className={`pd2-thumb${i === active ? " active" : ""}`}
                onClick={() => setActive(i)}
                aria-label={`View photo ${i + 1}`}
              >
                <img src={src} alt="" loading="lazy" />
              </button>
            ))}
          </div>
        )}

        <div className="pd2-main" onClick={() => setLightbox(true)}>
          <img src={images[active]} alt={productName} loading="eager" />
          <span className="pd2-zoom-btn" aria-hidden="true">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
            </svg>
          </span>
        </div>
      </div>

      {lightbox && (
        <div className="pg-lightbox" onClick={() => setLightbox(false)}>
          <button type="button" className="pg-lightbox-close" onClick={() => setLightbox(false)} aria-label="Close">×</button>
          {images.length > 1 && (
            <button type="button" className="pg-lightbox-arrow pg-lightbox-prev" onClick={prev} aria-label="Previous photo">‹</button>
          )}
          <img src={images[active]} alt={productName} className="pg-lightbox-img" onClick={(e) => e.stopPropagation()} />
          {images.length > 1 && (
            <button type="button" className="pg-lightbox-arrow pg-lightbox-next" onClick={next} aria-label="Next photo">›</button>
          )}
        </div>
      )}
    </>
  );
}
