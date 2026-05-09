"use client";
import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";

const CHEVRON = (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.55 }}>
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const LEFT_LINKS = [
  { label: "Men",        href: "/men",         chevron: true  },
  { label: "Women",      href: "/women",        chevron: true  },
  { label: "Accessories",href: "/accessories",  chevron: false },
];
const RIGHT_LINKS = [
  { label: "Collections",href: "/collections",  chevron: false },
  { label: "About",      href: "/about",        chevron: true  },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen]     = useState(false);
  const [scrolled, setScrolled]     = useState(false);
  const toggleMenu = () => setMenuOpen(p => !p);
  const closeMenu  = () => setMenuOpen(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      {/* TOPBAR — kept for utility info, hidden on mobile */}
      <div className="topbar">
        <div className="topbar-left"><span>FREE SHIPPING</span>ON ORDERS OVER ₹999</div>
        <div className="topbar-right">
          <Link href="#">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>
            Track Order
          </Link>
          <Link href="#" className="topbar-store">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            Store Locator
          </Link>
          <Link href="#" className="topbar-help">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            Help &amp; Support
          </Link>
        </div>
      </div>

      {/* FLOATING PILL NAV */}
      <div className="pill-nav-wrap">
        <nav className={`pill-nav${scrolled ? " pill-scrolled" : ""}`}>
          {/* LEFT LINKS */}
          <div className="pill-group pill-left">
            {LEFT_LINKS.map(l => (
              <Link key={l.href} href={l.href} className="pill-link">
                {l.label}{l.chevron && CHEVRON}
              </Link>
            ))}
          </div>

          {/* CENTER LOGO */}
          <Link href="/" className="pill-logo">
            <img src="/logo.png" alt="SNAR" />
          </Link>

          {/* RIGHT LINKS */}
          <div className="pill-group pill-right">
            {RIGHT_LINKS.map(l => (
              <Link key={l.href} href={l.href} className="pill-link">
                {l.label}{l.chevron && CHEVRON}
              </Link>
            ))}

            {/* Cart */}
            <button className="pill-cart" aria-label="Cart">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
              <span className="pill-cart-count">0</span>
            </button>

            {/* Mobile hamburger */}
            <button className="pill-menu-btn" onClick={toggleMenu} aria-label="Toggle navigation">
              <span /><span /><span />
            </button>
          </div>
        </nav>
      </div>

      {/* MOBILE OVERLAY */}
      {menuOpen && (
        <div className="mobile-nav active" onClick={closeMenu}>
          <div className="mobile-nav-inner" onClick={e => e.stopPropagation()}>
            <button className="mobile-close" onClick={closeMenu} aria-label="Close">×</button>
            <img src="/logo.png" alt="SNAR" style={{ height: "48px", objectFit: "contain", marginBottom: "1.5rem" }} />
            <div className="mobile-nav-links">
              <Link href="/men"         onClick={closeMenu}>Men</Link>
              <Link href="/women"       onClick={closeMenu}>Women</Link>
              <Link href="/accessories" onClick={closeMenu}>Accessories</Link>
              <Link href="/collections" onClick={closeMenu}>Collections</Link>
              <Link href="/about"       onClick={closeMenu}>About Us</Link>
            </div>
            <div style={{ marginTop: "1.5rem", paddingTop: "1.5rem", borderTop: "1px solid rgba(255,255,255,0.07)", display: "flex", flexDirection: "column", gap: ".7rem" }}>
              <Link href="#" style={{ color: "var(--muted)", fontSize: ".8rem", textDecoration: "none" }} onClick={closeMenu}>Track Order</Link>
              <Link href="#" style={{ color: "var(--muted)", fontSize: ".8rem", textDecoration: "none" }} onClick={closeMenu}>Help &amp; Support</Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}