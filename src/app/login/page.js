import LoginForm from "./login-form";

export const metadata = { title: "Log In — SNAR" };

export default async function LoginPage({ searchParams }) {
  const params = await searchParams;
  const next = params?.next || "/";
  return <LoginForm next={next} />;
}
