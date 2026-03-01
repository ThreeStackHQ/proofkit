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
  // Allowlist updatable fields to prevent mass-assignment (e.g. workspaceId cross-workspace injection)
  const {
    name,
    active,
    position,
    theme,
    displayTimeMs,
    delayBetweenMs,
    maxPerSession,
    eventTypes,
  } = body as {
    name?: string;
    active?: boolean;
    position?: "bottom-right" | "bottom-left" | "top-right" | "top-left";
    theme?: "light" | "dark";
    displayTimeMs?: number;
    delayBetweenMs?: number;
    maxPerSession?: number;
    eventTypes?: string[];
  };

  const [updated] = await db
    .update(campaigns)
    .set({
      ...(name !== undefined && { name }),
      ...(active !== undefined && { active }),
      ...(position !== undefined && { position }),
      ...(theme !== undefined && { theme }),
      ...(displayTimeMs !== undefined && { displayTimeMs }),
      ...(delayBetweenMs !== undefined && { delayBetweenMs }),
      ...(maxPerSession !== undefined && { maxPerSession }),
      ...(eventTypes !== undefined && { eventTypes }),
      updatedAt: new Date(),
    })
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
