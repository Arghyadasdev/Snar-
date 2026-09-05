import { notFound } from "next/navigation";
import { getProductBySlug, getProductImages, getProductReviews } from "@/lib/data/products";
import { getSiteSettings } from "@/lib/data/site-settings";
import { getMyReview } from "@/lib/actions/reviews";
import { getCurrentUser } from "@/lib/auth/dal";
import ProductActions from "./product-actions";
import ProductGalleryView from "./product-gallery-view";
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

  const extraImages = await getProductImages(product.id);
  const images = [product.image_url, ...extraImages.map((i) => i.image_url)];

  const onSale = product.compare_at_price && product.compare_at_price > product.price;
  const sizes = Array.isArray(product.sizes) ? product.sizes : [];
  const specs = Array.isArray(product.specifications) ? product.specifications : [];

  const [{ reviews, average, count }, user] = await Promise.all([
    getProductReviews(product.id),
    getCurrentUser(),
  ]);
  const myReview = user ? await getMyReview(product.id) : null;

  return (
    <div className="shop-page">
      <div className="product-detail-grid">
        <ProductGalleryView images={images} productName={product.name} />

        <div className="product-detail-info">
          <div className="shop-eyebrow">{product.category?.name}</div>
          <h1 className="product-detail-name">{product.name}</h1>

          {count > 0 && (
            <div className="product-detail-rating" style={{ color: "#ffb300", margin: ".3rem 0" }}>
              {"★".repeat(Math.round(average))}
              {"☆".repeat(5 - Math.round(average))}
              <span style={{ color: "var(--muted, #999)", marginLeft: ".5rem", fontSize: ".85rem" }}>
                {average.toFixed(1)} ({count} review{count === 1 ? "" : "s"})
              </span>
            </div>
          )}

          <div className="product-detail-price">
            <span>₹{Number(product.price).toFixed(2)}</span>
            {onSale && <span className="product-card-strike">₹{Number(product.compare_at_price).toFixed(2)}</span>}
          </div>
          <p className="product-detail-desc">{product.description}</p>

          <ProductActions product={product} sizes={sizes} whatsappNumber={settings.whatsapp_number} />

          <div className="product-detail-stock">{product.stock > 0 ? "In stock" : "Out of stock"}</div>
        </div>
      </div>

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
