export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db, workspaces, events, widgetImpressions, subscriptions, eq, and, gte, count } from "@proofkit/db";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [ws] = await db
    .select()
    .from(workspaces)
    .where(and(eq(workspaces.id, params.id), eq(workspaces.ownerId, session.user.id)))
    .limit(1);
  if (!ws) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const now = new Date();
  const d7 = new Date(now.getTime() - 7 * 86400000);
  const d30 = new Date(now.getTime() - 30 * 86400000);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [allTime] = await db.select({ total: count() }).from(events).where(eq(events.workspaceId, params.id));
  const [last30d] = await db.select({ total: count() }).from(events).where(and(eq(events.workspaceId, params.id), gte(events.createdAt, d30)));
  const [last7d] = await db.select({ total: count() }).from(events).where(and(eq(events.workspaceId, params.id), gte(events.createdAt, d7)));
  const [thisMonth] = await db.select({ total: count() }).from(events).where(and(eq(events.workspaceId, params.id), gte(events.createdAt, monthStart)));
  const [impressions] = await db.select({ total: count() }).from(widgetImpressions).where(and(eq(widgetImpressions.workspaceId, params.id), gte(widgetImpressions.createdAt, d30)));

  const byType = await db
    .select({ type: events.type, total: count() })
    .from(events)
    .where(eq(events.workspaceId, params.id))
    .groupBy(events.type);

  const [sub] = await db.select().from(subscriptions).where(eq(subscriptions.userId, ws.ownerId)).limit(1);
  const tier = sub?.tier || "free";
  const LIMITS: Record<string, number> = { free: 1000, pro: 50000, business: Infinity };
  const monthlyLimit = LIMITS[tier];

  return NextResponse.json({
    events: {
      allTime: Number(allTime.total),
      last30d: Number(last30d.total),
      last7d: Number(last7d.total),
      thisMonth: Number(thisMonth.total),
    },
    impressions: { last30d: Number(impressions.total) },
    byType: Object.fromEntries(byType.map((r) => [r.type, Number(r.total)])),
    tier,
    monthlyLimit: monthlyLimit === Infinity ? null : monthlyLimit,
    monthlyUsagePercent:
      monthlyLimit === Infinity
        ? 0
        : Math.round((Number(thisMonth.total) / monthlyLimit) * 100),
  });
}
