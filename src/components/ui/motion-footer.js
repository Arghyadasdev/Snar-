"use client";

import * as React from "react";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cn } from "@/lib/utils";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@300;400;500;600;700;800;900&display=swap');

.snar-footer-wrapper {
  font-family: 'Inter', sans-serif;
  -webkit-font-smoothing: antialiased;
  --pill-bg-1: rgba(0,196,212,0.06);
  --pill-bg-2: rgba(0,196,212,0.02);
  --pill-shadow: rgba(0,0,0,0.5);
  --pill-highlight: rgba(0,196,212,0.12);
  --pill-inset-shadow: rgba(0,0,0,0.6);
  --pill-border: rgba(0,196,212,0.15);
  --pill-bg-1-hover: rgba(0,196,212,0.14);
  --pill-bg-2-hover: rgba(0,196,212,0.06);
  --pill-border-hover: rgba(0,196,212,0.4);
  --pill-shadow-hover: rgba(0,0,0,0.6);
  --pill-highlight-hover: rgba(0,196,212,0.22);
  --foreground: #ffffff;
  --background: #09090F;
  --primary: #00C4D4;
  --secondary: #00A8B8;
  --muted-fg: #6B7280;
  --border-color: rgba(255,255,255,0.08);
  --destructive: #ef4444;
}

@keyframes snar-footer-breathe {
  0%   { transform: translate(-50%, -50%) scale(1);   opacity: 0.5; }
  100% { transform: translate(-50%, -50%) scale(1.12); opacity: 0.85; }
}
@keyframes snar-footer-marquee {
  from { transform: translateX(0); }
  to   { transform: translateX(-50%); }
}
@keyframes snar-footer-heartbeat {
  0%,100% { transform: scale(1);   filter: drop-shadow(0 0 5px rgba(239,68,68,0.5)); }
  15%,45% { transform: scale(1.25); filter: drop-shadow(0 0 10px rgba(239,68,68,0.85)); }
  30%     { transform: scale(1); }
}

.snar-footer-breathe    { animation: snar-footer-breathe 8s ease-in-out infinite alternate; }
.snar-footer-marquee    { animation: snar-footer-marquee 40s linear infinite; }
.snar-footer-heartbeat  { animation: snar-footer-heartbeat 2s cubic-bezier(0.25,1,0.5,1) infinite; }

.snar-footer-bg-grid {
  background-size: 60px 60px;
  background-image:
    linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px);
  -webkit-mask-image: linear-gradient(to bottom, transparent, black 30%, black 70%, transparent);
  mask-image:         linear-gradient(to bottom, transparent, black 30%, black 70%, transparent);
}

.snar-footer-aurora {
  background: radial-gradient(
    circle at 50% 50%,
    rgba(0,196,212,0.14) 0%,
    rgba(0,168,184,0.1)  40%,
    transparent 70%
  );
}

.snar-glass-pill {
  background: linear-gradient(145deg, var(--pill-bg-1) 0%, var(--pill-bg-2) 100%);
  box-shadow:
    0 10px 30px -10px var(--pill-shadow),
    inset 0 1px 1px var(--pill-highlight),
    inset 0 -1px 2px var(--pill-inset-shadow);
  border: 1px solid var(--pill-border);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  transition: all 0.4s cubic-bezier(0.16,1,0.3,1);
  border-radius: 9999px;
  cursor: pointer;
  color: var(--muted-fg);
  text-decoration: none;
  display: inline-flex;
  align-items: center;
}
.snar-glass-pill:hover {
  background: linear-gradient(145deg, var(--pill-bg-1-hover) 0%, var(--pill-bg-2-hover) 100%);
  border-color: var(--pill-border-hover);
  box-shadow:
    0 20px 40px -10px var(--pill-shadow-hover),
    inset 0 1px 1px var(--pill-highlight-hover);
  color: #ffffff;
}

.snar-footer-giant-text {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 26vw;
  line-height: 0.75;
  font-weight: 900;
  letter-spacing: -0.05em;
  color: transparent;
  -webkit-text-stroke: 1px rgba(255,255,255,0.05);
  background: linear-gradient(180deg, rgba(255,255,255,0.08) 0%, transparent 60%);
  -webkit-background-clip: text;
  background-clip: text;
  pointer-events: none;
  user-select: none;
  white-space: nowrap;
  position: absolute;
  bottom: -5vh;
  left: 50%;
  transform: translateX(-50%);
  z-index: 0;
}

