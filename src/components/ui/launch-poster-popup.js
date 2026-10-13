"use client";
import { useEffect, useState } from "react";
import Image from "next/image";

export default function LaunchPosterPopup() {
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setOpen(true), 400);
    return () => clearTimeout(t);
  }, []);

  const close = () => {
    setClosing(true);
    setTimeout(() => setOpen(false), 250);
  };

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={close}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "4vw",
        background: "rgba(5,5,10,0.78)",
        backdropFilter: "blur(6px)",
        animation: `lp-fade .3s ease ${closing ? "reverse forwards" : "forwards"}`,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "relative",
          maxWidth: "min(420px, 90vw)",
          width: "100%",
          maxHeight: "88svh",
          borderRadius: "16px",
          overflow: "hidden",
          boxShadow: "0 30px 80px -20px rgba(0,196,212,0.35), 0 0 0 1px rgba(255,255,255,0.08)",
          animation: `${closing ? "lp-pop-out .25s ease forwards" : "lp-pop-in .55s cubic-bezier(.17,.89,.32,1.49) forwards"}`,
        }}
      >
        <button
          onClick={close}
          aria-label="Close"
          style={{
            position: "absolute",
            top: "10px",
            right: "10px",
            width: "32px",
            height: "32px",
            borderRadius: "50%",
            border: "none",
            background: "rgba(5,5,10,0.55)",
            color: "#fff",
            fontSize: "1.1rem",
            lineHeight: 1,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1,
          }}
        >
          ×
        </button>
        <Image
          src="/launch-poster.jpg"
          alt="SNAR officially launches soon"
          width={1024}
          height={1536}
          style={{ width: "100%", height: "auto", display: "block" }}
          priority
        />
      </div>

      <style>{`
        @keyframes lp-fade {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes lp-pop-in {
          0% { opacity: 0; transform: scale(.55) translateY(40px); }
          60% { opacity: 1; transform: scale(1.04) translateY(-4px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes lp-pop-out {
          from { opacity: 1; transform: scale(1); }
          to { opacity: 0; transform: scale(.85); }
        }
      `}</style>
    </div>
  );
}
