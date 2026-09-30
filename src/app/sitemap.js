import { listAllProducts, listCategories } from "@/lib/data/products";

const STATIC_PATHS = ["", "/collections", "/men", "/women", "/accessories", "/about", "/help", "/search"];

export default async function sitemap() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const [products, categories] = await Promise.all([listAllProducts(), listCategories()]);

  const staticEntries = STATIC_PATHS.map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: path === "" ? 1 : 0.6,
  }));

  const categoryEntries = categories.map((c) => ({
    url: `${baseUrl}/category/${c.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const productEntries = products.map((p) => ({
    url: `${baseUrl}/product/${p.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticEntries, ...categoryEntries, ...productEntries];
}
