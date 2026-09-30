import { requireUser } from "@/lib/auth/dal";
import { listWishlist } from "@/lib/actions/wishlist";
import ProductGrid from "@/components/ProductGrid";

export const metadata = { title: "My Wishlist — SNAR" };

export default async function WishlistPage() {
  await requireUser("/account/wishlist");
  const products = await listWishlist();

  return (
    <div className="shop-page">
      <div className="shop-header">
        <div className="shop-eyebrow">My Account</div>
        <h1 className="shop-title">Wishlist</h1>
      </div>

      <ProductGrid products={products} emptyMessage="Your wishlist is empty. Tap the heart on any product to save it here." />
    </div>
  );
}
