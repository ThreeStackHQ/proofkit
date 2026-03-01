export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db, workspaces, campaigns, eq, and } from "@proofkit/db";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [campaign] = await db
    .select({ c: campaigns, ws: workspaces })
    .from(campaigns)
    .innerJoin(workspaces, eq(campaigns.workspaceId, workspaces.id))
    .where(and(eq(campaigns.id, params.id), eq(workspaces.ownerId, session.user.id)))
    .limit(1);
  if (!campaign) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await req.json();
  const [updated] = await db
    .update(campaigns)
    .set({ ...body, updatedAt: new Date() })
    .where(eq(campaigns.id, params.id))
    .returning();

  return NextResponse.json({ campaign: updated });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [campaign] = await db
    .select({ c: campaigns, ws: workspaces })
    .from(campaigns)
    .innerJoin(workspaces, eq(campaigns.workspaceId, workspaces.id))
    .where(and(eq(campaigns.id, params.id), eq(workspaces.ownerId, session.user.id)))
    .limit(1);
  if (!campaign) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await db.delete(campaigns).where(eq(campaigns.id, params.id));
  return NextResponse.json({ success: true });
}
