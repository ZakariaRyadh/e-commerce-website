import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AdminSidebar } from "@/components/AdminSidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") redirect("/login");

  return (
    <div className="flex min-h-screen bg-[#f8f8f7]">
      <AdminSidebar />
      <main className="flex-1 pt-20 lg:pt-8 px-5 sm:px-8 pb-8 overflow-x-hidden min-w-0 lg:ml-60">{children}</main>
    </div>
  );
}
