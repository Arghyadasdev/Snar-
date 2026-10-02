import { createWarehouse } from "@/lib/actions/admin-warehouses";
import WarehouseForm from "../warehouse-form";

export const metadata = { title: "New Warehouse — SNAR Admin" };

export default function NewWarehousePage() {
  return (
    <div className="shop-page">
      <div className="shop-header">
        <div className="shop-eyebrow">Admin</div>
        <h1 className="shop-title">New Warehouse</h1>
      </div>
      <WarehouseForm action={createWarehouse} />
    </div>
  );
}
