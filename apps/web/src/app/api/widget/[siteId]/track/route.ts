export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { db, workspaces, campaigns, widgetImpressions, eq, and } from "@proofkit/db";

// Rate-limit impression tracking: max 60 requests/minute per siteId (IP-agnostic)
const trackRateMap = new Map<string, { count: number; resetAt: number }>();

export async function POST(req: NextRequest, { params }: { params: { siteId: string } }) {
  const headers = { "Access-Control-Allow-Origin": "*" };

  // Rate limit: 60 impressions/min per siteId to prevent analytics flooding
  const now = Date.now();
  const rl = trackRateMap.get(params.siteId) || { count: 0, resetAt: now + 60000 };
  if (now > rl.resetAt) { rl.count = 0; rl.resetAt = now + 60000; }
  if (rl.count >= 60) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429, headers });
  }
  rl.count++;
  trackRateMap.set(params.siteId, rl);

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

  await db.insert(widgetImpressions).values({
    workspaceId: workspace.id,
    campaignId: campaign?.id || null,
  });

  return NextResponse.json({ success: true }, { headers });
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
    },
  });
}
