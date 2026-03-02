"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Pencil, Trash2, X, Code } from "lucide-react";
import { useWorkspace } from "@/context/workspace";
import { cn } from "@/lib/utils";

interface Campaign {
  id: string;
  workspaceId: string;
  name: string;
  active: boolean;
  position: "bottom-right" | "bottom-left" | "top-right" | "top-left";
  theme: "light" | "dark";
  displayTimeMs: number;
  delayBetweenMs: number;
  maxPerSession: number;
  eventTypes: string[];
}

type Position = Campaign["position"];
type Theme = Campaign["theme"];

const POSITIONS: { value: Position; label: string; gridClass: string }[] = [
  { value: "top-left", label: "↖ Top Left", gridClass: "col-start-1 row-start-1" },
  { value: "top-right", label: "↗ Top Right", gridClass: "col-start-2 row-start-1" },
  { value: "bottom-left", label: "↙ Bottom Left", gridClass: "col-start-1 row-start-2" },
  { value: "bottom-right", label: "↘ Bottom Right", gridClass: "col-start-2 row-start-2" },
];

const EVENT_TYPE_OPTIONS = [
  { value: "signup", label: "Signup" },
  { value: "purchase", label: "Purchase" },
  { value: "pageview", label: "Pageview" },
  { value: "custom", label: "Custom" },
];

const DEFAULT_FORM = {
  name: "",
  active: true,
  position: "bottom-right" as Position,
  theme: "light" as Theme,
  displayTimeMs: 5000,
  delayBetweenMs: 8000,
  maxPerSession: 3,
  eventTypes: ["signup", "purchase"],
};

type FormState = typeof DEFAULT_FORM;

