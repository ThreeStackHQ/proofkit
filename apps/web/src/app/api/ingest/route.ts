export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { db, workspaces, events, subscriptions, eq, and, count, gte } from "@proofkit/db";

// In-memory rate limiter (workspace-level): 100 events/hr
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const TIER_LIMITS = { free: 1000, pro: 50000, business: Infinity };

export async function POST(req: NextRequest) {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-API-Key",
  };

  const apiKey = req.headers.get("X-API-Key") || req.headers.get("x-api-key");
  if (!apiKey) {
    return NextResponse.json({ error: "Missing X-API-Key" }, { status: 401, headers });
  }

  // Find workspace
  const [workspace] = await db.select().from(workspaces).where(eq(workspaces.apiKey, apiKey)).limit(1);
  if (!workspace) {
    return NextResponse.json({ error: "Invalid API key" }, { status: 401, headers });
  }

  // Rate limit: 100/hr per workspace
  const now = Date.now();
  const rl = rateLimitMap.get(workspace.id) || { count: 0, resetAt: now + 3600000 };
  if (now > rl.resetAt) {
    rl.count = 0;
    rl.resetAt = now + 3600000;
  }
  if (rl.count >= 100) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429, headers });
  }
  rl.count++;
  rateLimitMap.set(workspace.id, rl);

  // Tier event limit check
  const [sub] = await db.select().from(subscriptions).where(eq(subscriptions.userId, workspace.ownerId)).limit(1);
  const tier = (sub?.tier as keyof typeof TIER_LIMITS) || "free";
  const limit = TIER_LIMITS[tier];
  if (limit !== Infinity) {
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);
    const [{ value }] = await db
      .select({ value: count() })
      .from(events)
      .where(and(eq(events.workspaceId, workspace.id), gte(events.createdAt, monthStart)));
    if (Number(value) >= limit) {
      return NextResponse.json(
        { error: "Monthly event limit reached. Upgrade your plan." },
        { status: 402, headers }
      );
    }
  }

  const body = await req.json();
  const { type, personName, personLocation, meta, expiresAt } = body;
  const validTypes = ["signup", "purchase", "pageview", "custom"];
  if (!type || !validTypes.includes(type)) {
    return NextResponse.json(
      { error: "Invalid event type. Must be: signup, purchase, pageview, custom" },
      { status: 400, headers }
    );
  }

  const [event] = await db
    .insert(events)
    .values({
      workspaceId: workspace.id,
      type,
      personName: personName || null,
      personLocation: personLocation || null,
      metaJson: meta || null,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
    })
    .returning();

  return NextResponse.json({ success: true, eventId: event.id }, { status: 201, headers });
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, X-API-Key",
    },
  });
}
