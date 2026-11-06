import Image from "next/image";
import Link from "next/link";

export default function ProductCard({ product }) {
  return (
    <Link href={`/product/${product.slug}`} className="product-card">
      <div className="product-card-img-wrap">
        <Image
          src={product.image_url}
          alt={product.name}
          className="product-card-img"
          fill
          sizes="(max-width: 700px) 50vw, (max-width: 1100px) 33vw, 25vw"
          loading="lazy"
        />
        {product.compare_at_price && product.compare_at_price > product.price && (
          <span className="product-card-badge">SALE</span>
        )}
      </div>
      <div className="product-card-body">
        <div className="product-card-cat">{product.category?.name}</div>
        <div className="product-card-name">{product.name}</div>
        <div className="product-card-price">
          <span>₹{Number(product.price).toFixed(2)}</span>
          {product.compare_at_price && product.compare_at_price > product.price && (
            <span className="product-card-strike">₹{Number(product.compare_at_price).toFixed(2)}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
