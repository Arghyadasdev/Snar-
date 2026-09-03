"use client";
import { useState } from "react";

export default function FAQItem({ question, answer }) {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ borderBottom: "1px solid #1a1a2e", padding: "0" }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: "100%", background: "none", border: "none", cursor: "pointer",
          display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: "20px 0", textAlign: "left", color: open ? "#00C4D4" : "#e0e0e0",
          fontFamily: "Inter, sans-serif", fontSize: "1rem", fontWeight: "600", transition: "color 0.2s",
        }}
      >
        <span>{question}</span>
        <span style={{
          fontSize: "1.4rem", lineHeight: 1, color: "#00C4D4",
          transform: open ? "rotate(45deg)" : "rotate(0deg)", transition: "transform 0.25s", display: "inline-block",
        }}>+</span>
      </button>
      {open && (
        <p style={{ margin: "0 0 20px 0", color: "#9ca3af", fontFamily: "Inter, sans-serif", fontSize: "0.95rem", lineHeight: "1.7" }}>
          {answer}
        </p>
      )}
    </div>
  );
}
