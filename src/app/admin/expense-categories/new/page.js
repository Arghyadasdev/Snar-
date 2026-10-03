import { createExpenseCategory } from "@/lib/actions/expense-categories";
import ExpenseCategoryForm from "../category-form";

export const metadata = { title: "New Expense Category — SNAR Admin" };

export default function NewExpenseCategoryPage() {
  return (
    <div className="shop-page">
      <div className="shop-header">
        <div className="shop-eyebrow">Admin</div>
        <h1 className="shop-title">New Expense Category</h1>
      </div>
      <ExpenseCategoryForm action={createExpenseCategory} />
    </div>
  );
}
