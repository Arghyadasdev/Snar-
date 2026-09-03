"use client";
import { useState, useEffect, useRef } from "react";

const WA_NUMBER = "919875607634";

const STEPS = [
  {
    id: "name",
    bot: "Hi! 👋 I'm the SNAR assistant. What's your name?",
    type: "input",
    placeholder: "Your name...",
  },
  {
    id: "product",
    bot: (data) => `Nice to meet you, ${data.name}! What are you looking for?`,
    type: "options",
    options: ["Tracksuit", "Hoodie", "T-Shirt", "Shorts", "Accessories", "Other"],
  },
  {
    id: "size",
    bot: "What size do you need?",
    type: "options",
    options: ["XS", "S", "M", "L", "XL", "XXL"],
  },
  {
    id: "details",
    bot: "Any color preference or extra details? (or skip)",
    type: "input",
    placeholder: "e.g. Black, qty 2...",
    optional: true,
  },
];

export default function ChatBot() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [data, setData] = useState({});
  const [done, setDone] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (open && messages.length === 0) {
      pushBot(STEPS[0].bot);
    }
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function pushBot(text) {
    const msg = typeof text === "function" ? text(data) : text;
    setMessages(prev => [...prev, { from: "bot", text: msg }]);
  }

  function pushUser(text) {
    setMessages(prev => [...prev, { from: "user", text }]);
  }

  function handleAnswer(answer) {
    const current = STEPS[step];
    const newData = { ...data, [current.id]: answer };
    setData(newData);
    pushUser(answer);

    const nextStep = step + 1;

    if (nextStep >= STEPS.length) {
      setTimeout(() => {
        pushBot("Perfect! Let me connect you with our team on WhatsApp. 🚀");
        setDone(true);
      }, 400);
      setTimeout(() => {
        const msg = buildWAMessage(newData);
        window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`, "_blank");
      }, 1600);
    } else {
      setTimeout(() => {
        pushBot(STEPS[nextStep].bot);
        setStep(nextStep);
      }, 400);
    }
  }

  function buildWAMessage(d) {
    return `Hi SNAR! 👋\n\nName: ${d.name}\nLooking for: ${d.product}\nSize: ${d.size}${d.details ? `\nDetails: ${d.details}` : ""}\n\nPlease help me place an order!`;
  }

  function handleInputSubmit(skip = false) {
    const current = STEPS[step];
    const val = skip ? "—" : input.trim();
    if (!val && !skip) return;
    setInput("");
    handleAnswer(val);
  }

  function resetChat() {
    setMessages([]);
    setStep(0);
    setData({});
    setDone(false);
    setInput("");
    setTimeout(() => pushBot(STEPS[0].bot), 100);
  }

  const currentStep = STEPS[step];

  return (
    <>
      {/* Bubble toggle */}
      <button
        onClick={() => setOpen(o => !o)}
        aria-label="Chat with us"
        style={{
          position: "fixed",
          bottom: "1.75rem",
          right: "1.75rem",
          zIndex: 600,
          width: "56px",
          height: "56px",
          borderRadius: "50%",
          background: "#25D366",
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 4px 24px rgba(37,211,102,0.45)",
          transition: "transform 0.2s",
        }}
        onMouseEnter={e => e.currentTarget.style.transform = "scale(1.1)"}
        onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
      >
        {open
          ? <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          : <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        }
      </button>

      {/* Chat window */}
      {open && (
        <div style={{
          position: "fixed",
          bottom: "5.5rem",
          right: "1.75rem",
          zIndex: 600,
          width: "320px",
          maxHeight: "480px",
          borderRadius: "20px",
          background: "#0D0E15",
          border: "1px solid rgba(255,255,255,0.1)",
          boxShadow: "0 8px 40px rgba(0,0,0,0.6)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          fontFamily: "'Inter', sans-serif",
        }}>
          {/* Header */}
          <div style={{
            padding: "1rem 1.25rem",
            background: "#25D366",
            display: "flex",
            alignItems: "center",
            gap: ".75rem",
          }}>
            <div style={{
              width: "36px", height: "36px", borderRadius: "50%",
              background: "rgba(0,0,0,0.2)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="#fff"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: ".88rem", color: "#fff" }}>SNAR Assistant</div>
              <div style={{ fontSize: ".7rem", color: "rgba(255,255,255,0.8)" }}>Orders via WhatsApp</div>
            </div>
          </div>

          {/* Messages */}
          <div style={{
            flex: 1, overflowY: "auto", padding: "1rem",
            display: "flex", flexDirection: "column", gap: ".75rem",
            maxHeight: "280px",
          }}>
            {messages.map((m, i) => (
              <div key={i} style={{
                display: "flex",
                justifyContent: m.from === "bot" ? "flex-start" : "flex-end",
              }}>
                <div style={{
                  maxWidth: "80%",
                  padding: ".6rem .9rem",
                  borderRadius: m.from === "bot" ? "4px 14px 14px 14px" : "14px 4px 14px 14px",
                  background: m.from === "bot" ? "rgba(255,255,255,0.07)" : "#25D366",
                  color: "#fff",
                  fontSize: ".82rem",
                  lineHeight: 1.5,
                }}>
                  {m.text}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Input area */}
          {!done && (
            <div style={{ padding: ".75rem 1rem", borderTop: "1px solid rgba(255,255,255,0.07)" }}>
              {currentStep?.type === "options" ? (
                <div style={{ display: "flex", flexWrap: "wrap", gap: ".4rem" }}>
                  {currentStep.options.map(opt => (
                    <button
                      key={opt}
                      onClick={() => handleAnswer(opt)}
                      style={{
                        padding: ".4rem .8rem",
                        borderRadius: "100px",
                        border: "1px solid rgba(37,211,102,0.4)",
                        background: "transparent",
                        color: "#25D366",
                        fontSize: ".75rem",
                        fontWeight: 600,
                        cursor: "pointer",
                        transition: "background 0.15s",
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = "rgba(37,211,102,0.1)"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              ) : (
                <div style={{ display: "flex", gap: ".5rem" }}>
                  <input
                    type="text"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleInputSubmit()}
                    placeholder={currentStep?.placeholder || "Type..."}
                    autoFocus
                    style={{
                      flex: 1, background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "10px", padding: ".5rem .75rem",
                      color: "#fff", fontSize: ".82rem", outline: "none",
                    }}
                  />
                  {currentStep?.optional && (
                    <button
                      onClick={() => handleInputSubmit(true)}
                      style={{
                        padding: ".5rem .7rem", borderRadius: "10px",
                        border: "1px solid rgba(255,255,255,0.1)",
                        background: "transparent", color: "rgba(255,255,255,0.4)",
                        fontSize: ".7rem", cursor: "pointer",
                      }}
                    >Skip</button>
                  )}
                  <button
                    onClick={() => handleInputSubmit()}
                    style={{
                      padding: ".5rem .75rem", borderRadius: "10px",
                      background: "#25D366", border: "none",
                      cursor: "pointer", display: "flex", alignItems: "center",
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                  </button>
                </div>
              )}
            </div>
          )}

          {done && (
            <div style={{ padding: "1rem", borderTop: "1px solid rgba(255,255,255,0.07)", textAlign: "center" }}>
              <button
                onClick={resetChat}
                style={{
                  padding: ".5rem 1.25rem", borderRadius: "100px",
                  border: "1px solid rgba(255,255,255,0.15)",
                  background: "transparent", color: "rgba(255,255,255,0.5)",
                  fontSize: ".75rem", cursor: "pointer",
                }}
              >Start over</button>
            </div>
          )}
        </div>
      )}
    </>
  );
}
