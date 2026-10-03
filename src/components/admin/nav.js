export const ADMIN_NAV = [
  { label: "Dashboard", href: "/admin", icon: "grid", section: "Overview" },
  { label: "Orders", href: "/admin/orders", icon: "bag", section: "Sales" },
  { label: "Invoices", href: "/admin/invoices", icon: "invoice", section: "Sales" },
  { label: "Returns", href: "/admin/returns", icon: "bag", section: "Sales" },
  { label: "Coupons", href: "/admin/coupons", icon: "discount", section: "Sales" },
  { label: "Products", href: "/admin/products", icon: "tag", section: "Catalog" },
  { label: "Categories", href: "/admin/categories", icon: "grid2", section: "Catalog" },
  { label: "Inventory", href: "/admin/inventory", icon: "bag", section: "Catalog" },
  { label: "SKU", href: "/admin/sku", icon: "tag", section: "Catalog" },
  { label: "Warehouses", href: "/admin/warehouses", icon: "warehouse", section: "Catalog" },
  { label: "Expenses", href: "/admin/expenses", icon: "expense", section: "Expenses" },
  { label: "Recurring", href: "/admin/recurring-expenses", icon: "activity", section: "Expenses" },
  { label: "Vendors", href: "/admin/vendors", icon: "leads", section: "Expenses" },
  { label: "Categories", href: "/admin/expense-categories", icon: "grid2", section: "Expenses" },
  { label: "Customers", href: "/admin/customers", icon: "users", section: "CRM" },
  { label: "Leads", href: "/admin/leads", icon: "leads", section: "CRM" },
  { label: "Homepage", href: "/admin/homepage", icon: "image", section: "Content" },
  { label: "Testimonials", href: "/admin/testimonials", icon: "star", section: "Content" },
  { label: "Reviews", href: "/admin/reviews", icon: "star", section: "Content" },
  { label: "FAQs", href: "/admin/faqs", icon: "help", section: "Content" },
  { label: "Activity Log", href: "/admin/activity", icon: "activity", section: "System" },
  { label: "Settings", href: "/admin/settings", icon: "settings", section: "System" },
];

export function titleForPath(pathname) {
  const match = [...ADMIN_NAV].reverse().find((item) =>
    item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href)
  );
  return match?.label || "Dashboard";
}
