import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getProductBySlug,
  getProductImages,
  getProductReviews,
  getProductVariants,
  getRelatedProducts,
} from "@/lib/data/products";
import { getSiteSettings } from "@/lib/data/site-settings";
import { getMyReview } from "@/lib/actions/reviews";
import { getCurrentUser } from "@/lib/auth/dal";
import ProductCard from "@/components/ProductCard";
import ProductDetailClient from "./product-detail-client";
import ReviewForm from "./review-form";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  return { title: product ? `${product.name} — SNAR` : "Product — SNAR" };
}

function timeAgo(dateStr) {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diffMs / 86400000);
  if (days < 1) return "Today";
  if (days < 30) return `${days} day${days === 1 ? "" : "s"} ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months === 1 ? "" : "s"} ago`;
  const years = Math.floor(months / 12);
  return `${years} year${years === 1 ? "" : "s"} ago`;
}

export default async function ProductPage({ params }) {
  const { slug } = await params;
  const [product, settings] = await Promise.all([getProductBySlug(slug), getSiteSettings()]);
  if (!product) notFound();

  const [allImages, variants, reviewData, user, relatedProducts] = await Promise.all([
    getProductImages(product.id),
    getProductVariants(product.id),
    getProductReviews(product.id),
    getCurrentUser(),
    getRelatedProducts(product.category_id, product.id),
  ]);
  const { reviews, average, count, breakdown } = reviewData;
  const myReview = user ? await getMyReview(product.id) : null;

  const baseImages = allImages.filter((i) => !i.variant_id).map((i) => i.image_url);
  const imagesByVariant = {};
  for (const img of allImages) {
    if (!img.variant_id) continue;
    (imagesByVariant[img.variant_id] ||= []).push(img.image_url);
  }

  const sizes = Array.isArray(product.sizes) ? product.sizes : [];
  const specs = Array.isArray(product.specifications) ? product.specifications : [];

  return (
    <>
      <div className="shop-page">
        <div className="pd2-breadcrumb">
          <Link href="/">Home</Link>
          {product.category?.slug && (
            <>
              {" / "}
              <Link href={`/collections/${product.category.slug}`}>{product.category.name}</Link>
            </>
          )}
          {" / "}
          <span>{product.name}</span>
        </div>

        <ProductDetailClient
          product={product}
          variants={variants}
          baseImages={baseImages}
          imagesByVariant={imagesByVariant}
          sizes={sizes}
          whatsappNumber={settings.whatsapp_number}
          rating={{ average, count }}
          specs={specs}
          freeShippingThreshold={settings.free_shipping_threshold}
        />
      </div>

      <div id="reviews" className="pd2-reviews-band">
        <div className="shop-page" style={{ paddingTop: 0, paddingBottom: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
            <h2 className="shop-title" style={{ fontSize: "1.4rem" }}>Customer Reviews</h2>
            <a href="#write-review" className="btn-outline" style={{ borderColor: "var(--ac)", color: "var(--ac)" }}>Write a Review</a>
          </div>

          {count > 0 && (
            <div className="pd2-reviews-summary">
              <div style={{ textAlign: "center" }}>
                <div className="pd2-reviews-avg">{average.toFixed(1)}</div>
                <div style={{ color: "#FFB300" }}>{"★".repeat(Math.round(average))}{"☆".repeat(5 - Math.round(average))}</div>
                <div style={{ color: "var(--muted)", fontSize: ".78rem", marginTop: ".2rem" }}>Based on {count} reviews</div>
              </div>
              <div className="pd2-rbars">
                {breakdown.map((b) => (
                  <div key={b.star} className="pd2-rbar-row">
                    <span>{b.star} ★</span>
                    <div className="pd2-rbar-track">
                      <div className="pd2-rbar-fill" style={{ width: `${count > 0 ? (b.count / count) * 100 : 0}%` }} />
                    </div>
                    <span>{b.count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {reviews.length > 0 && (
            <div className="pd2-review-track">
              {reviews.map((r) => (
                <div key={r.id} className="pd2-review-card">
                  <div style={{ display: "flex", alignItems: "center", gap: ".6rem" }}>
                    <div className="pd2-review-avatar">{r.customer_name.charAt(0).toUpperCase()}</div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: ".85rem" }}>{r.customer_name}</div>
                      <div style={{ color: "var(--muted)", fontSize: ".68rem" }}>{timeAgo(r.created_at)}</div>
                    </div>
                  </div>
                  <div style={{ color: "#FFB300", margin: ".5rem 0 .3rem" }}>{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</div>
                  {r.review_text && <p style={{ fontSize: ".82rem", color: "var(--off)", lineHeight: 1.5 }}>{r.review_text}</p>}
                </div>
              ))}
            </div>
          )}
          {reviews.length === 0 && <p style={{ color: "var(--muted, #999)", marginTop: "1rem" }}>No reviews yet. Be the first to review this product.</p>}

          <div id="write-review">
            <ReviewForm productId={product.id} slug={product.slug} existing={myReview} />
          </div>
        </div>
      </div>

      {relatedProducts.length > 0 && (
        <div className="shop-page" style={{ paddingTop: "2.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2 className="shop-title" style={{ fontSize: "1.4rem" }}>You May Also Like</h2>
          </div>
          <div className="pd2-related-track">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </>
  );
}
