import { createBanner } from "@/lib/actions/admin-homepage";
import BannerForm from "../../banner-form";

export const metadata = { title: "New Banner — SNAR Admin" };

export default function NewBannerPage() {
  return (
    <div className="shop-page">
      <div className="shop-header">
        <div className="shop-eyebrow">Admin · Homepage</div>
        <h1 className="shop-title">New Banner</h1>
      </div>
      <BannerForm action={createBanner} />
    </div>
  );
}
