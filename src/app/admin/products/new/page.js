import { listCategoriesAdmin, createProduct } from "@/lib/actions/admin-products";
import ProductForm from "../product-form";

export const metadata = { title: "New Product — SNAR Admin" };

export default async function NewProductPage() {
  const categories = await listCategoriesAdmin();

  return (
    <div className="shop-page">
      <div className="shop-header">
        <div className="shop-eyebrow">Admin</div>
        <h1 className="shop-title">New Product</h1>
      </div>
      <ProductForm action={createProduct} categories={categories} />
    </div>
  );
}
