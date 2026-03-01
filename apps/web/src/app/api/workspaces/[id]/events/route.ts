export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db, workspaces, events, eq, and, desc, count } from "@proofkit/db";

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

  const page = parseInt(req.nextUrl.searchParams.get("page") || "1");
  const perPage = Math.min(parseInt(req.nextUrl.searchParams.get("perPage") || "50"), 100);
  const type = req.nextUrl.searchParams.get("type") || undefined;

  const where = type
    ? and(eq(events.workspaceId, params.id), eq(events.type, type as "signup" | "purchase" | "pageview" | "custom"))
    : eq(events.workspaceId, params.id);

  const [{ total }] = await db.select({ total: count() }).from(events).where(where);
  const items = await db
    .select()
    .from(events)
    .where(where)
    .orderBy(desc(events.createdAt))
    .limit(perPage)
    .offset((page - 1) * perPage);

  return NextResponse.json({ events: items, total: Number(total), page, perPage });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const eventId = req.nextUrl.searchParams.get("eventId");
  if (!eventId) {
    return NextResponse.json({ error: "eventId required" }, { status: 400 });
  }

  const [ws] = await db
    .select()
    .from(workspaces)
    .where(and(eq(workspaces.id, params.id), eq(workspaces.ownerId, session.user.id)))
    .limit(1);
  if (!ws) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await db.delete(events).where(and(eq(events.id, eventId), eq(events.workspaceId, params.id)));
  return NextResponse.json({ success: true });
}
