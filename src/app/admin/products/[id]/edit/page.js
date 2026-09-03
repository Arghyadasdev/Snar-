import { notFound } from "next/navigation";
import { listCategoriesAdmin, getProductAdmin, updateProduct } from "@/lib/actions/admin-products";
import { listProductImagesAdmin } from "@/lib/actions/admin-product-images";
import ProductForm from "../../product-form";
import ProductGallery from "../../product-gallery";

export const metadata = { title: "Edit Product — SNAR Admin" };

export default async function EditProductPage({ params }) {
  const { id } = await params;
  const [categories, product, images] = await Promise.all([
    listCategoriesAdmin(),
    getProductAdmin(id),
    listProductImagesAdmin(id),
  ]);

  if (!product) notFound();

  return (
    <div className="shop-page">
      <div className="shop-header">
        <div className="shop-eyebrow">Admin</div>
        <h1 className="shop-title">Edit Product</h1>
      </div>
      <ProductForm action={updateProduct} categories={categories} product={product} />
      <ProductGallery productId={product.id} images={images} />
    </div>
  );
}
