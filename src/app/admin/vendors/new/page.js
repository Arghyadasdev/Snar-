import { createVendor } from "@/lib/actions/vendors";
import VendorForm from "../vendor-form";

export const metadata = { title: "New Vendor — SNAR Admin" };

export default function NewVendorPage() {
  return (
    <div className="shop-page">
      <div className="shop-header">
        <div className="shop-eyebrow">Admin</div>
        <h1 className="shop-title">New Vendor</h1>
      </div>
      <VendorForm action={createVendor} />
    </div>
  );
}
