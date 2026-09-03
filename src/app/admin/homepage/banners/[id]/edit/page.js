import { notFound } from "next/navigation";
import { getBannerAdmin, updateBanner } from "@/lib/actions/admin-homepage";
import BannerForm from "../../../banner-form";

export const metadata = { title: "Edit Banner — SNAR Admin" };

export default async function EditBannerPage({ params }) {
  const { id } = await params;
  const banner = await getBannerAdmin(id);
  if (!banner) notFound();

  return (
    <div className="shop-page">
      <div className="shop-header">
        <div className="shop-eyebrow">Admin · Homepage</div>
        <h1 className="shop-title">Edit Banner</h1>
      </div>
      <BannerForm action={updateBanner} banner={banner} />
    </div>
  );
}
