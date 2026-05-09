"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Home, Shirt, Users, LayoutGrid, ShoppingBag } from "lucide-react";

const NAV_ITEMS = [
  { label: "Home",        icon: Home,        href: "/" },
  { label: "Men",         icon: Shirt,       href: "/men" },
  { label: "Women",       icon: Users,       href: "/women" },
  { label: "Collections", icon: LayoutGrid,  href: "/collections" },
  { label: "Cart",        icon: ShoppingBag, href: "#" },
];

const LABEL_WIDTH = 72;

export function BottomNavBar({ defaultIndex = 0 }) {
  const [activeIndex, setActiveIndex] = useState(defaultIndex);

  return (
    <motion.nav
      initial={{ scale: 0.9, opacity: 0, y: 20 }}
      animate={{ scale: 1,   opacity: 1, y: 0  }}
      transition={{ type: "spring", stiffness: 300, damping: 26 }}
      role="navigation"
      aria-label="Mobile Bottom Navigation"
      className="mobile-bottom-nav"
      style={{
        position:       "fixed",
        bottom:         "1rem",
        left:           "50%",
        transform:      "translateX(-50%)",
        zIndex:         300,
        display:        "flex",
        alignItems:     "center",
        gap:            "2px",
        padding:        "6px",
        borderRadius:   "999px",
        background:     "rgba(9,9,15,0.96)",
        border:         "1px solid rgba(255,255,255,0.1)",
        backdropFilter: "blur(24px)",
        boxShadow:      "0 8px 40px rgba(0,0,0,0.65), 0 0 0 1px rgba(0,196,212,0.06)",
        height:         "56px",
        minWidth:       "300px",
        maxWidth:       "95vw",
      }}
    >
      {NAV_ITEMS.map((item, idx) => {
        const Icon = item.icon;
        const isActive = activeIndex === idx;

        return (
          <motion.div key={item.label} whileTap={{ scale: 0.94 }} style={{ display: "flex" }}>
            <Link
              href={item.href}
              onClick={() => setActiveIndex(idx)}
              aria-label={item.label}
              style={{
                display:        "inline-flex",
                alignItems:     "center",
                padding:        "0 12px",
                borderRadius:   "999px",
                height:         "42px",
                minWidth:       "44px",
                background:     isActive ? "rgba(0,196,212,0.13)" : "transparent",
                color:          isActive ? "#00C4D4"              : "#6B7280",
                textDecoration: "none",
                cursor:         "pointer",
                outline:        "none",
                border:         isActive ? "1px solid rgba(0,196,212,0.22)" : "1px solid transparent",
                transition:     "background .2s, color .2s, border-color .2s",
                flexShrink:     0,
              }}
            >
              <Icon size={20} strokeWidth={2} aria-hidden />

              <motion.span
                initial={false}
                animate={{
                  width:      isActive ? `${LABEL_WIDTH}px` : "0px",
                  opacity:    isActive ? 1 : 0,
                  marginLeft: isActive ? "6px" : "0px",
                }}
                transition={{
                  width:      { type: "spring", stiffness: 350, damping: 32 },
                  opacity:    { duration: 0.18 },
                  marginLeft: { duration: 0.18 },
                }}
                style={{
                  overflow:      "hidden",
                  display:       "inline-block",
                  whiteSpace:    "nowrap",
                  fontSize:      "0.66rem",
                  fontWeight:    700,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  lineHeight:    1,
                  userSelect:    "none",
                }}
              >
                {item.label}
              </motion.span>
            </Link>
          </motion.div>
        );
      })}
    </motion.nav>
  );
}

export default BottomNavBar;
