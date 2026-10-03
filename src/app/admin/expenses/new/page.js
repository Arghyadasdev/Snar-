import { createExpense } from "@/lib/actions/expenses";
import { listExpenseCategoriesAdmin } from "@/lib/actions/expense-categories";
import { listVendorsAdmin } from "@/lib/actions/vendors";
import ExpenseForm from "../expense-form";

export const metadata = { title: "Record Expense — SNAR Admin" };

export default async function NewExpensePage() {
  const [categories, vendors] = await Promise.all([listExpenseCategoriesAdmin(), listVendorsAdmin()]);

  return (
    <div className="shop-page">
      <div className="shop-header">
        <div className="shop-eyebrow">Admin</div>
        <h1 className="shop-title">Record Expense</h1>
      </div>
      <ExpenseForm action={createExpense} categories={categories} vendors={vendors} />
    </div>
  );
}
