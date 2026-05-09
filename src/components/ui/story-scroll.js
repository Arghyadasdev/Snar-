'use client';

import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger);

export const FlowSection = ({ style = {}, children, 'aria-label': ariaLabel }) => (
  <section
    data-flow-section
    aria-label={ariaLabel}
    style={{ position: 'relative', minHeight: '100vh', width: '100%', overflow: 'hidden' }}
  >
    <div
      data-flow-inner
      className="flow-art-container"
      style={{
        position: 'relative',
        display: 'flex',
        minHeight: '100vh',
        width: '100%',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: '1.5rem',
        padding: 'clamp(2rem,8vw,4rem) 4vw 4vw',
        transformOrigin: 'bottom left',
        willChange: 'transform',
        ...style,
      }}
    >
      {children}
    </div>
  </section>
);

const FlowArt = ({ children, 'aria-label': ariaLabel = 'Story scroll' }) => {
  const containerRef = useRef(null);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReducedMotion(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  useGSAP(
    () => {
      if (!containerRef.current || reducedMotion) return;
      const sections = Array.from(
        containerRef.current.querySelectorAll('[data-flow-section]')
      );
      if (!sections.length) return;
      const triggers = [];

      sections.forEach((section, i) => {
        gsap.set(section, { zIndex: i + 1 });
        const inner = section.querySelector('.flow-art-container');
        if (!inner) return;

        if (i > 0) {
          gsap.set(inner, { rotation: 30, transformOrigin: 'bottom left' });
          const tween = gsap.to(inner, {
            rotation: 0,
            ease: 'none',
            scrollTrigger: {
              trigger: section,
              start: 'top bottom',
              end: 'top 25%',
              scrub: true,
            },
          });
          if (tween.scrollTrigger) triggers.push(tween.scrollTrigger);
        }

        if (i < sections.length - 1) {
          triggers.push(
            ScrollTrigger.create({
              trigger: section,
              start: 'bottom bottom',
              end: 'bottom top',
              pin: true,
              pinSpacing: false,
            })
          );
        }
      });

      ScrollTrigger.refresh();
      return () => triggers.forEach(t => t.kill());
    },
    { scope: containerRef, dependencies: [React.Children.count(children), reducedMotion] }
  );

  return (
    <div
      ref={containerRef}
      aria-label={ariaLabel}
      style={{ width: '100%', overflowX: 'hidden' }}
    >
      {children}
    </div>
  );
};

export default FlowArt;
