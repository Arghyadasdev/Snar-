import { notFound } from "next/navigation";
import { getProductBySlug } from "@/lib/data/products";
import { getSiteSettings } from "@/lib/data/site-settings";
import ProductActions from "./product-actions";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  return { title: product ? `${product.name} — SNAR` : "Product — SNAR" };
}

export default async function ProductPage({ params }) {
  const { slug } = await params;
  const [product, settings] = await Promise.all([getProductBySlug(slug), getSiteSettings()]);
  if (!product) notFound();

  const onSale = product.compare_at_price && product.compare_at_price > product.price;
  const sizes = Array.isArray(product.sizes) ? product.sizes : [];

  return (
    <div className="shop-page">
      <div className="product-detail-grid">
        <div className="product-detail-img-wrap">
          <img src={product.image_url} alt={product.name} className="product-detail-img" />
        </div>

        <div className="product-detail-info">
          <div className="shop-eyebrow">{product.category?.name}</div>
          <h1 className="product-detail-name">{product.name}</h1>
          <div className="product-detail-price">
            <span>₹{Number(product.price).toFixed(2)}</span>
            {onSale && <span className="product-card-strike">₹{Number(product.compare_at_price).toFixed(2)}</span>}
          </div>
          <p className="product-detail-desc">{product.description}</p>

          <ProductActions product={product} sizes={sizes} whatsappNumber={settings.whatsapp_number} />

          <div className="product-detail-stock">{product.stock > 0 ? "In stock" : "Out of stock"}</div>
        </div>
      </div>
    </div>
  );
}
