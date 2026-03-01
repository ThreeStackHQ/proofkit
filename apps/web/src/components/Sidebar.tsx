"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Megaphone,
  Zap,
  Settings,
  ChevronDown,
  LogOut,
  Plus,
} from "lucide-react";
import { useWorkspace } from "@/context/workspace";
import { useState } from "react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/campaigns", label: "Campaigns", icon: Megaphone },
  { href: "/events", label: "Events", icon: Zap },
  { href: "/settings", label: "Settings", icon: Settings },
];

interface SidebarProps {
  userEmail: string | null | undefined;
}

export function Sidebar({ userEmail }: SidebarProps) {
  const pathname = usePathname();
  const { workspaceId, workspace, workspaces, setWorkspaceId, isLoading } = useWorkspace();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <aside className="w-64 bg-[#0f1117] border-r border-gray-800 flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <span className="text-xl">⚡</span>
          <span className="text-lg font-bold text-green-400 tracking-tight">ProofKit</span>
        </div>
      </div>

      {/* Workspace Selector */}
      <div className="px-3 py-3 border-b border-gray-800">
        {isLoading ? (
          <div className="h-9 bg-gray-800 rounded-lg animate-pulse" />
        ) : workspaces.length === 0 ? (
          <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-800 text-gray-400 text-sm hover:bg-gray-700 transition">
            <Plus className="w-4 h-4" />
            <span>Create workspace</span>
          </button>
        ) : (
          <div className="relative">
            <button
              onClick={() => setDropdownOpen((o) => !o)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition text-sm"
            >
              <span className="text-white font-medium truncate">
                {workspace?.name ?? "Select workspace"}
              </span>
              <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0 ml-2" />
            </button>

            {dropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50 overflow-hidden">
                {workspaces.map((ws) => (
                  <button
                    key={ws.id}
                    onClick={() => {
                      setWorkspaceId(ws.id);
                      setDropdownOpen(false);
                    }}
                    className={cn(
                      "w-full text-left px-3 py-2 text-sm transition",
                      ws.id === workspaceId
                        ? "bg-green-500/10 text-green-400"
                        : "text-gray-300 hover:bg-gray-700"
                    )}
                  >
                    {ws.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-green-500/10 text-green-400"
                  : "text-gray-400 hover:text-white hover:bg-gray-800"
              )}
            >
              <Icon
                className={cn("w-4 h-4 flex-shrink-0", isActive ? "text-green-400" : "text-gray-500")}
              />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-gray-800 space-y-2">
        <div className="px-3 py-1">
          <p className="text-xs text-gray-500 truncate">{userEmail}</p>
        </div>
        <button
          onClick={() => void signOut({ callbackUrl: "/login" })}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-gray-800 transition"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
