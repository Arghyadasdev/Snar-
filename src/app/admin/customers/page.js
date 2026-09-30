import { listCustomersAdmin } from "@/lib/actions/admin-customers";
import { listTagsAdmin } from "@/lib/actions/admin-tags";
import { getCurrentUser } from "@/lib/auth/dal";
import CustomerFilters from "./customer-filters";
import CustomerTable from "./customer-table";

export const metadata = { title: "Admin · Customers — SNAR" };

export default async function AdminCustomersPage({ searchParams }) {
  const params = await searchParams;
  const query = params?.q || "";
  const status = params?.status || "";
  const segment = params?.segment || "";
  const [customers, currentUser, allTags] = await Promise.all([
    listCustomersAdmin(query, status, segment),
    getCurrentUser(),
    listTagsAdmin(),
  ]);

  const filterQuery = `q=${encodeURIComponent(query)}&status=${encodeURIComponent(status)}&segment=${encodeURIComponent(segment)}`;

  return (
    <div className="shop-page">
      <div className="shop-header">
        <div className="shop-eyebrow">Admin</div>
        <h1 className="shop-title">Customers</h1>
      </div>

      <CustomerFilters query={query} status={status} segment={segment} />

      <CustomerTable customers={customers} allTags={allTags} currentUserId={currentUser?.id} filterQuery={filterQuery} />
    </div>
  );
}
