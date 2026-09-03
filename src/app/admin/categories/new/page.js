import { listAllCategoriesAdmin, createCategory } from "@/lib/actions/admin-categories";
import CategoryForm from "../category-form";

export const metadata = { title: "New Category — SNAR Admin" };

export default async function NewCategoryPage() {
  const categories = await listAllCategoriesAdmin();

  return (
    <div className="shop-page">
      <div className="shop-header">
        <div className="shop-eyebrow">Admin</div>
        <h1 className="shop-title">New Category</h1>
      </div>
      <CategoryForm action={createCategory} categories={categories} />
    </div>
  );
}
