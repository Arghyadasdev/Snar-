import SignupForm from "./signup-form";

export const metadata = { title: "Sign Up — SNAR" };

export default async function SignupPage({ searchParams }) {
  const params = await searchParams;
  const next = params?.next || "/";
  return <SignupForm next={next} />;
}
