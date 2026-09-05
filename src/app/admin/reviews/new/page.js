import { addAdminReview } from "@/lib/actions/admin-reviews";
import { listAllProductsAdmin } from "@/lib/actions/admin-products";
import ReviewAdminForm from "./review-admin-form";

export const metadata = { title: "Add Review — SNAR Admin" };

export default async function NewReviewPage() {
  const products = await listAllProductsAdmin();

  return (
    <div className="shop-page">
      <div className="shop-header">
        <div className="shop-eyebrow">Admin</div>
        <h1 className="shop-title">Add Review</h1>
      </div>
      <ReviewAdminForm action={addAdminReview} products={products} />
    </div>
  );
}
