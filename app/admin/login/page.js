import { redirect } from "next/navigation";

// Admin now signs in through the shared /login page with an admin account.
export default function AdminLoginRedirect() {
  redirect("/login?next=/admin");
}
