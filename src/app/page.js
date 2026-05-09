"use client";
import React, { useEffect, useRef, useState } from "react";
import { CinematicFooter } from "@/components/ui/motion-footer";
import FlowArt, { FlowSection } from "@/components/ui/story-scroll";

const PRODUCTS = [
  { id: 1, name: "Performance Tee", price: "₹1,099", colors: ["#111","#00C4D4","#fff"], bg: "linear-gradient(160deg,#0D1520 0%,#1A2535 100%)", label: "NEW" },
  { id: 2, name: "Training Shorts", price: "₹899", colors: ["#00C4D4","#111","#1a3a1a"], bg: "linear-gradient(160deg,#0A1A18 0%,#003D3D 100%)" },
  { id: 3, name: "Elite Tracksuit", price: "₹2,499", colors: ["#111","#222","#00C4D4"], bg: "linear-gradient(160deg,#0D0E18 0%,#1A1B28 100%)", label: "HOT" },
  { id: 4, name: "Performance Hoodie", price: "₹1,799", colors: ["#111","#00C4D4","#333"], bg: "linear-gradient(160deg,#0D0E18 0%,#15202B 100%)" },
  { id: 5, name: "Active Tee", price: "₹999", colors: ["#fff","#111","#00C4D4"], bg: "linear-gradient(160deg,#1A1A1A 0%,#2A2A2A 100%)" },
  { id: 6, name: "Gym Bag", price: "₹1,299", colors: ["#111","#222","#333"], bg: "linear-gradient(160deg,#0D0E18 0%,#191A24 100%)", label: "NEW" },
];

const MARQUEE_ITEMS = [
  "PERFORMANCE", "ENGINEERED", "CHAMPIONS ONLY", "IGNITE YOUR EDGE",
  "PREMIUM SPORTSWEAR", "BUILT TO WIN", "PUSH YOUR LIMITS", "ELITE QUALITY",
];

