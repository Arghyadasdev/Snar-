import { notFound } from "next/navigation";
import { getLeadAdmin, updateLead, listAdminUsersForAssignment } from "@/lib/actions/admin-leads";
import LeadForm from "../../lead-form";

export const metadata = { title: "Edit Lead — SNAR Admin" };

export default async function EditLeadPage({ params }) {
  const { id } = await params;
  const [lead, admins] = await Promise.all([getLeadAdmin(id), listAdminUsersForAssignment()]);
  if (!lead) notFound();

  return (
    <div className="shop-page">
      <div className="shop-header">
        <div className="shop-eyebrow">Admin</div>
        <h1 className="shop-title">Edit Lead</h1>
      </div>
      <LeadForm action={updateLead} lead={lead} admins={admins} />
    </div>
  );
}
