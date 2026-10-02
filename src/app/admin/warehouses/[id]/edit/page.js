import { notFound } from "next/navigation";
import { getWarehouseAdmin, updateWarehouse } from "@/lib/actions/admin-warehouses";
import WarehouseForm from "../../warehouse-form";

export const metadata = { title: "Edit Warehouse — SNAR Admin" };

export default async function EditWarehousePage({ params }) {
  const { id } = await params;
  const warehouse = await getWarehouseAdmin(id);
  if (!warehouse) notFound();

  return (
    <div className="shop-page">
      <div className="shop-header">
        <div className="shop-eyebrow">Admin</div>
        <h1 className="shop-title">Edit Warehouse</h1>
      </div>
      <WarehouseForm action={updateWarehouse} warehouse={warehouse} />
    </div>
  );
}
