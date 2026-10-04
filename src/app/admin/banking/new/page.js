import { createBankAccount } from "@/lib/actions/banking";
import BankAccountForm from "../account-form";

export const metadata = { title: "New Bank Account — SNAR Admin" };

export default function NewBankAccountPage() {
  return (
    <div className="shop-page">
      <div className="shop-header">
        <div className="shop-eyebrow">Admin</div>
        <h1 className="shop-title">New Account</h1>
      </div>
      <BankAccountForm action={createBankAccount} />
    </div>
  );
}
