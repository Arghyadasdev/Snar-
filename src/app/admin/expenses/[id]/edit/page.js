import { notFound } from "next/navigation";
import { getExpenseAdmin, updateExpense } from "@/lib/actions/expenses";
import { listExpenseCategoriesAdmin } from "@/lib/actions/expense-categories";
import { listVendorsAdmin } from "@/lib/actions/vendors";
import ExpenseForm from "../../expense-form";

export const metadata = { title: "Edit Expense — SNAR Admin" };

export default async function EditExpensePage({ params }) {
  const { id } = await params;
  const [expense, categories, vendors] = await Promise.all([
    getExpenseAdmin(id),
    listExpenseCategoriesAdmin(),
    listVendorsAdmin(),
  ]);
  if (!expense) notFound();

  return (
    <div className="shop-page">
      <div className="shop-header">
        <div className="shop-eyebrow">Admin</div>
        <h1 className="shop-title">Edit Expense</h1>
      </div>
      <ExpenseForm action={updateExpense} categories={categories} vendors={vendors} expense={expense} />
    </div>
  );
}
