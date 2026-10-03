import { notFound } from "next/navigation";
import { getRecurringExpenseAdmin, updateRecurringExpense } from "@/lib/actions/recurring-expenses";
import { listExpenseCategoriesAdmin } from "@/lib/actions/expense-categories";
import { listVendorsAdmin } from "@/lib/actions/vendors";
import RecurringExpenseForm from "../../recurring-form";

export const metadata = { title: "Edit Recurring Expense — SNAR Admin" };

export default async function EditRecurringExpensePage({ params }) {
  const { id } = await params;
  const [recurring, categories, vendors] = await Promise.all([
    getRecurringExpenseAdmin(id),
    listExpenseCategoriesAdmin(),
    listVendorsAdmin(),
  ]);
  if (!recurring) notFound();

  return (
    <div className="shop-page">
      <div className="shop-header">
        <div className="shop-eyebrow">Admin</div>
        <h1 className="shop-title">Edit Recurring Expense</h1>
      </div>
      <RecurringExpenseForm action={updateRecurringExpense} categories={categories} vendors={vendors} recurring={recurring} />
    </div>
  );
}