const STATS = [
  { num: "10K+", label: "Athletes Trust SNAR", icon: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" },
  { num: "50+", label: "Performance Products", icon: "M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0" },
  { num: "4.9★", label: "Average Rating", icon: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" },
  { num: "99%", label: "Satisfaction Rate", icon: "M22 11.08V12a10 10 0 1 1-5.93-9.14M22 4L12 14.01l-3-3" },
];

const TESTIMONIALS = [
  {
    quote: "SNAR's Performance Tee is unreal. Wore it through a brutal 90-minute training session and it kept me dry the entire time. The fabric feels premium without restricting movement.",
    name: "Rahul Sharma",
    role: "Professional Footballer",
    location: "Mumbai",
    initials: "RS",
    rating: 5,
    product: "Performance Tee",
  },
  {
    quote: "Finally found sportswear that actually lives up to its claims. The Elite Tracksuit fits perfectly and the material quality is on par with international brands — at half the price.",
    name: "Priya Nair",
    role: "Marathon Runner",
    location: "Bangalore",
    initials: "PN",
    rating: 5,
    product: "Elite Tracksuit",
  },
  {
    quote: "I've tried every major brand out there. SNAR hits different. The hoodie is warm but breathable — perfect for early morning runs when it's cold. My go-to now.",
    name: "Arjun Mehta",
    role: "CrossFit Athlete",
    location: "Delhi",
    initials: "AM",
    rating: 5,
    product: "Performance Hoodie",
  },
];

const CATEGORIES = [
  { name: "Tracksuits", icon: "tracksuit", image: "/cat_tracksuit.png" },
  { name: "Hoodies", icon: "hoodie", image: "/cat_hoodie.png" },
  { name: "T-Shirts", icon: "tshirt", image: "/cat_tshirt.png" },
  { name: "Shorts", icon: "shorts", image: "/cat_shorts.png" },
  { name: "Accessories", icon: "bag", image: "/cat_accessories.png" },
];


export default function Home() {
  const [heroSlide, setHeroSlide] = useState(0);
  const [statsVisible, setStatsVisible] = useState(false);
  const statsRef = useRef(null);

  const heroTimerRef = useRef(null);

  useEffect(() => {
    const el = statsRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setStatsVisible(true); obs.disconnect(); } }, { threshold: 0.3 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  const HERO_SLIDES = 3;
  useEffect(() => {
    heroTimerRef.current = setInterval(() => {
      setHeroSlide(s => (s + 1) % HERO_SLIDES);
    }, 5000);
    return () => clearInterval(heroTimerRef.current);
  }, []);

  const goSlide = (i) => {
    clearInterval(heroTimerRef.current);
    setHeroSlide(i);
    heroTimerRef.current = setInterval(() => setHeroSlide(s => (s + 1) % HERO_SLIDES), 5000);
  };

const heroContent = [
    { eyebrow: "PREMIUM SPORTSWEAR", h1line1: "IGNITE", h1line2: "YOUR", ac: "EDGE", sub: "Engineered for performance.\nDesigned for champions.", cta1: "SHOP NOW", cta2: "EXPLORE COLLECTION",
      features: [
        { title: "BREATHABLE", desc: "Stay cool\nand fresh", icon: "breathable" },
        { title: "QUICK DRY", desc: "Sweat-wicking\ntechnology", icon: "quick-dry" },
        { title: "STRETCHABLE", desc: "Move freely\nand comfortably", icon: "stretchable" },
        { title: "LIGHTWEIGHT", desc: "Built for speed\nand agility", icon: "lightweight" },
      ]
    },
    { eyebrow: "NEW COLLECTION 2026", h1line1: "PUSH", h1line2: "YOUR", ac: "LIMITS", sub: "Advanced fabric technology\nfor elite performance.", cta1: "SHOP NOW", cta2: "VIEW LOOKBOOK" },
    { eyebrow: "UP TO 30% OFF", h1line1: "SALE", h1line2: "NOW", ac: "LIVE", sub: "Selected items on sale.\nGrab yours before they're gone.", cta1: "SHOP SALE", cta2: "ALL PRODUCTS" },
  ];


  return (
    <>
      {/* HERO */}
      <section className="hero">
        <div className="hero-slides" style={{ transform: `translateX(-${heroSlide * 100}%)` }}>
          {heroContent.map((hci, idx) => (
            <div className="hero-slide" key={idx}>
              <div className="hero-bg">
                <div style={{
                  position:"absolute",inset:0,
                  background:`linear-gradient(125deg,#050508 0%,#0D0D18 40%,${idx===0?"#0A1520":idx===1?"#0A1810":"#150A0A"} 100%)`
                }}/>
                <div style={{position:"absolute",inset:0,background:"linear-gradient(to right,rgba(0,0,0,.85) 35%,rgba(0,0,0,.1) 100%)"}}/>
              </div>
              <video
                className="hero-athlete"
                src="/banner.mp4"
                autoPlay
                loop
                muted
                playsInline
                preload="auto"
              />
              <div className="hero-content">
                <div className="hero-eyebrow">{hci.eyebrow}</div>
                <h1 className="hero-h1">
                  {hci.h1line1}<br/>{hci.h1line2} <span className="ac">{hci.ac}</span>
                </h1>
                <p className="hero-sub">{hci.sub}</p>
                
                {hci.features && (
                  <div className="hero-features">
                    {hci.features.map((f, i) => (
                      <div key={i} className="hero-feat-item">
                        <div className="hero-feat-icon">
                          {f.icon === 'breathable' && <svg viewBox="0 0 24 24"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>}
                          {f.icon === 'quick-dry' && <svg viewBox="0 0 24 24"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/><path d="M12 8v4"/></svg>}
                          {f.icon === 'stretchable' && <svg viewBox="0 0 24 24"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/><polyline points="21 15 21 21 15 21"/><polyline points="3 9 3 3 9 3"/><line x1="21" y1="21" x2="14" y2="14"/><line x1="3" y1="3" x2="10" y2="10"/></svg>}
                          {f.icon === 'lightweight' && <svg viewBox="0 0 24 24"><path d="M12 2s-6 4-6 11a6 6 0 0 0 12 0c0-7-6-11-6-11z"/><line x1="12" y1="22" x2="12" y2="13"/></svg>}
                        </div>
                        <div className="hero-feat-text">
                          <div className="hero-feat-title">{f.title}</div>
                          <div className="hero-feat-desc">
                            {f.desc.split('\n').map((l, idx) => <span key={idx} style={{display:'block'}}>{l}</span>)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="hero-btns">
                  <a href="#" className="btn-primary">
                    {hci.cta1}
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12,5 19,12 12,19"/></svg>
                  </a>
                  <a href="#" className="btn-outline">{hci.cta2}</a>
                </div>
              </div>
            </div>
          ))}
        </div>
        <button className="hero-arrow hero-prev" onClick={() => goSlide((heroSlide - 1 + HERO_SLIDES) % HERO_SLIDES)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15,18 9,12 15,6"/></svg>
        </button>
        <button className="hero-arrow hero-next" onClick={() => goSlide((heroSlide + 1) % HERO_SLIDES)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9,18 15,12 9,6"/></svg>
        </button>
        <div className="hero-dots">
          {Array.from({length: HERO_SLIDES}).map((_,i) => (
            <div key={i} className={`hero-dot${heroSlide===i?" active":""}`} onClick={() => goSlide(i)}/>
          ))}
        </div>
      </section>

      {/* FEATURES STRIP */}
      <div className="features-strip">
        <div className="feat-item">
          <div className="feat-icon-wrap">
            <svg viewBox="0 0 24 24"><path d="M12 15a5 5 0 1 0 0-10 5 5 0 0 0 0 10z"/><path d="M10.5 12.5l1.5 1.5 3-3"/><path d="M12 15v7l-3-1.5L6 22v-7.5"/></svg>
          </div>
          <div>
            <div className="feat-title">PREMIUM QUALITY</div>
            <div className="feat-desc">Built to last</div>
          </div>
        </div>
        <div className="feat-item">
          <div className="feat-icon-wrap">
            <svg viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></svg>
          </div>
          <div>
            <div className="feat-title">PERFORMANCE DRIVEN</div>
            <div className="feat-desc">For every athlete</div>
          </div>
        </div>
        <div className="feat-item">
          <div className="feat-icon-wrap">
            <svg viewBox="0 0 24 24"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
          </div>
          <div>
            <div className="feat-title">FREE SHIPPING</div>
            <div className="feat-desc">On orders over ₹999</div>
          </div>
        </div>
        <div className="feat-item">
          <div className="feat-icon-wrap">
            <svg viewBox="0 0 24 24"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><polyline points="3 3 3 8 8 8"/></svg>
          </div>
          <div>
            <div className="feat-title">EASY RETURNS</div>
            <div className="feat-desc">14 days return policy</div>
          </div>
        </div>
      </div>

      {/* MARQUEE STRIP */}
      <div className="marquee-wrap" aria-hidden="true">
        <div className="marquee-track">
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
            <span key={i} className="mq-item">
              <span className="mq-star">✦</span>
              <span className="mq-text">{item}</span>
            </span>
          ))}
        </div>
      </div>

      {/* CATEGORIES */}
      <section className="cats-section">
        <div className="cats-header-row">
          <div>
            <div className="cats-eyebrow">What we offer</div>
            <div className="cats-headline">Shop by <em>Category</em></div>
          </div>
          <a href="#" className="section-link">
            View all
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12,5 19,12 12,19"/></svg>
          </a>
        </div>

        <div className="cats-editorial">
          {/* Featured — Tracksuits */}
          <a href="#" className="cat-featured">
            <img src={CATEGORIES[0].image} alt={CATEGORIES[0].name} className="cat-ed-img"/>
            <div className="cat-ed-overlay"/>
            <div className="cat-ed-body">
              <span className="cat-ed-num">01</span>
              <div className="cat-ed-info">
                <span className="cat-ed-tag">Featured</span>
                <div className="cat-ed-name">{CATEGORIES[0].name}</div>
              </div>
              <div className="cat-ed-arrow">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12,5 19,12 12,19"/></svg>
              </div>
            </div>
          </a>

          {/* 2×2 grid */}
          <div className="cats-sub-grid">
            {CATEGORIES.slice(1).map((cat, i) => (
              <a key={cat.name} href="#" className="cat-sub">
                <img src={cat.image} alt={cat.name} className="cat-ed-img"/>
                <div className="cat-ed-overlay"/>
                <div className="cat-sub-body">
                  <span className="cat-ed-num">0{i + 2}</span>
                  <div className="cat-sub-name">{cat.name}</div>
                  <div className="cat-sub-arrow">↗</div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="stats-section" ref={statsRef}>
        <div className={`stats-grid${statsVisible ? " stats-visible" : ""}`}>
          {STATS.map((s, i) => (
            <div key={i} className="stat-card" style={{ transitionDelay: `${i * 0.1}s` }}>
              <div className="stat-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d={s.icon}/>
                </svg>
              </div>
              <div className="stat-num">{s.num}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURED PRODUCTS — COMING SOON */}
      <section className="products-section">
        <div className="section-wrap">
          <div className="section-header">
            <div className="section-title">FEATURED PRODUCTS</div>
          </div>
          <div className="coming-soon-wrap">
            {/* blurred ghost cards */}
            <div className="cs-ghost-row" aria-hidden="true">
              {[1,2,3,4].map(i => (
                <div key={i} className="cs-ghost-card">
                  <div className="cs-ghost-img"/>
                  <div className="cs-ghost-line w80"/>
                  <div className="cs-ghost-line w50"/>
                </div>
              ))}
            </div>
            {/* overlay */}
            <div className="cs-overlay">
              <div className="cs-badge">NEW COLLECTION</div>
              <div className="cs-heading">
                DROPPING<br/><span className="cs-ac">SOON</span>
              </div>
              <p className="cs-sub">Our latest performance collection is almost ready.<br/>Be the first to know when it drops.</p>
              <div className="cs-form">
                <input className="cs-input" type="email" placeholder="Enter your email to get early access"/>
                <button className="cs-btn">
                  NOTIFY ME
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12,5 19,12 12,19"/></svg>
                </button>
              </div>
              <div className="cs-dividers">
                <span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14"/><path d="M12 5l7 7-7 7"/></svg>
                  Free Shipping
                </span>
                <span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>
                  Easy Returns
                </span>
                <span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                  Premium Quality
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PROMO BANNERS */}
      <div className="promo-section">
        <div className="promo-card">
          <div className="promo-bg">
            <div className="promo-bg-placeholder" style={{background:"linear-gradient(135deg,#0A0B12 0%,#12141E 40%,#0D1828 100%)"}}>
              <svg style={{position:"absolute",inset:0,width:"100%",height:"100%",opacity:.12}} viewBox="0 0 600 340" xmlns="http://www.w3.org/2000/svg">
                <path d="M350 30 L280 110 L310 122 L310 300 L490 300 L490 122 L520 110 L450 30 Q415 46 400 48 Q385 46 350 30Z" fill="none" stroke="#00C4D4" strokeWidth="1.5"/>
                <circle cx="180" cy="170" r="90" fill="none" stroke="#00C4D4" strokeWidth="1"/>
                <path d="M130 80 L130 250 L230 250 L230 80Z" fill="rgba(0,196,212,0.05)"/>
              </svg>
            </div>
            <div className="promo-overlay"/>
          </div>
          <div className="promo-content">
            <div className="promo-label">NEW COLLECTION</div>
            <div className="promo-title">PERFORMANCE<br/><span className="ac">REDEFINED</span></div>
            <div className="promo-sub">Take your training to the next level.</div>
            <a href="#" className="btn-promo">EXPLORE NOW</a>
          </div>
        </div>
        <div className="promo-card">
          <div className="promo-bg">
            <div className="promo-bg-placeholder" style={{background:"linear-gradient(135deg,#0A1018 0%,#141820 40%,#0A1215 100%)"}}>
              <svg style={{position:"absolute",inset:0,width:"100%",height:"100%",opacity:.12}} viewBox="0 0 600 340" xmlns="http://www.w3.org/2000/svg">
                <ellipse cx="480" cy="170" rx="110" ry="130" fill="none" stroke="#00C4D4" strokeWidth="1.5"/>
                <path d="M100 30 L80 120 L95 126 L90 290 L310 290 L305 126 L320 120 L300 30Z" fill="none" stroke="#00C4D4" strokeWidth="1.2"/>
                <line x1="0" y1="100" x2="600" y2="240" stroke="#00C4D4" strokeWidth=".8" strokeDasharray="4 8"/>
              </svg>
            </div>
            <div className="promo-overlay"/>
          </div>
          <div className="promo-content">
            <div className="promo-label">LIMITED TIME OFFER</div>
            <div className="promo-title">UP TO<br/><span className="ac">30% OFF</span></div>
            <div className="promo-sub">On selected items</div>
            <a href="#" className="btn-promo">SHOP SALE</a>
          </div>
        </div>
      </div>

      {/* BRAND STORY — STORY SCROLL */}
      <FlowArt aria-label="SNAR Brand Story">
        <FlowSection
          aria-label="Who we are"
          style={{ backgroundColor: '#00C4D4', color: '#05050A' }}
        >
          <p style={{ fontSize: '.7rem', fontWeight: 700, letterSpacing: '.2em', textTransform: 'uppercase' }}>01 — Who we are</p>
          <hr style={{ border: 'none', borderTop: '1px solid rgba(0,0,0,.25)', margin: '2vw 0' }} />
          <div>
            <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(3.5rem,12vw,13rem)', fontWeight: 700, lineHeight: .85, letterSpacing: '.02em', textTransform: 'uppercase' }}>
              Ignite<br />Your<br />Edge
            </h2>
          </div>
          <hr style={{ border: 'none', borderTop: '1px solid rgba(0,0,0,.25)', margin: '2vw 0' }} />
          <p style={{ maxWidth: '50ch', fontSize: 'clamp(1rem,2.5vw,1.6rem)', fontWeight: 400, lineHeight: 1.6 }}>
            SNAR was built in gyms, on tracks, and in the minds of athletes who refused to settle. We don't make fashion — we engineer performance wear for people who train like it matters.
          </p>
        </FlowSection>

        <FlowSection
          aria-label="The mission"
          style={{ backgroundColor: '#09090F', color: '#FFFFFF' }}
        >
          <p style={{ fontSize: '.7rem', fontWeight: 700, letterSpacing: '.2em', textTransform: 'uppercase', color: '#00C4D4' }}>02 — The mission</p>
          <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,.12)', margin: '2vw 0' }} />
          <div>
            <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(3.5rem,12vw,13rem)', fontWeight: 700, lineHeight: .85, letterSpacing: '.02em', textTransform: 'uppercase' }}>
              Built<br />To<br />Win
            </h2>
          </div>
          <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,.12)', margin: '2vw 0' }} />
          <p style={{ maxWidth: '50ch', fontSize: 'clamp(1rem,2.5vw,1.6rem)', fontWeight: 300, lineHeight: 1.6, color: '#C8CACE' }}>
            Every stitch, every fabric, every cut is tested under pressure so you perform without limits.
          </p>
          <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,.12)', margin: '2vw 0' }} />
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3vw' }}>
            {[
              { title: 'Breathable Fabric', desc: 'Advanced mesh technology keeps you cool through the hardest sessions.' },
              { title: 'Quick Dry Tech', desc: 'Moisture-wicking fibres pull sweat away instantly. Stay fresh, stay focused.' },
              { title: 'Flex Fit Design', desc: 'Four-way stretch that moves with your body — never against it.' },
            ].map(item => (
              <div key={item.title} style={{ minWidth: '180px', flex: 1 }}>
                <p style={{ fontSize: '.75rem', fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: '#00C4D4', marginBottom: '.5rem' }}>{item.title}</p>
                <p style={{ fontSize: 'clamp(.85rem,1.3vw,1rem)', lineHeight: 1.65, color: 'rgba(200,202,206,0.75)' }}>{item.desc}</p>
              </div>
            ))}
          </div>
          <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,.12)', margin: '2vw 0' }} />
          <p style={{ marginLeft: 'auto', maxWidth: '50ch', textAlign: 'right', fontSize: 'clamp(1rem,2.5vw,1.6rem)', fontWeight: 300, lineHeight: 1.6, color: '#C8CACE' }}>
            Every product decision starts with one question — does this make athletes better?
          </p>
        </FlowSection>

        <FlowSection
          aria-label="Join the movement"
          style={{ backgroundColor: '#0D0E15', color: '#FFFFFF' }}
        >
          <p style={{ fontSize: '.7rem', fontWeight: 700, letterSpacing: '.2em', textTransform: 'uppercase', color: '#00C4D4' }}>03 — Join the movement</p>
          <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,.1)', margin: '2vw 0' }} />
          <div>
            <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(3.5rem,12vw,13rem)', fontWeight: 700, lineHeight: .85, letterSpacing: '.02em', textTransform: 'uppercase' }}>
              Train.<br />Dominate.<br />Repeat.
            </h2>
          </div>
          <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,.1)', margin: '2vw 0' }} />
          <p style={{ maxWidth: '50ch', fontSize: 'clamp(1rem,2.5vw,1.6rem)', fontWeight: 300, lineHeight: 1.6, color: '#C8CACE' }}>
            10,000+ athletes already train in SNAR. The collection drops soon — be the first to own it.
          </p>
          <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,.1)', margin: '2vw 0' }} />
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3vw' }}>
            {[
              { num: '10K+', label: 'Athletes training in SNAR' },
              { num: '50+', label: 'Performance products engineered' },
              { num: '4.9★', label: 'Average customer rating' },
            ].map(item => (
              <div key={item.num} style={{ minWidth: '180px', flex: 1 }}>
                <p style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 'clamp(2rem,4vw,3.5rem)', letterSpacing: '.04em', color: '#00C4D4', lineHeight: 1, marginBottom: '.4rem' }}>{item.num}</p>
                <p style={{ fontSize: 'clamp(.85rem,1.3vw,1rem)', lineHeight: 1.65, color: 'rgba(200,202,206,0.75)', textTransform: 'uppercase', letterSpacing: '.08em', fontWeight: 500, fontSize: '.75rem' }}>{item.label}</p>
              </div>
            ))}
          </div>
        </FlowSection>
      </FlowArt>

      {/* TESTIMONIALS */}
      <section className="testimonials-section">
        <div className="testimonials-header">
          <div className="testimonials-eyebrow">What athletes say</div>
          <h2 className="testimonials-headline">Trusted by <em>Champions</em></h2>
          <p className="testimonials-sub">Real reviews from real athletes who train in SNAR every day.</p>
        </div>
        <div className="testimonials-grid">
          {TESTIMONIALS.map((t, i) => (
            <div key={i} className="tcard">
              <div className="tcard-top">
                <div className="tcard-stars">
                  {Array.from({ length: t.rating }).map((_, si) => (
                    <svg key={si} width="14" height="14" viewBox="0 0 24 24" fill="var(--ac)" stroke="none">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                    </svg>
                  ))}
                </div>
                <div className="tcard-product">{t.product}</div>
              </div>
              <p className="tcard-quote">"{t.quote}"</p>
              <div className="tcard-footer">
                <div className="tcard-avatar">{t.initials}</div>
                <div className="tcard-person">
                  <div className="tcard-name">{t.name}</div>
                  <div className="tcard-role">{t.role} · {t.location}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* TRUST BAR */}
      <div className="trust-bar">
        <div className="trust-item">
          <div className="trust-icon">
            <svg viewBox="0 0 24 24"><path d="M5 12h14"/><path d="M12 5l7 7-7 7"/></svg>
          </div>
          <div>
            <div className="trust-title">Free Shipping</div>
            <div className="trust-desc">On orders over ₹999</div>
          </div>
        </div>
        <div className="trust-item">
          <div className="trust-icon">
            <svg viewBox="0 0 24 24"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>
          </div>
          <div>
            <div className="trust-title">Easy Returns</div>
            <div className="trust-desc">14 days return policy</div>
          </div>
        </div>
        <div className="trust-item">
          <div className="trust-icon">
            <svg viewBox="0 0 24 24"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
          </div>
          <div>
            <div className="trust-title">Secure Payment</div>
            <div className="trust-desc">100% secure checkout</div>
          </div>
        </div>
        <div className="trust-item">
          <div className="trust-icon">
            <svg viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.82 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.73 1.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.91a16 16 0 0 0 6.18 6.18l1.19-1.19a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
          </div>
          <div>
            <div className="trust-title">24/7 Support</div>
            <div className="trust-desc">We&apos;re here to help</div>
          </div>
        </div>
      </div>

      {/* CINEMATIC FOOTER */}
      <CinematicFooter />

    </>
  );
}
