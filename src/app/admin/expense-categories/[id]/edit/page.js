import { notFound } from "next/navigation";
import { getExpenseCategoryAdmin, updateExpenseCategory } from "@/lib/actions/expense-categories";
import ExpenseCategoryForm from "../../category-form";

export const metadata = { title: "Edit Expense Category — SNAR Admin" };

export default async function EditExpenseCategoryPage({ params }) {
  const { id } = await params;
  const category = await getExpenseCategoryAdmin(id);
  if (!category) notFound();

  return (
    <div className="shop-page">
      <div className="shop-header">
        <div className="shop-eyebrow">Admin</div>
        <h1 className="shop-title">Edit Expense Category</h1>
      </div>
      <ExpenseCategoryForm action={updateExpenseCategory} category={category} />
    </div>
  );
}
