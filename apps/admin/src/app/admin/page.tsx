import { redirect } from "next/navigation";

/** Redirects /admin to /admin/dashboard */
export default function AdminIndexPage() {
  redirect("/dashboard");
}
