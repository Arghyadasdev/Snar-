"use client";
import React, { useState } from "react";
import Link from "next/link";

const FEATURES = [
  { icon: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z", label: "Premium Quality" },
  { icon: "M5 12h14M12 5l7 7-7 7", label: "Free Shipping" },
  { icon: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z", label: "4.9★ Rated" },
  { icon: "M3 12a9 9 0 1 0 9-9", label: "Easy Returns" },
];

export default function ComingSoon({ category, tagline, accentWord, description }) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email.trim()) setSubmitted(true);
  };

  return (
    <div style={{
      minHeight: "100svh",
      background: "var(--bg)",
      display: "flex",
      flexDirection: "column",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Decorative background grid of ghost cards */}
      <div aria-hidden="true" style={{
        position: "absolute",
        inset: 0,
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: "1.5rem",
        padding: "8rem 4vw 2rem",
        opacity: 0.06,
        pointerEvents: "none",
        filter: "blur(2px)",
      }}>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} style={{
            background: "linear-gradient(135deg, #ffffff08, #ffffff03)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "12px",
            aspectRatio: "3/4",
          }} />
        ))}
      </div>

      {/* Teal glow orb */}
      <div aria-hidden="true" style={{
        position: "absolute",
        top: "20%",
        right: "-10%",
        width: "clamp(300px, 50vw, 600px)",
        height: "clamp(300px, 50vw, 600px)",
        background: "radial-gradient(circle, rgba(0,196,212,0.12) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />
      <div aria-hidden="true" style={{
        position: "absolute",
        bottom: "10%",
        left: "-5%",
        width: "clamp(200px, 30vw, 400px)",
        height: "clamp(200px, 30vw, 400px)",
        background: "radial-gradient(circle, rgba(0,196,212,0.07) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      {/* Back link */}
      <div style={{ padding: "calc(34px + 4rem) 4vw 0", position: "relative", zIndex: 2 }}>
        <Link href="/" style={{
          display: "inline-flex",
          alignItems: "center",
          gap: ".4rem",
          color: "var(--muted, #888)",
          fontSize: ".75rem",
          fontWeight: 600,
          letterSpacing: ".12em",
          textDecoration: "none",
          textTransform: "uppercase",
          transition: "color .2s",
        }}
        onMouseEnter={e => e.currentTarget.style.color = "var(--ac)"}
        onMouseLeave={e => e.currentTarget.style.color = "var(--muted, #888)"}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12,5 5,12 12,19"/>
          </svg>
          Back to Home
        </Link>
      </div>

      {/* Main content */}
      <div style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "4rem 4vw",
        position: "relative",
        zIndex: 2,
      }}>
        {/* Badge */}
        <div style={{
          display: "inline-flex",
          alignItems: "center",
          gap: ".5rem",
          padding: ".35rem 1rem",
          background: "rgba(0,196,212,0.1)",
          border: "1px solid rgba(0,196,212,0.25)",
          borderRadius: "999px",
          color: "var(--ac)",
          fontSize: ".7rem",
          fontWeight: 700,
          letterSpacing: ".18em",
          textTransform: "uppercase",
          marginBottom: "2rem",
        }}>
          <span style={{
            width: "6px", height: "6px", borderRadius: "50%",
            background: "var(--ac)",
            animation: "cs-pulse 2s infinite",
          }} />
          COMING SOON
        </div>

        {/* Category label */}
        <p style={{
          fontSize: ".75rem",
          fontWeight: 700,
          letterSpacing: ".2em",
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.35)",
          marginBottom: ".75rem",
        }}>{tagline}</p>

        {/* Big heading */}
        <h1 style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: "clamp(4rem, 16vw, 14rem)",
          fontWeight: 700,
          lineHeight: 0.85,
          letterSpacing: ".02em",
          color: "#ffffff",
          marginBottom: "2rem",
        }}>
          {category.split(" ").map((word, i) => (
            <span key={i}>
              {word === accentWord
                ? <span style={{ color: "var(--ac)" }}>{word}</span>
                : word}
              {i < category.split(" ").length - 1 && <br />}
            </span>
          ))}
        </h1>

        {/* Description */}
        <p style={{
          maxWidth: "40ch",
          fontSize: "clamp(.95rem, 1.5vw, 1.15rem)",
          lineHeight: 1.7,
          color: "rgba(255,255,255,0.45)",
          marginBottom: "3rem",
        }}>{description}</p>

        {/* Divider */}
        <div style={{
          width: "60px",
          height: "1px",
          background: "rgba(0,196,212,0.4)",
          marginBottom: "3rem",
        }} />

        {/* Notify form */}
        {submitted ? (
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: ".75rem",
            padding: "1rem 2rem",
            background: "rgba(0,196,212,0.08)",
            border: "1px solid rgba(0,196,212,0.2)",
            borderRadius: "12px",
            color: "var(--ac)",
            fontWeight: 600,
            fontSize: ".9rem",
            letterSpacing: ".06em",
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            YOU&apos;RE ON THE LIST
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{
            display: "flex",
            gap: ".75rem",
            width: "100%",
            maxWidth: "440px",
            flexWrap: "wrap",
            justifyContent: "center",
          }}>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Enter email for early access"
              required
              style={{
                flex: 1,
                minWidth: "220px",
                padding: ".85rem 1.25rem",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "10px",
                color: "#fff",
                fontSize: ".9rem",
                outline: "none",
                transition: "border-color .2s",
              }}
              onFocus={e => e.target.style.borderColor = "rgba(0,196,212,0.5)"}
              onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
            />
            <button type="submit" style={{
              padding: ".85rem 1.75rem",
              background: "var(--ac)",
              border: "none",
              borderRadius: "10px",
              color: "#05050A",
              fontSize: ".8rem",
              fontWeight: 800,
              letterSpacing: ".1em",
              textTransform: "uppercase",
              cursor: "pointer",
              whiteSpace: "nowrap",
              transition: "opacity .2s, transform .15s",
            }}
            onMouseEnter={e => { e.currentTarget.style.opacity = ".85"; e.currentTarget.style.transform = "translateY(-1px)"; }}
            onMouseLeave={e => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.transform = "translateY(0)"; }}
            >
              NOTIFY ME
            </button>
          </form>
        )}

        {/* Feature pills */}
        <div style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: ".75rem",
          marginTop: "3.5rem",
        }}>
          {FEATURES.map((f, i) => (
            <div key={i} style={{
              display: "flex",
              alignItems: "center",
              gap: ".5rem",
              padding: ".45rem 1rem",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: "999px",
              fontSize: ".7rem",
              fontWeight: 600,
              letterSpacing: ".1em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.5)",
            }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="rgba(0,196,212,0.8)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d={f.icon}/>
              </svg>
              {f.label}
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes cs-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: .4; transform: scale(1.5); }
        }
      `}</style>
    </div>
  );
}