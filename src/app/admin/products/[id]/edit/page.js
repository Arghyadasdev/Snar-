import { notFound } from "next/navigation";
import { listCategoriesAdmin, getProductAdmin, updateProduct } from "@/lib/actions/admin-products";
import { listProductImagesAdmin } from "@/lib/actions/admin-product-images";
import { listVariantsAdmin } from "@/lib/actions/admin-variants";
import ProductForm from "../../product-form";
import ProductGallery from "../../product-gallery";
import ProductVariants from "../../product-variants";

export const metadata = { title: "Edit Product — SNAR Admin" };

export default async function EditProductPage({ params }) {
  const { id } = await params;
  const [categories, product, images, variants] = await Promise.all([
    listCategoriesAdmin(),
    getProductAdmin(id),
    listProductImagesAdmin(id),
    listVariantsAdmin(id),
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
      <ProductVariants productId={product.id} variants={variants} />
    </div>
  );
}
