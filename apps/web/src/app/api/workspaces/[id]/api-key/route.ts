export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db, workspaces, eq, and } from "@proofkit/db";
import { createId } from "@proofkit/db";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [ws] = await db
    .select({ apiKey: workspaces.apiKey })
    .from(workspaces)
    .where(and(eq(workspaces.id, params.id), eq(workspaces.ownerId, session.user.id)))
    .limit(1);
  if (!ws) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ apiKey: ws.apiKey });
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
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

  const newKey = `pk_live_${createId()}`;
  await db.update(workspaces).set({ apiKey: newKey, updatedAt: new Date() }).where(eq(workspaces.id, params.id));
  return NextResponse.json({ apiKey: newKey });
}
