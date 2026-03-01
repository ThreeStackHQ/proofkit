export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { db, workspaces, campaigns, events, eq, and, desc, gte, inArray } from "@proofkit/db";

// Simple in-memory cache: siteId -> { data, expiresAt }
const cache = new Map<string, { data: unknown; expiresAt: number }>();

export async function GET(req: NextRequest, { params }: { params: { siteId: string } }) {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Cache-Control": "public, max-age=30",
  };

  const cached = cache.get(params.siteId);
  if (cached && Date.now() < cached.expiresAt) {
    return NextResponse.json(cached.data, { headers });
  }

  const [workspace] = await db
    .select()
    .from(workspaces)
    .where(eq(workspaces.siteId, params.siteId))
    .limit(1);
  if (!workspace) {
    return NextResponse.json({ error: "Not found" }, { status: 404, headers });
  }

  const [campaign] = await db
    .select()
    .from(campaigns)
    .where(and(eq(campaigns.workspaceId, workspace.id), eq(campaigns.active, true)))
    .limit(1);
  if (!campaign) {
    return NextResponse.json({ active: false }, { headers });
  }

  const cutoff = new Date(Date.now() - 72 * 60 * 60 * 1000); // 72h ago
  const recentEvents = await db
    .select()
    .from(events)
    .where(
      and(
        eq(events.workspaceId, workspace.id),
        gte(events.createdAt, cutoff),
        inArray(events.type, campaign.eventTypes as ("signup" | "purchase" | "pageview" | "custom")[])
      )
    )
    .orderBy(desc(events.createdAt))
    .limit(50);

  // Shuffle for variety
  const shuffled = recentEvents.sort(() => Math.random() - 0.5).slice(0, 20);

  const data = {
    active: true,
    campaign: {
      position: campaign.position,
      theme: campaign.theme,
      displayTimeMs: campaign.displayTimeMs,
      delayBetweenMs: campaign.delayBetweenMs,
      maxPerSession: campaign.maxPerSession,
    },
    events: shuffled.map((e) => ({
      id: e.id,
      type: e.type,
      personName: e.personName,
      personLocation: e.personLocation,
      meta: e.metaJson,
      createdAt: e.createdAt,
    })),
  };

  cache.set(params.siteId, { data, expiresAt: Date.now() + 30000 });
  return NextResponse.json(data, { headers });
}