.snar-footer-text-glow {
  font-family: 'Bebas Neue', sans-serif;
  background: linear-gradient(180deg, #ffffff 0%, rgba(255,255,255,0.4) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  filter: drop-shadow(0 0 20px rgba(255,255,255,0.12));
  font-size: clamp(3rem,8vw,7rem);
  letter-spacing: 0.04em;
  font-weight: 900;
  text-align: center;
  margin-bottom: 3rem;
}
`;

/* ─── Magnetic Button ─── */
const MagneticButton = React.forwardRef(
  ({ className, children, as: Component = "button", style, ...props }, forwardedRef) => {
    const localRef = useRef(null);

    useEffect(() => {
      if (typeof window === "undefined") return;
      const el = localRef.current;
      if (!el) return;

      const ctx = gsap.context(() => {
        const onMove = (e) => {
          const r = el.getBoundingClientRect();
          const x = e.clientX - r.left - r.width / 2;
          const y = e.clientY - r.top  - r.height / 2;
          gsap.to(el, { x: x*0.4, y: y*0.4, rotationX: -y*0.15, rotationY: x*0.15, scale: 1.05, ease: "power2.out", duration: 0.4 });
        };
        const onLeave = () => {
          gsap.to(el, { x:0, y:0, rotationX:0, rotationY:0, scale:1, ease:"elastic.out(1,0.3)", duration:1.2 });
        };
        el.addEventListener("mousemove", onMove);
        el.addEventListener("mouseleave", onLeave);
        return () => { el.removeEventListener("mousemove", onMove); el.removeEventListener("mouseleave", onLeave); };
      }, el);

      return () => ctx.revert();
    }, []);

    return (
      <Component
        ref={(node) => {
          localRef.current = node;
          if (typeof forwardedRef === "function") forwardedRef(node);
          else if (forwardedRef) forwardedRef.current = node;
        }}
        className={cn("snar-glass-pill", className)}
        style={style}
        {...props}
      >
        {children}
      </Component>
    );
  }
);
MagneticButton.displayName = "MagneticButton";

/* ─── Marquee Row ─── */
const MarqueeItem = () => (
  <div style={{ display:"flex", alignItems:"center", gap:"3rem", padding:"0 1.5rem" }}>
    <span>Premium Sportswear</span>
    <span style={{color:"rgba(0,196,212,0.6)"}}>✦</span>
    <span>Ignite Your Edge</span>
    <span style={{color:"rgba(0,196,212,0.6)"}}>✦</span>
    <span>Performance Driven</span>
    <span style={{color:"rgba(0,196,212,0.6)"}}>✦</span>
    <span>Built for Champions</span>
    <span style={{color:"rgba(0,196,212,0.6)"}}>✦</span>
    <span>Free Shipping ₹999+</span>
    <span style={{color:"rgba(0,196,212,0.6)"}}>✦</span>
  </div>
);

/* ─── CinematicFooter ─── */
export function CinematicFooter() {
  const wrapperRef   = useRef(null);
  const giantTextRef = useRef(null);
  const headingRef   = useRef(null);
  const linksRef     = useRef(null);

  useEffect(() => {
    if (typeof window === "undefined" || !wrapperRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        giantTextRef.current,
        { y:"10vh", scale:0.8, opacity:0 },
        { y:"0vh", scale:1, opacity:1, ease:"power1.out",
          scrollTrigger: { trigger:wrapperRef.current, start:"top 80%", end:"bottom bottom", scrub:1 } }
      );
      gsap.fromTo(
        [headingRef.current, linksRef.current],
        { y:50, opacity:0 },
        { y:0, opacity:1, stagger:0.15, ease:"power3.out",
          scrollTrigger: { trigger:wrapperRef.current, start:"top 40%", end:"bottom bottom", scrub:1 } }
      );
    }, wrapperRef);
    return () => ctx.revert();
  }, []);

  const scrollToTop = () => window.scrollTo({ top:0, behavior:"smooth" });

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />
      <div
        ref={wrapperRef}
        className="snar-footer-wrapper"
        style={{ position:"relative", height:"100vh", width:"100%", clipPath:"polygon(0% 0, 100% 0%, 100% 100%, 0 100%)" }}
      >
        <footer style={{
          position:"fixed", bottom:0, left:0,
          width:"100%", height:"100vh",
          display:"flex", flexDirection:"column", justifyContent:"space-between",
          overflow:"hidden",
          background:"#09090F",
          color:"#ffffff",
        }} className="snar-footer-wrapper">

          {/* Aurora glow */}
          <div className="snar-footer-aurora snar-footer-breathe" style={{
            position:"absolute", left:"50%", top:"50%",
            width:"80vw", height:"60vh",
            borderRadius:"50%", filter:"blur(80px)",
            pointerEvents:"none", zIndex:0,
          }}/>

          {/* Grid bg */}
          <div className="snar-footer-bg-grid" style={{ position:"absolute", inset:0, zIndex:0, pointerEvents:"none" }}/>

          {/* Giant bg text */}
          <div ref={giantTextRef} className="snar-footer-giant-text">SNAR</div>

          {/* Marquee strip */}
          <div style={{
            position:"absolute", top:"3rem", left:0, width:"100%",
            overflow:"hidden", borderTop:"1px solid rgba(255,255,255,0.06)",
            borderBottom:"1px solid rgba(255,255,255,0.06)",
            background:"rgba(9,9,15,0.7)", backdropFilter:"blur(12px)",
            padding:".9rem 0", zIndex:10,
            transform:"rotate(-2deg) scaleX(1.1)",
          }}>
            <div className="snar-footer-marquee" style={{
              display:"flex", width:"max-content",
              fontSize:".7rem", fontWeight:700, letterSpacing:".28em",
              textTransform:"uppercase", color:"#6B7280",
            }}>
              <MarqueeItem/><MarqueeItem/>
            </div>
          </div>

          {/* Main CTA */}
          <div style={{
            position:"relative", zIndex:10,
            display:"flex", flex:1, flexDirection:"column",
            alignItems:"center", justifyContent:"center",
            padding:"0 1.5rem", marginTop:"5rem",
          }}>
            <div ref={headingRef} className="snar-footer-text-glow">
              READY TO<br/>IGNITE?
            </div>

            <div ref={linksRef} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:"1.2rem", width:"100%" }}>
              {/* Primary CTAs */}
              <div style={{ display:"flex", flexWrap:"wrap", justifyContent:"center", gap:"1rem" }}>
                <MagneticButton as="a" href="#" style={{
                  background:"var(--ac,#00C4D4)", color:"#09090F",
                  fontWeight:700, fontSize:".85rem", letterSpacing:".1em",
                  padding:".9rem 2.2rem", border:"none",
                  textTransform:"uppercase",
                }}>
                  <svg style={{width:"18px",height:"18px",marginRight:".5rem",flexShrink:0}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
                  Shop Now
                </MagneticButton>
                <MagneticButton as="a" href="#" style={{ padding:".9rem 2.2rem", fontWeight:700, fontSize:".85rem", letterSpacing:".1em", textTransform:"uppercase" }}>
                  <svg style={{width:"18px",height:"18px",marginRight:".5rem",flexShrink:0}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 3l14 9-14 9V3z"/></svg>
                  Watch Brand Film
                </MagneticButton>
              </div>

              {/* Secondary links */}
              <div style={{ display:"flex", flexWrap:"wrap", justifyContent:"center", gap:".6rem", marginTop:".5rem" }}>
                {["Size Guide","Shipping Info","Returns & Exchanges","Contact Us","FAQs"].map(l => (
                  <MagneticButton key={l} as="a" href="#" style={{ padding:".55rem 1.2rem", fontSize:".72rem", fontWeight:500, letterSpacing:".06em" }}>
                    {l}
                  </MagneticButton>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div style={{
            position:"relative", zIndex:20,
            width:"100%", padding:"0 3rem 2rem",
            display:"flex", alignItems:"center", justifyContent:"space-between",
            flexWrap:"wrap", gap:"1rem",
          }}>
            {/* Logo + copyright */}
            <div style={{ display:"flex", alignItems:"center", gap:"1rem" }}>
              <img src="/logo.png" alt="SNAR" style={{ height:"42px", objectFit:"contain" }}/>
              <span style={{ fontSize:".7rem", color:"#3E4451", fontWeight:600, letterSpacing:".12em", textTransform:"uppercase" }}>
                © 2024 SNAR. All rights reserved.
              </span>
            </div>

            {/* Social icons */}
            <div style={{ display:"flex", gap:".5rem" }}>
              {[
                { label:"ig", path:"M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z M4 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" },
                { label:"fb", path:"M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" },
                { label:"yt", path:"M22.54 6.42a2.78 2.78 0 0 0-1.94-1.96C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.4 19.54C5.12 20 12 20 12 20s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z M9.75 15.02 15.5 12 9.75 8.98v6.04z" },
                { label:"tw", path:"M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" },
              ].map(s => (
                <a key={s.label} href="#" style={{
                  width:"34px", height:"34px", borderRadius:"50%",
                  border:"1px solid rgba(255,255,255,0.08)",
                  display:"flex", alignItems:"center", justifyContent:"center",
                  color:"#6B7280", textDecoration:"none",
                  transition:"border-color .2s, color .2s",
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor="#00C4D4"; e.currentTarget.style.color="#00C4D4"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor="rgba(255,255,255,0.08)"; e.currentTarget.style.color="#6B7280"; }}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d={s.path}/>
                  </svg>
                </a>
              ))}
            </div>

            {/* Crafted with + back to top */}
            <div style={{ display:"flex", alignItems:"center", gap:"1rem" }}>
              <div className="snar-glass-pill" style={{ padding:".5rem 1.2rem", fontSize:".68rem", fontWeight:700, letterSpacing:".12em", textTransform:"uppercase", gap:".4rem", cursor:"default" }}>
                <span style={{color:"#6B7280"}}>Crafted with</span>
                <span className="snar-footer-heartbeat" style={{color:"#ef4444",fontSize:".9rem"}}>❤</span>
                <span style={{color:"#6B7280"}}>for athletes</span>
              </div>
              <MagneticButton
                as="button"
                onClick={scrollToTop}
                style={{ width:"40px", height:"40px", padding:0, justifyContent:"center", flexShrink:0 }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/>
                </svg>
              </MagneticButton>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
