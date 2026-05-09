import React from "react";
import Link from "next/link";

export default function MenPage() {
  return (
    <div style={{ padding: "8rem 3.5rem", minHeight: "60vh", background: "var(--bg)" }}>
      <div className="section-header" style={{ borderBottom: "1px solid var(--border)", paddingBottom: "2rem" }}>
        <h1 className="section-title">Men's Collection</h1>
        <Link href="/" className="section-link">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ transform: "rotate(180deg)", marginRight: "0.4rem" }}>
            <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12,5 19,12 12,19"/>
          </svg>
          BACK TO HOME
        </Link>
      </div>
      <p style={{ marginTop: "2rem", color: "var(--off)" }}>
        Explore our premium collection of performance sportswear designed for men.
      </p>
    </div>
  );
}
