import { notFound } from "next/navigation";
import { listAllCategoriesAdmin, getCategoryAdmin, updateCategory } from "@/lib/actions/admin-categories";
import CategoryForm from "../../category-form";

export const metadata = { title: "Edit Category — SNAR Admin" };

export default async function EditCategoryPage({ params }) {
  const { id } = await params;
  const [categories, category] = await Promise.all([
    listAllCategoriesAdmin(),
    getCategoryAdmin(id),
  ]);

  if (!category) notFound();

  return (
    <div className="shop-page">
      <div className="shop-header">
        <div className="shop-eyebrow">Admin</div>
        <h1 className="shop-title">Edit Category</h1>
      </div>
      <CategoryForm action={updateCategory} categories={categories} category={category} />
    </div>
  );
}
