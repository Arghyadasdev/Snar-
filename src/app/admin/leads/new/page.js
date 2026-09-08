import { createLead, listAdminUsersForAssignment } from "@/lib/actions/admin-leads";
import LeadForm from "../lead-form";

export const metadata = { title: "New Lead — SNAR Admin" };

export default async function NewLeadPage() {
  const admins = await listAdminUsersForAssignment();

  return (
    <div className="shop-page">
      <div className="shop-header">
        <div className="shop-eyebrow">Admin</div>
        <h1 className="shop-title">New Lead</h1>
      </div>
      <LeadForm action={createLead} admins={admins} />
    </div>
  );
}
