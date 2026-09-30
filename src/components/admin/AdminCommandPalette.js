"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { globalAdminSearch } from "@/lib/actions/admin-search";

const EMPTY_RESULTS = { orders: [], customers: [], products: [] };

export default function AdminCommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState(EMPTY_RESULTS);
  const inputRef = useRef(null);
  const router = useRouter();

  function closePalette() {
    setOpen(false);
    setQuery("");
    setResults(EMPTY_RESULTS);
  }

  useEffect(() => {
    function onKeyDown(e) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((o) => {
          if (o) closePalette();
          return !o;
        });
      }
      if (e.key === "Escape") closePalette();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 10);
  }, [open]);

  useEffect(() => {
    if (!query.trim()) return;
    const timer = setTimeout(() => {
      globalAdminSearch(query).then(setResults);
    }, 200);
    return () => clearTimeout(timer);
  }, [query]);

  function handleQueryChange(e) {
    const value = e.target.value;
    setQuery(value);
    if (!value.trim()) setResults(EMPTY_RESULTS);
  }

  function go(href) {
    closePalette();
    router.push(href);
  }

  const hasResults = results.orders.length || results.customers.length || results.products.length;

  return (
    <>
      <button type="button" className="admin-search-trigger" onClick={() => setOpen(true)} aria-label="Search">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <span>Search…</span>
        <kbd>Ctrl K</kbd>
      </button>

      {open && (
        <div className="admin-palette-overlay" onClick={closePalette}>
          <div className="admin-palette" onClick={(e) => e.stopPropagation()}>
            <input
              ref={inputRef}
              className="admin-palette-input"
              placeholder="Search orders, customers, products…"
              value={query}
              onChange={handleQueryChange}
            />

            <div className="admin-palette-results">
              {!query.trim() && <p className="admin-palette-hint">Type to search across orders, customers, and products.</p>}
              {query.trim() && !hasResults && <p className="admin-palette-hint">No results.</p>}

              {results.orders.length > 0 && (
                <div className="admin-palette-group">
                  <div className="admin-palette-group-label">Orders</div>
                  {results.orders.map((o) => (
                    <button key={o.id} className="admin-palette-row" onClick={() => go(`/admin/orders/${o.id}`)}>
                      <span>{o.shipping_name}</span>
                      <span className="admin-palette-row-meta">₹{Number(o.total).toFixed(2)} · {o.status}</span>
                    </button>
                  ))}
                </div>
              )}

              {results.customers.length > 0 && (
                <div className="admin-palette-group">
                  <div className="admin-palette-group-label">Customers</div>
                  {results.customers.map((c) => (
                    <button key={c.id} className="admin-palette-row" onClick={() => go(`/admin/customers/${c.id}`)}>
                      <span>{c.full_name || "—"}</span>
                      <span className="admin-palette-row-meta">{c.email}</span>
                    </button>
                  ))}
                </div>
              )}

              {results.products.length > 0 && (
                <div className="admin-palette-group">
                  <div className="admin-palette-group-label">Products</div>
                  {results.products.map((p) => (
                    <button key={p.id} className="admin-palette-row" onClick={() => go(`/admin/products/${p.id}/edit`)}>
                      <span>{p.name}</span>
                      <span className="admin-palette-row-meta">₹{Number(p.price).toFixed(2)}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
