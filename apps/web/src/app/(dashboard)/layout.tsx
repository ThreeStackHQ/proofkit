import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="min-h-screen bg-gray-950 flex">
      <aside className="w-56 bg-gray-900 border-r border-gray-800 flex flex-col p-4">
        <div className="text-xl font-bold text-orange-500 mb-8">⚡ ProofKit</div>
        <nav className="space-y-1 flex-1">
          {[
            { href: "/dashboard", label: "Overview", icon: "📊" },
            { href: "/campaigns", label: "Campaigns", icon: "📢" },
            { href: "/events", label: "Events", icon: "⚡" },
            { href: "/settings", label: "Settings", icon: "⚙️" },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition text-sm"
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="pt-4 border-t border-gray-800 text-xs text-gray-500">
          {session.user.email}
        </div>
      </aside>
      <main className="flex-1 p-8 overflow-auto">{children}</main>
    </div>
  );
}
