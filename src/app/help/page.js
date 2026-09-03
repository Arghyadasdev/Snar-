import React from "react";
import Link from "next/link";
import FAQItem from "./faq-item";
import { getActiveFaqs } from "@/lib/data/site-settings";

const FALLBACK_FAQS = [
  { q: "How do I track my order?", a: "Once your order ships, you'll receive an email with a tracking link. Orders typically ship within 1–2 business days." },
  { q: "What is your return policy?", a: "We offer a 14-day return policy on all unworn, unwashed items with original tags attached." },
  { q: "How long does delivery take?", a: "Standard delivery takes 4–7 business days across India. Express delivery (2–3 days) is available at checkout." },
  { q: "Do you offer free shipping?", a: "Yes! Free shipping on all orders above ₹999. Orders below ₹999 incur a flat ₹79 shipping fee." },
  { q: "How do I cancel or modify my order?", a: "Orders can be cancelled or modified within 2 hours of placement. Contact us immediately via email." },
  { q: "What payment methods do you accept?", a: "We accept UPI, credit/debit cards, net banking, and wallets like Paytm and PhonePe." },
];

export default async function HelpPage() {
  const dbFaqs = await getActiveFaqs();
  const FAQS = dbFaqs.length > 0 ? dbFaqs.map((f) => ({ q: f.question, a: f.answer })) : FALLBACK_FAQS;

  return (
    <main
      style={{
        background: "#09090F",
        minHeight: "100vh",
        color: "#e0e0e0",
        fontFamily: "Inter, sans-serif",
      }}
    >
      {/* Hero */}
      <section
        style={{
          textAlign: "center",
          padding: "100px 24px 80px",
          borderBottom: "1px solid #1a1a2e",
        }}
      >
        <p
          style={{
            color: "#00C4D4",
            fontFamily: "Inter, sans-serif",
            fontSize: "0.8rem",
            fontWeight: "700",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            marginBottom: "16px",
          }}
        >
          WE'RE HERE FOR YOU
        </p>
        <h1
          style={{
            fontFamily: "'Bebas Neue', 'Arial Narrow', Arial, sans-serif",
            fontSize: "clamp(3rem, 8vw, 6rem)",
            fontWeight: "400",
            letterSpacing: "0.05em",
            color: "#ffffff",
            margin: "0 0 24px",
            lineHeight: 1.05,
          }}
        >
          HELP &amp; SUPPORT
        </h1>
        <p
          style={{
            fontFamily: "Inter, sans-serif",
            fontSize: "1rem",
            color: "#9ca3af",
            maxWidth: "480px",
            margin: "0 auto",
            lineHeight: "1.7",
          }}
        >
          Got a question? Browse our FAQs below or reach out directly — our
          team is always ready to help.
        </p>
      </section>

      {/* FAQ */}
      <section
        style={{
          maxWidth: "720px",
          margin: "0 auto",
          padding: "72px 24px",
        }}
      >
        <h2
          style={{
            fontFamily: "'Bebas Neue', 'Arial Narrow', Arial, sans-serif",
            fontSize: "clamp(1.8rem, 4vw, 2.6rem)",
            fontWeight: "400",
            letterSpacing: "0.06em",
            color: "#ffffff",
            marginBottom: "8px",
          }}
        >
          FREQUENTLY ASKED QUESTIONS
        </h2>
        <div
          style={{
            width: "48px",
            height: "3px",
            background: "#00C4D4",
            marginBottom: "40px",
          }}
        />
        {FAQS.map((item) => (
          <FAQItem key={item.q} question={item.q} answer={item.a} />
        ))}
      </section>

      {/* Contact */}
      <section
        style={{
          background: "#0d0d1a",
          borderTop: "1px solid #1a1a2e",
          padding: "72px 24px",
          textAlign: "center",
        }}
      >
        <h2
          style={{
            fontFamily: "'Bebas Neue', 'Arial Narrow', Arial, sans-serif",
            fontSize: "clamp(1.8rem, 4vw, 2.6rem)",
            fontWeight: "400",
            letterSpacing: "0.06em",
            color: "#ffffff",
            marginBottom: "8px",
          }}
        >
          STILL NEED HELP?
        </h2>
        <div
          style={{
            width: "48px",
            height: "3px",
            background: "#00C4D4",
            margin: "0 auto 32px",
          }}
        />
        <p
          style={{
            color: "#9ca3af",
            fontFamily: "Inter, sans-serif",
            fontSize: "0.95rem",
            marginBottom: "24px",
            lineHeight: "1.7",
          }}
        >
          Send us an email and we'll get back to you as soon as possible.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: "16px", alignItems: "center", marginBottom: "24px" }}>
          <a
            href="mailto:info@snar.co.in"
            style={{
              display: "inline-block",
              color: "#00C4D4",
              fontFamily: "Inter, sans-serif",
              fontSize: "1.1rem",
              fontWeight: "700",
              textDecoration: "none",
              letterSpacing: "0.04em",
              borderBottom: "2px solid #00C4D4",
              paddingBottom: "2px",
            }}
          >
            info@snar.co.in (Support info )
          </a>
          <a
            href="mailto:info@snar.co.in"
            style={{
              display: "inline-block",
              color: "#00C4D4",
              fontFamily: "Inter, sans-serif",
              fontSize: "1.1rem",
              fontWeight: "700",
              textDecoration: "none",
              letterSpacing: "0.04em",
              borderBottom: "2px solid #00C4D4",
              paddingBottom: "2px",
            }}
          >
            info@snar.co.in (General Info)
          </a>
          <a
            href="mailto:marketing@snar.co.in"
            style={{
              display: "inline-block",
              color: "#00C4D4",
              fontFamily: "Inter, sans-serif",
              fontSize: "1.1rem",
              fontWeight: "700",
              textDecoration: "none",
              letterSpacing: "0.04em",
              borderBottom: "2px solid #00C4D4",
              paddingBottom: "2px",
            }}
          >
            marketing@snar.co.in (Marketing)
          </a>
          <a
            href="mailto:finance@snar.co.in"
            style={{
              display: "inline-block",
              color: "#00C4D4",
              fontFamily: "Inter, sans-serif",
              fontSize: "1.1rem",
              fontWeight: "700",
              textDecoration: "none",
              letterSpacing: "0.04em",
              borderBottom: "2px solid #00C4D4",
              paddingBottom: "2px",
            }}
          >
            finance@snar.co.in (Finance)
          </a>
        </div>
        <p
          style={{
            color: "#6b7280",
            fontFamily: "Inter, sans-serif",
            fontSize: "0.85rem",
          }}
        >
          We respond within 24 hours
        </p>
        <Link
          href="/"
          style={{
            display: "inline-block",
            marginTop: "40px",
            padding: "12px 32px",
            background: "#00C4D4",
            color: "#09090F",
            fontFamily: "Inter, sans-serif",
            fontWeight: "700",
            fontSize: "0.85rem",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            textDecoration: "none",
            borderRadius: "2px",
          }}
        >
          Back to Home
        </Link>
      </section>
    </main>
  );
}