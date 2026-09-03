import { notFound } from "next/navigation";
import { listCategoriesAdmin, getProductAdmin, updateProduct } from "@/lib/actions/admin-products";
import ProductForm from "../../product-form";

export const metadata = { title: "Edit Product — SNAR Admin" };

export default async function EditProductPage({ params }) {
  const { id } = await params;
  const [categories, product] = await Promise.all([
    listCategoriesAdmin(),
    getProductAdmin(id),
  ]);

  if (!product) notFound();

  return (
    <div className="shop-page">
      <div className="shop-header">
        <div className="shop-eyebrow">Admin</div>
        <h1 className="shop-title">Edit Product</h1>
      </div>
      <ProductForm action={updateProduct} categories={categories} product={product} />
    </div>
  );
}
