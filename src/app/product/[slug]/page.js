import { notFound } from "next/navigation";
import { getProductBySlug, getProductImages } from "@/lib/data/products";
import { getSiteSettings } from "@/lib/data/site-settings";
import ProductActions from "./product-actions";
import ProductGalleryView from "./product-gallery-view";

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

  return (
    <div className="shop-page">
      <div className="product-detail-grid">
        <ProductGalleryView images={images} productName={product.name} />

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
