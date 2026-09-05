import { notFound } from "next/navigation";
import { getProductBySlug, getProductImages, getProductReviews, getProductVariants } from "@/lib/data/products";
import { getSiteSettings } from "@/lib/data/site-settings";
import { getMyReview } from "@/lib/actions/reviews";
import { getCurrentUser } from "@/lib/auth/dal";
import ProductDetailClient from "./product-detail-client";
import ReviewForm from "./review-form";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  return { title: product ? `${product.name} — SNAR` : "Product — SNAR" };
}

export default async function ProductPage({ params }) {
  const { slug } = await params;
  const [product, settings] = await Promise.all([getProductBySlug(slug), getSiteSettings()]);
  if (!product) notFound();

  const [allImages, variants, { reviews, average, count }, user] = await Promise.all([
    getProductImages(product.id),
    getProductVariants(product.id),
    getProductReviews(product.id),
    getCurrentUser(),
  ]);
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
    <div className="shop-page">
      <ProductDetailClient
        product={product}
        variants={variants}
        baseImages={baseImages}
        imagesByVariant={imagesByVariant}
        sizes={sizes}
        whatsappNumber={settings.whatsapp_number}
        rating={{ average, count }}
      />

      {specs.length > 0 && (
        <div className="product-detail-specs" style={{ marginTop: "3rem", maxWidth: "700px" }}>
          <h2 className="shop-title" style={{ fontSize: "1.4rem", marginBottom: "1rem" }}>Product Details</h2>
          <div className="admin-table">
            {specs.map((s, i) => (
              <div key={i} className="admin-table-row admin-table-row-cat">
                <div className="admin-table-name">{s.label}</div>
                <div className="admin-table-cat">{s.value}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="product-detail-reviews" style={{ marginTop: "3rem", maxWidth: "700px" }}>
        <h2 className="shop-title" style={{ fontSize: "1.4rem", marginBottom: "1rem" }}>
          Ratings & Reviews {count > 0 && `(${count})`}
        </h2>

        {reviews.map((r) => (
          <div key={r.id} className="auth-card" style={{ marginBottom: "1rem" }}>
            <div style={{ color: "#ffb300" }}>{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</div>
            <div style={{ fontWeight: 600, marginTop: ".3rem" }}>{r.customer_name}</div>
            {r.review_text && <p style={{ marginTop: ".3rem", color: "var(--muted, #ccc)" }}>{r.review_text}</p>}
          </div>
        ))}
        {reviews.length === 0 && <p style={{ color: "var(--muted, #999)" }}>No reviews yet. Be the first to review this product.</p>}

        <ReviewForm productId={product.id} slug={product.slug} existing={myReview} />
      </div>
    </div>
  );
}
