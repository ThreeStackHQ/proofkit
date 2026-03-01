export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db, workspaces, eq } from "@proofkit/db";
import { createId } from "@proofkit/db";
import { randomUUID } from "crypto";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const items = await db.select().from(workspaces).where(eq(workspaces.ownerId, session.user.id));
  return NextResponse.json({ workspaces: items });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name, slug } = await req.json();
  if (!name || !slug) {
    return NextResponse.json({ error: "name and slug required" }, { status: 400 });
  }

  const [ws] = await db
    .insert(workspaces)
    .values({
      name,
      slug,
      ownerId: session.user.id,
      siteId: randomUUID(),
      apiKey: `pk_live_${createId()}`,
    })
    .returning();

  return NextResponse.json({ workspace: ws }, { status: 201 });
}
