"use client";
import React, { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";

function SpotlightLink({ href, children }) {
  const wrapRef = useRef(null);
  const [hovered, setHovered] = useState(false);
  const [clicked, setClicked] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const timerRef = useRef(null);

  const handleMouseMove = useCallback((e) => {
    if (!wrapRef.current) return;
    const rect = wrapRef.current.getBoundingClientRect();
    setPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  }, []);

  const handleClick = useCallback(() => {
    setClicked(true);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setClicked(false), 700);
  }, []);

  const spotSize = clicked ? 90 : 65;
  const glowOpacity = clicked ? 0.32 : hovered ? 0.14 : 0;

  return (
    <span
      ref={wrapRef}
      style={{ position: "relative", display: "inline-flex", borderRadius: "8px", overflow: "hidden" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onMouseMove={handleMouseMove}
      onClick={handleClick}
    >
      <span
        aria-hidden="true"
        style={{
          position: "absolute", inset: 0, borderRadius: "inherit", pointerEvents: "none",
          background: `radial-gradient(${spotSize}px ${spotSize}px at ${pos.x}px ${pos.y}px, rgba(0,196,212,${glowOpacity}), transparent)`,
          boxShadow: clicked ? "inset 0 0 14px rgba(0,196,212,0.18)" : "none",
          transition: clicked ? "box-shadow 0.3s" : "background 0.15s, box-shadow 0.3s",
        }}
      />
      <Link href={href} className="pill-link" style={{ position: "relative", zIndex: 1 }}>
        {children}
      </Link>
    </span>
  );
}

function LiquidGlassFilter() {
  return (
    <svg style={{ position: "absolute", width: 0, height: 0, overflow: "hidden" }} aria-hidden="true">
      <defs>
        <filter id="pill-liquid-glass" x="-10%" y="-10%" width="120%" height="120%" colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency="0.04 0.04" numOctaves="1" seed="2" result="turbulence" />
          <feGaussianBlur in="turbulence" stdDeviation="1.5" result="blurredNoise" />
          <feDisplacementMap in="SourceGraphic" in2="blurredNoise" scale="55" xChannelSelector="R" yChannelSelector="B" result="displaced" />
          <feGaussianBlur in="displaced" stdDeviation="3.5" result="finalBlur" />
          <feComposite in="finalBlur" in2="finalBlur" operator="over" />
        </filter>
      </defs>
    </svg>
  );
}

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

export default function Navbar({ isLoggedIn = false, cartCount = 0, settings }) {
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
      <LiquidGlassFilter />
      {/* TOPBAR */}
      <div className="topbar topbar-minimal">
        <div className="topbar-right" style={{marginLeft:"auto", display:"flex", gap:"1.5rem", alignItems:"center"}}>
          <a href={settings.instagram_url} target="_blank" rel="noopener noreferrer" style={{display:"flex", alignItems:"center", gap:".4rem", textDecoration:"none", color:"inherit", fontSize:".85rem"}}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37"/><circle cx="17.5" cy="6.5" r="1.5"/>
            </svg>
            Instagram
          </a>
          <a href={settings.facebook_url} target="_blank" rel="noopener noreferrer" style={{display:"flex", alignItems:"center", gap:".4rem", textDecoration:"none", color:"inherit", fontSize:".85rem"}}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            Facebook
          </a>
          <Link href="/help" className="topbar-help">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            Help &amp; Support
          </Link>
        </div>
      </div>

      {/* FLOATING PILL NAV */}
      <div className="pill-nav-wrap">
        <nav className={`pill-nav${scrolled ? " pill-scrolled" : ""}`}>
          {/* Liquid glass distortion layer */}
          <div className="pill-liquid-layer" />
          {/* LEFT LINKS */}
          <div className="pill-group pill-left">
            {LEFT_LINKS.map(l => (
              <SpotlightLink key={l.href} href={l.href}>
                {l.label}{l.chevron && CHEVRON}
              </SpotlightLink>
            ))}
          </div>

          {/* CENTER LOGO */}
          <Link href="/" className="pill-logo">
            <img src="/logo.png" alt="SNAR" />
          </Link>

          {/* RIGHT LINKS */}
          <div className="pill-group pill-right">
            {RIGHT_LINKS.map(l => (
              <SpotlightLink key={l.href} href={l.href}>
                {l.label}{l.chevron && CHEVRON}
              </SpotlightLink>
            ))}

            <Link href="/account" className="pill-link" aria-label="Account" style={{ padding: ".55rem" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
              </svg>
            </Link>

            <Link href="/cart" className="pill-cart" aria-label="Cart">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
              {cartCount > 0 && <span className="pill-cart-count">{cartCount}</span>}
            </Link>

            {/* Mobile hamburger */}
            <button className="pill-menu-btn" onClick={toggleMenu} aria-label="Toggle navigation">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="11" y1="18" x2="21" y2="18" />
              </svg>
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
              <Link href="/cart"        onClick={closeMenu}>Cart{cartCount > 0 ? ` (${cartCount})` : ""}</Link>
              <Link href="/account"     onClick={closeMenu}>{isLoggedIn ? "My Account" : "Log In"}</Link>
            </div>
            <div style={{ marginTop: "1.5rem", paddingTop: "1.5rem", borderTop: "1px solid rgba(255,255,255,0.07)", display: "flex", flexDirection: "column", gap: ".7rem" }}>
              <Link href="/help" style={{ color: "var(--muted)", fontSize: ".8rem", textDecoration: "none" }} onClick={closeMenu}>Help &amp; Support</Link>
            </div>
          </div>
        </div>
      )}

      {/* FLOATING WHATSAPP */}
      <a
        href={`https://wa.me/${settings.whatsapp_number}`}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          position: "fixed",
          right: "1.5rem",
          top: "50%",
          transform: "translateY(-50%)",
          zIndex: 500,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: ".5rem",
          textDecoration: "none",
          writingMode: "vertical-rl",
        }}
        aria-label="Order on WhatsApp"
      >
        <span style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "48px",
          height: "48px",
          borderRadius: "50%",
          background: "#25D366",
          boxShadow: "0 4px 20px rgba(37,211,102,0.4)",
          flexShrink: 0,
          writingMode: "horizontal-tb",
        }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="#fff">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
        </span>
        <span style={{
          fontSize: ".62rem",
          fontWeight: 700,
          letterSpacing: ".1em",
          textTransform: "uppercase",
          color: "#25D366",
          writingMode: "vertical-rl",
          textOrientation: "mixed",
          transform: "rotate(180deg)",
        }}>Order on WhatsApp</span>
      </a>
    </>
  );
}