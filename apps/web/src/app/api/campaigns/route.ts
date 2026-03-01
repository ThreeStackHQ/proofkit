export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db, workspaces, campaigns, eq, and, desc } from "@proofkit/db";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const workspaceId = req.nextUrl.searchParams.get("workspaceId");
  if (!workspaceId) {
    return NextResponse.json({ error: "workspaceId required" }, { status: 400 });
  }

  const [ws] = await db
    .select()
    .from(workspaces)
    .where(and(eq(workspaces.id, workspaceId), eq(workspaces.ownerId, session.user.id)))
    .limit(1);
  if (!ws) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const items = await db
    .select()
    .from(campaigns)
    .where(eq(campaigns.workspaceId, workspaceId))
    .orderBy(desc(campaigns.createdAt));

  return NextResponse.json({ campaigns: items });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { workspaceId, name, position, theme, displayTimeMs, delayBetweenMs, maxPerSession, eventTypes } = body;

  if (!workspaceId || !name) {
    return NextResponse.json({ error: "workspaceId and name required" }, { status: 400 });
  }

  const [ws] = await db
    .select()
    .from(workspaces)
    .where(and(eq(workspaces.id, workspaceId), eq(workspaces.ownerId, session.user.id)))
    .limit(1);
  if (!ws) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const [campaign] = await db
    .insert(campaigns)
    .values({
      workspaceId,
      name,
      active: true,
      position: position || "bottom-right",
      theme: theme || "light",
      displayTimeMs: displayTimeMs || 5000,
      delayBetweenMs: delayBetweenMs || 8000,
      maxPerSession: maxPerSession || 3,
      eventTypes: eventTypes || ["signup", "purchase"],
    })
    .returning();

  return NextResponse.json({ campaign }, { status: 201 });
}
