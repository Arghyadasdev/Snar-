import Link from "next/link";
import { listExpenseCategoriesAdmin, deleteExpenseCategory } from "@/lib/actions/expense-categories";

export const metadata = { title: "Admin · Expense Categories — SNAR" };

export default async function ExpenseCategoriesPage() {
  const categories = await listExpenseCategoriesAdmin();

  return (
    <div className="shop-page">
      <div className="shop-header admin-header-row">
        <div>
          <div className="shop-eyebrow">Admin · Expenses</div>
          <h1 className="shop-title">Categories</h1>
        </div>
        <Link href="/admin/expense-categories/new" className="btn-primary">NEW CATEGORY</Link>
      </div>

      <div className="admin-table">
        {categories.length === 0 && <p className="empty-state">No categories yet.</p>}
        {categories.map((c) => (
          <div key={c.id} className="admin-table-row admin-table-row-cat">
            <div className="admin-table-name">
              {c.name}
              {!c.is_active && <span className="order-status order-status-cancelled" style={{ marginLeft: ".5rem" }}>inactive</span>}
            </div>
            <div />
            <div className="admin-table-actions">
              <Link href={`/admin/expense-categories/${c.id}/edit`}>Edit</Link>
              <form action={deleteExpenseCategory}>
                <input type="hidden" name="id" value={c.id} />
                <button type="submit" className="admin-delete-btn">Delete</button>
              </form>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
