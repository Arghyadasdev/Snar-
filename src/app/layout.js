import "./globals.css";

export const metadata = {
  title: "SNAR — Ignite Your Edge",
  description: "Premium sportswear engineered for performance. Designed for champions.",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
};

import SiteChrome from "@/components/SiteChrome";
import { getCurrentUser } from "@/lib/auth/dal";
import { getCartCount } from "@/lib/data/cart";
import { getSiteSettings } from "@/lib/data/site-settings";

export default async function RootLayout({ children }) {
  const [user, settings] = await Promise.all([getCurrentUser(), getSiteSettings()]);
  const cartCount = user ? await getCartCount() : 0;

  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <SiteChrome isLoggedIn={!!user} cartCount={cartCount} settings={settings}>
          {children}
        </SiteChrome>
      </body>
    </html>
  );
}
