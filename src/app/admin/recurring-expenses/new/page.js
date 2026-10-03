import { createRecurringExpense } from "@/lib/actions/recurring-expenses";
import { listExpenseCategoriesAdmin } from "@/lib/actions/expense-categories";
import { listVendorsAdmin } from "@/lib/actions/vendors";
import RecurringExpenseForm from "../recurring-form";

export const metadata = { title: "New Recurring Expense — SNAR Admin" };

export default async function NewRecurringExpensePage() {
  const [categories, vendors] = await Promise.all([listExpenseCategoriesAdmin(), listVendorsAdmin()]);

  return (
    <div className="shop-page">
      <div className="shop-header">
        <div className="shop-eyebrow">Admin</div>
        <h1 className="shop-title">New Recurring Expense</h1>
      </div>
      <RecurringExpenseForm action={createRecurringExpense} categories={categories} vendors={vendors} />
    </div>
  );
}
