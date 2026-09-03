"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import ChatBot from "@/components/ui/chat-bot";

export default function SiteChrome({ isLoggedIn, cartCount, settings, children }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  if (isAdmin) return children;

  return (
    <>
      <Navbar isLoggedIn={isLoggedIn} cartCount={cartCount} settings={settings} />
      {children}
      <ChatBot />
    </>
  );
}
