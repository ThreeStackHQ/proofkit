"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Zap, Calendar, TrendingUp, Eye, Plus, ArrowRight } from "lucide-react";
import { useWorkspace } from "@/context/workspace";
import { formatRelative, formatNumber, cn } from "@/lib/utils";

interface Stats {
  events: { allTime: number; last30d: number; last7d: number; thisMonth: number };
  impressions: { last30d: number };
  byType: Record<string, number>;
  tier: string;
  monthlyLimit: number | null;
  monthlyUsagePercent: number;
}

interface Event {
  id: string;
  type: "signup" | "purchase" | "pageview" | "custom";
  personName: string | null;
  personLocation: string | null;
  createdAt: string;
}

interface Campaign {
  id: string;
  name: string;
  active: boolean;
  position: string;
  theme: string;
  displayTimeMs: number;
}

const EVENT_COLORS: Record<string, string> = {
  signup: "bg-blue-100 text-blue-700",
  purchase: "bg-green-100 text-green-700",
  pageview: "bg-gray-100 text-gray-600",
  custom: "bg-purple-100 text-purple-700",
};

const EVENT_MESSAGES: Record<string, string> = {
  signup: "just signed up",
  purchase: "made a purchase",
  pageview: "visited a page",
  custom: "triggered an event",
};

export default function DashboardPage() {
  const { workspaceId, isLoading: wsLoading } = useWorkspace();
  const [stats, setStats] = useState<Stats | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!workspaceId) return;
    setLoading(true);

    void Promise.all([
      fetch(`/api/workspaces/${workspaceId}/stats`).then((r) => r.json()) as Promise<Stats>,
      fetch(`/api/workspaces/${workspaceId}/events?limit=10`).then((r) => r.json()) as Promise<{ events: Event[] }>,
      fetch(`/api/campaigns?workspaceId=${workspaceId}`).then((r) => r.json()) as Promise<{ campaigns: Campaign[] }>,
    ]).then(([statsData, eventsData, campaignsData]) => {
      setStats(statsData);
      setEvents(eventsData.events ?? []);
      setCampaigns(campaignsData.campaigns ?? []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [workspaceId]);

  if (wsLoading || (!workspaceId && !wsLoading)) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-48" />
          <div className="grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-28 bg-gray-200 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!workspaceId) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="text-4xl">⚡</div>
        <h2 className="text-xl font-semibold text-gray-800">No workspace yet</h2>
        <p className="text-gray-500 text-sm">Create your first workspace to get started</p>
        <button className="bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-600 transition">
          Create Workspace
        </button>
      </div>
    );
  }

  const statCards = [
    { label: "Total Events", value: stats?.events.allTime ?? 0, icon: Zap, color: "text-green-500", bg: "bg-green-50" },
    { label: "This Month", value: stats?.events.thisMonth ?? 0, icon: Calendar, color: "text-blue-500", bg: "bg-blue-50" },
    { label: "Last 7 Days", value: stats?.events.last7d ?? 0, icon: TrendingUp, color: "text-purple-500", bg: "bg-purple-50" },
    { label: "Impressions / 30d", value: stats?.impressions.last30d ?? 0, icon: Eye, color: "text-orange-500", bg: "bg-orange-50" },
  ];

  return (
    <div className="p-8 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Overview</h1>
        <Link
          href="/campaigns"
          className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
        >
          <Plus className="w-4 h-4" />
          New Campaign
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statCards.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-500">{label}</span>
              <div className={cn("p-2 rounded-lg", bg)}>
                <Icon className={cn("w-4 h-4", color)} />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {loading ? <span className="inline-block w-16 h-8 bg-gray-100 rounded animate-pulse" /> : formatNumber(value)}
            </div>
          </div>
        ))}
      </div>

      {/* Usage Bar */}
      {stats && stats.monthlyLimit !== null && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Monthly Event Usage</span>
            <span className="text-xs text-gray-500 capitalize">{stats.tier} plan</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2 mb-2">
            <div
              className={cn(
                "h-2 rounded-full transition-all",
                stats.monthlyUsagePercent > 80 ? "bg-red-500" : stats.monthlyUsagePercent > 60 ? "bg-orange-400" : "bg-green-500"
              )}
              style={{ width: `${Math.min(stats.monthlyUsagePercent, 100)}%` }}
            />
          </div>
          <p className="text-xs text-gray-500">
            {formatNumber(stats.events.thisMonth)} of {formatNumber(stats.monthlyLimit)} events used ({stats.monthlyUsagePercent}%)
          </p>
        </div>
      )}

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Recent Events */}
        <div className="lg:col-span-3 bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between p-5 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Recent Events</h2>
            <Link href="/events" className="text-xs text-green-600 hover:text-green-700 flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {loading ? (
            <div className="p-5 space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-10 bg-gray-50 rounded animate-pulse" />
              ))}
            </div>
          ) : events.length === 0 ? (
            <div className="p-10 text-center">
              <p className="text-gray-400 text-sm">No events yet. Start sending events via the API.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {events.map((event) => (
                <div key={event.id} className="flex items-center gap-3 px-5 py-3">
                  <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full capitalize", EVENT_COLORS[event.type])}>
                    {event.type}
                  </span>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm text-gray-700">
                      {event.personName ? (
                        <><strong>{event.personName}</strong>{event.personLocation ? ` from ${event.personLocation}` : ""} {EVENT_MESSAGES[event.type]}</>
                      ) : (
                        <span className="text-gray-500">Anonymous {EVENT_MESSAGES[event.type]}</span>
                      )}
                    </span>
                  </div>
                  <span className="text-xs text-gray-400 flex-shrink-0">{formatRelative(event.createdAt)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Active Campaigns */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between p-5 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Active Campaigns</h2>
            <Link href="/campaigns" className="text-xs text-green-600 hover:text-green-700 flex items-center gap-1">
              Manage <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {loading ? (
            <div className="p-5 space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-50 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : campaigns.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-400 text-sm mb-3">No campaigns yet</p>
              <Link href="/campaigns" className="text-xs bg-green-500 text-white px-3 py-1.5 rounded-lg hover:bg-green-600 transition">
                Create your first
              </Link>
            </div>
          ) : (
            <div className="p-4 space-y-3">
              {campaigns.filter((c) => c.active).slice(0, 5).map((campaign) => (
                <div key={campaign.id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{campaign.name}</p>
                    <p className="text-xs text-gray-400 capitalize">{campaign.position}</p>
                  </div>
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Active</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
