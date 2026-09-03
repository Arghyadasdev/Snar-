export const ADMIN_NAV = [
  { label: "Dashboard", href: "/admin", icon: "grid" },
  { label: "Orders", href: "/admin/orders", icon: "bag" },
  { label: "Products", href: "/admin/products", icon: "tag" },
  { label: "Categories", href: "/admin/categories", icon: "grid2" },
  { label: "Customers", href: "/admin/customers", icon: "users" },
  { label: "Homepage", href: "/admin/homepage", icon: "image" },
  { label: "Testimonials", href: "/admin/testimonials", icon: "star" },
  { label: "Coupons", href: "/admin/coupons", icon: "discount" },
  { label: "FAQs", href: "/admin/faqs", icon: "help" },
  { label: "Settings", href: "/admin/settings", icon: "settings" },
];

export function titleForPath(pathname) {
  const match = [...ADMIN_NAV].reverse().find((item) =>
    item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href)
  );
  return match?.label || "Dashboard";
}