export default function CampaignsPage() {
  const { workspaceId, workspace } = useWorkspace();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(DEFAULT_FORM);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const fetchCampaigns = useCallback(async () => {
    if (!workspaceId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/campaigns?workspaceId=${workspaceId}`);
      const data = await res.json() as { campaigns: Campaign[] };
      setCampaigns(data.campaigns ?? []);
    } finally {
      setLoading(false);
    }
  }, [workspaceId]);

  useEffect(() => {
    void fetchCampaigns();
  }, [fetchCampaigns]);

  function openNew() {
    setEditingId(null);
    setForm(DEFAULT_FORM);
    setIsOpen(true);
  }

  function openEdit(campaign: Campaign) {
    setEditingId(campaign.id);
    setForm({
      name: campaign.name,
      active: campaign.active,
      position: campaign.position,
      theme: campaign.theme,
      displayTimeMs: campaign.displayTimeMs,
      delayBetweenMs: campaign.delayBetweenMs,
      maxPerSession: campaign.maxPerSession,
      eventTypes: campaign.eventTypes,
    });
    setIsOpen(true);
  }

  async function handleSave() {
    if (!workspaceId || !form.name.trim()) return;
    setSaving(true);
    try {
      if (editingId) {
        const res = await fetch(`/api/campaigns/${editingId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        if (res.ok) {
          const data = await res.json() as { campaign: Campaign };
          setCampaigns((prev) => prev.map((c) => (c.id === editingId ? data.campaign : c)));
        }
      } else {
        const res = await fetch("/api/campaigns", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ workspaceId, ...form }),
        });
        if (res.ok) {
          const data = await res.json() as { campaign: Campaign };
          setCampaigns((prev) => [data.campaign, ...prev]);
        }
      }
      setIsOpen(false);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    await fetch(`/api/campaigns/${id}`, { method: "DELETE" });
    setCampaigns((prev) => prev.filter((c) => c.id !== id));
    setDeleteConfirm(null);
  }

  async function toggleActive(campaign: Campaign) {
    await fetch(`/api/campaigns/${campaign.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !campaign.active }),
    });
    setCampaigns((prev) => prev.map((c) => (c.id === campaign.id ? { ...c, active: !c.active } : c)));
  }

  function toggleEventType(type: string) {
    setForm((f) => ({
      ...f,
      eventTypes: f.eventTypes.includes(type)
        ? f.eventTypes.filter((t) => t !== type)
        : [...f.eventTypes, type],
    }));
  }

  const siteId = workspace?.siteId;
  const snippetCode = `<script src="https://proofkit.threestack.io/api/widget.js?siteId=${siteId ?? "YOUR_SITE_ID"}" defer></script>`;

  return (
    <div className="p-8 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Campaigns</h1>
        <button
          onClick={openNew}
          className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
        >
          <Plus className="w-4 h-4" />
          New Campaign
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden mb-8">
        {loading ? (
          <div className="p-8 space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-50 rounded animate-pulse" />
            ))}
          </div>
        ) : campaigns.length === 0 ? (
          <div className="py-16 text-center">
            <div className="text-4xl mb-4">📢</div>
            <h3 className="text-gray-700 font-medium mb-2">No campaigns yet</h3>
            <p className="text-gray-400 text-sm mb-4">Create your first campaign to start showing social proof widgets</p>
            <button
              onClick={openNew}
              className="bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-600 transition"
            >
              Create Campaign
            </button>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Name</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Status</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Position</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Theme</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Display</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {campaigns.map((campaign) => (
                <tr key={campaign.id} className="hover:bg-gray-50/50 transition">
                  <td className="px-5 py-4">
                    <span className="text-sm font-medium text-gray-800">{campaign.name}</span>
                  </td>
                  <td className="px-5 py-4">
                    <button
                      onClick={() => void toggleActive(campaign)}
                      className={cn(
                        "relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                        campaign.active ? "bg-green-500" : "bg-gray-300"
                      )}
                    >
                      <span
                        className={cn(
                          "inline-block h-4 w-4 transform rounded-full bg-white shadow transition duration-200 ease-in-out",
                          campaign.active ? "translate-x-4" : "translate-x-0"
                        )}
                      />
                    </button>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full capitalize">
                      {campaign.position}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={cn(
                      "text-xs px-2 py-0.5 rounded-full capitalize",
                      campaign.theme === "dark" ? "bg-gray-800 text-gray-200" : "bg-gray-100 text-gray-600"
                    )}>
                      {campaign.theme}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-xs text-gray-500">{campaign.displayTimeMs / 1000}s</span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2 justify-end">
                      <button
                        onClick={() => openEdit(campaign)}
                        className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      {deleteConfirm === campaign.id ? (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => void handleDelete(campaign.id)}
                            className="text-xs bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 transition"
                          >
                            Delete
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(null)}
                            className="text-xs text-gray-400 px-2 py-1 rounded hover:bg-gray-100 transition"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirm(campaign.id)}
                          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Install Snippet */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-3">
          <Code className="w-4 h-4 text-green-500" />
          <h2 className="font-semibold text-gray-900 text-sm">Install Snippet</h2>
        </div>
        <p className="text-xs text-gray-500 mb-3">Add this script tag to your website&apos;s <code>&lt;head&gt;</code> or before <code>&lt;/body&gt;</code>:</p>
        <pre className="bg-gray-950 text-green-400 text-xs rounded-lg p-4 overflow-x-auto font-mono">
          {snippetCode}
        </pre>
      </div>

      {/* Slide-over */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/30 z-40 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
          <div className="fixed right-0 top-0 h-full w-96 bg-white shadow-2xl z-50 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">
                {editingId ? "Edit Campaign" : "New Campaign"}
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Campaign Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Homepage Pop"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-400"
                />
              </div>

              {/* Position */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Position</label>
                <div className="grid grid-cols-2 gap-2">
                  {POSITIONS.map(({ value, label }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, position: value }))}
                      className={cn(
                        "px-3 py-2.5 rounded-lg text-xs font-medium border transition",
                        form.position === value
                          ? "border-green-500 bg-green-50 text-green-700"
                          : "border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50"
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Theme */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Theme</label>
                <div className="flex gap-2">
                  {(["light", "dark"] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, theme: t }))}
                      className={cn(
                        "flex-1 py-2 rounded-lg text-sm font-medium border capitalize transition",
                        form.theme === t
                          ? "border-green-500 bg-green-50 text-green-700"
                          : "border-gray-200 text-gray-500 hover:border-gray-300"
                      )}
                    >
                      {t === "light" ? "☀️" : "🌙"} {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Timing */}
              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700">Timing</label>
                <div>
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Display Time</span>
                    <span>{(form.displayTimeMs / 1000).toFixed(1)}s</span>
                  </div>
                  <input
                    type="number"
                    value={form.displayTimeMs}
                    onChange={(e) => setForm((f) => ({ ...f, displayTimeMs: Number(e.target.value) }))}
                    min={1000}
                    step={500}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-400"
                    placeholder="ms"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Delay Between</span>
                    <span>{(form.delayBetweenMs / 1000).toFixed(1)}s</span>
                  </div>
                  <input
                    type="number"
                    value={form.delayBetweenMs}
                    onChange={(e) => setForm((f) => ({ ...f, delayBetweenMs: Number(e.target.value) }))}
                    min={1000}
                    step={500}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-400"
                    placeholder="ms"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Max Per Session</label>
                  <input
                    type="number"
                    value={form.maxPerSession}
                    onChange={(e) => setForm((f) => ({ ...f, maxPerSession: Number(e.target.value) }))}
                    min={1}
                    max={20}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-400"
                  />
                </div>
              </div>

              {/* Event Types */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Event Types</label>
                <div className="space-y-2">
                  {EVENT_TYPE_OPTIONS.map(({ value, label }) => (
                    <label key={value} className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.eventTypes.includes(value)}
                        onChange={() => toggleEventType(value)}
                        className="w-4 h-4 text-green-500 border-gray-300 rounded focus:ring-green-500"
                      />
                      <span className="text-sm text-gray-600">{label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Preview */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Preview</label>
                <div className={cn(
                  "relative rounded-xl p-4 min-h-[100px] flex",
                  "bg-gray-100 border border-gray-200",
                  form.position.includes("bottom") ? "items-end" : "items-start",
                  form.position.includes("right") ? "justify-end" : "justify-start"
                )}>
                  <div className={cn(
                    "rounded-xl p-3 shadow-lg flex items-start gap-3 max-w-[220px]",
                    form.theme === "dark" ? "bg-gray-900 text-white" : "bg-white text-gray-800"
                  )}>
                    <span className="text-lg flex-shrink-0">🎉</span>
                    <div>
                      <p className={cn("text-xs font-medium leading-snug", form.theme === "dark" ? "text-white" : "text-gray-800")}>
                        Sarah from Austin just signed up
                      </p>
                      <p className={cn("text-xs mt-0.5", form.theme === "dark" ? "text-gray-400" : "text-gray-400")}>
                        1 min ago
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center gap-3 px-6 py-4 border-t border-gray-100">
              <button
                onClick={() => setIsOpen(false)}
                className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => void handleSave()}
                disabled={saving || !form.name.trim()}
                className="flex-1 py-2.5 bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition"
              >
                {saving ? "Saving…" : editingId ? "Save Changes" : "Create Campaign"}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
