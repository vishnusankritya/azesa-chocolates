import { cookies } from "next/headers";
import { ADMIN_BYPASS, verifySession } from "@/lib/auth";
import AdminLogin from "@/components/admin/AdminLogin";
import AdminDashboard from "@/components/admin/AdminDashboard";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  let isAdmin = false;
  if (ADMIN_BYPASS) {
    isAdmin = true;
  } else {
    const store = await cookies();
    const token = store.get("azesa_session")?.value;
    const s = verifySession(token);
    isAdmin = Boolean(s && s.role === "admin");
  }

  return (
    <section className="bg-white min-h-screen">
      {isAdmin ? <AdminDashboard /> : <AdminLogin />}
    </section>
  );
}
