export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { db, workspaces, campaigns, widgetImpressions, eq, and } from "@proofkit/db";

export async function POST(req: NextRequest, { params }: { params: { siteId: string } }) {
  const headers = { "Access-Control-Allow-Origin": "*" };

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
