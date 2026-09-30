import { searchProducts } from "@/lib/data/products";
import ProductGrid from "@/components/ProductGrid";

export const metadata = { title: "Search — SNAR" };

export default async function SearchPage({ searchParams }) {
  const params = await searchParams;
  const query = params?.q || "";
  const products = query ? await searchProducts(query) : [];

  return (
    <div className="shop-page">
      <div className="shop-header">
        <div className="shop-eyebrow">Search</div>
        <h1 className="shop-title">{query ? `Results for "${query}"` : "Search Products"}</h1>
      </div>

      <form action="/search" style={{ marginBottom: "1.4rem" }}>
        <input
          className="auth-input"
          name="q"
          defaultValue={query}
          placeholder="Search products…"
          autoFocus
          style={{ padding: ".8rem 1rem", maxWidth: "480px" }}
        />
      </form>

      {query ? (
        <ProductGrid products={products} emptyMessage={`No products match "${query}".`} />
      ) : (
        <p className="empty-state">Type something to search.</p>
      )}
    </div>
  );
}
