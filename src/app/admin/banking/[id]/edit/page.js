import { notFound } from "next/navigation";
import { getBankAccountAdmin, updateBankAccount, deleteBankAccount } from "@/lib/actions/banking";
import BankAccountForm from "../../account-form";

export const metadata = { title: "Edit Bank Account — SNAR Admin" };

export default async function EditBankAccountPage({ params }) {
  const { id } = await params;
  const account = await getBankAccountAdmin(id);
  if (!account) notFound();

  return (
    <div className="shop-page">
      <div className="shop-header">
        <div className="shop-eyebrow">Admin</div>
        <h1 className="shop-title">Edit Account</h1>
      </div>
      <BankAccountForm action={updateBankAccount} account={account} />
      <form action={deleteBankAccount} style={{ marginTop: "1rem", maxWidth: "460px" }}>
        <input type="hidden" name="id" value={account.id} />
        <button type="submit" className="admin-delete-btn">Delete Account</button>
      </form>
    </div>
  );
}
