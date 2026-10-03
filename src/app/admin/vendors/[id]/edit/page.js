import { notFound } from "next/navigation";
import { getVendorAdmin, updateVendor } from "@/lib/actions/vendors";
import VendorForm from "../../vendor-form";

export const metadata = { title: "Edit Vendor — SNAR Admin" };

export default async function EditVendorPage({ params }) {
  const { id } = await params;
  const vendor = await getVendorAdmin(id);
  if (!vendor) notFound();

  return (
    <div className="shop-page">
      <div className="shop-header">
        <div className="shop-eyebrow">Admin</div>
        <h1 className="shop-title">Edit Vendor</h1>
      </div>
      <VendorForm action={updateVendor} vendor={vendor} />
    </div>
  );
}
