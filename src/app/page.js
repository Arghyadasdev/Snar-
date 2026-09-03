import Home from "./home-client";
import { getActiveBanners, getActiveMarqueeItems } from "@/lib/data/homepage";
import { getSiteStats, getActiveTestimonials } from "@/lib/data/site-settings";
import { listAllProducts } from "@/lib/data/products";

const FALLBACK_BANNERS = [
  { eyebrow: "PREMIUM SPORTSWEAR", headline_line1: "IGNITE", headline_line2: "YOUR", accent_word: "EDGE", subtitle: "Engineered for performance. Designed for champions.", cta1_label: "SHOP NOW", cta1_href: "/collections", cta2_label: "EXPLORE COLLECTION", cta2_href: "/collections", media_type: "video", media_url: "/banner.mp4" },
  { eyebrow: "NEW COLLECTION 2026", headline_line1: "PUSH", headline_line2: "YOUR", accent_word: "LIMITS", subtitle: "Advanced fabric technology for elite performance.", cta1_label: "SHOP NOW", cta1_href: "/collections", cta2_label: "VIEW LOOKBOOK", cta2_href: "/collections", media_type: "image", media_url: "/banner_1.png" },
  { eyebrow: "UP TO 30% OFF", headline_line1: "SALE", headline_line2: "NOW", accent_word: "LIVE", subtitle: "Selected items on sale. Grab yours before they're gone.", cta1_label: "SHOP SALE", cta1_href: "/collections", cta2_label: "ALL PRODUCTS", cta2_href: "/collections", media_type: "video", media_url: "/banner_2.mp4" },
];

const FALLBACK_MARQUEE = [
  "PERFORMANCE", "ENGINEERED", "CHAMPIONS ONLY", "IGNITE YOUR EDGE",
  "PREMIUM SPORTSWEAR", "BUILT TO WIN", "PUSH YOUR LIMITS", "ELITE QUALITY",
].map((text, i) => ({ id: i, text }));

const FALLBACK_STATS = [
  { slot: "athletes", num: "10K+", label: "Athletes Trust SNAR" },
  { slot: "products", num: "50+", label: "Performance Products" },
  { slot: "rating", num: "4.9★", label: "Average Rating" },
  { slot: "satisfaction", num: "99%", label: "Satisfaction Rate" },
];

const FALLBACK_TESTIMONIALS = [
  { id: 1, quote: "SNAR's Performance Tee is unreal. Wore it through a brutal 90-minute training session and it kept me dry the entire time. The fabric feels premium without restricting movement.", name: "Rahul Sharma", role: "Professional Footballer", location: "Mumbai", initials: "RS", rating: 5, product: "Performance Tee" },
  { id: 2, quote: "Finally found sportswear that actually lives up to its claims. The Elite Tracksuit fits perfectly and the material quality is on par with international brands — at half the price.", name: "Priya Nair", role: "Marathon Runner", location: "Bangalore", initials: "PN", rating: 5, product: "Elite Tracksuit" },
  { id: 3, quote: "I've tried every major brand out there. SNAR hits different. The hoodie is warm but breathable — perfect for early morning runs when it's cold. My go-to now.", name: "Arjun Mehta", role: "CrossFit Athlete", location: "Delhi", initials: "AM", rating: 5, product: "Performance Hoodie" },
];

export default async function Page() {
  const [banners, marqueeItems, stats, testimonials, allProducts] = await Promise.all([
    getActiveBanners(),
    getActiveMarqueeItems(),
    getSiteStats(),
    getActiveTestimonials(),
    listAllProducts(),
  ]);

  return (
    <Home
      banners={banners.length > 0 ? banners : FALLBACK_BANNERS}
      marqueeItems={marqueeItems.length > 0 ? marqueeItems : FALLBACK_MARQUEE}
      stats={stats.length > 0 ? stats : FALLBACK_STATS}
      testimonials={testimonials.length > 0 ? testimonials : FALLBACK_TESTIMONIALS}
      featuredProducts={allProducts.slice(0, 8)}
    />
  );
}
