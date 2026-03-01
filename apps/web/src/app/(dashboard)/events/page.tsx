"use client";

import { useEffect, useState, useMemo } from "react";
import { useWorkspace } from "@/context/workspace";
import { formatRelative, cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Event {
  id: string;
  type: "signup" | "purchase" | "pageview" | "custom";
  personName: string | null;
  personLocation: string | null;
  metaJson: Record<string, unknown> | null;
  createdAt: string;
  expiresAt: string | null;
}

const EVENT_BADGE: Record<string, string> = {
  signup: "bg-blue-100 text-blue-700",
  purchase: "bg-green-100 text-green-700",
  pageview: "bg-gray-100 text-gray-600",
  custom: "bg-purple-100 text-purple-700",
};

const EVENT_VERB: Record<string, string> = {
  signup: "signed up",
  purchase: "made a purchase",
  pageview: "visited a page",
  custom: "triggered a custom event",
};

const FILTER_TABS = ["all", "signup", "purchase", "pageview", "custom"] as const;
type FilterTab = (typeof FILTER_TABS)[number];

const PER_PAGE = 25;

export default function EventsPage() {
  const { workspaceId, workspace } = useWorkspace();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterTab>("all");
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (!workspaceId) return;
    setLoading(true);
    void fetch(`/api/workspaces/${workspaceId}/events?limit=200`)
      .then((r) => r.json())
      .then((data: { events: Event[] }) => {
        setEvents(data.events ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [workspaceId]);

  const filtered = useMemo(() =>
    filter === "all" ? events : events.filter((e) => e.type === filter),
    [events, filter]
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const pageEvents = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  useEffect(() => {
    setPage(1);
  }, [filter]);

  const siteId = workspace?.siteId ?? "YOUR_SITE_ID";
  const apiKey = workspace?.apiKey ?? "YOUR_API_KEY";

  function getInitials(name: string | null): string {
    if (!name) return "?";
    return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  }

  return (
    <div className="p-8 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Events</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {loading ? "Loading…" : `${events.length.toLocaleString()} total events`}
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1.5 mb-6 bg-gray-100 p-1 rounded-xl w-fit">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={cn(
              "px-4 py-1.5 rounded-lg text-sm font-medium capitalize transition",
              filter === tab
                ? "bg-white text-gray-800 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            )}
          >
            {tab}
            {tab !== "all" && !loading && (
              <span className="ml-1.5 text-xs text-gray-400">
                ({events.filter((e) => e.type === tab).length})
              </span>
            )}
            {tab === "all" && !loading && (
              <span className="ml-1.5 text-xs text-gray-400">({events.length})</span>
            )}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden mb-6">
        {loading ? (
          <div className="p-8 space-y-3">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-50 rounded animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center px-8">
            <div className="text-5xl mb-4">⚡</div>
            <h3 className="text-gray-700 font-semibold text-lg mb-2">No events yet</h3>
            <p className="text-gray-400 text-sm mb-6 max-w-sm mx-auto">
              Start sending events via the API to see your social proof data here.
            </p>
            <div className="bg-gray-950 text-green-400 text-xs rounded-xl p-4 text-left max-w-lg mx-auto font-mono overflow-x-auto">
              <pre>{`curl -X POST https://proofkit.threestack.io/api/ingest \\
  -H "Content-Type: application/json" \\
  -d '{
    "siteId": "${siteId}",
    "apiKey": "${apiKey}",
    "type": "signup",
    "personName": "Maria",
    "personLocation": "Berlin"
  }'`}</pre>
            </div>
          </div>
        ) : (
          <>
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Type</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Person</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Activity</th>
                  <th className="text-right px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {pageEvents.map((event) => (
                  <tr key={event.id} className="hover:bg-gray-50/50 transition">
                    <td className="px-5 py-3.5">
                      <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full capitalize", EVENT_BADGE[event.type])}>
                        {event.type}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-600 flex-shrink-0">
                          {getInitials(event.personName)}
                        </div>
                        <div>
                          <p className="text-sm text-gray-800">{event.personName ?? <span className="text-gray-400 italic">Anonymous</span>}</p>
                          {event.personLocation && (
                            <p className="text-xs text-gray-400">{event.personLocation}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-sm text-gray-600">{EVENT_VERB[event.type]}</span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <span className="text-xs text-gray-400">{formatRelative(event.createdAt)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
                <span className="text-xs text-gray-500">
                  Page {page} of {totalPages} ({filtered.length} events)
                </span>
                <div className="flex gap-1">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
