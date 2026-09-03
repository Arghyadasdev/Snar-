import Link from "next/link";
import { listAllCategoriesAdmin, deleteCategory } from "@/lib/actions/admin-categories";

export const metadata = { title: "Admin · Categories — SNAR" };

export default async function AdminCategoriesPage() {
  const categories = await listAllCategoriesAdmin();

  return (
    <div className="shop-page">
      <div className="shop-header admin-header-row">
        <div>
          <div className="shop-eyebrow">Admin</div>
          <h1 className="shop-title">Categories</h1>
        </div>
        <Link href="/admin/categories/new" className="btn-primary">NEW CATEGORY</Link>
      </div>

      <div className="admin-table">
        {categories.map((c) => (
          <div key={c.id} className="admin-table-row admin-table-row-cat">
            <div className="admin-table-name">{c.name}</div>
            <div className="admin-table-cat">{c.parent ? `under ${c.parent.name}` : "top-level"}</div>
            <div className="admin-table-actions">
              <Link href={`/admin/categories/${c.id}/edit`}>Edit</Link>
              <form action={deleteCategory}>
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
