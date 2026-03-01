export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { db, users, workspaces, eq } from "@proofkit/db";
import bcrypt from "bcryptjs";
import { createId } from "@proofkit/db";
import { randomUUID } from "crypto";

export async function POST(req: NextRequest) {
  const { email, password, name } = await req.json();
  if (!email || !password) {
    return NextResponse.json({ error: "Email and password required" }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
  }

  const [existing] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (existing) {
    return NextResponse.json({ error: "Email already exists" }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const [user] = await db.insert(users).values({ email, passwordHash, name: name || null }).returning();

  // Auto-create default workspace
  await db.insert(workspaces).values({
    name: name ? `${name}'s Workspace` : "My Workspace",
    slug: `ws-${createId().slice(0, 8)}`,
    ownerId: user.id,
    siteId: randomUUID(),
    apiKey: `pk_live_${createId()}`,
  });

  return NextResponse.json({ success: true }, { status: 201 });
}
