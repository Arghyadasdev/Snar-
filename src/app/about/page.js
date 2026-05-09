import React from "react";
import Link from "next/link";

export default function AboutPage() {
  return (
    <div style={{ padding: "8rem 3.5rem", minHeight: "60vh", background: "var(--bg)" }}>
      <div className="section-header" style={{ borderBottom: "1px solid var(--border)", paddingBottom: "2rem" }}>
        <h1 className="section-title">About SNAR</h1>
        <Link href="/" className="section-link">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ transform: "rotate(180deg)", marginRight: "0.4rem" }}>
            <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12,5 19,12 12,19"/>
          </svg>
          BACK TO HOME
        </Link>
      </div>
      <p style={{ marginTop: "2rem", color: "var(--off)", maxWidth: "800px", lineHeight: "1.8" }}>
        SNAR sportswear is built to push your limits and ignite your edge. 
        We engineer premium performance apparel designed for champions. 
        Our technology focuses on breathability, quick-drying fabrics, and unparalleled stretch to ensure you move freely and comfortably.
      </p>
    </div>
  );
}
