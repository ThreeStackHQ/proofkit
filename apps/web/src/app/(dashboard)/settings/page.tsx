"use client";

import { useEffect, useState, useCallback } from "react";
import { Copy, Eye, EyeOff, RefreshCw, ExternalLink, Check } from "lucide-react";
import { useWorkspace } from "@/context/workspace";
import { cn } from "@/lib/utils";

interface Stats {
  tier: string;
  monthlyLimit: number | null;
  monthlyUsagePercent: number;
  events: { thisMonth: number };
}

const PLAN_LABELS: Record<string, { name: string; price: string; events: string; campaigns: string }> = {
  free: { name: "Free", price: "$0/mo", events: "1,000 events/mo", campaigns: "1 campaign" },
  pro: { name: "Pro", price: "$5/mo", events: "50,000 events/mo", campaigns: "10 campaigns" },
  business: { name: "Business", price: "$15/mo", events: "Unlimited events", campaigns: "Unlimited campaigns" },
};

export default function SettingsPage() {
  const { workspace, workspaceId, refresh } = useWorkspace();
  const [showKey, setShowKey] = useState(false);
  const [copied, setCopied] = useState<"key" | "snippet" | null>(null);
  const [regenerating, setRegenerating] = useState(false);
  const [stats, setStats] = useState<Stats | null>(null);
  const [upgrading, setUpgrading] = useState(false);
  const [manageLoading, setManageLoading] = useState(false);

  // Fetch tier from stats endpoint
  const fetchStats = useCallback(async () => {
    if (!workspaceId) return;
    try {
      const res = await fetch(`/api/workspaces/${workspaceId}/stats`);
      if (res.ok) {
        const data = await res.json() as Stats;
        setStats(data);
      }
    } catch {
      // ignore
    }
  }, [workspaceId]);

  useEffect(() => {
    void fetchStats();
  }, [fetchStats]);

  const apiKey = workspace?.apiKey ?? "";
  const siteId = workspace?.siteId ?? "YOUR_SITE_ID";
  const maskedKey = apiKey ? `pk_live_${"•".repeat(24)}` : "—";

  const snippetCode = `<script src="https://cdn.proofkit.io/widget.js?siteId=${siteId}" defer></script>`;

  async function copyToClipboard(text: string, type: "key" | "snippet") {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      // fallback: silently fail
    }
  }

  async function handleRegenerate() {
    if (!workspaceId) return;
    const confirmed = window.confirm(
      "Regenerate your API key? Your current key will stop working immediately."
    );
    if (!confirmed) return;

    setRegenerating(true);
    try {
      const res = await fetch(`/api/workspaces/${workspaceId}/api-key`, { method: "POST" });
      if (res.ok) {
        await refresh();
        setShowKey(true);
      }
    } finally {
      setRegenerating(false);
    }
  }

  async function handleUpgrade(tier: "pro" | "business") {
    setUpgrading(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier }),
      });
      if (res.ok) {
        const data = await res.json() as { url: string };
        window.location.href = data.url;
      }
    } finally {
      setUpgrading(false);
    }
  }

  async function handleManageBilling() {
    setManageLoading(true);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      if (res.ok) {
        const data = await res.json() as { url: string };
        window.location.href = data.url;
      }
    } finally {
      setManageLoading(false);
    }
  }

  const tier = stats?.tier ?? "free";
  const plan = PLAN_LABELS[tier] ?? PLAN_LABELS.free;
  const isPaid = tier !== "free";

  return (
    <div className="p-8 max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Settings</h1>

      <div className="space-y-6">
        {/* API Key */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-1">API Key</h2>
          <p className="text-sm text-gray-500 mb-4">
            Use this key to ingest events via the REST API. Keep it secret — it grants full write access to your workspace.
          </p>

          <div className="flex gap-2 mb-3">
            <div className="flex-1 flex items-center gap-2 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg font-mono text-sm text-gray-800 overflow-hidden">
              <span className="truncate">{showKey ? apiKey : maskedKey}</span>
            </div>
            <button
              onClick={() => setShowKey((v) => !v)}
              title={showKey ? "Hide key" : "Show key"}
              className="p-2.5 border border-gray-200 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition"
            >
              {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
            <button
              onClick={() => void copyToClipboard(apiKey, "key")}
              disabled={!apiKey}
              title="Copy key"
              className={cn(
                "p-2.5 border rounded-lg transition",
                copied === "key"
                  ? "border-green-300 text-green-600 bg-green-50"
                  : "border-gray-200 text-gray-400 hover:text-gray-600 hover:bg-gray-50"
              )}
            >
              {copied === "key" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </button>
            <button
              onClick={() => void handleRegenerate()}
              disabled={regenerating || !workspaceId}
              title="Regenerate key"
              className="flex items-center gap-1.5 px-3 py-2.5 bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 rounded-lg text-sm font-medium transition disabled:opacity-50"
            >
              <RefreshCw className={cn("w-3.5 h-3.5", regenerating && "animate-spin")} />
              {regenerating ? "Regenerating…" : "Regenerate"}
            </button>
          </div>

          <p className="text-xs text-gray-400">
            ⚠️ Regenerating creates a new key and immediately invalidates the old one.
          </p>
        </div>

        {/* Install Snippet */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-1">Install Snippet</h2>
          <p className="text-sm text-gray-500 mb-4">
            Add this to your website&apos;s <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">&lt;head&gt;</code> or before{" "}
            <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">&lt;/body&gt;</code> to show social proof notifications.
          </p>

          <div className="relative group">
            <pre className="bg-gray-950 text-green-400 text-xs rounded-xl p-4 overflow-x-auto font-mono leading-relaxed">
              {snippetCode}
            </pre>
            <button
              onClick={() => void copyToClipboard(snippetCode, "snippet")}
              className={cn(
                "absolute top-3 right-3 p-1.5 rounded-lg text-xs transition",
                copied === "snippet"
                  ? "bg-green-500 text-white"
                  : "bg-gray-800 text-gray-400 hover:text-gray-200 opacity-0 group-hover:opacity-100"
              )}
            >
              {copied === "snippet" ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>

          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <p className="text-xs font-medium text-gray-600 mb-1">Your Site ID</p>
            <code className="text-xs text-gray-800 font-mono">{siteId}</code>
          </div>
        </div>

        {/* Billing */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-1">Billing</h2>
          <p className="text-sm text-gray-500 mb-5">Manage your plan and billing details.</p>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl mb-5">
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="font-semibold text-gray-900">{plan.name} Plan</span>
                <span className={cn(
                  "text-xs px-2 py-0.5 rounded-full font-medium",
                  isPaid ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-600"
                )}>
                  {isPaid ? "Active" : "Free"}
                </span>
              </div>
              <div className="text-sm text-gray-500">{plan.events} · {plan.campaigns}</div>
            </div>
            <div className="text-lg font-bold text-gray-900">{plan.price}</div>
          </div>

          {/* Usage bar */}
          {stats && (
            <div className="mb-5">
              <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                <span>Monthly events</span>
                <span>
                  {stats.events.thisMonth.toLocaleString()} / {stats.monthlyLimit?.toLocaleString() ?? "∞"}
                </span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-1.5">
                <div
                  className={cn(
                    "h-1.5 rounded-full transition-all",
                    stats.monthlyUsagePercent > 80
                      ? "bg-red-500"
                      : stats.monthlyUsagePercent > 60
                      ? "bg-orange-400"
                      : "bg-green-500"
                  )}
                  style={{ width: `${Math.min(stats.monthlyUsagePercent, 100)}%` }}
                />
              </div>
            </div>
          )}

          {isPaid ? (
            <button
              onClick={() => void handleManageBilling()}
              disabled={manageLoading}
              className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition disabled:opacity-50"
            >
              <ExternalLink className="w-4 h-4" />
              {manageLoading ? "Opening portal…" : "Manage Billing"}
            </button>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <div className="border border-gray-200 rounded-xl p-4">
                <div className="font-semibold text-gray-900 mb-0.5">Pro</div>
                <div className="text-xs text-gray-500 mb-3">50k events · 10 campaigns</div>
                <button
                  onClick={() => void handleUpgrade("pro")}
                  disabled={upgrading}
                  className="w-full py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium transition disabled:opacity-50"
                >
                  {upgrading ? "Redirecting…" : "Upgrade — $5/mo"}
                </button>
              </div>
              <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
                <div className="font-semibold text-gray-900 mb-0.5">Business</div>
                <div className="text-xs text-gray-500 mb-3">Unlimited events & campaigns</div>
                <button
                  onClick={() => void handleUpgrade("business")}
                  disabled={upgrading}
                  className="w-full py-2 bg-gray-800 hover:bg-gray-900 text-white rounded-lg text-sm font-medium transition disabled:opacity-50"
                >
                  {upgrading ? "Redirecting…" : "Upgrade — $15/mo"}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Danger Zone */}
        <div className="bg-white rounded-xl border border-red-100 shadow-sm p-6">
          <h2 className="text-base font-semibold text-red-600 mb-1">Danger Zone</h2>
          <p className="text-sm text-gray-500 mb-4">
            Permanently delete your workspace and all associated data. This cannot be undone.
          </p>
          <button
            disabled
            className="px-4 py-2.5 border border-red-200 text-red-400 rounded-lg text-sm font-medium cursor-not-allowed opacity-60"
          >
            Delete Workspace
          </button>
          <p className="text-xs text-gray-400 mt-2">Contact support to delete your workspace.</p>
        </div>
      </div>
    </div>
  );
}
