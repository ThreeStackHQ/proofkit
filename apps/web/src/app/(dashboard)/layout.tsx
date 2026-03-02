import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import { WorkspaceProvider } from "@/context/workspace";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <WorkspaceProvider>
      <div className="min-h-screen bg-[#f8fafc] flex">
        <Sidebar userEmail={session.user.email} />
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </WorkspaceProvider>
  );
}
